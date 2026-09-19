import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Upload,
  RotateCcw,
  Clock,
  Eye,
  Shuffle,
  PartyPopper,
  X,
  Plus,
  Image as ImageIcon,
  Bot,
  TrendingUp,
  TrendingDown,
  Award,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useActivityStore } from '../../stores/useActivityStore';
import {
  evaluateMemoryMatchRound,
  AiEvaluationReport,
  PAIR_TIME_BENCHMARKS,
  LEVEL_TO_PAIRS,
  PAIRS_TO_LEVEL,
  PairMatchTelemetry,
} from '../../utils/aiCognitiveEngine';
import { useTranslation } from 'react-i18next';

interface MemoryMatchProps {
  onComplete: (accuracy: number, attempts: number, responseTimeMs: number) => void;
  onBack: () => void;
}

export interface CardPairItem {
  pairId: string;
  name: string;
  imageUrl: string;
  category?: string;
}

export const DEFAULT_CARD_PAIRS: CardPairItem[] = [
  {
    pairId: 'bihu',
    name: 'Rongali Bihu',
    category: 'Festival',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80',
  },
  {
    pairId: 'tea',
    name: 'Assam Tea Garden',
    category: 'Nature',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  },
  {
    pairId: 'rhino',
    name: 'Kaziranga Rhino',
    category: 'Wildlife',
    imageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=600&q=80',
  },
  {
    pairId: 'temple',
    name: 'Kamakhya Temple',
    category: 'Heritage',
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
  },
  {
    pairId: 'gamosa',
    name: 'Assamese Gamosa',
    category: 'Culture',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  },
  {
    pairId: 'peacock',
    name: 'Peacock Sanctuary',
    category: 'Fauna',
    imageUrl: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80',
  },
  {
    pairId: 'majuli',
    name: 'Majuli River Island',
    category: 'Geography',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  },
  {
    pairId: 'silk',
    name: 'Golden Muga Silk',
    category: 'Craft & Heritage',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
  },
  {
    pairId: 'sunset',
    name: 'Brahmaputra Sunset',
    category: 'Landscape',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
  },
  {
    pairId: 'dhol',
    name: 'Bihu Dhol & Pepa',
    category: 'Folk Music',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  },
];

interface ActiveMatchCard {
  id?: number;
  uniqueId: number;
  pairId: string;
  name: string;
  imageUrl: string;
  category?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const LOCAL_STORAGE_CUSTOM_PAIRS = 'smriti_setu_custom_memory_cards';
const LOCAL_STORAGE_MM_LEVEL = 'smriti_setu_memory_match_level';

export const MemoryMatch: React.FC<MemoryMatchProps> = ({ onComplete, onBack }) => {
  const { currentLanguage } = useLanguageStore();
  const { selectedPatient } = useAuthStore();
  const {
    memoryMatchLevel,
    setMemoryMatchLevel,
    latestAiReport,
    setLatestAiReport,
  } = useActivityStore();
  const { t } = useTranslation();

  const patientName = selectedPatient?.name || 'Ranjit ji';

  // Active AI Level (1: 2 pairs, 2: 4 pairs, 3: 6 pairs, 4: 8 pairs)
  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_MM_LEVEL);
      if (saved) {
        const lvl = parseInt(saved, 10);
        if (lvl >= 1 && lvl <= 4) return lvl;
      }
    } catch {}
    return memoryMatchLevel || 1;
  });

  const activePairCount = LEVEL_TO_PAIRS[currentLevel] || 2;

  const [cardPairsPool, setCardPairsPool] = useState<CardPairItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOM_PAIRS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_CARD_PAIRS;
  });

  const [cards, setCards] = useState<ActiveMatchCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isMemorizingPhase, setIsMemorizingPhase] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [isSwapping, setIsSwapping] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedLiveSec, setElapsedLiveSec] = useState(0);

  // AI Evaluation Report
  const [aiReport, setAiReport] = useState<AiEvaluationReport | null>(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{ name: string; url: string }>>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const countdownTimerRef = useRef<any>(null);
  const liveGameTimerRef = useRef<any>(null);
  const timeoutsRef = useRef<number[]>([]);
  const hasCompletedRef = useRef(false);
  const pairTelemetriesRef = useRef<PairMatchTelemetry[]>([]);

  // Clear all pending timeouts and intervals cleanly
  const clearAllTimers = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (liveGameTimerRef.current) {
      clearInterval(liveGameTimerRef.current);
      liveGameTimerRef.current = null;
    }
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  // Audio tone synthesizer for gentle senior-friendly feedback
  const playTone = (freq: number, duration = 0.35, type: OscillatorType = 'sine', gainVal = 0.18) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration + 0.05);
    } catch {
      // Graceful fallback
    }
  };

  // Tactile touch sound on card flip
  const playCardFlipSound = (pitchOffset = 0) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25 + pitchOffset, now); // C5
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);
    } catch {
      // Graceful fallback
    }
  };

  // Success Match Sound
  const playMatchSound = () => {
    playTone(523.25, 0.25, 'sine', 0.15); // C5
    setTimeout(() => playTone(659.25, 0.35, 'sine', 0.18), 100); // E5
  };

  // Grand celebration chord upon completing the level
  const playGrandCelebrationSound = useCallback(() => {
    const chord = [
      { freq: 261.63, delay: 0 },
      { freq: 329.63, delay: 130 },
      { freq: 392.0, delay: 260 },
      { freq: 523.25, delay: 390 },
      { freq: 659.25, delay: 520 },
      { freq: 783.99, delay: 680 },
    ];
    chord.forEach((n) => {
      setTimeout(() => playTone(n.freq, 0.6, 'sine', 0.18), n.delay);
    });
  }, []);

  // Initialize round based on pair count (2, 4, 6, 8 pairs)
  const initGameRound = useCallback(
    (pairsPool: CardPairItem[], targetLevel: number) => {
      clearAllTimers();

      const pairsToCount = LEVEL_TO_PAIRS[targetLevel] || 2;
      const totalCards = pairsToCount * 2;

      // 1. Shuffle available card pairs pool so we get fresh, randomized pictures every game
      const shuffledPool = [...pairsPool].sort(() => Math.random() - 0.5);
      const selectedPairs = shuffledPool.slice(0, pairsToCount);

      // If pool is smaller than required, wrap around
      while (selectedPairs.length < pairsToCount) {
        const item = pairsPool[selectedPairs.length % pairsPool.length];
        selectedPairs.push({
          ...item,
          pairId: `${item.pairId}-dup-${selectedPairs.length}`,
        });
      }

      // 2. Create doubled cards
      const doubled: ActiveMatchCard[] = [];
      selectedPairs.forEach((p, pIdx) => {
        doubled.push({
          uniqueId: pIdx * 2,
          pairId: p.pairId,
          name: p.name,
          imageUrl: p.imageUrl,
          isFlipped: false,
          isMatched: false,
        });
        doubled.push({
          uniqueId: pIdx * 2 + 1,
          pairId: p.pairId,
          name: p.name,
          imageUrl: p.imageUrl,
          isFlipped: false,
          isMatched: false,
        });
      });

      // 3. Reset ALL game state variables completely
      setCards(doubled);
      setFlippedCards([]);
      setMatchedPairs(0);
      setAttempts(0);
      setIsFinished(false);
      setIsMemorizingPhase(true);
      setIsSwapping(false);
      setCountdown(5);
      setElapsedLiveSec(0);
      setAiReport(null);
      hasCompletedRef.current = false;
      pairTelemetriesRef.current = [];

      // 4. Cascade-flip all cards face-UP sequentially
      const flipInterval = Math.max(50, Math.min(100, Math.floor(1000 / totalCards)));
      doubled.forEach((_, idx) => {
        const tFlipUp = window.setTimeout(() => {
          playTone(350 + idx * 25, 0.1, 'sine', 0.08);
          setCards((prev) =>
            prev.map((c, i) => (i === idx ? { ...c, isFlipped: true } : c))
          );
        }, idx * flipInterval);
        timeoutsRef.current.push(tFlipUp);
      });

      // 5. Start the 5-second memorization countdown
      const initialDelay = totalCards * flipInterval + 300;
      const tCountdownStart = window.setTimeout(() => {
        let count = 5;
        setCountdown(5);

        countdownTimerRef.current = window.setInterval(() => {
          count -= 1;
          const clamped = Math.max(0, count);
          setCountdown(clamped);

          if (count <= 0) {
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }

            // 6. Cascade-flip cards face-DOWN sequentially
            setIsSwapping(true);
            playTone(440, 0.25, 'sine', 0.15);

            for (let i = 0; i < totalCards; i++) {
              const tFlipDown = window.setTimeout(() => {
                playTone(600 - i * 20, 0.08, 'sine', 0.06);
                setCards((prev) =>
                  prev.map((c, idx) => (idx === i ? { ...c, isFlipped: false } : c))
                );
              }, i * 65);
              timeoutsRef.current.push(tFlipDown);
            }

            // 7. Shuffle cards thoroughly and enable gameplay
            const tShuffle = window.setTimeout(() => {
              setCards((prev) =>
                [...prev]
                  .sort(() => Math.random() - 0.5)
                  .map((c) => ({ ...c, isFlipped: false }))
              );
              setIsMemorizingPhase(false);
              setIsSwapping(false);
              const now = Date.now();
              setStartTime(now);

              // Start live game clock
              liveGameTimerRef.current = window.setInterval(() => {
                setElapsedLiveSec(Math.round((Date.now() - now) / 1000));
              }, 1000);
            }, totalCards * 65 + 350);
            timeoutsRef.current.push(tShuffle);
          }
        }, 1000);
      }, initialDelay);

      timeoutsRef.current.push(tCountdownStart);
    },
    [clearAllTimers]
  );

  // Dedicated round starter: explicitly updates level, local storage, and initializes game round
  const startNewRound = useCallback(
    (targetLevel: number) => {
      const clampedLevel = Math.max(1, Math.min(4, targetLevel));
      setCurrentLevel(clampedLevel);
      try {
        localStorage.setItem(LOCAL_STORAGE_MM_LEVEL, clampedLevel.toString());
        setMemoryMatchLevel(clampedLevel);
      } catch {}
      initGameRound(cardPairsPool, clampedLevel);
    },
    [cardPairsPool, initGameRound, setMemoryMatchLevel]
  );

  // Initialize once on mount
  useEffect(() => {
    initGameRound(cardPairsPool, currentLevel);
    try {
      localStorage.setItem(LOCAL_STORAGE_MM_LEVEL, currentLevel.toString());
      setMemoryMatchLevel(currentLevel);
    } catch {}

    return () => {
      clearAllTimers();
    };
  }, []); // Run on initial mount

  // Handle Card Click
  const handleCardClick = (index: number) => {
    if (
      isMemorizingPhase ||
      isSwapping ||
      isFinished ||
      flippedCards.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) {
      return;
    }

    playCardFlipSound(index * 15);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
        // Matched!
        playMatchSound();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);

          const nextCount = matchedPairs + 1;
          setMatchedPairs(nextCount);

          // Track telemetry for this matched pair
          pairTelemetriesRef.current.push({
            pairIndex: nextCount,
            pairId: cards[firstIdx].pairId,
            matchedAtMs: Date.now() - startTime,
            attemptsAtMatch: nextAttempts,
          });

          if (nextCount >= activePairCount && !hasCompletedRef.current) {
            hasCompletedRef.current = true;
            if (liveGameTimerRef.current) {
              clearInterval(liveGameTimerRef.current);
              liveGameTimerRef.current = null;
            }

            const elapsed = Math.max(1000, Date.now() - startTime);
            
            // Run Robust AI Cognitive Evaluation (Complete Game, Time, Mismatches, Consistency)
            const evaluation = evaluateMemoryMatchRound(
              activePairCount,
              nextAttempts,
              elapsed,
              true,
              pairTelemetriesRef.current,
              patientName
            );

            setAiReport(evaluation);
            setLatestAiReport(evaluation);

            // Audio celebration
            playGrandCelebrationSound();
            setIsFinished(true);

            // Complete session in store
            onComplete(evaluation.accuracyPercentage, nextAttempts, elapsed);
          }
        }, 400);
      } else {
        // Not matched: Keep visible for 1.4s so senior patient can comfortably register the images
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 1400);
      }
    }
  };

  // Upload Custom Images (Up to 16 images -> 8 pairs)
  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).slice(0, 16);
    const newItems: Array<{ name: string; url: string }> = [];

    let loaded = 0;
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newItems.push({
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          url: event.target?.result as string,
        });
        loaded += 1;
        if (loaded === fileArray.length) {
          setUploadedImages((prev) => [...prev, ...newItems].slice(0, 16));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Apply custom images
  const handleApplyCustomImages = () => {
    if (uploadedImages.length < 2) {
      alert('Please upload at least 2 photos (up to 16 photos) to play custom memory match.');
      return;
    }

    const newPairs: CardPairItem[] = uploadedImages.map((item, i) => ({
      pairId: `custom-pair-${i}-${Date.now()}`,
      name: item.name || `Photo ${i + 1}`,
      category: 'Family Photo',
      imageUrl: item.url,
    }));

    setCardPairsPool(newPairs);
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_PAIRS, JSON.stringify(newPairs));
    } catch {}

    setShowUploadModal(false);
    startNewRound(currentLevel);
  };

  // Reset back to Regional defaults
  const handleResetToDefaults = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_CUSTOM_PAIRS);
    } catch {}
    setCardPairsPool(DEFAULT_CARD_PAIRS);
    setShowUploadModal(false);
    setUploadedImages([]);
    startNewRound(currentLevel);
  };

  // Grid column class based on activePairCount
  const getGridColsClass = () => {
    switch (activePairCount) {
      case 2:
        return 'grid-cols-2 max-w-sm sm:max-w-md gap-4 sm:gap-6'; // 4 cards: 2x2 spacious
      case 4:
        return 'grid-cols-2 sm:grid-cols-4 max-w-2xl gap-3 sm:gap-4'; // 8 cards: 4x2
      case 6:
        return 'grid-cols-3 sm:grid-cols-4 max-w-3xl gap-3 sm:gap-4'; // 12 cards: 4x3
      case 8:
        return 'grid-cols-4 sm:grid-cols-4 max-w-4xl gap-2.5 sm:gap-3.5'; // 16 cards: 4x4
      default:
        return 'grid-cols-2 sm:grid-cols-4 max-w-2xl gap-3 sm:gap-4';
    }
  };

  const benchmark = PAIR_TIME_BENCHMARKS[activePairCount] || { targetSec: 25, maxComfortSec: 60 };

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-fadeIn select-none">
      
      {/* Top Header & AI Status Hub */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl font-bold">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#003366] to-[#00558F] text-white flex items-center justify-center font-bold shadow-md shadow-[#003366]/20">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                  <span>Visual Memory Match</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5" /> AI Adaptive
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                AI dynamically scales from Easy (2 pairs) to Master (8 pairs) based on your speed and accuracy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="rounded-2xl font-bold bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100 flex items-center gap-1.5 shadow-xs"
            >
              <Upload className="w-4 h-4" /> Photos ({cardPairsPool.length})
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => startNewRound(currentLevel)}
              className="rounded-xl font-bold hover:bg-slate-100"
              title="Restart current round"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* AI Cognitive Status Bar (Pure AI-Controlled: No manual level buttons) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#003366] to-[#00558F] text-white text-xs font-black flex items-center gap-1.5 shadow-xs">
              <Bot className="w-4 h-4 text-amber-300" />
              <span>
                AI Level {currentLevel}: {activePairCount} Pairs ({activePairCount * 2} Cards)
              </span>
            </span>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {currentLevel === 1 && '🌱 Starter Pace'}
              {currentLevel === 2 && '⚡ Moderate Recall'}
              {currentLevel === 3 && '🎯 Advanced Focus'}
              {currentLevel === 4 && '🏆 Master Memory'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>AI Auto-Adaptive Progression Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Interface */}
      {!isFinished && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl space-y-5 relative overflow-hidden">
          
          {/* Status Header: Countdown / Live Match Tracker */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {isMemorizingPhase ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                    {countdown}
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-amber-600" />
                      <span>Memorize all {activePairCount * 2} cards: {countdown}s remaining</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Look closely at the pictures and their positions!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCountdown((prev) => prev + 4)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Add 4 more seconds to look at the photos"
                  >
                    <Plus className="w-3.5 h-3.5" /> +4s More Time
                  </button>
                  <button
                    onClick={() => setCountdown(0)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
                  >
                    I'm Ready! ▶
                  </button>
                </div>
              </div>
            ) : isSwapping ? (
              <div className="flex items-center gap-2 text-cyan-800 font-black text-sm animate-bounce">
                <Shuffle className="w-5 h-5 animate-spin text-cyan-600" />
                <span>Shuffling positions now... Get ready to match!</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600">
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Matched: {matchedPairs} / {activePairCount} Pairs
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-200 text-slate-700">
                  Attempts: {attempts}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-cyan-100 text-cyan-800 font-black flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Time: {elapsedLiveSec}s (Target &lt; {benchmark.targetSec}s)
                </span>
              </div>
            )}

            {/* Re-start Memorize Button */}
            {!isMemorizingPhase && !isSwapping && (
              <button
                onClick={() => {
                  playCardFlipSound(80);
                  startNewRound(currentLevel);
                }}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-amber-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-white" />
                <span>🔁 Peek Cards (5s)</span>
              </button>
            )}
          </div>

          {/* Cards Grid */}
          <div
            className={`grid ${getGridColsClass()} mx-auto transition-all duration-500 ${
              isSwapping ? 'scale-95 opacity-60' : 'scale-100 opacity-100'
            }`}
          >
            {cards.map((card, idx) => {
              const isRevealed = card.isFlipped || card.isMatched;

              // Glowing Neon Shadow & visual accessibility feedback
              const neonCardGlow = card.isMatched
                ? 'shadow-[0_0_35px_rgba(16,185,129,0.95)] ring-4 ring-emerald-400 opacity-90'
                : card.isFlipped
                ? 'shadow-[0_0_35px_rgba(6,182,212,1)] ring-4 ring-cyan-300 scale-[1.03]'
                : 'hover:shadow-[0_0_22px_rgba(6,182,212,0.8)] hover:scale-[1.03]';

              return (
                <div
                  key={card.uniqueId}
                  className="perspective-1000 aspect-square select-none cursor-pointer"
                  onClick={() => handleCardClick(idx)}
                >
                  {/* 3D Flip Inner Container */}
                  <div
                    className={`relative w-full h-full rounded-2xl sm:rounded-3xl transform-style-3d transition-transform duration-500 ease-out ${neonCardGlow} ${
                      isRevealed ? 'rotate-y-180' : 'rotate-y-0'
                    }`}
                  >
                    {/* ===== 1. CARD BACK (Face-Down) ===== */}
                    <div
                      className={`backface-hidden absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 sm:border-3 border-slate-700 hover:border-cyan-400 flex flex-col items-center justify-center text-center shadow-lg transition-all overflow-hidden ${
                        isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                      }`}
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_16px_rgba(6,182,212,0.5)] transform -rotate-12">
                        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-300 animate-pulse" />
                      </div>

                      <div className="pt-2">
                        <span className="font-black text-[9px] sm:text-xs tracking-widest text-cyan-300 uppercase drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">
                          SMRITI
                        </span>
                      </div>

                      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-cyan-400/60 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-cyan-400/60 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                    </div>

                    {/* ===== 2. CARD FRONT (Face-Up: Photo with Neon Frame) ===== */}
                    <div
                      className={`backface-hidden rotate-y-180 absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 bg-white border-2 sm:border-3 border-cyan-400 flex items-center justify-center shadow-inner overflow-hidden transition-all ${
                        isRevealed ? 'opacity-100 z-20' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="w-full h-full relative rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          loading="eager"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                          className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                        />

                        {/* Fallback Text Badge if image fails */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-indigo-900 to-slate-900 text-white -z-10">
                          <Sparkles className="w-6 h-6 text-amber-300 mb-1" />
                          <span className="font-bold text-xs">{card.name}</span>
                        </div>

                        {card.isMatched && (
                          <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white p-1 rounded-full shadow-lg ring-2 ring-white z-30">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        )}

                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-1.5 text-left z-20">
                          <p className="text-[10px] sm:text-xs font-bold text-white truncate drop-shadow-sm">
                            {card.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-medium">
            <span>💡 Tap any two cards to reveal and pair them.</span>
            <span className="text-cyan-700 font-bold">
              Level {currentLevel}: {activePairCount} Pairs ({activePairCount * 2} Cards)
            </span>
          </div>
        </div>
      )}

      {/* AI Cognitive Evaluation & Grand Completion Screen */}
      {isFinished && aiReport && (
        <div className="bg-gradient-to-br from-white via-cyan-50/40 to-emerald-50/50 border-2 border-emerald-400 text-left space-y-6 p-6 sm:p-10 rounded-3xl shadow-2xl animate-scaleIn max-w-2xl mx-auto">
          
          {/* Header Badge */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#003366] text-white">
                  Level {aiReport.previousLevel} Complete
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                  {aiReport.speedRating}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                Splendid Memory Recall, {patientName}! 🌸✨
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                You matched all {aiReport.previousPairCount} pairs ({aiReport.previousPairCount * 2} cards) with wonderful focus!
              </p>
            </div>
          </div>

          {/* Performance Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 rounded-2xl bg-white border border-emerald-200 shadow-xs text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Game Completion</span>
              <span className="text-lg sm:text-xl font-black text-emerald-700">
                {aiReport.previousPairCount} / {aiReport.previousPairCount} Pairs
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">100% Matched</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-teal-200 shadow-xs text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Solve Time</span>
              <span className="text-lg sm:text-xl font-black text-teal-700">
                {aiReport.elapsedSeconds}s
              </span>
              <span className="text-[10px] text-teal-600 font-bold block">{aiReport.speedRating}</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-cyan-200 shadow-xs text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Mismatches</span>
              <span className="text-lg sm:text-xl font-black text-cyan-700">
                {aiReport.mismatches}
              </span>
              <span className="text-[10px] text-cyan-600 font-bold block">{attempts} Total Taps</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-amber-200 shadow-xs text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Performance Score</span>
              <span className="text-lg sm:text-xl font-black text-amber-600">
                {aiReport.performanceScore} / 100
              </span>
              <span className="text-[10px] text-amber-600 font-bold block">{aiReport.consistencyRating}</span>
            </div>
          </div>

          {/* AI Cognitive Evaluation Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-3 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-cyan-400/20 text-cyan-300">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <h4 className="font-bold text-sm text-cyan-300 tracking-wide uppercase">
                  AI Cognitive Engine Assessment
                </h4>
              </div>

              {aiReport.direction === 'increased' && (
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-400/40 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Level Up (+2 Pairs)
                </span>
              )}
              {aiReport.direction === 'decreased' && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-400/40 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Comfort Adjustment (-2 Pairs)
                </span>
              )}
              {aiReport.direction === 'maintained' && (
                <span className="px-2.5 py-1 rounded-xl bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-400/40 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Level Maintained
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {aiReport.aiAnalysisNote}
            </p>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-amber-200 font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{aiReport.recommendation}</span>
            </div>
          </div>

          {/* Action Buttons: 100% Functional AI-driven replay & progression */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  const targetLvl = aiReport.nextLevel;
                  startNewRound(targetLvl);
                }}
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>
                  {aiReport.direction === 'increased'
                    ? `Proceed to Level ${aiReport.nextLevel} (${aiReport.nextPairCount} Pairs)`
                    : aiReport.direction === 'decreased'
                    ? `Comfort Level ${aiReport.nextLevel} (${aiReport.nextPairCount} Pairs)`
                    : `Play Level ${aiReport.nextLevel} Again`}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => startNewRound(currentLevel)}
                className="px-4 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-300 transition-all cursor-pointer shadow-xs"
                title="Replay same level with fresh shuffle"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onBack}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all cursor-pointer text-center"
            >
              Return to Activities
            </button>
          </div>
        </div>
      )}

      {/* Upload Custom Images Modal (Up to 16 images -> 8 pairs) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-scaleIn my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#003366] text-white flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-900">Upload Family Memory Photos</h4>
                  <p className="text-xs text-slate-500">
                    Upload up to 16 photos to create custom match pairs across all 4 AI levels
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-left">
              <label className="block p-6 rounded-2xl border-2 border-dashed border-[#003366]/40 hover:border-[#003366] bg-slate-50 hover:bg-cyan-50/30 text-center cursor-pointer transition-all">
                <Upload className="w-8 h-8 text-[#003366] mx-auto mb-2" />
                <span className="font-black text-sm text-[#003366] block">
                  Click to select photos (up to 16 images)
                </span>
                <span className="text-xs text-slate-500 mt-1 block">
                  Supports JPG, PNG, WEBP family photographs
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleImageUpload}
                  className="hidden"
                />
              </label>

              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-slate-700">
                    <span>Uploaded Photos ({uploadedImages.length}/16):</span>
                    <button
                      onClick={() => setUploadedImages([])}
                      className="text-rose-600 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-2xs border border-slate-200 group">
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={handleResetToDefaults}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Reset to Assam Regional Photos
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-xl font-bold"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApplyCustomImages}
                  disabled={uploadedImages.length < 2}
                  className="rounded-xl font-black bg-[#003366] hover:bg-[#002244] text-white shadow-md shadow-[#003366]/20"
                >
                  Apply & Play ({uploadedImages.length} Images)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryMatch;
