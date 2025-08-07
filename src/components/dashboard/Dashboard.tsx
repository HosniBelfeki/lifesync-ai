import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StatsCard } from './StatsCard';
import { QuickActions } from './QuickActions';
import { HealthWidget } from './HealthWidget';
import { TasksWidget } from './TasksWidget';
import { FinanceWidget } from './FinanceWidget';
import { MoodWidget } from './MoodWidget';
import { RecentActivity } from './RecentActivity';
import { AIInsights } from './AIInsights';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { TranslatedText } from '../common/TranslatedText';
import { ComponentLoader } from '../common/LoadingSpinner';

export function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [
        { data: tasks },
        { data: healthLogs },
        { data: expenses },
        { data: goals },
        { data: contacts },
        { data: learningPaths },
        { data: profile }
      ] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('health_logs').select('*').eq('user_id', user?.id).order('logged_at', { ascending: false }).limit(20),
        supabase.from('expenses').select('*').eq('user_id', user?.id).order('date', { ascending: false }).limit(20),
        supabase.from('goals').select('*').eq('user_id', user?.id).eq('status', 'active'),
        supabase.from('contacts').select('*').eq('user_id', user?.id).limit(5),
        supabase.from('learning_paths').select('*').eq('user_id', user?.id).eq('active', true),
        supabase.from('user_profiles').select('*').eq('user_id', user?.id).single()
      ]);

      setDashboardData({
        tasks: tasks || [],
        healthLogs: healthLogs || [],
        expenses: expenses || [],
        goals: goals || [],
        contacts: contacts || [],
        learningPaths: learningPaths || [],
        profile: profile || {}
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    if (!dashboardData) return { tasksCompleted: 0, totalTasks: 0, healthScore: 0, monthlySavings: 0, moodAverage: 0 };

    const { tasks, healthLogs, expenses } = dashboardData;
    
    const completedTasks = tasks.filter((t: any) => t.completed).length;
    const totalTasks = tasks.length;
    
    // Calculate health score based on recent logs
    const recentHealthLogs = healthLogs.slice(0, 7);
    const healthScore = recentHealthLogs.length > 0 
      ? Math.round(recentHealthLogs.reduce((sum: number, log: any) => {
          if (log.type === 'mood' && log.mood_score) return sum + (log.mood_score * 20);
          if (log.type === 'sleep' && log.value) return sum + Math.min(log.value * 12.5, 100);
          if (log.type === 'water' && log.value) return sum + Math.min(log.value * 12.5, 100);
          return sum + 70; // Default score for other activities
        }, 0) / recentHealthLogs.length)
      : 85;

    // Calculate monthly savings (income - expenses)
    const currentMonth = new Date().getMonth();
    const monthlyExpenses = expenses.filter((e: any) => 
      new Date(e.date).getMonth() === currentMonth
    ).reduce((sum: number, e: any) => sum + e.amount, 0);
    const monthlySavings = Math.max(0, 3000 - monthlyExpenses); // Assuming 3000 income

    // Calculate mood average
    const moodLogs = healthLogs.filter((log: any) => log.type === 'mood' && log.mood_score);
    const moodAverage = moodLogs.length > 0
      ? moodLogs.reduce((sum: number, log: any) => sum + log.mood_score, 0) / moodLogs.length
      : 4.2;

    return {
      tasksCompleted: completedTasks,
      totalTasks,
      healthScore,
      monthlySavings,
      moodAverage: Math.round(moodAverage * 10) / 10
    };
  };

  if (loading) {
    return <ComponentLoader text="Loading your dashboard..." />;
  }

  const stats = getStats();
  const userName = dashboardData?.profile?.full_name || user?.user_metadata?.full_name || 'there';

  const statsData = [
    {
      title: 'Tasks Completed',
      value: stats.tasksCompleted,
      total: stats.totalTasks,
      change: stats.totalTasks > 0 ? `${Math.round((stats.tasksCompleted / stats.totalTasks) * 100)}%` : '0%',
      changeType: 'positive' as const,
    },
    {
      title: 'Health Score',
      value: stats.healthScore,
      total: 100,
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Monthly Savings',
      value: stats.monthlySavings,
      prefix: '$',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Mood Average',
      value: stats.moodAverage,
      total: 5,
      change: '+0.3',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <div className="container-fluid py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            <TranslatedText text={`Welcome back, ${userName}! 👋`} />
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            <TranslatedText text="Here's what's happening with your life today." />
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statsData.map((stat, index) => (
            <StatsCard key={stat.title} {...stat} index={index} />
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <QuickActions onDataUpdate={fetchDashboardData} />
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <AIInsights dashboardData={dashboardData} />
        </motion.div>

        {/* Main Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <HealthWidget data={dashboardData?.healthLogs || []} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <TasksWidget tasks={dashboardData?.tasks || []} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <FinanceWidget expenses={dashboardData?.expenses || []} />
          </motion.div>
        </div>

        {/* Secondary Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <MoodWidget moods={dashboardData?.healthLogs?.filter((log: any) => log.type === 'mood') || []} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <RecentActivity dashboardData={dashboardData} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}