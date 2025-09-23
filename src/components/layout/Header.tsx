import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell, Search, User, Settings, LogOut, Check, X, Filter } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { TranslatedText } from '../common/TranslatedText';
import { supabase } from '../../lib/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  type: string;
  category: string;
  url: string;
}

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { currentLanguage, translate } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Welcome to LifeSync AI!',
      message: 'Your personal life planning companion is ready to help you organize your health, finances, and goals.',
      type: 'success',
      timestamp: new Date(),
      read: false,
    },
    {
      id: '2',
      title: 'Daily Check-in Reminder',
      message: 'Don\'t forget to log your mood and wellness metrics today.',
      type: 'info',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
    },
    {
      id: '3',
      title: 'Budget Alert',
      message: 'You\'ve spent 80% of your monthly dining budget.',
      type: 'warning',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
    },
  ]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const performSearch = async (query: string) => {
    try {
      // Search across multiple tables
      const [tasksResult, healthResult, expensesResult, contactsResult, goalsResult] = await Promise.all([
        supabase
          .from('tasks')
          .select('id, title, description')
          .eq('user_id', user?.id)
          .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
          .limit(3),
        supabase
          .from('health_logs')
          .select('id, type, notes')
          .eq('user_id', user?.id)
          .or(`type.ilike.%${query}%, notes.ilike.%${query}%`)
          .limit(3),
        supabase
          .from('expenses')
          .select('id, description, category')
          .eq('user_id', user?.id)
          .or(`description.ilike.%${query}%, category.ilike.%${query}%`)
          .limit(3),
        supabase
          .from('contacts')
          .select('id, name, relationship_type')
          .eq('user_id', user?.id)
          .or(`name.ilike.%${query}%, relationship_type.ilike.%${query}%`)
          .limit(3),
        supabase
          .from('goals')
          .select('id, title, category')
          .eq('user_id', user?.id)
          .or(`title.ilike.%${query}%, category.ilike.%${query}%`)
          .limit(3)
      ]);

      const results: SearchResult[] = [];

      // Process tasks
      tasksResult.data?.forEach(task => {
        results.push({
          id: task.id,
          title: task.title,
          type: 'Task',
          category: 'Productivity',
          url: '/tasks'
        });
      });

      // Process health logs
      healthResult.data?.forEach(log => {
        results.push({
          id: log.id,
          title: `${log.type} log`,
          type: 'Health Log',
          category: 'Health',
          url: '/health'
        });
      });

      // Process expenses
      expensesResult.data?.forEach(expense => {
        results.push({
          id: expense.id,
          title: expense.description,
          type: 'Expense',
          category: 'Finance',
          url: '/finance'
        });
      });

      // Process contacts
      contactsResult.data?.forEach(contact => {
        results.push({
          id: contact.id,
          title: contact.name,
          type: 'Contact',
          category: 'Relationships',
          url: '/relationships'
        });
      });

      // Process goals
      goalsResult.data?.forEach(goal => {
        results.push({
          id: goal.id,
          title: goal.title,
          type: 'Goal',
          category: goal.category,
          url: '/dashboard'
        });
      });

      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchSelect = (result: SearchResult) => {
    setSearchTerm('');
    setShowSearchResults(false);
    // Navigate to the result (you can implement navigation logic here)
    console.log('Navigate to:', result.url, 'for item:', result.title);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return translate('Just now');
    if (diffInMinutes < 60) return `${diffInMinutes}m ${translate('ago')}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ${translate('ago')}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ${translate('ago')}`;
  };

  const getUserDisplayName = () => {
    if (userProfile?.full_name) return userProfile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-b border-transparent px-6 py-4 relative shadow-soft"
    >
      <div className="flex items-center justify-between">
        {/* Enhanced Search */}
        <div className="flex-1 max-w-lg relative">
          <div className="relative">
            <Search className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <div className="relative">
              <input
                type="text"
                placeholder={translate('Search anything...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-blue-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-blue-300 dark:hover:border-gray-500"
              />
              {/* Blue accent corner */}
              <div className="absolute top-0 right-0 w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-bl-lg rounded-tr-xl opacity-70"></div>
            </div>
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-blue-100 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
              >
                <div className="p-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <Search className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Search Results ({searchResults.length})
                    </span>
                  </div>
                  
                  {searchResults.map((result, index) => (
                    <motion.button
                      key={result.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSearchSelect(result)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {result.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                            {result.type}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {result.category}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <LanguageSelector />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-blue-100 dark:border-gray-700 z-50"
                >
                  <div className="p-4 border-b border-blue-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        <TranslatedText text="Notifications" />
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                        >
                          <TranslatedText text="Mark all read" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                            !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                          } border-b border-gray-100 dark:border-gray-700 last:border-b-0`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  <TranslatedText text={notification.title} />
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                <TranslatedText text={notification.message} />
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => markNotificationAsRead(notification.id)}
                                  className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                  title="Mark as read"
                                >
                                  <Check className="h-3 w-3" />
                                </motion.button>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <X className="h-3 w-3" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          <TranslatedText text="No notifications" />
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {getUserInitials()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </motion.button>

            {/* User Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-blue-100 dark:border-gray-700 z-50"
                >
                  <div className="p-4 border-b border-blue-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {getUserInitials()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user?.email}
                        </p>
                        {userProfile?.timezone && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {userProfile.timezone}
                          </p>
                        )}
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          <TranslatedText text={`Language: ${currentLanguage.toUpperCase()}`} />
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        <TranslatedText text="Profile" />
                      </span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        <TranslatedText text="Settings" />
                      </span>
                    </motion.button>
                    
                    <hr className="my-2 border-blue-100 dark:border-gray-600" />
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={signOut}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">
                        <TranslatedText text="Sign Out" />
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu || showSearchResults) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
            setShowSearchResults(false);
          }}
        />
      )}

      {/* Decorative bottom gradient line */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"></div>
    </motion.header>
  );
}