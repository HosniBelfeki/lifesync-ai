import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, User, Loader2, Lightbulb, Sparkles, Zap, Target, TrendingUp, Heart, DollarSign, Users, BookOpen } from 'lucide-react';
import { sendChatMessage, getSystemPrompt, ChatMessage } from '../../lib/groq';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { TranslatedText } from '../common/TranslatedText';
import { supabase } from '../../lib/supabase';

interface AISuggestion {
  id: string;
  text: string;
  category: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  response?: string;
}

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m LifeSync AI, your comprehensive life planning assistant. I can help you with health tracking, financial planning, task management, relationship building, learning goals, and wellness monitoring. What would you like to work on today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userContext, setUserContext] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { translate } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      fetchUserContext();
    }
  }, [user]);

  const fetchUserContext = async () => {
    try {
      const [
        { data: profile },
        { data: healthLogs },
        { data: tasks },
        { data: expenses },
        { data: goals },
        { data: contacts },
        { data: learningPaths },
        { data: burnoutMetrics }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', user?.id).single(),
        supabase.from('health_logs').select('*').eq('user_id', user?.id).order('logged_at', { ascending: false }).limit(5),
        supabase.from('tasks').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('expenses').select('*').eq('user_id', user?.id).order('date', { ascending: false }).limit(5),
        supabase.from('goals').select('*').eq('user_id', user?.id).eq('status', 'active').limit(3),
        supabase.from('contacts').select('*').eq('user_id', user?.id).limit(3),
        supabase.from('learning_paths').select('*').eq('user_id', user?.id).eq('active', true).limit(3),
        supabase.from('burnout_metrics').select('*').eq('user_id', user?.id).order('logged_at', { ascending: false }).limit(2)
      ]);

      setUserContext({
        profile: profile || {},
        recentHealthLogs: healthLogs || [],
        recentTasks: tasks || [],
        recentExpenses: expenses || [],
        activeGoals: goals || [],
        contacts: contacts || [],
        learningPaths: learningPaths || [],
        burnoutMetrics: burnoutMetrics || []
      });
    } catch (error) {
      console.error('Error fetching user context:', error);
    }
  };

  // Enhanced AI Suggestions with automatic responses
  const getAISuggestions = (): AISuggestion[] => {
    const baseSuggestions: AISuggestion[] = [
      {
        id: 'productivity',
        text: 'How can I improve my daily productivity?',
        category: 'Productivity',
        icon: Zap,
        color: 'text-blue-600',
        bgColor: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
        response: 'Here are some proven strategies to boost your daily productivity:\n\n1. **Time Blocking**: Schedule specific time slots for different activities\n2. **Pomodoro Technique**: Work in 25-minute focused sessions with 5-minute breaks\n3. **Priority Matrix**: Use the Eisenhower Matrix to categorize tasks by urgency and importance\n4. **Morning Routine**: Start your day with a consistent routine to set a productive tone\n5. **Eliminate Distractions**: Turn off notifications during focused work periods\n\nWould you like me to help you implement any of these strategies?'
      },
      {
        id: 'health',
        text: 'What\'s my health trend this week?',
        category: 'Health',
        icon: Heart,
        color: 'text-red-600',
        bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
        response: 'Based on your recent health data, here\'s your weekly health overview:\n\n📊 **Health Metrics Summary**:\n• Mood: Tracking your emotional well-being\n• Activity: Steps and exercise patterns\n• Sleep: Rest quality and duration\n• Hydration: Water intake monitoring\n\n💡 **Recommendations**:\n• Maintain consistent sleep schedule\n• Aim for 8,000+ steps daily\n• Stay hydrated with 8 glasses of water\n• Log your mood regularly for better insights\n\nWould you like specific advice for any health area?'
      },
      {
        id: 'finance',
        text: 'Help me create a budget plan',
        category: 'Finance',
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        response: 'Let\'s create a personalized budget plan using the 50/30/20 rule:\n\n💰 **Budget Breakdown**:\n• 50% - Needs (rent, utilities, groceries)\n• 30% - Wants (entertainment, dining out)\n• 20% - Savings & debt repayment\n\n📋 **Steps to Get Started**:\n1. Calculate your monthly after-tax income\n2. List all fixed expenses (needs)\n3. Set limits for variable expenses (wants)\n4. Automate savings transfers\n5. Track expenses weekly\n\n🎯 **Pro Tips**:\n• Use the envelope method for discretionary spending\n• Review and adjust monthly\n• Build an emergency fund first\n\nShall I help you set up specific budget categories?'
      },
      {
        id: 'goals',
        text: 'Suggest a learning path for my goals',
        category: 'Learning',
        icon: BookOpen,
        color: 'text-purple-600',
        bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
        response: 'Here\'s a structured approach to create effective learning paths:\n\n🎯 **Goal-Based Learning Framework**:\n\n**1. Skill Assessment**\n• Identify current knowledge level\n• Define specific learning objectives\n• Set measurable milestones\n\n**2. Learning Path Structure**\n• Beginner: Foundation concepts (2-4 weeks)\n• Intermediate: Practical application (4-6 weeks)\n• Advanced: Mastery and specialization (6-8 weeks)\n\n**3. Learning Methods**\n• Video tutorials and courses\n• Hands-on projects\n• Flashcards for retention\n• Regular quizzes and assessments\n\n**4. Popular Learning Paths**\n• Technology: Programming, AI, Data Science\n• Business: Marketing, Finance, Leadership\n• Creative: Design, Writing, Photography\n• Personal: Languages, Health, Productivity\n\nWhat specific skill would you like to develop?'
      },
      {
        id: 'balance',
        text: 'How to maintain better work-life balance?',
        category: 'Wellness',
        icon: Target,
        color: 'text-orange-600',
        bgColor: 'from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20',
        response: 'Achieving work-life balance is crucial for long-term success and happiness:\n\n⚖️ **Balance Strategies**:\n\n**Boundaries**\n• Set clear work hours and stick to them\n• Create a dedicated workspace at home\n• Turn off work notifications after hours\n• Learn to say "no" to non-essential requests\n\n**Time Management**\n• Use time-blocking for work and personal activities\n• Batch similar tasks together\n• Delegate when possible\n• Take regular breaks throughout the day\n\n**Self-Care**\n• Schedule personal time like important meetings\n• Maintain hobbies and interests outside work\n• Exercise regularly to manage stress\n• Prioritize quality sleep (7-9 hours)\n\n**Relationships**\n• Communicate boundaries with colleagues and family\n• Plan quality time with loved ones\n• Build a support network\n\nWhat area of work-life balance would you like to focus on first?'
      },
      {
        id: 'relationships',
        text: 'How can I strengthen my relationships?',
        category: 'Relationships',
        icon: Users,
        color: 'text-pink-600',
        bgColor: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
        response: 'Building stronger relationships requires intentional effort and genuine care:\n\n💝 **Relationship Building Strategies**:\n\n**Communication**\n• Practice active listening\n• Express appreciation regularly\n• Share your thoughts and feelings openly\n• Ask meaningful questions about their life\n\n**Quality Time**\n• Schedule regular check-ins with important people\n• Plan activities you both enjoy\n• Be fully present during interactions\n• Create new shared experiences\n\n**Support & Care**\n• Remember important dates and events\n• Offer help during difficult times\n• Celebrate their successes\n• Show empathy and understanding\n\n**Consistency**\n• Maintain regular contact\n• Follow through on commitments\n• Be reliable and trustworthy\n• Invest time even when life gets busy\n\n🎯 **Action Steps**:\n• Set reminders for birthdays and anniversaries\n• Schedule weekly calls with family/friends\n• Plan monthly social activities\n• Practice gratitude and express it\n\nWhich relationships would you like to focus on strengthening?'
      }
    ];

    // Personalize suggestions based on user context
    if (userContext) {
      const personalizedSuggestions = [];
      
      if (userContext.recentTasks?.length > 0) {
        personalizedSuggestions.push({
          id: 'tasks',
          text: 'Help me organize my current tasks',
          category: 'Tasks',
          icon: Target,
          color: 'text-blue-600',
          bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
          response: `I can see you have ${userContext.recentTasks.length} recent tasks. Let me help you organize them:\n\n📋 **Task Organization Strategy**:\n\n**Priority Assessment**\n• High Priority: Urgent and important tasks\n• Medium Priority: Important but not urgent\n• Low Priority: Nice to have, can be delayed\n\n**Time Management**\n• Estimate time needed for each task\n• Break large tasks into smaller steps\n• Schedule tasks based on your energy levels\n\n**Current Task Analysis**:\n${userContext.recentTasks.slice(0, 3).map((task: any, index: number) => 
            `${index + 1}. ${task.title} - Priority: ${task.priority}`
          ).join('\n')}\n\nWould you like me to help you prioritize these tasks or create a schedule?`
        });
      }
      
      if (userContext.recentExpenses?.length > 0) {
        personalizedSuggestions.push({
          id: 'expenses',
          text: 'Review my recent spending',
          category: 'Finance',
          icon: DollarSign,
          color: 'text-green-600',
          bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          response: `Here's an analysis of your recent spending patterns:\n\n💳 **Spending Overview**:\n• Total Recent Transactions: ${userContext.recentExpenses.length}\n• Categories: ${[...new Set(userContext.recentExpenses.map((e: any) => e.category))].join(', ')}\n\n📊 **Spending Insights**:\n${userContext.recentExpenses.slice(0, 3).map((expense: any, index: number) => 
            `${index + 1}. $${expense.amount} - ${expense.category} (${expense.description})`
          ).join('\n')}\n\n💡 **Recommendations**:\n• Track expenses daily for better awareness\n• Set category-specific budgets\n• Look for patterns in discretionary spending\n• Consider the 24-hour rule for non-essential purchases\n\nWould you like help creating a budget or analyzing specific spending categories?`
        });
      }
      
      if (userContext.activeGoals?.length > 0) {
        personalizedSuggestions.push({
          id: 'goals',
          text: 'Check my goal progress',
          category: 'Goals',
          icon: Target,
          color: 'text-purple-600',
          bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
          response: `Let's review your active goals and progress:\n\n🎯 **Goal Progress Summary**:\n\n${userContext.activeGoals.map((goal: any, index: number) => {
            const progress = goal.target_value ? Math.round((goal.current_value / goal.target_value) * 100) : 0;
            return `${index + 1}. **${goal.title}**\n   Progress: ${progress}% (${goal.current_value}/${goal.target_value || 'No target'} ${goal.unit || ''})\n   Category: ${goal.category}`;
          }).join('\n\n')}\n\n📈 **Next Steps**:\n• Update progress regularly\n• Break down large goals into smaller milestones\n• Celebrate small wins along the way\n• Adjust targets if needed based on new insights\n\nWhich goal would you like to focus on improving?`
        });
      }
      
      if (userContext.recentHealthLogs?.length > 0) {
        personalizedSuggestions.push({
          id: 'health-analysis',
          text: 'Analyze my health data',
          category: 'Health',
          icon: Heart,
          color: 'text-red-600',
          bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
          response: `Here's your recent health data analysis:\n\n🏥 **Health Metrics Overview**:\n\n${userContext.recentHealthLogs.map((log: any, index: number) => {
            if (log.type === 'mood') {
              return `${index + 1}. Mood: ${log.mood_score}/5 (${new Date(log.logged_at).toLocaleDateString()})`;
            } else {
              return `${index + 1}. ${log.type}: ${log.value} ${log.unit} (${new Date(log.logged_at).toLocaleDateString()})`;
            }
          }).join('\n')}\n\n💡 **Health Insights**:\n• Consistency in logging helps identify patterns\n• Look for correlations between different metrics\n• Set realistic targets for improvement\n• Consider external factors affecting your health\n\n🎯 **Recommendations**:\n• Log data daily for better trends\n• Set weekly health goals\n• Track mood alongside physical metrics\n• Celebrate health improvements\n\nWhat specific health area would you like to focus on?`
        });
      }

      return personalizedSuggestions.length > 0 ? personalizedSuggestions : baseSuggestions;
    }

    return baseSuggestions;
  };

  // Function to clean AI response formatting
  const cleanAIResponse = (text: string) => {
    return text
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^\s*[\*\-\+]\s+/gm, '• ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Function to format AI response with colors and structure
  const formatAIResponse = (text: string) => {
    const cleanText = cleanAIResponse(text);
    const lines = cleanText.split('\n');
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        return <br key={index} />;
      }
      
      // Headers and important sections
      if (trimmedLine.startsWith('📊') || trimmedLine.startsWith('💡') || trimmedLine.startsWith('🎯') || trimmedLine.startsWith('⚖️') || trimmedLine.startsWith('💰') || trimmedLine.startsWith('🏥') || trimmedLine.startsWith('💝')) {
        return (
          <div key={index} className="mb-3 mt-4">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {trimmedLine}
            </span>
          </div>
        );
      }
      
      // Numbered lists
      if (/^\d+\./.test(trimmedLine)) {
        return (
          <div key={index} className="mb-2 ml-2">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              {trimmedLine}
            </span>
          </div>
        );
      }
      
      // Bullet points
      if (trimmedLine.startsWith('•')) {
        return (
          <div key={index} className="mb-1 ml-4">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span className="ml-2 text-gray-800 dark:text-gray-200">
              {trimmedLine.substring(1).trim()}
            </span>
          </div>
        );
      }
      
      // Bold sections (categories, headers)
      if (trimmedLine.includes('**') || (trimmedLine.includes(':') && trimmedLine.length < 100)) {
        const [title, ...rest] = trimmedLine.split(':');
        return (
          <div key={index} className="mb-2">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              {title.replace(/\*\*/g, '')}:
            </span>
            {rest.length > 0 && (
              <span className="ml-1 text-gray-800 dark:text-gray-200">
                {rest.join(':').trim()}
              </span>
            )}
          </div>
        );
      }
      
      // Regular paragraphs
      return (
        <p key={index} className="mb-2 text-gray-800 dark:text-gray-200 leading-relaxed">
          {trimmedLine}
        </p>
      );
    });
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setShowSuggestions(false);

    try {
      const conversationMessages: ChatMessage[] = [
        { role: 'system', content: getSystemPrompt(userContext) },
        ...messages.slice(-5),
        { role: 'user', content: textToSend }
      ];

      const response = await sendChatMessage(conversationMessages, userContext);
      
      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    if (suggestion.response) {
      // Use the predefined response
      const userMessage: ChatMessage = { role: 'user', content: suggestion.text };
      const assistantMessage: ChatMessage = { role: 'assistant', content: suggestion.response };
      
      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setShowSuggestions(false);
    } else {
      // Send to AI for processing
      handleSend(suggestion.text);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = getAISuggestions();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Professional Header */}
      <div className="p-6 border-b border-blue-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              <TranslatedText text="LifeSync AI Assistant" />
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <TranslatedText text="Your comprehensive life planning companion" />
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-3 max-w-4xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Brain className="h-5 w-5 text-white" />
                  )}
                </div>
                
                <div className={`px-6 py-4 rounded-2xl shadow-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border border-blue-100 dark:border-gray-600'
                }`}>
                  {message.role === 'user' ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">
                      {message.content}
                    </p>
                  ) : (
                    <div className="text-sm leading-relaxed">
                      {formatAIResponse(message.content)}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex space-x-3 max-w-3xl">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border border-blue-100 dark:border-gray-600 shadow-lg">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    <TranslatedText text="Thinking..." />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced AI Suggestions */}
        {showSuggestions && messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
              <Sparkles className="h-5 w-5" />
              <span className="text-lg font-bold">
                <TranslatedText text="Smart Suggestions" />
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.slice(0, 6).map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <motion.button
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`text-left p-4 bg-gradient-to-r ${suggestion.bgColor} border border-blue-100 dark:border-gray-600 rounded-xl hover:shadow-lg transition-all duration-300 group transform hover:scale-[1.02]`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow`}>
                        <Icon className={`h-5 w-5 ${suggestion.color} group-hover:scale-110 transition-transform`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-xs font-bold ${suggestion.color} px-2 py-1 rounded-full bg-white dark:bg-gray-800`}>
                            {suggestion.category}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          {suggestion.text}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Professional Input */}
      <div className="p-6 border-t border-blue-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="relative group">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(false)}
              placeholder={translate('Ask me anything about your health, finances, tasks, relationships, learning, or wellness...')}
              className="w-full px-6 py-4 pr-16 border-2 border-blue-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all duration-200 hover:border-blue-300 dark:hover:border-gray-500 shadow-lg hover:shadow-xl"
              rows={1}
              style={{ minHeight: '60px', maxHeight: '120px' }}
            />
            
            {/* Professional accent design */}
            <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-bl-xl rounded-tr-2xl opacity-80"></div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}