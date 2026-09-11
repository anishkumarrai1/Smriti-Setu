import { Request, Response } from 'express';
import { dataStore } from '../store/dataStore';

export const getMemories = (req: Request, res: Response) => {
  try {
    const patientId = req.query.patientId as string | undefined;
    const category = req.query.category as string | undefined;
    const memories = dataStore.getMemories(patientId, category);
    res.json(memories);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve memories', details: error.message });
  }
};

export const createMemory = (req: Request, res: Response) => {
  try {
    const memoryData = req.body;
    if (!memoryData || typeof memoryData !== 'object') {
      res.status(400).json({ error: 'Invalid memory data provided' });
      return;
    }
    const created = dataStore.addMemory(memoryData);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create memory', details: error.message });
  }
};

export const deleteMemory = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = dataStore.deleteMemory(id);
    if (!deleted) {
      res.status(404).json({ error: `Memory with ID '${id}' not found` });
      return;
    }
    res.json({ success: true, message: `Memory '${id}' deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete memory', details: error.message });
  }
};
