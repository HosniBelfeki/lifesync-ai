import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastContainer, useToast } from './components/common/NotificationToast';
import { PageLoader } from './components/common/LoadingSpinner';
import { AuthForm } from './components/auth/AuthForm';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { ModuleGrid } from './components/dashboard/ModuleGrid';
import { AIChat } from './components/ai/AIChat';
import { Settings } from './components/Settings';
import { TasksView } from './components/views/TasksView';
import { HealthView } from './components/views/HealthView';
import { FinanceView } from './components/views/FinanceView';
import { RelationshipsView } from './components/views/RelationshipsView';
import { LearningView } from './components/views/LearningView';
import { CrisisView } from './components/views/CrisisView';
import { supabase } from './lib/supabase';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    if (user && !loading) {
      checkOnboardingStatus();
    } else if (!user && !loading) {
      // Reset states when user logs out
      setShowOnboarding(false);
      setCheckingOnboarding(false);
    }
  }, [user, loading]);

  // Listen for hash changes to handle AI chat navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the #
      if (hash === 'ai-chat') {
        setActiveView('ai-chat');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Check initial hash
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    
    setCheckingOnboarding(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking onboarding status:', error);
        // If there's an error, assume onboarding is needed
        setShowOnboarding(true);
      } else {
        // If no profile exists or onboarding not completed, show onboarding
        setShowOnboarding(!data?.onboarding_completed);
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      // Default to showing onboarding on error
      setShowOnboarding(true);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Show loading only when auth is loading or we're checking onboarding
  if (loading || (user && checkingOnboarding)) {
    return <PageLoader />;
  }

  // If no user, show auth form
  if (!user) {
    return <AuthForm />;
  }

  // If user exists but onboarding not completed, show onboarding
  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  // Main app interface
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'modules':
        return <ModuleGrid />;
      case 'ai-chat':
        return <AIChat />;
      case 'settings':
        return <Settings />;
      case 'tasks':
        return <TasksView />;
      case 'health':
        return <HealthView />;
      case 'finance':
        return <FinanceView />;
      case 'relationships':
        return <RelationshipsView />;
      case 'learning':
        return <LearningView />;
      case 'crisis':
        return <CrisisView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <TranslationProvider>
            <AppContent />
          </TranslationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;