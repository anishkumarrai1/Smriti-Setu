import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, X, Check, Volume2, Search, MapPin } from 'lucide-react';
import { languages, NER_STATES, NERStateName, LanguageConfig, getLanguageByCode } from '../../i18n/languages';
import { speakText } from '../../utils/speech';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({ isOpen, onClose }) => {
  const { i18n, t } = useTranslation();
  const [selectedStateTab, setSelectedStateTab] = useState<NERStateName | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const activeCode = i18n.language || 'en';

  const filteredLanguages = languages.filter((lang) => {
    const matchesState = selectedStateTab === 'All' || lang.state === selectedStateTab;
    const matchesSearch =
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesSearch;
  });

  const handleSelectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    onClose();
  };

  const handleSpeakSample = (e: React.MouseEvent, lang: LanguageConfig) => {
    e.stopPropagation();
    speakText(`This is ${lang.name}, ${lang.nativeName}`, lang.code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-photo border border-ivory-300 dark:border-slate-800 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-forest-800 via-forest-900 to-charcoal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
              <Globe className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold tracking-tight">
                {t('common.selectLanguage', 'Select Regional Language')}
              </h2>
              <p className="text-xs text-ivory-200">
                {t('statePortal', 'North-East India (NER) Multilingual Platform')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            aria-label="Close language modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-ivory-50 dark:bg-slate-850 border-b border-ivory-200 dark:border-slate-800">
          <div className="relative max-w-md mx-auto">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search English, Assamese, Bodo, Manipuri, Mizo, Bengali, Kokborok, Nepali..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-ivory-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm font-medium"
            />
          </div>
        </div>

        {/* State Filter Tabs */}
        <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-ivory-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setSelectedStateTab('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedStateTab === 'All'
                ? 'bg-forest-800 text-white shadow-soft'
                : 'bg-ivory-100 text-charcoal-700 hover:bg-ivory-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All Languages
          </button>
          {NER_STATES.map((stateName) => (
            <button
              key={stateName}
              onClick={() => setSelectedStateTab(stateName)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedStateTab === stateName
                  ? 'bg-forest-800 text-white shadow-soft'
                  : 'bg-ivory-100 text-charcoal-700 hover:bg-ivory-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {stateName}
            </button>
          ))}
        </div>

        {/* Language Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredLanguages.length === 0 ? (
            <div className="col-span-full py-12 text-center text-charcoal-500">
              <p className="text-base font-semibold">No matching NER languages found.</p>
              <p className="text-xs mt-1">Try searching by state or script name.</p>
            </div>
          ) : (
            filteredLanguages.map((lang) => {
              const isSelected = activeCode === lang.code;

              return (
                <div
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`relative group p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isSelected
                      ? 'bg-forest-50 dark:bg-forest-950/40 border-forest-600 dark:border-forest-500 shadow-md ring-2 ring-forest-600/30'
                      : 'bg-white dark:bg-slate-800 border-ivory-300 dark:border-slate-700 hover:border-forest-600 dark:hover:border-forest-500 hover:shadow-soft'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-forest-800 dark:text-forest-400 bg-forest-100 dark:bg-forest-900/50 px-2 py-0.5 rounded-md mb-2">
                        <MapPin className="w-3 h-3" /> {lang.state}
                      </span>
                      <h3 className="text-xl font-serif font-bold text-charcoal-900 dark:text-white group-hover:text-forest-800 dark:group-hover:text-forest-400 transition-colors">
                        {lang.nativeName}
                      </h3>
                      <p className="text-xs text-charcoal-600 dark:text-slate-300 font-medium">
                        {lang.name}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-7 h-7 rounded-full bg-forest-800 text-white flex items-center justify-center shadow-soft">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-ivory-200 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-charcoal-500 dark:text-slate-400 font-mono">
                      {lang.code.toUpperCase()}
                    </span>
                    <button
                      onClick={(e) => handleSpeakSample(e, lang)}
                      title={`Listen sample in ${lang.name}`}
                      className="p-1.5 rounded-lg text-forest-700 hover:bg-forest-100 dark:text-forest-400 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-ivory-100 dark:bg-slate-800 border-t border-ivory-200 dark:border-slate-700 flex items-center justify-between text-xs text-charcoal-600 dark:text-slate-300">
          <span>Active Selection: <strong>{getLanguageByCode(activeCode).nativeName} ({getLanguageByCode(activeCode).name})</strong></span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-forest-800 text-white font-bold hover:bg-forest-900 transition-colors cursor-pointer shadow-soft"
          >
            {t('common.confirm', 'Done')}
          </button>
        </div>

      </div>
    </div>
  );
};
