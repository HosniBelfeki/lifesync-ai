import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, TrendingUp, Calendar, Activity, Droplets, Moon, Scale } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { HealthLog } from '../../types/database';

export function HealthView() {
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'mood' | 'weight' | 'sleep' | 'water' | 'steps'>('mood');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLog, setNewLog] = useState({
    type: 'mood' as const,
    value: 0,
    mood_score: 3,
    notes: '',
  });
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
        .limit(100);

      if (error) throw error;
      setHealthLogs(data || []);
    } catch (error) {
      console.error('Error fetching health logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHealthLog = async () => {
    try {
      const logData: any = {
        user_id: user?.id,
        type: newLog.type,
        logged_at: new Date().toISOString(),
      };

      if (newLog.type === 'mood') {
        logData.mood_score = newLog.mood_score;
      } else {
        logData.value = newLog.value;
        logData.unit = getUnit(newLog.type);
      }

      if (newLog.notes) {
        logData.notes = newLog.notes;
      }

      const { error } = await supabase
        .from('health_logs')
        .insert(logData);

      if (error) throw error;
      
      setNewLog({ type: 'mood', value: 0, mood_score: 3, notes: '' });
      setShowAddForm(false);
      fetchHealthLogs();
    } catch (error) {
      console.error('Error adding health log:', error);
    }
  };

  const getUnit = (type: string) => {
    switch (type) {
      case 'weight': return 'kg';
      case 'sleep': return 'hours';
      case 'water': return 'glasses';
      case 'steps': return 'steps';
      default: return '';
    }
  };

  const getChartData = () => {
    return healthLogs
      .filter(log => log.type === selectedMetric)
      .slice(0, 30)
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
      weight: todayLogs.find(log => log.type === 'weight')?.value || 0,
    };
  };

  const getWeeklyAverage = (type: string) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekLogs = healthLogs.filter(log => 
      log.type === type && new Date(log.logged_at) >= weekAgo
    );

    if (weekLogs.length === 0) return 0;

    const sum = weekLogs.reduce((acc, log) => {
      return acc + (type === 'mood' ? log.mood_score || 0 : log.value || 0);
    }, 0);

    return Math.round((sum / weekLogs.length) * 10) / 10;
  };

  const stats = getTodayStats();
  const chartData = getChartData();

  const quickLogButtons = [
    { type: 'mood', icon: '😊', label: 'Good Mood', value: 4 },
    { type: 'water', icon: '💧', label: 'Glass of Water', value: 1 },
    { type: 'steps', icon: '👟', label: '1000 Steps', value: 1000 },
    { type: 'sleep', icon: '😴', label: '8h Sleep', value: 8 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health & Wellness</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your health metrics and wellness journey</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Log Health Data</span>
        </motion.button>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.mood}/5</p>
              <p className="text-gray-600 dark:text-gray-400">Mood</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.steps)}</p>
              <p className="text-gray-600 dark:text-gray-400">Steps</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Droplets className="h-8 w-8 text-cyan-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.water}</p>
              <p className="text-gray-600 dark:text-gray-400">Water (glasses)</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Moon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sleep}h</p>
              <p className="text-gray-600 dark:text-gray-400">Sleep</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Scale className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.weight || '--'}</p>
              <p className="text-gray-600 dark:text-gray-400">Weight (kg)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Log Buttons */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Log</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLogButtons.map((button) => (
            <motion.button
              key={button.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
                  logData.unit = getUnit(button.type);
                }

                try {
                  await supabase.from('health_logs').insert(logData);
                  fetchHealthLogs();
                } catch (error) {
                  console.error('Error logging quick data:', error);
                }
              }}
              className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="text-2xl">{button.icon}</span>
              <span className="font-medium text-gray-900 dark:text-white">{button.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Add Health Log Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Log Health Data</h3>
          <div className="space-y-4">
            <select
              value={newLog.type}
              onChange={(e) => setNewLog(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="mood">Mood</option>
              <option value="weight">Weight</option>
              <option value="sleep">Sleep</option>
              <option value="water">Water</option>
              <option value="steps">Steps</option>
              <option value="exercise">Exercise</option>
            </select>
            
            {newLog.type === 'mood' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mood Score (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newLog.mood_score}
                  onChange={(e) => setNewLog(prev => ({ ...prev, mood_score: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>😢 Very Bad</span>
                  <span>😐 Neutral</span>
                  <span>😊 Great</span>
                </div>
                <p className="text-center mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {newLog.mood_score}/5
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Value ({getUnit(newLog.type)})
                </label>
                <input
                  type="number"
                  value={newLog.value}
                  onChange={(e) => setNewLog(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`Enter ${newLog.type} value`}
                />
              </div>
            )}
            
            <textarea
              placeholder="Notes (optional)"
              value={newLog.notes}
              onChange={(e) => setNewLog(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
            
            <div className="flex space-x-3">
              <button
                onClick={addHealthLog}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Log Data
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trends</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="mood">Mood</option>
              <option value="weight">Weight</option>
              <option value="sleep">Sleep</option>
              <option value="water">Water</option>
              <option value="steps">Steps</option>
            </select>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Averages */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Weekly Averages</h3>
          
          <div className="space-y-4">
            {['mood', 'sleep', 'water', 'steps'].map((metric) => (
              <div key={metric} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 capitalize">{metric}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min((getWeeklyAverage(metric) / (metric === 'steps' ? 10000 : metric === 'mood' ? 5 : 10)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                    {getWeeklyAverage(metric)}{metric === 'mood' ? '/5' : metric === 'sleep' ? 'h' : metric === 'water' ? 'g' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Logs</h3>
        
        <div className="space-y-4">
          {healthLogs.slice(0, 10).map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {log.type}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(log.logged_at).toLocaleDateString()} at {new Date(log.logged_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {log.type === 'mood' ? `${log.mood_score}/5` : `${log.value} ${log.unit}`}
                </p>
                {log.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {log.notes}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
          
          {healthLogs.length === 0 && (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No health data yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start logging your health metrics to track your wellness journey
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}