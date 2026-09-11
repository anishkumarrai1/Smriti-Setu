import { Request, Response } from 'express';
import { dataStore } from '../store/dataStore';

export const getProfile = (req: Request, res: Response) => {
  try {
    const profile = dataStore.getActiveProfile();
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve profile', details: error.message });
  }
};
