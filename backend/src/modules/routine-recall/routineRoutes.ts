/**
 * backend/src/modules/routine-recall/routineRoutes.ts
 * ------------------------------------------------------
 * Backend for Daily Routine Recall game.
 * Caregivers log daily routines (meals, walks, tasks); the system
 * constructs targeted multiple-choice memory prompts with decoys.
 */

import { Router, Request, Response } from 'express';

const router = Router();

export interface DailyRoutine {
  patientId: string;
  date: string;
  breakfast?: string;
  lunch?: string;
  medicineTime?: string;
  activity?: string;
}

export const routines: Record<string, DailyRoutine> = {
  'pat-ner-001_today': {
    patientId: 'pat-ner-001',
    date: 'today',
    breakfast: 'Warm Rice Porridge with Ginger',
    lunch: 'Fish Curry with Steamed Joha Rice',
    activity: 'Morning stroll in the tea garden',
  },
};

export const DECOY_POOL: Record<string, string[]> = {
  breakfast: [
    'Bread and butter',
    'Idli and sambar',
    'Poha with peanuts',
    'Warm milk and biscuits',
  ],
  lunch: [
    'Dal and rice with greens',
    'Roti and mixed sabzi',
    'Khichdi with roasted papad',
    'Egg curry with rice',
  ],
  activity: [
    'Gardening on the porch',
    'Listening to regional radio songs',
    'Reading Assam Tribune newspaper',
    'Afternoon nap on the veranda',
  ],
};

/**
 * POST /api/routine/log
 * Body: { patientId, date, breakfast, lunch, activity }
 */
router.post('/log', (req: Request, res: Response) => {
  const { patientId, date, breakfast, lunch, activity } = req.body;
  if (!patientId || !date) {
    return res.status(400).json({ error: 'Missing patientId or date' });
  }

  const key = `${patientId}_${date}`;
  routines[key] = { patientId, date, breakfast, lunch, activity };

  res.json({ saved: true, routine: routines[key], connectedModule: 'routine-recall' });
});

/**
 * GET /api/routine/quiz/:patientId?date=YYYY-MM-DD&category=breakfast
 */
router.get('/quiz/:patientId', (req: Request, res: Response) => {
  const date = (req.query.date as string) || 'today';
  const category = (req.query.category as string) || 'breakfast';
  const key = `${req.params.patientId}_${date}`;

  let routine = routines[key] || routines[`${req.params.patientId}_today`];

  if (!routine || !(routine as any)[category]) {
    // Provide a sensible fallback if today's log hasn't been written yet
    routine = {
      patientId: req.params.patientId as string,
      date,
      breakfast: 'Warm Rice Porridge with Ginger',
      lunch: 'Fish Curry with Steamed Joha Rice',
      activity: 'Morning stroll in the tea garden',
    };
  }

  const correctAnswer = (routine as any)[category];
  const pool = DECOY_POOL[category] || DECOY_POOL['breakfast'];
  const decoys = pool
    .filter((d) => d !== correctAnswer)
    .slice(0, 3);

  const options = [correctAnswer, ...decoys].sort(() => Math.random() - 0.5);

  res.json({
    question: `What did you have or do for ${category} today?`,
    category,
    options,
    correctAnswer,
    connectedModule: 'routine-recall',
  });
});

export default router;
