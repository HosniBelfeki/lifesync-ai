import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Plus, CreditCard } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Expense, Budget } from '../../types/database';
import { TranslatedText } from '../common/TranslatedText';

export function FinanceModule() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFinanceData();
    }
  }, [user]);

  const fetchFinanceData = async () => {
    try {
      const [expensesResult, budgetsResult] = await Promise.all([
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user?.id)
          .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
          .order('date', { ascending: false }),
        supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user?.id)
          .eq('active', true)
      ]);

      if (expensesResult.error) throw expensesResult.error;
      if (budgetsResult.error) throw budgetsResult.error;

      setExpenses(expensesResult.data || []);
      setBudgets(budgetsResult.data || []);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuickExpense = async (category: string, amount: number, description: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: user?.id,
          amount,
          category,
          description,
          date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;
      fetchFinanceData();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const getMonthlyStats = () => {
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryData = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryData)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      totalSpent,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      transactionCount: expenses.length,
    };
  };

  const getChartData = () => {
    const categoryData = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryData)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
      }))
      .slice(0, 4);
  };

  const stats = getMonthlyStats();
  const chartData = getChartData();
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Professional Monthly Summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-2xl shadow-soft border border-green-100 dark:border-green-800/30"
      >
        <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          ${stats.totalSpent.toLocaleString()}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          <TranslatedText text="This Month" />
        </p>
      </motion.div>

      {/* Professional Chart */}
      <div className="flex-1">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
          <TranslatedText text="Category Breakdown" />
        </h4>
        
        {chartData.length > 0 ? (
          <div className="h-28 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-3 shadow-soft border border-gray-100 dark:border-gray-700">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-28 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-700 rounded-2xl">
            <TranslatedText text="No expenses this month" />
          </div>
        )}
      </div>

      {/* Professional Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-soft border border-blue-100 dark:border-blue-800/30"
        >
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {stats.transactionCount}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            <TranslatedText text="Transactions" />
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-soft border border-purple-100 dark:border-purple-800/30"
        >
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            ${stats.topCategory ? Math.round(stats.topCategory.amount) : 0}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            <TranslatedText text="Top Category" />
          </p>
        </motion.div>
      </div>

      {/* Professional Quick Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => addQuickExpense('Food & Dining', 15, 'Quick lunch')}
            className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 text-orange-600 dark:text-orange-400 rounded-2xl hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-all duration-300 shadow-soft border border-orange-100 dark:border-orange-800/30"
          >
            <span className="text-lg">🍽️</span>
            <span className="font-semibold text-sm">
              <TranslatedText text="Food" />
            </span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => addQuickExpense('Transportation', 25, 'Gas/Transit')}
            className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-600 dark:text-blue-400 rounded-2xl hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 transition-all duration-300 shadow-soft border border-blue-100 dark:border-blue-800/30"
          >
            <span className="text-lg">🚗</span>
            <span className="font-semibold text-sm">
              <TranslatedText text="Transport" />
            </span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all duration-300 group"
        >
          <Plus className="h-4 w-4 text-gray-500 group-hover:text-green-500 transition-colors" />
          <span className="font-semibold text-sm text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            <TranslatedText text="Add Expense" />
          </span>
        </motion.button>
      </div>
    </div>
  );
}