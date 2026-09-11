import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  Heart, 
  Activity, 
  UserCheck, 
  PhoneCall, 
  FileText, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { sampleHealthServicesData } from '../../data/healthServicesData';

interface ServiceExplorerProps {
  onSelectService: (serviceId: string) => void;
}

export const ServiceExplorer: React.FC<ServiceExplorerProps> = ({ onSelectService }) => {
  const { t } = useTranslation();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-6 h-6" />;
      case 'Heart': return <Heart className="w-6 h-6" />;
      case 'Activity': return <Activity className="w-6 h-6" />;
      case 'UserCheck': return <UserCheck className="w-6 h-6" />;
      case 'PhoneCall': return <PhoneCall className="w-6 h-6" />;
      case 'FileText': return <FileText className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  return (
    <section id="services-section" className="py-12 md:py-16 bg-white border-b border-slate-200">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-govNavy-dark">
              {t('portal.regionalServicesBadge', 'Regional Health Services')}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mt-1">
              {t('portal.servicesDirectoryTitle', 'Public Health Services Directory')}
            </h2>
            <p className="text-slate-600 text-sm md:text-base mt-1">
              {t('portal.servicesDirectorySubtitle', 'Discover outpatient clinics, emergency hospitals, mental health helplines, and digital cognitive care programs.')}
            </p>
          </div>
        </div>

        {/* Asymmetric Visual Hierarchy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleHealthServicesData.map((srv) => (
            <div
              key={srv.id}
              onClick={() => onSelectService(srv.id)}
              className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group ${
                srv.featured
                  ? 'bg-gradient-to-br from-govNavy-dark to-govNavy text-white border-govNavy-dark shadow-banner hover:scale-[1.02]'
                  : 'bg-slate-50 hover:bg-white text-slate-900 border-slate-200 shadow-xs hover:border-govNavy hover:shadow-gov'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${srv.featured ? 'bg-govYellow text-slate-950' : 'bg-govNavy-soft text-govNavy'}`}>
                    {getIcon(srv.iconName)}
                  </div>
                  {srv.featured && (
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {t('portal.priorityService', 'Priority Service')}
                    </span>
                  )}
                </div>

                <span className={`text-xs font-bold uppercase tracking-wider ${srv.featured ? 'text-amber-300' : 'text-govNavy'}`}>
                  {t(`portal.services.${srv.id}.category`, srv.category)}
                </span>

                <h3 className={`font-serif font-bold text-xl ${srv.featured ? 'text-white' : 'text-slate-900'}`}>
                  {t(`portal.services.${srv.id}.title`, srv.title)}
                </h3>

                <p className={`text-sm leading-relaxed ${srv.featured ? 'text-slate-200' : 'text-slate-600'}`}>
                  {t(`portal.services.${srv.id}.desc`, srv.description)}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/40 flex items-center justify-between">
                <span className={`text-xs font-bold ${srv.featured ? 'text-govYellow' : 'text-govNavy'}`}>
                  {t(`portal.services.${srv.id}.action`, srv.actionLabel)}
                </span>
                <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${
                  srv.featured ? 'text-govYellow' : 'text-govNavy'
                }`} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
