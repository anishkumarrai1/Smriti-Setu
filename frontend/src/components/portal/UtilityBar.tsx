import React from 'react';
import { PhoneCall, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';
import { useLanguageStore, SupportedLanguage } from '../../stores/useLanguageStore';
import { IndianFlagBadge } from '../common/GovEmblem';

export const UtilityBar: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage, availableLanguages, setLanguage } = useLanguageStore();
  const { fontSizeScale, setFontSizeScale } = useAccessibilityStore();

  return (
    <div className="bg-[#0B3B60] text-white py-1.5 border-b border-blue-950 sticky top-0 z-50 shadow-xs">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
        
        {/* Left: Indian Government & Ministry Identity */}
        <div className="flex items-center gap-3">
          <IndianFlagBadge />
          <span className="hidden md:inline text-slate-200 font-extrabold text-[11px] border-l border-slate-500 pl-3">
            {t('portal.nationalHealthMission', { defaultValue: 'National Health Mission — North Eastern Region Cognitive Health Ecosystem' })}
          </span>
        </div>

        {/* Right: Helplines & Official Language Selector */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          
          {/* Toll-Free Helplines */}
          <div className="hidden lg:flex items-center gap-2 text-amber-300 font-extrabold text-xs bg-[#004085] px-2.5 py-1 rounded-md border border-slate-500">
            <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('portal.healthHelpline', { defaultValue: 'Healthcare Helpline: 14567 / 14416 (Toll Free 24x7)' })}</span>
          </div>

          {/* Official Language Selector Dropdown */}
          <div className="relative inline-flex items-center bg-[#004085] px-2.5 py-1 rounded-md border border-slate-500 text-xs font-extrabold text-amber-300 shadow-xs">
            <Globe className="w-3.5 h-3.5 text-amber-300 mr-1.5 shrink-0" />
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-bold text-xs pr-1"
              aria-label={t('common.selectLanguage', { defaultValue: 'Select Language' })}
            >
              {availableLanguages.map((l) => (
                <option key={l.code} value={l.code} className="text-slate-900 bg-white font-bold">
                  {l.nativeLabel}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>
    </div>
  );
};
