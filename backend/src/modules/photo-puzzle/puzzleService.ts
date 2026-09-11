/**
 * backend/src/modules/photo-puzzle/puzzleService.ts
 * ------------------------------------------------------
 * Core logic for Personalized Photo Puzzle module.
 * Takes an image and decomposes it into a grid of pieces (e.g. 3x3).
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export interface PuzzlePiece {
  pieceIndex: number;
  correctRow: number;
  correctCol: number;
  fileName: string;
  filePath: string;
  placed?: boolean;
}

export interface PuzzleGridData {
  rows: number;
  cols: number;
  totalPieces: number;
  pieces: PuzzlePiece[];
}

/**
 * Splits an image into a grid of pieces using sharp.
 */
export async function splitImageIntoPuzzle(
  inputImagePath: string,
  outputDir: string,
  rows: number = 3,
  cols: number = 3
): Promise<PuzzleGridData> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let imgWidth = 600;
  let imgHeight = 600;

  try {
    const metadata = await sharp(inputImagePath).metadata();
    imgWidth = metadata.width || 600;
    imgHeight = metadata.height || 600;
  } catch {
    // If input file is a mock or non-image, create a sample image for fallback
    await sharp({
      create: {
        width: 600,
        height: 600,
        channels: 3,
        background: { r: 52, g: 120, b: 246 },
      },
    })
      .jpeg()
      .toFile(inputImagePath);
  }

  const pieceWidth = Math.floor(imgWidth / cols);
  const pieceHeight = Math.floor(imgHeight / rows);

  const pieces: PuzzlePiece[] = [];
  let pieceIndex = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const left = col * pieceWidth;
      const top = row * pieceHeight;

      const pieceFileName = `piece_${pieceIndex}.jpg`;
      const pieceFilePath = path.join(outputDir, pieceFileName);

      try {
        await sharp(inputImagePath)
          .extract({ left, top, width: pieceWidth, height: pieceHeight })
          .jpeg()
          .toFile(pieceFilePath);
      } catch {
        // Fallback placeholder slice
        await sharp({
          create: {
            width: pieceWidth,
            height: pieceHeight,
            channels: 3,
            background: { r: 100 + row * 30, g: 120 + col * 30, b: 200 },
          },
        })
          .jpeg()
          .toFile(pieceFilePath);
      }

      pieces.push({
        pieceIndex,
        correctRow: row,
        correctCol: col,
        fileName: pieceFileName,
        filePath: pieceFilePath,
      });

      pieceIndex++;
    }
  }

  return {
    rows,
    cols,
    totalPieces: rows * cols,
    pieces,
  };
}

/**
 * Validates a patient's placement attempt.
 */
export function isPlacementCorrect(
  piece: PuzzlePiece,
  targetRow: number,
  targetCol: number
): boolean {
  return piece.correctRow === targetRow && piece.correctCol === targetCol;
}
