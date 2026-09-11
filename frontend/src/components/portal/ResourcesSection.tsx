import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { sampleResourcesData } from '../../data/resourcesData';

export const ResourcesSection: React.FC = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<'All' | 'Patient' | 'Caregiver' | 'Clinical' | 'Language Pack'>('All');

  const filtered = activeCategory === 'All'
    ? sampleResourcesData
    : sampleResourcesData.filter((r) => r.category === activeCategory);

  return (
    <section id="resources-section" className="py-12 md:py-16 bg-slate-50 border-b border-slate-200">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 space-y-8">
        
        <div className="border-b border-slate-200 pb-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-govNavy-dark">
            {t('portal.resourcesBadge', 'Health Publications & Downloads')}
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mt-1">
            {t('portal.resourcesTitle', 'Health Resources Directory')}
          </h2>
          <p className="text-slate-600 text-sm md:text-base mt-1">
            {t('portal.resourcesSubtitle', 'Download official patient handbooks, caregiver memory garden setup guides, and clinical protocols.')}
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Patient', 'Caregiver', 'Clinical', 'Language Pack'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-govNavy text-white shadow-xs font-extrabold'
                  : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              {t(`portal.resourceCategory.${cat}`, cat === 'All' ? 'All Resources' : `${cat} Resources`)}
            </button>
          ))}
        </div>

        {/* Resource List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((res) => (
            <div key={res.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-govNavy-soft text-govNavy-dark font-extrabold text-[11px] rounded uppercase tracking-wider">
                    {t(`portal.resourceCategory.${res.category}`, res.category)} · {res.format}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{res.size}</span>
                </div>

                <h3 className="font-serif font-bold text-lg text-slate-900">
                  {t(`portal.resources.${res.id}.title`, res.title)}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {t(`portal.resources.${res.id}.desc`, res.description)}
                </p>

                <p className="text-[11px] font-semibold text-slate-500 pt-1">
                  {t('portal.languagesLabel', 'Languages')}: {res.language}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button className="bg-govNavy text-white hover:bg-govNavy-light px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer">
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('portal.downloadResource', 'Download Resource')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
