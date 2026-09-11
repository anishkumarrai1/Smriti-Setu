/**
 * backend/src/modules/memory-match/memoryMatchRoutes.ts
 * ------------------------------------------------------
 * Backend for Memory Match Game.
 * Logs game sessions, accuracy percentages, and history for
 * caregiver clinical tracking and difficulty progression.
 */

import { Router, Request, Response } from 'express';

const router = Router();

export interface MemoryMatchSession {
  patientId: string;
  date: string;
  correct: number;
  total: number;
  gridSize: number;
  accuracy: number;
}

export const memoryMatchSessions: MemoryMatchSession[] = [
  {
    patientId: 'pat-ner-001',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    correct: 6,
    total: 8,
    gridSize: 4,
    accuracy: 75,
  },
  {
    patientId: 'pat-ner-001',
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    correct: 8,
    total: 8,
    gridSize: 4,
    accuracy: 100,
  },
];

/**
 * POST /api/memory-match/log-result
 * Body: { patientId, correct, total, gridSize }
 */
router.post('/log-result', (req: Request, res: Response) => {
  const { patientId, correct, total, gridSize } = req.body;

  if (!patientId || correct == null || total == null) {
    return res.status(400).json({ error: 'Missing required fields: patientId, correct, total' });
  }

  const entry: MemoryMatchSession = {
    patientId,
    date: new Date().toISOString(),
    correct: Number(correct),
    total: Number(total),
    gridSize: Number(gridSize) || 4,
    accuracy: Number(total) > 0 ? Math.round((Number(correct) / Number(total)) * 100) : 0,
  };

  memoryMatchSessions.push(entry);

  res.json({
    saved: true,
    entry,
    connectedModule: 'memory-match',
  });
});

/**
 * GET /api/memory-match/history/:patientId
 * Returns session history for a patient
 */
router.get('/history/:patientId', (req: Request, res: Response) => {
  const history = memoryMatchSessions.filter((s) => s.patientId === req.params.patientId);
  const avgAccuracy =
    history.length > 0
      ? Math.round(history.reduce((acc, curr) => acc + curr.accuracy, 0) / history.length)
      : 0;

  res.json({
    patientId: req.params.patientId,
    sessions: history,
    totalSessions: history.length,
    averageAccuracy: avgAccuracy,
    connectedModule: 'memory-match',
  });
});

export default router;
