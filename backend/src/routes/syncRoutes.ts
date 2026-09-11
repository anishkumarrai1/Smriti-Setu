import { Router } from 'express';
import { handleSyncBatch } from '../controllers/syncController';

const router = Router();

// POST /api/sync
router.post('/', handleSyncBatch);

export default router;
