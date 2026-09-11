import { Router } from 'express';
import { getPatientDetails, updatePatientDetails } from '../controllers/patientController';

const router = Router();

// GET /api/patients/:patientId
router.get('/:patientId', getPatientDetails);

// PATCH /api/patients/:patientId
router.patch('/:patientId', updatePatientDetails);

export default router;
