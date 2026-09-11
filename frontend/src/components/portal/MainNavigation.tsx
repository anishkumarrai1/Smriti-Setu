import React, { useState } from 'react';
import { Search, Lock, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AshokaEmblem, DigitalIndiaBadge, HealthHelplineBadge } from '../common/GovEmblem';

interface MainNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearch: (query: string) => void;
  onOpenAppAuth: () => void;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({
  activeTab,
  setActiveTab,
  onSearch,
  onOpenAppAuth,
}) => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput) {
      onSearch(searchInput);
      setActiveTab('facilities');
    }
  };

  const navItems = [
    { id: 'home', label: t('navigation.home') },
    { id: 'services', label: t('navigation.healthServices', { defaultValue: 'Health Services' }) },
    { id: 'facilities', label: t('navigation.hospitalsFacilities', { defaultValue: 'Hospitals & Facilities' }) },
    { id: 'network', label: t('navigation.nerNetwork', { defaultValue: 'NER Health Network' }) },
    { id: 'smriti-setu', label: t('navigation.smritiCare', { defaultValue: 'Smriti-Setu Care' }) },
    { id: 'programs', label: t('navigation.programsInitiatives', { defaultValue: 'Programs & Initiatives' }) },
    { id: 'resources', label: t('navigation.healthResources', { defaultValue: 'Health Resources' }) },
  ];

  return (
    <div className="bg-white border-b-2 border-slate-300">
      
      {/* 1. Official Government Header Branding Area */}
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* State Emblem of India & Department Title */}
        <div className="flex items-center gap-3 md:gap-4">
          <AshokaEmblem className="w-10 h-14 md:w-12 md:h-16 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-wider text-[#004085]">
              {t('portal.ministryHeader', { defaultValue: 'Ministry of Health & Family Welfare · Government of India' })}
            </span>
            <h1 className="text-lg md:text-2xl font-serif font-extrabold text-slate-900 leading-tight">
              {t('portal.portalTitle', { defaultValue: 'North Eastern Region Cognitive Health Portal' })}
            </h1>
            <p className="text-[11px] md:text-xs font-bold text-slate-600">
              {t('portal.portalSubtitle', { defaultValue: 'North Eastern Council (NEC) & National Health Mission Partnership' })}
            </p>
          </div>
        </div>

        {/* Right Header Cluster: Badges + Access Smriti-Setu Platform Login Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <DigitalIndiaBadge />
          <HealthHelplineBadge />

          {/* Access Smriti-Setu Platform Login Button */}
          <button
            onClick={onOpenAppAuth}
            className="bg-amber-400 text-slate-950 hover:bg-amber-300 px-4 py-2 rounded-xl font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105"
          >
            <Lock className="w-4 h-4 text-slate-950 shrink-0" />
            <span>{t('portal.accessPlatform', { defaultValue: 'Access Smriti-Setu Platform' })}</span>
          </button>
        </div>

      </div>

      {/* 2. Primary Navigation Bar (#004085 Opaque Dark Navy) */}
      <nav className="bg-[#004085] text-white shadow-md border-y border-[#0B3B60]">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 flex items-center justify-between min-h-[48px]">
          
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 text-white hover:text-amber-300 focus:outline-none flex items-center gap-1.5 text-xs font-bold"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span>Menu</span>
          </button>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-1 py-0.5 overflow-x-visible">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-3 text-xs xl:text-sm font-extrabold transition-all whitespace-nowrap border-b-4 ${
                    active
                      ? 'bg-[#0B3B60] border-amber-400 text-amber-300 shadow-xs'
                      : 'border-transparent text-white hover:bg-[#0056B3] hover:text-amber-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Global Search Input */}
          <div className="flex items-center gap-2 py-1.5">
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <input
                type="text"
                placeholder={t('portal.searchByStateDistrict', { defaultValue: 'Search hospitals, services...' })}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="px-3.5 py-1.5 text-xs text-slate-900 font-bold bg-white rounded-l-md border-y border-l border-slate-400 focus:outline-none w-44 md:w-64 shadow-xs"
              />
              <button
                type="submit"
                className="bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-r-md hover:bg-amber-300 transition-colors font-extrabold text-xs flex items-center gap-1 shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0B3B60] border-t border-slate-700 py-3 px-4 space-y-2 animate-in slide-in-from-top duration-200">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 text-sm font-bold rounded-md ${
                  activeTab === item.id ? 'bg-[#004085] text-amber-300 font-extrabold' : 'text-white hover:bg-blue-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

    </div>
  );
};
