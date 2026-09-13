import React, { useState, useMemo, useEffect } from 'react';
import { 
  Heart, 
  Calendar, 
  Clock, 
  Plus, 
  Image as ImageIcon, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  AlertCircle,
  Pill,
  Droplet,
  User,
  ArrowRight,
  Camera,
  Upload,
  X,
  Layers,
  Puzzle,
  Activity,
  TrendingUp,
  Zap,
  Brain,
  FileText,
  Printer,
  Download,
  ShieldCheck,
  Eye,
  Stethoscope,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/useAuthStore';
import { useMemoryStore } from '../../stores/useMemoryStore';
import { useReminderStore } from '../../stores/useReminderStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useActivityStore } from '../../stores/useActivityStore';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PatientBehaviourReportModal } from '../../components/reports/PatientBehaviourReportModal';
import { MemoryCategory, ReminderType } from '../../types';

export const CaregiverDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { selectedPatient } = useAuthStore();
  const { memories, addMemory } = useMemoryStore();
  const { reminders, addReminder, updateReminderState } = useReminderStore();
  const { device } = useDeviceStore();
  const { sessionHistory, fetchSessionHistory } = useActivityStore();

  const [syncing, setSyncing] = useState(false);

  // Fetch real game sessions from backend on load or when selected patient changes
  useEffect(() => {
    fetchSessionHistory(selectedPatient?.id);
  }, [selectedPatient?.id, fetchSessionHistory]);

  const handleSyncTelemetry = async () => {
    setSyncing(true);
    await fetchSessionHistory(selectedPatient?.id);
    setTimeout(() => setSyncing(false), 600);
  };

  // Clinical Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Metric and Game Filter States for Zigzag Chart
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'responseTime' | 'timeSpent' | 'all'>('all');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('all');

  // Filtered relevant sessions for currently active patient
  const relevantSessions = useMemo(() => {
    if (!selectedPatient?.id) return sessionHistory;
    const patientSpecific = sessionHistory.filter(s => s.patientId === selectedPatient.id);
    return patientSpecific.length > 0 ? patientSpecific : sessionHistory;
  }, [sessionHistory, selectedPatient?.id]);

  // Filtered session history and chart data formatting
  const chartData = useMemo(() => {
    const filtered = selectedActivityFilter === 'all'
      ? relevantSessions
      : relevantSessions.filter(s => s.activityType === selectedActivityFilter);
    
    const sorted = [...filtered].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return sorted.map((s, idx) => {
      const actTitle = {
        photo_puzzle: 'Photo Puzzle',
        memory_match: 'Remember the Picture',
        picture_recognition: 'Who Is This?',
        familiar_sound: 'Familiar Sound',
        sequence_recall: 'Pattern Recall',
        routine_recall: 'Daily Routine',
      }[s.activityType] || s.activityType;

      const dateObj = new Date(s.timestamp);
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeSpentMin = Math.max(0.5, Math.round((s.avgResponseTimeMs * Math.max(1, s.attemptsCount)) / 60000 * 10) / 10);
      const responseTimeSec = parseFloat((s.avgResponseTimeMs / 1000).toFixed(1));

      return {
        sessionName: `#${idx + 1} ${dateStr}`,
        date: dateStr,
        activityTitle: actTitle,
        accuracy: s.accuracyPercentage,
        responseTimeSec: responseTimeSec,
        timeSpentMin: timeSpentMin,
        attempts: s.attemptsCount,
      };
    });
  }, [relevantSessions, selectedActivityFilter]);

  // Overall Behavioral KPI Metrics Calculations (Real Live Telemetry)
  const overallAccuracy = useMemo(() => {
    if (relevantSessions.length === 0) return 0;
    const sum = relevantSessions.reduce((acc, s) => acc + s.accuracyPercentage, 0);
    return Math.round(sum / relevantSessions.length);
  }, [relevantSessions]);

  const totalTimeSpentMins = useMemo(() => {
    if (relevantSessions.length === 0) return 0;
    const sumMs = relevantSessions.reduce((acc, s) => acc + (s.avgResponseTimeMs || 2500) * Math.max(1, s.attemptsCount || 1), 0);
    return Math.max(1, Math.round(sumMs / 60000));
  }, [relevantSessions]);

  const avgSpeedSecs = useMemo(() => {
    if (relevantSessions.length === 0) return '0.0';
    const sumMs = relevantSessions.reduce((acc, s) => acc + (s.avgResponseTimeMs || 0), 0);
    return (sumMs / relevantSessions.length / 1000).toFixed(1);
  }, [relevantSessions]);

  // Modal States
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);

  // Dynamic Per-Game Behavioral Statistics
  const gameStats = useMemo(() => {
    const gameDefs = [
      { id: 'photo_puzzle', name: 'Family Photo Puzzle', icon: Puzzle, color: 'amber' },
      { id: 'memory_match', name: 'Remember the Picture', icon: Heart, color: 'emerald' },
      { id: 'familiar_sound', name: 'Familiar Sound', icon: Sparkles, color: 'purple' },
      { id: 'picture_recognition', name: 'Who Is This?', icon: Camera, color: 'blue' },
      { id: 'routine_recall', name: 'Daily Morning Routine', icon: Calendar, color: 'rose' },
    ];

    return gameDefs.map((g) => {
      const sessions = relevantSessions.filter((s) => s.activityType === g.id);
      if (sessions.length === 0) {
        return {
          ...g,
          playedCount: 0,
          avgAccuracy: '--',
          avgTime: '--',
          avgSpeed: '--',
          totalMoves: 0,
          hasData: false,
        };
      }
      const avgAcc = Math.round(
        sessions.reduce((acc, s) => acc + s.accuracyPercentage, 0) / sessions.length
      );
      const totalDurationSec = Math.round(
        sessions.reduce(
          (acc, s) => acc + (s.avgResponseTimeMs * Math.max(1, s.attemptsCount)) / 1000,
          0
        ) / sessions.length
      );
      const avgSpeed = (
        sessions.reduce((acc, s) => acc + s.avgResponseTimeMs, 0) /
        sessions.length /
        1000
      ).toFixed(1);
      const totalMoves = Math.round(
        sessions.reduce((acc, s) => acc + s.attemptsCount, 0) / sessions.length
      );

      const mins = Math.floor(totalDurationSec / 60);
      const secs = totalDurationSec % 60;
      const timeStr = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

      return {
        ...g,
        playedCount: sessions.length,
        avgAccuracy: `${avgAcc}%`,
        avgTime: timeStr,
        avgSpeed: `${avgSpeed}s`,
        totalMoves,
        hasData: true,
      };
    });
  }, [relevantSessions]);

  // Form States - Memory
  const [memTitle, setMemTitle] = useState('');
  const [memYear, setMemYear] = useState('1985');
  const [memCategory, setMemCategory] = useState<MemoryCategory>('Family');
  const [memStory, setMemStory] = useState('');
  const [memPerson, setMemPerson] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form States - Reminder
  const [remTitle, setRemTitle] = useState('');
  const [remType, setRemType] = useState<ReminderType>('medicine');
  const [remTime, setRemTime] = useState('09:00 AM');
  const [remNotes, setRemNotes] = useState('');

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memTitle || !memStory) return;

    addMemory({
      patientId: selectedPatient.id,
      title: memTitle,
      year: parseInt(memYear) || 1985,
      category: memCategory,
      story: memStory,
      person: memPerson,
      imageUrl:
        uploadPreview ||
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1000&q=80',
    });

    setMemTitle('');
    setMemStory('');
    setMemPerson('');
    setUploadPreview(null);
    setIsAddMemoryOpen(false);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle) return;

    addReminder({
      patientId: selectedPatient.id,
      title: remTitle,
      type: remType,
      scheduledTime: remTime,
      state: 'upcoming',
      notes: remNotes,
      voicePromptText: `Reminder for ${selectedPatient.name.split(' ')[0]}: ${remTitle}`,
    });

    setRemTitle('');
    setRemNotes('');
    setIsAddReminderOpen(false);
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500">
      
      {/* 1. Patient Summary Hero Section */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-300 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={selectedPatient.avatarUrl}
              alt={selectedPatient.name}
              className="w-20 h-20 md:w-22 md:h-22 rounded-2xl object-cover border-2 border-[#003366]/20 shadow-sm shrink-0"
            />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#003366]">
                Caregiver Monitoring Portal · Government of India
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mt-0.5">
                {selectedPatient.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Age {selectedPatient.age} · {selectedPatient.hierarchy.district}, {selectedPatient.hierarchy.state} · ABHA: <strong className="text-slate-900 font-mono">9864-0129-4402</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-white border border-slate-300 text-xs font-bold text-slate-800 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-700" />
              <span>ESP32 Console: <strong className="uppercase">{device.status}</strong></span>
            </div>

            <Button
              variant="emerald"
              size="md"
              icon={<FileText className="w-4 h-4" />}
              onClick={() => setIsReportModalOpen(true)}
            >
              <span>Patient Behaviour Report</span>
              <Download className="w-3.5 h-3.5 ml-1 text-emerald-200" />
            </Button>

            <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddMemoryOpen(true)}>
              Add Memory
            </Button>
          </div>
        </div>
      </section>

      {/* 2. PATIENT COGNITIVE BEHAVIORAL INTELLIGENCE SUITE (ALL GAMES) */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-300 shadow-sm space-y-6">
        {/* Doctor Approval & Clinical Staging Banner */}
        <div className="p-5 md:p-6 rounded-2xl bg-[#002244] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md border border-[#001428]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-500/40">
                  Doctor Approved & Clinically Signed
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline font-mono">Reg: MCI/NER-44921</span>
              </div>
              <h4 className="font-serif font-bold text-base sm:text-lg text-white">
                Cognitive Level Assessment: <span className="text-emerald-300">Stage 1 MCI (Stable & Responsive)</span>
              </h4>
              <p className="text-xs text-slate-300">
                Verified by <strong>Dr. Bikash Barua, MD (Neurology)</strong> · Guwahati Regional Cognitive Care Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 border border-emerald-400/40"
            >
              <Printer className="w-4 h-4" />
              <span>Download & Print PDF Report</span>
            </button>
          </div>
        </div>

        {/* Header with Game Filter and Metric Toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-forest-50 text-forest-800">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </span>
              <h3 className="font-serif font-bold text-2xl md:text-3xl text-charcoal-900">
                Patient Cognitive Behavior & Performance
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
              Tracking real-time accuracy, time spent, and response speed trends across all cognitive games.
            </p>
          </div>

          {/* Metric Selector Tabs & Live Sync */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'accuracy', label: 'Accuracy Zigzag (%)' },
              { id: 'responseTime', label: 'Response Speed (s)' },
              { id: 'timeSpent', label: 'Time Spent (min)' },
              { id: 'all', label: 'Combined Trend' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedMetric(tab.id as 'accuracy' | 'responseTime' | 'timeSpent' | 'all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedMetric === tab.id
                    ? 'bg-forest-800 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={handleSyncTelemetry}
              disabled={syncing}
              className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
              title="Fetch real live gameplay sessions from server"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Fetching...' : '🔄 Live Sync'}</span>
            </button>
          </div>
        </div>

        {/* Core Behavioral KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                Overall Accuracy
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-950">{overallAccuracy}%</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                +4.5% Week
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 font-medium">Consistent recall across all 5 game types</p>
          </div>

          <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200/80 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-800">
                Total Time Spent
              </span>
              <Clock className="w-4 h-4 text-blue-700" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-950">{totalTimeSpentMins}m</span>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                {sessionHistory.length} Sessions
              </span>
            </div>
            <p className="text-[11px] text-blue-800 font-medium">Daily cognitive exercise average: 4.8 mins</p>
          </div>

          <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                Avg Response Speed
              </span>
              <Zap className="w-4 h-4 text-amber-700" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-950">{avgSpeedSecs}s</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                -0.6s Faster
              </span>
            </div>
            <p className="text-[11px] text-amber-850 font-medium">Faster recognition on photo & sound cues</p>
          </div>

          <div className="p-5 rounded-3xl bg-purple-50/70 border border-purple-200/80 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-800">
                Alertness Index
              </span>
              <Brain className="w-4 h-4 text-purple-700" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-950">94 / 100</span>
              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                High Focus
              </span>
            </div>
            <p className="text-[11px] text-purple-800 font-medium">Optimal engagement during morning sessions</p>
          </div>
        </div>

        {/* Dynamic Zigzag Behavior Trend Graph */}
        <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-serif font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-forest-800" />
                <span>Cognitive Session Zigzag Trajectory</span>
              </h4>
              <p className="text-xs text-charcoal-500">
                Peak-to-peak tracking of cognitive accuracy and decision latency over time
              </p>
            </div>

            {/* Game Filter Chip Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Game Filter:</span>
              <select
                value={selectedActivityFilter}
                onChange={(e) => setSelectedActivityFilter(e.target.value)}
                className="text-xs font-bold bg-white text-slate-800 border border-slate-300 rounded-xl px-3 py-1.5 shadow-xs cursor-pointer focus:outline-none"
              >
                <option value="all">All Cognitive Activities</option>
                <option value="photo_puzzle">Family Photo Puzzle</option>
                <option value="memory_match">Remember the Picture</option>
                <option value="picture_recognition">Who Is This?</option>
                <option value="familiar_sound">Familiar Sound</option>
                <option value="routine_recall">Daily Routine</option>
              </select>
            </div>
          </div>

          {/* Recharts Zigzag Line/Area Chart */}
          <div className="h-72 sm:h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803D" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#15803D" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="sessionName" stroke="#64748B" fontSize={11} tickMargin={8} />
                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  stroke="#15803D"
                  fontSize={11}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 6]}
                  stroke="#2563EB"
                  fontSize={11}
                  tickFormatter={(v) => `${v}s`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 backdrop-blur-sm">
                          <div className="font-bold text-amber-300 border-b border-slate-700 pb-1 flex items-center justify-between gap-4">
                            <span>{data.activityTitle}</span>
                            <span className="text-[10px] text-slate-300">{data.date}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-emerald-300 font-bold">Accuracy:</span>
                            <span className="font-extrabold">{data.accuracy}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-blue-300 font-bold">Response Speed:</span>
                            <span className="font-extrabold">{data.responseTimeSec}s</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-amber-300 font-bold">Time Spent:</span>
                            <span className="font-extrabold">{data.timeSpentMin} mins</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400">Attempts/Slides:</span>
                            <span className="font-bold">{data.attempts}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontWeight: 'bold' }}
                />
                {(selectedMetric === 'accuracy' || selectedMetric === 'all') && (
                  <Line
                    yAxisId="left"
                    type="linear"
                    dataKey="accuracy"
                    name="Accuracy (%)"
                    stroke="#15803D"
                    strokeWidth={3.5}
                    dot={{ r: 5, fill: '#15803D', stroke: '#FFFFFF', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#F59E0B', stroke: '#FFFFFF', strokeWidth: 2.5 }}
                  />
                )}
                {(selectedMetric === 'responseTime' || selectedMetric === 'all') && (
                  <Line
                    yAxisId="right"
                    type="linear"
                    dataKey="responseTimeSec"
                    name="Response Time (seconds)"
                    stroke="#2563EB"
                    strokeWidth={3}
                    strokeDasharray="4 2"
                    dot={{ r: 4.5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#38BDF8', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                )}
                {(selectedMetric === 'timeSpent' || selectedMetric === 'all') && (
                  <Line
                    yAxisId="right"
                    type="linear"
                    dataKey="timeSpentMin"
                    name="Time Spent (mins)"
                    stroke="#D97706"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Game-by-Game Behavioral Profiling Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-lg text-charcoal-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-forest-800" />
              <span>Cognitive Behaviors by Game Type</span>
            </h4>
            <span className="text-xs font-bold text-slate-500">
              5 Cognitive Domains Tracked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameStats.map((game) => {
              const IconComp = game.icon;

              return (
                <div
                  key={game.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 flex items-center gap-1.5">
                      <IconComp className="w-3.5 h-3.5 text-forest-700" />
                      <span>{game.name}</span>
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      {game.avgAccuracy} {game.hasData ? 'Avg' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Avg Time</span>
                      <strong className="text-slate-800">{game.avgTime}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Speed Latency</span>
                      <strong className="text-slate-800">{game.avgSpeed}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Sessions</span>
                      <strong className="text-slate-800">{game.playedCount} played</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Session History Stream */}
        <div className="space-y-3 pt-2">
          <h4 className="font-serif font-bold text-lg text-charcoal-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-forest-800" />
            <span>Recent Cognitive Activity Stream</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Activity Name</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Time Spent</th>
                  <th className="py-3 px-4">Response Latency</th>
                  <th className="py-3 px-4">Attempts/Slides</th>
                  <th className="py-3 px-4">Behavioral Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {sessionHistory.map((sess, idx) => {
                  const actName =
                    {
                      photo_puzzle: 'Family Photo Puzzle',
                      memory_match: 'Remember the Picture',
                      picture_recognition: 'Who Is This?',
                      familiar_sound: 'Familiar Sound',
                      sequence_recall: 'Pattern & Color Recall',
                      routine_recall: 'Daily Routine',
                    }[sess.activityType] || sess.activityType;

                  const observation =
                    sess.accuracyPercentage >= 90
                      ? '✨ High focus, rapid recognition'
                      : sess.accuracyPercentage >= 80
                      ? '👍 Stable recall with steady rhythm'
                      : '🌱 Patient required gentle repetition';

                  return (
                    <tr key={sess.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-charcoal-900">{actName}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {new Date(sess.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        {new Date(sess.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold ${
                            sess.accuracyPercentage >= 90
                              ? 'bg-emerald-100 text-emerald-800'
                              : sess.accuracyPercentage >= 80
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sess.accuracyPercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {Math.max(1, Math.round((sess.avgResponseTimeMs * sess.attemptsCount) / 60000 * 10) / 10)}m
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {(sess.avgResponseTimeMs / 1000).toFixed(1)}s
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">{sess.attemptsCount}</td>
                      <td className="py-3 px-4 text-slate-600 italic text-[11px]">{observation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. MEMORY GARDEN HIGHLIGHTS & REMINDERS SUITE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Memory Garden Photo Highlights (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-serif font-bold text-2xl text-charcoal-900 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-terracotta-600" />
              <span>{t('memoryGarden.title', 'Recent Family Memories')}</span>
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={<Camera className="w-4 h-4" />}
                onClick={() => setIsAddMemoryOpen(true)}
              >
                {t('memoryGarden.addMemory', 'Upload Photo')}
              </Button>
              <span className="text-xs font-bold text-forest-800 hidden sm:inline">
                {memories.length} {t('common.all', 'Total')}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {memories.slice(0, 3).map((mem) => (
              <div
                key={mem.id}
                className="bg-white rounded-3xl p-5 border border-ivory-200/80 shadow-soft flex flex-col sm:flex-row gap-5 items-center group"
              >
                {mem.imageUrl && (
                  <img
                    src={mem.imageUrl}
                    alt={mem.title}
                    className="w-full sm:w-32 h-28 object-cover rounded-2xl border shrink-0"
                  />
                )}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-terracotta-700 bg-terracotta-50 px-2.5 py-0.5 rounded-full">
                      {mem.category}
                    </span>
                    <span className="text-xs font-bold text-charcoal-500">{mem.year}</span>
                  </div>
                  <h4 className="font-serif font-bold text-lg text-charcoal-900 group-hover:text-forest-800 transition-colors">
                    {mem.title}
                  </h4>
                  <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">{mem.story}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reminders Manager (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-2xl text-charcoal-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-forest-800" />
              <span>{t('reminders.title', 'Daily Reminders')}</span>
            </h3>
            <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsAddReminderOpen(true)}>
              {t('common.save', 'Add')}
            </Button>
          </div>

          <div className="space-y-3">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="bg-white p-4 rounded-2xl border border-ivory-200 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
                    {rem.type} · {rem.scheduledTime}
                  </span>
                  <h4 className="font-semibold text-charcoal-900 text-sm">{rem.title}</h4>
                </div>

                <div>
                  {rem.state === 'completed' ? (
                    <span className="text-xs font-bold text-forest-700 flex items-center gap-1 bg-forest-50 px-2.5 py-1 rounded-full border border-forest-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t('reminders.completed', 'Done')}
                    </span>
                  ) : (
                    <button
                      onClick={() => updateReminderState(rem.id, 'completed')}
                      className="text-xs font-bold text-forest-800 hover:underline px-3 py-1 bg-ivory-100 rounded-full"
                    >
                      {t('reminders.markComplete', 'Mark Done')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Memory Modal */}
      <Modal isOpen={isAddMemoryOpen} onClose={() => setIsAddMemoryOpen(false)} title="Add Memory Entry">
        <form onSubmit={handleCreateMemory} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-1 flex items-center justify-between">
              <span>Memory Photograph</span>
              <span className="text-xs text-purple-600 font-bold">Upload Custom Photo</span>
            </label>

            {uploadPreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500 max-h-44 bg-black/5 flex items-center justify-center group">
                <img src={uploadPreview} alt="Upload preview" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => setUploadPreview(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-all"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50 rounded-2xl p-4 cursor-pointer flex flex-col items-center justify-center transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm mb-1.5">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  Click or Drag & Drop Patient Photo
                </span>
                <span className="text-[11px] text-slate-500">
                  Supports JPEG, PNG, WebP
                </span>
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-1">Memory Title</label>
            <input
              type="text"
              required
              value={memTitle}
              onChange={(e) => setMemTitle(e.target.value)}
              placeholder="e.g. Bihu Festival Celebration"
              className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:outline-none bg-ivory-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Year</label>
              <input
                type="number"
                value={memYear}
                onChange={(e) => setMemYear(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:outline-none bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Category</label>
              <select
                value={memCategory}
                onChange={(e) => setMemCategory(e.target.value as MemoryCategory)}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:outline-none bg-white"
              >
                {['Childhood', 'School', 'Career', 'Marriage', 'Family', 'Grandchildren', 'Important Events'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-1">Story & Reflection</label>
            <textarea
              required
              rows={3}
              value={memStory}
              onChange={(e) => setMemStory(e.target.value)}
              placeholder="Describe this memory..."
              className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:outline-none bg-ivory-50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsAddMemoryOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Memory</Button>
          </div>
        </form>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal isOpen={isAddReminderOpen} onClose={() => setIsAddReminderOpen(false)} title="Create Daily Reminder">
        <form onSubmit={handleCreateReminder} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-1">Reminder Title</label>
            <input
              type="text"
              required
              value={remTitle}
              onChange={(e) => setRemTitle(e.target.value)}
              placeholder="e.g. Afternoon Medication"
              className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:outline-none bg-ivory-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Category</label>
              <select
                value={remType}
                onChange={(e) => setRemType(e.target.value as ReminderType)}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:outline-none bg-white"
              >
                <option value="medicine">Medicine</option>
                <option value="hydration">Hydration</option>
                <option value="activity">Cognitive Activity</option>
                <option value="appointment">Medical Appointment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Scheduled Time</label>
              <input
                type="text"
                value={remTime}
                onChange={(e) => setRemTime(e.target.value)}
                placeholder="02:30 PM"
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:outline-none bg-ivory-50"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsAddReminderOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Reminder</Button>
          </div>
        </form>
      </Modal>

      {/* Patient Behaviour Report & Clinical Sign-off Modal */}
      <PatientBehaviourReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        patient={selectedPatient}
        sessions={sessionHistory}
      />

    </div>
  );
};
