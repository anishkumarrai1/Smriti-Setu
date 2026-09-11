import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { VoiceButton } from '../common/VoiceButton';

interface HeroProps {
  onFindFacility: () => void;
  onExploreServices: () => void;
  onSearchSubmit: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onFindFacility,
  onExploreServices,
  onSearchSubmit,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchSubmit(query);
    }
  };

  return (
    <div className="bg-slate-50 border-b border-slate-200 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* Main Grid Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-govNavy-soft text-govNavy-dark text-xs font-extrabold border border-blue-200">
              <ShieldCheck className="w-4 h-4 text-govNavy" />
              <span>{t('portal.officialGateway', 'Official Healthcare Gateway · North Eastern Region')}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-slate-900 leading-tight">
              {t('portal.publicPortalTitle', 'Public Healthcare Portal & Cognitive Care Services')}
            </h1>

            <p className="text-slate-700 text-base md:text-lg leading-relaxed font-medium">
              {t('portal.heroDescription', 'Connecting citizens across Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura with official government hospitals, primary health centers, and Smriti-Setu memory care assistance.')}
            </p>

            {/* Voice Audio Read Button */}
            <div className="pt-1">
              <VoiceButton 
                textToSpeak={t('portal.heroAudioSpeech', 'Welcome to the North Eastern Region Cognitive Health Portal. Search public government hospitals, explore healthcare services, and access Smriti-Setu cognitive care.')}
                label={t('portal.listenIntro', 'Listen to Audio Introduction')}
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onFindFacility}
                className="bg-govNavy text-white hover:bg-govNavy-light px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-govYellow" />
                <span>{t('portal.findHospitals', 'Find Government Hospitals')}</span>
                <ArrowRight className="w-4 h-4 text-govYellow" />
              </button>

              <button
                onClick={onExploreServices}
                className="bg-white text-govNavy hover:bg-slate-100 border-2 border-govNavy px-6 py-3 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center gap-2"
              >
                <span>{t('portal.exploreServices', 'Explore Health Services')}</span>
              </button>
            </div>
          </div>

          {/* Right Visual Image Frame */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden shadow-banner border-4 border-white bg-slate-900 h-72 md:h-96 relative group">
              <img
                src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1000&q=80"
                alt="North East India Senior Citizen Dementia & Cognitive Care"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex items-end p-6 text-white">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-300" /> {t('portal.seniorCareNode', 'Regional Senior Care Node · North East India')}
                  </span>
                  <p className="font-serif font-bold text-base md:text-lg">
                    {t('portal.aiDementiaMission', 'Smriti-Setu AI Dementia Screening & Memory Recall Mission')}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
