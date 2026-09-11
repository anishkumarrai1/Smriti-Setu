import { create } from 'zustand';
import { Reminder, ReminderState } from '../types';
import { reminderApi } from '../services/api';

interface ReminderStoreState {
  reminders: Reminder[];
  fetchReminders: (patientId?: string) => Promise<void>;
  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<void>;
  updateReminderState: (id: string, state: ReminderState) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
}

const initialReminders: Reminder[] = [
  {
    id: 'rem-1',
    patientId: 'pat-ner-001',
    title: 'Morning Cognitive Health Medication',
    type: 'medicine',
    scheduledTime: '08:30 AM',
    state: 'upcoming',
    notes: 'Take 1 tablet after breakfast with warm water.',
    voicePromptText: 'Ranjit, it is time for your morning medication with warm water.',
  },
  {
    id: 'rem-2',
    patientId: 'pat-ner-001',
    title: 'Mid-Morning Hydration (Fresh Water)',
    type: 'hydration',
    scheduledTime: '11:00 AM',
    state: 'upcoming',
    notes: 'Drink one full glass of clean water.',
    voicePromptText: 'Time to drink a glass of fresh water to stay hydrated.',
  },
  {
    id: 'rem-3',
    patientId: 'pat-ner-001',
    title: 'Daily Memory Match Activity',
    type: 'activity',
    scheduledTime: '04:00 PM',
    state: 'upcoming',
    notes: "Complete today's 5-minute Memory Match game.",
    voicePromptText: "It is 4 PM. Let us enjoy today's Memory Match activity together.",
  },
  {
    id: 'rem-4',
    patientId: 'pat-ner-001',
    title: 'Monthly Cognitive Health Checkup',
    type: 'appointment',
    scheduledTime: '10:30 AM (Tomorrow)',
    state: 'upcoming',
    notes: 'Appointment with Dr. Devashish Phukan at Guwahati Regional Cognitive Care Center.',
    voicePromptText: 'Reminder: Tomorrow at 10:30 AM you have a health checkup with Dr. Phukan.',
  },
];

export const useReminderStore = create<ReminderStoreState>((set) => ({
  reminders: initialReminders,

  fetchReminders: async (patientId = 'pat-ner-001') => {
    try {
      const data = await reminderApi.getReminders(patientId);
      if (Array.isArray(data) && data.length > 0) {
        set({ reminders: data });
      }
    } catch (err) {
      console.warn('Backend unavailable, using local reminders', err);
    }
  },

  addReminder: async (newRem) => {
    const tempId = `rem-${Date.now()}`;
    const localRem: Reminder = {
      ...newRem,
      id: tempId,
    };
    set((state) => ({ reminders: [...state.reminders, localRem] }));

    try {
      const created = await reminderApi.createReminder(newRem);
      if (created && created.id) {
        set((state) => ({
          reminders: state.reminders.map((r) => (r.id === tempId ? created : r)),
        }));
      }
    } catch (err) {
      console.warn('Reminder added locally (offline mode)', err);
    }
  },

  updateReminderState: async (id, newState) => {
    set((state) => ({
      reminders: state.reminders.map((r) => (r.id === id ? { ...r, state: newState } : r)),
    }));

    try {
      await reminderApi.updateReminder(id, { state: newState });
    } catch (err) {
      console.warn('Reminder state updated locally (offline mode)', err);
    }
  },

  deleteReminder: async (id) => {
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== id),
    }));

    try {
      await reminderApi.deleteReminder(id);
    } catch (err) {
      console.warn('Reminder deleted locally (offline mode)', err);
    }
  },
}));
