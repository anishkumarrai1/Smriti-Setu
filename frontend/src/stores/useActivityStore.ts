import { create } from 'zustand';
import { CognitiveActivity, GameSession, DifficultyLevel, ActivityType } from '../types';
import { calculateNextDifficulty } from '../utils/adaptiveDifficulty';
import { gameApi } from '../services/api';

interface ActivityState {
  activities: CognitiveActivity[];
  activeSession: GameSession | null;
  sessionStartTime: number;
  sessionHistory: GameSession[];
  currentDifficulty: DifficultyLevel;
  difficultyAdjustmentNotice: string | null;
  startSession: (type: ActivityType) => void;
  completeSession: (
    accuracy: number,
    attempts: number,
    responseTimeMs: number,
    explicitActivityType?: ActivityType
  ) => void;
  fetchSessionHistory: (patientId?: string) => Promise<void>;
  clearNotice: () => void;
  resetToDefaults: () => void;
}

const availableActivities: CognitiveActivity[] = [
  {
    id: 'act-1',
    type: 'memory_match',
    title: 'Remember the Picture',
    subtitle: 'Match pairs of familiar regional photos and cultural heritage symbols.',
    description: 'Strengthen visual recall through familiar family photographs and tea garden scenes.',
    estimatedMinutes: 5,
    difficulty: 'easy',
    iconName: 'LayoutGrid',
    category: 'Memory & Recall',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-3',
    type: 'picture_recognition',
    title: 'Who Is This?',
    subtitle: 'Identify familiar family members and regional landmark places.',
    description: 'Recognize familiar faces, Assam tea estates, and historical landmarks.',
    estimatedMinutes: 5,
    difficulty: 'easy',
    iconName: 'Image',
    category: 'Person & Object Recognition',
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-5',
    type: 'routine_recall',
    title: 'Remember Your Morning',
    subtitle: 'Sequence your peaceful daily habits and morning wellness routine.',
    description: 'Order your morning steps from stretching to taking morning tea with family.',
    estimatedMinutes: 4,
    difficulty: 'easy',
    iconName: 'CalendarCheck',
    category: 'Daily Routine Memory',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-4',
    type: 'familiar_sound',
    title: 'Listen to Familiar Sounds',
    subtitle: 'Listen to regional acoustic sounds (rain on bamboo, Bihu flute, birdsong).',
    description: 'Match peaceful auditory sounds from nature and traditional instruments.',
    estimatedMinutes: 5,
    difficulty: 'easy',
    iconName: 'Volume2',
    category: 'Auditory Recognition',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-2',
    type: 'sequence_recall',
    title: 'Pattern & Color Recall',
    subtitle: 'Remember visual pattern sequences in a calm cadence.',
    description: 'Follow and repeat color patterns to train focus and attention span.',
    estimatedMinutes: 4,
    difficulty: 'easy',
    iconName: 'ListOrdered',
    category: 'Attention & Focus',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-6',
    type: 'photo_puzzle',
    title: 'Personalized Photo Puzzle',
    subtitle: 'Upload any family photo, slice it into pieces, and reconstruct it.',
    description: 'Upload your own cherished photos or choose cultural memories to reconstruct visually.',
    estimatedMinutes: 5,
    difficulty: 'easy',
    iconName: 'Puzzle',
    category: 'Visual Reminiscence',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80',
  },
];

const initialHistory: GameSession[] = [
  {
    id: 'sess-108',
    patientId: 'pat-ner-001',
    activityType: 'photo_puzzle',
    timestamp: '2026-08-30T10:45:00Z',
    accuracyPercentage: 94,
    attemptsCount: 11,
    avgResponseTimeMs: 2400,
    completed: true,
    difficultyLevel: 'medium',
    difficultyAdjusted: true,
  },
  {
    id: 'sess-107',
    patientId: 'pat-ner-001',
    activityType: 'memory_match',
    timestamp: '2026-08-30T09:15:00Z',
    accuracyPercentage: 86,
    attemptsCount: 8,
    avgResponseTimeMs: 3100,
    completed: true,
    difficultyLevel: 'medium',
    difficultyAdjusted: false,
  },
  {
    id: 'sess-106',
    patientId: 'pat-ner-001',
    activityType: 'familiar_sound',
    timestamp: '2026-08-29T16:20:00Z',
    accuracyPercentage: 100,
    attemptsCount: 4,
    avgResponseTimeMs: 1900,
    completed: true,
    difficultyLevel: 'easy',
    difficultyAdjusted: false,
  },
  {
    id: 'sess-105',
    patientId: 'pat-ner-001',
    activityType: 'routine_recall',
    timestamp: '2026-08-29T08:50:00Z',
    accuracyPercentage: 75,
    attemptsCount: 6,
    avgResponseTimeMs: 4600,
    completed: true,
    difficultyLevel: 'easy',
    difficultyAdjusted: false,
  },
  {
    id: 'sess-104',
    patientId: 'pat-ner-001',
    activityType: 'photo_puzzle',
    timestamp: '2026-08-28T14:30:00Z',
    accuracyPercentage: 91,
    attemptsCount: 14,
    avgResponseTimeMs: 2800,
    completed: true,
    difficultyLevel: 'easy',
    difficultyAdjusted: false,
  },
  {
    id: 'sess-103',
    patientId: 'pat-ner-001',
    activityType: 'memory_match',
    timestamp: '2026-08-28T09:30:00Z',
    accuracyPercentage: 88,
    attemptsCount: 6,
    avgResponseTimeMs: 3400,
    completed: true,
    difficultyLevel: 'medium',
    difficultyAdjusted: true,
  },
];

const LOCAL_STORAGE_SESSIONS_KEY = 'smriti_setu_game_sessions';

const loadPersistedSessions = (): GameSession[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse local session history', e);
  }
  return initialHistory;
};

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: availableActivities,
  activeSession: null,
  sessionStartTime: Date.now(),
  sessionHistory: loadPersistedSessions(),
  currentDifficulty: 'easy',
  difficultyAdjustmentNotice: null,

  fetchSessionHistory: async (patientId = 'pat-ner-001') => {
    try {
      const backendHistory = await gameApi.getSessionHistory(patientId);
      if (Array.isArray(backendHistory) && backendHistory.length > 0) {
        const local = get().sessionHistory;
        const map = new Map<string, GameSession>();
        [...backendHistory, ...local].forEach((item) => map.set(item.id, item));
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(merged));
        set({ sessionHistory: merged });
      }
    } catch (err) {
      console.warn('Using local session history (offline mode)', err);
    }
  },

  startSession: (type) => {
    const now = Date.now();
    const newSession: GameSession = {
      id: `sess-${now}`,
      patientId: 'pat-ner-001',
      activityType: type,
      timestamp: new Date().toISOString(),
      accuracyPercentage: 0,
      attemptsCount: 0,
      avgResponseTimeMs: 0,
      completed: false,
      difficultyLevel: get().currentDifficulty,
      difficultyAdjusted: false,
    };
    set({ activeSession: newSession, sessionStartTime: now });
  },

  completeSession: async (accuracy, attempts, responseTimeMs, explicitActivityType) => {
    const { activeSession, sessionHistory, currentDifficulty, sessionStartTime } = get();

    const elapsedMs = Math.max(1500, Date.now() - (sessionStartTime || Date.now()));
    const finalResponseTimeMs = responseTimeMs > 0 ? responseTimeMs : elapsedMs;
    const finalAttempts = Math.max(1, attempts);
    const targetActivity = explicitActivityType || activeSession?.activityType || 'memory_match';

    const completedSession: GameSession = {
      id: activeSession?.id || `sess-${Date.now()}`,
      patientId: activeSession?.patientId || 'pat-ner-001',
      activityType: targetActivity,
      timestamp: new Date().toISOString(),
      accuracyPercentage: Math.max(0, Math.min(100, Math.round(accuracy))),
      attemptsCount: finalAttempts,
      avgResponseTimeMs: finalResponseTimeMs,
      completed: true,
      difficultyLevel: currentDifficulty,
      difficultyAdjusted: false,
    };

    const updatedHistory = [completedSession, ...sessionHistory.filter((s) => s.id !== completedSession.id)];
    const adaptResult = calculateNextDifficulty(currentDifficulty, updatedHistory);

    completedSession.difficultyLevel = adaptResult.nextDifficulty;
    completedSession.difficultyAdjusted = adaptResult.adjusted;

    let notice: string | null = null;
    if (adaptResult.adjusted) {
      notice = `Activity difficulty adjusted to ${adaptResult.nextDifficulty.toUpperCase()} based on your performance trends.`;
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(updatedHistory));
    } catch {
      // LocalStorage quota safety
    }

    set({
      activeSession: null,
      sessionHistory: updatedHistory,
      currentDifficulty: adaptResult.nextDifficulty,
      difficultyAdjustmentNotice: notice,
    });

    try {
      const backendResult = await gameApi.submitSessionResult(completedSession);
      if (backendResult?.nextDifficulty) {
        set({
          currentDifficulty: backendResult.nextDifficulty as DifficultyLevel,
          difficultyAdjustmentNotice: backendResult.adjusted
            ? `Activity difficulty adjusted to ${backendResult.nextDifficulty.toUpperCase()} based on your performance trends.`
            : notice,
        });
      }
    } catch {
      // Game session preserved in local storage in offline mode
    }
  },

  clearNotice: () => set({ difficultyAdjustmentNotice: null }),

  resetToDefaults: () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_SESSIONS_KEY);
    } catch {}
    set({ sessionHistory: initialHistory, activeSession: null });
  },
}));
