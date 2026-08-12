import React, { createContext, useState, useContext } from 'react';
import en from '../translations/en.json';
import gu from '../translations/gu.json';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Default ENGLISH as requested by user
  const [lang, setLang] = useState('en');

  const translations = lang === 'gu' ? gu : en;

  const t = (key) => {
    return translations[key] || en[key] || key;
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'gu' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ lang, language: lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
