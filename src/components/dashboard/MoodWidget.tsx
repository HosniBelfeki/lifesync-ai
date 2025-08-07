import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Smile, TrendingUp } from 'lucide-react';
import { MoodLog } from '../../hooks/useMockData';

interface MoodWidgetProps {
  moods: MoodLog[];
}

export function MoodWidget({ moods }: MoodWidgetProps) {
  const chartData = moods.map(mood => ({
    date: new Date(mood.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: mood.score,
  }));

  const averageMood = moods.reduce((sum, mood) => sum + mood.score, 0) / moods.length;
  
  const getMoodEmoji = (score: number) => {
    if (score >= 4.5) return '😄';
    if (score >= 3.5) return '😊';
    if (score >= 2.5) return '😐';
    if (score >= 1.5) return '😔';
    return '😢';
  };

  const getMoodLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Neutral';
    if (score >= 1.5) return 'Poor';
    return 'Very Poor';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Smile className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mood Tracking
          </h3>
        </div>
        <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">+0.3</span>
        </div>
      </div>

      {/* Current Mood */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{getMoodEmoji(averageMood)}</div>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {getMoodLabel(averageMood)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Average: {averageMood.toFixed(1)}/5.0
        </p>
      </div>

      {/* Mood Chart */}
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              className="text-xs"
            />
            <YAxis domain={[1, 5]} hide />
            <Tooltip 
              formatter={(value: number) => [value, 'Mood Score']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="mood" 
              stroke="#f59e0b" 
              fill="#f59e0b"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Mood Log */}
      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          How are you feeling today?
        </p>
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5].map((score) => (
            <motion.button
              key={score}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-2xl p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {getMoodEmoji(score)}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}