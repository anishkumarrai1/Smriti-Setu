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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-[#031326] via-[#081F38] to-[#031326] flex flex-col justify-between p-3 sm:p-6 md:p-8 animate-fadeIn text-slate-100 relative">
      
      {/* Background Glows & Ashok Chakra Watermark */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#FF9933]/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-10 w-[600px] h-[350px] bg-[#138808]/15 rounded-full blur-3xl" />
      </div>

      {/* 1. Header Strip */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 py-2 border-b border-slate-700/60 shrink-0">
        <div className="flex items-center gap-3">
          <IndianFlagBadge />
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400">
              भारत सरकार · National Health Mission
            </span>
            <span className="text-[11px] text-slate-300 font-bold hidden sm:inline">
              Ministry of Health & Family Welfare · Smriti-Setu AI Tele-Grid
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-4 py-1.5 rounded-xl border border-slate-600 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105"
          >
            <span>Close</span>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 2. Central Elevated Official Gateway Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto my-auto py-4 sm:py-6">
        <div className="bg-white text-slate-900 rounded-3xl sm:rounded-4xl shadow-2xl border-2 border-slate-300/90 overflow-hidden flex flex-col backdrop-blur-md">
          
          {/* Official Tiranga Tricolor Line */}
          <div className="h-2.5 w-full flex shrink-0">
            <div className="h-full w-1/3 bg-[#FF9933]" />
            <div className="h-full w-1/3 bg-white" />
            <div className="h-full w-1/3 bg-[#138808]" />
          </div>

          {/* Modal Header */}
          <div className="bg-[#0A2540] text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 shrink-0 relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-2 bg-white rounded-2xl shadow-md shrink-0">
                <AshokaEmblem className="w-10 h-14" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                    Official Production Authentication
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border border-emerald-400/40">
                    🔒 SSL 256-Bit & bcrypt Encrypted
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
                  {authMode === 'login' ? 'Smriti-Setu Login' : authMode === 'signup' ? 'Create New Account' : 'Forgot Password'}
                </h1>
              </div>
            </div>

            {/* Auth Mode Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-2xl border border-slate-700">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  authMode === 'login' ? 'bg-[#004085] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  authMode === 'signup' ? 'bg-[#004085] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 space-y-6 bg-[#FDFBF7]">

            {/* 3 Core Roles Switcher */}
            <div className="grid grid-cols-3 gap-2 bg-slate-200/80 p-1 rounded-2xl border border-slate-300">
              {[
                { id: 'patient' as UserRole, label: 'Patient Portal', icon: HeartPulse, color: 'text-rose-700' },
                { id: 'caregiver' as UserRole, label: 'Caretaker Portal', icon: UserCheck, color: 'text-emerald-700' },
                { id: 'clinician' as UserRole, label: 'Doctor Portal', icon: Stethoscope, color: 'text-blue-700' },
              ].map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRoleTab === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRoleTab(r.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                      isSelected ? 'bg-[#004085] text-white shadow-md' : 'text-slate-700 hover:bg-white/70'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>

            {/* MODE 1: LOGIN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                {loginError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#004085]" />
                    <span>Verified Email Address or Mobile Number:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. user@smritisetu.gov.in or +91 98640 12345"
                    className="w-full px-4 py-3 text-xs font-semibold text-slate-900 bg-slate-50 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004085]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#004085]" />
                      <span>Password:</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot_password')}
                      className="text-xs font-bold text-[#004085] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 text-xs font-semibold text-slate-900 bg-slate-50 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004085]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#004085] hover:bg-[#0A2540] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    <span>Log In to {selectedRoleTab.toUpperCase()} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* MODE 2: REAL SIGNUP FORM WITH OTP VERIFICATION & LIVE PASSWORD RULES */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                {signupError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{signupError}</span>
                  </div>
                )}

                {signupNotice && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-black flex items-center gap-2 animate-pulse">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{signupNotice}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ranjit Borthakur"
                      className="w-full px-4 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none"
                    />
                  </div>

                  {/* Email & OTP Verification */}
                  <div className="sm:col-span-2 space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#004085]" />
                        <span>Email Address:</span>
                      </label>
                      {emailVerified && (
                        <span className="text-xs font-black text-emerald-700 flex items-center gap-1 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        required
                        disabled={emailVerified}
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="user@smritisetu.gov.in"
                        className="w-full px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none"
                      />
                      {!emailVerified && (
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          disabled={emailCooldown > 0 || isSendingEmailOtp}
                          className="px-3.5 py-2 rounded-xl bg-[#004085] hover:bg-[#0A2540] text-white text-xs font-bold shrink-0 cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isSendingEmailOtp && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                          {isSendingEmailOtp
                            ? 'Sending...'
                            : emailCooldown > 0
                            ? `Resend (${emailCooldown}s)`
                            : emailOtpSent
                            ? 'Resend OTP'
                            : 'Send Email OTP'}
                        </button>
                      )}
                    </div>

                    {emailOtpSent && !emailVerified && (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value)}
                          placeholder="Enter 6-digit Email OTP"
                          className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white rounded-xl border border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyEmailOtp}
                          disabled={isVerifyingEmailOtp || !emailOtp}
                          className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isVerifyingEmailOtp && <RefreshCw className="w-3 h-3 animate-spin" />}
                          {isVerifyingEmailOtp ? 'Verifying...' : 'Verify OTP'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mobile Number (Direct Input) */}
                  <div className="sm:col-span-2 space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#004085]" />
                      <span>Mobile Number (with Country Code):</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={signupMobile}
                      onChange={(e) => setSignupMobile(e.target.value)}
                      placeholder="+91 98640 12345"
                      className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004085]"
                    />
                  </div>

                  {/* Password & Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Max 8 characters"
                      className="w-full px-4 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none"
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
                      className="w-full px-4 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password Live Requirement Indicators */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1 text-xs">
                  <span className="font-extrabold text-amber-900 block mb-1">Password Requirements:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] font-bold">
                    <span className={currentRules.maxLength ? 'text-emerald-700' : 'text-slate-500'}>
                      {currentRules.maxLength ? '✓' : '○'} Max 8 chars
                    </span>
                    <span className={currentRules.hasUppercase ? 'text-emerald-700' : 'text-slate-500'}>
                      {currentRules.hasUppercase ? '✓' : '○'} 1 Uppercase (A-Z)
                    </span>
                    <span className={currentRules.hasLowercase ? 'text-emerald-700' : 'text-slate-500'}>
                      {currentRules.hasLowercase ? '✓' : '○'} 1 Lowercase (a-z)
                    </span>
                    <span className={currentRules.hasNumber ? 'text-emerald-700' : 'text-slate-500'}>
                      {currentRules.hasNumber ? '✓' : '○'} 1 Digit (0-9)
                    </span>
                    <span className={currentRules.hasSpecialChar ? 'text-emerald-700' : 'text-slate-500'}>
                      {currentRules.hasSpecialChar ? '✓' : '○'} 1 Symbol (!@#$)
                    </span>
                    <span className={currentRules.noSpaces ? 'text-emerald-700' : 'text-slate-500'}>
                      {currentRules.noSpaces ? '✓' : '○'} No spaces
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={signupLoading || !emailVerified || !signupMobile || !isPasswordValid}
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {signupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Create Account & Log In</span>
                </button>
              </form>
            )}

            {/* MODE 3: FORGOT PASSWORD FLOW */}
            {authMode === 'forgot_password' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                {forgotError && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotMessage && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{forgotMessage}</span>
                  </div>
                )}

                {!forgotVerified ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Registered Email or Mobile Number</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={forgotIdentifier}
                          onChange={(e) => setForgotIdentifier(e.target.value)}
                          placeholder="user@smritisetu.gov.in or +91 98640 12345"
                          className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSendForgotOtp}
                          className="px-4 py-2.5 rounded-xl bg-[#004085] hover:bg-[#0A2540] text-white font-bold text-xs shrink-0 cursor-pointer"
                        >
                          Send OTP
                        </button>
                      </div>
                    </div>

                    {forgotOtpSent && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-white rounded-xl border border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyForgotOtp}
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 cursor-pointer"
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
                        placeholder="Enter new password"
                        className="w-full px-4 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading || !isPasswordValid}
                      className="w-full py-3 px-6 rounded-2xl bg-[#004085] hover:bg-[#0A2540] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {forgotLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      <span>Update Password & Log In</span>
                    </button>
                  </div>
                )}
              </form>
            )}

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
              <span>Browse Public Health Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
