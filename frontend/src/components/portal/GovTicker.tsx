import React from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const GovTicker: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-[#FAF3E5] border-y border-[#C89B3C]/40 py-2 flex items-center overflow-hidden">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 flex items-center gap-3 text-xs font-semibold">
        
        {/* Yellow Latest Updates Badge */}
        <div className="bg-[#004085] text-white px-3 py-1 rounded-md font-extrabold flex items-center gap-1.5 shrink-0 shadow-xs uppercase tracking-wider text-[11px]">
          <Bell className="w-3.5 h-3.5 text-amber-300" />
          <span>{t('portal.govtCirculars', { defaultValue: 'Govt Circulars & Notices' })}</span>
        </div>

        {/* Scrolling News Marquee Text */}
        <div className="overflow-hidden relative flex-1 text-slate-900 font-medium">
          <div className="animate-marquee whitespace-nowrap space-x-12">
            <span>
              {t('portal.circular1', { defaultValue: '📋 Ref No. Z.28015/01/2026-NPHCE (01/09/2026): Deployment of Smriti-Setu AI Cognitive Assessment Module in 65 District Hospitals across 8 NER States.' })}
            </span>
            <span>
              {t('portal.circular2', { defaultValue: '☎️ Tele-MANAS & Elder Line (Toll-Free 14416 / 14567): 24x7 Multilingual Geriatric Mental Health Counseling active in Assamese, Bengali, Khasi, Mizo & Hindi.' })}
            </span>
            <span>
              {t('portal.circular3', { defaultValue: '🆔 ABDM Integration: Link your 14-digit ABHA Health ID for seamless cognitive health record tracking at AIIMS Guwahati, NEIGRIHMS Shillong & RIMS Imphal.' })}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
