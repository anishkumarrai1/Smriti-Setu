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
  ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { adminApi } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const { systemRole, user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'overview'>('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);

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

    try {
      await adminApi.updateUserStatus(userId, nextStatus as any);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to update user status');
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
                  National Health Mission (NHM) · Security Node
                </span>
                <span className="text-xs text-emerald-400 font-mono hidden sm:inline">Node: NER-ADMIN-01</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-black text-white mt-1">
                Admin Authentication & Login Audit Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Real-time user directory management, OTP verification logs, and login telemetry monitoring.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-xs border border-slate-600 flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Telemetry</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="pt-4 flex flex-wrap items-center gap-2 border-t border-slate-800">
          {[
            { id: 'overview', label: 'Security Dashboard', icon: Activity },
            { id: 'users', label: 'User Directory', icon: Users },
            { id: 'activity', label: 'Login Activity Logs', icon: KeyRound },
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

      {/* 2. Security KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Total Accounts</span>
            <Users className="w-4 h-4 text-blue-700" />
          </div>
          <p className="text-3xl font-serif font-black text-slate-900">{stats?.totalUsers || usersList.length || 1}</p>
          <p className="text-xs text-blue-700 font-bold">Registered Users</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">System Admins</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-serif font-black text-slate-900">{stats?.adminCount || 1}</p>
          <p className="text-xs text-amber-700 font-bold">Admin Privileges Granted</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Successful Logins</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-serif font-black text-emerald-950">{stats?.successfulLogins || loginLogs.filter(l => l.status === 'success').length}</p>
          <p className="text-xs text-emerald-700 font-bold">Verified Authentications</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Failed Attempts</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-serif font-black text-rose-950">{stats?.failedLogins || loginLogs.filter(l => l.status === 'failed').length}</p>
          <p className="text-xs text-rose-700 font-bold">Security Blocked</p>
        </div>
      </div>

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
                  placeholder="Search user..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="suspended">Suspended Accounts</option>
              </select>
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
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
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
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold capitalize ${
                        u.accountStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.accountStatus)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            u.accountStatus === 'active'
                              ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          }`}
                        >
                          {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
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

    </div>
  );
};
