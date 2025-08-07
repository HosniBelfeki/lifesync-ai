import React from 'react';
import { useTranslation } from '../../contexts/TranslationContext';

interface TranslatedTextProps {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function TranslatedText({ 
  text, 
  className = '', 
  as: Component = 'span'
}: TranslatedTextProps) {
  const { translate } = useTranslation();
  const translatedText = translate(text);

  return (
    <Component className={className}>
      {translatedText}
    </Component>
  );
}

// Hook for translating text in components
export function useTranslatedText(text: string): string {
  const { translate } = useTranslation();
  return translate(text);
}