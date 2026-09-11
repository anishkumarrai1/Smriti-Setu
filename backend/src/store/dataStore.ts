import {
  PatientProfile,
  CognitiveActivity,
  MemoryEntry,
  ESP32Device,
  DeviceEvent,
  Reminder,
  GameSession,
  SyncPendingItem,
  AdaptiveDifficultyResult,
  DifficultyLevel,
  GameQuestion,
} from '../types';
import {
  NERState,
  HealthFacility,
  HealthServiceCategory,
  GovProgram,
  GovUpdate,
  GovResource,
  GovPortalFilters,
} from '../types/govPortal';
import {
  initialPatient,
  samplePatientsList,
  initialActivities,
  initialMemories,
  initialDevice,
  initialDeviceLogs,
  initialReminders,
  initialSessions,
} from '../data/seedData';
import {
  nerStatesData,
  sampleFacilitiesData,
  sampleHealthServicesData,
  sampleProgramsData,
  sampleUpdatesData,
  sampleResourcesData,
} from '../data/portalData';
import { predefinedGameQuestions } from '../data/gameQuestionsData';

class BackendDataStore {
  private patients: Map<string, PatientProfile> = new Map();
  private activities: CognitiveActivity[] = [];
  private memories: MemoryEntry[] = [];
  private devices: Map<string, ESP32Device> = new Map();
  private deviceEvents: DeviceEvent[] = [];
  private reminders: Reminder[] = [];
  private sessions: GameSession[] = [];

  // Portal static/dynamic data
  private states: NERState[] = [];
  private facilities: HealthFacility[] = [];
  private services: HealthServiceCategory[] = [];
  private programs: GovProgram[] = [];
  private updates: GovUpdate[] = [];
  private resources: GovResource[] = [];
  private questions: GameQuestion[] = [];

  constructor() {
    this.reset();
  }

  public reset() {
    this.patients = new Map(samplePatientsList.map((p) => [p.id, { ...p }]));
    this.activities = [...initialActivities];
    this.memories = [...initialMemories];
    this.devices = new Map([[initialDevice.deviceId, { ...initialDevice }]]);
    this.deviceEvents = [...initialDeviceLogs];
    this.reminders = [...initialReminders];
    this.sessions = [...initialSessions];
    this.questions = [...predefinedGameQuestions];

    this.states = [...nerStatesData];
    this.facilities = [...sampleFacilitiesData];
    this.services = [...sampleHealthServicesData];
    this.programs = [...sampleProgramsData];
    this.updates = [...sampleUpdatesData];
    this.resources = [...sampleResourcesData];
  }

  // Auth & Patient
  public getActiveProfile(): PatientProfile {
    // Default active profile is Ranjit Borthakur
    return this.patients.get('pat-ner-001') || initialPatient;
  }

  public getPatientById(id: string): PatientProfile | undefined {
    return this.patients.get(id);
  }

  public updatePatient(id: string, updates: Partial<PatientProfile>): PatientProfile | undefined {
    const existing = this.patients.get(id);
    if (!existing) return undefined;
    const updated: PatientProfile = {
      ...existing,
      ...updates,
      hierarchy: updates.hierarchy
        ? { ...existing.hierarchy, ...updates.hierarchy }
        : existing.hierarchy,
    };
    this.patients.set(id, updated);
    return updated;
  }

  // Activities
  public getActivities(): CognitiveActivity[] {
    return this.activities;
  }

  public getActivityById(id: string): CognitiveActivity | undefined {
    return this.activities.find((a) => a.id === id);
  }

  // Predefined Game Questions
  public getQuestions(activityType?: string, difficulty?: string): GameQuestion[] {
    let list = [...this.questions];
    if (activityType) {
      list = list.filter((q) => q.activityType.toLowerCase() === activityType.toLowerCase());
    }
    if (difficulty && difficulty !== 'all') {
      list = list.filter((q) => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    return list;
  }

  public getQuestionById(id: string): GameQuestion | undefined {
    return this.questions.find((q) => q.id === id);
  }

  // Memories
  public getMemories(patientId?: string, category?: string): MemoryEntry[] {
    let result = [...this.memories];
    if (patientId) {
      result = result.filter((m) => m.patientId === patientId);
    }
    if (category && category !== 'All') {
      result = result.filter((m) => m.category.toLowerCase() === category.toLowerCase());
    }
    return result;
  }

  public addMemory(memory: Partial<MemoryEntry>): MemoryEntry {
    const newMemory: MemoryEntry = {
      id: memory.id || `mem-${Date.now()}`,
      patientId: memory.patientId || 'pat-ner-001',
      title: memory.title || 'Untitled Memory',
      year: memory.year || new Date().getFullYear(),
      person: memory.person,
      location: memory.location,
      category: memory.category || 'Family',
      story: memory.story || '',
      imageUrl: memory.imageUrl,
      audioUrl: memory.audioUrl,
      createdAt: memory.createdAt || new Date().toISOString(),
      tags: memory.tags || [],
      featured: memory.featured || false,
    };
    this.memories.unshift(newMemory);
    return newMemory;
  }

  public deleteMemory(id: string): boolean {
    const prevLen = this.memories.length;
    this.memories = this.memories.filter((m) => m.id !== id);
    return this.memories.length < prevLen;
  }

  // Game Sessions & Adaptive Difficulty
  public getSessions(patientId?: string): GameSession[] {
    let list = [...this.sessions];
    if (patientId) {
      list = list.filter((s) => s.patientId === patientId);
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public recordSession(session: GameSession): {
    session: GameSession;
    difficultyResult: AdaptiveDifficultyResult;
  } {
    const newSession: GameSession = {
      ...session,
      id: session.id || `sess-${Date.now()}`,
      timestamp: session.timestamp || new Date().toISOString(),
      completed: session.completed !== undefined ? session.completed : true,
    };

    this.sessions.unshift(newSession);

    // Calculate adaptive difficulty based on recent patient sessions
    const patientHistory = this.getSessions(newSession.patientId);
    const difficultyResult = this.calculateAdaptiveDifficulty(
      newSession.difficultyLevel,
      patientHistory
    );

    if (difficultyResult.adjusted) {
      newSession.difficultyAdjusted = true;
    }

    return { session: newSession, difficultyResult };
  }

  public calculateAdaptiveDifficulty(
    currentDifficulty: DifficultyLevel,
    recentSessions: GameSession[]
  ): AdaptiveDifficultyResult {
    if (!recentSessions || recentSessions.length === 0) {
      return { nextDifficulty: currentDifficulty, adjusted: false };
    }

    // Look at last 3 completed sessions
    const completed = recentSessions.filter((s) => s.completed).slice(0, 3);
    if (completed.length === 0) {
      return { nextDifficulty: currentDifficulty, adjusted: false };
    }

    const avgAccuracy =
      completed.reduce((sum, s) => sum + s.accuracyPercentage, 0) / completed.length;

    if (avgAccuracy >= 85 && currentDifficulty !== 'challenging') {
      const next: DifficultyLevel = currentDifficulty === 'easy' ? 'medium' : 'challenging';
      return {
        nextDifficulty: next,
        adjusted: true,
        reason: 'Consistently high accuracy performance across sessions.',
      };
    }

    if (avgAccuracy < 55 && currentDifficulty !== 'easy') {
      const next: DifficultyLevel = currentDifficulty === 'challenging' ? 'medium' : 'easy';
      return {
        nextDifficulty: next,
        adjusted: true,
        reason: 'Simplified for optimal cognitive comfort and engagement.',
      };
    }

    return { nextDifficulty: currentDifficulty, adjusted: false };
  }

  // Hardware ESP32 Devices
  public getDevice(deviceId: string): ESP32Device | undefined {
    return this.devices.get(deviceId);
  }

  public getDeviceEvents(deviceId?: string): DeviceEvent[] {
    let list = [...this.deviceEvents];
    if (deviceId) {
      list = list.filter((e) => e.deviceId === deviceId);
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addDeviceEvent(deviceId: string, eventType: DeviceEvent['eventType'], payload: string): DeviceEvent {
    const event: DeviceEvent = {
      id: `evt-${Date.now()}`,
      deviceId,
      timestamp: new Date().toISOString(),
      eventType,
      payload,
    };
    this.deviceEvents.unshift(event);

    const dev = this.devices.get(deviceId);
    if (dev) {
      dev.lastHeartbeat = new Date().toISOString();
    }

    return event;
  }

  public updateDeviceState(
    deviceId: string,
    updates: Partial<ESP32Device>
  ): ESP32Device | undefined {
    const dev = this.devices.get(deviceId);
    if (!dev) return undefined;
    const updated: ESP32Device = {
      ...dev,
      ...updates,
      lastHeartbeat: new Date().toISOString(),
    };
    this.devices.set(deviceId, updated);
    return updated;
  }

  // Reminders
  public getReminders(patientId?: string): Reminder[] {
    let list = [...this.reminders];
    if (patientId) {
      list = list.filter((r) => r.patientId === patientId);
    }
    return list;
  }

  public addReminder(reminder: Omit<Reminder, 'id'> & { id?: string }): Reminder {
    const newRem: Reminder = {
      id: reminder.id || `rem-${Date.now()}`,
      patientId: reminder.patientId || 'pat-ner-001',
      title: reminder.title,
      type: reminder.type,
      scheduledTime: reminder.scheduledTime,
      state: reminder.state || 'upcoming',
      notes: reminder.notes,
      voicePromptText: reminder.voicePromptText,
    };
    this.reminders.push(newRem);
    return newRem;
  }

  public updateReminder(id: string, updates: Partial<Reminder>): Reminder | undefined {
    const index = this.reminders.findIndex((r) => r.id === id);
    if (index === -1) return undefined;
    this.reminders[index] = { ...this.reminders[index], ...updates };
    return this.reminders[index];
  }

  public deleteReminder(id: string): boolean {
    const prev = this.reminders.length;
    this.reminders = this.reminders.filter((r) => r.id !== id);
    return this.reminders.length < prev;
  }

  // Offline Sync Processor
  public processSyncBatch(items: SyncPendingItem[]): {
    processedCount: number;
    errors: { itemId: string; error: string }[];
  } {
    let processedCount = 0;
    const errors: { itemId: string; error: string }[] = [];

    for (const item of items) {
      try {
        switch (item.action) {
          case 'create_memory':
            this.addMemory(item.payload);
            processedCount++;
            break;
          case 'record_session':
            this.recordSession(item.payload as GameSession);
            processedCount++;
            break;
          case 'update_reminder':
            if (item.payload.id) {
              this.updateReminder(item.payload.id, item.payload);
              processedCount++;
            }
            break;
          case 'update_patient':
            if (item.payload.id) {
              this.updatePatient(item.payload.id, item.payload);
              processedCount++;
            }
            break;
          default:
            errors.push({ itemId: item.id, error: `Unknown sync action: ${item.action}` });
        }
      } catch (err: any) {
        errors.push({ itemId: item.id, error: err?.message || 'Sync processing error' });
      }
    }

    return { processedCount, errors };
  }

  // Portal queries
  public getStates(): NERState[] {
    return this.states;
  }

  public getStateByCode(code: string): NERState | undefined {
    return this.states.find(
      (s) => s.code.toLowerCase() === code.toLowerCase() || s.name.toLowerCase() === code.toLowerCase()
    );
  }

  public getHealthServices(): HealthServiceCategory[] {
    return this.services;
  }

  public getPrograms(): GovProgram[] {
    return this.programs;
  }

  public getUpdates(): GovUpdate[] {
    return this.updates;
  }

  public getResources(): GovResource[] {
    return this.resources;
  }

  public searchFacilities(filters: GovPortalFilters): HealthFacility[] {
    let result = [...this.facilities];

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.district.toLowerCase().includes(q) ||
          f.state.toLowerCase().includes(q) ||
          f.services.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filters.selectedState && filters.selectedState !== 'All') {
      result = result.filter(
        (f) => f.state.toLowerCase() === filters.selectedState?.toLowerCase()
      );
    }

    if (filters.selectedDistrict && filters.selectedDistrict !== 'All') {
      result = result.filter(
        (f) => f.district.toLowerCase() === filters.selectedDistrict?.toLowerCase()
      );
    }

    if (filters.selectedType && filters.selectedType !== 'All') {
      result = result.filter((f) => f.type === filters.selectedType);
    }

    if (filters.hasCognitiveOnly) {
      result = result.filter((f) => f.hasCognitiveCare);
    }

    return result;
  }
}

export const dataStore = new BackendDataStore();
