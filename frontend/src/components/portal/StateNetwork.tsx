import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, ArrowRight, Compass, CheckCircle2 } from 'lucide-react';
import { nerStatesData } from '../../data/statesData';
import { NERState } from '../../types/govPortal';

interface StateNetworkProps {
  onSelectStateFilter: (stateName: string) => void;
}

export const StateNetwork: React.FC<StateNetworkProps> = ({ onSelectStateFilter }) => {
  const { t } = useTranslation();
  const [activeState, setActiveState] = useState<NERState>(nerStatesData[0]);

  return (
    <section id="network-section" className="py-12 md:py-16 bg-slate-50 border-b border-slate-200">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-govNavy-dark flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-govNavy" /> {t('portal.networkBadge', 'Regional Healthcare Network')}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mt-1">
              {t('portal.networkTitle', 'North Eastern Region Health Network')}
            </h2>
            <p className="text-slate-600 text-sm md:text-base mt-1">
              {t('portal.networkSubtitle', 'Interactive healthcare map and facility directory across the eight North Eastern States of India.')}
            </p>
          </div>
        </div>

        {/* State Selector Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {nerStatesData.map((st) => {
            const isSelected = activeState.code === st.code;
            return (
              <button
                key={st.code}
                onClick={() => setActiveState(st)}
                className={`p-3 rounded-2xl font-bold text-xs transition-all text-center border flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-govNavy text-white border-govNavy-dark shadow-gov font-extrabold ring-2 ring-govYellow'
                    : 'bg-white text-slate-800 hover:bg-slate-100 border-slate-300'
                }`}
              >
                <MapPin className={`w-4 h-4 ${isSelected ? 'text-govYellow' : 'text-slate-500'}`} />
                <span>{st.name}</span>
                <span className={`text-[10px] font-semibold ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                  {st.districtsCount} {t('portal.districtsLabel', 'Districts')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected State Card */}
        <div className="bg-white rounded-3xl border border-slate-300 p-6 md:p-10 shadow-gov grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-govNavy-soft text-govNavy-dark font-extrabold text-xs rounded-md uppercase tracking-wider">
                {t('portal.stateCapital', 'State Capital')}: {activeState.capital}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {t('portal.primaryLang', 'Primary Languages')}: {activeState.primaryLanguage}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-serif font-bold text-slate-900">
                {activeState.name} {t('portal.infraTitle', 'Health Services Infrastructure')}
              </h3>
              <p className="text-slate-700 text-sm md:text-base leading-relaxed">
                {t(`portal.stateDesc.${activeState.code}`, activeState.description)}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-2xl font-extrabold text-govNavy block">{activeState.districtsCount}</span>
                <span className="text-xs font-semibold text-slate-600 uppercase">{t('portal.districts', 'Districts')}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-2xl font-extrabold text-govNavy block">{activeState.totalFacilities}</span>
                <span className="text-xs font-semibold text-slate-600 uppercase">{t('portal.healthUnits', 'Health Units')}</span>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                <span className="text-2xl font-extrabold text-amber-900 block">{activeState.cognitiveCareNodes}</span>
                <span className="text-xs font-bold text-amber-800 uppercase">{t('portal.cognitiveNodes', 'Cognitive Nodes')}</span>
              </div>
            </div>

            {/* Major District Centers */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('portal.majorCenters', 'Major District Centers')}:</span>
              <div className="flex flex-wrap items-center gap-2">
                {activeState.districts.map((d) => (
                  <span key={d} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <button
                onClick={() => onSelectStateFilter(activeState.name)}
                className="bg-govNavy text-white hover:bg-govNavy-light px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              >
                <span>{t('portal.browseFacilitiesIn', 'Browse Health Facilities in')} {activeState.name}</span>
                <ArrowRight className="w-4 h-4 text-govYellow" />
              </button>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden shadow-banner border-4 border-white bg-slate-900 h-80 lg:h-96 relative flex items-center justify-center p-6 text-white text-center">
              
              <img
                src={activeState.imageUrl}
                alt={activeState.name}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              <div className="relative z-10 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-govYellow text-slate-950 flex items-center justify-center mx-auto shadow-md">
                  <MapPin className="w-7 h-7" />
                </div>

                <h4 className="font-serif font-bold text-2xl text-white">{activeState.name} {t('portal.regionalNode', 'Regional Node')}</h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  {t('portal.connectedNhm', 'Connected to National Health Mission & Ayushman Bharat Tele-Health Gateway.')}
                </p>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t('portal.teleCareActive', 'Regional Tele-Care Active')}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
