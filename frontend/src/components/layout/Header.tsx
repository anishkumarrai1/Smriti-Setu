import React, { useState } from 'react';
import { LogOut, Globe, ShieldCheck, ShieldAlert, User, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { RoleSwitcher } from './RoleSwitcher';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';
import { AshokaEmblem, IndianFlagBadge } from '../common/GovEmblem';
import { PatientSwitcherModal } from '../common/PatientSwitcherModal';
import { PatientProfileModal } from '../common/PatientProfileModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onSignOut }) => {
  const { t } = useTranslation();
  const { role, systemRole, selectedPatient, user } = useAuthStore();
  const { elderlyMode } = useAccessibilityStore();
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const patientNav = [
    { id: 'home', labelKey: 'navigation.home' },
    { id: 'memories', labelKey: 'navigation.memories' },
    { id: 'reminders', labelKey: 'navigation.reminders' },
  ];

  const caregiverNav = [
    { id: 'home', labelKey: 'navigation.home' },
    { id: 'memories', labelKey: 'navigation.memories' },
    { id: 'reminders', labelKey: 'navigation.reminders' },
  ];

  const clinicianNav = [
    { id: 'analytics', labelKey: 'navigation.analytics' },
  ];

  const adminNav = [
    { id: 'facility', labelKey: 'navigation.facility' },
    { id: 'analytics', labelKey: 'navigation.analytics' },
  ];

  const baseNavItems = {
    patient: patientNav,
    caregiver: caregiverNav,
    clinician: clinicianNav,
    facility_admin: adminNav,
  }[role];

  // If systemRole === 'admin', append Admin Security Console tab
  const navItems = systemRole === 'admin'
    ? [...baseNavItems, { id: 'admin', labelKey: 'Admin Audit Console' }]
    : baseNavItems;

  return (
    <header className="bg-white border-b border-slate-300 sticky top-0 z-40 transition-all shadow-xs">
      
      {/* 1. Platform Status & Session Top Strip */}
      <div className="bg-[#002B49] text-white text-[11px] py-1.5 px-4 sm:px-8 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
            <span className="font-bold tracking-wider text-amber-300 uppercase">
              SMRITI-SETU · Cognitive Care Platform
            </span>
            <span className="hidden md:inline text-slate-300">
              | Adaptive Brain Stimulation & Memory Archive
            </span>
          </div>

          <div className="flex items-center gap-3">
            {systemRole === 'admin' && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-extrabold bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Privileges</span>
              </span>
            )}

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-300 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Session ({user ? user.email : 'Local'})</span>
            </span>

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="text-amber-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 font-bold transition-all cursor-pointer text-[11px]"
                title="Return to secure role login"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Branding & Controls Bar */}
      <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-8 py-2 sm:py-2.5 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
        
        {/* Emblem & Portal Title */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-50 border border-slate-300 flex items-center justify-center p-1 shadow-xs shrink-0">
              <AshokaEmblem className="w-5 h-7 sm:w-6 sm:h-8" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-bold text-lg sm:text-2xl tracking-tight text-[#003366] font-serif">
                  SMRITI-SETU
                </h1>
                <span className="bg-blue-50 text-[#003366] text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded border border-blue-200">
                  {selectedPatient.hierarchy.state}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-600 truncate max-w-[220px] sm:max-w-none">
                National Cognitive Health & Memory Framework
              </p>
            </div>
          </div>

          {/* Mobile-only Patient Avatar / Switcher quick trigger */}
          <div className="lg:hidden shrink-0">
            {role === 'patient' ? (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 p-1 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 shadow-2xs cursor-pointer"
                title="View/Edit Profile"
              >
                <img
                  src={selectedPatient.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80'}
                  alt={selectedPatient.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#003366]"
                />
              </button>
            ) : (
              <button
                onClick={() => setIsPatientModalOpen(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-white hover:bg-slate-50 px-2 py-1 rounded-lg border border-slate-300 shadow-2xs cursor-pointer"
                title="Switch Active Patient"
              >
                <User className="w-3.5 h-3.5 text-[#003366]" />
                <span className="max-w-[70px] truncate">{selectedPatient.name.split(' ')[0]}</span>
              </button>
            )}
          </div>
        </div>

        {/* Controls: Role Switcher & Language */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 shrink-0 flex-nowrap no-scrollbar">
          <RoleSwitcher />
          <LanguageSelector />
        </div>
      </div>

      {/* 3. Desktop Sub-Navigation Bar (Hidden on mobile < md as mobile bottom bar handles it) */}
      <div className="border-t border-slate-200 bg-[#F8FAFC] hidden md:block">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-2 flex items-center justify-between overflow-x-auto gap-4">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const label = item.id === 'admin' ? 'Admin Audit Console 🛡️' : t(item.labelKey);
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#003366] text-white shadow-xs font-black'
                      : 'text-slate-700 hover:text-[#003366] hover:bg-slate-100'
                  } ${elderlyMode ? 'px-6 py-2.5 text-base font-bold' : 'text-xs sm:text-sm'}`}
                >
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {role === 'patient' ? (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-300 shadow-2xs transition-all cursor-pointer group hover:border-[#003366]"
                title="Click to view/edit your personal profile & photo"
              >
                <img
                  src={selectedPatient.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80'}
                  alt={selectedPatient.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-[#003366] shadow-xs shrink-0"
                />
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-none">Senior Patient</div>
                  <div className="text-xs font-black text-[#003366] group-hover:underline">{selectedPatient.name}</div>
                </div>
                <span className="text-[10px] bg-blue-50 text-[#003366] border border-blue-200 px-2 py-0.5 rounded-lg font-black flex items-center gap-1 shadow-2xs">
                  Edit Photo
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsPatientModalOpen(true)}
                className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs transition-all cursor-pointer group"
                title="Click to switch active patient or register a new patient"
              >
                <User className="w-3.5 h-3.5 text-[#003366]" />
                <span>
                  Active Patient: <strong className="text-[#003366] group-hover:underline">{selectedPatient.name}</strong>
                </span>
                <span className="text-[10px] bg-blue-50 text-[#003366] border border-blue-200 px-1.5 py-0.5 rounded font-black flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Switch / Add</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subtle National Tricolor Border */}
      <div className="h-[3px] w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-slate-200" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* Patient Switcher & Registration Modal (Caregiver/Clinician) */}
      <PatientSwitcherModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
      />

      {/* Patient Profile Editing & Photo Upload Modal (Patient Persona) */}
      <PatientProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};
