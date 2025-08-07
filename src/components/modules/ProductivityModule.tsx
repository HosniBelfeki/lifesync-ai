import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Plus, Clock, Target, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Task, Goal } from '../../types/database';
import { TranslatedText } from '../common/TranslatedText';

export function ProductivityModule() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProductivityData();
    }
  }, [user]);

  const fetchProductivityData = async () => {
    try {
      const [tasksResult, goalsResult] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user?.id)
          .eq('status', 'active')
          .limit(5)
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (goalsResult.error) throw goalsResult.error;

      setTasks(tasksResult.data || []);
      setGoals(goalsResult.data || []);
    } catch (error) {
      console.error('Error fetching productivity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuickTask = async (title: string, priority: string = 'medium') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: user?.id,
          title,
          priority,
          completed: false,
        });

      if (error) throw error;
      fetchProductivityData();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', taskId);

      if (error) throw error;
      fetchProductivityData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getProductivityStats = () => {
    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);
    const overdueTasks = pendingTasks.filter(task => 
      task.due_date && new Date(task.due_date) < new Date()
    );

    const activeGoals = goals.filter(goal => goal.status === 'active');
    const goalProgress = activeGoals.reduce((sum, goal) => {
      const progress = goal.target_value ? (goal.current_value / goal.target_value) * 100 : 0;
      return sum + Math.min(progress, 100);
    }, 0) / (activeGoals.length || 1);

    return {
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      overdueTasks: overdueTasks.length,
      totalTasks: tasks.length,
      goalProgress: Math.round(goalProgress),
      activeGoals: activeGoals.length,
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
    }
  };

  const stats = getProductivityStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Professional Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-soft border border-green-100 dark:border-green-800/30"
        >
          <CheckSquare className="h-5 w-5 text-green-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {stats.completedTasks}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            <TranslatedText text="Done" />
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-soft border border-blue-100 dark:border-blue-800/30"
        >
          <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {stats.pendingTasks}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            <TranslatedText text="Pending" />
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center p-3 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl shadow-soft border border-red-100 dark:border-red-800/30"
        >
          <AlertCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            {stats.overdueTasks}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            <TranslatedText text="Overdue" />
          </p>
        </motion.div>
      </div>

      {/* Professional Recent Tasks - Fixed Scrolling */}
      <div className="flex-1 min-h-0">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
          <TranslatedText text="Recent Tasks" />
        </h4>
        
        <div className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="h-full overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
            {tasks.slice(0, 8).map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleTask(task.id, task.completed)}
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                    task.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                  }`}
                >
                  {task.completed && (
                    <CheckSquare className="h-3 w-3 text-white" />
                  )}
                </motion.button>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${
                    task.completed 
                      ? 'text-gray-500 line-through' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </motion.div>
            ))}
            
            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-full text-center py-8">
                <div>
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <TranslatedText text="No tasks yet" />
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Goal Progress */}
      {goals.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            <TranslatedText text="Goal Progress" />
          </h4>
          <div className="space-y-2">
            {goals.slice(0, 2).map((goal, index) => {
              const progress = goal.target_value ? (goal.current_value / goal.target_value) * 100 : 0;
              return (
                <motion.div 
                  key={goal.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-3 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {goal.title}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-bold">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    />
                  </div>
                </motion.div>
              );
            })}
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
            transition={{ delay: 0.6 }}
            onClick={() => addQuickTask('Review emails', 'medium')}
            className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 rounded-2xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-300 shadow-soft border border-blue-100 dark:border-blue-800/30"
          >
            <span className="text-lg">📧</span>
            <span className="font-semibold text-sm">
              <TranslatedText text="Emails" />
            </span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={() => addQuickTask('Daily standup', 'high')}
            className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-600 dark:text-purple-400 rounded-2xl hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-300 shadow-soft border border-purple-100 dark:border-purple-800/30"
          >
            <span className="text-lg">👥</span>
            <span className="font-semibold text-sm">
              <TranslatedText text="Meeting" />
            </span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-300 group"
        >
          <Plus className="h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
          <span className="font-semibold text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <TranslatedText text="Add Task" />
          </span>
        </motion.button>
      </div>
    </div>
  );
}