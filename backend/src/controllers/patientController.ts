import { Request, Response } from 'express';
import { dataStore } from '../store/dataStore';
import { authService } from '../services/authService';
import { PatientProfile } from '../types';

export const getAllPatients = (req: Request, res: Response) => {
  try {
    const storePatients = dataStore.getAllPatients();
    const existingIds = new Set(storePatients.map((p) => p.id));
    const existingNames = new Set(storePatients.map((p) => p.name.toLowerCase()));

    // Synchronize registered users with role 'patient'
    const allUsers = authService.getAllUsers();
    const registeredPatients = allUsers.filter((u) => u.assignedRole === 'patient');

    for (const u of registeredPatients) {
      if (!existingIds.has(u.id) && !existingNames.has(u.fullName.toLowerCase())) {
        const newPatientProfile: PatientProfile = {
          id: u.id,
          name: u.fullName,
          age: 70,
          gender: 'male',
          preferredLanguage: 'as',
          hierarchy: (u.hierarchy as any) || {
            region: 'North Eastern Region' as const,
            state: 'Assam',
            district: 'Kamrup Metropolitan',
            facilityId: 'fac-ghy-01',
            facilityName: 'Guwahati Regional Cognitive Care Center',
          },
          primaryCaregiverName: 'Family Caregiver',
          primaryCaregiverContact: u.mobileNumber || '+91 98640 00000',
          attendingClinicianName: 'Dr. Devashish Phukan',
          cognitiveProfileNote: 'Newly registered patient. Cognitive baseline evaluation in progress.',
          elderlyModeEnabled: true,
          avatarUrl: u.avatarUrl || '',
        };
        dataStore.addPatient(newPatientProfile);
        storePatients.push(newPatientProfile);
        existingIds.add(u.id);
        existingNames.add(u.fullName.toLowerCase());
      }
    }

    res.json(storePatients);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve patients list', details: error.message });
  }
};

export const createPatient = (req: Request, res: Response) => {
  try {
    const {
      name,
      age,
      gender,
      preferredLanguage,
      state,
      district,
      primaryCaregiverName,
      primaryCaregiverContact,
      cognitiveProfileNote,
      avatarUrl,
    } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Patient name is required.' });
      return;
    }

    const patientId = `pat-ner-${Date.now().toString().slice(-4)}`;
    const newPatient: PatientProfile = {
      id: patientId,
      name: name.trim(),
      age: Number(age) || 70,
      gender: gender || 'male',
      preferredLanguage: preferredLanguage || 'as',
      hierarchy: {
        region: 'North Eastern Region' as const,
        state: state || 'Assam',
        district: district || 'Kamrup Metropolitan',
        facilityId: 'fac-ghy-01',
        facilityName: `${state || 'Assam'} Regional Cognitive Care Center`,
      },
      primaryCaregiverName: primaryCaregiverName || 'Caregiver',
      primaryCaregiverContact: primaryCaregiverContact || '+91 98640 12345',
      attendingClinicianName: 'Dr. Devashish Phukan',
      cognitiveProfileNote: cognitiveProfileNote || 'Newly registered patient profile.',
      elderlyModeEnabled: true,
      avatarUrl: avatarUrl || '',
    };

    const saved = dataStore.addPatient(newPatient);
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create patient', details: error.message });
  }
};

export const getPatientDetails = (req: Request, res: Response) => {
  try {
    const patientId = req.params.patientId as string;
    const patient = dataStore.getPatientById(patientId);
    if (!patient) {
      res.status(404).json({ error: `Patient with ID '${patientId}' not found` });
      return;
    }
    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve patient details', details: error.message });
  }
};

export const updatePatientDetails = (req: Request, res: Response) => {
  try {
    const patientId = req.params.patientId as string;
    const updates = req.body;
    const updated = dataStore.updatePatient(patientId, updates);
    if (!updated) {
      res.status(404).json({ error: `Patient with ID '${patientId}' not found` });
      return;
    }

    // Synchronize corresponding auth user if exists
    authService.updateUserProfile(patientId, {
      fullName: updated.name,
      avatarUrl: updated.avatarUrl,
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update patient details', details: error.message });
  }
};
