import { Router } from 'express';
import {
  submitSessionResult,
  getSessionHistory,
  getGameQuestions,
} from '../controllers/gameController';

const router = Router();

// POST /api/results
router.post('/results', submitSessionResult);

// GET /api/sessions?patientId=...
router.get('/sessions', getSessionHistory);

// GET /api/questions
router.get('/questions', getGameQuestions);

// GET /api/questions/:activityType
router.get('/questions/:activityType', getGameQuestions);

// GET /api/activities/:activityType/questions
router.get('/activities/:activityType/questions', getGameQuestions);

export default router;
