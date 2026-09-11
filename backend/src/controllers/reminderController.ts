import { Request, Response } from 'express';
import { dataStore } from '../store/dataStore';

export const getReminders = (req: Request, res: Response) => {
  try {
    const patientId = req.query.patientId as string | undefined;
    const reminders = dataStore.getReminders(patientId);
    res.json(reminders);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve reminders', details: error.message });
  }
};

export const createReminder = (req: Request, res: Response) => {
  try {
    const reminderData = req.body;
    if (!reminderData || !reminderData.title) {
      res.status(400).json({ error: 'Invalid reminder data: title is required' });
      return;
    }
    const created = dataStore.addReminder(reminderData);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create reminder', details: error.message });
  }
};

export const updateReminder = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const updated = dataStore.updateReminder(id, updates);
    if (!updated) {
      res.status(404).json({ error: `Reminder with ID '${id}' not found` });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update reminder', details: error.message });
  }
};

export const deleteReminder = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = dataStore.deleteReminder(id);
    if (!deleted) {
      res.status(404).json({ error: `Reminder with ID '${id}' not found` });
      return;
    }
    res.json({ success: true, message: `Reminder '${id}' deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete reminder', details: error.message });
  }
};

/**
 * GET /api/reminders/today/:patientId
 * Returns pending reminders for today
 */
export const getTodayReminders = (req: Request, res: Response) => {
  try {
    const patientId = req.params.patientId as string;
    const all = dataStore.getReminders(patientId);
    const pending = all.filter((r) => r.state !== 'completed');
    res.json({
      patientId,
      count: pending.length,
      pending,
      connectedModule: 'reminders',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve today reminders', details: error.message });
  }
};

/**
 * POST /api/reminders/acknowledge
 * Body: { reminderId }
 */
export const acknowledgeReminder = (req: Request, res: Response) => {
  try {
    const { reminderId } = req.body;
    if (!reminderId) {
      res.status(400).json({ error: 'Missing reminderId' });
      return;
    }

    const updated = dataStore.updateReminder(reminderId, {
      state: 'completed',
    });

    if (!updated) {
      res.status(404).json({ error: `Reminder '${reminderId}' not found` });
      return;
    }

    res.json({
      acknowledged: true,
      reminder: updated,
      acknowledgedAt: new Date().toISOString(),
      connectedModule: 'reminders',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to acknowledge reminder', details: error.message });
  }
};

/**
 * GET /api/reminders/adherence/:patientId
 * Returns adherence statistics (done vs total)
 */
export const getReminderAdherence = (req: Request, res: Response) => {
  try {
    const patientId = req.params.patientId as string;
    const all = dataStore.getReminders(patientId);
    const done = all.filter((r) => r.state === 'completed').length;
    const total = all.length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;

    res.json({
      patientId,
      done,
      total,
      adherenceRate: rate,
      connectedModule: 'reminders',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve adherence data', details: error.message });
  }
};

/**
 * POST /api/reminders/create
 * Alias for action-based creation (from root module spec)
 */
export const createReminderAction = (req: Request, res: Response) => {
  try {
    const { patientId, text, title, time, type } = req.body;
    const resolvedTitle = title || text || 'Reminder';

    const newReminder = dataStore.addReminder({
      patientId: (patientId as string) || 'pat-ner-001',
      title: resolvedTitle,
      scheduledTime: (time as string) || '10:00 AM',
      type: (type as any) || 'medicine',
      state: 'upcoming',
    });

    res.status(201).json({
      saved: true,
      reminder: newReminder,
      connectedModule: 'reminders',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create reminder', details: error.message });
  }
};


