/**
 * backend/src/modules/emotion/emotionRoutes.ts
 * ------------------------------------------------------
 * Backend for Emotion Check-In & Emotion-Responsive Comfort Mode.
 * Detects low mood (sad/worried) and provides comforting interventions
 * (lullaby audio, guided breathing, familiar family photo).
 */

import { Router, Request, Response } from 'express';

const router = Router();

export interface MoodEntry {
  patientId: string;
  date: string;
  mood: 'happy' | 'calm' | 'worried' | 'sad';
  notes?: string;
}

export interface ComfortResponse {
  type: 'lullaby' | 'breathing' | 'family_photo';
  audioUrl?: string;
  message: string;
}

// In-memory store initialized with seed logs
export const moodLogs: MoodEntry[] = [
  {
    patientId: 'pat-ner-001',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    mood: 'calm',
  },
  {
    patientId: 'pat-ner-001',
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    mood: 'happy',
  },
];

export const COMFORT_RESPONSES: ComfortResponse[] = [
  {
    type: 'lullaby',
    audioUrl: '/assets/audio/lullaby_assamese.mp3',
    message: "Let's listen to something calming together.",
  },
  {
    type: 'breathing',
    message: "Let's take a slow, gentle breath together.",
  },
  {
    type: 'family_photo',
    message: 'Here is someone who loves you very much.',
  },
];

/**
 * POST /api/emotion/check-in
 * Body: { patientId: string, mood: "happy" | "calm" | "worried" | "sad", notes?: string }
 */
router.post('/check-in', (req: Request, res: Response) => {
  const { patientId, mood, notes } = req.body;
  const validMoods = ['happy', 'calm', 'worried', 'sad'];

  if (!patientId || !validMoods.includes(mood)) {
    return res.status(400).json({ error: 'Invalid mood or missing patientId' });
  }

  const entry: MoodEntry = {
    patientId,
    date: new Date().toISOString(),
    mood,
    notes,
  };

  moodLogs.push(entry);

  const needsComfort = mood === 'sad' || mood === 'worried';
  const response = needsComfort
    ? COMFORT_RESPONSES[Math.floor(Math.random() * COMFORT_RESPONSES.length)]
    : null;

  res.json({
    logged: true,
    entry,
    triggerComfortMode: needsComfort,
    comfortResponse: response,
    connectedModule: 'emotion',
  });
});

/**
 * GET /api/emotion/trend/:patientId?days=7
 * Returns mood trends for Caregiver Dashboard
 */
router.get('/trend/:patientId', (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string, 10) || 7;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const recent = moodLogs.filter(
    (m) => m.patientId === req.params.patientId && new Date(m.date) >= cutoff
  );

  const lowMoodCount = recent.filter(
    (m) => m.mood === 'sad' || m.mood === 'worried'
  ).length;

  res.json({
    patientId: req.params.patientId,
    entries: recent,
    totalCheckIns: recent.length,
    lowMoodCount,
    alert: lowMoodCount >= 2,
    connectedModule: 'emotion',
  });
});

export default router;
