import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, DollarSign, Heart, MessageCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { TranslatedText } from '../common/TranslatedText';
import { useToast } from '../common/NotificationToast';

interface QuickActionsProps {
  onDataUpdate?: () => void;
}

export function QuickActions({ onDataUpdate }: QuickActionsProps) {
  const [showModal, setShowModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { success, error } = useToast();

  // Quick Task Form
  const [taskData, setTaskData] = useState({
    title: '',
    priority: 'medium' as const,
  });

  // Quick Health Log Form
  const [healthData, setHealthData] = useState({
    type: 'mood' as const,
    mood_score: 4,
    value: 1,
  });

  // Quick Expense Form
  const [expenseData, setExpenseData] = useState({
    amount: '',
    category: 'Food & Dining',
    description: '',
  });

  // Quick Goal Form
  const [goalData, setGoalData] = useState({
    title: '',
    category: 'Personal',
    target_value: '',
  });

  const addQuickTask = async () => {
    if (!taskData.title.trim()) return;
    
    setLoading(true);
    try {
      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          user_id: user?.id,
          title: taskData.title,
          priority: taskData.priority,
          completed: false,
        });

      if (taskError) throw taskError;
      
      setTaskData({ title: '', priority: 'medium' });
      setShowModal(null);
      success('Task added successfully!');
      onDataUpdate?.();
    } catch (err) {
      console.error('Error adding task:', err);
      error('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const addQuickHealthLog = async () => {
    setLoading(true);
    try {
      const logData: any = {
        user_id: user?.id,
        type: healthData.type,
        logged_at: new Date().toISOString(),
      };

      if (healthData.type === 'mood') {
        logData.mood_score = healthData.mood_score;
      } else {
        logData.value = healthData.value;
        logData.unit = getHealthUnit(healthData.type);
      }

      const { error: healthError } = await supabase
        .from('health_logs')
        .insert(logData);

      if (healthError) throw healthError;
      
      setHealthData({ type: 'mood', mood_score: 4, value: 1 });
      setShowModal(null);
      success('Health data logged successfully!');
      onDataUpdate?.();
    } catch (err) {
      console.error('Error adding health log:', err);
      error('Failed to log health data');
    } finally {
      setLoading(false);
    }
  };

  const addQuickExpense = async () => {
    if (!expenseData.amount || !expenseData.description.trim()) return;
    
    setLoading(true);
    try {
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert({
          user_id: user?.id,
          amount: parseFloat(expenseData.amount),
          category: expenseData.category,
          description: expenseData.description,
          date: new Date().toISOString().split('T')[0],
        });

      if (expenseError) throw expenseError;
      
      setExpenseData({ amount: '', category: 'Food & Dining', description: '' });
      setShowModal(null);
      success('Expense added successfully!');
      onDataUpdate?.();
    } catch (err) {
      console.error('Error adding expense:', err);
      error('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const addQuickGoal = async () => {
    if (!goalData.title.trim()) return;
    
    setLoading(true);
    try {
      const { error: goalError } = await supabase
        .from('goals')
        .insert({
          user_id: user?.id,
          title: goalData.title,
          category: goalData.category,
          target_value: goalData.target_value ? parseFloat(goalData.target_value) : null,
          current_value: 0,
          status: 'active',
        });

      if (goalError) throw goalError;
      
      setGoalData({ title: '', category: 'Personal', target_value: '' });
      setShowModal(null);
      success('Goal created successfully!');
      onDataUpdate?.();
    } catch (err) {
      console.error('Error adding goal:', err);
      error('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const getHealthUnit = (type: string) => {
    switch (type) {
      case 'water': return 'glasses';
      case 'sleep': return 'hours';
      case 'weight': return 'kg';
      case 'steps': return 'steps';
      default: return '';
    }
  };

  const actions = [
    { 
      id: 'task',
      icon: Plus, 
      label: 'Add Task', 
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      onClick: () => setShowModal('task')
    },
    { 
      id: 'health',
      icon: Heart, 
      label: 'Log Health', 
      color: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      onClick: () => setShowModal('health')
    },
    { 
      id: 'expense',
      icon: DollarSign, 
      label: 'Add Expense', 
      color: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      onClick: () => setShowModal('expense')
    },
    { 
      id: 'goal',
      icon: Target, 
      label: 'Set Goal', 
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      onClick: () => setShowModal('goal')
    },
    { 
      id: 'ai',
      icon: MessageCircle, 
      label: 'Ask AI', 
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      onClick: () => {
        window.location.hash = '#ai-chat';
      }
    },
  ];

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 
    'Bills & Utilities', 'Health & Fitness', 'Travel', 'Education', 'Other'
  ];

  const goalCategories = [
    'Personal', 'Health', 'Finance', 'Career', 'Education', 'Relationships', 'Other'
  ];

  return (
    <>
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          <TranslatedText text="Quick Actions" />
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={action.onClick}
                className={`flex flex-col items-center space-y-3 p-6 rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-xl ${action.color}`}
              >
                <Icon className="h-8 w-8" />
                <span className="text-sm font-medium text-center">
                  <TranslatedText text={action.label} />
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-blue-100 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                <TranslatedText text={
                  showModal === 'task' ? 'Add Quick Task' :
                  showModal === 'health' ? 'Log Health Data' :
                  showModal === 'expense' ? 'Add Quick Expense' :
                  'Set New Goal'
                } />
              </h3>
              <button
                onClick={() => setShowModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Task Form */}
            {showModal === 'task' && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task title"
                  value={taskData.title}
                  onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                />
                <select
                  value={taskData.priority}
                  onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="input-field"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <button
                  onClick={addQuickTask}
                  disabled={loading || !taskData.title.trim()}
                  className="btn-primary w-full"
                >
                  {loading ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            )}

            {/* Health Form */}
            {showModal === 'health' && (
              <div className="space-y-4">
                <select
                  value={healthData.type}
                  onChange={(e) => setHealthData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="input-field"
                >
                  <option value="mood">Mood</option>
                  <option value="water">Water</option>
                  <option value="sleep">Sleep</option>
                  <option value="weight">Weight</option>
                  <option value="steps">Steps</option>
                </select>
                
                {healthData.type === 'mood' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mood Score (1-5)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={healthData.mood_score}
                      onChange={(e) => setHealthData(prev => ({ ...prev, mood_score: parseInt(e.target.value) }))}
                      className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>😢 1</span>
                      <span className="font-medium">{healthData.mood_score}</span>
                      <span>😊 5</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Value ({getHealthUnit(healthData.type)})
                    </label>
                    <input
                      type="number"
                      value={healthData.value}
                      onChange={(e) => setHealthData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                      className="input-field"
                      placeholder={`Enter ${healthData.type} value`}
                    />
                  </div>
                )}
                
                <button
                  onClick={addQuickHealthLog}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Logging...' : 'Log Health Data'}
                </button>
              </div>
            )}

            {/* Expense Form */}
            {showModal === 'expense' && (
              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Amount"
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData(prev => ({ ...prev, amount: e.target.value }))}
                  className="input-field"
                />
                <select
                  value={expenseData.category}
                  onChange={(e) => setExpenseData(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Description"
                  value={expenseData.description}
                  onChange={(e) => setExpenseData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                />
                <button
                  onClick={addQuickExpense}
                  disabled={loading || !expenseData.amount || !expenseData.description.trim()}
                  className="btn-primary w-full"
                >
                  {loading ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            )}

            {/* Goal Form */}
            {showModal === 'goal' && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Goal title"
                  value={goalData.title}
                  onChange={(e) => setGoalData(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                />
                <select
                  value={goalData.category}
                  onChange={(e) => setGoalData(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                >
                  {goalCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Target value (optional)"
                  value={goalData.target_value}
                  onChange={(e) => setGoalData(prev => ({ ...prev, target_value: e.target.value }))}
                  className="input-field"
                />
                <button
                  onClick={addQuickGoal}
                  disabled={loading || !goalData.title.trim()}
                  className="btn-primary w-full"
                >
                  {loading ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}