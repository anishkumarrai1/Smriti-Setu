import { Request, Response } from 'express';
import { dataStore } from '../store/dataStore';
import { GameSession } from '../types';

export const submitSessionResult = (req: Request, res: Response) => {
  try {
    const sessionData = req.body as GameSession;
    if (!sessionData || !sessionData.activityType) {
      res.status(400).json({ error: 'Invalid game session data provided' });
      return;
    }

    const { session, difficultyResult } = dataStore.recordSession(sessionData);

    res.json({
      success: true,
      nextDifficulty: difficultyResult.nextDifficulty,
      adjusted: difficultyResult.adjusted,
      reason: difficultyResult.reason,
      session,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record session result', details: error.message });
  }
};

export const getSessionHistory = (req: Request, res: Response) => {
  try {
    const patientId = req.query.patientId as string | undefined;
    const history = dataStore.getSessions(patientId);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve session history', details: error.message });
  }
};

export const getGameQuestions = (req: Request, res: Response) => {
  try {
    const activityType =
      (req.params.activityType as string) || (req.query.activityType as string) || undefined;
    const difficulty = req.query.difficulty as string | undefined;

    const questions = dataStore.getQuestions(activityType, difficulty);
    res.json(questions);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve game questions', details: error.message });
  }
};
