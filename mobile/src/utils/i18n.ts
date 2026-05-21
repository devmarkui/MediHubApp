import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../../assets/translations/en.json';
import si from '../../assets/translations/si.json';
import ta from '../../assets/translations/ta.json';

import type { Language } from '@/types/models';

const resources = {
  en: { translation: en },
  si: { translation: si },
  ta: { translation: ta },
} as const;

function pickInitialLanguage(): Language {
  const tag = Localization.getLocales()[0]?.languageCode?.toLowerCase() ?? 'en';
  if (tag === 'si') return 'si';
  if (tag === 'ta') return 'ta';
  return 'en';
}

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources,
  lng: pickInitialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setLanguage(lang: Language): void {
  void i18n.changeLanguage(lang);
}

export default i18n;
