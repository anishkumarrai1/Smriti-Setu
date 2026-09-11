import React, { useState, useRef, useCallback } from 'react';
import {
  CheckCircle2,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Volume2,
  Trophy,
  Play,
  Flame,
  Lightbulb,
  Heart,
  PartyPopper,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useHardwareControls } from '../../hooks/useHardwareControls';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useTranslation } from 'react-i18next';

interface SequenceRecallProps {
  onComplete: (accuracy: number, attempts: number, responseTimeMs: number) => void;
  onBack: () => void;
}

interface ColorTile {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  gradient: string;
  glowClass: string;
  ringColor: string;
  borderClass: string;
  freq: number; // Audio chime frequency in Hz
}

const COLOR_TILES: ColorTile[] = [
  {
    id: 'red',
    name: 'Ruby Red',
    subtitle: 'Terracotta & Hibiscus',
    icon: '🌺',
    gradient: 'from-rose-500 via-red-600 to-rose-700',
    glowClass: 'ring-8 ring-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.9)] scale-105 brightness-125',
    ringColor: 'border-rose-300',
    borderClass: 'border-rose-400/50',
    freq: 261.63, // C4
  },
  {
    id: 'green',
    name: 'Emerald Green',
    subtitle: 'Assam Tea Garden',
    icon: '🍃',
    gradient: 'from-emerald-500 via-green-600 to-teal-700',
    glowClass: 'ring-8 ring-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.9)] scale-105 brightness-125',
    ringColor: 'border-emerald-300',
    borderClass: 'border-emerald-400/50',
    freq: 329.63, // E4
  },
  {
    id: 'gold',
    name: 'Assam Gold',
    subtitle: 'Golden Muga Silk',
    icon: '✨',
    gradient: 'from-amber-400 via-amber-500 to-yellow-600',
    glowClass: 'ring-8 ring-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.9)] scale-105 brightness-125',
    ringColor: 'border-amber-300',
    borderClass: 'border-amber-400/50',
    freq: 392.0, // G4
  },
  {
    id: 'blue',
    name: 'Brahmaputra Blue',
    subtitle: 'Sacred River Waters',
    icon: '🌊',
    gradient: 'from-sky-500 via-blue-600 to-indigo-700',
    glowClass: 'ring-8 ring-cyan-300 shadow-[0_0_40px_rgba(14,165,233,0.9)] scale-105 brightness-125',
    ringColor: 'border-sky-300',
    borderClass: 'border-sky-400/50',
    freq: 523.25, // C5
  },
];

// Pre-defined progressive sequence stages
const STAGES = [
  { level: 1, sequence: ['green', 'gold', 'red'], label: 'Gentle (3 Steps)' },
  { level: 2, sequence: ['blue', 'green', 'gold', 'red'], label: 'Standard (4 Steps)' },
  { level: 3, sequence: ['gold', 'red', 'blue', 'green', 'gold'], label: 'Master (5 Steps)' },
];

export const SequenceRecall: React.FC<SequenceRecallProps> = ({ onComplete, onBack }) => {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const currentStage = STAGES[currentStageIdx];
  const sequence = currentStage.sequence;

  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState<boolean>(false);
  const [activeDemonstration, setActiveDemonstration] = useState<string | null>(null);
  const [lastClickedTile, setLastClickedTile] = useState<string | null>(null);
  const [isWrongAttempt, setIsWrongAttempt] = useState<boolean>(false);
  const [wrongMessage, setWrongMessage] = useState<string>('');
  const [cycleCompletedBanner, setCycleCompletedBanner] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play gentle melodic synthesizer note
  const playTone = (freq: number, duration = 0.4, type: OscillatorType = 'sine', gainVal = 0.2) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

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

  // Harmonious, mellow "melting" sound on completing a sequence cycle
  const playMeltedCycleSound = useCallback(() => {
    // Warm soothing chord progression: C4, E4, G4, C5, E5 with gentle decay
    const chord = [
      { freq: 261.63, delay: 0 },
      { freq: 329.63, delay: 120 },
      { freq: 392.0, delay: 240 },
      { freq: 523.25, delay: 380 },
      { freq: 659.25, delay: 520 },
    ];
    chord.forEach((note) => {
      setTimeout(() => playTone(note.freq, 0.6, 'sine', 0.18), note.delay);
    });
  }, []);

  // Play back the sequence pattern
  const handlePlaySequence = () => {
    setIsShowingSequence(true);
    setUserSequence([]);
    setIsWrongAttempt(false);
    setWrongMessage('');
    setLastClickedTile(null);

    sequence.forEach((colorId, idx) => {
      const tile = COLOR_TILES.find((t) => t.id === colorId);

      setTimeout(() => {
        setActiveDemonstration(colorId);
        if (tile) playTone(tile.freq, 0.45);
      }, (idx + 1) * 850);

      setTimeout(() => {
        setActiveDemonstration(null);
        if (idx === sequence.length - 1) {
          setIsShowingSequence(false);
        }
      }, (idx + 1) * 850 + 550);
    });
  };

  // Handle user click on a color button
  const handleColorClick = (colorId: string) => {
    if (isShowingSequence || isFinished || cycleCompletedBanner) return;

    const tile = COLOR_TILES.find((t) => t.id === colorId);
    if (tile) playTone(tile.freq);

    setLastClickedTile(colorId);
    setTimeout(() => {
      setLastClickedTile((prev) => (prev === colorId ? null : prev));
    }, 400);

    const nextUserSeq = [...userSequence, colorId];
    setUserSequence(nextUserSeq);
    setAttempts((a) => a + 1);

    const currentStepIdx = nextUserSeq.length - 1;

    // Validate step
    if (nextUserSeq[currentStepIdx] !== sequence[currentStepIdx]) {
      // Wrong button clicked: Gentle warning
      playTone(220, 0.35, 'sine', 0.15); // soft gentle tone
      setIsWrongAttempt(true);
      setWrongMessage('Gentle reminder: That was a different color. Take a breath and tap Re-watch Pattern to try again! 🌸');

      setTimeout(() => {
        setUserSequence([]);
        setIsWrongAttempt(false);
      }, 1500);
      return;
    }

    // Check if whole cycle sequence is complete
    if (nextUserSeq.length === sequence.length) {
      playMeltedCycleSound();
      setCycleCompletedBanner(true);

      setTimeout(() => {
        setCycleCompletedBanner(false);

        if (currentStageIdx < STAGES.length - 1) {
          // Advance to next stage
          setCurrentStageIdx((prev) => prev + 1);
          setUserSequence([]);
        } else {
          // Complete all cycles
          const elapsed = Date.now() - startTime;
          setIsFinished(true);
          const accuracy = Math.round(
            (sequence.length / Math.max(attempts + 1, sequence.length)) * 100
          );
          onComplete(accuracy, attempts + 1, elapsed);
        }
      }, 2200);
    }
  };

  // Physical ESP32 Hardware & Keyboard Button Controls Integration (Step 8)
  // RED -> 'red', GREEN -> 'green', BLUE -> 'blue', YELLOW -> 'gold'
  useHardwareControls({
    enabled: !isFinished && !isShowingSequence,
    onButtonPress: (button) => {
      if (isShowingSequence || isFinished) return;
      if (button === 'RED') handleColorClick('red');
      else if (button === 'GREEN') handleColorClick('green');
      else if (button === 'BLUE') handleColorClick('blue');
      else if (button === 'YELLOW') handleColorClick('gold');
    },
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Top Header */}
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-md">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl font-bold">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shadow-sm">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
              <span>Sequence Recall</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                {currentStage.label}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Watch the glowing buttons and tap them in the exact same pattern!
            </p>
          </div>
        </div>
      </div>

      {!isFinished && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 relative overflow-hidden">
          {/* Cycle Completion Success Toast / Greeting Banner */}
          {cycleCompletedBanner && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-scaleIn space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce">
                <PartyPopper className="w-8 h-8" />
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-slate-900">
                You have completed this sequence completely! ✨
              </h4>
              <p className="text-slate-600 font-semibold text-sm sm:text-base max-w-md">
                Splendid memory recall! Preparing the next sequence with warmth and care.
              </p>
              <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                Stage {currentStageIdx + 1} of {STAGES.length} Complete
              </span>
            </div>
          )}

          {/* Controls & Status Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlaySequence}
                disabled={isShowingSequence}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isShowingSequence ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Showing Pattern ({sequence.length} steps)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{userSequence.length > 0 ? 'Re-watch Pattern' : 'Start Color Pattern'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setUserSequence([]);
                  setIsWrongAttempt(false);
                  setWrongMessage('');
                }}
                disabled={isShowingSequence || userSequence.length === 0}
                className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all disabled:opacity-40"
                title="Reset current step"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Sequence Progress Dots / Step Badges */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                Progress:
              </span>
              {sequence.map((expectedId, idx) => {
                const isCompleted = userSequence.length > idx && userSequence[idx] === expectedId;
                const isCurrent = userSequence.length === idx;
                const tile = COLOR_TILES.find((t) => t.id === expectedId);

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm'
                        : isCurrent
                        ? 'bg-purple-100 text-purple-800 border-2 border-purple-400 animate-pulse'
                        : 'bg-slate-200/70 text-slate-500 border border-slate-300'
                    }`}
                  >
                    <span>{isCompleted ? '✓' : idx + 1}</span>
                    <span className="hidden sm:inline">
                      {isCompleted ? tile?.name.split(' ')[0] : `Step ${idx + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gentle Warning Message Strip */}
          {isWrongAttempt && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-center font-bold text-xs sm:text-sm animate-bounce flex items-center justify-center gap-2 shadow-sm">
              <span>{wrongMessage || '⚠️ Gentle reminder: That was a different color. Take a breath and tap Re-watch Pattern to try again! 🌸'}</span>
            </div>
          )}

          {/* 4 Interactive Glowing Color Buttons */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-lg mx-auto pt-2">
            {COLOR_TILES.map((c) => {
              const isDemonstrating = activeDemonstration === c.id;
              const isUserClicked = lastClickedTile === c.id;
              const isLit = isDemonstrating || isUserClicked;

              return (
                <button
                  key={c.id}
                  onClick={() => handleColorClick(c.id)}
                  disabled={isShowingSequence}
                  aria-label={c.name}
                  className={`group relative p-6 sm:p-8 rounded-3xl font-extrabold text-white text-left transition-all duration-200 transform border-4 flex flex-col justify-between min-h-[140px] sm:min-h-[170px] select-none shadow-xl active:scale-95 cursor-pointer ${
                    c.borderClass
                  } bg-gradient-to-br ${c.gradient} ${
                    isLit
                      ? `${c.glowClass} z-10`
                      : 'hover:scale-[1.03] hover:shadow-2xl opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Glowing halo indicator */}
                  {isLit && (
                    <div className="absolute inset-0 rounded-3xl bg-white/30 animate-ping pointer-events-none" />
                  )}

                  {/* Top Bar: Icon & Glowing Indicator */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-3xl sm:text-4xl filter drop-shadow-md">{c.icon}</span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        isLit
                          ? 'bg-white border-white shadow-[0_0_12px_#fff] scale-125'
                          : 'bg-white/30 border-white/60'
                      }`}
                    />
                  </div>

                  {/* Bottom Text Labels with Clear Padding */}
                  <div className="pt-3">
                    <p className="text-lg sm:text-xl font-black tracking-tight drop-shadow-sm leading-tight">
                      {c.name}
                    </p>
                    <p className="text-[11px] sm:text-xs font-semibold text-white/80 line-clamp-1 mt-0.5">
                      {c.subtitle}
                    </p>
                  </div>

                  {/* Active Tap Feedback Banner */}
                  {isUserClicked && (
                    <div className="absolute top-2 right-2 bg-white text-slate-900 font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg animate-scaleIn">
                      Tapped! ✨
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-400 font-medium pt-2">
            💡 Each button plays a musical note and glows brightly when pressed.
          </p>
        </div>
      )}

      {/* Completion Screen */}
      {isFinished && (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-400 text-center space-y-6 p-8 sm:p-10 rounded-3xl shadow-2xl animate-scaleIn">
          <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
              Sequence Recalled Perfectly!
            </h3>
            <p className="text-slate-700 font-semibold text-base sm:text-lg max-w-md mx-auto mt-2">
              You accurately memorized and repeated all color light patterns with excellent focus!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setIsFinished(false);
                setCurrentStageIdx(0);
                setUserSequence([]);
                setStartTime(Date.now());
              }}
              className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 transition-all shadow-sm"
            >
              Return to Activities
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceRecall;
