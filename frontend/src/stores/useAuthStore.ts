import { create } from 'zustand';
import { UserRole, PatientProfile } from '../types';
import { patientApi, authApi } from '../services/api';

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  mobileNumber: string;
  mobileVerified: boolean;
  role: 'user' | 'admin';
  assignedRole: UserRole;
  accountStatus: 'active' | 'suspended' | 'pending';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  avatarUrl?: string;
}

interface AuthState {
  role: UserRole; // Persona role: 'patient' | 'caregiver' | 'clinician'
  systemRole: 'user' | 'admin'; // Authorization role: 'user' | 'admin'
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedPatient: PatientProfile;
  patients: PatientProfile[];
  
  setRole: (role: UserRole) => void;
  setSelectedPatient: (patient: PatientProfile) => void;
  updatePatientProfile: (profile: Partial<PatientProfile>) => Promise<void>;
  fetchFreshProfile: () => Promise<void>;
  fetchPatients: () => Promise<PatientProfile[]>;
  addPatient: (patient: Partial<PatientProfile>) => Promise<PatientProfile>;
  
  // Real Authentication Methods
  fetchMe: () => Promise<void>;
  login: (identifier: string, password: string, captchaToken?: string) => Promise<AuthenticatedUser>;
  register: (data: {
    fullName: string;
    email: string;
    emailVerified: boolean;
    mobileNumber: string;
    mobileVerified: boolean;
    password: string;
    assignedRole?: UserRole;
    captchaToken?: string;
  }) => Promise<AuthenticatedUser>;
  logout: () => Promise<void>;
}

// Realistic default initial patients list
export const defaultPatientsList: PatientProfile[] = [
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
    cognitiveProfileNote: 'Moderate memory loss. Benefits from simplified routines and slower audio prompts.',
    elderlyModeEnabled: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
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
    cognitiveProfileNote: 'High engagement in pattern recall and folk music. Retains strong attentional focus.',
    elderlyModeEnabled: false,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
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
    cognitiveProfileNote: 'Mild cognitive impairment. Highly responsive to peaceful morning routine sequencing.',
    elderlyModeEnabled: true,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
  },
];

export const useAuthStore = create<AuthState>((set, get) => ({
  role: 'patient',
  systemRole: 'user',
  user: null,
  isAuthenticated: false,
  isLoading: false,
  selectedPatient: defaultPatientsList[0],
  patients: defaultPatientsList,

  setRole: (role) => set({ role }),

  setSelectedPatient: (patient) => {
    set({ selectedPatient: patient });
  },

  fetchPatients: async () => {
    try {
      const serverPatients = await patientApi.getAllPatients();
      if (serverPatients && serverPatients.length > 0) {
        set({ patients: serverPatients });
        // Keep selectedPatient up to date if it exists
        const currentSelected = get().selectedPatient;
        const matched = serverPatients.find((p) => p.id === currentSelected.id);
        if (matched) {
          set({ selectedPatient: matched });
        }
        return serverPatients;
      }
    } catch (err) {
      // Retain fallback list
    }
    return get().patients;
  },

  addPatient: async (patientData) => {
    try {
      const created = await patientApi.createPatient(patientData);
      set((state) => ({
        patients: [created, ...state.patients.filter((p) => p.id !== created.id)],
        selectedPatient: created,
      }));
      return created;
    } catch (err) {
      // Local fallback creation
      const localCreated: PatientProfile = {
        id: `pat-loc-${Date.now()}`,
        name: patientData.name || 'New Patient',
        age: patientData.age || 70,
        gender: patientData.gender || 'male',
        preferredLanguage: patientData.preferredLanguage || 'as',
        hierarchy: patientData.hierarchy || {
          region: 'North Eastern Region',
          state: 'Assam',
          district: 'Kamrup Metropolitan',
          facilityId: 'fac-ghy-01',
          facilityName: 'Guwahati Regional Cognitive Care Center',
        },
        primaryCaregiverName: patientData.primaryCaregiverName || 'Caregiver',
        primaryCaregiverContact: patientData.primaryCaregiverContact || '+91 98640 12345',
        attendingClinicianName: 'Dr. Devashish Phukan',
        cognitiveProfileNote: patientData.cognitiveProfileNote || 'Newly registered patient.',
        elderlyModeEnabled: true,
        avatarUrl: patientData.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      };
      set((state) => ({
        patients: [localCreated, ...state.patients],
        selectedPatient: localCreated,
      }));
      return localCreated;
    }
  },

  updatePatientProfile: async (updates) => {
    try {
      const current = get().selectedPatient;
      const updated = await patientApi.updateProfile(current.id, updates);
      set((state) => ({
        selectedPatient: updated,
        patients: state.patients.map((p) => (p.id === updated.id ? updated : p)),
        user: state.user ? {
          ...state.user,
          fullName: updated.name || state.user.fullName,
          avatarUrl: updated.avatarUrl || state.user.avatarUrl,
        } : null,
      }));
    } catch (err) {
      const current = get().selectedPatient;
      const merged = { ...current, ...updates };
      set((state) => ({
        selectedPatient: merged,
        patients: state.patients.map((p) => (p.id === merged.id ? merged : p)),
        user: state.user ? {
          ...state.user,
          fullName: merged.name || state.user.fullName,
          avatarUrl: merged.avatarUrl || state.user.avatarUrl,
        } : null,
      }));
    }
  },

  fetchFreshProfile: async () => {
    try {
      const current = get().selectedPatient;
      const fresh = await patientApi.getPatientDetails(current.id);
      set((state) => ({
        selectedPatient: fresh,
        patients: state.patients.map((p) => (p.id === fresh.id ? fresh : p)),
      }));
    } catch (err) {
      // Retain current local state
    }
  },

  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const user = await authApi.getMe();
      if (user) {
        set({
          user,
          isAuthenticated: true,
          systemRole: user.role,
          role: user.assignedRole || 'patient',
          isLoading: false,
        });
        // If user is a patient, select their profile
        if (user.assignedRole === 'patient') {
          const matchedPatient = get().patients.find(
            (p) => p.id === user.id || p.name.toLowerCase() === user.fullName.toLowerCase()
          );
          if (matchedPatient) {
            set({ selectedPatient: matchedPatient });
          } else {
            const patientMatch: PatientProfile = {
              id: user.id,
              name: user.fullName,
              age: 70,
              gender: 'male',
              preferredLanguage: 'as',
              hierarchy: user.hierarchy || {
                region: 'North Eastern Region',
                state: 'Assam',
                district: 'Kamrup Metropolitan',
                facilityId: 'fac-ghy-01',
                facilityName: 'Guwahati Regional Cognitive Care Center',
              },
              primaryCaregiverName: 'Family Caregiver',
              primaryCaregiverContact: user.mobileNumber || '+91 98640 00000',
              attendingClinicianName: 'Dr. Devashish Phukan',
              cognitiveProfileNote: 'Active registered patient session.',
              elderlyModeEnabled: true,
              avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
            };
            set((state) => ({
              selectedPatient: patientMatch,
              patients: [patientMatch, ...state.patients.filter((p) => p.id !== patientMatch.id)],
            }));
          }
        }
      }
    } catch (err) {
      set({ user: null, isAuthenticated: false, systemRole: 'user', isLoading: false });
    }
  },

  login: async (identifier, password, captchaToken) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(identifier, password, captchaToken);
      if (res.token) {
        localStorage.setItem('smriti_auth_token', res.token);
      }
      set({
        user: res.user,
        isAuthenticated: true,
        systemRole: res.user.role,
        role: res.user.assignedRole || 'patient',
        isLoading: false,
      });

      // If registered patient, auto-switch selected patient to this patient's profile
      if (res.user.assignedRole === 'patient') {
        const matchedPatient = get().patients.find(
          (p) => p.id === res.user.id || p.name.toLowerCase() === res.user.fullName.toLowerCase()
        );
        if (matchedPatient) {
          set({ selectedPatient: matchedPatient });
        } else {
          const patientMatch: PatientProfile = {
            id: res.user.id,
            name: res.user.fullName,
            age: 70,
            gender: 'male',
            preferredLanguage: 'as',
            hierarchy: res.user.hierarchy || {
              region: 'North Eastern Region',
              state: 'Assam',
              district: 'Kamrup Metropolitan',
              facilityId: 'fac-ghy-01',
              facilityName: 'Guwahati Regional Cognitive Care Center',
            },
            primaryCaregiverName: 'Family Caregiver',
            primaryCaregiverContact: res.user.mobileNumber || '+91 98640 00000',
            attendingClinicianName: 'Dr. Devashish Phukan',
            cognitiveProfileNote: 'Active registered patient session.',
            elderlyModeEnabled: true,
            avatarUrl: res.user.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
          };
          set((state) => ({
            selectedPatient: patientMatch,
            patients: [patientMatch, ...state.patients.filter((p) => p.id !== patientMatch.id)],
          }));
        }
      }

      return res.user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authApi.register(data);
      if (res.token) {
        localStorage.setItem('smriti_auth_token', res.token);
      }
      set({
        user: res.user,
        isAuthenticated: true,
        systemRole: res.user.role,
        role: res.user.assignedRole || (data.assignedRole as UserRole) || 'patient',
        isLoading: false,
      });

      // If registered as patient, automatically register and add to patient roster
      const newPatientProfile: PatientProfile = {
        id: res.user.id,
        name: res.user.fullName,
        age: 70,
        gender: 'male',
        preferredLanguage: 'as',
        hierarchy: res.user.hierarchy || {
          region: 'North Eastern Region',
          state: 'Assam',
          district: 'Kamrup Metropolitan',
          facilityId: 'fac-ghy-01',
          facilityName: 'Guwahati Regional Cognitive Care Center',
        },
        primaryCaregiverName: 'Family Caregiver',
        primaryCaregiverContact: res.user.mobileNumber || '+91 98640 00000',
        attendingClinicianName: 'Dr. Devashish Phukan',
        cognitiveProfileNote: 'Newly registered patient profile.',
        elderlyModeEnabled: true,
        avatarUrl: res.user.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      };

      set((state) => ({
        selectedPatient: newPatientProfile,
        patients: [newPatientProfile, ...state.patients.filter((p) => p.id !== newPatientProfile.id)],
      }));

      return res.user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    localStorage.removeItem('smriti_auth_token');
    set({
      user: null,
      isAuthenticated: false,
      systemRole: 'user',
      role: 'patient',
    });
  },
}));
