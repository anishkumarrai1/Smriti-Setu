import { Router } from 'express';
import { getMemories, createMemory, deleteMemory } from '../controllers/memoryController';

const router = Router();

// GET /api/memories?patientId=...
router.get('/', getMemories);

// POST /api/memories
router.post('/', createMemory);

// DELETE /api/memories/:id
router.delete('/:id', deleteMemory);

export default router;
