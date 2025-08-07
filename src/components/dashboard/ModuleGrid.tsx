import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, Maximize2, Search, Filter } from 'lucide-react';
import { HealthModule } from '../modules/HealthModule';
import { FinanceModule } from '../modules/FinanceModule';
import { ProductivityModule } from '../modules/ProductivityModule';
import { RelationshipModule } from '../modules/RelationshipModule';
import { LearningModule } from '../modules/LearningModule';
import { CrisisModule } from '../modules/CrisisModule';
import { TranslatedText } from '../common/TranslatedText';

interface ModuleConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  size: 'small' | 'medium' | 'large';
  enabled: boolean;
  color: string;
  icon: string;
  category: string;
}

export function ModuleGrid() {
  const [modules, setModules] = useState<ModuleConfig[]>([
    {
      id: 'health',
      title: 'Health Monitor',
      component: HealthModule,
      size: 'medium',
      enabled: true,
      color: 'from-red-500/10 via-pink-500/10 to-rose-500/10 dark:from-red-900/20 dark:via-pink-900/20 dark:to-rose-900/20',
      icon: '🏥',
      category: 'wellness',
    },
    {
      id: 'finance',
      title: 'Finance Tracker',
      component: FinanceModule,
      size: 'medium',
      enabled: true,
      color: 'from-green-500/10 via-emerald-500/10 to-teal-500/10 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20',
      icon: '💰',
      category: 'finance',
    },
    {
      id: 'productivity',
      title: 'Productivity Tools',
      component: ProductivityModule,
      size: 'large',
      enabled: true,
      color: 'from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20',
      icon: '⚡',
      category: 'productivity',
    },
    {
      id: 'relationships',
      title: 'Relationship Manager',
      component: RelationshipModule,
      size: 'medium',
      enabled: true,
      color: 'from-purple-500/10 via-violet-500/10 to-fuchsia-500/10 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-fuchsia-900/20',
      icon: '👥',
      category: 'social',
    },
    {
      id: 'learning',
      title: 'Learning Assistant',
      component: LearningModule,
      size: 'medium',
      enabled: true,
      color: 'from-amber-500/10 via-yellow-500/10 to-orange-500/10 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20',
      icon: '📚',
      category: 'education',
    },
    {
      id: 'crisis',
      title: 'Crisis Prevention',
      component: CrisisModule,
      size: 'small',
      enabled: true,
      color: 'from-orange-500/10 via-red-500/10 to-pink-500/10 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20',
      icon: '🛡️',
      category: 'wellness',
    },
  ]);

  const [showAddModule, setShowAddModule] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'wellness', 'finance', 'productivity', 'social', 'education'];

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return module.enabled && matchesSearch && matchesCategory;
  });

  const toggleModule = (moduleId: string) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, enabled: !module.enabled }
        : module
    ));
  };

  const addNewModule = () => {
    // Implementation for adding new modules
    setShowAddModule(false);
    console.log('Add new module functionality');
  };

  const openSettings = () => {
    setShowSettings(true);
    console.log('Module settings opened');
  };

  const getGridClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1';
      case 'medium':
        return 'col-span-1 md:col-span-2 row-span-2';
      case 'large':
        return 'col-span-1 md:col-span-3 row-span-2';
      default:
        return 'col-span-1 row-span-1';
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container-fluid py-8">
        {/* Professional Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12 space-y-6 lg:space-y-0">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              <TranslatedText text="Your Dashboard" />
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
              <TranslatedText text="Customize your modules and track your progress" />
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full sm:w-64 border-2 border-blue-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={addNewModule}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-5 w-5" />
              <span><TranslatedText text="Add Module" /></span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={openSettings}
              className="p-3 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600"
            >
              <Settings className="h-6 w-6" />
            </motion.button>
          </div>
        </div>

        {/* Professional Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-8 auto-rows-fr">
          {filteredModules.map((module, index) => {
            const ModuleComponent = module.component;
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                className={`${getGridClass(module.size)} group relative`}
              >
                {/* Professional Card Container */}
                <div className={`h-full bg-gradient-to-br ${module.color} backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/30 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2`}>
                  
                  {/* Glassmorphism Overlay */}
                  <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-sm"></div>
                  
                  {/* Module Header */}
                  <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10 dark:border-gray-700/20">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{module.icon}</div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          <TranslatedText text={module.title} />
                        </h3>
                        <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1"></div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 dark:hover:bg-black/20 rounded-xl transition-all duration-200"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleModule(module.id)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/20 dark:hover:bg-black/20 rounded-xl transition-all duration-200"
                      >
                        <Settings className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Module Content */}
                  <div className="relative z-10 p-6 h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-b-3xl">
                    <ModuleComponent />
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredModules.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No modules found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        )}

        {/* Professional Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/30">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              All systems operational • {filteredModules.length} modules active
            </span>
          </div>
        </div>
      </div>

      {/* Add Module Modal */}
      {showAddModule && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModule(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Add New Module
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Choose from available modules to enhance your dashboard
            </p>
            <div className="flex space-x-4">
              <button
                onClick={addNewModule}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Modules
              </button>
              <button
                onClick={() => setShowAddModule(false)}
                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSettings(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Module Settings
            </h3>
            
            <div className="space-y-4">
              {modules.map(module => (
                <div key={module.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{module.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{module.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{module.category}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleModule(module.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      module.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <motion.div
                      animate={{ x: module.enabled ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                    />
                  </motion.button>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}