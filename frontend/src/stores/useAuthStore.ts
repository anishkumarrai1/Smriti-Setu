import { create } from 'zustand';
import { UserRole, PatientProfile } from '../types';
import { patientApi, authApi } from '../services/api';

interface AuthState {
  role: UserRole;
  selectedPatient: PatientProfile;
  setRole: (role: UserRole) => void;
  updatePatientProfile: (profile: Partial<PatientProfile>) => Promise<void>;
  fetchFreshProfile: () => Promise<void>;
}

// Realistic sample patient data for North Eastern Region
const initialPatient: PatientProfile = {
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
};

export const useAuthStore = create<AuthState>((set, get) => ({
  role: 'patient', // Default initial role
  selectedPatient: initialPatient,
  setRole: (role) => set({ role }),

  fetchFreshProfile: async () => {
    try {
      const data = await authApi.getProfile();
      if (data && data.id) {
        set({ selectedPatient: data });
      }
    } catch (err) {
      console.warn('Backend profile fetch failed, using local profile', err);
    }
  },

  updatePatientProfile: async (profile) => {
    const current = get().selectedPatient;
    const updated = { ...current, ...profile };
    set({ selectedPatient: updated });

    try {
      await patientApi.updateProfile(current.id, profile);
    } catch (err) {
      console.warn('Patient profile updated locally (offline mode)', err);
    }
  },
}));
