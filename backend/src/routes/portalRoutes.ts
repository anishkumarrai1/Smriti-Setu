import { Router } from 'express';
import {
  getStates,
  getStateByCode,
  getFacilities,
  getServices,
  getPrograms,
  getUpdates,
  getResources,
} from '../controllers/portalController';

const router = Router();

// Government Portal Endpoints
router.get('/portal/states', getStates);
router.get('/portal/states/:code', getStateByCode);
router.get('/portal/facilities', getFacilities);
router.get('/portal/services', getServices);
router.get('/portal/programs', getPrograms);
router.get('/portal/updates', getUpdates);
router.get('/portal/resources', getResources);

// Aliases for direct /api/facilities and /api/states access
router.get('/facilities', getFacilities);
router.get('/states', getStates);

export default router;
