import { Router } from 'express';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getTodayReminders,
  acknowledgeReminder,
  getReminderAdherence,
  createReminderAction,
} from '../controllers/reminderController';

const router = Router();

// Specialized action routes (placed before parameter routes)
router.post('/create', createReminderAction);
router.post('/acknowledge', acknowledgeReminder);
router.get('/today/:patientId', getTodayReminders);
router.get('/adherence/:patientId', getReminderAdherence);

// Standard REST routes
// GET /api/reminders?patientId=...
router.get('/', getReminders);

// POST /api/reminders
router.post('/', createReminder);

// PATCH /api/reminders/:id
router.patch('/:id', updateReminder);

// DELETE /api/reminders/:id
router.delete('/:id', deleteReminder);

export default router;

