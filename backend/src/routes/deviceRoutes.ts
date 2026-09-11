import { Router } from 'express';
import {
  getDeviceTelemetry,
  getDeviceEvents,
  triggerDeviceAction,
  updateDevice,
  emitTestButtonEvent,
} from '../controllers/deviceController';

const router = Router();

// GET /api/devices/:deviceId
router.get('/devices/:deviceId', getDeviceTelemetry);

// PATCH /api/devices/:deviceId
router.patch('/devices/:deviceId', updateDevice);

// POST /api/devices/:deviceId/actions
router.post('/devices/:deviceId/actions', triggerDeviceAction);

// Dev testing helper: POST /api/devices/emit-test-button
router.post('/devices/emit-test-button', emitTestButtonEvent);

// GET /api/device-events?deviceId=...
router.get('/device-events', getDeviceEvents);

// Also alias GET /api/devices/:deviceId/events
router.get('/devices/:deviceId/events', getDeviceEvents);


export default router;
