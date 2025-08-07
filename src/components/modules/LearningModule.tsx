import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Brain, Target, Clock, Award, Play, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LearningPath, Flashcard, QuizSession } from '../../types/database';
import { TranslatedText } from '../common/TranslatedText';

export function LearningModule() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(true);
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
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('flashcards')
          .select('*')
          .eq('user_id', user?.id)
          .lte('next_review', new Date().toISOString())
          .order('next_review', { ascending: true })
          .limit(10),
        supabase
          .from('quiz_sessions')
          .select('*')
          .eq('user_id', user?.id)
          .order('completed_at', { ascending: false })
          .limit(5)
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

  const createQuickPath = async (subject: string, title: string) => {
    try {
      const { error } = await supabase
        .from('learning_paths')
        .insert({
          user_id: user?.id,
          title,
          subject,
          difficulty_level: 'beginner',
          progress_percentage: 0,
          modules: [],
          ai_generated: true,
          active: true,
        });

      if (error) throw error;
      fetchLearningData();
    } catch (error) {
      console.error('Error creating learning path:', error);
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
      fetchLearningData();
    } catch (error) {
      console.error('Error reviewing flashcard:', error);
    }
  };

  const getLearningStats = () => {
    const totalPaths = learningPaths.length;
    const avgProgress = learningPaths.reduce((sum, path) => sum + path.progress_percentage, 0) / (totalPaths || 1);
    const dueFlashcards = flashcards.length;
    
    const recentQuizzes = quizSessions.filter(session => {
      const sessionDate = new Date(session.completed_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    });

    const avgQuizScore = recentQuizzes.reduce((sum, session) => sum + session.score, 0) / (recentQuizzes.length || 1);

    return {
      totalPaths,
      avgProgress: Math.round(avgProgress),
      dueFlashcards,
      recentQuizzes: recentQuizzes.length,
      avgQuizScore: Math.round(avgQuizScore),
    };
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'advanced': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
    }
  };

  const stats = getLearningStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Professional Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl shadow-soft border border-indigo-100 dark:border-indigo-800/30"
        >
          <BookOpen className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.totalPaths}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            <TranslatedText text="Paths" />
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-soft border border-purple-100 dark:border-purple-800/30"
        >
          <Brain className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {stats.dueFlashcards}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            <TranslatedText text="Due Cards" />
          </p>
        </motion.div>
      </div>

      {/* Professional Learning Paths */}
      <div className="flex-1">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
          <TranslatedText text="Active Learning Paths" />
        </h4>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {learningPaths.slice(0, 3).map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-3 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {path.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {path.subject}
                  </p>
                </div>
                
                <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(path.difficulty_level)}`}>
                  {path.difficulty_level}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${path.progress_percentage}%` }}
                    transition={{ duration: 1, delay: 0.4 + index * 0.1 }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-bold">
                  {Math.round(path.progress_percentage)}%
                </span>
              </div>
            </motion.div>
          ))}
          
          {learningPaths.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
              <TranslatedText text="No learning paths yet" />
            </div>
          )}
        </div>
      </div>

      {/* Professional Flashcard Review */}
      {flashcards.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            <TranslatedText text="Review Flashcards" />
          </h4>
          
          <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 rounded-2xl shadow-soft border border-purple-100 dark:border-purple-800/30">
            <div className="text-center mb-3">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {flashcards[0]?.front_text}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => reviewFlashcard(flashcards[0]?.id, false)}
                className="flex-1 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs hover:bg-red-200 dark:hover:bg-red-900/30 transition-all font-semibold"
              >
                <TranslatedText text="Hard" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => reviewFlashcard(flashcards[0]?.id, true)}
                className="flex-1 py-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-xs hover:bg-green-200 dark:hover:bg-green-900/30 transition-all font-semibold"
              >
                <TranslatedText text="Easy" />
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Recent Performance */}
      {stats.recentQuizzes > 0 && (
        <div>
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl shadow-soft border border-yellow-100 dark:border-yellow-800/30">
            <div className="flex items-center space-x-3">
              <Award className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-xs font-bold text-yellow-700 dark:text-yellow-300">
                  <TranslatedText text="Recent Performance" />
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  {stats.recentQuizzes} quizzes • {stats.avgQuizScore}% avg
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Quick Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => createQuickPath('Technology', 'JavaScript Basics')}
            className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 rounded-2xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-300 shadow-soft border border-blue-100 dark:border-blue-800/30"
          >
            <span className="text-lg">💻</span>
            <span className="font-semibold text-sm">
              <TranslatedText text="Tech" />
            </span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => createQuickPath('Languages', 'Spanish Vocabulary')}
            className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-600 dark:text-green-400 rounded-2xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-300 shadow-soft border border-green-100 dark:border-green-800/30"
          >
            <span className="text-lg">🗣️</span>
            <span className="font-semibold text-sm">
              <TranslatedText text="Language" />
            </span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all duration-300 group"
        >
          <Plus className="h-4 w-4 text-gray-500 group-hover:text-indigo-500 transition-colors" />
          <span className="font-semibold text-sm text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <TranslatedText text="Create Learning Path" />
          </span>
        </motion.button>
      </div>
    </div>
  );
}