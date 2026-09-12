import React, { useState } from 'react';
import { 
  UserCheck, 
  HeartPulse, 
  Stethoscope, 
  Lock, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  Sparkles,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { UserRole } from '../../types';
import { useTranslation } from 'react-i18next';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';

export const RoleSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { role, setRole } = useAuthStore();
  const { elderlyMode } = useAccessibilityStore();

  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const roleProfiles: Record<UserRole, {
    title: string;
    titleAs: string;
    badge: string;
    userName: string;
    themeClass: string;
    btnClass: string;
  }> = {
    patient: {
      title: 'Senior Patient',
      titleAs: 'ৰোগী সেৱা',
      badge: '👴 Patient Portal',
      userName: 'Patient Account (e.g. patient@smritisetu.gov.in)',
      themeClass: 'bg-rose-50 border-rose-200 text-rose-950',
      btnClass: 'bg-rose-700 hover:bg-rose-800 text-white',
    },
    caregiver: {
      title: 'Caretaker / Caregiver',
      titleAs: 'সেৱাকাৰী',
      badge: '🩺 Caretaker Portal',
      userName: 'Caregiver Account (e.g. caregiver@smritisetu.gov.in)',
      themeClass: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      btnClass: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    },
    clinician: {
      title: 'Doctor / Clinician',
      titleAs: 'চিকিৎসক',
      badge: '👨‍⚕️ Medical Specialist Portal',
      userName: 'Clinician Account (e.g. doctor@smritisetu.gov.in)',
      themeClass: 'bg-blue-50 border-blue-200 text-blue-950',
      btnClass: 'bg-[#004085] hover:bg-[#002b5c] text-white',
    },
    facility_admin: {
      title: 'Facility Admin',
      titleAs: 'প্ৰশাসনীয়',
      badge: '🏛️ Regional Admin',
      userName: 'Admin Account (e.g. admin@smritisetu.gov.in)',
      themeClass: 'bg-purple-50 border-purple-200 text-purple-950',
      btnClass: 'bg-purple-700 hover:bg-purple-800 text-white',
    }
  };

  const roleOptions: Array<{ id: UserRole; labelKey: string; icon: React.ReactNode }> = [
    { id: 'patient', labelKey: 'roles.patient', icon: <HeartPulse className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'caregiver', labelKey: 'roles.caregiver', icon: <UserCheck className="w-4 h-4 stroke-[2.5]" /> },
    { id: 'clinician', labelKey: 'roles.clinician', icon: <Stethoscope className="w-4 h-4 stroke-[2.5]" /> },
  ];

  const handleRoleButtonClick = (targetRole: UserRole) => {
    if (targetRole === role) return; // Already active role

    // Prompt real authentication for the target role
    setPendingRole(targetRole);
    setLoginId('');
    setPassword('');
    setAuthError(null);
  };

  const handleConfirmLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      setAuthError('Please enter both Email/Identifier and Password.');
      return;
    }

    setAuthError(null);
    setLoading(true);

    try {
      const user = await login(loginId, password);
      // If authentication succeeds
      if (pendingRole) {
        setRole(pendingRole);
      }
      setPendingRole(null);
    } catch (err: any) {
      setAuthError(err?.response?.data?.error || 'Invalid credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  const activePendingProfile = pendingRole ? roleProfiles[pendingRole] : null;

  return (
    <>
      {/* Role Switcher Pill Bar */}
      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300 shadow-2xs shrink-0">
        {roleOptions.map((opt) => {
          const active = role === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleRoleButtonClick(opt.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all text-xs whitespace-nowrap cursor-pointer select-none h-[34px] ${
                active
                  ? 'bg-white text-[#003366] shadow-xs font-black border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              } ${elderlyMode ? 'py-1.5 px-3 text-sm font-black' : ''}`}
              title={active ? `Active: ${opt.id}` : `Click to log in as ${opt.id}`}
            >
              <span className={active ? 'text-[#003366]' : 'text-slate-500'}>{opt.icon}</span>
              <span>{t(opt.labelKey)}</span>
              {!active && <Lock className="w-3 h-3 text-slate-400 opacity-60" />}
            </button>
          );
        })}
      </div>

      {/* Role Switch Authentication Modal */}
      {pendingRole && activePendingProfile && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-[#004085] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Lock className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                    Security Authentication Required
                  </span>
                  <h3 className="font-serif font-bold text-base text-white">
                    Switch to {activePendingProfile.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setPendingRole(null)}
                className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmLogin} className="p-6 space-y-4 bg-[#FAFBFD]">
              
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#004085]" />
                  <span>Access to this dashboard requires valid credentials.</span>
                </p>
                <p>Please enter your registered email/mobile and password to switch to <strong>{activePendingProfile.title}</strong>:</p>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <X className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Input Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Email / Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. user@smritisetu.gov.in"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#004085]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#004085]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPendingRole(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 ${activePendingProfile.btnClass}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Verifying...' : 'Authenticate & Enter Portal'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
};
