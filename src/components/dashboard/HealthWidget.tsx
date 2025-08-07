import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';
import { HealthLog } from '../../hooks/useMockData';

interface HealthWidgetProps {
  data: HealthLog[];
}

export function HealthWidget({ data }: HealthWidgetProps) {
  const weightData = data
    .filter(log => log.type === 'weight')
    .slice(-14)
    .map(log => ({
      date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: Number(log.value.toFixed(1)),
    }));

  const todayStats = [
    { label: 'Steps', value: '8,432', icon: Activity, color: 'text-blue-600' },
    { label: 'Water', value: '6 glasses', icon: Activity, color: 'text-cyan-600' },
    { label: 'Sleep', value: '7.5h', icon: Activity, color: 'text-purple-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Health Overview
          </h3>
        </div>
        <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">+2.3%</span>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {todayStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
            <p className={`text-sm font-semibold ${stat.color} dark:text-blue-400`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Weight Trend */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Weight Trend (2 weeks)
        </h4>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis hide />
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
                dataKey="weight" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}