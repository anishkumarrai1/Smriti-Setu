import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './translations';
import { getLanguageByCode, getFallbackChain } from './languages';
import { forceTranslateString, runForceDOMTranslation } from './forceTranslateEngine';

const SAVED_LANG_KEY = 'smriti_setu_language';
const initialLang = localStorage.getItem(SAVED_LANG_KEY) || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: (code: string) => getFallbackChain(code),
    interpolation: {
      escapeValue: false, // React escapes values automatically
    },
    saveMissing: true,
    missingKeyHandler: (lngs, ns, key, fallbackValue) => {
      console.warn(`[MISSING TRANSLATION] ${lngs.join(',')}.${key}`);
    },
    react: {
      useSuspense: false,
    },
  });

// Wrap t function for automatic dynamic fallback force translation
const originalT = i18n.t.bind(i18n);
(i18n as any).t = (key: string, options?: any) => {
  const primaryResult = originalT(key, options);
  // If result equals key or contains untranslated English text for a non-English language, run forceTranslateString
  const currentLng = i18n.language || 'en';
  if (currentLng !== 'en') {
    if (primaryResult === key || typeof primaryResult !== 'string') {
      const fallbackDefault = typeof options === 'string' ? options : options?.defaultValue || key;
      return forceTranslateString(fallbackDefault, currentLng);
    }
    return forceTranslateString(primaryResult, currentLng);
  }
  return primaryResult;
};

// Apply document level direction and language attributes on language changes
i18n.on('languageChanged', (lng: string) => {
  localStorage.setItem(SAVED_LANG_KEY, lng);
  const langConfig = getLanguageByCode(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = langConfig.direction || 'ltr';

  // Force DOM translation update asynchronously
  setTimeout(() => {
    runForceDOMTranslation();
  }, 50);
});

// Sync initial HTML attributes
const activeLangConfig = getLanguageByCode(initialLang);
document.documentElement.lang = initialLang;
document.documentElement.dir = activeLangConfig.direction || 'ltr';

export default i18n;
