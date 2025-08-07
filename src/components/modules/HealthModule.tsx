import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, TrendingUp, Calendar, Activity, Droplets, Moon, Scale } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { HealthLog } from '../../types/database';
import { TranslatedText } from '../common/TranslatedText';

export function HealthModule() {
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'mood' | 'weight' | 'sleep'>('mood');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchHealthLogs();
    }
  }, [user]);

  const fetchHealthLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('health_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('logged_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setHealthLogs(data || []);
    } catch (error) {
      console.error('Error fetching health logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuickLog = async (type: string, value: number) => {
    try {
      const { error } = await supabase
        .from('health_logs')
        .insert({
          user_id: user?.id,
          type,
          value,
          logged_at: new Date().toISOString(),
        });

      if (error) throw error;
      fetchHealthLogs();
    } catch (error) {
      console.error('Error adding health log:', error);
    }
  };

  const getChartData = () => {
    return healthLogs
      .filter(log => log.type === selectedMetric)
      .slice(0, 7)
      .reverse()
      .map(log => ({
        date: new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: selectedMetric === 'mood' ? log.mood_score : log.value,
      }));
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayLogs = healthLogs.filter(log => 
      new Date(log.logged_at).toDateString() === today
    );

    return {
      mood: todayLogs.find(log => log.type === 'mood')?.mood_score || 0,
      steps: todayLogs.find(log => log.type === 'steps')?.value || 0,
      water: todayLogs.find(log => log.type === 'water')?.value || 0,
      sleep: todayLogs.find(log => log.type === 'sleep')?.value || 0,
    };
  };

  const stats = getTodayStats();
  const chartData = getChartData();

  const quickLogButtons = [
    { type: 'mood', icon: '😊', label: 'Good', value: 4 },
    { type: 'water', icon: '💧', label: 'Water', value: 1 },
    { type: 'steps', icon: '👟', label: 'Steps', value: 1000 },
    { type: 'sleep', icon: '😴', label: 'Sleep', value: 8 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Professional Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl shadow-soft border border-red-100 dark:border-red-800/30"
        >
          <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {stats.mood}/5
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            <TranslatedText text="Mood" />
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl shadow-soft border border-blue-100 dark:border-blue-800/30"
        >
          <Activity className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(stats.steps)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            <TranslatedText text="Steps" />
          </p>
        </motion.div>
      </div>

      {/* Professional Chart */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            <TranslatedText text="7-Day Trend" />
          </h4>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all"
          >
            <option value="mood"><TranslatedText text="Mood" /></option>
            <option value="weight">Weight</option>
            <option value="sleep"><TranslatedText text="Sleep" /></option>
          </select>
        </div>
        
        <div className="h-24 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-3 shadow-soft border border-gray-100 dark:border-gray-700">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Professional Quick Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {quickLogButtons.slice(0, 2).map((button, index) => (
            <motion.button
              key={button.label}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={async () => {
                const logData: any = {
                  user_id: user?.id,
                  type: button.type,
                  logged_at: new Date().toISOString(),
                };

                if (button.type === 'mood') {
                  logData.mood_score = button.value;
                } else {
                  logData.value = button.value;
                  logData.unit = button.type === 'water' ? 'glasses' : button.type === 'steps' ? 'steps' : 'hours';
                }

                try {
                  await supabase.from('health_logs').insert(logData);
                  fetchHealthLogs();
                } catch (error) {
                  console.error('Error logging quick data:', error);
                }
              }}
              className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-600 dark:text-green-400 rounded-2xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-300 shadow-soft border border-green-100 dark:border-green-800/30"
            >
              <span className="text-lg">{button.icon}</span>
              <span className="font-semibold text-sm">
                <TranslatedText text={button.label} />
              </span>
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-300 group"
        >
          <Plus className="h-4 w-4 text-gray-500 group-hover:text-red-500 transition-colors" />
          <span className="font-semibold text-sm text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            <TranslatedText text="Log Health Data" />
          </span>
        </motion.button>
      </div>
    </div>
  );
}