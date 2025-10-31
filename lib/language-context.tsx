'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'EN' | 'RU';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Словарь переводов
const translations = {
  EN: {
    home: 'Home',
    features: 'Features',
    pricing: 'Pricing',
    help: 'Help',
    about: 'About',
    signIn: 'Sign In',
    startFreeTrial: 'Start Free Trial',
    dashboard: 'Dashboard',
    signOut: 'Sign Out',
    settings: 'Settings',
  },
  RU: {
    home: 'Главная',
    features: 'Возможности',
    pricing: 'Тарифы',
    help: 'Помощь',
    about: 'О нас',
    signIn: 'Войти',
    startFreeTrial: 'Начать бесплатно',
    dashboard: 'Панель',
    signOut: 'Выйти',
    settings: 'Настройки',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('EN');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage === 'EN' || savedLanguage === 'RU') {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.EN] || key;
  };

  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
