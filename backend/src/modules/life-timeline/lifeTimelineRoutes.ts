/**
 * backend/src/modules/life-timeline/lifeTimelineRoutes.ts
 * ------------------------------------------------------
 * Backend for AI Life Timeline feature.
 * Matches dates to historical life events (marriage, festivals, births),
 * allowing reminders and reminiscence triggers based on real anniversaries.
 */

import { Router, Request, Response } from 'express';

const router = Router();

export interface LifeEvent {
  id: number;
  patientId: string;
  name: string;
  date: string; // YYYY-MM-DD
  category?: string;
  description?: string;
  relatedPhotoIds?: string[];
}

let nextEventId = 3;
export const lifeEvents: LifeEvent[] = [
  {
    id: 1,
    patientId: 'pat-ner-001',
    name: 'Bihu Celebration with Family in Jorhat',
    date: '1984-04-14',
    category: 'Cultural Festival',
    description: 'Bohag Bihu festival gathering with dhol and pitha.',
    relatedPhotoIds: ['photo-bihu-01'],
  },
  {
    id: 2,
    patientId: 'pat-ner-001',
    name: 'Wedding Anniversary',
    date: '1975-02-18',
    category: 'Milestone',
    description: 'Married in Guwahati with blessings from extended family.',
    relatedPhotoIds: ['photo-wedding-01'],
  },
];

/**
 * POST /api/timeline/add-event
 * Body: { patientId, name, date, category?, description?, relatedPhotoIds? }
 */
router.post('/add-event', (req: Request, res: Response) => {
  const { patientId, name, date, category, description, relatedPhotoIds } = req.body;

  if (!patientId || !name || !date) {
    return res.status(400).json({ error: 'Missing required fields: patientId, name, date' });
  }

  const event: LifeEvent = {
    id: nextEventId++,
    patientId,
    name,
    date,
    category: category || 'General',
    description: description || '',
    relatedPhotoIds: relatedPhotoIds || [],
  };

  lifeEvents.push(event);
  res.status(201).json({ saved: true, event, connectedModule: 'life-timeline' });
});

/**
 * GET /api/timeline/today/:patientId?windowDays=7
 * Checks if today falls within windowDays of any stored event (matching month/day yearly)
 */
router.get('/today/:patientId', (req: Request, res: Response) => {
  const windowDays = parseInt(req.query.windowDays as string, 10) || 14;
  const today = new Date();

  const events = lifeEvents.filter((e) => e.patientId === req.params.patientId);

  const matches = events.filter((e) => {
    const eventDate = new Date(e.date);
    const thisYearOccurrence = new Date(
      today.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );
    const diffDays = Math.abs((today.getTime() - thisYearOccurrence.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= windowDays;
  });

  res.json({
    patientId: req.params.patientId,
    hasMatch: matches.length > 0,
    matchingEvents: matches,
    connectedModule: 'life-timeline',
  });
});

/**
 * GET /api/timeline/all/:patientId
 * Returns all timeline events for a patient
 */
router.get('/all/:patientId', (req: Request, res: Response) => {
  const events = lifeEvents
    .filter((e) => e.patientId === req.params.patientId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  res.json({
    patientId: req.params.patientId,
    count: events.length,
    events,
    connectedModule: 'life-timeline',
  });
});

export default router;
