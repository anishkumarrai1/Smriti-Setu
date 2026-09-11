import React from 'react';
import { Type, Sliders, Sparkles } from 'lucide-react';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';
import { useTranslation } from 'react-i18next';

export const AccessibilityControls: React.FC = () => {
  const { t } = useTranslation();
  const {
    fontSizeScale,
    reducedMotion,
    setFontSizeScale,
    toggleReducedMotion,
  } = useAccessibilityStore();

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-gov space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Sliders className="w-5 h-5 text-govNavy" />
        <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
          Elderly & Cognitive Accessibility Preferences <Sparkles className="w-4 h-4 text-amber-500" />
        </h3>
      </div>

      <div className="max-w-md text-xs font-semibold">
        {/* Reduced Motion */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Accessibility Motion Controls</span>
          <button
            onClick={toggleReducedMotion}
            className={`w-full py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
              reducedMotion
                ? 'bg-govNavy text-white border-govNavy-dark font-extrabold'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>{reducedMotion ? 'Reduced Motion On' : 'Standard Motion'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
