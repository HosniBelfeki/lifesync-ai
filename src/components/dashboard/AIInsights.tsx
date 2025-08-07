import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, MessageCircle } from 'lucide-react';
import { TranslatedText } from '../common/TranslatedText';

interface AIInsightsProps {
  dashboardData: any;
}

export function AIInsights({ dashboardData }: AIInsightsProps) {
  const getInsightCards = () => {
    if (!dashboardData) return [];

    const cards = [];
    const { tasks, healthLogs, expenses, goals } = dashboardData;

    // Task completion insight
    const completedTasks = tasks?.filter((t: any) => t.completed).length || 0;
    const totalTasks = tasks?.length || 0;
    if (totalTasks > 0) {
      const completionRate = (completedTasks / totalTasks) * 100;
      cards.push({
        icon: TrendingUp,
        title: 'Task Performance',
        value: `${Math.round(completionRate)}%`,
        description: `${completedTasks} of ${totalTasks} tasks completed`,
        color: completionRate >= 70 ? 'text-green-600' : completionRate >= 50 ? 'text-yellow-600' : 'text-red-600',
        bgColor: completionRate >= 70 ? 'bg-green-50 dark:bg-green-900/20' : completionRate >= 50 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-red-50 dark:bg-red-900/20'
      });
    }

    // Health trend insight
    const recentMoodLogs = healthLogs?.filter((log: any) => log.type === 'mood').slice(0, 7) || [];
    if (recentMoodLogs.length > 0) {
      const avgMood = recentMoodLogs.reduce((sum: number, log: any) => sum + log.mood_score, 0) / recentMoodLogs.length;
      cards.push({
        icon: TrendingUp,
        title: 'Mood Trend',
        value: `${avgMood.toFixed(1)}/5`,
        description: 'Average mood this week',
        color: avgMood >= 4 ? 'text-green-600' : avgMood >= 3 ? 'text-yellow-600' : 'text-red-600',
        bgColor: avgMood >= 4 ? 'bg-green-50 dark:bg-green-900/20' : avgMood >= 3 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-red-50 dark:bg-red-900/20'
      });
    }

    // Spending insight
    const currentMonth = new Date().getMonth();
    const monthlyExpenses = expenses?.filter((e: any) => 
      new Date(e.date).getMonth() === currentMonth
    ) || [];
    if (monthlyExpenses.length > 0) {
      const totalSpent = monthlyExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      cards.push({
        icon: AlertTriangle,
        title: 'Monthly Spending',
        value: `$${totalSpent.toLocaleString()}`,
        description: `${monthlyExpenses.length} transactions this month`,
        color: totalSpent > 2000 ? 'text-red-600' : totalSpent > 1500 ? 'text-yellow-600' : 'text-green-600',
        bgColor: totalSpent > 2000 ? 'bg-red-50 dark:bg-red-900/20' : totalSpent > 1500 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20'
      });
    }

    return cards;
  };

  const insightCards = getInsightCards();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-purple-500" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            <TranslatedText text="Insights" />
          </h3>
        </div>
      </div>

      {/* Quick Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {insightCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg ${card.bgColor}`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-5 w-5 ${card.color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <TranslatedText text={card.title} />
                  </p>
                  <p className={`text-lg font-bold ${card.color}`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {card.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* AI Chat Prompt */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h4 className="font-semibold text-gray-900 dark:text-white">
            <TranslatedText text="Need Personalized Recommendations?" />
          </h4>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          <TranslatedText text="Get AI-powered insights and personalized recommendations by chatting with your AI assistant." />
        </p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.hash = '#ai-chat'}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span><TranslatedText text="Chat with AI Assistant" /></span>
        </motion.button>
      </div>
    </div>
  );
}