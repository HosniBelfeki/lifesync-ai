import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, User, Heart, DollarSign, Target, Users, BookOpen, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
}

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [completing, setCompleting] = useState(false);
  const { user } = useAuth();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to LifeSync AI',
      description: 'Let\'s personalize your experience',
      icon: User,
      component: WelcomeStep,
    },
    {
      id: 'health',
      title: 'Health & Wellness',
      description: 'Set up your health tracking preferences',
      icon: Heart,
      component: HealthStep,
    },
    {
      id: 'finance',
      title: 'Financial Goals',
      description: 'Configure your budget and financial tracking',
      icon: DollarSign,
      component: FinanceStep,
    },
    {
      id: 'productivity',
      title: 'Productivity Setup',
      description: 'Organize your tasks and goals',
      icon: Target,
      component: ProductivityStep,
    },
    {
      id: 'relationships',
      title: 'Relationships',
      description: 'Manage your connections',
      icon: Users,
      component: RelationshipsStep,
    },
    {
      id: 'learning',
      title: 'Learning Preferences',
      description: 'Set up your learning journey',
      icon: BookOpen,
      component: LearningStep,
    },
    {
      id: 'crisis',
      title: 'Wellness Monitoring',
      description: 'Configure crisis prevention settings',
      icon: Shield,
      component: CrisisStep,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    if (completing) return;
    
    setCompleting(true);
    try {
      // Save user preferences
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          category: 'onboarding',
          preferences: formData,
        });

      if (preferencesError) {
        console.error('Error saving preferences:', preferencesError);
      }

      // Mark onboarding as completed
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user?.id,
          full_name: formData.name || user?.user_metadata?.full_name || null,
          timezone: formData.timezone || 'UTC',
          onboarding_completed: true,
          preferences: formData,
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setCompleting(false);
    }
  };

  const updateFormData = (stepData: Record<string, any>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const CurrentStepComponent = steps[currentStep].component;
  const StepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <StepIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {steps[currentStep].description}
            </p>
          </div>

          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={completing}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {completing ? 'Setting up...' : 
                 currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              </span>
              {currentStep === steps.length - 1 ? (
                <Check className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Individual Step Components
function WelcomeStep({ formData, updateFormData }: any) {
  const [name, setName] = useState(formData.name || '');
  const [timezone, setTimezone] = useState(formData.timezone || 'UTC');

  React.useEffect(() => {
    updateFormData({ name, timezone });
  }, [name, timezone, updateFormData]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          What should we call you?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your preferred name"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
        </select>
      </div>
    </div>
  );
}

function HealthStep({ formData, updateFormData }: any) {
  const [trackingPreferences, setTrackingPreferences] = useState(
    formData.healthTracking || {
      mood: true,
      weight: false,
      exercise: true,
      sleep: true,
      water: true,
      medications: false,
    }
  );

  React.useEffect(() => {
    updateFormData({ healthTracking: trackingPreferences });
  }, [trackingPreferences, updateFormData]);

  const toggleTracking = (key: string) => {
    setTrackingPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const trackingOptions = [
    { key: 'mood', label: 'Daily Mood', description: 'Track your emotional well-being' },
    { key: 'weight', label: 'Weight', description: 'Monitor weight changes' },
    { key: 'exercise', label: 'Exercise', description: 'Log workouts and activities' },
    { key: 'sleep', label: 'Sleep', description: 'Track sleep patterns' },
    { key: 'water', label: 'Water Intake', description: 'Monitor hydration levels' },
    { key: 'medications', label: 'Medications', description: 'Set medication reminders' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Choose what health metrics you'd like to track:
      </p>
      
      {trackingOptions.map((option) => (
        <motion.div
          key={option.key}
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{option.label}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleTracking(option.key)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              trackingPreferences[option.key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <motion.div
              animate={{ x: trackingPreferences[option.key] ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
            />
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
}

function FinanceStep({ formData, updateFormData }: any) {
  const [monthlyIncome, setMonthlyIncome] = useState(formData.monthlyIncome || '');
  const [budgetCategories, setBudgetCategories] = useState(
    formData.budgetCategories || {
      'Food & Dining': 500,
      'Transportation': 300,
      'Entertainment': 200,
      'Shopping': 250,
      'Bills & Utilities': 400,
    }
  );

  React.useEffect(() => {
    updateFormData({ monthlyIncome, budgetCategories });
  }, [monthlyIncome, budgetCategories, updateFormData]);

  const updateBudget = (category: string, amount: number) => {
    setBudgetCategories(prev => ({
      ...prev,
      [category]: amount,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Monthly Income (Optional)
        </label>
        <input
          type="number"
          value={monthlyIncome}
          onChange={(e) => setMonthlyIncome(e.target.value)}
          placeholder="Enter your monthly income"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          Set Monthly Budget Limits
        </h4>
        <div className="space-y-4">
          {Object.entries(budgetCategories).map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {category}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => updateBudget(category, Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductivityStep({ formData, updateFormData }: any) {
  const [workingHours, setWorkingHours] = useState(
    formData.workingHours || { start: '09:00', end: '17:00' }
  );
  const [priorities, setPriorities] = useState(
    formData.priorities || ['Work', 'Health', 'Family', 'Learning']
  );

  React.useEffect(() => {
    updateFormData({ workingHours, priorities });
  }, [workingHours, priorities, updateFormData]);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          Working Hours
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={workingHours.start}
              onChange={(e) => setWorkingHours(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={workingHours.end}
              onChange={(e) => setWorkingHours(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          Life Priorities
        </h4>
        <div className="space-y-2">
          {priorities.map((priority, index) => (
            <div
              key={priority}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {index + 1}.
              </span>
              <span className="text-gray-900 dark:text-white">{priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RelationshipsStep({ formData, updateFormData }: any) {
  const [contactFrequency, setContactFrequency] = useState(
    formData.contactFrequency || 'weekly'
  );
  const [reminderTypes, setReminderTypes] = useState(
    formData.reminderTypes || {
      birthdays: true,
      anniversaries: true,
      regular_checkins: true,
      special_occasions: false,
    }
  );

  React.useEffect(() => {
    updateFormData({ contactFrequency, reminderTypes });
  }, [contactFrequency, reminderTypes, updateFormData]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Default Contact Frequency
        </label>
        <select
          value={contactFrequency}
          onChange={(e) => setContactFrequency(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          Reminder Preferences
        </h4>
        <div className="space-y-3">
          {Object.entries(reminderTypes).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300 capitalize">
                {key.replace('_', ' ')}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setReminderTypes(prev => ({ ...prev, [key]: !prev[key] }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <motion.div
                  animate={{ x: enabled ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                />
              </motion.button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LearningStep({ formData, updateFormData }: any) {
  const [learningGoals, setLearningGoals] = useState(
    formData.learningGoals || []
  );
  const [studyTime, setStudyTime] = useState(
    formData.studyTime || '30'
  );

  React.useEffect(() => {
    updateFormData({ learningGoals, studyTime });
  }, [learningGoals, studyTime, updateFormData]);

  const subjects = [
    'Technology', 'Business', 'Languages', 'Health & Fitness',
    'Arts & Creativity', 'Science', 'Personal Development', 'Finance'
  ];

  const toggleSubject = (subject: string) => {
    setLearningGoals(prev => 
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          What would you like to learn?
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((subject) => (
            <motion.button
              key={subject}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleSubject(subject)}
              className={`p-3 text-sm rounded-lg border transition-colors ${
                learningGoals.includes(subject)
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              {subject}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Daily Study Time (minutes)
        </label>
        <input
          type="number"
          value={studyTime}
          onChange={(e) => setStudyTime(e.target.value)}
          min="5"
          max="240"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
    </div>
  );
}

function CrisisStep({ formData, updateFormData }: any) {
  const [monitoringEnabled, setMonitoringEnabled] = useState(
    formData.monitoringEnabled ?? true
  );
  const [checkInFrequency, setCheckInFrequency] = useState(
    formData.checkInFrequency || '24'
  );
  const [emergencyContact, setEmergencyContact] = useState(
    formData.emergencyContact || { name: '', phone: '', relationship: '' }
  );

  React.useEffect(() => {
    updateFormData({ monitoringEnabled, checkInFrequency, emergencyContact });
  }, [monitoringEnabled, checkInFrequency, emergencyContact, updateFormData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">
            Enable Wellness Monitoring
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track stress levels and burnout risk
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMonitoringEnabled(!monitoringEnabled)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            monitoringEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <motion.div
            animate={{ x: monitoringEnabled ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
          />
        </motion.button>
      </div>

      {monitoringEnabled && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Check-in Frequency (hours)
            </label>
            <select
              value={checkInFrequency}
              onChange={(e) => setCheckInFrequency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="12">Every 12 hours</option>
              <option value="24">Daily</option>
              <option value="48">Every 2 days</option>
              <option value="72">Every 3 days</option>
            </select>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              Emergency Contact (Optional)
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={emergencyContact.name}
                onChange={(e) => setEmergencyContact(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={emergencyContact.phone}
                onChange={(e) => setEmergencyContact(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Relationship"
                value={emergencyContact.relationship}
                onChange={(e) => setEmergencyContact(prev => ({ ...prev, relationship: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}