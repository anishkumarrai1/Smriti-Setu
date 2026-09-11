import React from 'react';
import { Sparkles, Type } from 'lucide-react';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';
import { useTranslation } from 'react-i18next';

export const AccessibilityToolbar: React.FC = () => {
  const { t } = useTranslation();
  const { elderlyMode, toggleElderlyMode } = useAccessibilityStore();

  return (
    <div className="bg-forest-950 text-ivory-100 py-1.5 px-4 text-xs font-medium border-b border-forest-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        <div className="flex items-center gap-2 text-ivory-300 font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>SMRITI-SETU Cognitive Assistance Node</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Elderly Mode Toggle */}
          <button
            onClick={toggleElderlyMode}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              elderlyMode
                ? 'bg-gold-500 text-charcoal-900 font-bold shadow-xs'
                : 'bg-forest-900 hover:bg-forest-800 text-ivory-200'
            }`}
          >
            <Type className="w-3 h-3" />
            {elderlyMode ? t('accessibility.elderlyModeActive') : t('accessibility.elderlyMode')}
          </button>
        </div>

      </div>
    </div>
  );
};
