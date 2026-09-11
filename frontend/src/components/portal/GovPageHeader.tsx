import React from 'react';
import { ChevronRight, Home, Building2, Heart, Compass, ShieldCheck } from 'lucide-react';

interface GovPageHeaderProps {
  title: string;
  category?: string;
  breadcrumbs: { label: string; tabId?: string }[];
  onNavigateBreadcrumb?: (tabId: string) => void;
}

export const GovPageHeader: React.FC<GovPageHeaderProps> = ({
  title,
  category = 'Government Healthcare Portal · North Eastern Region',
  breadcrumbs,
  onNavigateBreadcrumb,
}) => {
  return (
    <div className="bg-slate-900 text-white border-b-4 border-govYellow py-6 px-4 relative overflow-hidden shadow-md">
      {/* Subtle Background Motif Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-govNavy-dark via-govNavy to-slate-950 opacity-95" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-2">
        
        {/* Breadcrumb Navigation Trail */}
        <nav className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
          <button
            onClick={() => onNavigateBreadcrumb && onNavigateBreadcrumb('home')}
            className="hover:text-govYellow flex items-center gap-1 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              {bc.tabId ? (
                <button
                  onClick={() => onNavigateBreadcrumb && onNavigateBreadcrumb(bc.tabId!)}
                  className="hover:text-govYellow transition-colors"
                >
                  {bc.label}
                </button>
              ) : (
                <span className="text-amber-300 font-bold">{bc.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Page Title & Category */}
        <div className="pt-1 space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block">
            {category}
          </span>
          <h1 className="text-2xl md:text-4xl font-serif font-extrabold text-white leading-tight">
            {title}
          </h1>
        </div>

      </div>
    </div>
  );
};
