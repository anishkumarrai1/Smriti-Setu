import React, { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { PublicPortalPage } from './pages/PublicPortalPage';
import { AppShell } from './components/layout/AppShell';
import { useAuthStore } from './stores/useAuthStore';
import { UserRole } from './types';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { CaregiverDashboard } from './pages/caregiver/CaregiverDashboard';
import { ClinicianDashboard } from './pages/clinician/ClinicianDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ActivityContainer } from './components/activities/ActivityContainer';
import { ActivityType } from './types';
import { MemoryGardenView } from './components/memory/MemoryGardenView';
import { RemindersManagerView } from './components/reminders/RemindersManagerView';
import { AiVoiceCompanion } from './components/common/AiVoiceCompanion';
import { ArrowLeft, LogOut, ShieldCheck, Globe, User } from 'lucide-react';
import { useHardwareSocketStore } from './stores/useHardwareSocketStore';
import hardwareInputAdapter from './services/hardwareInputAdapter';
import { HardwareTestPanel } from './components/common/HardwareTestPanel';
import { ForceTranslationListener } from './components/common/ForceTranslationListener';
import { useTranslation } from 'react-i18next';

export const App: React.FC = () => {
  const { t } = useTranslation();
  const { role, setRole, fetchMe, logout, systemRole } = useAuthStore();
  
  // Dedicated Login Gateway as primary entry mode
  const [viewMode, setViewMode] = useState<'login' | 'public_portal' | 'authenticated_app'>('login');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');

  useEffect(() => {
    // Check existing authentication session on launch
    fetchMe();
    // Initialize Socket.io connection to hardware gateway
    useHardwareSocketStore.getState().connect();
    // Initialize unified hardware input adapter (unbound to games)
    hardwareInputAdapter.initialize();
  }, [fetchMe]);

  const handleStartActivity = (type: ActivityType) => {
    setSelectedActivity(type);
  };

  const handleBackFromActivity = () => {
    setSelectedActivity(null);
  };

  const handleNavigateTab = (tab: string) => {
    setSelectedActivity(null);
    setActiveTab(tab);
  };

  // Called upon successful login from LoginPage or PublicPortal
  const handleOpenAppAuth = (selectedRole?: UserRole) => {
    if (selectedRole) setRole(selectedRole);
    setViewMode('authenticated_app');
  };

  const handleSignOut = async () => {
    await logout();
    setSelectedActivity(null);
    setActiveTab('home');
    setViewMode('login');
  };

  // 1. PRIMARY ENTRY: Dedicated Official Government Login Page
  // (Website homepage is COMPLETELY NOT SHOWN in background)
  if (viewMode === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleOpenAppAuth}
        onBrowsePublicPortal={() => setViewMode('public_portal')}
      />
    );
  }

  // 2. PUBLIC PORTAL: Official NER Government Healthcare Information Portal
  if (viewMode === 'public_portal') {
    return (
      <>
        <ForceTranslationListener />
        {/* Top return strip */}
        <div className="bg-[#0A2540] text-white py-2 px-4 sm:px-8 text-xs font-bold flex items-center justify-between border-b border-slate-700 sticky top-0 z-50 shadow-md">
          <button
            onClick={() => setViewMode('login')}
            className="hover:underline flex items-center gap-1.5 text-amber-300 font-extrabold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Smriti-Setu Platform Login
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-300 hidden sm:inline font-mono">
              National Health Mission · NER Health Portal
            </span>
          </div>
        </div>

        <PublicPortalPage
          onOpenAppAuth={handleOpenAppAuth}
          onGoToLogin={() => setViewMode('login')}
        />
        
        <AiVoiceCompanion
          onStartActivity={(type) => {
            setViewMode('authenticated_app');
            handleStartActivity(type);
          }}
          onNavigateTab={(tab) => {
            setViewMode('authenticated_app');
            handleNavigateTab(tab);
          }}
          onOpenPortal={() => setViewMode('public_portal')}
          currentTab="public_portal"
        />
      </>
    );
  }

  // 3. AUTHENTICATED SMRITI-SETU APPLICATION (Patient, Caregiver, Doctor, Admin)
  return (
    <div className="relative min-h-screen bg-slate-50">
      <ForceTranslationListener />
      {/* Return to Public Government Portal Banner Strip */}
      <div className="bg-govNavy-dark text-white py-2 px-4 text-xs font-bold flex items-center justify-between border-b border-slate-700 sticky top-0 z-50 shadow-md">
        <button
          onClick={() => setViewMode('public_portal')}
          className="hover:underline flex items-center gap-1.5 text-amber-300 font-extrabold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {t('portal.returnToOfficial', 'Return to Official Government Health Portal')}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-slate-200 font-semibold hidden sm:inline bg-govNavy px-3 py-0.5 rounded-full border border-slate-600">
            {t('portal.authenticatedRole', 'Authenticated Role')}: <strong className="text-white uppercase">{t(`roles.${role}`, role)}</strong>
            {systemRole === 'admin' && <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-600 text-white rounded font-bold">ADMIN</span>}
          </span>
          <button
            onClick={handleSignOut}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      <AppShell activeTab={activeTab} setActiveTab={setActiveTab} onSignOut={handleSignOut}>
        {(currentActiveTab, changeActiveTab) => {
          if (selectedActivity) {
            return (
              <ActivityContainer
                key={selectedActivity}
                initialActivityType={selectedActivity}
                onBack={handleBackFromActivity}
              />
            );
          }

          if (activeTab === 'admin') {
            return <AdminDashboard />;
          }

          if (role === 'patient') {
            if (activeTab === 'activities') {
              return (
                <ActivityContainer
                  initialActivityType="memory_match"
                  onBack={() => setActiveTab('home')}
                />
              );
            }
            if (activeTab === 'memories') return <MemoryGardenView />;
            if (activeTab === 'reminders') return <RemindersManagerView />;
            return <PatientDashboard onStartActivity={handleStartActivity} />;
          }

          if (role === 'caregiver') {
            if (activeTab === 'memories') return <MemoryGardenView />;
            if (activeTab === 'reminders') return <RemindersManagerView />;
            return <CaregiverDashboard />;
          }

          if (role === 'clinician') {
            if (activeTab === 'activities') {
              return (
                <ActivityContainer
                  initialActivityType="picture_recognition"
                  onBack={() => setActiveTab('analytics')}
                />
              );
            }
            return <ClinicianDashboard />;
          }

          return <PatientDashboard onStartActivity={handleStartActivity} />;
        }}
      </AppShell>

      <AiVoiceCompanion
        onStartActivity={handleStartActivity}
        onNavigateTab={handleNavigateTab}
        onExitActivity={handleBackFromActivity}
        onOpenPortal={() => setViewMode('public_portal')}
        currentTab={activeTab}
      />

      {/* Development-Only ESP32 Hardware Test Panel Overlay */}
      <HardwareTestPanel />
    </div>
  );
};

export default App;
