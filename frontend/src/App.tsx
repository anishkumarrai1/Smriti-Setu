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
import { useActivityStore } from './stores/useActivityStore';
import hardwareInputAdapter from './services/hardwareInputAdapter';
import { HardwareTestPanel } from './components/common/HardwareTestPanel';
import { ForceTranslationListener } from './components/common/ForceTranslationListener';
import { useTranslation } from 'react-i18next';

export const App: React.FC = () => {
  const { t } = useTranslation();
  const { role, setRole, fetchMe, fetchPatients, logout, systemRole, selectedPatient } = useAuthStore();
  const { fetchSessionHistory } = useActivityStore();
  
  // 1. PRIMARY ENTRY: Public Information Portal is opened first
  const [viewMode, setViewMode] = useState<'login' | 'public_portal' | 'authenticated_app'>('public_portal');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');

  useEffect(() => {
    // Check existing authentication session and load patient roster on launch
    fetchMe();
    fetchPatients();
    // Auto-fetch real game sessions from backend
    fetchSessionHistory(selectedPatient?.id);
    // Initialize Socket.io connection to hardware gateway
    useHardwareSocketStore.getState().connect();
    // Initialize unified hardware input adapter (unbound to games)
    hardwareInputAdapter.initialize();
  }, [fetchMe, fetchPatients, fetchSessionHistory, selectedPatient?.id]);

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

  // 1. PUBLIC PORTAL: Primary entry landing page
  if (viewMode === 'public_portal') {
    return (
      <>
        <ForceTranslationListener />
        {/* Top return strip with prominent Gateway Login button */}
        <div className="bg-[#002B49] text-white py-2 px-4 sm:px-8 text-xs font-bold flex items-center justify-between border-b border-slate-700 sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
            <span className="text-xs text-amber-300 font-bold tracking-wide">
              SMRITI-SETU · Public Health Information & Cognitive Care Portal
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('login')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm text-xs hover:scale-105 active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>Go to Login / Dashboard Gateway →</span>
            </button>
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

  // 2. DEDICATED LOGIN PAGE (Opened when user clicks login or signs out)
  if (viewMode === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleOpenAppAuth}
        onBrowsePublicPortal={() => setViewMode('public_portal')}
      />
    );
  }

  // 3. AUTHENTICATED SMRITI-SETU APPLICATION (Patient, Caregiver, Doctor, Admin)
  return (
    <div className="relative min-h-screen bg-slate-50">
      <ForceTranslationListener />
      {/* Top Banner Navigation Strip */}
      <div className="bg-[#002B49] text-white py-1.5 px-3 sm:px-6 text-xs font-bold flex items-center justify-between border-b border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('public_portal')}
            className="hover:underline flex items-center gap-1.5 text-amber-300 font-extrabold cursor-pointer text-[11px] sm:text-xs"
          >
            <Globe className="w-3.5 h-3.5" /> Public Information Portal
          </button>
          <span className="text-slate-500 hidden md:inline">|</span>
          <button
            onClick={() => setViewMode('login')}
            className="text-slate-300 hover:text-white text-[11px] sm:text-xs hidden sm:inline-flex items-center gap-1 cursor-pointer"
            title="Open Sign In or Switch Account"
          >
            <User className="w-3 h-3" /> Sign In / Role Gateway
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-slate-200 font-semibold text-[11px] sm:text-xs bg-[#001D33] px-2.5 py-0.5 rounded-full border border-slate-600">
            Active Persona: <strong className="text-amber-300 uppercase">{t(`roles.${role}`, role)}</strong>
            {systemRole === 'admin' && <span className="ml-1.5 px-1.5 py-0.2 text-[9px] bg-red-600 text-white rounded font-black">ADMIN</span>}
          </span>
          <button
            onClick={handleSignOut}
            className="text-[11px] bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold transition-colors cursor-pointer"
            title="Sign Out to Login Gateway"
          >
            <LogOut className="w-3 h-3" /> Sign Out
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
