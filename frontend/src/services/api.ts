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
  timeout: 25000,
  withCredentials: true, // Send HTTP-only session cookies automatically
});

apiClient.interceptors.request.use((config) => {
  const activeLang = localStorage.getItem('smriti_setu_language') || 'en';
  config.headers['X-Platform-Language'] = activeLang;
  const token = localStorage.getItem('smriti_auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  getProfile: async (): Promise<PatientProfile> => {
    return apiClient.get('/auth/profile').then((res) => res.data);
  },
  getMe: async () => {
    return apiClient.get('/auth/me').then((res) => res.data);
  },
  sendEmailOtp: async (email: string, captchaToken?: string) => {
    return apiClient.post('/auth/send-email-otp', { email, captchaToken }).then((res) => res.data);
  },
  verifyEmailOtp: async (email: string, otp: string) => {
    return apiClient.post('/auth/verify-email-otp', { email, otp }).then((res) => res.data);
  },
  sendMobileOtp: async (mobileNumber: string, captchaToken?: string) => {
    return apiClient.post('/auth/send-mobile-otp', { mobileNumber, captchaToken }).then((res) => res.data);
  },
  verifyMobileOtp: async (mobileNumber: string, otp: string) => {
    return apiClient.post('/auth/verify-mobile-otp', { mobileNumber, otp }).then((res) => res.data);
  },
  register: async (data: {
    fullName: string;
    email: string;
    emailVerified: boolean;
    mobileNumber: string;
    mobileVerified: boolean;
    password: string;
    assignedRole?: string;
    captchaToken?: string;
  }) => {
    return apiClient.post('/auth/register', data).then((res) => res.data);
  },
  login: async (identifier: string, password: string, captchaToken?: string) => {
    return apiClient.post('/auth/login', { identifier, password, captchaToken }).then((res) => res.data);
  },
  logout: async () => {
    return apiClient.post('/auth/logout').then((res) => res.data);
  },
  forgotPassword: async (identifier: string, captchaToken?: string) => {
    return apiClient.post('/auth/forgot-password', { identifier, captchaToken }).then((res) => res.data);
  },
  resetPassword: async (identifier: string, otp: string, newPassword: string, captchaToken?: string) => {
    return apiClient.post('/auth/reset-password', { identifier, otp, newPassword, captchaToken }).then((res) => res.data);
  },
};

export const adminApi = {
  getUsers: async (params?: { search?: string; role?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return apiClient.get(`/admin/users?${q}`).then((res) => res.data);
  },
  getUserById: async (id: string) => {
    return apiClient.get(`/admin/users/${id}`).then((res) => res.data);
  },
  updateUserStatus: async (id: string, status: 'active' | 'suspended') => {
    return apiClient.patch(`/admin/users/${id}/status`, { status }).then((res) => res.data);
  },
  getLoginActivity: async (params?: { search?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return apiClient.get(`/admin/login-activity?${q}`).then((res) => res.data);
  },
  getStats: async () => {
    return apiClient.get('/admin/stats').then((res) => res.data);
  },
};

export const patientApi = {
  getAllPatients: async (): Promise<PatientProfile[]> => {
    return apiClient.get('/patients').then((res) => res.data);
  },
  createPatient: async (patient: Partial<PatientProfile>): Promise<PatientProfile> => {
    return apiClient.post('/patients', patient).then((res) => res.data);
  },
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
    session: GameSession;
    nextDifficulty: string;
    adjusted: boolean;
  }> => {
    return apiClient.post('/results', session).then((res) => res.data);
  },
  getSessionHistory: async (patientId: string): Promise<GameSession[]> => {
    return apiClient.get(`/sessions/${patientId}`).then((res) => res.data);
  },
  getPredefinedQuestions: async (activityType?: string, difficulty?: string): Promise<GameQuestion[]> => {
    const query = new URLSearchParams();
    if (activityType) query.append('activityType', activityType);
    if (difficulty) query.append('difficulty', difficulty);
    const queryString = query.toString();
    const url = queryString ? `/questions?${queryString}` : '/questions';
    return apiClient.get(url).then((res) => res.data);
  },
  getQuestions: async (activityType?: string, difficulty?: string): Promise<GameQuestion[]> => {
    const query = new URLSearchParams();
    if (activityType) query.append('activityType', activityType);
    if (difficulty) query.append('difficulty', difficulty);
    const queryString = query.toString();
    const url = queryString ? `/questions?${queryString}` : '/questions';
    return apiClient.get(url).then((res) => res.data);
  },
};

export const deviceApi = {
  getDeviceStatus: async (deviceId: string): Promise<ESP32Device> => {
    return apiClient.get(`/devices/${deviceId}`).then((res) => res.data);
  },
  getDeviceTelemetry: async (deviceId: string): Promise<ESP32Device> => {
    return apiClient.get(`/devices/${deviceId}`).then((res) => res.data);
  },
  getDeviceLogs: async (deviceId: string): Promise<DeviceEvent[]> => {
    return apiClient.get(`/device-events?deviceId=${deviceId}`).then((res) => res.data);
  },
  getDeviceEvents: async (deviceId: string): Promise<DeviceEvent[]> => {
    return apiClient.get(`/device-events?deviceId=${deviceId}`).then((res) => res.data);
  },
  triggerAction: async (deviceId: string, action: string, payload?: any, extraParam?: any): Promise<DeviceEvent> => {
    return apiClient.post(`/devices/${deviceId}/actions`, { action, payload: payload || extraParam }).then((res) => res.data);
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
  processSyncQueue: async (items: SyncPendingItem[]): Promise<{ success?: boolean; processedCount: number; errors: any[] }> => {
    return apiClient.post('/sync/batch', { items }).then((res) => res.data);
  },
  syncBatch: async (items: SyncPendingItem[]): Promise<{ success?: boolean; processedCount: number; errors: any[] }> => {
    return apiClient.post('/sync/batch', { items }).then((res) => res.data);
  },
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
