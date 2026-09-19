import { DifficultyLevel, ActivityType } from '../types';

export interface PairMatchTelemetry {
  pairIndex: number;
  pairId: string;
  matchedAtMs: number;
  attemptsAtMatch: number;
}

export interface MemoryMatchRoundRecord {
  id: string;
  timestamp: string;
  level: number;
  pairCount: number;
  completed: boolean;
  elapsedTimeMs: number;
  attempts: number;
  mismatches: number;
  performanceScore: number;
  pairTelemetries?: PairMatchTelemetry[];
}

export interface AiEvaluationReport {
  previousLevel: number;
  previousPairCount: number;
  nextLevel: number;
  nextPairCount: number;
  direction: 'increased' | 'decreased' | 'maintained';
  completed: boolean;
  performanceScore: number;
  accuracyPercentage: number;
  elapsedSeconds: number;
  targetSeconds: number;
  mismatches: number;
  speedRating: 'Fast & Sharp' | 'Steady & Focused' | 'Needs More Time' | 'Calm Pace';
  consistencyRating: 'Consistent & Confident' | 'Building Momentum' | 'Steady Practice';
  aiAnalysisNote: string;
  recommendation: string;
  rollingScore: number;
}

/**
 * Expected baseline target times (in seconds) for each pair count
 * Designed for senior/dementia cognitive care to ensure empathetic pacing
 */
export const PAIR_TIME_BENCHMARKS: Record<number, { targetSec: number; maxComfortSec: number }> = {
  2: { targetSec: 15, maxComfortSec: 35 },  // 4 cards (Level 1)
  4: { targetSec: 32, maxComfortSec: 65 },  // 8 cards (Level 2)
  6: { targetSec: 55, maxComfortSec: 95 },  // 12 cards (Level 3)
  8: { targetSec: 80, maxComfortSec: 135 }, // 16 cards (Level 4)
};

export const LEVEL_TO_PAIRS: Record<number, number> = {
  1: 2,
  2: 4,
  3: 6,
  4: 8,
};

export const PAIRS_TO_LEVEL: Record<number, number> = {
  2: 1,
  4: 2,
  6: 3,
  8: 4,
};

const LOCAL_STORAGE_MM_HISTORY = 'smriti_setu_mm_rolling_history';

/**
 * Loads recent rolling history from LocalStorage
 */
export function getRollingMemoryMatchHistory(): MemoryMatchRoundRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MM_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(-6);
    }
  } catch {}
  return [];
}

/**
 * Saves completed round to rolling history
 */
export function saveToRollingMemoryMatchHistory(record: MemoryMatchRoundRecord): void {
  try {
    const current = getRollingMemoryMatchHistory();
    const updated = [...current, record].slice(-6);
    localStorage.setItem(LOCAL_STORAGE_MM_HISTORY, JSON.stringify(updated));
  } catch {}
}

/**
 * Evaluates a Flip Card / Memory Match round using multi-factorial cognitive metrics:
 * 1. Full Game Completion (Highest importance - required for level up)
 * 2. Solve Time vs calibrated baseline
 * 3. Absolute mismatch count (fair for lower pair counts)
 * 4. Pair-by-pair pacing
 * 5. Rolling consistency across recent games
 */
export function evaluateMemoryMatchRound(
  currentPairs: number,
  attempts: number,
  elapsedTimeMs: number,
  completed = true,
  pairTelemetries: PairMatchTelemetry[] = [],
  patientName = 'Ranjit ji'
): AiEvaluationReport {
  const currentLevel = PAIRS_TO_LEVEL[currentPairs] || 1;
  const elapsedSeconds = Math.max(1, Math.round(elapsedTimeMs / 1000));
  const mismatches = Math.max(0, attempts - currentPairs);

  // Raw accuracy for display reference
  const rawAccuracy = (currentPairs / Math.max(attempts, currentPairs)) * 100;
  const accuracyPercentage = Math.max(40, Math.min(100, Math.round(rawAccuracy)));

  const benchmark = PAIR_TIME_BENCHMARKS[currentPairs] || { targetSec: 25, maxComfortSec: 60 };
  const targetSeconds = benchmark.targetSec;
  const maxComfortSeconds = benchmark.maxComfortSec;

  // 1. Completion Score (0 or 20)
  const completionScore = completed ? 20 : 0;

  // 2. Mismatch / Precision Score (0 to 40)
  // Evaluated based on level scale rather than fragile %
  let precisionScore = 40;
  if (currentPairs === 2) {
    // Level 1 (2 pairs): 0 mismatches = 40, 1 mismatch = 35, 2 mismatches = 24, >=3 = 10
    if (mismatches === 0) precisionScore = 40;
    else if (mismatches === 1) precisionScore = 35;
    else if (mismatches === 2) precisionScore = 24;
    else precisionScore = Math.max(5, 24 - (mismatches - 2) * 6);
  } else if (currentPairs === 4) {
    // Level 2 (4 pairs): 0-1 mismatches = 40, 2 = 32, 3 = 26, 4 = 18, >=5 = 10
    if (mismatches <= 1) precisionScore = 40;
    else if (mismatches === 2) precisionScore = 32;
    else if (mismatches === 3) precisionScore = 26;
    else if (mismatches === 4) precisionScore = 18;
    else precisionScore = Math.max(5, 18 - (mismatches - 4) * 4);
  } else {
    // Level 3 & 4 (6 or 8 pairs)
    const allowedFreeMismatches = Math.floor(currentPairs / 2);
    if (mismatches <= allowedFreeMismatches) precisionScore = 40;
    else {
      const extra = mismatches - allowedFreeMismatches;
      precisionScore = Math.max(5, 40 - extra * 5);
    }
  }

  // 3. Time Efficiency Score (0 to 40)
  let timeScore = 40;
  if (elapsedSeconds <= targetSeconds) {
    timeScore = 40;
  } else if (elapsedSeconds <= maxComfortSeconds) {
    const ratio = (elapsedSeconds - targetSeconds) / (maxComfortSeconds - targetSeconds);
    timeScore = Math.round(40 - ratio * 20); // 40 down to 20
  } else {
    const overtime = elapsedSeconds - maxComfortSeconds;
    timeScore = Math.max(5, Math.round(20 - (overtime / 20) * 10)); // 20 down to 5
  }

  // Composite Performance Score for current game (0 to 100)
  const performanceScore = Math.min(100, Math.max(10, completionScore + precisionScore + timeScore));

  // 4. Rolling History Analysis
  const rollingHistory = getRollingMemoryMatchHistory();
  const sameLevelHistory = rollingHistory.filter((r) => r.level === currentLevel && r.completed);
  
  const recentScores = [...sameLevelHistory.map((r) => r.performanceScore), performanceScore];
  const rollingScore = Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length);

  // Speed rating
  let speedRating: AiEvaluationReport['speedRating'] = 'Steady & Focused';
  if (elapsedSeconds <= targetSeconds) {
    speedRating = 'Fast & Sharp';
  } else if (elapsedSeconds > maxComfortSeconds) {
    speedRating = 'Needs More Time';
  } else {
    speedRating = 'Steady & Focused';
  }

  // Consistency Rating
  let consistencyRating: AiEvaluationReport['consistencyRating'] = 'Steady Practice';
  if (sameLevelHistory.length >= 2 && rollingScore >= 70) {
    consistencyRating = 'Consistent & Confident';
  } else if (performanceScore >= 65) {
    consistencyRating = 'Building Momentum';
  }

  let nextLevel = currentLevel;
  let direction: AiEvaluationReport['direction'] = 'maintained';
  let aiAnalysisNote = '';
  let recommendation = '';

  // Adaptive Decision Matrix
  // Primary Criterion: Must complete the game!
  if (!completed) {
    // Incomplete game -> Maintain level
    direction = 'maintained';
    aiAnalysisNote = `Incomplete round. Practice matching all ${currentPairs} pairs at your own pace.`;
    recommendation = `The AI cognitive engine is keeping you at Level ${currentLevel} so you can comfortably finish each pair.`;
  } else {
    // Game is Completed
    // Level Up Rule:
    // Performance Score >= 65 (Clean solve with reasonable time and low mismatches)
    // On Level 1 specifically: 0 or 1 mismatch and solve time within comfort window (<= 35s) gives score >= 70 -> advances immediately!
    const qualifiesForLevelUp = performanceScore >= 65 && elapsedSeconds <= maxComfortSeconds && mismatches <= Math.max(1, Math.floor(currentPairs / 2) + 1);

    if (qualifiesForLevelUp && currentLevel < 4) {
      nextLevel = currentLevel + 1;
      direction = 'increased';
      const nextPairs = LEVEL_TO_PAIRS[nextLevel];
      const mismatchDetail = mismatches === 0 ? 'flawless matching' : `${mismatches} mismatch`;
      
      aiAnalysisNote = `🌟 Excellent recall! Completed all ${currentPairs} pairs in ${elapsedSeconds}s with ${mismatchDetail} (Performance Score: ${performanceScore}/100).`;
      recommendation = `The AI cognitive engine is advancing you to Level ${nextLevel} (${nextPairs} Pairs / ${nextPairs * 2} Cards) to stimulate visual retention!`;
    } else if (currentLevel === 4 && qualifiesForLevelUp) {
      // Master level achieved
      direction = 'maintained';
      aiAnalysisNote = `🏆 Outstanding Mastery! Completed Master Level (8 Pairs / 16 Cards) in ${elapsedSeconds}s with strong visual focus!`;
      recommendation = `You have achieved top-tier visual recall performance! Keep up this wonderful mental sharpness.`;
    } else {
      // Check for Level Down Rule:
      // STRICT REQUIREMENT: Only step down after REPEATED poor performance (at least 2 consecutive low-scoring games), NOT a single game!
      const consecutiveLowScores = rollingHistory.slice(-2).filter((r) => r.level === currentLevel && r.performanceScore < 45).length;
      const isRepeatedPoorPerformance = currentLevel > 1 && consecutiveLowScores >= 2 && performanceScore < 45;

      if (isRepeatedPoorPerformance) {
        nextLevel = currentLevel - 1;
        direction = 'decreased';
        const nextPairs = LEVEL_TO_PAIRS[nextLevel];
        aiAnalysisNote = `⏱️ Solved in ${elapsedSeconds}s with ${mismatches} mismatches. The patterns required extra effort.`;
        recommendation = `The AI engine is gently adjusting to Level ${nextLevel} (${nextPairs} Pairs / ${nextPairs * 2} Cards) for optimal cognitive comfort and ease.`;
      } else {
        // One poor/average game results in Level Maintained
        direction = 'maintained';
        const mismatchText = mismatches === 1 ? '1 mismatch' : `${mismatches} mismatches`;
        aiAnalysisNote = `🌱 Good completion! Matched both pairs in ${elapsedSeconds}s with ${mismatchText} (Score: ${performanceScore}/100).`;
        recommendation = `The AI cognitive engine is keeping you at Level ${currentLevel} for additional memory practice to build steady recall speed before advancing.`;
      }
    }
  }

  const nextPairCount = LEVEL_TO_PAIRS[nextLevel] || 2;

  // Record this game round in rolling history
  saveToRollingMemoryMatchHistory({
    id: `round-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: currentLevel,
    pairCount: currentPairs,
    completed,
    elapsedTimeMs,
    attempts,
    mismatches,
    performanceScore,
    pairTelemetries,
  });

  return {
    previousLevel: currentLevel,
    previousPairCount: currentPairs,
    nextLevel,
    nextPairCount,
    direction,
    completed,
    performanceScore,
    accuracyPercentage,
    elapsedSeconds,
    targetSeconds,
    mismatches,
    speedRating,
    consistencyRating,
    aiAnalysisNote,
    recommendation,
    rollingScore,
  };
}

/**
 * Universal AI Cognitive Evaluator for other activities (picture recognition, sequence recall, etc.)
 */
export function evaluateGeneralActivity(
  activityType: ActivityType,
  currentDifficulty: DifficultyLevel,
  accuracy: number,
  responseTimeMs: number
): { nextDifficulty: DifficultyLevel; adjusted: boolean; feedback: string } {
  const avgSec = responseTimeMs / 1000;
  
  if (accuracy >= 80 && avgSec < 15) {
    const next: DifficultyLevel = currentDifficulty === 'easy' ? 'medium' : 'challenging';
    return {
      nextDifficulty: next,
      adjusted: next !== currentDifficulty,
      feedback: `Strong performance detected (${accuracy}% accuracy, ${avgSec.toFixed(1)}s response). AI elevated challenge level.`,
    };
  }

  if (accuracy < 55 || avgSec > 40) {
    const next: DifficultyLevel = currentDifficulty === 'challenging' ? 'medium' : 'easy';
    return {
      nextDifficulty: next,
      adjusted: next !== currentDifficulty,
      feedback: `AI adjusted difficulty to optimal baseline for senior cognitive ease.`,
    };
  }

  return {
    nextDifficulty: currentDifficulty,
    adjusted: false,
    feedback: `Consistent performance maintained at current level.`,
  };
}
