import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Grid3X3,
  CheckSquare, 
  Heart, 
  DollarSign, 
  Users,
  BookOpen,
  Shield,
  MessageCircle, 
  Settings, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TranslatedText } from '../common/TranslatedText';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'modules', label: 'Modules', icon: Grid3X3 },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'relationships', label: 'Relationships', icon: Users },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'crisis', label: 'Wellness', icon: Shield },
  { id: 'ai-chat', label: 'AI Assistant', icon: MessageCircle },
];

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const { signOut } = useAuth();

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative z-10 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-blue-100 dark:border-gray-700 flex flex-col h-full shadow-soft"
    >
      {/* Logo */}
      <div className="p-6 border-b border-blue-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/20 rounded-br-3xl">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img 
              src="/LifeSync_AI_logo.png" 
              alt="LifeSync AI" 
              className="h-12 w-12 object-contain"
            />
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <TranslatedText text="Your AI-powered life companion" />
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-1 ring-blue-300/30 dark:ring-blue-700/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
              <span className="font-medium">
                <TranslatedText text={item.label} />
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-100 dark:border-gray-700 space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveView('settings')}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200"
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium">
            <TranslatedText text="Settings" />
          </span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={signOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">
            <TranslatedText text="Sign Out" />
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}