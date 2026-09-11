import { Router } from 'express';
import { getProfile } from '../controllers/authController';

const router = Router();

// GET /api/auth/profile
router.get('/profile', getProfile);

export default router;
