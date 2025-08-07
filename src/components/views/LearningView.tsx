import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Brain, Target, Clock, Award, Play, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LearningPath, Flashcard, QuizSession } from '../../types/database';

export function LearningView() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPath, setShowAddPath] = useState(false);
  const [showAddFlashcard, setShowAddFlashcard] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [newPath, setNewPath] = useState({
    title: '',
    description: '',
    subject: '',
    difficulty_level: 'beginner' as const,
  });
  const [newFlashcard, setNewFlashcard] = useState({
    learning_path_id: '',
    front_text: '',
    back_text: '',
    tags: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLearningData();
    }
  }, [user]);

  const fetchLearningData = async () => {
    try {
      const [pathsResult, flashcardsResult, quizResult] = await Promise.all([
        supabase
          .from('learning_paths')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('flashcards')
          .select('*')
          .eq('user_id', user?.id)
          .order('next_review', { ascending: true }),
        supabase
          .from('quiz_sessions')
          .select('*')
          .eq('user_id', user?.id)
          .order('completed_at', { ascending: false })
          .limit(10)
      ]);

      if (pathsResult.error) throw pathsResult.error;
      if (flashcardsResult.error) throw flashcardsResult.error;
      if (quizResult.error) throw quizResult.error;

      setLearningPaths(pathsResult.data || []);
      setFlashcards(flashcardsResult.data || []);
      setQuizSessions(quizResult.data || []);
    } catch (error) {
      console.error('Error fetching learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLearningPath = async () => {
    if (!newPath.title.trim() || !newPath.subject.trim()) return;

    try {
      const { error } = await supabase
        .from('learning_paths')
        .insert({
          user_id: user?.id,
          title: newPath.title,
          description: newPath.description || null,
          subject: newPath.subject,
          difficulty_level: newPath.difficulty_level,
          progress_percentage: 0,
          modules: [],
          ai_generated: false,
          active: true,
        });

      if (error) throw error;
      
      setNewPath({ title: '', description: '', subject: '', difficulty_level: 'beginner' });
      setShowAddPath(false);
      fetchLearningData();
    } catch (error) {
      console.error('Error adding learning path:', error);
    }
  };

  const addFlashcard = async () => {
    if (!newFlashcard.learning_path_id || !newFlashcard.front_text.trim() || !newFlashcard.back_text.trim()) return;

    try {
      const { error } = await supabase
        .from('flashcards')
        .insert({
          user_id: user?.id,
          learning_path_id: newFlashcard.learning_path_id,
          front_text: newFlashcard.front_text,
          back_text: newFlashcard.back_text,
          tags: newFlashcard.tags ? newFlashcard.tags.split(',').map(tag => tag.trim()) : null,
          difficulty_level: 1,
          review_count: 0,
          success_count: 0,
        });

      if (error) throw error;
      
      setNewFlashcard({ learning_path_id: '', front_text: '', back_text: '', tags: '' });
      setShowAddFlashcard(false);
      fetchLearningData();
    } catch (error) {
      console.error('Error adding flashcard:', error);
    }
  };

  const reviewFlashcard = async (flashcardId: string, success: boolean) => {
    try {
      const flashcard = flashcards.find(f => f.id === flashcardId);
      if (!flashcard) return;

      const newDifficulty = success 
        ? Math.max(1, flashcard.difficulty_level - 1)
        : Math.min(5, flashcard.difficulty_level + 1);

      const nextReviewDays = Math.pow(2, newDifficulty);
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + nextReviewDays);

      const { error } = await supabase
        .from('flashcards')
        .update({
          difficulty_level: newDifficulty,
          last_reviewed: new Date().toISOString(),
          next_review: nextReview.toISOString(),
          review_count: flashcard.review_count + 1,
          success_count: success ? flashcard.success_count + 1 : flashcard.success_count,
        })
        .eq('id', flashcardId);

      if (error) throw error;
      
      setCurrentFlashcard(null);
      setShowAnswer(false);
      fetchLearningData();
    } catch (error) {
      console.error('Error reviewing flashcard:', error);
    }
  };

  const updatePathProgress = async (pathId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from('learning_paths')
        .update({ progress_percentage: progress })
        .eq('id', pathId);

      if (error) throw error;
      fetchLearningData();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getLearningStats = () => {
    const totalPaths = learningPaths.length;
    const activePaths = learningPaths.filter(path => path.active).length;
    const avgProgress = learningPaths.reduce((sum, path) => sum + path.progress_percentage, 0) / (totalPaths || 1);
    const dueFlashcards = flashcards.filter(card => 
      !card.next_review || new Date(card.next_review) <= new Date()
    ).length;
    
    const recentQuizzes = quizSessions.filter(session => {
      const sessionDate = new Date(session.completed_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    });

    const avgQuizScore = recentQuizzes.reduce((sum, session) => sum + session.score, 0) / (recentQuizzes.length || 1);

    return {
      totalPaths,
      activePaths,
      avgProgress: Math.round(avgProgress),
      dueFlashcards,
      recentQuizzes: recentQuizzes.length,
      avgQuizScore: Math.round(avgQuizScore),
    };
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const subjects = [
    'Technology', 'Business', 'Languages', 'Health & Fitness',
    'Arts & Creativity', 'Science', 'Personal Development', 'Finance', 'Other'
  ];

  const stats = getLearningStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Assistant</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your learning paths and study materials</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddPath(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Learning Path</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddFlashcard(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Flashcard</span>
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-indigo-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activePaths}</p>
              <p className="text-gray-600 dark:text-gray-400">Active Paths</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgProgress}%</p>
              <p className="text-gray-600 dark:text-gray-400">Avg Progress</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.dueFlashcards}</p>
              <p className="text-gray-600 dark:text-gray-400">Due Cards</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recentQuizzes}</p>
              <p className="text-gray-600 dark:text-gray-400">This Week</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgQuizScore}%</p>
              <p className="text-gray-600 dark:text-gray-400">Quiz Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Learning Path Form */}
      {showAddPath && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Learning Path</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Path Title"
              value={newPath.title}
              onChange={(e) => setNewPath(prev => ({ ...prev, title: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <select
              value={newPath.subject}
              onChange={(e) => setNewPath(prev => ({ ...prev, subject: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <select
              value={newPath.difficulty_level}
              onChange={(e) => setNewPath(prev => ({ ...prev, difficulty_level: e.target.value as any }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <textarea
              placeholder="Description"
              value={newPath.description}
              onChange={(e) => setNewPath(prev => ({ ...prev, description: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white md:col-span-2"
              rows={3}
            />
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={addLearningPath}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Path
            </button>
            <button
              onClick={() => setShowAddPath(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Add Flashcard Form */}
      {showAddFlashcard && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Flashcard</h3>
          <div className="space-y-4">
            <select
              value={newFlashcard.learning_path_id}
              onChange={(e) => setNewFlashcard(prev => ({ ...prev, learning_path_id: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Learning Path</option>
              {learningPaths.map(path => (
                <option key={path.id} value={path.id}>{path.title}</option>
              ))}
            </select>
            <textarea
              placeholder="Front of card (question)"
              value={newFlashcard.front_text}
              onChange={(e) => setNewFlashcard(prev => ({ ...prev, front_text: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
            <textarea
              placeholder="Back of card (answer)"
              value={newFlashcard.back_text}
              onChange={(e) => setNewFlashcard(prev => ({ ...prev, back_text: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={newFlashcard.tags}
              onChange={(e) => setNewFlashcard(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={addFlashcard}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Flashcard
            </button>
            <button
              onClick={() => setShowAddFlashcard(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Flashcard Review */}
      {stats.dueFlashcards > 0 && !currentFlashcard && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-8 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Review!
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                You have {stats.dueFlashcards} flashcards ready for review
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const dueCards = flashcards.filter(card => 
                  !card.next_review || new Date(card.next_review) <= new Date()
                );
                if (dueCards.length > 0) {
                  setCurrentFlashcard(dueCards[0]);
                }
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>Start Review</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* Flashcard Review Modal */}
      {currentFlashcard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-lg w-full"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Flashcard Review
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Card {flashcards.indexOf(currentFlashcard) + 1} of {flashcards.length}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6 min-h-32 flex items-center justify-center">
              <p className="text-lg text-gray-900 dark:text-white text-center">
                {showAnswer ? currentFlashcard.back_text : currentFlashcard.front_text}
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              {!showAnswer ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAnswer(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Show Answer
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => reviewFlashcard(currentFlashcard.id, false)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Hard
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => reviewFlashcard(currentFlashcard.id, true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Easy
                  </motion.button>
                </>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentFlashcard(null);
                  setShowAnswer(false);
                }}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Learning Paths */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Learning Paths</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPaths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {path.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {path.subject}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(path.difficulty_level)}`}>
                    {path.difficulty_level}
                  </span>
                </div>
              </div>
              
              {path.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {path.description}
                </p>
              )}
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(path.progress_percentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${path.progress_percentage}%` }}
                    transition={{ duration: 1 }}
                    className="bg-indigo-500 h-2 rounded-full"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updatePathProgress(path.id, Math.min(path.progress_percentage + 10, 100))}
                  className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Continue
                </motion.button>
                {path.progress_percentage === 100 && (
                  <div className="flex items-center justify-center px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400  rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {learningPaths.length === 0 && (
            <div className="col-span-full text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No learning paths yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your first learning path to start your educational journey
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Quiz Sessions */}
      {quizSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Quiz Sessions</h3>
          <div className="space-y-4">
            {quizSessions.slice(0, 5).map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Quiz Session
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(session.completed_at).toLocaleDateString()} • {session.total_questions} questions
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {Math.round(session.score)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {session.correct_answers}/{session.total_questions} correct
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}