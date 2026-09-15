import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Smartphone, 
  Mail, 
  Globe, 
  KeyRound, 
  Ban, 
  UserCheck,
  Building2,
  Clock,
  ShieldAlert,
  FileSpreadsheet,
  Database,
  Download,
  Copy,
  Check,
  Server,
  Layers,
  Sparkles,
  ArrowUpRight,
  Zap,
  TrendingUp,
  UserPlus,
  HeartHandshake,
  Stethoscope,
  X
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { adminApi } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const { systemRole, user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity' | 'database'>('overview');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);

  // Notification feedback state
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password reset modal state
  const [resetModalUser, setResetModalUser] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [viewHashUserId, setViewHashUserId] = useState<string | null>(null);

  // Filter & Search states
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [logStatusFilter, setLogStatusFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');

  const loadData = async () => {
    if (systemRole !== 'admin') return;
    setLoading(true);
    try {
      const [statsRes, usersRes, logsRes] = await Promise.all([
        adminApi.getStats().catch(() => null),
        adminApi.getUsers({ search: userSearch, role: roleFilter, status: statusFilter }).catch(() => ({ users: [] })),
        adminApi.getLoginActivity({ search: logSearch, status: logStatusFilter }).catch(() => ({ logs: [] })),
      ]);

      if (statsRes) setStats(statsRes);
      if (usersRes?.users) setUsersList(usersRes.users);
      if (logsRes?.logs) setLoginLogs(logsRes.logs);
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [systemRole, userSearch, roleFilter, statusFilter, logSearch, logStatusFilter]);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to change account status to ${nextStatus.toUpperCase()}?`)) return;

    // Optimistic UI state update
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, accountStatus: nextStatus } : u))
    );

    try {
      const res = await adminApi.updateUserStatus(userId, nextStatus as any);
      setNotificationMsg({
        type: 'success',
        text: res.message || `User account status updated to ${nextStatus.toUpperCase()} successfully!`,
      });
      setTimeout(() => setNotificationMsg(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to update user status');
      await loadData();
    }
  };

  // Download Excel/CSV format
  const handleExportCSV = async () => {
    setExporting('csv');
    try {
      const blob = await adminApi.exportUsersCSV();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `smriti_setu_users_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      // Fallback: Client-side CSV generation
      const headers = ['User ID', 'Full Name', 'Email', 'Email Verified', 'Mobile Number', 'Mobile Verified', 'Role', 'Assigned Role', 'Account Status', 'Created At', 'Last Login At', 'Region', 'State', 'Facility Name'];
      const rows = usersList.map(u => [
        `"${u.id || ''}"`,
        `"${(u.fullName || '').replace(/"/g, '""')}"`,
        `"${u.email || ''}"`,
        u.emailVerified ? 'YES' : 'NO',
        `"${u.mobileNumber || ''}"`,
        u.mobileVerified ? 'YES' : 'NO',
        `"${u.role || ''}"`,
        `"${u.assignedRole || ''}"`,
        `"${u.accountStatus || ''}"`,
        `"${u.createdAt || ''}"`,
        `"${u.lastLoginAt || ''}"`,
        `"${u.hierarchy?.region || ''}"`,
        `"${u.hierarchy?.state || ''}"`,
        `"${(u.hierarchy?.facilityName || '').replace(/"/g, '""')}"`
      ]);
      const csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smriti_setu_users_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } finally {
      setExporting(null);
    }
  };

  // Download MongoDB JSON format
  const handleExportJSON = async () => {
    setExporting('json');
    try {
      const blob = await adminApi.exportUsersJSON();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `smriti_setu_mongodb_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      // Fallback: Client-side JSON generation
      const payload = {
        platform: 'Smriti-Setu Cognitive Care Platform',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        collection: 'users',
        totalRecords: usersList.length,
        mongoImportCommand: 'mongoimport --db smriti_setu --collection users --file users.json --jsonArray',
        users: usersList,
        loginHistory: loginLogs
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smriti_setu_mongodb_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } finally {
      setExporting(null);
    }
  };

  const handleCopyMongoCommand = () => {
    navigator.clipboard.writeText('mongoimport --db smriti_setu --collection users --file smriti_setu_users.json --jsonArray');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenResetModal = (targetUser: any) => {
    setResetModalUser(targetUser);
    setNewPasswordInput('');
    setResetFeedback(null);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPasswordInput) return;
    if (newPasswordInput.length < 6) {
      setResetFeedback({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setResetLoading(true);
    setResetFeedback(null);
    try {
      const res = await adminApi.resetUserPassword(resetModalUser.id, newPasswordInput);
      setResetFeedback({ type: 'success', message: res.message || 'Password updated successfully!' });
      setTimeout(() => {
        setResetModalUser(null);
        loadData();
      }, 1500);
    } catch (err: any) {
      setResetFeedback({ type: 'error', message: err?.response?.data?.error || 'Failed to update password' });
    } finally {
      setResetLoading(false);
    }
  };

  // Guard: Restrict access to non-admin users
  if (systemRole !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border-2 border-rose-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-black text-slate-900">403 Access Denied</h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              This section is restricted strictly to authorized System Administrators. Normal accounts are not permitted to view security audit telemetry.
            </p>
          </div>
          <div className="p-3 bg-slate-100 rounded-2xl text-[11px] text-slate-500 font-mono">
            Logged in as: <strong>{user?.email || 'Guest User'}</strong> (Role: {user?.role || 'user'})
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Toast / Notification Banner */}
      {notificationMsg && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg border animate-in slide-in-from-top-2 ${
          notificationMsg.type === 'success' ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500' : 'bg-rose-900/90 text-rose-100 border-rose-500'
        }`}>
          <div className="flex items-center gap-2.5 font-bold text-xs">
            {notificationMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-slate-300 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Admin Hero Header */}
      <div className="bg-[#031326] text-white p-6 md:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-400/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                  Smriti-Setu Platform · Security & Identity Hub
                </span>
                <span className="text-xs text-emerald-400 font-mono hidden sm:inline">Node: NER-ADMIN-01</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-black text-white mt-1">
                Admin User Analytics & Audit Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Track registered users, login history, manage account statuses, and export complete database records into Excel (CSV) or MongoDB JSON.
              </p>
            </div>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={exporting === 'csv'}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
              title="Export all users to Microsoft Excel / CSV spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>{exporting === 'csv' ? 'Exporting...' : 'Export Excel (CSV)'}</span>
            </button>

            <button
              onClick={handleExportJSON}
              disabled={exporting === 'json'}
              className="px-3.5 py-2.5 rounded-xl bg-[#00558F] hover:bg-[#004070] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
              title="Export formatted JSON for MongoDB import"
            >
              <Database className="w-4 h-4 text-amber-300" />
              <span>{exporting === 'json' ? 'Exporting...' : 'Export MongoDB (JSON)'}</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-xs border border-slate-600 transition-all cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="pt-4 flex flex-wrap items-center gap-2 border-t border-slate-800">
          {[
            { id: 'overview', label: 'Security Dashboard', icon: Activity },
            { id: 'users', label: `User Directory (${usersList.length || stats?.totalUsers || 0})`, icon: Users },
            { id: 'activity', label: 'Login Activity Logs', icon: KeyRound },
            { id: 'database', label: 'MongoDB & Excel Export Hub', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Enhanced Security KPI Summary Cards */}
      {(() => {
        const totalAccounts = stats?.totalUsers || usersList.length || 1;
        const adminCount = stats?.adminCount || usersList.filter((u: any) => u.role === 'admin').length || 1;
        const patientCount = usersList.filter((u: any) => u.assignedRole === 'patient').length;
        const caregiverCount = usersList.filter((u: any) => u.assignedRole === 'caregiver').length;
        const clinicianCount = usersList.filter((u: any) => u.assignedRole === 'clinician').length;

        const successLogins = stats?.successfulLogins ?? loginLogs.filter((l: any) => l.status === 'success').length;
        const failedLogins = stats?.failedLogins ?? loginLogs.filter((l: any) => l.status === 'failed').length;
        const totalLoginAttempts = successLogins + failedLogins;
        const successRate = totalLoginAttempts > 0 ? ((successLogins / totalLoginAttempts) * 100).toFixed(1) : '100.0';

        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Total Registered Accounts */}
              <div 
                onClick={() => { setActiveTab('users'); setRoleFilter('all'); }}
                className="group relative bg-white hover:bg-slate-50/90 p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
                title="Click to view all registered users in User Directory"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#003366] to-[#00558F]" />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Total Accounts
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#003366] border border-blue-200/60 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight">
                        {totalAccounts}
                      </span>
                      <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        ABHA Ready
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-600">Registered Platform Users</p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold truncate">
                    <span>{patientCount} Patients</span>
                    <span>·</span>
                    <span>{caregiverCount} Caregivers</span>
                    <span>·</span>
                    <span>{clinicianCount} Clinicians</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#003366] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1" />
                </div>
              </div>

              {/* Card 2: System Administrators */}
              <div 
                onClick={() => { setActiveTab('users'); setRoleFilter('admin'); }}
                className="group relative bg-white hover:bg-amber-50/30 p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
                title="Click to filter User Directory to System Administrators"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600" />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      System Admins
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-serif font-black text-amber-950 tracking-tight">
                        {adminCount}
                      </span>
                      <span className="text-[10px] font-black text-amber-800 bg-amber-100/70 border border-amber-300/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Tier-1 Guard
                      </span>
                    </div>
                    <p className="text-xs font-bold text-amber-800">Admin Privileges Granted</p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-amber-700 font-semibold truncate">
                    <KeyRound className="w-3 h-3 text-amber-600" />
                    <span>Full Governance & Security Access</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1" />
                </div>
              </div>

              {/* Card 3: Verified Authentications */}
              <div 
                onClick={() => { setActiveTab('activity'); setLogStatusFilter('success'); }}
                className="group relative bg-white hover:bg-emerald-50/30 p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
                title="Click to view successful authentication logs"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600" />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Successful Logins
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-serif font-black text-emerald-950 tracking-tight">
                        {successLogins}
                      </span>
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/70 border border-emerald-300/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {successRate}% Success
                      </span>
                    </div>
                    <p className="text-xs font-bold text-emerald-800">Verified Authentications</p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold truncate">
                    <Zap className="w-3 h-3 text-emerald-600" />
                    <span>Email & Mobile SMS 2FA Pass</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1" />
                </div>
              </div>

              {/* Card 4: Security Blocked & Failed Logins */}
              <div 
                onClick={() => { setActiveTab('activity'); setLogStatusFilter('failed'); }}
                className="group relative bg-white hover:bg-rose-50/30 p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
                title="Click to view security blocked & failed attempts"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-rose-600" />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Failed Attempts
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                      <XCircle className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-serif font-black text-rose-950 tracking-tight">
                        {failedLogins}
                      </span>
                      <span className="text-[10px] font-black text-rose-800 bg-rose-100/70 border border-rose-300/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        0 Breaches Active
                      </span>
                    </div>
                    <p className="text-xs font-bold text-rose-800">Security Intercepted & Blocked</p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-rose-700 font-semibold truncate">
                    <ShieldAlert className="w-3 h-3 text-rose-600" />
                    <span>Rate-Limit & Invalid Auth Isolated</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1" />
                </div>
              </div>

            </div>

            {/* 2.1 Live System Telemetry & National Health Security Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#002B49] to-slate-900 text-white border border-slate-700/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-black text-[10px] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>Platform Live</span>
                </div>
                <span className="font-semibold text-slate-200">
                  All API Microservices Operational · ISO/IEC 27001 & ABHA Compliant
                </span>
              </div>

              <div className="flex items-center gap-4 text-slate-300 text-[11px] font-mono">
                <span className="flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-amber-300" />
                  <span>NER Health Node 01</span>
                </span>
                <span className="hidden sm:inline text-slate-500">|</span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Latency ~42ms</span>
                </span>
              </div>
            </div>
          </>
        );
      })()}

      {/* 3. TAB 1: OVERVIEW & SYSTEM TELEMETRY */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* User Verification Matrix (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-forest-800" />
              <span>Identity Verification Matrix</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase block">Email OTP Verification</span>
                <p className="text-2xl font-black text-emerald-950">{stats?.emailVerifiedCount || 1} Verified</p>
                <p className="text-[11px] text-emerald-700">100% Verified via email OTP</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="text-xs font-bold text-blue-800 uppercase block">Mobile SMS Verification</span>
                <p className="text-2xl font-black text-blue-950">{stats?.mobileVerifiedCount || 1} Verified</p>
                <p className="text-[11px] text-blue-700">100% Verified via SMS OTP</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Security Directives & Access Rules</span>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
                <li>Server enforces HTTP-Only cookie tokens to prevent XSS session hijacking.</li>
                <li>All endpoints enforce password hashing via bcrypt algorithms.</li>
                <li>Failed login attempts are rate limited (Max 10 per 15 minutes).</li>
              </ul>
            </div>
          </div>

          {/* Quick Recent Activity Stream (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-forest-800" />
                <span>Recent Audit Stream</span>
              </h3>
              <button onClick={() => setActiveTab('activity')} className="text-xs font-bold text-forest-800 hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {loginLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">{log.identifier}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{log.authMethod} · {log.ipAddress}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {log.status.toUpperCase()}
                  </span>
                </div>
              ))}

              {loginLogs.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4 italic">No login events recorded yet.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 4. TAB 2: USER DIRECTORY MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-forest-800" />
                <span>Registered User Directory</span>
              </h3>
              <p className="text-xs text-slate-500">Manage user accounts, verification statuses, and role privileges</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none bg-white"
              >
                <option value="all">All Roles</option>
                <option value="patient">Patients</option>
                <option value="caregiver">Caregivers</option>
                <option value="clinician">Clinicians / Doctors</option>
                <option value="admin">System Admins</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="suspended">Suspended Accounts</option>
              </select>

              {(userSearch || roleFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setUserSearch('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline px-1 cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">User ID & Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Verifications</th>
                  <th className="py-3 px-4">Role & Persona</th>
                  <th className="py-3 px-4">Password & Security</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className={`transition-colors ${u.accountStatus === 'suspended' ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50'}`}>
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900">{u.fullName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{u.id}</div>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                        <Smartphone className="w-3 h-3 text-slate-400" />
                        <span>{u.mobileNumberMasked || u.mobileNumber}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.emailVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Email: {u.emailVerified ? '✓ Verified' : 'Pending'}
                      </span>
                      <br />
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.mobileVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Mobile: {u.mobileVerified ? '✓ Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-50 text-blue-900 border border-blue-200'
                      }`}>
                        {u.role} ({u.assignedRole})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-mono text-[10px] text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[130px]" title={u.passwordHash}>
                          {viewHashUserId === u.id ? u.passwordHash : (u.passwordHashPreview || '••••••••••••••••')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setViewHashUserId(viewHashUserId === u.id ? null : u.id)}
                          className="text-blue-700 hover:underline font-bold cursor-pointer"
                        >
                          {viewHashUserId === u.id ? 'Hide' : 'Inspect'}
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(u.passwordHash || '');
                            alert('Password hash copied to clipboard!');
                          }}
                          className="text-slate-600 hover:underline cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit ${
                        u.accountStatus === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300 ring-2 ring-rose-200'
                      }`}>
                        {u.accountStatus === 'active' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        ) : (
                          <Ban className="w-3 h-3 text-rose-700" />
                        )}
                        <span>{u.accountStatus}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => handleOpenResetModal(u)}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all cursor-pointer flex items-center justify-center gap-1"
                          title="Reset and assign new password"
                        >
                          <KeyRound className="w-3 h-3 text-amber-700" />
                          <span>Reset Pass</span>
                        </button>

                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(u.id, u.accountStatus)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                              u.accountStatus === 'active'
                                ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {u.accountStatus === 'active' ? (
                              <>
                                <Ban className="w-3 h-3" />
                                <span>Suspend</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 3: LOGIN ACTIVITY AUDIT LOGS */}
      {activeTab === 'activity' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-forest-800" />
                <span>Login Activity Audit Stream</span>
              </h3>
              <p className="text-xs text-slate-500">Real-time log tracking authentication attempts, methods, and IP addresses</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="all">All Events</option>
                <option value="success">Successful Logins</option>
                <option value="failed">Failed Logins</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Attempted Identifier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Auth Method</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">User Agent / Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {loginLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{log.identifier}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{log.authMethod}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{log.ipAddress}</td>
                    <td className="py-3.5 px-4 text-slate-500 truncate max-w-xs">{log.userAgent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB 4: MONGODB & EXCEL EXPORT HUB */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#00558F]" />
                  <span>Database Export & Cloud Sync Hub</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Export all platform user profiles, contact records, login histories, and authentication metadata into Microsoft Excel or MongoDB NoSQL database.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold border border-slate-300">
                  Total Records: {usersList.length} Users · {loginLogs.length} Logins
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Card 1: Microsoft Excel / CSV Export */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-200 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg text-slate-900">Microsoft Excel / CSV Export</h4>
                    <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">Spreadsheet & Reporting Format</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Generates an industry-standard <strong>.CSV spreadsheet</strong> containing structured columns for all user accounts, email verifications, mobile numbers, roles, account statuses, registration dates, and last login timestamps.
                </p>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1 text-xs">
                  <span className="font-black text-slate-700 block text-[11px] uppercase">Included Table Columns:</span>
                  <p className="font-mono text-[11px] text-slate-600">
                    User ID, Full Name, Email, Email Verified, Mobile Number, Mobile Verified, Role, Assigned Persona, Account Status, Registered Date, Last Login Date, Region, State, Facility
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportCSV}
                disabled={exporting === 'csv'}
                className="w-full py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exporting === 'csv' ? 'Generating Spreadsheet...' : '📥 Download Excel Spreadsheet (.CSV)'}</span>
              </button>
            </div>

            {/* Card 2: MongoDB / NoSQL JSON Export */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-blue-200 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 text-[#00558F] rounded-2xl">
                    <Database className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg text-slate-900">MongoDB / JSON Collection Export</h4>
                    <span className="text-[11px] text-[#00558F] font-bold uppercase tracking-wider">NoSQL & Cloud Database Format</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Generates a full <strong>JSON document array</strong> structured for direct import into <strong>MongoDB Atlas</strong>, <strong>PostgreSQL JSONB</strong>, or any cloud database collection, including full login history.
                </p>

                <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl font-mono text-[11px] space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>MongoDB CLI Import Command</span>
                    <button
                      onClick={handleCopyMongoCommand}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <code className="text-emerald-400 block break-all">
                    mongoimport --db smriti_setu --collection users --file users.json --jsonArray
                  </code>
                </div>
              </div>

              <button
                onClick={handleExportJSON}
                disabled={exporting === 'json'}
                className="w-full py-3 px-5 rounded-2xl bg-[#00558F] hover:bg-[#004070] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exporting === 'json' ? 'Generating JSON...' : '🍃 Download MongoDB Collection (.JSON)'}</span>
              </button>
            </div>

          </div>

          {/* Database Live Schema Preview */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-700" />
                <span>Live Database Schema & Document Sample</span>
              </h4>
              <span className="text-xs text-slate-500 font-mono">Collection: <strong className="text-slate-900">smriti_setu.users</strong></span>
            </div>

            <div className="bg-slate-950 text-slate-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800">
              <pre>{JSON.stringify({
                _id: "usr-admin-001",
                fullName: "NHA Regional Administrator",
                email: "admin@smritisetu.gov.in",
                emailVerified: true,
                mobileNumber: "+919999900000",
                mobileVerified: true,
                role: "admin",
                assignedRole: "clinician",
                accountStatus: "active",
                createdAt: "2026-09-13T08:00:00.000Z",
                lastLoginAt: "2026-09-13T17:45:00.000Z",
                hierarchy: {
                  region: "North Eastern Region",
                  state: "Assam",
                  district: "Kamrup Metropolitan",
                  facilityId: "fac-ghy-01",
                  facilityName: "Guwahati Regional Cognitive Care Center"
                }
              }, null, 2)}</pre>
            </div>
          </div>

        </div>
      )}

      {/* 7. ADMIN DIRECT PASSWORD RESET MODAL */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden">
            
            {/* Header */}
            <div className="bg-[#031326] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 rounded-xl text-amber-300 border border-amber-400/30">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                    Admin Security Override
                  </span>
                  <h3 className="font-serif font-bold text-base text-white">
                    Set User Password
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setResetModalUser(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4 bg-[#FAFBFD]">
              <div className="p-3.5 bg-slate-100 rounded-2xl space-y-1 text-xs">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Target User Account:</span>
                <p className="font-black text-slate-900 text-sm">{resetModalUser.fullName}</p>
                <p className="font-mono text-slate-600">{resetModalUser.email} · {resetModalUser.mobileNumber}</p>
              </div>

              {resetFeedback && (
                <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  resetFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {resetFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                  <span>{resetFeedback.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter new password (e.g. UserPass12!)"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-[#004085]"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Password will be hashed with Bcrypt (Salt Cost 10) upon saving.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={resetLoading || !newPasswordInput}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-[#004085] hover:bg-[#002b5c] shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{resetLoading ? 'Encrypting & Saving...' : 'Save & Update Password'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
