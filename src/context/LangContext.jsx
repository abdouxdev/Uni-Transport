import React, { createContext, useContext, useState, useEffect } from 'react';
import { en, fr, ar } from '../i18n/translations';

const langs = { en, fr, ar };
const LangContext = createContext(null);
export const useLang = () => useContext(LangContext);

export function LangProvider({ children }) {
  const [locale, setLocale] = useState(() => localStorage.getItem('lang') || 'fr');
  const t = langs[locale] || langs.fr;

  useEffect(() => {
    localStorage.setItem('lang', locale);
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LangContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LangContext.Provider>
  );
}
