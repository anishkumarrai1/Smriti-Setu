import { create } from 'zustand';
import i18n from '../i18n/i18n';
import { languages, LanguageConfig, getLanguageByCode } from '../i18n/languages';

export type SupportedLanguage = string;

interface LanguageState {
  currentLanguage: string;
  availableLanguages: LanguageConfig[];
  setLanguage: (langCode: string) => void;
}

const initialLang = localStorage.getItem('smriti_setu_language') || i18n.language || 'en';

export const useLanguageStore = create<LanguageState>((set) => ({
  currentLanguage: initialLang,
  availableLanguages: languages,
  setLanguage: (langCode: string) => {
    i18n.changeLanguage(langCode);
    set({ currentLanguage: langCode });
  },
}));
