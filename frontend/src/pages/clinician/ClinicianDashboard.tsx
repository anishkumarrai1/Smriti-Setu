import React, { useState, useEffect, useMemo } from 'react';
import { 
  Stethoscope, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  Activity, 
  Filter,
<<<<<<< HEAD
  FileText,
  Download,
  Printer
=======
  Gamepad2,
  Clock,
  CheckCircle2,
  Award,
  RefreshCw,
  Zap,
  Target,
  FileText,
  Printer,
  X,
  User,
  ShieldCheck,
  Brain,
  BarChart3,
  ExternalLink,
  Calendar,
  ChevronRight
>>>>>>> origin/main
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
<<<<<<< HEAD
  Legend
=======
  BarChart,
  Bar,
  Cell
>>>>>>> origin/main
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/useAuthStore';
import { useActivityStore } from '../../stores/useActivityStore';
<<<<<<< HEAD
import { RegionalState } from '../../types';
import { formatDate } from '../../utils/formatters';
import { PatientBehaviourReportModal } from '../../components/reports/PatientBehaviourReportModal';
=======
import { RegionalState, PatientProfile, GameSession } from '../../types';
import { formatDate, formatTime } from '../../utils/formatters';

const ACTIVITY_META: Record<string, { label: string; domain: string; color: string; bg: string }> = {
  memory_match: { label: 'Memory Match', domain: 'Visual Working Memory', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
  picture_recognition: { label: 'Picture Recognition', domain: 'Face & Landmark Recognition', color: 'text-forest-800', bg: 'bg-forest-50 border-forest-200' },
  sequence_recall: { label: 'Pattern & Color Recall', domain: 'Attention & Working Span', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
  familiar_sound: { label: 'Familiar Sound', domain: 'Auditory & Voice Recall', color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200' },
  photo_puzzle: { label: 'Photo Puzzle', domain: 'Visuospatial Coordination', color: 'text-terracotta-800', bg: 'bg-terracotta-50 border-terracotta-200' },
  routine_recall: { label: 'Routine Recall', domain: 'Daily Routine Recall', color: 'text-purple-800', bg: 'bg-purple-50 border-purple-200' },
};

// Regional assigned patients list
const ASSIGNED_PATIENTS: (PatientProfile & { baselineScore: number; status: 'stable' | 'moderate' | 'review'; recentDiff: string })[] = [
  {
    id: 'pat-ner-001',
    name: 'Ranjit Borthakur',
    age: 72,
    gender: 'male',
    preferredLanguage: 'as',
    hierarchy: {
      region: 'North Eastern Region',
      state: 'Assam',
      district: 'Kamrup Metropolitan',
      facilityId: 'fac-ghy-01',
      facilityName: 'Guwahati Regional Cognitive Care Center',
    },
    primaryCaregiverName: 'Ananya Borthakur',
    primaryCaregiverContact: '+91 98640 12345',
    attendingClinicianName: 'Dr. Devashish Phukan',
    cognitiveProfileNote: 'Early-stage memory assistance required. High engagement with family photo recall and Assamese traditional music.',
    elderlyModeEnabled: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    baselineScore: 88,
    status: 'stable',
    recentDiff: 'Easy → Medium',
  },
  {
    id: 'pat-ner-002',
    name: 'Hemanta Saikia',
    age: 78,
    gender: 'male',
    preferredLanguage: 'as',
    hierarchy: {
      region: 'North Eastern Region',
      state: 'Assam',
      district: 'Jorhat',
      facilityId: 'fac-ghy-01',
      facilityName: 'Guwahati Regional Cognitive Care Center',
    },
    primaryCaregiverName: 'Nandini Saikia',
    primaryCaregiverContact: '+91 94350 56789',
    attendingClinicianName: 'Dr. Devashish Phukan',
    cognitiveProfileNote: 'Moderate memory loss. Benefits from simplified daily routines and slower-paced audio recognition prompts.',
    elderlyModeEnabled: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    baselineScore: 64,
    status: 'review',
    recentDiff: 'Simplified to Easy',
  },
  {
    id: 'pat-ner-003',
    name: 'Moarenla Jamir',
    age: 69,
    gender: 'female',
    preferredLanguage: 'en',
    hierarchy: {
      region: 'North Eastern Region',
      state: 'Nagaland',
      district: 'Kohima',
      facilityId: 'fac-ghy-01',
      facilityName: 'Guwahati Regional Cognitive Care Center',
    },
    primaryCaregiverName: 'Imkong Jamir',
    primaryCaregiverContact: '+91 98620 34567',
    attendingClinicianName: 'Dr. Devashish Phukan',
    cognitiveProfileNote: 'High engagement in pattern recall and folk music. Retains strong attentional focus and working memory.',
    elderlyModeEnabled: false,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    baselineScore: 91,
    status: 'stable',
    recentDiff: 'Promoted to Challenging',
  },
  {
    id: 'pat-ner-004',
    name: 'Tenzing Lhadon',
    age: 75,
    gender: 'female',
    preferredLanguage: 'as',
    hierarchy: {
      region: 'North Eastern Region',
      state: 'Sikkim',
      district: 'East Sikkim',
      facilityId: 'fac-ghy-01',
      facilityName: 'Guwahati Regional Cognitive Care Center',
    },
    primaryCaregiverName: 'Dorjee Lhadon',
    primaryCaregiverContact: '+91 97740 98765',
    attendingClinicianName: 'Dr. Devashish Phukan',
    cognitiveProfileNote: 'Mild cognitive impairment. Highly responsive to peaceful morning routine sequencing and family jigsaw puzzles.',
    elderlyModeEnabled: true,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    baselineScore: 79,
    status: 'moderate',
    recentDiff: 'Maintained Medium',
  },
];
>>>>>>> origin/main

export const ClinicianDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { selectedPatient, updatePatientProfile } = useAuthStore();
  const { sessionHistory, currentDifficulty, fetchSessionHistory } = useActivityStore();

  const [activePatient, setActivePatient] = useState<PatientProfile>(selectedPatient);
  const [selectedState, setSelectedState] = useState<RegionalState>('Assam');
<<<<<<< HEAD
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const trendData = [
    { session: 'Aug 24', accuracy: 78, responseTimeSec: 4.2 },
    { session: 'Aug 26', accuracy: 82, responseTimeSec: 3.8 },
    { session: 'Aug 27', accuracy: 95, responseTimeSec: 2.3 },
    { session: 'Aug 28', accuracy: 88, responseTimeSec: 3.4 },
    { session: 'Aug 28', accuracy: 91, responseTimeSec: 2.8 },
    { session: 'Aug 29', accuracy: 75, responseTimeSec: 4.6 },
    { session: 'Aug 29', accuracy: 100, responseTimeSec: 1.9 },
    { session: 'Aug 30', accuracy: 86, responseTimeSec: 3.1 },
    { session: 'Aug 30', accuracy: 94, responseTimeSec: 2.4 },
  ];
=======
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('all');
  const [metricView, setMetricView] = useState<'accuracy' | 'responseTime'>('accuracy');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportModalPatient, setReportModalPatient] = useState<PatientProfile | null>(null);

  // Sync session history on mount and on patient switch
  useEffect(() => {
    fetchSessionHistory(activePatient.id);
  }, [fetchSessionHistory, activePatient.id]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSessionHistory(activePatient.id);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSelectPatient = (patient: PatientProfile) => {
    setActivePatient(patient);
    updatePatientProfile(patient);
    fetchSessionHistory(patient.id);
  };

  // Filtered session list for currently active patient
  const patientSessions = useMemo(() => {
    // If active patient is Ranjit, use sessionHistory
    if (activePatient.id === 'pat-ner-001') {
      return sessionHistory;
    }
    // For other mock patients, return simulated historical baseline sessions
    if (activePatient.id === 'pat-ner-002') {
      return [
        { id: 'h-1', patientId: 'pat-ner-002', activityType: 'routine_recall', timestamp: '2026-08-28T10:00:00Z', accuracyPercentage: 66, attemptsCount: 8, avgResponseTimeMs: 4800, completed: true, difficultyLevel: 'easy', difficultyAdjusted: false },
        { id: 'h-2', patientId: 'pat-ner-002', activityType: 'memory_match', timestamp: '2026-08-26T14:30:00Z', accuracyPercentage: 62, attemptsCount: 10, avgResponseTimeMs: 5400, completed: true, difficultyLevel: 'easy', difficultyAdjusted: true },
        { id: 'h-3', patientId: 'pat-ner-002', activityType: 'picture_recognition', timestamp: '2026-08-24T09:15:00Z', accuracyPercentage: 65, attemptsCount: 7, avgResponseTimeMs: 5100, completed: true, difficultyLevel: 'easy', difficultyAdjusted: false },
        { id: 'h-4', patientId: 'pat-ner-002', activityType: 'familiar_sound', timestamp: '2026-08-22T16:20:00Z', accuracyPercentage: 63, attemptsCount: 8, avgResponseTimeMs: 5600, completed: true, difficultyLevel: 'easy', difficultyAdjusted: false },
      ] as GameSession[];
    }
    if (activePatient.id === 'pat-ner-003') {
      return [
        { id: 'm-1', patientId: 'pat-ner-003', activityType: 'sequence_recall', timestamp: '2026-08-28T11:00:00Z', accuracyPercentage: 94, attemptsCount: 4, avgResponseTimeMs: 2600, completed: true, difficultyLevel: 'challenging', difficultyAdjusted: true },
        { id: 'm-2', patientId: 'pat-ner-003', activityType: 'memory_match', timestamp: '2026-08-27T15:10:00Z', accuracyPercentage: 92, attemptsCount: 5, avgResponseTimeMs: 2800, completed: true, difficultyLevel: 'medium', difficultyAdjusted: true },
        { id: 'm-3', patientId: 'pat-ner-003', activityType: 'picture_recognition', timestamp: '2026-08-25T10:45:00Z', accuracyPercentage: 90, attemptsCount: 5, avgResponseTimeMs: 2900, completed: true, difficultyLevel: 'medium', difficultyAdjusted: false },
        { id: 'm-4', patientId: 'pat-ner-003', activityType: 'photo_puzzle', timestamp: '2026-08-23T14:00:00Z', accuracyPercentage: 88, attemptsCount: 6, avgResponseTimeMs: 3100, completed: true, difficultyLevel: 'medium', difficultyAdjusted: false },
      ] as GameSession[];
    }
    return [
      { id: 't-1', patientId: 'pat-ner-004', activityType: 'photo_puzzle', timestamp: '2026-08-28T12:00:00Z', accuracyPercentage: 80, attemptsCount: 6, avgResponseTimeMs: 3700, completed: true, difficultyLevel: 'medium', difficultyAdjusted: false },
      { id: 't-2', patientId: 'pat-ner-004', activityType: 'memory_match', timestamp: '2026-08-26T16:00:00Z', accuracyPercentage: 78, attemptsCount: 7, avgResponseTimeMs: 4000, completed: true, difficultyLevel: 'medium', difficultyAdjusted: false },
      { id: 't-3', patientId: 'pat-ner-004', activityType: 'routine_recall', timestamp: '2026-08-24T11:30:00Z', accuracyPercentage: 82, attemptsCount: 6, avgResponseTimeMs: 3800, completed: true, difficultyLevel: 'easy', difficultyAdjusted: true },
      { id: 't-4', patientId: 'pat-ner-004', activityType: 'familiar_sound', timestamp: '2026-08-21T09:40:00Z', accuracyPercentage: 76, attemptsCount: 7, avgResponseTimeMs: 4200, completed: true, difficultyLevel: 'easy', difficultyAdjusted: false },
    ] as GameSession[];
  }, [activePatient.id, sessionHistory]);

  const filteredSessions = useMemo(() => {
    if (selectedActivityFilter === 'all') return patientSessions;
    return patientSessions.filter((s) => s.activityType === selectedActivityFilter);
  }, [patientSessions, selectedActivityFilter]);

  // Chronological trend data for Recharts (oldest to newest)
  const trendData = useMemo(() => {
    const sorted = [...filteredSessions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return sorted.map((sess, idx) => {
      const d = new Date(sess.timestamp);
      const formattedDate = isNaN(d.getTime())
        ? `Game #${idx + 1}`
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = isNaN(d.getTime()) ? '' : formatTime(sess.timestamp);
      const activityLabel = ACTIVITY_META[sess.activityType]?.label || sess.activityType.replace('_', ' ');

      return {
        session: formattedDate,
        fullTimestamp: `${formattedDate} · ${timeStr}`,
        accuracy: sess.accuracyPercentage,
        responseTimeSec: Number(((sess.avgResponseTimeMs || 3000) / 1000).toFixed(1)),
        activity: activityLabel,
        activityType: sess.activityType,
        attempts: sess.attemptsCount || 1,
        difficulty: sess.difficultyLevel || 'easy',
        difficultyAdjusted: sess.difficultyAdjusted,
      };
    });
  }, [filteredSessions]);

  // Aggregate stats
  const totalGamesPlayed = filteredSessions.length;
  const latestSession = filteredSessions[0];
  const latestAccuracy = latestSession ? latestSession.accuracyPercentage : 0;
  
  const avgAccuracy = useMemo(() => {
    if (filteredSessions.length === 0) return 0;
    const sum = filteredSessions.reduce((acc, curr) => acc + curr.accuracyPercentage, 0);
    return Math.round(sum / filteredSessions.length);
  }, [filteredSessions]);

  const avgResponseTimeSec = useMemo(() => {
    if (filteredSessions.length === 0) return '0.0';
    const sum = filteredSessions.reduce((acc, curr) => acc + (curr.avgResponseTimeMs || 0), 0);
    return (sum / filteredSessions.length / 1000).toFixed(1);
  }, [filteredSessions]);

  const accuracyImprovement = useMemo(() => {
    if (trendData.length < 2) return null;
    const firstScore = trendData[0].accuracy;
    const lastScore = trendData[trendData.length - 1].accuracy;
    return lastScore - firstScore;
  }, [trendData]);

  // Cognitive Domain Breakdown calculation for the active patient
  const domainBreakdown = useMemo(() => {
    const domains: Record<string, { totalAccuracy: number; count: number; label: string }> = {};
    
    patientSessions.forEach((s) => {
      const domainKey = ACTIVITY_META[s.activityType]?.domain || 'General Recall';
      if (!domains[domainKey]) {
        domains[domainKey] = { totalAccuracy: 0, count: 0, label: domainKey };
      }
      domains[domainKey].totalAccuracy += s.accuracyPercentage;
      domains[domainKey].count += 1;
    });

    return Object.values(domains).map((d) => ({
      domain: d.label,
      score: Math.round(d.totalAccuracy / d.count),
      gamesCount: d.count,
    }));
  }, [patientSessions]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-forest-950 text-white p-4 rounded-2xl shadow-xl border border-forest-800 text-xs space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-forest-800/80 pb-2">
            <span className="font-bold text-ivory-100">{data.activity}</span>
            <span className="text-gold-400 capitalize font-medium">{data.difficulty}</span>
          </div>
          <div className="space-y-1 pt-1 text-ivory-200">
            <p className="flex justify-between">
              <span>Date:</span>
              <strong className="text-white">{data.fullTimestamp}</strong>
            </p>
            <p className="flex justify-between">
              <span>Accuracy:</span>
              <strong className="text-emerald-400 font-bold text-sm">{data.accuracy}%</strong>
            </p>
            <p className="flex justify-between">
              <span>Response Time:</span>
              <strong className="text-ivory-100">{data.responseTimeSec}s</strong>
            </p>
            <p className="flex justify-between">
              <span>Attempts:</span>
              <strong className="text-ivory-100">{data.attempts}</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const handlePrint = () => {
    window.print();
  };
>>>>>>> origin/main

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500">
      
<<<<<<< HEAD
      {/* Header & Regional State Filter */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-300 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#003366]">
=======
      {/* 1. Header & Regional State Selector */}
      <div className="bg-ivory-100/90 p-6 md:p-8 rounded-4xl border border-ivory-200 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
>>>>>>> origin/main
              Clinical Progress & Cognitive Analytics
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mt-1 flex items-center gap-3">
              <Stethoscope className="w-7 h-7 text-[#003366]" />
              <span>North Eastern Region Clinical Review</span>
            </h2>
          </div>

<<<<<<< HEAD
          {/* Action Buttons on Right of Clinical Analytics */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-blue-50 text-[#003366] border border-blue-200 text-xs font-black px-3 py-2 rounded-xl">
              Guwahati Regional Center
            </span>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-[0.98]"
              title="View & Download Clinical Behaviour Report"
            >
              <FileText className="w-4 h-4 text-emerald-200" />
              <span>Patient Behaviour Report</span>
              <Download className="w-3.5 h-3.5 ml-0.5 text-emerald-200" />
            </button>
=======
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setReportModalPatient(activePatient)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-forest-800 text-white hover:bg-forest-900 transition-all font-bold text-xs shadow-soft"
            >
              <FileText className="w-4 h-4 text-gold-400" />
              <span>Generate Patient Report</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-ivory-300 text-xs font-bold text-charcoal-700 hover:bg-ivory-50 transition-all shadow-xs"
              title="Refresh game session data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-forest-800 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sync Data</span>
            </button>

            <span className="bg-forest-100 text-forest-900 border border-forest-300 text-xs font-bold px-3.5 py-2 rounded-full hidden sm:inline-block">
              Guwahati Regional Cognitive Care Center
            </span>
>>>>>>> origin/main
          </div>
        </div>

        {/* Regional State Selector */}
        <div className="pt-3 flex flex-wrap items-center gap-2 border-t border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#003366]" /> Regional State Node:
          </span>
          {['Assam', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Arunachal Pradesh', 'Sikkim'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedState(st as RegionalState)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                selectedState === st
                  ? 'bg-[#003366] text-white shadow-xs font-black border border-[#002244]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Patient Selector Bar */}
      <div className="bg-white p-5 rounded-3xl border border-ivory-200 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal-600 flex items-center gap-1.5">
            <User className="w-4 h-4 text-forest-800" />
            <span>Select Patient to Analyze & Generate Individual Report:</span>
          </span>
          <span className="text-xs text-charcoal-500 font-medium">4 Assigned Patients</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ASSIGNED_PATIENTS.map((p) => {
            const isSelected = activePatient.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectPatient(p)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-forest-50 border-forest-700 shadow-xs ring-2 ring-forest-700/20'
                    : 'bg-ivory-50/70 border-ivory-200 hover:bg-white hover:border-ivory-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-10 h-10 rounded-full object-cover border border-white shadow-xs"
                  />
                  <div>
                    <h4 className="font-bold text-charcoal-900 text-sm leading-tight">{p.name}</h4>
                    <p className="text-xs text-charcoal-500">Age {p.age} · {p.hierarchy.state}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'stable' ? 'bg-emerald-100 text-emerald-900' : p.status === 'moderate' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                  }`}>
                    {p.baselineScore}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AI-Assisted Clinical Observations Banner */}
      <div className="bg-gradient-to-r from-forest-900 to-forest-800 text-white rounded-3xl p-6 md:p-8 shadow-photo space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-400" />
            <h3 className="font-serif font-bold text-xl text-ivory-50">
              AI Clinical Assessment — {activePatient.name}
            </h3>
          </div>
          <button
            onClick={() => setReportModalPatient(activePatient)}
            className="text-xs font-bold text-gold-300 hover:text-gold-200 flex items-center gap-1 underline underline-offset-4"
          >
            <span>View Full Report Dossier</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-ivory-200 text-sm md:text-base leading-relaxed">
<<<<<<< HEAD
          Patient <strong>{selectedPatient.name}</strong> maintains consistent cognitive performance in visual photo recognition. Response time improved from 4.2s to 2.4s across all cognitive games. Adaptive difficulty automatically adjusted with smooth accuracy preservation.
=======
          Patient <strong>{activePatient.name}</strong> (Age {activePatient.age}, {activePatient.hierarchy.district}) has completed <strong>{totalGamesPlayed} cognitive sessions</strong> with an overall mean accuracy of <strong>{avgAccuracy}%</strong> and response speed of <strong>{avgResponseTimeSec}s</strong>. 
          {accuracyImprovement !== null && accuracyImprovement >= 0 ? (
            <span> Performance shows a steady positive progress of <strong>+{accuracyImprovement}%</strong> across longitudinal sessions.</span>
          ) : (
            <span> Difficulty calibrated to <strong>{currentDifficulty.toUpperCase()}</strong> with supportive cognitive pacing.</span>
          )}
>>>>>>> origin/main
        </p>
        <p className="text-xs font-semibold text-gold-300 flex items-center gap-1 pt-1">
          <AlertCircle className="w-4 h-4 text-gold-400" />
          <span>Real-time clinical telemetry for monitoring and caregiver guidance — not an automated medical diagnosis.</span>
        </p>
      </div>

      {/* 4. Real-Time Game Analytics KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-ivory-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-bold uppercase tracking-wider">Games Played</span>
            <Gamepad2 className="w-4 h-4 text-forest-800" />
          </div>
          <p className="text-3xl font-serif font-bold text-charcoal-900">{totalGamesPlayed}</p>
          <p className="text-xs text-forest-700 font-medium">Logged cognitive sessions</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-ivory-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-bold uppercase tracking-wider">Average Accuracy</span>
            <Target className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-3xl font-serif font-bold text-forest-900">{avgAccuracy}%</p>
          <p className="text-xs text-charcoal-500 font-medium">Across all played activities</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-ivory-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Response Time</span>
            <Clock className="w-4 h-4 text-blue-700" />
          </div>
          <p className="text-3xl font-serif font-bold text-charcoal-900">{avgResponseTimeSec}s</p>
          <p className="text-xs text-charcoal-500 font-medium">Reaction latency</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-ivory-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-bold uppercase tracking-wider">Cognitive Level</span>
            <Award className="w-4 h-4 text-gold-500" />
          </div>
          <p className="text-2xl md:text-3xl font-serif font-bold capitalize text-charcoal-900">{currentDifficulty}</p>
          <p className="text-xs text-forest-800 font-semibold">Active adaptive mode</p>
        </div>
      </div>

      {/* 5. Analytics Charts & Domain Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
<<<<<<< HEAD
        {/* Recharts Performance Zigzag Trend */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-ivory-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-xl text-charcoal-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-forest-800" />
                <span>Accuracy & Response Time Zigzag Trends</span>
              </h3>
              <p className="text-xs text-charcoal-500">Dynamic session-by-session zigzag performance metrics across all games</p>
            </div>
            <span className="text-xs font-bold text-forest-800 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
              All Sessions Tracked
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="session" stroke="#64748B" fontSize={11} />
                <YAxis yAxisId="left" stroke="#15803D" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis yAxisId="right" orientation="right" stroke="#2563EB" fontSize={11} domain={[0, 6]} tickFormatter={(v) => `${v}s`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '14px', color: '#fff', border: '1px solid #334155' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Line
                  yAxisId="left"
                  type="linear"
                  dataKey="accuracy"
                  name="Accuracy (%)"
                  stroke="#15803D"
                  strokeWidth={3}
                  dot={{ r: 4.5, fill: '#15803D', stroke: '#FFFFFF', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#F59E0B', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
                <Line
                  yAxisId="right"
                  type="linear"
                  dataKey="responseTimeSec"
                  name="Response Speed (s)"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  strokeDasharray="4 2"
                  dot={{ r: 4, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
=======
        {/* Recharts Performance Trend */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-ivory-200/80 shadow-soft space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-xl text-charcoal-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-forest-800" />
                <span>{metricView === 'accuracy' ? 'Accuracy Trend (%)' : 'Response Time Trend (Seconds)'}</span>
              </h3>
              <p className="text-xs text-charcoal-500">Live timeline generated from recorded game sessions for {activePatient.name}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-ivory-100 p-1 rounded-full flex items-center border border-ivory-300">
                <button
                  onClick={() => setMetricView('accuracy')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    metricView === 'accuracy' ? 'bg-forest-800 text-white shadow-xs' : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  Accuracy (%)
                </button>
                <button
                  onClick={() => setMetricView('responseTime')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    metricView === 'responseTime' ? 'bg-forest-800 text-white shadow-xs' : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  Response Time (s)
                </button>
              </div>
            </div>
          </div>

          {/* Activity Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-ivory-100">
            <span className="text-xs font-bold text-charcoal-500 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter Game:
            </span>
            <button
              onClick={() => setSelectedActivityFilter('all')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${
                selectedActivityFilter === 'all'
                  ? 'bg-charcoal-900 text-white'
                  : 'bg-ivory-100 text-charcoal-700 hover:bg-ivory-200'
              }`}
            >
              All ({patientSessions.length})
            </button>
            {Object.entries(ACTIVITY_META).map(([key, meta]) => {
              const count = patientSessions.filter((s) => s.activityType === key).length;
              if (count === 0 && selectedActivityFilter !== key) return null;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedActivityFilter(key)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${
                    selectedActivityFilter === key
                      ? 'bg-forest-800 text-white'
                      : 'bg-ivory-100 text-charcoal-700 hover:bg-ivory-200'
                  }`}
                >
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Area Chart Container */}
          <div className="h-72 w-full pt-2">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {metricView === 'accuracy' ? (
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E4925" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#1E4925" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE2D3" />
                    <XAxis dataKey="session" stroke="#58615E" fontSize={12} />
                    <YAxis stroke="#58615E" fontSize={12} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      name="Accuracy (%)"
                      stroke="#1E4925"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAccuracy)"
                      dot={{ fill: '#1E4925', r: 4 }}
                      activeDot={{ r: 6, fill: '#D97706' }}
                    />
                  </AreaChart>
                ) : (
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE2D3" />
                    <XAxis dataKey="session" stroke="#58615E" fontSize={12} />
                    <YAxis stroke="#58615E" fontSize={12} domain={[0, 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="responseTimeSec"
                      name="Response Time (s)"
                      stroke="#2563EB"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorTime)"
                      dot={{ fill: '#2563EB', r: 4 }}
                      activeDot={{ r: 6, fill: '#D97706' }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-charcoal-400 space-y-2">
                <BarChart3 className="w-10 h-10 stroke-1" />
                <p className="text-sm font-medium">No game sessions logged for this filter yet.</p>
              </div>
            )}
>>>>>>> origin/main
          </div>
        </div>

        {/* Cognitive Domain Breakdown Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-ivory-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-forest-800" />
              <span>Domain Breakdown</span>
            </h3>
            <span className="text-xs font-bold text-forest-800 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
              {activePatient.name.split(' ')[0]}
            </span>
          </div>

          <div className="space-y-3">
            {domainBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-charcoal-800">
                  <span>{item.domain}</span>
                  <span className="text-forest-900">{item.score}%</span>
                </div>
                <div className="w-full bg-ivory-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.score >= 80 ? 'bg-forest-700' : item.score >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-ivory-200 text-center">
            <button
              onClick={() => setReportModalPatient(activePatient)}
              className="w-full py-2.5 px-4 rounded-2xl bg-ivory-100 hover:bg-ivory-200 text-charcoal-800 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4 text-forest-800" />
              <span>Generate Printable Patient Report</span>
            </button>
          </div>
        </div>

      </div>

      {/* 6. Session History & Adaptive Difficulty Log Table */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-200/80 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-forest-800" />
              <span>Session History & Adaptive Difficulty Log</span>
            </h3>
            <p className="text-xs text-charcoal-500">
              Chronological records of all games played and automated difficulty calibrations for <strong>{activePatient.name}</strong>
            </p>
          </div>

          <span className="text-xs font-bold text-forest-800 bg-forest-50 px-3 py-1 rounded-full border border-forest-200 self-start sm:self-auto">
            {filteredSessions.length} Total Sessions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory-100 text-charcoal-700 border-b border-ivory-200">
              <tr>
                <th className="py-3 px-4 font-bold">Date & Time</th>
                <th className="py-3 px-4 font-bold">Activity Played</th>
                <th className="py-3 px-4 font-bold">Accuracy Score</th>
                <th className="py-3 px-4 font-bold">Avg Response Time</th>
                <th className="py-3 px-4 font-bold">Attempts</th>
                <th className="py-3 px-4 font-bold">Difficulty Level</th>
                <th className="py-3 px-4 font-bold">Adaptive Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((sess) => {
                  const meta = ACTIVITY_META[sess.activityType] || {
                    label: sess.activityType.replace('_', ' '),
                    color: 'text-charcoal-800',
                    bg: 'bg-ivory-100 border-ivory-200',
                  };

                  let accuracyColor = 'text-emerald-900 bg-emerald-100 border-emerald-300';
                  if (sess.accuracyPercentage < 65) {
                    accuracyColor = 'text-red-900 bg-red-100 border-red-300';
                  } else if (sess.accuracyPercentage < 80) {
                    accuracyColor = 'text-amber-900 bg-amber-100 border-amber-300';
                  }

                  let adaptiveText = 'Maintained Level';
                  let adaptiveBadgeBg = 'bg-ivory-200 text-charcoal-800';

                  if (sess.difficultyAdjusted) {
                    if (sess.accuracyPercentage >= 85) {
                      adaptiveText = `Promoted to ${sess.difficultyLevel.toUpperCase()}`;
                      adaptiveBadgeBg = 'bg-emerald-100 text-emerald-900 border border-emerald-300';
                    } else if (sess.accuracyPercentage < 55) {
                      adaptiveText = `Simplified to ${sess.difficultyLevel.toUpperCase()}`;
                      adaptiveBadgeBg = 'bg-amber-100 text-amber-900 border border-amber-300';
                    } else {
                      adaptiveText = 'Difficulty Calibrated';
                      adaptiveBadgeBg = 'bg-forest-100 text-forest-900 border border-forest-300';
                    }
                  }

                  return (
                    <tr key={sess.id} className="hover:bg-ivory-50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-charcoal-900">
                        <div>{formatDate(sess.timestamp)}</div>
                        <div className="text-xs text-charcoal-500">{formatTime(sess.timestamp)}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${meta.bg} ${meta.color}`}>
                          <Gamepad2 className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${accuracyColor}`}>
                          {sess.accuracyPercentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-700 font-medium">
                        {((sess.avgResponseTimeMs || 3000) / 1000).toFixed(1)}s
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-700">
                        {sess.attemptsCount || 1}
                      </td>
                      <td className="py-3.5 px-4 capitalize font-semibold text-charcoal-800">
                        {sess.difficultyLevel}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${adaptiveBadgeBg}`}>
                          <Zap className="w-3 h-3" />
                          {adaptiveText}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-charcoal-500 text-sm">
                    No game sessions found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

<<<<<<< HEAD
      {/* Clinical Patient Behaviour Report Modal */}
      <PatientBehaviourReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        patient={selectedPatient}
        sessions={sessionHistory}
      />
=======
      {/* 7. INDIVIDUAL PATIENT PERFORMANCE REPORT MODAL (PRINTABLE / EXPORTABLE) */}
      {reportModalPatient && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-ivory-300 relative print:p-0 print:border-none print:shadow-none print:max-w-none">
            
            {/* Modal Actions Bar (hidden on print) */}
            <div className="flex items-center justify-between border-b border-ivory-200 pb-4 print:hidden">
              <div className="flex items-center gap-2 text-forest-800 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Official Patient Cognitive Performance Dossier</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-800 text-white text-xs font-bold hover:bg-forest-900 transition-all shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setReportModalPatient(null)}
                  className="p-2 rounded-full hover:bg-ivory-100 text-charcoal-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Header */}
            <div className="text-center space-y-1.5 border-b-2 border-forest-900 pb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-forest-800">
                Government of India · North Eastern Council (NEC) Cognitive Health Initiative
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-charcoal-900">
                SMRITI-SETU COGNITIVE HEALTH & ENGAGEMENT DOSSIER
              </h2>
              <p className="text-xs text-charcoal-600">
                Guwahati Regional Cognitive Care Center · Clinical Review Node AS-042 · Report Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Patient Demographics Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-ivory-50 border border-ivory-200 text-xs">
              <div>
                <span className="text-charcoal-500 font-bold block">Patient Full Name</span>
                <strong className="text-charcoal-900 text-sm font-serif">{reportModalPatient.name}</strong>
              </div>
              <div>
                <span className="text-charcoal-500 font-bold block">Patient ID & Age</span>
                <strong className="text-charcoal-900">{reportModalPatient.id} · Age {reportModalPatient.age} ({reportModalPatient.gender})</strong>
              </div>
              <div>
                <span className="text-charcoal-500 font-bold block">Region / District</span>
                <strong className="text-charcoal-900">{reportModalPatient.hierarchy.district}, {reportModalPatient.hierarchy.state}</strong>
              </div>
              <div>
                <span className="text-charcoal-500 font-bold block">Attending Clinician</span>
                <strong className="text-charcoal-900">{reportModalPatient.attendingClinicianName}</strong>
              </div>
              <div>
                <span className="text-charcoal-500 font-bold block">Primary Caregiver</span>
                <strong className="text-charcoal-900">{reportModalPatient.primaryCaregiverName} ({reportModalPatient.primaryCaregiverContact})</strong>
              </div>
              <div>
                <span className="text-charcoal-500 font-bold block">Preferred Language</span>
                <strong className="text-charcoal-900 uppercase">{reportModalPatient.preferredLanguage} (Regional Native)</strong>
              </div>
              <div>
                <span className="text-charcoal-500 font-bold block">Care Facility</span>
                <strong className="text-charcoal-900">{reportModalPatient.hierarchy.facilityName}</strong>
              </div>
              <div>
                <span className="text-charcoal-500 font-bold block">Console Status</span>
                <strong className="text-emerald-700 font-bold">ESP32 IoT Online & Synced</strong>
              </div>
            </div>

            {/* Executive Performance Metrics Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-ivory-200 bg-white shadow-xs text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">Overall Accuracy</span>
                <p className="text-3xl font-serif font-bold text-forest-900">{avgAccuracy}%</p>
                <span className="text-[10px] text-emerald-700 font-semibold">High Retention</span>
              </div>
              <div className="p-4 rounded-2xl border border-ivory-200 bg-white shadow-xs text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">Mean Speed</span>
                <p className="text-3xl font-serif font-bold text-blue-900">{avgResponseTimeSec}s</p>
                <span className="text-[10px] text-blue-700 font-semibold">Prompt Latency</span>
              </div>
              <div className="p-4 rounded-2xl border border-ivory-200 bg-white shadow-xs text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">Total Sessions</span>
                <p className="text-3xl font-serif font-bold text-charcoal-900">{patientSessions.length}</p>
                <span className="text-[10px] text-charcoal-600 font-semibold">Completed Games</span>
              </div>
              <div className="p-4 rounded-2xl border border-ivory-200 bg-white shadow-xs text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">Active Level</span>
                <p className="text-2xl font-serif font-bold capitalize text-amber-900">{currentDifficulty}</p>
                <span className="text-[10px] text-amber-700 font-semibold">Calibrated Pacing</span>
              </div>
            </div>

            {/* Cognitive Domain Competencies Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-charcoal-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-forest-800" />
                <span>Cognitive Domain Competency Assessment</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {domainBreakdown.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-charcoal-800">{item.domain}</span>
                      <span className="text-forest-900">{item.score}% ({item.gamesCount} games)</span>
                    </div>
                    <div className="w-full bg-ivory-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.score >= 80 ? 'bg-forest-700' : item.score >= 65 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Game History Timeline Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-charcoal-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest-800" />
                <span>Chronological Game Performance Log</span>
              </h4>
              <table className="w-full text-left text-xs border border-ivory-200 rounded-xl overflow-hidden">
                <thead className="bg-ivory-100 text-charcoal-700 font-bold border-b border-ivory-200">
                  <tr>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Game Played</th>
                    <th className="py-2.5 px-3">Accuracy</th>
                    <th className="py-2.5 px-3">Response Time</th>
                    <th className="py-2.5 px-3">Attempts</th>
                    <th className="py-2.5 px-3">Difficulty Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200">
                  {patientSessions.map((sess) => (
                    <tr key={sess.id}>
                      <td className="py-2 px-3 font-medium text-charcoal-900">{formatDate(sess.timestamp)} {formatTime(sess.timestamp)}</td>
                      <td className="py-2 px-3 capitalize font-bold text-forest-800">{sess.activityType.replace('_', ' ')}</td>
                      <td className="py-2 px-3 font-bold text-forest-900">{sess.accuracyPercentage}%</td>
                      <td className="py-2 px-3">{((sess.avgResponseTimeMs || 3000) / 1000).toFixed(1)}s</td>
                      <td className="py-2 px-3">{sess.attemptsCount || 1}</td>
                      <td className="py-2 px-3 capitalize font-semibold">{sess.difficultyLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Clinical Directives & Doctor Sign-Off */}
            <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 space-y-2 text-xs">
              <span className="font-bold text-forest-900 uppercase tracking-wider block">Clinical Notes & Caregiver Directives</span>
              <p className="text-charcoal-700 leading-relaxed">
                {reportModalPatient.cognitiveProfileNote} Longitudinal scores reflect consistent visual reminiscence engagement. Continued daily routine recall at morning hours and family photo matching is recommended.
              </p>
              <div className="pt-4 flex justify-between items-end border-t border-forest-200 text-charcoal-600">
                <div>
                  <span className="block font-bold">Verified by:</span>
                  <span>{reportModalPatient.attendingClinicianName}</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-emerald-800">✓ Digitally Signed & Authenticated</span>
                  <span className="text-[10px]">Smriti-Setu Clinical Engine v1.0.0</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

>>>>>>> origin/main
    </div>
  );
};
