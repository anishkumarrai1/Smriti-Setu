import { Request, Response } from 'express';
import { dataStore } from '../store/dataStore';
import { SyncPendingItem } from '../types';

export const handleSyncBatch = (req: Request, res: Response) => {
  try {
    const body = req.body;
    const items: SyncPendingItem[] = Array.isArray(body)
      ? body
      : Array.isArray(body?.items)
      ? body.items
      : [];

    if (items.length === 0) {
      res.json({
        success: true,
        message: 'No pending sync items provided',
        processedCount: 0,
        errors: [],
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { processedCount, errors } = dataStore.processSyncBatch(items);

    res.json({
      success: errors.length === 0,
      processedCount,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to process sync batch', details: error.message });
  }
};
