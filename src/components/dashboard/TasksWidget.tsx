import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { Task } from '../../hooks/useMockData';

interface TasksWidgetProps {
  tasks: Task[];
}

export function TasksWidget({ tasks }: TasksWidgetProps) {
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const overdueTasks = pendingTasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date()
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tasks Overview
          </h3>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {completedTasks.length}/{tasks.length} completed
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <CheckSquare className="h-5 w-5 text-blue-600 mx-auto mb-1" />
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {completedTasks.length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
        </div>
        
        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
          <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
            {pendingTasks.length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
        </div>
        
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            {overdueTasks.length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Overdue</p>
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Recent Tasks
        </h4>
        <div className="space-y-3">
          {tasks.slice(0, 3).map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className={`w-2 h-2 rounded-full ${
                task.completed ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  task.completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'
                }`}>
                  {task.title}
                </p>
                {task.dueDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}