/**
 * backend/src/modules/voice-connect/voiceMessageRoutes.ts
 * ------------------------------------------------------
 * Backend for Family Voice Connect.
 * Family members upload heartfelt voice notes; patients can tap
 * and listen to audio messages directly on their interface.
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const voiceDir = path.join(__dirname, '../../../uploads/voice_messages');
if (!fs.existsSync(voiceDir)) {
  fs.mkdirSync(voiceDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, voiceDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.wav';
    cb(null, `voice_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

export interface VoiceMessage {
  id: number;
  patientId: string;
  from: string;
  relationship: string;
  durationSec?: number;
  filePath?: string;
  uploadedAt: string;
}

let nextVoiceId = 3;
export const voiceMessages: VoiceMessage[] = [
  {
    id: 1,
    patientId: 'pat-ner-001',
    from: 'Priyanka (Granddaughter)',
    relationship: 'Granddaughter',
    durationSec: 18,
    uploadedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    patientId: 'pat-ner-001',
    from: 'Dr. Debabrata (Son)',
    relationship: 'Son',
    durationSec: 24,
    uploadedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

/**
 * POST /api/voice-messages/upload
 * Accepts multipart/form-data with audio, patientId, from, relationship
 * Also accepts JSON payload for testing without physical microphone
 */
router.post('/upload', upload.single('audio'), (req: Request, res: Response) => {
  const patientId = req.body.patientId || 'pat-ner-001';
  const from = req.body.from || 'Family Member';
  const relationship = req.body.relationship || 'Family';

  const message: VoiceMessage = {
    id: nextVoiceId++,
    patientId,
    from,
    relationship,
    durationSec: 15,
    filePath: req.file ? req.file.path : undefined,
    uploadedAt: new Date().toISOString(),
  };

  voiceMessages.push(message);

  res.status(201).json({
    saved: true,
    messageId: message.id,
    message,
    connectedModule: 'voice-connect',
  });
});

/**
 * GET /api/voice-messages/list/:patientId
 */
router.get('/list/:patientId', (req: Request, res: Response) => {
  const patientId = req.params.patientId as string;
  const messages = voiceMessages.filter((m) => m.patientId === patientId);

  res.json({
    patientId,
    count: messages.length,
    messages,
    connectedModule: 'voice-connect',
  });
});

/**
 * GET /api/voice-messages/play/:messageId
 */
router.get('/play/:messageId', (req: Request, res: Response) => {
  const messageId = req.params.messageId as string;
  const message = voiceMessages.find((m) => m.id === parseInt(messageId, 10));
  if (!message) return res.status(404).json({ error: 'Message not found' });

  if (message.filePath && fs.existsSync(message.filePath)) {
    return res.sendFile(path.resolve(message.filePath));
  }

  // Fallback sound tone or audio header for demo
  res.setHeader('Content-Type', 'audio/wav');
  res.send(Buffer.from('RIFF$    WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'));
});

export default router;
