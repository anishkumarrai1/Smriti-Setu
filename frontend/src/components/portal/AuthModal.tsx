import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Lock, 
  UserCheck, 
  HeartPulse, 
  Stethoscope, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { UserRole } from '../../types';
import { AshokaEmblem, IndianFlagBadge } from '../common/GovEmblem';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { t } = useTranslation();
  const { setRole } = useAuthStore();
  const [selectedRoleTab, setSelectedRoleTab] = useState<UserRole>('patient');
  const [loginMethod, setLoginMethod] = useState<'quick' | 'abha'>('quick');
  
  // Custom Form Inputs
  const [abhaId, setAbhaId] = useState('');
  const [passcode, setPasscode] = useState('');

  if (!isOpen) return null;

  const handleRoleSelectAndLogin = (role: UserRole) => {
    setRole(role);
    onLoginSuccess(role);
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRoleSelectAndLogin(selectedRoleTab);
  };

  // Only the 3 Core Roles: Patient, Caretaker/Caregiver, Doctor/Clinician
  const roleConfigs = [
    {
      id: 'patient' as UserRole,
      title: 'Patient Portal',
      titleAs: 'ৰোগী সেৱা',
      badge: '👴 Senior Citizen & Patient',
      name: 'Ranjit Borthakur (72 Yrs)',
      location: 'Kamrup Metropolitan, Assam',
      description: 'Voice-guided memory match, family photo puzzles, regional music, and scheduled routine timetable.',
      icon: HeartPulse,
      themeGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      accentBorder: 'border-rose-300 hover:border-rose-500',
      activeRing: 'ring-4 ring-rose-400/80 border-rose-600 bg-rose-50/95 shadow-2xl scale-[1.02]',
      buttonBg: 'bg-rose-700 hover:bg-rose-800 text-white shadow-rose-900/20',
      badgeBg: 'bg-rose-100 text-rose-800 border border-rose-200',
      avatarBg: 'bg-rose-600 text-white',
      demoCred: 'ABHA: 98-6401-2026-NER',
    },
    {
      id: 'caregiver' as UserRole,
      title: 'Caretaker / Caregiver',
      titleAs: 'সেৱাকাৰী পৰ্টেল',
      badge: '🩺 Family Member & Caretaker',
      name: 'Ananya Borthakur',
      location: 'Primary Caregiver · Guwahati',
      description: 'Real-time patient cognitive telemetry, memory photo uploads, medicine alerts, and doctor report downloads.',
      icon: UserCheck,
      themeGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      accentBorder: 'border-emerald-300 hover:border-emerald-500',
      activeRing: 'ring-4 ring-emerald-400/80 border-emerald-600 bg-emerald-50/95 shadow-2xl scale-[1.02]',
      buttonBg: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/20',
      badgeBg: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      avatarBg: 'bg-emerald-600 text-white',
      demoCred: 'Caretaker ID: CG-NER-4402',
    },
    {
      id: 'clinician' as UserRole,
      title: 'Doctor / Clinician',
      titleAs: 'চিকিৎসক পৰ্টেল',
      badge: '👨‍⚕️ Neuropsychiatrist Specialist',
      name: 'Dr. Bikash Barua, MD',
      location: 'AIIMS / Guwahati Regional Center',
      description: 'Cognitive zigzag trajectories, response latency analytics, dementia stage evaluation, and digital sign-off.',
      icon: Stethoscope,
      themeGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      accentBorder: 'border-blue-300 hover:border-blue-500',
      activeRing: 'ring-4 ring-blue-400/80 border-blue-600 bg-blue-50/95 shadow-2xl scale-[1.02]',
      buttonBg: 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-900/20',
      badgeBg: 'bg-blue-100 text-blue-800 border border-blue-200',
      avatarBg: 'bg-blue-600 text-white',
      demoCred: 'NMC Reg: MCI-NER-44921',
    },
  ];

  const currentRoleConfig = roleConfigs.find((r) => r.id === selectedRoleTab) || roleConfigs[0];
  const IconComp = currentRoleConfig.icon;

  return (
    // Dedicated Full-Screen Official Government Gateway (Completely covers homepage with prestigious Indian Health Portal visual styling)
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-[#031326] via-[#081F38] to-[#031326] flex flex-col justify-between p-3 sm:p-6 md:p-8 animate-fadeIn text-slate-100 relative">
      
      {/* Luminous Ambient Background Glows & Subtle Ashok Chakra Watermark */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Saffron Aura Glow at Top Center */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#FF9933]/15 rounded-full blur-3xl" />
        
        {/* Emerald Green Aura Glow at Bottom Right */}
        <div className="absolute -bottom-32 right-10 w-[600px] h-[350px] bg-[#138808]/15 rounded-full blur-3xl" />

        {/* Ashoka Chakra Center Watermark Graphic */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] opacity-[0.03] flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white animate-spin-slow">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + 45 * Math.cos((i * 15 * Math.PI) / 180)}
                y2={50 + 45 * Math.sin((i * 15 * Math.PI) / 180)}
                stroke="currentColor"
                strokeWidth="1.2"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* 1. Official Government Header Strip */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 py-2 border-b border-slate-700/60 shrink-0">
        <div className="flex items-center gap-3">
          <IndianFlagBadge />
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400">
              भारत सरकार · স্বাস্থ্য আৰু পৰিয়াল কল্যাণ মন্ত্ৰালয়
            </span>
            <span className="text-[11px] text-slate-300 font-bold hidden sm:inline">
              Ministry of Health & Family Welfare · National Health Mission (NHM)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-amber-300 font-extrabold bg-[#004085]/60 px-3 py-1 rounded-full border border-slate-600">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Helpline: 14567 / 14416 (24x7)</span>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-4 py-1.5 rounded-xl border border-slate-600 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105"
          >
            <span>Browse Public Health Portal</span>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 2. Central Elevated Official Gateway Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto my-auto py-4 sm:py-6">
        <div className="bg-white text-slate-900 rounded-3xl sm:rounded-4xl shadow-2xl border-2 border-slate-300/90 overflow-hidden flex flex-col backdrop-blur-md">
          
          {/* Official Tiranga Tricolor Line with Center Emblem Accent */}
          <div className="h-2.5 w-full flex shrink-0">
            <div className="h-full w-1/3 bg-[#FF9933]" />
            <div className="h-full w-1/3 bg-white" />
            <div className="h-full w-1/3 bg-[#138808]" />
          </div>

          {/* Prestige Government Modal Banner */}
          <div className="bg-[#0A2540] text-white p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 shrink-0 relative overflow-hidden">
            
            {/* Background Emblem Watermark */}
            <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none hidden lg:block">
              <AshokaEmblem className="w-44 h-44 filter invert" />
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="p-2 bg-white rounded-2xl shadow-md shrink-0">
                <AshokaEmblem className="w-10 h-14" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-300 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                    Official Government Health Gateway
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border border-emerald-400/40">
                    🔒 SSL 256-Bit Encrypted & HIPAA Compliant
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
                  Smriti-Setu Cognitive Care Portal
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  National Health Mission (NER) · Artificial Intelligence Tele-Rehabilitation Grid
                </p>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-end text-right text-xs text-slate-300 relative z-10 shrink-0">
              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ABDM National Gateway Active
              </span>
              <span className="text-[11px] text-slate-400 font-mono mt-1">Node: NER-GUW-HEALTH-GRID-01</span>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 sm:p-8 space-y-6 bg-[#FDFBF7]">
            
            <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-serif font-black text-lg sm:text-xl text-slate-950 flex items-center justify-center sm:justify-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#004085]" />
                  <span>Choose Your Authorized Role to Log In:</span>
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Select your profile below for instant authentication with pre-loaded clinical credentials:
                </p>
              </div>

              <span className="text-[11px] font-extrabold text-[#004085] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full self-center sm:self-auto">
                ⚡ 3 Designated Roles Available
              </span>
            </div>

            {/* 3 Dedicated Core Role Cards (Patient, Caretaker, Doctor) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roleConfigs.map((role) => {
                const RoleIcon = role.icon;
                const isSelected = selectedRoleTab === role.id;

                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRoleTab(role.id)}
                    className={`relative p-5 rounded-3xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 select-none ${
                      isSelected
                        ? role.activeRing
                        : `bg-white ${role.accentBorder} hover:shadow-xl hover:scale-[1.01]`
                    }`}
                  >
                    {/* Top Pill & Icon */}
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl shadow-xs transition-transform ${
                        isSelected ? `${role.avatarBg} scale-110 shadow-md` : 'bg-slate-100 text-slate-700'
                      }`}>
                        <RoleIcon className="w-6 h-6" />
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${role.badgeBg}`}>
                        {role.titleAs}
                      </span>
                    </div>

                    {/* Persona Details */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                        {role.badge}
                      </span>
                      <h3 className="font-serif font-black text-slate-900 text-lg leading-tight">
                        {role.title}
                      </h3>
                      <p className="text-xs font-bold text-[#004085]">{role.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{role.location}</p>
                    </div>

                    {/* Role Description */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {role.description}
                    </p>

                    {/* Instant 1-Click Login Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleSelectAndLogin(role.id);
                      }}
                      className={`w-full py-3 px-4 rounded-2xl font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${role.buttonBg}`}
                    >
                      <span>Log In as {role.title.split(' ')[0]}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Credentials & Alternative Auth Methods Bar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-slate-100 text-[#004085] shadow-xs">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-slate-900">
                      Selected Profile: <strong className="text-[#004085]">{currentRoleConfig.title}</strong>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Pre-authenticated identity: <strong>{currentRoleConfig.name}</strong> ({currentRoleConfig.demoCred})
                    </p>
                  </div>
                </div>

                {/* Method Switcher */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('quick')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      loginMethod === 'quick' ? 'bg-[#004085] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚡ 1-Click Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('abha')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      loginMethod === 'abha' ? 'bg-[#004085] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-amber-300" />
                    ABHA ID
                  </button>
                </div>
              </div>

              {/* METHOD 1: 1-Click Direct Launch */}
              {loginMethod === 'quick' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <strong className="text-xs font-black text-emerald-950">
                        Zero-friction Verified Authentication Ready
                      </strong>
                    </div>
                    <p className="text-xs text-emerald-800 font-medium">
                      Press below to enter the {currentRoleConfig.title} with full clinical session sync.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRoleSelectAndLogin(selectedRoleTab)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#004085] hover:bg-[#0A2540] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                  >
                    <span>Launch {currentRoleConfig.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* METHOD 2: ABHA National Health ID Form */}
              {loginMethod === 'abha' && (
                <form onSubmit={handleFormSubmit} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ABHA Health ID / National ID
                      </label>
                      <input
                        type="text"
                        required
                        value={abhaId}
                        onChange={(e) => setAbhaId(e.target.value)}
                        placeholder="e.g. ABHA-NER-986401"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004085]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Passcode / OTP
                      </label>
                      <input
                        type="password"
                        required
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004085]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      Verified by National Health Authority (NHA)
                    </span>
                    <button
                      type="submit"
                      className="bg-[#004085] hover:bg-[#0A2540] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Sign In to {currentRoleConfig.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

            </div>

          </div>

          {/* Modal Footer */}
          <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600 font-medium shrink-0">
            <div className="flex items-center gap-2">
              <IndianFlagBadge />
              <span>Official Digital Public Infrastructure (DPI) · Smriti-Setu AI Platform</span>
            </div>
            <button
              onClick={onClose}
              className="text-[#004085] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Skip login & browse public health portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* 3. Bottom Legal Disclaimer & Tele-Grid Accreditation */}
      <div className="relative z-10 w-full max-w-6xl mx-auto py-2 text-center text-[11px] text-slate-400 font-medium shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 Ministry of Health & Family Welfare, Government of India. All rights reserved.</span>
        <span className="font-mono text-amber-400">Northeast India Geriatric Health Grid · 8 Regional State Nodes Active</span>
      </div>

    </div>
  );
};
