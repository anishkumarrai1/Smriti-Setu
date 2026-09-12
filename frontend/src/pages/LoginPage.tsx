import React, { useState } from 'react';
import { 
  HeartPulse, 
  UserCheck, 
  Stethoscope, 
  ArrowRight, 
  Lock, 
  User, 
  KeyRound,
  Shield,
  UserPlus,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { UserRole } from '../types';
import { AshokaEmblem, IndianFlagBadge } from '../components/common/GovEmblem';
import { AuthModal } from '../components/portal/AuthModal';

type LoginRole = 'patient' | 'caregiver' | 'clinician' | 'admin';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
  onBrowsePublicPortal: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBrowsePublicPortal,
}) => {
  const { setRole, login } = useAuthStore();
  
  // Selected Role: patient | caregiver | clinician | admin
  const [selectedRole, setSelectedRole] = useState<LoginRole>('patient');
  
  // Form Credentials (Empty by default)
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot_password'>('signup');

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot_password') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Role definitions
  const roleDetails: Record<LoginRole, {
    title: string;
    titleAs: string;
    badge: string;
    icon: any;
    idLabel: string;
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
      idLabel: 'Email / Mobile / ABHA Health ID',
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
      idLabel: 'Email / Mobile / Caretaker ID',
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
      idLabel: 'Email / Medical License ID',
      themeColor: '#004085',
      activeTabClass: 'bg-[#004085] text-white shadow-md',
      boxClass: 'bg-blue-50 border-blue-200 text-blue-950',
      btnClass: 'bg-[#004085] hover:bg-[#002b5c] text-white shadow-blue-900/20',
    },
    admin: {
      title: 'Administrator',
      titleAs: 'প্ৰশাসক',
      badge: '🛡️ Admin Audit Console',
      icon: Shield,
      idLabel: 'Admin Email Address',
      themeColor: '#D97706',
      activeTabClass: 'bg-amber-600 text-white shadow-md',
      boxClass: 'bg-amber-50 border-amber-200 text-amber-950',
      btnClass: 'bg-amber-700 hover:bg-amber-800 text-white shadow-amber-900/20',
    },
  };

  const currentRoleInfo = roleDetails[selectedRole] || roleDetails.patient;

  // When changing role, clear inputs and error
  const handleSelectRole = (role: LoginRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    setUserId('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userId.trim() || !password.trim()) {
      setErrorMsg('Please enter your registered email/mobile number and password.');
      return;
    }

    setLoading(true);

    try {
      const user = await login(userId.trim(), password);
      const resolvedRole = (selectedRole === 'admin' ? 'clinician' : selectedRole) as UserRole;
      setRole(user.assignedRole || resolvedRole);
      onLoginSuccess(user.assignedRole || resolvedRole);
    } catch (err: any) {
      console.error('Real login failed:', err);
      const msg = err?.response?.data?.error || err?.message || 'Invalid credentials. Please verify your email/mobile and password, or register a new account.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => openAuthModal('signup')}
              className="text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/70 hover:bg-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-500/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create New Account (OTP)</span>
            </button>

            <button
              onClick={onBrowsePublicPortal}
              className="text-xs font-bold text-slate-100 hover:text-white bg-[#003366] hover:bg-[#002244] px-3.5 py-1.5 rounded-lg border border-blue-400/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <span>Public Health Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Symmetrical, High-Visibility Center Login Box */}
      <main className="w-full max-w-lg mx-auto px-4 py-6 my-auto">
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
            
            {/* Error Message banner */}
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 4 Clear Role Selector Tabs including Admin */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 text-center">
                Select Login Persona
              </label>
              
              <div className="grid grid-cols-4 gap-1 bg-slate-200/80 p-1 rounded-xl border border-slate-300">
                {(['patient', 'caregiver', 'clinician', 'admin'] as LoginRole[]).map((r) => {
                  const isSelected = selectedRole === r;
                  const info = roleDetails[r];
                  const Icon = info.icon;

                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleSelectRole(r)}
                      className={`py-2 px-1.5 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer select-none ${
                        isSelected
                          ? info.activeTabClass
                          : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{r === 'patient' ? 'Patient' : r === 'caregiver' ? 'Caretaker' : r === 'clinician' ? 'Doctor' : 'Admin'}</span>
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
                  placeholder={`Enter registered email or mobile number`}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#003366] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#003366]" />
                    <span>Password</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot_password')}
                    className="text-[11px] text-[#003366] hover:underline font-bold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#003366] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Big Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98] ${currentRoleInfo.btnClass}`}
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Verifying Real Credentials...' : `Log In as ${currentRoleInfo.title}`}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </form>

            {/* Direct Registration Callout Button */}
            <div className="pt-3 border-t border-slate-200 text-center space-y-2">
              <p className="text-xs text-slate-600 font-medium">
                Need to create a new account or verify via real Email/Mobile OTP?
              </p>
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Register New Account with Email/Mobile OTP</span>
              </button>
            </div>

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

      {/* Full Production Auth & OTP Verification Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(role) => {
          setIsAuthModalOpen(false);
          onLoginSuccess(role);
        }}
      />

    </div>
  );
};
