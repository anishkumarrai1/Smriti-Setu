import { Router } from 'express';
import { 
  getAllPatients, 
  createPatient, 
  getPatientDetails, 
  updatePatientDetails 
} from '../controllers/patientController';

const router = Router();

// GET /api/patients - Get all registered patients
router.get('/', getAllPatients);

// POST /api/patients - Register/Add a new patient
router.post('/', createPatient);

// GET /api/patients/:patientId - Get single patient details
router.get('/:patientId', getPatientDetails);

// PATCH /api/patients/:patientId - Update patient profile
router.patch('/:patientId', updatePatientDetails);

export default router;
