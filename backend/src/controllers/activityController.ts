import { Request, Response } from 'express';
import { dataStore } from '../store/dataStore';

export const getActivities = (req: Request, res: Response) => {
  try {
    const activities = dataStore.getActivities();
    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve activities', details: error.message });
  }
};

export const getActivityById = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const activity = dataStore.getActivityById(id);
    if (!activity) {
      res.status(404).json({ error: `Activity with ID '${id}' not found` });
      return;
    }
    res.json(activity);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve activity', details: error.message });
  }
};
