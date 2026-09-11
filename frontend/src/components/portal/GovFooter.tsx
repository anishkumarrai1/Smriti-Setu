import React from 'react';
import { Shield, ExternalLink, Mail, Phone, Lock, Heart, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AshokaEmblem, DigitalIndiaBadge } from '../common/GovEmblem';

export const GovFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#07243C] text-slate-200 pt-12 pb-8 border-t-4 border-amber-400 font-sans">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 space-y-10">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
          
          {/* Column 1: Government Branding */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <AshokaEmblem className="w-10 h-14 shrink-0 bg-white p-1 rounded" />
              <div>
                <h3 className="font-serif font-extrabold text-lg text-white">
                  {t('portal.govtOfIndia', { defaultValue: 'Government of India' })}
                </h3>
                <p className="text-xs text-amber-300 font-bold">
                  {t('portal.necMohfw', { defaultValue: 'Ministry of Health & Family Welfare · North Eastern Council (NEC)' })}
                </p>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs max-w-sm font-medium">
              {t('portal.aboutInitiative', { defaultValue: 'Smriti-Setu is an official public health initiative under NPHCE & ABDM guidelines for dementia screening and memory care across Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura.' })}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <DigitalIndiaBadge />
              <span className="text-[10px] font-bold text-slate-300 border border-slate-600 px-2 py-1 rounded bg-[#004085]">
                {t('portal.gigwCertified', { defaultValue: 'GIGW 2.0 Certified' })}
              </span>
            </div>
          </div>

          {/* Column 2: Government Policies */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider border-b border-slate-700 pb-1">
              {t('portal.websitePolicies', { defaultValue: 'Website Policies' })}
            </h4>
            <ul className="space-y-1.5 text-slate-300 font-semibold text-[11px]">
              <li><a href="#footer" className="hover:text-amber-300 transition-colors">{t('portal.termsConditions', { defaultValue: 'Terms & Conditions' })}</a></li>
              <li><a href="#footer" className="hover:text-amber-300 transition-colors">{t('portal.privacyPolicy', { defaultValue: 'Privacy Policy' })}</a></li>
              <li><a href="#footer" className="hover:text-amber-300 transition-colors">{t('portal.copyrightPolicy', { defaultValue: 'Copyright Policy' })}</a></li>
              <li><a href="#footer" className="hover:text-amber-300 transition-colors">{t('portal.hyperlinkingPolicy', { defaultValue: 'Hyperlinking Policy' })}</a></li>
              <li><a href="#footer" className="hover:text-amber-300 transition-colors">{t('portal.accessibilityStatement', { defaultValue: 'Accessibility Statement' })}</a></li>
              <li><a href="#footer" className="hover:text-amber-300 transition-colors">{t('portal.helpFaq', { defaultValue: 'Help & FAQ' })}</a></li>
            </ul>
          </div>

          {/* Column 3: Regional Language Nodes */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider border-b border-slate-700 pb-1">
              {t('portal.regionalHubs', { defaultValue: 'Regional Health Hubs' })}
            </h4>
            <ul className="space-y-1.5 text-slate-300 font-semibold text-[11px]">
              <li><span>Guwahati Medical College (Assam)</span></li>
              <li><span>NEIGRIHMS Shillong (Meghalaya)</span></li>
              <li><span>RIMS Imphal (Manipur)</span></li>
              <li><span>STNM Gangtok (Sikkim)</span></li>
              <li><span>AGMC Agartala (Tripura)</span></li>
              <li><span>TRIHMS Naharlagun (Arunachal)</span></li>
            </ul>
          </div>

          {/* Column 4: Emergency Contacts & Helplines */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider border-b border-slate-700 pb-1">
              {t('portal.tollFreeHelplines', { defaultValue: 'Toll-Free Helplines' })}
            </h4>
            <div className="space-y-2 text-slate-300 font-bold">
              <p className="flex items-center gap-1.5 text-amber-300 text-xs">
                <Phone className="w-3.5 h-3.5" />
                <span>{t('portal.elderLineNational', { defaultValue: 'Elder Line: 14567 (National Senior Helpline)' })}</span>
              </p>
              <p className="flex items-center gap-1.5 text-amber-300 text-xs">
                <Phone className="w-3.5 h-3.5" />
                <span>{t('portal.teleManasMental', { defaultValue: 'Tele-MANAS: 14416 (Mental Health)' })}</span>
              </p>
              <div className="pt-2 text-[10px] text-slate-400 font-normal space-y-1">
                <p>{t('portal.nodalEmail', { defaultValue: 'Nodal Officer Email:' })} <strong className="text-slate-200">contact-mohfw@gov.in</strong></p>
                <p>{t('portal.websiteHostedBy', { defaultValue: 'Website Hosted by:' })} <strong className="text-slate-200">{t('portal.nicLabel', { defaultValue: 'National Informatics Centre (NIC)' })}</strong></p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Disclaimer Strip with Metadata */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-medium">
          <div className="space-y-1">
            <p>{t('portal.copyrightNotice', { defaultValue: '© 2026 Ministry of Health & Family Welfare, Government of India. All rights reserved.' })}</p>
            <p className="text-[10px] text-slate-500">
              {t('portal.contentManagedBy', { defaultValue: 'Content Managed by Ministry of Health & Family Welfare & North Eastern Council. Website designed & hosted by National Informatics Centre.' })}
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-300 bg-slate-900 px-3 py-1.5 rounded border border-slate-700">
            <span>{t('portal.lastUpdated', { defaultValue: 'Last Updated: 03 Sep 2026' })}</span>
            <span className="text-amber-400">|</span>
            <span>{t('portal.totalVisitors', { defaultValue: 'Total Visitors: 1,482,903' })}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
