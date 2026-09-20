/**
 * World Legends - Deterministic Competitive Scoring Service
 * 
 * Implements the exact scoring formula specified for tournament fairness:
 * WORD SCORE = (BASE + SPEED + MOVES + ACCURACY + STREAK + WORD_DIFF) * LEVEL_MULTIPLIER
 * 
 * - 100% deterministic (no Math.random())
 * - Performance-based (fast thinkers, accurate swipes, streaks rewarded)
 * - Safe from device latency / network differences
 */

export interface WordPerformanceData {
  word: string;
  levelNumber: number;
  wordIndex: number; // 0-based index in current level
  totalWordsInLevel: number;
  thinkingTimeSec: number;
  attemptsCount: number;
  mistakesCount: number;
  currentStreak: number;
  revealedCount: number;
  hasDistractor: boolean;
}

export interface WordScoreBreakdown {
  baseScore: number;
  speedBonus: number;
  moveEfficiencyBonus: number;
  accuracyBonus: number;
  streakBonus: number;
  wordDifficultyBonus: number;
  subtotal: number;
  levelMultiplier: number;
  finalWordScore: number;
}

/**
 * 1. Base Score: 10 points for every correctly completed word
 */
export const BASE_WORD_SCORE = 10;

/**
 * 2. Time / Speed Bonus:
 * - < 4.0s: +10 (Very fast)
 * - 4.0s – 6.99s: +7 (Fast)
 * - 7.0s – 11.99s: +4 (Normal)
 * - 12.0s – 19.99s: +1 (Slow)
 * - >= 20.0s: +0 (Very slow)
 */
export function calculateSpeedBonus(timeSec: number): number {
  if (timeSec < 4.0) return 10;
  if (timeSec < 7.0) return 7;
  if (timeSec < 12.0) return 4;
  if (timeSec < 20.0) return 1;
  return 0;
}

/**
 * 3. Move Efficiency Bonus:
 * - 1 attempt (solved on first swipe): +5
 * - 2 attempts: +3
 * - 3 attempts: +1
 * - 4+ attempts: +0
 */
export function calculateMoveEfficiencyBonus(attempts: number): number {
  if (attempts <= 1) return 5;
  if (attempts === 2) return 3;
  if (attempts === 3) return 1;
  return 0;
}

/**
 * 4. Accuracy Bonus:
 * - 0 mistakes: +5
 * - 1 mistake: +2
 * - 2+ mistakes: +0
 */
export function calculateAccuracyBonus(mistakes: number): number {
  if (mistakes === 0) return 5;
  if (mistakes === 1) return 2;
  return 0;
}

/**
 * 5. Streak Bonus (Consecutive correct words solved in this session/level):
 * - Word 1: +0
 * - Word 2: +2
 * - Word 3: +4
 * - Word 4: +6
 * - Word 5: +8
 * - Word 6+: +10
 */
export function calculateStreakBonus(streak: number): number {
  if (streak <= 1) return 0;
  if (streak === 2) return 2;
  if (streak === 3) return 4;
  if (streak === 4) return 6;
  if (streak === 5) return 8;
  return 10;
}

/**
 * 6. Word Difficulty Bonus:
 * - Word length: 3 letters (+1), 4 letters (+2), 5 letters (+4), 6 letters (+6), 7+ letters (+8)
 * - Scarcity of reveals: <= 1 revealed (+2), 2 revealed (+1), >= 3 revealed (+0)
 * - Distractor letters: +1
 * Total bonus: +2 to +8
 */
export function calculateWordDifficultyBonus(
  wordLength: number,
  revealedCount: number,
  hasDistractor: boolean
): number {
  let lengthPts = 2;
  if (wordLength <= 3) lengthPts = 1;
  else if (wordLength === 4) lengthPts = 2;
  else if (wordLength === 5) lengthPts = 4;
  else if (wordLength === 6) lengthPts = 6;
  else lengthPts = 8;

  let revealPts = 0;
  if (revealedCount <= 1) revealPts = 2;
  else if (revealedCount === 2) revealPts = 1;

  const distractorPts = hasDistractor ? 1 : 0;

  return Math.min(8, lengthPts + revealPts + distractorPts);
}

/**
 * 7. Level Difficulty Multiplier:
 * Level 1: 1.00x
 * Level 2: 1.05x
 * Level 3: 1.10x
 * Level 4: 1.15x
 * Level 5: 1.20x
 * ...
 * Formula: 1.0 + (levelNumber - 1) * 0.05
 */
export function getLevelMultiplier(levelNumber: number): number {
  const mult = 1.0 + (Math.max(1, levelNumber) - 1) * 0.05;
  return Math.round(mult * 100) / 100;
}

/**
 * Main Deterministic Scoring Function
 */
export function calculateWordScore(perf: WordPerformanceData): WordScoreBreakdown {
  const baseScore = BASE_WORD_SCORE;
  const speedBonus = calculateSpeedBonus(perf.thinkingTimeSec);
  const moveEfficiencyBonus = calculateMoveEfficiencyBonus(perf.attemptsCount);
  const accuracyBonus = calculateAccuracyBonus(perf.mistakesCount);
  const streakBonus = calculateStreakBonus(perf.currentStreak);
  const wordDifficultyBonus = calculateWordDifficultyBonus(
    perf.word.length,
    perf.revealedCount,
    perf.hasDistractor
  );

  const subtotal =
    baseScore +
    speedBonus +
    moveEfficiencyBonus +
    accuracyBonus +
    streakBonus +
    wordDifficultyBonus;

  const levelMultiplier = getLevelMultiplier(perf.levelNumber);
  const finalWordScore = Math.round(subtotal * levelMultiplier);

  return {
    baseScore,
    speedBonus,
    moveEfficiencyBonus,
    accuracyBonus,
    streakBonus,
    wordDifficultyBonus,
    subtotal,
    levelMultiplier,
    finalWordScore,
  };
}
