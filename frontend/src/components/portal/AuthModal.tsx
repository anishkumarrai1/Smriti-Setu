import React, { useState, useEffect } from 'react';
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
  PhoneCall,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  UserPlus,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { authApi } from '../../services/api';
import { UserRole } from '../../types';
import { AshokaEmblem, IndianFlagBadge } from '../common/GovEmblem';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
  initialMode?: AuthMode;
}

type AuthMode = 'login' | 'signup' | 'forgot_password';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const { t } = useTranslation();
  const { setRole, login, register, isAuthenticated, systemRole } = useAuthStore();

  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
    }
  }, [isOpen, initialMode]);
  const [selectedRoleTab, setSelectedRoleTab] = useState<UserRole>('patient');
  
  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup State
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);

  const [signupMobile, setSignupMobile] = useState('');

  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupNotice, setSignupNotice] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);

  // Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotVerified, setForgotVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Cooldown timer interval
  useEffect(() => {
    let interval: any;
    if (emailCooldown > 0) {
      interval = setInterval(() => {
        setEmailCooldown((c) => Math.max(0, c - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailCooldown]);

  if (!isOpen) return null;

  // Password Policy Rules Checker
  const getPasswordRules = (pass: string) => {
    const p = pass || '';
    return {
      maxLength: p.length > 0 && p.length <= 8,
      hasUppercase: /[A-Z]/.test(p),
      hasLowercase: /[a-z]/.test(p),
      hasNumber: /[0-9]/.test(p),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(p),
      noSpaces: !/\s/.test(p),
    };
  };

  const currentRules = getPasswordRules(authMode === 'signup' ? signupPassword : newPassword);
  const isPasswordValid = Object.values(currentRules).every(Boolean);

  // Handlers for OTP Triggers
  const handleSendEmailOtp = async () => {
    if (!signupEmail || !signupEmail.includes('@')) {
      setSignupError('Please enter a valid email address.');
      return;
    }
    setSignupError(null);
    setSignupNotice(null);
    setIsSendingEmailOtp(true);
    try {
      const res: any = await authApi.sendEmailOtp(signupEmail);
      setEmailOtpSent(true);
      setEmailCooldown(res.cooldownSeconds || 60);
      setEmailOtp('');
      setSignupNotice(`OTP verification code sent to ${signupEmail}. Please check your inbox.`);
    } catch (err: any) {
      setSignupError(err?.response?.data?.error || err?.response?.data?.details || err?.message || 'Failed to send email OTP.');
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp) return;
    setSignupError(null);
    setSignupNotice(null);
    setIsVerifyingEmailOtp(true);
    try {
      await authApi.verifyEmailOtp(signupEmail, emailOtp);
      setEmailVerified(true);
      setSignupNotice('✅ Email verified successfully!');
    } catch (err: any) {
      setSignupError(err?.response?.data?.error || err?.message || 'Invalid or expired email OTP.');
    } finally {
      setIsVerifyingEmailOtp(false);
    }
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const user = await login(loginIdentifier, loginPassword);
      setRole(user.assignedRole || selectedRoleTab);
      onLoginSuccess(user.assignedRole || selectedRoleTab);
      onClose();
    } catch (err: any) {
      setLoginError(err?.response?.data?.error || 'Invalid email/mobile or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Submit Signup
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!emailVerified) {
      setSignupError('Email must be OTP verified before account creation. Please verify the OTP sent to your email.');
      return;
    }

    if (!isPasswordValid) {
      setSignupError('Password must meet all safety requirements (Max 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol, no spaces).');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }

    setSignupLoading(true);
    try {
      const user = await register({
        fullName,
        email: signupEmail,
        emailVerified: true,
        mobileNumber: signupMobile || '',
        mobileVerified: false,
        password: signupPassword,
        assignedRole: selectedRoleTab,
      });

      setRole(user.assignedRole || selectedRoleTab);
      onLoginSuccess(user.assignedRole || selectedRoleTab);
      onClose();
    } catch (err: any) {
      setSignupError(err?.response?.data?.error || 'Account creation failed.');
    } finally {
      setSignupLoading(false);
    }
  };

  // Submit Forgot Password OTP Request
  const handleSendForgotOtp = async () => {
    if (!forgotIdentifier) return;
    setForgotError(null);
    try {
      const res = await authApi.forgotPassword(forgotIdentifier);
      setForgotOtpSent(true);
      setForgotMessage(res.message);
    } catch (err: any) {
      setForgotError(err?.response?.data?.error || 'Failed to request reset OTP.');
    }
  };

  // Verify Forgot Password OTP
  const handleVerifyForgotOtp = async () => {
    if (!forgotOtp) return;
    setForgotError(null);
    try {
      const isEmail = forgotIdentifier.includes('@');
      if (isEmail) {
        await authApi.verifyEmailOtp(forgotIdentifier, forgotOtp);
      } else {
        await authApi.verifyMobileOtp(forgotIdentifier, forgotOtp);
      }
      setForgotVerified(true);
    } catch (err: any) {
      setForgotError(err?.response?.data?.error || 'Invalid or expired OTP.');
    }
  };

  // Submit Password Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setForgotError('Password must satisfy all rules.');
      return;
    }

    setForgotLoading(true);
    try {
      await authApi.resetPassword(forgotIdentifier, forgotOtp, newPassword);
      alert('Password reset successfully! Please log in with your new password.');
      setAuthMode('login');
      setLoginIdentifier(forgotIdentifier);
    } catch (err: any) {
      setForgotError(err?.response?.data?.error || 'Password reset failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Central Floating Pop-up Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col my-auto animate-scaleUp">
        
        {/* Tiranga Tricolor Line */}
        <div className="h-1.5 w-full flex shrink-0">
          <div className="h-full w-1/3 bg-[#FF9933]" />
          <div className="h-full w-1/3 bg-slate-200" />
          <div className="h-full w-1/3 bg-[#138808]" />
        </div>

        {/* Modal Header Strip */}
        <div className="bg-[#002B49] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1 bg-white rounded-lg shadow-xs shrink-0">
              <AshokaEmblem className="w-5 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  भारत सरकार · GOI
                </span>
                <span className="text-[9px] bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold">
                  🔒 256-Bit SSL
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
                {authMode === 'signup' 
                  ? 'Create New Account' 
                  : authMode === 'forgot_password' 
                  ? 'Reset Account Password' 
                  : 'Platform Log In'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-600/60"
            title="Close popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Sub-Header & Persona Switcher */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          {/* Persona selector */}
          <div className="flex items-center gap-1 bg-slate-200/90 p-1 rounded-xl w-full">
            {[
              { id: 'patient' as UserRole, label: 'Patient', icon: HeartPulse, active: 'bg-rose-700 text-white' },
              { id: 'caregiver' as UserRole, label: 'Caretaker', icon: UserCheck, active: 'bg-emerald-700 text-white' },
              { id: 'clinician' as UserRole, label: 'Doctor', icon: Stethoscope, active: 'bg-[#003366] text-white' },
            ].map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRoleTab === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRoleTab(r.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected ? `${r.active} shadow-xs` : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Form Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-[#FAFBFD]">

          {/* MODE 1: SIGNUP (REGISTRATION POPUP) */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {signupError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              {signupNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{signupNotice}</span>
                </div>
              )}

              {/* Full Legal Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra Barman"
                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#003366] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Email & OTP Verification */}
              <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#003366]" />
                    <span>Email Address</span>
                  </label>
                  {emailVerified && (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> OTP Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="email"
                    required
                    disabled={emailVerified}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="e.g. user@smritisetu.gov.in"
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#003366]"
                  />
                  {!emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={emailCooldown > 0 || isSendingEmailOtp}
                      className="px-3 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold shrink-0 cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1 shadow-2xs"
                    >
                      {isSendingEmailOtp && <RefreshCw className="w-3 h-3 animate-spin" />}
                      {isSendingEmailOtp
                        ? 'Sending...'
                        : emailCooldown > 0
                        ? `Resend (${emailCooldown}s)`
                        : emailOtpSent
                        ? 'Resend OTP'
                        : 'Send OTP'}
                    </button>
                  )}
                </div>

                {emailOtpSent && !emailVerified && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP code"
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white rounded-xl border border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyEmailOtp}
                      disabled={isVerifyingEmailOtp || !emailOtp}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1 disabled:opacity-50 shadow-2xs"
                    >
                      {isVerifyingEmailOtp && <RefreshCw className="w-3 h-3 animate-spin" />}
                      {isVerifyingEmailOtp ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-[#003366]" />
                  <span>Mobile Number</span>
                </label>
                <input
                  type="tel"
                  required
                  value={signupMobile}
                  onChange={(e) => setSignupMobile(e.target.value)}
                  placeholder="e.g. +91 98640 12345"
                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#003366] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Max 8 chars"
                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#003366]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#003366]"
                  />
                </div>
              </div>

              {/* Password Rule Badges */}
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] space-y-1">
                <span className="font-bold text-amber-900 block">Password Criteria:</span>
                <div className="grid grid-cols-3 gap-1 font-semibold text-[10px]">
                  <span className={currentRules.maxLength ? 'text-emerald-700' : 'text-slate-500'}>
                    {currentRules.maxLength ? '✓' : '○'} Max 8 chars
                  </span>
                  <span className={currentRules.hasUppercase ? 'text-emerald-700' : 'text-slate-500'}>
                    {currentRules.hasUppercase ? '✓' : '○'} 1 Uppercase
                  </span>
                  <span className={currentRules.hasLowercase ? 'text-emerald-700' : 'text-slate-500'}>
                    {currentRules.hasLowercase ? '✓' : '○'} 1 Lowercase
                  </span>
                  <span className={currentRules.hasNumber ? 'text-emerald-700' : 'text-slate-500'}>
                    {currentRules.hasNumber ? '✓' : '○'} 1 Number
                  </span>
                  <span className={currentRules.hasSpecialChar ? 'text-emerald-700' : 'text-slate-500'}>
                    {currentRules.hasSpecialChar ? '✓' : '○'} 1 Symbol (!@#)
                  </span>
                  <span className={currentRules.noSpaces ? 'text-emerald-700' : 'text-slate-500'}>
                    {currentRules.noSpaces ? '✓' : '○'} No spaces
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={signupLoading || !emailVerified || !signupMobile || !isPasswordValid}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {signupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>Create Account & Sign In as {selectedRoleTab.toUpperCase()}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs font-bold text-[#003366] hover:underline cursor-pointer"
                >
                  Already have an account? Log In here
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: LOGIN POPUP */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#003366]" />
                  <span>Registered Email or Mobile</span>
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. user@smritisetu.gov.in"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-[#003366]" />
                    <span>Password</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot_password')}
                    className="text-xs font-bold text-[#003366] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#003366]"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>Log In as {selectedRoleTab.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Don't have an account? Register New Account
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD */}
          {authMode === 'forgot_password' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
              {forgotError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{forgotMessage}</span>
                </div>
              )}

              {!forgotVerified ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Registered Email or Mobile</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="user@smritisetu.gov.in"
                        className="w-full px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#003366]"
                      />
                      <button
                        type="button"
                        onClick={handleSendForgotOtp}
                        className="px-3.5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
                      >
                        Send OTP
                      </button>
                    </div>
                  </div>

                  {forgotOtpSent && (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP code"
                        className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-white rounded-xl border border-amber-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyForgotOtp}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
                      >
                        Verify OTP
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (max 8 chars)"
                      className="w-full px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#003366]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading || !isPasswordValid}
                    className="w-full py-3 px-4 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    <span>Update Password & Log In</span>
                  </button>
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs font-bold text-[#003366] hover:underline cursor-pointer"
                >
                  Back to Log In
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer Strip */}
        <div className="bg-slate-100 px-4 sm:px-6 py-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <IndianFlagBadge />
            <span>National Cognitive Health Platform</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
