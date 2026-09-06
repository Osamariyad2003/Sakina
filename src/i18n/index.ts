import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';
import { getPersistedLanguage } from './rtl';

/**
 * Arabic is the source language (spec §9) — fallbackLng and the default
 * are both 'ar', never 'en'.
 */
i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: getPersistedLanguage(),
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
