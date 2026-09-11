import { Request, Response } from 'express';
import { dataStore } from '../store/dataStore';

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
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update patient details', details: error.message });
  }
};
