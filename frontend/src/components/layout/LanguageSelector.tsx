import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Volume2 } from 'lucide-react';
import { languages, getLanguageByCode } from '../../i18n/languages';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';
import { LanguageSelectorModal } from '../common/LanguageSelectorModal';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const { elderlyMode } = useAccessibilityStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeCode = i18n.language || 'en';
  const currentLangObj = getLanguageByCode(activeCode);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    if (code === 'MORE_MODAL') {
      setIsModalOpen(true);
    } else {
      i18n.changeLanguage(code);
    }
  };

  return (
    <>
      <div className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 p-1.5 px-3 rounded-full border border-slate-300 transition-all shadow-xs">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-slate-900 hover:text-forest-800 transition-colors cursor-pointer"
          title="Browse All 8 NER State Languages"
        >
          <Globe className="w-4 h-4 text-forest-700" />
          <span className="font-serif font-bold text-sm text-slate-900">
            {currentLangObj.nativeName}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-forest-100 text-forest-800 font-extrabold hidden sm:inline border border-forest-200">
            {currentLangObj.state}
          </span>
        </button>

        <select
          value={activeCode}
          onChange={handleSelectChange}
          aria-label="Select Regional Language"
          className={`bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-1 border-l border-slate-300 pl-1.5 ${
            elderlyMode ? 'text-sm' : 'text-xs'
          }`}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-white text-slate-900 font-medium">
              {lang.nativeName} ({lang.name})
            </option>
          ))}
          <option value="MORE_MODAL" className="bg-forest-50 text-forest-900 font-bold">
            🌐 Browse All NER State Languages...
          </option>
        </select>
      </div>

      <LanguageSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default LanguageSelector;
