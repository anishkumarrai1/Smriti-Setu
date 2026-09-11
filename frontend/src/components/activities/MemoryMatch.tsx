import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Upload,
  RotateCcw,
  Play,
  Clock,
  Heart,
  Eye,
  Shuffle,
  PartyPopper,
  X,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useLanguageStore } from '../../stores/useLanguageStore';
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

const DEFAULT_CARD_PAIRS: CardPairItem[] = [
  {
    pairId: 'bihu',
    name: 'Rongali Bihu',
    category: 'Festival',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80',
  },
  {
    pairId: 'tea',
    name: 'Tea Garden',
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

export const MemoryMatch: React.FC<MemoryMatchProps> = ({ onComplete, onBack }) => {
  const { currentLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const [cardPairs, setCardPairs] = useState<CardPairItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOM_PAIRS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 6) {
          return parsed.slice(0, 6);
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

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{ name: string; url: string }>>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const countdownTimerRef = useRef<any>(null);
  const timeoutsRef = useRef<number[]>([]);

  // Clear all pending timeouts and intervals cleanly
  const clearAllTimers = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  // Audio synthesize gentle chimes
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

  // Touchable gentle acoustic chime sound on card click / image tap
  const playTouchableCardSound = (pitchOffset = 0) => {
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

      // Primary warm acoustic tone
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

      // Gentle secondary harmonic overtone for touchable tactile feel
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(783.99 + pitchOffset * 1.5, now); // G5
      gain2.gain.setValueAtTime(0.1, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.2);
    } catch {
      // Graceful fallback
    }
  };

  // Card Flip Click Sound
  const playCardFlipSound = () => {
    playTouchableCardSound(30);
  };

  // Success Match Sound
  const playMatchSound = () => {
    playTone(523.25, 0.25, 'sine', 0.15); // C5
    setTimeout(() => playTone(659.25, 0.35, 'sine', 0.18), 100); // E5
  };

  // Harmonious, melted celebration sound upon completing all 12 cards
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

  // Initialize round: double 6 pairs to make 12 cards, show for 5s, then flip one by one from start to end
  const initGameRound = useCallback((pairsToUse: CardPairItem[]) => {
    clearAllTimers();

    // Take 6 pairs
    const pairs = pairsToUse.slice(0, 6);
    const doubled: ActiveMatchCard[] = [];

    pairs.forEach((p, pIdx) => {
      doubled.push({
        uniqueId: pIdx * 2,
        pairId: p.pairId,
        name: p.name,
        imageUrl: p.imageUrl,
        isFlipped: false, // Start face-down for sequential reveal
        isMatched: false,
      });
      doubled.push({
        uniqueId: pIdx * 2 + 1,
        pairId: p.pairId,
        name: p.name,
        imageUrl: p.imageUrl,
        isFlipped: false, // Start face-down for sequential reveal
        isMatched: false,
      });
    });

    // Initial arrangement
    setCards(doubled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setAttempts(0);
    setIsFinished(false);
    setIsMemorizingPhase(true);
    setIsSwapping(false);
    setCountdown(5);

    // 1. Cascade-flip all 12 cards face-UP ONE BY ONE from starting (0) to end (11)
    doubled.forEach((_, idx) => {
      const tFlipUp = window.setTimeout(() => {
        playTone(350 + idx * 30, 0.12, 'sine', 0.1);
        setCards((prev) =>
          prev.map((c, i) => (i === idx ? { ...c, isFlipped: true } : c))
        );
      }, idx * 80);
      timeoutsRef.current.push(tFlipUp);
    });

    // 2. Start the 5-second memorization countdown after all 12 cards are flipped
    const initialDelay = 12 * 80 + 300;
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

          // 3. Cascade-flip all 12 cards face-DOWN ONE BY ONE from starting (0) to end (11) like UNO Flip
          setIsSwapping(true);
          playTone(440, 0.25, 'sine', 0.15);

          for (let i = 0; i < 12; i++) {
            const tFlipDown = window.setTimeout(() => {
              playTone(600 - i * 25, 0.1, 'sine', 0.08); // descending tick
              setCards((prev) =>
                prev.map((c, idx) => (idx === i ? { ...c, isFlipped: false } : c))
              );
            }, i * 75);
            timeoutsRef.current.push(tFlipDown);
          }

          // 4. Once all 12 are flipped face-down, shuffle and enable gameplay
          const tShuffle = window.setTimeout(() => {
            setCards((prev) =>
              [...prev]
                .sort(() => Math.random() - 0.5)
                .map((c) => ({ ...c, isFlipped: false }))
            );
            setIsMemorizingPhase(false);
            setIsSwapping(false);
            setStartTime(Date.now());
          }, 12 * 75 + 400);
          timeoutsRef.current.push(tShuffle);
        }
      }, 1000);
    }, initialDelay);

    timeoutsRef.current.push(tCountdownStart);
  }, [clearAllTimers]);

  useEffect(() => {
    initGameRound(cardPairs);
    return () => {
      clearAllTimers();
    };
  }, [cardPairs, initGameRound, clearAllTimers]);

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

    playCardFlipSound();

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setAttempts((prev) => prev + 1);
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
          setMatchedPairs((prev) => {
            const nextCount = prev + 1;
            if (nextCount === cardPairs.length) {
              const elapsed = Date.now() - startTime;
              const accuracy = Math.max(
                60,
                Math.min(
                  100,
                  Math.round((cardPairs.length / Math.max(attempts + 1, cardPairs.length)) * 100)
                )
              );
              playGrandCelebrationSound();
              setIsFinished(true);
              onComplete(accuracy, attempts + 1, elapsed);
            }
            return nextCount;
          });
        }, 400);
      } else {
        // Not matched: Gentle flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 850);
      }
    }
  };

  // Upload Custom Images (Up to 12 images or 6 pairs)
  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).slice(0, 12);
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
          setUploadedImages((prev) => [...prev, ...newItems].slice(0, 12));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Save Uploaded Images as Active Memory Match Pairs
  const handleApplyCustomImages = () => {
    if (uploadedImages.length < 2) {
      alert('Please upload at least 2 photos (or up to 12 photos) to play custom memory match.');
      return;
    }

    // Build 6 pairs from uploaded photos
    const newPairs: CardPairItem[] = [];
    const source = uploadedImages;

    for (let i = 0; i < 6; i++) {
      const item = source[i % source.length];
      newPairs.push({
        pairId: `custom-pair-${i}-${Date.now()}`,
        name: item.name || `Photo ${i + 1}`,
        category: 'Family Photo',
        imageUrl: item.url,
      });
    }

    setCardPairs(newPairs);
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_PAIRS, JSON.stringify(newPairs));
    } catch {
      // Storage error
    }

    setShowUploadModal(false);
    initGameRound(newPairs);
  };

  // Reset back to Regional defaults
  const handleResetToDefaults = () => {
    localStorage.removeItem(LOCAL_STORAGE_CUSTOM_PAIRS);
    setCardPairs(DEFAULT_CARD_PAIRS);
    setShowUploadModal(false);
    setUploadedImages([]);
    initGameRound(DEFAULT_CARD_PAIRS);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-md">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl font-bold">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
              <span>Visual Memory Match (12 Cards)</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Memorize the 12 photos in 5 seconds, then match each pair!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUploadModal(true)}
            className="rounded-2xl font-bold bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100 flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-4 h-4" /> Upload 12 Images
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => initGameRound(cardPairs)}
            className="rounded-xl font-bold"
            title="Restart round"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isFinished && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl space-y-5 relative overflow-hidden">
          
          {/* Top Status Bar: 5-Second Countdown / Progress Tracker */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {isMemorizingPhase ? (
              <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start animate-pulse">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shadow-md shadow-amber-500/30">
                  {countdown}
                </div>
                <div>
                  <h4 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-600" />
                    <span>Memorize all 12 images: {countdown}s remaining!</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Cards will flip face-down and swap positions in {countdown}s.
                  </p>
                </div>
              </div>
            ) : isSwapping ? (
              <div className="flex items-center gap-2 text-cyan-800 font-black text-sm animate-bounce">
                <Shuffle className="w-5 h-5 animate-spin text-cyan-600" />
                <span>Swapping and shuffling cards now... Get ready!</span>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Matched: {matchedPairs} / {cardPairs.length} Pairs
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-200 text-slate-700">
                  Attempts: {attempts}
                </span>
              </div>
            )}

            {/* Re-start 5s Memorize Button with enhanced padding and vibrant styling */}
            {!isMemorizingPhase && !isSwapping && (
              <button
                onClick={() => {
                  playTouchableCardSound(100);
                  initGameRound(cardPairs);
                }}
                className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 border-2 border-amber-300 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer select-none"
              >
                <Eye className="w-4 h-4 text-white animate-pulse" />
                <span>🔁 Re-start 5s Memorize</span>
              </button>
            )}
          </div>

          {/* 12 Cards Grid (3D UNO Card Flip with Glowing Neon Animation) */}
          <div
            className={`grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto transition-all duration-500 ${
              isSwapping ? 'scale-95 opacity-60 rotate-1' : 'scale-100 opacity-100'
            }`}
          >
            {cards.map((card, idx) => {
              const isRevealed = card.isFlipped || card.isMatched;

              // Glowing Neon Shadow while flipping and when active
              const neonCardGlow = card.isMatched
                ? 'shadow-[0_0_35px_rgba(16,185,129,0.95)] ring-4 ring-emerald-400'
                : card.isFlipped
                ? 'shadow-[0_0_40px_rgba(6,182,212,1)] ring-4 ring-cyan-300 animate-neon-flip-glow scale-[1.03]'
                : 'hover:shadow-[0_0_26px_rgba(6,182,212,0.85)] hover:scale-[1.04]';

              return (
                <div
                  key={card.uniqueId}
                  className="perspective-1000 aspect-square select-none cursor-pointer"
                  onClick={() => handleCardClick(idx)}
                >
                  {/* 3D Flip Inner Container */}
                  <div
                    className={`relative w-full h-full rounded-3xl transform-style-3d transition-transform duration-500 ease-out ${neonCardGlow} ${
                      isRevealed ? 'rotate-y-180' : 'rotate-y-0'
                    }`}
                  >
                    {/* ===== 1. CARD BACK (Face-Down: Sleek UNO Cyber Design) ===== */}
                    <div className="backface-hidden absolute inset-0 w-full h-full rounded-3xl p-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-3 border-slate-700 hover:border-cyan-400 flex flex-col items-center justify-center text-center shadow-lg transition-colors overflow-hidden">
                      {/* Neon Ambient Oval Layer */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_16px_rgba(6,182,212,0.5)] transform -rotate-12">
                        <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-300 animate-pulse" />
                      </div>

                      <div className="pt-2">
                        <span className="font-black text-[10px] sm:text-xs tracking-widest text-cyan-300 uppercase drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">
                          SMRITI
                        </span>
                      </div>

                      {/* Small Corner Decorative Dots */}
                      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-cyan-400/60 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-cyan-400/60 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                    </div>

                    {/* ===== 2. CARD FRONT (Face-Up: Photo with Neon Frame) ===== */}
                    <div className="backface-hidden rotate-y-180 absolute inset-0 w-full h-full rounded-3xl p-1.5 sm:p-2 bg-white border-3 border-cyan-400 flex items-center justify-center shadow-inner overflow-hidden">
                      <div className="w-full h-full relative rounded-2xl overflow-hidden bg-slate-50">
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="w-full h-full object-cover rounded-2xl shadow-xs"
                        />

                        {/* Matched Checkmark Badge */}
                        {card.isMatched && (
                          <div className="absolute top-1 right-1 bg-emerald-500 text-white p-1 rounded-full shadow-lg animate-scaleIn ring-2 ring-white">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-400 font-medium pt-1">
            💡 Tap any two cards to flip them. Neon glowing borders highlight your active choices!
          </p>
        </div>
      )}

      {/* Grand Completion Screen with Heartwarming Greetings */}
      {isFinished && (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-400 text-center space-y-6 p-8 sm:p-12 rounded-3xl shadow-2xl animate-scaleIn max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
            <PartyPopper className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
              Splendid Memory Recall, Ranjit ji! 🌸✨
            </h3>
            <p className="text-slate-700 font-semibold text-base sm:text-lg max-w-md mx-auto mt-2">
              You matched all 12 photo cards with remarkable focus and accuracy!
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center justify-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white border border-emerald-200 shadow-sm text-center">
              <span className="text-[11px] font-bold text-slate-500 block uppercase">Pairs Matched</span>
              <span className="text-xl font-black text-emerald-700">6 / 6</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white border border-emerald-200 shadow-sm text-center">
              <span className="text-[11px] font-bold text-slate-500 block uppercase">Attempts</span>
              <span className="text-xl font-black text-teal-700">{attempts}</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white border border-emerald-200 shadow-sm text-center">
              <span className="text-[11px] font-bold text-slate-500 block uppercase">Accuracy</span>
              <span className="text-xl font-black text-cyan-700">
                {Math.max(60, Math.min(100, Math.round((6 / Math.max(attempts, 6)) * 100)))}%
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => initGameRound(cardPairs)}
              className="px-6 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 transition-all shadow-sm cursor-pointer"
            >
              Return to Activities
            </button>
          </div>
        </div>
      )}

      {/* Upload 12 Custom Images Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-scaleIn my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-900">Upload 12 Memory Photos</h4>
                  <p className="text-xs text-slate-500">
                    Upload family pictures to create personalized match cards
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-left">
              {/* File Upload Box */}
              <label className="block p-6 rounded-2xl border-2 border-dashed border-cyan-300 hover:border-cyan-500 bg-cyan-50/50 hover:bg-cyan-50 text-center cursor-pointer transition-all">
                <Upload className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                <span className="font-black text-sm text-cyan-900 block">
                  Click to select photos (up to 12 images)
                </span>
                <span className="text-xs text-cyan-700 mt-1 block">
                  Supports JPG, PNG, WEBP family pictures
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Uploaded Thumbnails Preview Grid */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-slate-700">
                    <span>Uploaded Photos ({uploadedImages.length}/12):</span>
                    <button
                      onClick={() => setUploadedImages([])}
                      className="text-rose-600 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-xs border border-slate-200 group">
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={handleResetToDefaults}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Reset to Regional Photos
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
                  disabled={uploadedImages.length === 0}
                  className="rounded-xl font-black bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-500/20"
                >
                  Apply & Start Game
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
