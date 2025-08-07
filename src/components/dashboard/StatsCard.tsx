import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { TranslatedText } from '../common/TranslatedText';

interface StatsCardProps {
  title: string;
  value: number;
  total?: number;
  prefix?: string;
  suffix?: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  index: number;
}

export function StatsCard({ 
  title, 
  value, 
  total, 
  prefix = '', 
  suffix = '', 
  change, 
  changeType = 'positive',
  index 
}: StatsCardProps) {
  const percentage = total ? (value / total) * 100 : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-hover"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            <TranslatedText text={title} />
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </span>
            {total && (
              <span className="text-lg text-gray-500 dark:text-gray-400">
                /{total}
              </span>
            )}
          </div>
        </div>
        
        {change && (
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
            changeType === 'positive' 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}>
            {changeType === 'positive' ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>

      {percentage !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span><TranslatedText text="Progress" /></span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, delay: index * 0.2 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}