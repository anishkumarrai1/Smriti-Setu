import React, { useState } from 'react';
import { 
  HeartPulse, 
  UserCheck, 
  Stethoscope, 
  ArrowRight, 
  Lock, 
  User, 
  KeyRound
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { UserRole } from '../types';
import { AshokaEmblem, IndianFlagBadge } from '../components/common/GovEmblem';

type LoginRole = 'patient' | 'caregiver' | 'clinician';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
  onBrowsePublicPortal: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBrowsePublicPortal,
}) => {
  const { setRole } = useAuthStore();
  
  // Selected Role: patient | caregiver | clinician
  const [selectedRole, setSelectedRole] = useState<LoginRole>('patient');
  
  // Form Credentials (Empty by default)
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  // Role definitions
  const roleDetails: Record<LoginRole, {
    title: string;
    titleAs: string;
    badge: string;
    icon: any;
    idLabel: string;
    defaultId: string;
    defaultPass: string;
    assignedUser: string;
    themeColor: string;
    activeTabClass: string;
    boxClass: string;
    btnClass: string;
  }> = {
    patient: {
      title: 'Patient',
      titleAs: 'ৰোগী সেৱা',
      badge: '👴 Patient Portal',
      icon: HeartPulse,
      idLabel: 'ABHA Health ID / Patient ID',
      defaultId: 'ABHA-NER-986401',
      defaultPass: '2026',
      assignedUser: 'Ranjit Borthakur (72 Yrs)',
      themeColor: '#E11D48',
      activeTabClass: 'bg-rose-700 text-white shadow-md',
      boxClass: 'bg-rose-50 border-rose-200 text-rose-950',
      btnClass: 'bg-rose-700 hover:bg-rose-800 text-white shadow-rose-900/20',
    },
    caregiver: {
      title: 'Caretaker',
      titleAs: 'সেৱাকাৰী',
      badge: '🩺 Caretaker Portal',
      icon: UserCheck,
      idLabel: 'Caretaker Mobile / ID',
      defaultId: 'CG-NER-4402',
      defaultPass: '2026',
      assignedUser: 'Ananya Borthakur (Primary Caregiver)',
      themeColor: '#059669',
      activeTabClass: 'bg-emerald-700 text-white shadow-md',
      boxClass: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      btnClass: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/20',
    },
    clinician: {
      title: 'Doctor',
      titleAs: 'চিকিৎসক',
      badge: '👨‍⚕️ Medical Specialist Portal',
      icon: Stethoscope,
      idLabel: 'Medical License / Clinician ID',
      defaultId: 'MCI-NER-44921',
      defaultPass: '2026',
      assignedUser: 'Dr. Bikash Barua, MD (Neurology)',
      themeColor: '#004085',
      activeTabClass: 'bg-[#004085] text-white shadow-md',
      boxClass: 'bg-blue-50 border-blue-200 text-blue-950',
      btnClass: 'bg-[#004085] hover:bg-[#002b5c] text-white shadow-blue-900/20',
    },
  };

  const currentRoleInfo = roleDetails[selectedRole] || roleDetails.patient;

  // When changing role, simply switch selected role
  const handleSelectRole = (role: LoginRole) => {
    setSelectedRole(role);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(selectedRole);
    onLoginSuccess(selectedRole);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-between text-slate-800 font-sans">
      
      {/* 1. Official Government Header Strip */}
      <header className="bg-[#002B49] text-white shadow-sm border-b border-slate-700/50 shrink-0">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <IndianFlagBadge />
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-300">
                भारत सरकार · Government of India
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-300 font-medium hidden sm:inline">
                Ministry of Health & Family Welfare · National Health Mission (NHM)
              </span>
            </div>
          </div>

          <button
            onClick={onBrowsePublicPortal}
            className="text-xs font-bold text-slate-100 hover:text-white bg-[#003366] hover:bg-[#002244] px-3.5 py-1.5 rounded-lg border border-blue-400/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <span>Public Health Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Symmetrical, High-Visibility Center Login Box */}
      <main className="w-full max-w-lg mx-auto px-4 py-8 my-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden flex flex-col">
          
          {/* Subtle National Tricolor Line */}
          <div className="h-1.5 w-full flex shrink-0">
            <div className="h-full w-1/3 bg-[#FF9933]" />
            <div className="h-full w-1/3 bg-slate-200" />
            <div className="h-full w-1/3 bg-[#138808]" />
          </div>

          {/* Clean Portal Header */}
          <div className="bg-[#003366] text-white px-6 py-5 text-center space-y-1.5 shrink-0">
            <div className="inline-flex p-1.5 bg-white rounded-xl shadow-xs mb-1">
              <AshokaEmblem className="w-7 h-10" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
              Smriti-Setu Platform Login
            </h1>
            <p className="text-xs text-slate-200 font-medium">
              National Cognitive Health & Memory Assistance Framework
            </p>
          </div>

          {/* Login Form Body */}
          <div className="p-6 sm:p-7 space-y-5 bg-[#FAFBFD]">
            
            {/* 3 Clear Role Selector Tabs */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 text-center">
                Select Login Role
              </label>
              
              <div className="grid grid-cols-3 gap-1.5 bg-slate-200/80 p-1 rounded-xl border border-slate-300">
                {(['patient', 'caregiver', 'clinician'] as LoginRole[]).map((r) => {
                  const isSelected = selectedRole === r;
                  const info = roleDetails[r];
                  const Icon = info.icon;

                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleSelectRole(r)}
                      className={`py-2 px-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                        isSelected
                          ? info.activeTabClass
                          : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{r === 'patient' ? 'Patient' : r === 'caregiver' ? 'Caretaker' : 'Doctor'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simple Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#003366]" />
                  <span>{currentRoleInfo.idLabel}</span>
                </label>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={`Enter your ${currentRoleInfo.idLabel}`}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#003366] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#003366]" />
                  <span>Password / PIN</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password / PIN"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#003366] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Big Sign In Button */}
              <button
                type="submit"
                className={`w-full py-3 px-5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98] ${currentRoleInfo.btnClass}`}
              >
                <Lock className="w-4 h-4" />
                <span>Log In as {currentRoleInfo.title}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </form>

          </div>

          {/* Simple Footer */}
          <div className="bg-slate-100 px-6 py-2.5 border-t border-slate-200 text-center text-[11px] text-slate-600 font-medium">
            <span>Verified Secure Session · National Health Authority (NHA)</span>
          </div>

        </div>
      </main>

      {/* 3. Bottom Accreditation */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-2.5 text-center text-xs text-slate-500 font-medium border-t border-slate-300 shrink-0">
        © 2026 Ministry of Health & Family Welfare, Government of India. All rights reserved.
      </footer>

    </div>
  );
};
