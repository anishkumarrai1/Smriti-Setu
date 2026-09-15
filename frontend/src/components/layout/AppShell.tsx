import React, { useState } from 'react';
import { AccessibilityToolbar } from '../common/AccessibilityToolbar';
import { OfflineBanner } from './OfflineBanner';
import { Header } from './Header';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Heart, 
  Bell, 
  BarChart3, 
  ShieldAlert, 
  Building2,
  Gamepad2,
  Sparkles 
} from 'lucide-react';

interface AppShellProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onSignOut?: () => void;
  children: (activeTab: string, setActiveTab: (tab: string) => void) => React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab: controlledTab,
  setActiveTab: controlledSetTab,
  onSignOut,
  children,
}) => {
  const { t } = useTranslation();
  const { role, systemRole } = useAuthStore();
  const [internalTab, setInternalTab] = useState('home');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;
  const setActiveTab = controlledSetTab !== undefined ? controlledSetTab : setInternalTab;
  const { reducedMotion, elderlyMode } = useAccessibilityStore();

  // Navigation Items definitions with icons for Mobile Bottom Nav
  const patientNav = [
    { id: 'home', labelKey: 'navigation.home', icon: Home },
    { id: 'memories', labelKey: 'navigation.memories', icon: Heart },
    { id: 'reminders', labelKey: 'navigation.reminders', icon: Bell },
  ];

  const caregiverNav = [
    { id: 'home', labelKey: 'navigation.home', icon: Home },
    { id: 'memories', labelKey: 'navigation.memories', icon: Heart },
    { id: 'reminders', labelKey: 'navigation.reminders', icon: Bell },
  ];

  const clinicianNav = [
    { id: 'analytics', labelKey: 'navigation.analytics', icon: BarChart3 },
  ];

  const adminNav = [
    { id: 'facility', labelKey: 'navigation.facility', icon: Building2 },
    { id: 'analytics', labelKey: 'navigation.analytics', icon: BarChart3 },
  ];

  const baseNavItems = {
    patient: patientNav,
    caregiver: caregiverNav,
    clinician: clinicianNav,
    facility_admin: adminNav,
  }[role] || patientNav;

  const mobileNavItems = systemRole === 'admin'
    ? [...baseNavItems, { id: 'admin', labelKey: 'Admin Audit', icon: ShieldAlert }]
    : baseNavItems;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-all bg-slate-50 text-slate-900 ${
        reducedMotion ? 'motion-reduce' : ''
      }`}
    >
      <AccessibilityToolbar />
      <OfflineBanner />
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onSignOut={onSignOut} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-8 py-4 sm:py-6 md:py-8 pb-24 md:pb-8">
        {children(activeTab, setActiveTab)}
      </main>

      {/* Desktop & Tablet Footer */}
      <footer className="bg-[#002244] text-slate-200 py-6 border-t-2 border-[#001428] text-xs font-sans mb-14 md:mb-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="font-serif font-bold text-white tracking-wide">SMRITI-SETU</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200">National Cognitive Health & Memory Assistance Framework</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            © 2026 Smriti-Setu Cognitive Health Platform. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Visible only on < md screens) */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-300/80 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden safe-area-bottom"
      >
        <div className="grid grid-flow-col auto-cols-fr items-center h-16 px-1">
          {mobileNavItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            const label = item.id === 'admin' ? 'Admin Console' : t(item.labelKey);

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 ${
                  isActive 
                    ? 'text-[#003366]' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`relative p-1 rounded-xl transition-all ${
                  isActive ? 'bg-blue-100/80 text-[#003366]' : ''
                }`}>
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                  {isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                  )}
                </div>
                <span className={`text-[11px] truncate max-w-[90px] mt-0.5 ${
                  isActive ? 'font-black text-[#003366]' : 'font-semibold text-slate-600'
                } ${elderlyMode ? 'text-xs font-black' : ''}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

