import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, CheckSquare, DollarSign, Heart, Users } from 'lucide-react';
import { TranslatedText } from '../common/TranslatedText';

interface RecentActivityProps {
  dashboardData: any;
}

export function RecentActivity({ dashboardData }: RecentActivityProps) {
  const getRecentActivities = () => {
    if (!dashboardData) return [];

    const activities = [];

    // Recent tasks
    dashboardData.tasks?.slice(0, 3).forEach((task: any) => {
      activities.push({
        id: `task-${task.id}`,
        type: 'task',
        icon: CheckSquare,
        title: task.completed ? 'Completed task' : 'Created task',
        description: task.title,
        time: new Date(task.updated_at || task.created_at),
        color: task.completed ? 'text-green-600' : 'text-blue-600'
      });
    });

    // Recent health logs
    dashboardData.healthLogs?.slice(0, 2).forEach((log: any) => {
      activities.push({
        id: `health-${log.id}`,
        type: 'health',
        icon: Heart,
        title: `Logged ${log.type}`,
        description: log.type === 'mood' ? `Mood: ${log.mood_score}/5` : `${log.value} ${log.unit}`,
        time: new Date(log.logged_at),
        color: 'text-red-600'
      });
    });

    // Recent expenses
    dashboardData.expenses?.slice(0, 2).forEach((expense: any) => {
      activities.push({
        id: `expense-${expense.id}`,
        type: 'expense',
        icon: DollarSign,
        title: 'Added expense',
        description: `$${expense.amount} - ${expense.description}`,
        time: new Date(expense.created_at),
        color: 'text-green-600'
      });
    });

    // Sort by time (most recent first)
    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 6);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const activities = getRecentActivities();

  return (
    <div className="card h-full">
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="h-6 w-6 text-indigo-500" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          <TranslatedText text="Recent Activity" />
        </h3>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length > 0 ? (
          activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm`}>
                  <Icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    <TranslatedText text={activity.title} />
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {formatTimeAgo(activity.time)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              <TranslatedText text="No recent activity" />
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              <TranslatedText text="Start using LifeSync AI to see your activity here" />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}