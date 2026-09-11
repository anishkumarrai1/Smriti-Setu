import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Heart, 
  UserCheck, 
  Stethoscope, 
  ArrowRight, 
  Lock, 
  BrainCircuit
} from 'lucide-react';

interface SmritiSetuSectionProps {
  onAccessPlatform: () => void;
}

export const SmritiSetuSection: React.FC<SmritiSetuSectionProps> = ({ onAccessPlatform }) => {
  const { t } = useTranslation();

  return (
    <section id="smriti-setu-section" className="py-14 md:py-20 bg-gradient-to-br from-govNavy-dark via-govNavy to-blue-900 text-white border-b border-slate-800">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-govYellow text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-xs">
            <Heart className="w-3.5 h-3.5 fill-slate-950" /> {t('portal.featuredMission', 'Featured Mission Platform')}
          </span>

          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
            SMRITI-SETU
          </h2>

          <p className="text-amber-300 font-serif text-lg md:text-xl italic">
            "{t('tagline', 'Connecting memories, families and care.')}"
          </p>

          <p className="text-slate-200 text-sm md:text-base leading-relaxed font-sans pt-2">
            {t('portal.smritiSetuDesc', 'A multilingual cognitive assistance platform designed to support senior citizens experiencing memory and cognitive difficulties, alongside primary family caregivers and attending healthcare clinicians.')}
          </p>
        </div>

        {/* Visual Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          
          {/* Step 1: Patient */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden text-center flex flex-col justify-between group">
            <div className="h-32 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80" 
                alt="Senior Citizen Patient from North East India"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-slate-950/40" />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5" />
              </div>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-serif font-bold text-lg text-white">1. {t('portal.patientPortalTitle', 'Patient Portal')}</h3>
              <p className="text-slate-200 text-xs leading-relaxed">
                {t('portal.patientPortalDesc', 'Warm greeting, large typography, audio guidance, and peaceful memory exercises tailored for NER elders.')}
              </p>
            </div>
          </div>

          {/* Step 2: Cognitive Care */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden text-center flex flex-col justify-between group">
            <div className="h-32 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80" 
                alt="Adaptive Cognitive Memory Care Activities"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-slate-950/40" />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-emerald-400 text-slate-950 rounded-xl flex items-center justify-center shadow-md">
                <BrainCircuit className="w-5 h-5" />
              </div>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-serif font-bold text-lg text-white">2. {t('portal.aiCognitiveCareTitle', 'AI Cognitive Care')}</h3>
              <p className="text-slate-200 text-xs leading-relaxed">
                {t('portal.aiCognitiveCareDesc', 'Interactive games with automatic difficulty scaling, spatial recall, and picture recognition.')}
              </p>
            </div>
          </div>

          {/* Step 3: Caregiver */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden text-center flex flex-col justify-between group">
            <div className="h-32 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=600&q=80" 
                alt="Family Caregiver Memory Garden Timeline"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-slate-950/40" />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-400 text-slate-950 rounded-xl flex items-center justify-center shadow-md">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-serif font-bold text-lg text-white">3. {t('portal.caregiverSupportTitle', 'Caregiver Support')}</h3>
              <p className="text-slate-200 text-xs leading-relaxed">
                {t('portal.caregiverSupportDesc', 'Memory Garden photo timelines, medicine reminders, and real-time engagement alerts for families.')}
              </p>
            </div>
          </div>

          {/* Step 4: Clinician */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden text-center flex flex-col justify-between group">
            <div className="h-32 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80" 
                alt="Clinician Dementia Screening Analytics"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-slate-950/40" />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center shadow-md">
                <Stethoscope className="w-5 h-5" />
              </div>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-serif font-bold text-lg text-white">4. {t('portal.clinicianInsightsTitle', 'Clinician Insights')}</h3>
              <p className="text-slate-200 text-xs leading-relaxed">
                {t('portal.clinicianInsightsDesc', 'Session trends, response time metrics, and AI-assisted cognitive decline screening reports.')}
              </p>
            </div>
          </div>

        </div>

        {/* Access Platform CTA */}
        <div className="text-center pt-4">
          <button
            onClick={onAccessPlatform}
            className="bg-govYellow text-slate-950 hover:bg-govYellow-dark px-8 py-4 rounded-2xl font-extrabold text-base md:text-lg shadow-banner transition-all transform hover:scale-105 inline-flex items-center gap-3 cursor-pointer"
          >
            <Lock className="w-5 h-5 text-slate-950" />
            <span>{t('portal.accessPlatformBtn', 'Access Smriti-Setu Authenticated Platform')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
};
