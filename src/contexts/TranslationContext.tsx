import React, { createContext, useContext, useEffect, useState } from 'react';
import { translationService, loadLanguagePreference, saveLanguagePreference, SUPPORTED_LANGUAGES, SupportedLanguage } from '../lib/translation';

interface TranslationContextType {
  currentLanguage: string;
  translate: (text: string, targetLanguage?: string) => string;
  changeLanguage: (language: string) => void;
  supportedLanguages: SupportedLanguage[];
  t: (text: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Load user's language preference on mount
    loadLanguagePreference().then(language => {
      setCurrentLanguage(language);
      translationService.setCurrentLanguage(language);
    });
  }, []);

  const translate = (text: string, targetLanguage?: string): string => {
    if (!text || !text.trim()) return text;
    return translationService.translateText(text, targetLanguage);
  };

  const changeLanguage = (language: string) => {
    setCurrentLanguage(language);
    translationService.setCurrentLanguage(language);
    saveLanguagePreference(language);
  };

  // Shorthand translation function
  const t = (text: string): string => {
    return translate(text);
  };

  const value = {
    currentLanguage,
    translate,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    t,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}