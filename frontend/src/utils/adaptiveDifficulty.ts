import { DifficultyLevel, GameSession } from '../types';

/**
 * Calculates adaptive difficulty adjustment based on patient's historical performance.
 * 
 * Clinical UX Guidelines:
 * - Strong performance (>= 80% accuracy and reasonable response time) -> Increase complexity slightly (e.g. easy -> medium)
 * - Lower performance (< 60% accuracy or high attempts) -> Simplify activity (e.g. challenging -> medium -> easy)
 * - Always emit clear user message: "Activity difficulty adjusted"
 */
export interface AdaptiveDifficultyResult {
  nextDifficulty: DifficultyLevel;
  adjusted: boolean;
  reason?: string;
}

export const calculateNextDifficulty = (
  currentDifficulty: DifficultyLevel,
  recentSessions: GameSession[]
): AdaptiveDifficultyResult => {
  if (!recentSessions || recentSessions.length === 0) {
    return { nextDifficulty: currentDifficulty, adjusted: false };
  }

  // Look at last 3 sessions
  const lastSessions = recentSessions.slice(-3);
  const avgAccuracy = lastSessions.reduce((sum, s) => sum + s.accuracyPercentage, 0) / lastSessions.length;

  if (avgAccuracy >= 85 && currentDifficulty !== 'challenging') {
    const next = currentDifficulty === 'easy' ? 'medium' : 'challenging';
    return {
      nextDifficulty: next,
      adjusted: true,
      reason: 'Consistently high accuracy performance across sessions.',
    };
  }

  if (avgAccuracy < 55 && currentDifficulty !== 'easy') {
    const next = currentDifficulty === 'challenging' ? 'medium' : 'easy';
    return {
      nextDifficulty: next,
      adjusted: true,
      reason: 'Simplified for optimal cognitive comfort and engagement.',
    };
  }

  return { nextDifficulty: currentDifficulty, adjusted: false };
};
