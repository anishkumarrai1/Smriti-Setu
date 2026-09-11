import { Router } from 'express';
import authRoutes from './authRoutes';
import patientRoutes from './patientRoutes';
import memoryRoutes from './memoryRoutes';
import activityRoutes from './activityRoutes';
import gameRoutes from './gameRoutes';
import deviceRoutes from './deviceRoutes';
import reminderRoutes from './reminderRoutes';
import syncRoutes from './syncRoutes';
import portalRoutes from './portalRoutes';

// Modular feature routes
import dashboardRoutes from '../modules/dashboard/dashboardRoutes';
import translationRoutes from '../modules/translation/translationRoutes';
import emotionRoutes from '../modules/emotion/emotionRoutes';
import lifeTimelineRoutes from '../modules/life-timeline/lifeTimelineRoutes';
import memoryMatchRoutes from '../modules/memory-match/memoryMatchRoutes';
import puzzleRoutes from '../modules/photo-puzzle/puzzleRoutes';
import routineRoutes from '../modules/routine-recall/routineRoutes';
import voiceMessageRoutes from '../modules/voice-connect/voiceMessageRoutes';
import voiceCloneRoutes from '../modules/voice-clone/voiceCloneRoutes';
import systemRoutes from '../modules/system/systemRoutes';
import assistantRoutes from '../modules/assistant/assistantRoutes';

const apiRouter = Router();

// Mount domain routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/memories', memoryRoutes);
apiRouter.use('/activities', activityRoutes);
apiRouter.use('/reminders', reminderRoutes);
apiRouter.use('/sync', syncRoutes);

// Modular feature routes
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/translate', translationRoutes);
apiRouter.use('/emotion', emotionRoutes);
apiRouter.use('/timeline', lifeTimelineRoutes);
apiRouter.use('/memory-match', memoryMatchRoutes);
apiRouter.use('/puzzle', puzzleRoutes);
apiRouter.use('/routine', routineRoutes);
apiRouter.use('/voice-messages', voiceMessageRoutes);
apiRouter.use('/voice-clone', voiceCloneRoutes);
apiRouter.use('/system', systemRoutes);
apiRouter.use('/assistant', assistantRoutes);

// Root level API routes (matching frontend services/api.ts)
apiRouter.use('/', gameRoutes);      // /results, /sessions, /questions
apiRouter.use('/', deviceRoutes);    // /devices/:id, /device-events, /devices/:id/actions
apiRouter.use('/', portalRoutes);    // /portal/*, /facilities, /states

export default apiRouter;

