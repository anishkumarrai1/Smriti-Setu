import { Router } from 'express';
import {
  getAdminUsers,
  getAdminUserById,
  updateUserStatus,
  getAdminLoginActivity,
  getAdminStats,
} from '../controllers/adminController';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Protect ALL admin routes with JWT authentication and strict 'admin' Role Guard
router.use(authenticateJWT);
router.use(requireRole('admin'));

// GET /api/admin/users
router.get('/users', getAdminUsers);

// GET /api/admin/users/:id
router.get('/users/:id', getAdminUserById);

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', updateUserStatus);

// GET /api/admin/login-activity
router.get('/login-activity', getAdminLoginActivity);

// GET /api/admin/stats
router.get('/stats', getAdminStats);

export default router;
