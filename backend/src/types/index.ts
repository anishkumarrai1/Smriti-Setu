// Core TypeScript Types for SMRITI-SETU Platform Backend (synchronized with Frontend)

export type UserRole = 'patient' | 'caregiver' | 'clinician' | 'facility_admin';

export type RegionalState = 
  | 'Assam' 
  | 'Meghalaya' 
  | 'Manipur' 
  | 'Mizoram' 
  | 'Nagaland' 
  | 'Tripura' 
  | 'Arunachal Pradesh' 
  | 'Sikkim';

export interface RegionalHierarchy {
  region: 'North Eastern Region';
  state: RegionalState;
  district: string;
  facilityId: string;
  facilityName: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  preferredLanguage: 'en' | 'hi' | 'as' | 'bn';
  hierarchy: RegionalHierarchy;
  primaryCaregiverName: string;
  primaryCaregiverContact: string;
  attendingClinicianName: string;
  cognitiveProfileNote: string;
  elderlyModeEnabled: boolean;
  avatarUrl?: string;
}

export type MemoryCategory = 
  | 'Childhood' 
  | 'School' 
  | 'Career' 
  | 'Marriage' 
  | 'Family' 
  | 'Grandchildren' 
  | 'Important Events';

export interface MemoryEntry {
  id: string;
  patientId: string;
  title: string;
  titleHi?: string;
  titleEn?: string;
  titleAs?: string;
  titleBn?: string;
  titleNe?: string;
  titleBrx?: string;
  year: number;
  person?: string;
  location?: string;
  category: MemoryCategory;
  story: string;
  storyHi?: string;
  storyEn?: string;
  storyAs?: string;
  storyBn?: string;
  storyNe?: string;
  storyBrx?: string;
  imageUrl?: string;
  audioUrl?: string;
  createdAt: string;
  tags?: string[];
  featured?: boolean;
}

export type ActivityType = 
  | 'memory_match' 
  | 'sequence_recall' 
  | 'picture_recognition' 
  | 'familiar_sound' 
  | 'routine_recall'
  | 'photo_puzzle';

export type DifficultyLevel = 'easy' | 'medium' | 'challenging';

export interface CognitiveActivity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  description: string;
  estimatedMinutes: number;
  difficulty: DifficultyLevel;
  iconName: string;
  category: string;
  imageUrl: string;
}

export interface GameSession {
  id: string;
  patientId: string;
  activityType: ActivityType;
  timestamp: string;
  accuracyPercentage: number;
  attemptsCount: number;
  avgResponseTimeMs: number;
  completed: boolean;
  difficultyLevel: DifficultyLevel;
  difficultyAdjusted: boolean;
  notes?: string;
}

export type HardwareStatus = 'online' | 'offline' | 'connecting';

export interface ESP32Device {
  deviceId: string;
  deviceName: string;
  facilityId: string;
  facilityName: string;
  assignedPatientId?: string;
  assignedPatientName?: string;
  status: HardwareStatus;
  lastHeartbeat: string;
  firmwareVersion: string;
  hardwareModel: string;
  ipAddress?: string;
  ledColor: 'green' | 'yellow' | 'red' | 'off';
  buzzerActive: boolean;
}

export interface DeviceEvent {
  id: string;
  deviceId: string;
  timestamp: string;
  eventType: 'button_press' | 'led_toggle' | 'buzzer_alert' | 'heartbeat' | 'sync_triggered';
  payload: string;
}

export type ReminderType = 'medicine' | 'hydration' | 'activity' | 'appointment';
export type ReminderState = 'upcoming' | 'completed' | 'missed' | 'snoozed';

export interface Reminder {
  id: string;
  patientId: string;
  title: string;
  type: ReminderType;
  scheduledTime: string;
  state: ReminderState;
  notes?: string;
  voicePromptText?: string;
}

export type SyncState = 'offline' | 'syncing' | 'synced';

export interface SyncPendingItem {
  id: string;
  action: 'create_memory' | 'record_session' | 'update_reminder' | 'update_patient';
  payload: Record<string, any>;
  createdAt: string;
}

export interface AdaptiveDifficultyResult {
  nextDifficulty: DifficultyLevel;
  adjusted: boolean;
  reason?: string;
}

export interface GameQuestion {
  id: string;
  activityType: ActivityType | 'reminiscence_quiz';
  difficulty: DifficultyLevel;
  question: string;
  options: string[];
  correctOption: number;
  explanation?: string;
  imageUrl?: string;
  audioText?: string;
  category?: string;
}

