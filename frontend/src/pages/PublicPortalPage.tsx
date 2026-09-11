import React, { useState } from 'react';
import { UtilityBar } from '../components/portal/UtilityBar';
import { MainNavigation } from '../components/portal/MainNavigation';
import { GovTicker } from '../components/portal/GovTicker';
import { GovHeroSlider } from '../components/portal/GovHeroSlider';
import { Hero } from '../components/portal/Hero';
import { ServiceExplorer } from '../components/portal/ServiceExplorer';
import { StateNetwork } from '../components/portal/StateNetwork';
import { FacilitySearch } from '../components/portal/FacilitySearch';
import { SmritiSetuSection } from '../components/portal/SmritiSetuSection';
import { ProgramsSection } from '../components/portal/ProgramsSection';
import { UpdatesSection } from '../components/portal/UpdatesSection';
import { ResourcesSection } from '../components/portal/ResourcesSection';
import { GovFooter } from '../components/portal/GovFooter';
import { AccessibilityControls } from '../components/portal/AccessibilityControls';
import { AuthModal } from '../components/portal/AuthModal';
import { CognitiveStreakWidget } from '../components/common/CognitiveStreakWidget';
import { useAccessibilityStore } from '../stores/useAccessibilityStore';
import { UserRole } from '../types';

interface PublicPortalPageProps {
  onOpenAppAuth: (role?: UserRole) => void;
}

export const PublicPortalPage: React.FC<PublicPortalPageProps> = ({ onOpenAppAuth }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [stateFilter, setStateFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { fontSizeScale, reducedMotion } = useAccessibilityStore();

  const scrollToTopHeader = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    scrollToTopHeader();
  };

  const handleSelectStateFilter = (stateName: string) => {
    setStateFilter(stateName);
    setActiveTab('facilities');
    scrollToTopHeader();
  };

  const handleSelectService = (serviceId: string) => {
    if (serviceId === 'srv-2') {
      setActiveTab('smriti-setu');
    } else {
      setActiveTab('facilities');
    }
    scrollToTopHeader();
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setActiveTab('facilities');
    scrollToTopHeader();
  };

  const handleFindFacility = () => {
    setActiveTab('facilities');
    scrollToTopHeader();
  };

  const handleExploreServices = () => {
    setActiveTab('services');
    scrollToTopHeader();
  };

  const handleLoginSuccess = (role: UserRole) => {
    onOpenAppAuth(role);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-all bg-slate-50 text-slate-900 ${
        reducedMotion ? 'motion-reduce' : ''
      }`}
    >
      {/* 1. Official Government Utility Bar */}
      <UtilityBar />

      {/* 2. Official Government Header & Navigation */}
      <MainNavigation
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onSearch={handleSearchSubmit}
        onOpenAppAuth={() => setIsAuthModalOpen(true)}
      />

      {/* 3. Scrolling Latest Updates Ticker */}
      <GovTicker />

      {/* 4. Main Content Sections (Clean, uncluttered, spacious layout) */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            {/* Single Primary Hero Gateway (Slider + Quick e-Services) */}
            <GovHeroSlider
              onFindFacility={handleFindFacility}
              onExploreServices={handleExploreServices}
              onAccessSmritiSetu={() => setIsAuthModalOpen(true)}
            />

            {/* Featured Smriti-Setu Cognitive Care Mission */}
            <SmritiSetuSection onAccessPlatform={() => setIsAuthModalOpen(true)} />

            {/* Latest Regional Updates & News */}
            <UpdatesSection />
          </>
        )}

        {activeTab === 'services' && (
          <ServiceExplorer onSelectService={handleSelectService} />
        )}

        {activeTab === 'facilities' && (
          <FacilitySearch initialStateFilter={stateFilter} initialSearchQuery={searchQuery} />
        )}

        {activeTab === 'network' && (
          <StateNetwork onSelectStateFilter={handleSelectStateFilter} />
        )}

        {activeTab === 'smriti-setu' && (
          <SmritiSetuSection onAccessPlatform={() => setIsAuthModalOpen(true)} />
        )}

        {activeTab === 'programs' && <ProgramsSection />}

        {activeTab === 'resources' && (
          <>
            <ResourcesSection />
            <div className="max-w-7xl mx-auto px-4 py-8">
              <AccessibilityControls />
            </div>
          </>
        )}
      </main>

      {/* 7. Official Government Footer */}
      <GovFooter />

      {/* 8. Role Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};
