import axios from 'axios';
import { 
  PatientProfile, 
  MemoryEntry, 
  GameSession, 
  ESP32Device, 
  DeviceEvent, 
  Reminder,
  SyncPendingItem,
  GameQuestion 
} from '../types';

// Standardized API Client Service Layer for SMRITI-SETU Platform
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Platform-Region': 'North-Eastern-Region-India',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const activeLang = localStorage.getItem('smriti_setu_language') || 'en';
  config.headers['X-Platform-Language'] = activeLang;
  return config;
});

export const authApi = {
  getProfile: async (): Promise<PatientProfile> => {
    return apiClient.get('/auth/profile').then((res) => res.data);
  },
};

export const patientApi = {
  getPatientDetails: async (patientId: string): Promise<PatientProfile> => {
    return apiClient.get(`/patients/${patientId}`).then((res) => res.data);
  },
  updateProfile: async (patientId: string, updates: Partial<PatientProfile>): Promise<PatientProfile> => {
    return apiClient.patch(`/patients/${patientId}`, updates).then((res) => res.data);
  },
};

export const memoryApi = {
  getMemories: async (patientId: string, category?: string): Promise<MemoryEntry[]> => {
    const url = category && category !== 'All' 
      ? `/memories?patientId=${patientId}&category=${encodeURIComponent(category)}`
      : `/memories?patientId=${patientId}`;
    return apiClient.get(url).then((res) => res.data);
  },
  createMemory: async (memory: Partial<MemoryEntry>): Promise<MemoryEntry> => {
    return apiClient.post('/memories', memory).then((res) => res.data);
  },
  deleteMemory: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/memories/${id}`).then((res) => res.data);
  },
};

export const gameApi = {
  submitSessionResult: async (session: GameSession): Promise<{
    success: boolean;
    nextDifficulty: string;
    adjusted?: boolean;
    reason?: string;
  }> => {
    return apiClient.post('/results', session).then((res) => res.data);
  },
  getSessionHistory: async (patientId: string): Promise<GameSession[]> => {
    return apiClient.get(`/sessions?patientId=${patientId}`).then((res) => res.data);
  },
  getQuestions: async (activityType?: string, difficulty?: string): Promise<GameQuestion[]> => {
    let url = '/questions';
    const params = new URLSearchParams();
    if (activityType) params.set('activityType', activityType);
    if (difficulty) params.set('difficulty', difficulty);
    const query = params.toString();
    if (query) url += `?${query}`;
    return apiClient.get(url).then((res) => res.data);
  },
};

export const deviceApi = {
  getDeviceTelemetry: async (deviceId: string): Promise<ESP32Device> => {
    return apiClient.get(`/devices/${deviceId}`).then((res) => res.data);
  },
  getDeviceEvents: async (deviceId: string): Promise<DeviceEvent[]> => {
    return apiClient.get(`/device-events?deviceId=${deviceId}`).then((res) => res.data);
  },
  triggerAction: async (
    deviceId: string,
    actionType: 'led_toggle' | 'buzzer_toggle' | 'button_press' | 'heartbeat',
    payload?: string,
    color?: string
  ): Promise<{ success: boolean; event: DeviceEvent; device: ESP32Device }> => {
    return apiClient
      .post(`/devices/${deviceId}/actions`, { actionType, payload, color })
      .then((res) => res.data);
  },
};

export const reminderApi = {
  getReminders: async (patientId: string): Promise<Reminder[]> => {
    return apiClient.get(`/reminders?patientId=${patientId}`).then((res) => res.data);
  },
  createReminder: async (reminder: Partial<Reminder>): Promise<Reminder> => {
    return apiClient.post('/reminders', reminder).then((res) => res.data);
  },
  updateReminder: async (id: string, updates: Partial<Reminder>): Promise<Reminder> => {
    return apiClient.patch(`/reminders/${id}`, updates).then((res) => res.data);
  },
  deleteReminder: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/reminders/${id}`).then((res) => res.data);
  },
};

export const syncApi = {
  syncBatch: async (items: SyncPendingItem[]): Promise<{
    success: boolean;
    processedCount: number;
    errors: any[];
    timestamp: string;
  }> => {
    return apiClient.post('/sync', { items }).then((res) => res.data);
  },
};

// ==========================================
// CONNECTED MODULAR FULL-STACK SERVICE APIS
// ==========================================

export const systemModuleApi = {
  getStatus: async () => apiClient.get('/system/status').then((res) => res.data),
  getModules: async () => apiClient.get('/system/modules').then((res) => res.data),
};

export const dashboardModuleApi = {
  getSummary: async (patientId: string) =>
    apiClient.get(`/dashboard/summary/${patientId}`).then((res) => res.data),
};

export const translationModuleApi = {
  translateText: async (text: string, targetLanguage: string) =>
    apiClient.post('/translate/text', { text, targetLanguage }).then((res) => res.data),
  getUiStrings: async (languageCode: string) =>
    apiClient.get(`/translate/ui-strings/${languageCode}`).then((res) => res.data),
};

export const emotionModuleApi = {
  checkIn: async (patientId: string, mood: 'happy' | 'calm' | 'worried' | 'sad', notes?: string) =>
    apiClient.post('/emotion/check-in', { patientId, mood, notes }).then((res) => res.data),
  getTrend: async (patientId: string, days = 7) =>
    apiClient.get(`/emotion/trend/${patientId}?days=${days}`).then((res) => res.data),
};

export const timelineModuleApi = {
  getToday: async (patientId: string, windowDays = 14) =>
    apiClient.get(`/timeline/today/${patientId}?windowDays=${windowDays}`).then((res) => res.data),
  getAll: async (patientId: string) =>
    apiClient.get(`/timeline/all/${patientId}`).then((res) => res.data),
  addEvent: async (eventData: {
    patientId: string;
    name: string;
    date: string;
    category?: string;
    description?: string;
  }) => apiClient.post('/timeline/add-event', eventData).then((res) => res.data),
};

export const memoryMatchModuleApi = {
  logResult: async (data: { patientId: string; correct: number; total: number; gridSize?: number }) =>
    apiClient.post('/memory-match/log-result', data).then((res) => res.data),
  getHistory: async (patientId: string) =>
    apiClient.get(`/memory-match/history/${patientId}`).then((res) => res.data),
};

export const photoPuzzleModuleApi = {
  createPuzzle: async (formData: FormData) =>
    apiClient
      .post('/puzzle/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),
  checkPiece: async (data: {
    puzzleId: string;
    pieceIndex: number;
    targetRow: number;
    targetCol: number;
  }) => apiClient.post('/puzzle/check', data).then((res) => res.data),
};

export const routineRecallModuleApi = {
  getQuiz: async (patientId: string, category = 'breakfast', date = 'today') =>
    apiClient
      .get(`/routine/quiz/${patientId}?category=${category}&date=${date}`)
      .then((res) => res.data),
  logRoutine: async (data: {
    patientId: string;
    date: string;
    breakfast?: string;
    lunch?: string;
    activity?: string;
  }) => apiClient.post('/routine/log', data).then((res) => res.data),
};

export const voiceConnectApi = {
  getMessages: async (patientId: string) =>
    apiClient.get(`/voice-messages/list/${patientId}`).then((res) => res.data),
  uploadMessage: async (formData: FormData) =>
    apiClient
      .post('/voice-messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),
};

export const voiceCloneApi = {
  getSamples: async (patientId: string) =>
    apiClient.get(`/voice-clone/samples/${patientId}`).then((res) => res.data),
  generateAudio: async (data: { voiceSampleId: string; text: string; language?: string }) =>
    apiClient.post('/voice-clone/generate', data).then((res) => res.data),
};

export const assistantApi = {
  chat: async (data: {
    message: string;
    language?: string;
    patientId?: string;
    patientName?: string;
    currentTab?: string;
    history?: Array<{ sender: 'user' | 'assistant'; text: string }>;
    apiKey?: string;
  }): Promise<{
    reply: string;
    spokenText: string;
    detectedLanguage: string;
    action: {
      type: 'OPEN_ACTIVITY' | 'OPEN_TAB' | 'TOGGLE_ELDERLY' | 'CHANGE_LANGUAGE' | 'OPEN_PORTAL' | 'NONE';
      payload?: string;
    };
    quickSuggestions: string[];
    source?: string;
  }> => {
    const payload = {
      ...data,
      language: data.language || localStorage.getItem('smriti_setu_language') || 'en',
    };
    return apiClient.post('/assistant/chat', payload).then((res) => res.data);
  },
  getStatus: async () => apiClient.get('/assistant/status').then((res) => res.data),
  setKey: async (apiKey: string) => apiClient.post('/assistant/set-key', { apiKey }).then((res) => res.data),
};

export default apiClient;


