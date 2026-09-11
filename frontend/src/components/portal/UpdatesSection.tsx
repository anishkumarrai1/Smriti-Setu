import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Calendar, ArrowRight } from 'lucide-react';
import { sampleUpdatesData } from '../../data/updatesData';

export const UpdatesSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="updates-section" className="py-12 md:py-16 bg-white border-b border-slate-200">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 space-y-8">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-govNavy-dark flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-govNavy" /> {t('portal.officialBulletins', 'Official Bulletins')}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mt-1">
              {t('portal.latestNoticesTitle', 'Latest Updates & Notices')}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleUpdatesData.map((upd) => (
            <div key={upd.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  upd.isUrgent ? 'bg-red-100 text-red-700' : 'bg-govNavy-soft text-govNavy-dark'
                }`}>
                  {t(`portal.updates.${upd.id}.cat`, upd.category)}
                </span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {upd.date}
                </span>
              </div>

              <h3 className="font-serif font-bold text-base text-slate-900 leading-snug">
                {t(`portal.updates.${upd.id}.title`, upd.title)}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {t(`portal.updates.${upd.id}.summary`, upd.summary)}
              </p>

              <div className="pt-2 flex justify-end">
                <button className="text-xs font-extrabold text-govNavy hover:underline flex items-center gap-1 cursor-pointer">
                  {t('portal.readAnnouncement', 'Read Announcement')} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
