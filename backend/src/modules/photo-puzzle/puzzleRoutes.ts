/**
 * backend/src/modules/photo-puzzle/puzzleRoutes.ts
 * ------------------------------------------------------
 * Express routes for Personalized Photo Puzzle module.
 * Slices uploaded photos into interactive puzzle pieces and validates solutions.
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { splitImageIntoPuzzle, isPlacementCorrect, PuzzlePiece } from './puzzleService';

const router = Router();

const uploadsDir = path.join(__dirname, '../../../uploads/puzzle');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `upload_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

export interface ActivePuzzle {
  puzzleId: string;
  patientId: string;
  caption: string;
  rows: number;
  cols: number;
  pieces: PuzzlePiece[];
  placedCount: number;
}

export const activePuzzles: Record<string, ActivePuzzle> = {};

// Pre-populate a demo puzzle so it can be played or tested immediately without upload
const demoPiecesDir = path.join(uploadsDir, 'demo_pieces');
if (!fs.existsSync(demoPiecesDir)) {
  fs.mkdirSync(demoPiecesDir, { recursive: true });
}

activePuzzles['puzzle_demo_01'] = {
  puzzleId: 'puzzle_demo_01',
  patientId: 'pat-ner-001',
  caption: 'Majuli Island River Sunset, Assam',
  rows: 2,
  cols: 2,
  placedCount: 0,
  pieces: [
    { pieceIndex: 0, correctRow: 0, correctCol: 0, fileName: 'piece_0.jpg', filePath: '' },
    { pieceIndex: 1, correctRow: 0, correctCol: 1, fileName: 'piece_1.jpg', filePath: '' },
    { pieceIndex: 2, correctRow: 1, correctCol: 0, fileName: 'piece_2.jpg', filePath: '' },
    { pieceIndex: 3, correctRow: 1, correctCol: 1, fileName: 'piece_3.jpg', filePath: '' },
  ],
};

/**
 * POST /api/puzzle/create
 * Body: multipart/form-data with photo, rows, cols, patientId, caption
 * Also supports JSON body for mock/testing
 */
router.post('/create', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const rows = parseInt(req.body.rows, 10) || 4;
    const cols = parseInt(req.body.cols, 10) || 2;
    const patientId = req.body.patientId || 'pat-ner-001';
    const caption = req.body.caption || 'Family Memory Puzzle';

    const puzzleId = `puzzle_${Date.now()}`;
    const outputDir = path.join(uploadsDir, 'pieces', `${patientId}_${Date.now()}`);

    let imagePath = '';

    if (req.file) {
      imagePath = req.file.path;
    } else if (req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const tempPath = path.join(uploadsDir, `b64_${Date.now()}.jpg`);
      fs.writeFileSync(tempPath, buffer);
      imagePath = tempPath;
    } else {
      imagePath = path.join(uploadsDir, `mock_${Date.now()}.jpg`);
    }

    const puzzleData = await splitImageIntoPuzzle(imagePath, outputDir, rows, cols);

    activePuzzles[puzzleId] = {
      puzzleId,
      patientId,
      caption,
      pieces: puzzleData.pieces,
      rows: puzzleData.rows,
      cols: puzzleData.cols,
      placedCount: 0,
    };

    const pieceUrlsOnly = puzzleData.pieces.map((p) => ({
      pieceIndex: p.pieceIndex,
      imageUrl: `/api/puzzle/piece-image/${puzzleId}/${p.pieceIndex}`,
    }));

    res.status(201).json({
      puzzleId,
      rows: puzzleData.rows,
      cols: puzzleData.cols,
      caption,
      pieces: pieceUrlsOnly,
      connectedModule: 'photo-puzzle',
    });
  } catch (err) {
    console.error('Puzzle creation failed:', err);
    res.status(500).json({ error: 'Failed to create puzzle' });
  }
});

/**
 * GET /api/puzzle/piece-image/:puzzleId/:pieceIndex
 */
router.get('/piece-image/:puzzleId/:pieceIndex', (req: Request, res: Response) => {
  const puzzleId = req.params.puzzleId as string;
  const pieceIndex = req.params.pieceIndex as string;
  const puzzle = activePuzzles[puzzleId];
  if (!puzzle) return res.status(404).json({ error: 'Puzzle not found' });

  const piece = puzzle.pieces.find((p: PuzzlePiece) => p.pieceIndex === parseInt(pieceIndex, 10));
  if (!piece) return res.status(404).json({ error: 'Piece not found' });

  if (piece.filePath && fs.existsSync(piece.filePath)) {
    return res.sendFile(piece.filePath);
  }

  // Fallback 1x1 png pixel or mock payload
  res.setHeader('Content-Type', 'image/jpeg');
  res.send(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]));
});

/**
 * POST /api/puzzle/check
 * Body: { puzzleId, pieceIndex, targetRow, targetCol }
 */
router.post('/check', (req: Request, res: Response) => {
  const { puzzleId, pieceIndex, targetRow, targetCol } = req.body;
  const puzzle = activePuzzles[puzzleId as string];
  if (!puzzle) return res.status(404).json({ error: 'Puzzle not found' });

  const piece = puzzle.pieces.find((p: PuzzlePiece) => p.pieceIndex === Number(pieceIndex));
  if (!piece) return res.status(404).json({ error: 'Piece not found' });

  const correct = isPlacementCorrect(piece, Number(targetRow), Number(targetCol));

  if (correct && !piece.placed) {
    piece.placed = true;
    puzzle.placedCount++;
  }

  const completed = puzzle.placedCount === puzzle.pieces.length;

  res.json({
    correct,
    completed,
    caption: completed ? puzzle.caption : undefined,
    placedCount: puzzle.placedCount,
    totalPieces: puzzle.pieces.length,
    connectedModule: 'photo-puzzle',
  });
});

export default router;
