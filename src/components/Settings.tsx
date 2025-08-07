import React from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Database, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const settingsSections = [
    {
      title: 'Profile',
      icon: User,
      items: [
        { label: 'Full Name', value: user?.user_metadata?.full_name || 'Not set' },
        { label: 'Email', value: user?.email || 'Not set' },
        { label: 'Account Created', value: new Date(user?.created_at || '').toLocaleDateString() },
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Daily Reminders', value: 'Enabled', toggle: true },
        { label: 'Weekly Reports', value: 'Enabled', toggle: true },
        { label: 'AI Suggestions', value: 'Enabled', toggle: true },
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        { label: 'Data Encryption', value: 'Enabled' },
        { label: 'Two-Factor Auth', value: 'Disabled', action: 'Enable' },
        { label: 'Data Export', value: '', action: 'Download' },
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        { label: 'Theme', value: theme === 'dark' ? 'Dark' : 'Light', toggle: true, action: toggleTheme },
        { label: 'Language', value: 'English' },
        { label: 'Timezone', value: 'UTC-5' },
      ]
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Settings
        </h1>

        <div className="space-y-8">
          {settingsSections.map((section, sectionIndex) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-blue-100 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                      className="flex items-center justify-between py-3 border-b border-blue-50 dark:border-gray-700 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.label}
                        </p>
                        {item.value && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.value}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        {item.toggle && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={item.action}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              (item.label === 'Theme' && theme === 'dark') || 
                              (item.label !== 'Theme' && item.value === 'Enabled')
                                ? 'bg-blue-600' 
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <motion.div
                              animate={{
                                x: (item.label === 'Theme' && theme === 'dark') || 
                                   (item.label !== 'Theme' && item.value === 'Enabled') ? 24 : 0
                              }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                            />
                          </motion.button>
                        )}

                        {item.action && !item.toggle && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            {item.action}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-blue-100 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                About LifeSync AI
              </h2>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>Version 1.0.0</p>
              <p>Built with React, TypeScript, and Supabase</p>
              <p>Powered by GroqCloud and LLaMA 4</p>
              <p className="mt-4">
                LifeSync AI helps you organize your health, finances, tasks, and goals 
                with the power of artificial intelligence.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}