import { Router } from 'express';
import { getActivities, getActivityById } from '../controllers/activityController';

const router = Router();

// GET /api/activities
router.get('/', getActivities);

// GET /api/activities/:id
router.get('/:id', getActivityById);

export default router;
