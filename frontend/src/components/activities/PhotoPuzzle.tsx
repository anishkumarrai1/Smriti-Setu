import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Lightbulb,
  RotateCcw,
  Check,
  Heart,
  Upload,
  Trophy,
  Clock,
  Sparkles,
  Eye,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useTranslation } from 'react-i18next';

interface PhotoPuzzleProps {
  onComplete: (accuracy: number, attempts: number, responseTimeMs: number) => void;
  onBack: () => void;
}

// Preset memories including the Golden Retriever Puppy from reference
const PRESET_MEMORIES = [
  {
    id: 'puppy',
    title: 'Golden Puppy',
    caption: 'Cute golden retriever enjoying a sunny day outdoors.',
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'family',
    title: 'Family Gathering',
    caption: 'Recognize and remember your loved ones.',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'bihu',
    title: 'Bihu Festival',
    caption: 'Celebrating springtime traditions together with family.',
    url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'tea-garden',
    title: 'Tea Estate Walk',
    caption: 'Peaceful morning stroll in the emerald hills.',
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'majuli',
    title: 'Majuli Sunset',
    caption: 'Golden river reflections of our hometown heritage.',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
  },
];

const COLS = 3;
const ROWS = 3;
const TOTAL_PIECES = COLS * ROWS; // 9 pieces (3x3 grid)

const BOARD_W = 750;
const BOARD_H = 540;
const PIECE_W = BOARD_W / COLS;
const PIECE_H = BOARD_H / ROWS;

interface TabConfig {
  top: number; // 0: flat border, 1: tab outward, -1: hole inward
  right: number;
  bottom: number;
  left: number;
}

// Interlocking Jigsaw Tab Grid definition
const generateJigsawGrid = (): TabConfig[] => {
  // Horizontal seams (between cols): row 0, row 1, row 2
  const horizontalTabs = [
    [1, -1], // row 0: (col 0->1 is tab, col 1->2 is hole)
    [-1, 1], // row 1
    [1, -1], // row 2
  ];

  // Vertical seams (between rows): col 0, col 1, col 2
  const verticalTabs = [
    [1, -1, 1],  // between row 0 and 1
    [-1, 1, -1], // between row 1 and 2
  ];

  const grid: TabConfig[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const top = r === 0 ? 0 : -verticalTabs[r - 1][c];
      const right = c === COLS - 1 ? 0 : horizontalTabs[r][c];
      const bottom = r === ROWS - 1 ? 0 : verticalTabs[r][c];
      const left = c === 0 ? 0 : -horizontalTabs[r][c - 1];
      grid.push({ top, right, bottom, left });
    }
  }
  return grid;
};

// Generate authentic parametric jigsaw edge with narrow neck and rounded bulbous head matching reference
const buildJigsawEdge = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  s: number // 0: flat, 1: tab outward, -1: hole inward
): string => {
  if (s === 0) {
    return `L ${x2.toFixed(2)} ${y2.toFixed(2)} `;
  }

  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.hypot(dx, dy);
  const ux = dx / L;
  const uy = dy / L;
  // Normal vector pointing outward if s=1, inward if s=-1
  const nx = -uy * s;
  const ny = ux * s;

  // Helper point interpolator
  const P = (u: number, v: number): string => {
    const px = x1 + u * L * ux + v * L * nx;
    const py = y1 + u * L * uy + v * L * ny;
    return `${px.toFixed(2)} ${py.toFixed(2)}`;
  };

  // Classic authentic interlocking jigsaw curve
  return (
    `L ${P(0.38, 0)} ` +
    `C ${P(0.38, 0.03)}, ${P(0.36, 0.08)}, ${P(0.35, 0.11)} ` +
    `C ${P(0.33, 0.23)}, ${P(0.42, 0.27)}, ${P(0.50, 0.27)} ` +
    `C ${P(0.58, 0.27)}, ${P(0.67, 0.23)}, ${P(0.65, 0.11)} ` +
    `C ${P(0.64, 0.08)}, ${P(0.62, 0.03)}, ${P(0.62, 0)} ` +
    `L ${P(1.0, 0)} `
  );
};

// Build complete closed jigsaw piece path
const buildPiecePath = (
  x: number,
  y: number,
  w: number,
  h: number,
  tabs: TabConfig
): string => {
  let path = `M ${x.toFixed(2)} ${y.toFixed(2)} `;
  // Top edge: (x, y) -> (x + w, y)
  path += buildJigsawEdge(x, y, x + w, y, tabs.top);
  // Right edge: (x + w, y) -> (x + w, y + h)
  path += buildJigsawEdge(x + w, y, x + w, y + h, tabs.right);
  // Bottom edge: (x + w, y + h) -> (x, y + h)
  path += buildJigsawEdge(x + w, y + h, x, y + h, tabs.bottom);
  // Left edge: (x, y + h) -> (x, y)
  path += buildJigsawEdge(x, y + h, x, y, tabs.left);
  path += 'Z';
  return path;
};

// Helper: Generate thoroughly shuffled board pieces
const getShuffledBoard = (): number[] => {
  const arr = Array.from({ length: TOTAL_PIECES }, (_, i) => i);
  let isShuffled = false;
  while (!isShuffled) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const correctlyPlaced = arr.filter((p, i) => p === i).length;
    if (correctlyPlaced <= 2) {
      isShuffled = true;
    }
  }
  return arr;
};

export const PhotoPuzzle: React.FC<PhotoPuzzleProps> = ({ onComplete, onBack }) => {
  const { elderlyMode } = useAccessibilityStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const hasCompletedRef = useRef(false);

  // Puzzle photo state (defaulting to the cute puppy from reference)
  const [photoUrl, setPhotoUrl] = useState<string>(PRESET_MEMORIES[0].url);
  const [caption, setCaption] = useState<string>(PRESET_MEMORIES[0].caption);
  const [showReference, setShowReference] = useState<boolean>(false);

  // Generate stable interlocking jigsaw tab definitions
  const tabConfigs = useMemo(() => generateJigsawGrid(), []);

  // In-place 9 board pieces (where boardPieces[slotIndex] = pieceIndex)
  const [boardPieces, setBoardPieces] = useState<number[]>(() => getShuffledBoard());

  // Direct Dragging State
  const [dragState, setDragState] = useState<{
    pieceIdx: number;
    fromSlot: number;
    startX: number;
    startY: number;
    curX: number;
    curY: number;
  } | null>(null);

  const [hoverSlot, setHoverSlot] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Gameplay metrics & Timer
  const [moveCount, setMoveCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Pre-calculate SVG paths for all 9 pieces in their canonical positions
  const piecePaths = useMemo(() => {
    return Array.from({ length: TOTAL_PIECES }).map((_, idx) => {
      const r = Math.floor(idx / COLS);
      const c = idx % COLS;
      const x = c * PIECE_W;
      const y = r * PIECE_H;
      return buildPiecePath(x, y, PIECE_W, PIECE_H, tabConfigs[idx]);
    });
  }, [tabConfigs]);

  // Live Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isCompleted) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCompleted, startTime]);

  // Format seconds to mm:ss
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Convert Client pointer coordinates to SVG coordinate system
  const getSvgCoordinates = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = BOARD_W / rect.width;
    const scaleY = BOARD_H / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Sound Engine
  const playSound = (freq = 520, duration = 0.12, type: OscillatorType = 'sine') => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      }
    } catch {
      // Audio fallback
    }
  };

  // Kind-hearted completion chord
  const playKindHeartedMelody = useCallback(() => {
    const melody = [
      { freq: 440.0, delay: 0 },
      { freq: 554.37, delay: 140 },
      { freq: 659.25, delay: 280 },
      { freq: 880.0, delay: 420 },
      { freq: 1108.73, delay: 580 },
    ];
    melody.forEach((note) => {
      setTimeout(() => playSound(note.freq, 0.4, 'sine'), note.delay);
    });
  }, []);

  // Swap / Slide two slots on the board
  const handleSwapSlots = useCallback(
    (slotA: number, slotB: number) => {
      if (slotA === slotB) {
        setSelectedSlot(null);
        return;
      }

      const nextMoveCount = moveCount + 1;
      setMoveCount(nextMoveCount);
      playSound(587.33, 0.15, 'sine');

      const currentPieces = [...boardPieces];
      const temp = currentPieces[slotA];
      currentPieces[slotA] = currentPieces[slotB];
      currentPieces[slotB] = temp;

      const isSolved = currentPieces.every((pieceIdx, idx) => pieceIdx === idx);
      setBoardPieces(currentPieces);

      if (isSolved) {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          playKindHeartedMelody();
          setIsCompleted(true);
          const elapsed = Date.now() - startTime;
          const accuracy = Math.max(
            75,
            Math.min(100, Math.round((TOTAL_PIECES / Math.max(nextMoveCount, TOTAL_PIECES)) * 100))
          );
          onComplete(accuracy, nextMoveCount, elapsed);
        }
      } else {
        if (currentPieces[slotA] === slotA || currentPieces[slotB] === slotB) {
          playSound(783.99, 0.18, 'triangle');
        }
      }

      setSelectedSlot(null);
    },
    [boardPieces, moveCount, onComplete, playKindHeartedMelody, startTime]
  );

  // Direct Pointer Down (Start dragging or selecting)
  const handlePointerDown = (pieceIdx: number, slotIdx: number, e: React.PointerEvent) => {
    if (isCompleted) return;
    
    // Capture pointer at SVG level for 100% reliable tracking
    if (svgRef.current && svgRef.current.setPointerCapture) {
      try {
        svgRef.current.setPointerCapture(e.pointerId);
      } catch {
        // Fallback if not supported
      }
    }

    const coords = getSvgCoordinates(e.clientX, e.clientY);
    setDragState({
      pieceIdx,
      fromSlot: slotIdx,
      startX: coords.x,
      startY: coords.y,
      curX: coords.x,
      curY: coords.y,
    });
    setHoverSlot(slotIdx);
    playSound(493.88, 0.08, 'sine');
  };

  // Pointer Move (Live Drag Tracking)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState) return;

    const coords = getSvgCoordinates(e.clientX, e.clientY);
    setDragState((prev) => (prev ? { ...prev, curX: coords.x, curY: coords.y } : null));

    // Calculate hover target slot
    const targetCol = Math.max(0, Math.min(COLS - 1, Math.floor(coords.x / PIECE_W)));
    const targetRow = Math.max(0, Math.min(ROWS - 1, Math.floor(coords.y / PIECE_H)));
    const currentHovered = targetRow * COLS + targetCol;

    if (currentHovered >= 0 && currentHovered < TOTAL_PIECES) {
      setHoverSlot(currentHovered);
    }
  };

  // Pointer Up (Release & Drop to Slide)
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragState) return;

    if (svgRef.current && svgRef.current.releasePointerCapture) {
      try {
        svgRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // Fallback
      }
    }

    const dist = Math.hypot(
      dragState.curX - dragState.startX,
      dragState.curY - dragState.startY
    );

    // If dragged more than 10px in SVG units, perform drag drop swap
    if (dist > 10 && hoverSlot !== null && hoverSlot !== dragState.fromSlot) {
      handleSwapSlots(dragState.fromSlot, hoverSlot);
    } else if (dist <= 10) {
      // Tap / Click to swap fallback
      if (selectedSlot === null) {
        setSelectedSlot(dragState.fromSlot);
      } else {
        handleSwapSlots(selectedSlot, dragState.fromSlot);
      }
    }

    setDragState(null);
    setHoverSlot(null);
  };

  // Restart Puzzle
  const handleRestart = () => {
    setBoardPieces(getShuffledBoard());
    setSelectedSlot(null);
    setDragState(null);
    setHoverSlot(null);
    setIsCompleted(false);
    hasCompletedRef.current = false;
    setMoveCount(0);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    playSound(440, 0.1);
  };

  // Hint: slide one piece into correct home
  const handleHint = () => {
    if (isCompleted) return;
    const misplacedIndex = boardPieces.findIndex((pieceIdx, idx) => pieceIdx !== idx);
    if (misplacedIndex !== -1) {
      const correctPiece = misplacedIndex;
      const currentHolderIndex = boardPieces.indexOf(correctPiece);
      if (currentHolderIndex !== -1) {
        handleSwapSlots(misplacedIndex, currentHolderIndex);
        setMessage(`Hint: Slid piece #${misplacedIndex + 1} to its correct home! ✨`);
        setTimeout(() => setMessage(''), 2500);
      }
    }
  };

  // Upload custom photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setCaption(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'My Custom Photo');
      handleRestart();
    }
  };

  // Select a preset memory
  const handleSelectPreset = (preset: (typeof PRESET_MEMORIES)[0]) => {
    setPhotoUrl(preset.url);
    setCaption(preset.caption);
    handleRestart();
  };

  // Count correctly placed pieces
  const correctCount = boardPieces.filter((p, i) => p === i).length;

  return (
    <div className="min-h-[85vh] bg-white p-3 sm:p-6 rounded-3xl font-sans text-[#442818] select-none flex flex-col justify-between max-w-5xl mx-auto shadow-xl border border-slate-200">
      {/* ── Top Header ───────────────────────────────────────────── */}
      <div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-2">
          {/* Back & Upload Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#794D2C] hover:bg-[#623D21] text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" /> Back
            </button>

            {/* Prominent Upload Photo Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Upload Photo</span>
            </button>
          </div>

          {/* Title & Subtitle */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#442818]">
              Interlocking Jigsaw Puzzle
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#7D5B48] mt-0.5">
              Drag and drop jigsaw pieces to fit the photo together!
            </p>
          </div>

          {/* Right Area: Reference Preview, Timer & Hint */}
          <div className="flex items-center gap-2.5">
            {/* Toggle Reference Preview */}
            <button
              onClick={() => setShowReference((r) => !r)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm border transition-all cursor-pointer ${
                showReference
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-[#794D2C] border-slate-200 shadow-sm'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showReference ? 'Hide' : 'Preview'}</span>
            </button>

            {/* Live Stopwatch Timer */}
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-[#794D2C] font-black text-xs sm:text-sm shadow-sm">
              <Clock className="w-4 h-4 text-[#794D2C]" />
              <span className="tabular-nums">{formatTime(elapsedSeconds)}</span>
            </div>

            {/* Hint Button */}
            <button
              onClick={handleHint}
              disabled={isCompleted || correctCount === TOTAL_PIECES}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 text-[#794D2C] font-black text-sm border-2 border-[#E5D3C2] shadow-sm transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Hint</span>
            </button>
          </div>
        </div>

        {/* Preset Selector Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 px-2">
          <span className="text-xs font-bold text-[#7D5B48] mr-1 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" /> Photos:
          </span>
          {PRESET_MEMORIES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                photoUrl === preset.url
                  ? 'bg-[#794D2C] text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>

        {/* Progress Pill Bar */}
        <div className="flex items-center justify-center gap-3 mt-2 text-xs font-black">
          <span className="px-4 py-1.5 rounded-full bg-[#F5EBE1] border border-[#E9DACD] text-[#794D2C] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Correct Pieces: {correctCount} / {TOTAL_PIECES}
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700">
            Moves: {moveCount}
          </span>
        </div>

        {/* Feedback message */}
        {message && (
          <div className="text-center mt-2 animate-fadeIn">
            <span className="inline-block px-5 py-1.5 rounded-full font-bold text-xs sm:text-sm bg-amber-50 text-amber-900 border border-amber-200 shadow-sm">
              {message}
            </span>
          </div>
        )}
      </div>

      {/* ── Main Unified Jigsaw Drag & Drop Board ──────────────────── */}
      <div className="my-3 flex flex-col items-center justify-center gap-3">
        {/* Optional Reference Preview */}
        {showReference && (
          <div className="flex items-center gap-3 p-2.5 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm animate-fadeIn max-w-md">
            <img
              src={photoUrl}
              alt="Reference Preview"
              className="w-24 h-16 sm:w-28 sm:h-20 object-cover rounded-xl border border-amber-300 shadow-sm"
            />
            <div className="text-left text-xs text-amber-900">
              <span className="font-extrabold block">{caption}</span>
              <span>Reassemble the authentic jigsaw pieces to match this picture.</span>
            </div>
          </div>
        )}

        {/* Jigsaw Board Frame */}
        <div className="relative p-3.5 sm:p-5 rounded-3xl bg-gradient-to-br from-[#C49B6A] via-[#9B7043] to-[#6E4822] shadow-[0_20px_45px_rgba(75,45,20,0.40)] border-4 border-[#3D2210] max-w-[760px] w-full mx-auto">
          {/* Inner Puzzle Recess */}
          <div className="relative rounded-2xl overflow-hidden shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] border-2 border-[#4A2D14] bg-[#2C180E] aspect-[750/540] touch-none">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-full h-full block select-none cursor-grab active:cursor-grabbing"
            >
              <defs>
                {/* Canonical clipPaths for all 9 authentic interlocking jigsaw pieces */}
                {piecePaths.map((d, idx) => (
                  <clipPath key={`jigsaw_clip_${idx}`} id={`jigsaw_clip_${idx}`}>
                    <path d={d} />
                  </clipPath>
                ))}

                {/* 3D Elevated drop shadow filter for dragging piece */}
                <filter id="jigsawDragShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.75" />
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.85" />
                </filter>

                {/* Subtle 3D piece depth shadow */}
                <filter id="jigsawPieceShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* Recessed wooden puzzle grid sockets in the background */}
              {piecePaths.map((d, idx) => (
                <path
                  key={`socket_${idx}`}
                  d={d}
                  fill="#1F1109"
                  stroke="#3D2210"
                  strokeWidth="2"
                  opacity="0.6"
                />
              ))}

              {/* Slot Hover Highlight Area */}
              {dragState !== null && hoverSlot !== null && hoverSlot !== dragState.fromSlot && (
                <g>
                  <path
                    d={piecePaths[hoverSlot]}
                    fill="rgba(245, 158, 11, 0.28)"
                    stroke="#F59E0B"
                    strokeWidth="3.5"
                    strokeDasharray="8 5"
                    className="animate-pulse"
                  />
                </g>
              )}

              {/* 9 Interactive Interlocking Jigsaw Pieces */}
              {Array.from({ length: TOTAL_PIECES }, (_, pieceIdx) => pieceIdx)
                .sort((a, b) => {
                  // Ensure dragged / selected piece is rendered top-most in SVG DOM
                  if (dragState?.pieceIdx === a) return 1;
                  if (dragState?.pieceIdx === b) return -1;
                  const slotA = boardPieces.indexOf(a);
                  const slotB = boardPieces.indexOf(b);
                  if (slotA === selectedSlot) return 1;
                  if (slotB === selectedSlot) return -1;
                  return 0;
                })
                .map((pieceIdx) => {
                  const slotIdx = boardPieces.indexOf(pieceIdx);

                  // Canonical source coordinates of pieceIdx
                  const origCol = pieceIdx % COLS;
                  const origRow = Math.floor(pieceIdx / COLS);
                  const origX = origCol * PIECE_W;
                  const origY = origRow * PIECE_H;

                  // Target destination slot coordinates
                  const targetCol = slotIdx % COLS;
                  const targetRow = Math.floor(slotIdx / COLS);
                  const targetX = targetCol * PIECE_W;
                  const targetY = targetRow * PIECE_H;

                  const isBeingDragged = dragState?.pieceIdx === pieceIdx;
                  const isSelected = selectedSlot === slotIdx;
                  const isCorrect = pieceIdx === slotIdx;

                  let dx = targetX - origX;
                  let dy = targetY - origY;

                  if (isBeingDragged && dragState) {
                    dx += dragState.curX - dragState.startX;
                    dy += dragState.curY - dragState.startY;
                  }

                  return (
                    <g
                      key={`piece_${pieceIdx}`}
                      onPointerDown={(e) => handlePointerDown(pieceIdx, slotIdx, e)}
                      className="cursor-grab active:cursor-grabbing select-none"
                      style={{
                        transform: `translate3d(${dx}px, ${dy}px, 0px) ${
                          isBeingDragged ? 'scale(1.06)' : isSelected ? 'scale(1.03)' : 'scale(1)'
                        }`,
                        transformOrigin: `${origX + PIECE_W / 2}px ${origY + PIECE_H / 2}px`,
                        transition: isBeingDragged
                          ? 'none'
                          : 'transform 0.42s cubic-bezier(0.34, 1.35, 0.64, 1), filter 0.2s ease',
                      }}
                      filter={
                        isBeingDragged || isSelected
                          ? 'url(#jigsawDragShadow)'
                          : 'url(#jigsawPieceShadow)'
                      }
                    >
                      {/* Photographic Image Layer clipped by authentic jigsaw die-cut path */}
                      <image
                        href={photoUrl}
                        x="0"
                        y="0"
                        width={BOARD_W}
                        height={BOARD_H}
                        preserveAspectRatio="xMidYMid slice"
                        clipPath={`url(#jigsaw_clip_${pieceIdx})`}
                        opacity={isBeingDragged ? 0.96 : isSelected ? 0.92 : 1}
                      />

                      {/* 3D Jigsaw Bevel Highlight Layer (Top-left light reflection) */}
                      <path
                        d={piecePaths[pieceIdx]}
                        fill="none"
                        stroke={
                          isBeingDragged || isSelected
                            ? '#F59E0B'
                            : isCorrect && !isCompleted
                            ? '#10B981'
                            : 'rgba(255, 255, 255, 0.45)'
                        }
                        strokeWidth={isBeingDragged ? '3.5' : isSelected ? '3' : '1.8'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* 3D Jigsaw Shadow Seam (Bottom-right depth contour) */}
                      <path
                        d={piecePaths[pieceIdx]}
                        fill="none"
                        stroke={
                          isBeingDragged || isSelected
                            ? '#D97706'
                            : 'rgba(0, 0, 0, 0.65)'
                        }
                        strokeWidth="1.2"
                        strokeDashoffset="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Correct Placement Badge */}
                      {isCorrect && !isCompleted && !isBeingDragged && (
                        <g transform={`translate(${origX + PIECE_W - 24}, ${origY + 8})`}>
                          <circle cx="8" cy="8" r="8" fill="#10B981" />
                          <path
                            d="M5 8 L7 10 L11 5"
                            fill="none"
                            stroke="#FFFFFF"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </g>
                      )}

                      {/* Selected State Marker */}
                      {isSelected && !isBeingDragged && (
                        <g transform={`translate(${origX + PIECE_W / 2 - 28}, ${origY + PIECE_H / 2 - 10})`}>
                          <rect width="56" height="20" rx="10" fill="#794D2C" />
                          <text
                            x="28"
                            y="14"
                            fill="#FFFFFF"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            Selected
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
            </svg>
          </div>
        </div>
      </div>

      {/* ── Bottom Controls Bar ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-2">
        {/* Restart Button */}
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-[#794D2C] font-black text-sm border-2 border-[#E5D3C2] shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Shuffle / Restart</span>
        </button>

        {/* Center Pill Badge */}
        <div className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#F5EBE1] border border-[#E9DACD] text-[#794D2C] font-bold text-xs sm:text-sm shadow-sm">
          <Heart className="w-4 h-4 text-[#794D2C] fill-[#794D2C]" />
          <span>{caption}</span>
        </div>

        {/* Photo Upload & Solve Check */}
        <div className="flex items-center gap-2">
          {/* Hidden Photo Upload Trigger */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            title="Upload custom family photo"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>

          <button
            onClick={() => {
              if (correctCount === TOTAL_PIECES) {
                playKindHeartedMelody();
                setIsCompleted(true);
              } else {
                setMessage(`Slide the remaining ${TOTAL_PIECES - correctCount} pieces to complete!`);
                setTimeout(() => setMessage(''), 2500);
              }
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-[#794D2C] font-black text-sm border-2 border-[#E5D3C2] shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Check</span>
          </button>
        </div>
      </div>

      {/* ── Completion Celebration Modal ─────────────────────────── */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              className="bg-white p-6 sm:p-8 rounded-3xl max-w-lg w-full text-center space-y-5 border-4 border-[#794D2C] shadow-2xl"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#794D2C] to-[#A06B43] text-white flex items-center justify-center mx-auto shadow-xl animate-bounce">
                <Trophy className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="px-4 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200">
                  ✨ Splendid Work!
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#442818]">
                  Jigsaw Puzzle Completed!
                </h3>
                <p className="text-sm sm:text-base font-semibold text-[#7D5B48] max-w-sm mx-auto">
                  You successfully assembled all 9 interlocking jigsaw pieces in{' '}
                  <span className="font-extrabold text-[#442818] underline">
                    {formatTime(elapsedSeconds)}
                  </span>{' '}
                  with {moveCount} moves!
                </p>
              </div>

              <div className="rounded-2xl overflow-hidden border-3 border-[#794D2C] shadow-md aspect-[800/540]">
                <img
                  src={photoUrl}
                  alt="Completed Jigsaw Photo"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3 rounded-2xl bg-white hover:bg-slate-50 text-[#794D2C] font-black text-sm border-2 border-[#E5D3C2] shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Play Again
                </button>
                <button
                  onClick={onBack}
                  className="flex-1 py-3 rounded-2xl bg-[#794D2C] hover:bg-[#623D21] text-white font-black text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoPuzzle;

