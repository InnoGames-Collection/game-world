/**
 * Pop Piano - Authoritative Deterministic Scoring & Tournament Progression Engine
 * 
 * Rules:
 * 1. BASE TILE SCORE = 1 for every correctly pressed black tile.
 * 2. Multi-factor competitive deterministic scoring:
 *    - Base Score = successful black tiles * 1
 *    - Speed Bonus (based on average reaction time ms)
 *    - Accuracy Bonus (based on hits / total attempts)
 *    - Combo Bonus (scaled by max consecutive combo)
 *    - Streak Bonus (awarded at milestone streaks: 25, 50, 75, 100, 150)
 *    - Precision Bonus (ratio of PERFECT vs GREAT)
 *    - Efficiency Bonus (fewer mistakes / clean execution)
 *    - Difficulty Bonus (actual level tier: Hard +5, up to Master +40)
 *    - Completion Bonus (+15 flat points on successful clear)
 *    - Penalties (-5 per miss / wrong tap)
 * 3. NO RANDOM BONUSES or multipliers.
 * 4. ANTI-FARMING: Only the HIGHEST score achieved on each level counts towards Total Score.
 * 5. CUMULATIVE TOTAL SCORE = sum of best scores across all completed levels.
 * 6. DATA PERSISTENCE in localStorage.
 */

import {
  PopPianoLevelConfig,
  PopPianoProgress,
  PopPianoStats,
  ScoreBreakdown,
  LevelSaveData,
} from './types';

const STORAGE_KEY = 'teleplus_pop_piano_tournament_v1';

export const INITIAL_PROGRESS: PopPianoProgress = {
  highestUnlockedLevel: 1, // Level 1 is unlocked initially; Levels 2-40 locked
  completedLevels: {},
  totalScore: 0,
  stats: {
    gamesPlayed: 0,
    levelsCompleted: 0,
    totalBlackTilesPressed: 0,
    totalMisses: 0,
    totalWrongLanes: 0,
    overallAccuracy: 100,
    bestAccuracy: 0,
    averageReactionTimeMs: 0,
    bestReactionTimeMs: 0,
    bestCombo: 0,
    totalPlayTimeSeconds: 0,
    bestLevelScore: 0,
  },
  achievements: {},
  settings: {
    isAudioMuted: false,
  },
};

/**
 * Loads stored progression safely from localStorage
 */
export function loadPopPianoProgress(): PopPianoProgress {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROGRESS;

    const parsed = JSON.parse(raw);
    const highestUnlocked = Math.max(1, Math.min(40, parsed.highestUnlockedLevel || 1));
    const completedLevels: Record<number, LevelSaveData> = parsed.completedLevels || {};

    // Authoritative recalculation of cumulative total score:
    // Strictly the sum of best score for each completed level
    let authoritativeTotal = 0;
    Object.values(completedLevels).forEach((lvlData) => {
      authoritativeTotal += lvlData.highScore || 0;
    });

    return {
      highestUnlockedLevel: highestUnlocked,
      completedLevels,
      totalScore: authoritativeTotal,
      stats: {
        ...INITIAL_PROGRESS.stats,
        ...(parsed.stats || {}),
      },
      achievements: parsed.achievements || {},
      settings: {
        isAudioMuted: Boolean(parsed.settings?.isAudioMuted),
      },
    };
  } catch (err) {
    console.error('Failed to load Pop Piano progress:', err);
    return INITIAL_PROGRESS;
  }
}

/**
 * Saves progression safely to localStorage
 */
export function savePopPianoProgress(progress: PopPianoProgress): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save Pop Piano progress:', err);
  }
}

/**
 * Deterministic multi-factor score calculation
 */
export function calculateLevelScore(params: {
  levelConfig: PopPianoLevelConfig;
  tilesHit: number;
  perfectHits: number;
  greatHits: number;
  missCount: number;
  wrongLaneCount: number;
  avgReactionMs: number;
  bestReactionMs: number;
  maxCombo: number;
  isCompleted: boolean;
  timeTakenSeconds: number;
  currentProgress: PopPianoProgress;
}): ScoreBreakdown {
  const {
    levelConfig,
    tilesHit,
    perfectHits,
    greatHits,
    missCount,
    wrongLaneCount,
    avgReactionMs,
    bestReactionMs,
    maxCombo,
    isCompleted,
    currentProgress,
  } = params;

  // 1. Mandatory BASE TILE SCORE: exactly 1 pt per successfully pressed black tile
  const baseScore = Math.max(0, tilesHit * 1);

  // 2. Accuracy Calculation
  const totalAttempts = tilesHit + missCount + wrongLaneCount;
  const accuracy = totalAttempts > 0
    ? Math.max(0, Math.min(100, Math.round(((perfectHits * 1.0 + greatHits * 0.8) / totalAttempts) * 100)))
    : 100;

  // 3. Speed Bonus (controlled 0 - 25 pts based on average reaction time ms)
  // Elite reaction: < 190ms -> +25, < 230ms -> +20, < 270ms -> +15, < 320ms -> +10, < 380ms -> +5
  let speedBonus = 0;
  if (tilesHit >= 10 && avgReactionMs > 0) {
    if (avgReactionMs < 190) speedBonus = 25;
    else if (avgReactionMs < 230) speedBonus = 20;
    else if (avgReactionMs < 270) speedBonus = 15;
    else if (avgReactionMs < 320) speedBonus = 10;
    else if (avgReactionMs < 380) speedBonus = 5;
  }

  // 4. Accuracy Bonus (controlled 0 - 25 pts)
  let accuracyBonus = 0;
  if (accuracy >= 99) accuracyBonus = 25;
  else if (accuracy >= 97) accuracyBonus = 20;
  else if (accuracy >= 94) accuracyBonus = 15;
  else if (accuracy >= 90) accuracyBonus = 10;
  else if (accuracy >= 85) accuracyBonus = 5;

  // 5. Combo Bonus (controlled 0 - 25 pts)
  const comboBonus = Math.min(25, Math.floor(maxCombo / 4));

  // 6. Streak Bonus (milestones reached during this run)
  let streakBonus = 0;
  if (maxCombo >= 150) streakBonus = 25;
  else if (maxCombo >= 100) streakBonus = 20;
  else if (maxCombo >= 75) streakBonus = 15;
  else if (maxCombo >= 50) streakBonus = 10;
  else if (maxCombo >= 25) streakBonus = 5;

  // 7. Precision Bonus (ratio of PERFECT vs GREAT, controlled 0 - 25 pts)
  const precisionPercent = tilesHit > 0
    ? Math.round((perfectHits / tilesHit) * 100)
    : 0;
  let precisionBonus = 0;
  if (precisionPercent >= 90) precisionBonus = 25;
  else if (precisionPercent >= 80) precisionBonus = 18;
  else if (precisionPercent >= 70) precisionBonus = 12;
  else if (precisionPercent >= 60) precisionBonus = 6;

  // 8. Efficiency Bonus (rewards clean run with zero/few mistakes, 0 - 15 pts)
  const totalMistakes = missCount + wrongLaneCount;
  let efficiencyBonus = 0;
  if (totalMistakes === 0 && tilesHit >= levelConfig.targetNotes) efficiencyBonus = 15;
  else if (totalMistakes <= 1) efficiencyBonus = 8;
  else if (totalMistakes <= 2) efficiencyBonus = 4;
  const efficiencyPercent = Math.max(0, Math.min(100, Math.round(100 - (totalMistakes * 12))));

  // 9. Difficulty Bonus (tied directly to level 1 to 40, controlled 5 - 40 pts)
  const difficultyBonus = Math.min(40, Math.max(5, Math.round(levelConfig.level * 0.9 + 4)));

  // 10. Completion Bonus (+15 flat points awarded only on successful clear)
  const completionBonus = isCompleted ? 15 : 0;

  // 11. Penalties (-5 per miss or wrong tap)
  const penalties = (missCount * 5) + (wrongLaneCount * 5);

  // Final Level Score (guaranteed non-negative, compact, deterministic)
  const rawScore =
    baseScore +
    speedBonus +
    accuracyBonus +
    comboBonus +
    streakBonus +
    precisionBonus +
    efficiencyBonus +
    difficultyBonus +
    completionBonus -
    penalties;

  const finalScore = Math.max(0, Math.round(rawScore));

  const previousBest = currentProgress.completedLevels[levelConfig.level]?.highScore || 0;
  const isNewBest = isCompleted && finalScore > previousBest;

  // Calculate new cumulative total tournament score
  let newCumulativeTotal = currentProgress.totalScore;
  if (isCompleted) {
    if (previousBest === 0) {
      newCumulativeTotal += finalScore;
    } else if (finalScore > previousBest) {
      newCumulativeTotal += (finalScore - previousBest);
    }
  }

  return {
    levelNumber: levelConfig.level,
    levelName: levelConfig.name,
    tier: levelConfig.tier,
    tilesHit,
    targetNotes: levelConfig.targetNotes,
    accuracy,
    avgReactionMs: Math.round(avgReactionMs),
    bestReactionMs: Math.round(bestReactionMs),
    maxCombo,
    misses: totalMistakes,
    precisionPercent,
    efficiencyPercent,
    baseScore,
    speedBonus,
    accuracyBonus,
    comboBonus,
    streakBonus,
    precisionBonus,
    efficiencyBonus,
    difficultyBonus,
    completionBonus,
    penalties,
    finalScore,
    previousBest,
    isNewBest,
    newCumulativeTotal,
  };
}

/**
 * Commits a completed level run into progress:
 * - Unlocks NEXT level if not already unlocked (up to Level 40 max)
 * - Updates best score if new score > old best (prevents score farming)
 * - Recalculates totalScore as sum of best scores
 * - Updates lifetime statistics
 * - Evaluates achievements
 */
export function recordCompletedLevel(
  progress: PopPianoProgress,
  breakdown: ScoreBreakdown,
  timeTakenSeconds: number
): { updatedProgress: PopPianoProgress; newAchievementsUnlocked: string[] } {
  const lvl = breakdown.levelNumber;
  const existingSave = progress.completedLevels[lvl];
  const oldBestScore = existingSave?.highScore || 0;

  // Star rating calculation (1, 2, or 3 stars)
  let stars = 1;
  if (breakdown.accuracy >= 98 && breakdown.precisionPercent >= 75 && breakdown.misses === 0) {
    stars = 3;
  } else if (breakdown.accuracy >= 92 && breakdown.misses <= 1) {
    stars = 2;
  }

  const updatedCompleted = { ...progress.completedLevels };

  // Only update level record if new score is higher, or if first completion
  if (!existingSave || breakdown.finalScore > oldBestScore) {
    updatedCompleted[lvl] = {
      highScore: Math.max(breakdown.finalScore, oldBestScore),
      bestAccuracy: Math.max(breakdown.accuracy, existingSave?.bestAccuracy || 0),
      bestCombo: Math.max(breakdown.maxCombo, existingSave?.bestCombo || 0),
      bestAvgReactionMs: existingSave?.bestAvgReactionMs
        ? Math.min(breakdown.avgReactionMs, existingSave.bestAvgReactionMs)
        : breakdown.avgReactionMs,
      bestTimeSeconds: existingSave?.bestTimeSeconds
        ? Math.min(timeTakenSeconds, existingSave.bestTimeSeconds)
        : timeTakenSeconds,
      stars: Math.max(stars, existingSave?.stars || 1),
      completedAt: Date.now(),
    };
  }

  // Recalculate cumulative total score strictly as sum of best scores
  let newTotalScore = 0;
  Object.values(updatedCompleted).forEach((lvlData) => {
    newTotalScore += lvlData.highScore || 0;
  });

  // Next level unlock rule: if this level was just completed, unlock next level up to 40
  const nextLevel = Math.min(40, Math.max(progress.highestUnlockedLevel, lvl + 1));

  // Update lifetime statistics
  const currentStats = progress.stats;
  const totalGames = currentStats.gamesPlayed + 1;
  const completedCount = Object.keys(updatedCompleted).length;
  const totalTiles = currentStats.totalBlackTilesPressed + breakdown.tilesHit;
  const totalMisses = currentStats.totalMisses + breakdown.misses;

  // Moving average of accuracy
  const overallAcc = currentStats.gamesPlayed > 0
    ? Math.round((currentStats.overallAccuracy * currentStats.gamesPlayed + breakdown.accuracy) / totalGames)
    : breakdown.accuracy;

  // Moving average of reaction time
  const avgReact = currentStats.averageReactionTimeMs > 0 && breakdown.avgReactionMs > 0
    ? Math.round((currentStats.averageReactionTimeMs * currentStats.gamesPlayed + breakdown.avgReactionMs) / totalGames)
    : breakdown.avgReactionMs;

  const updatedStats: PopPianoStats = {
    gamesPlayed: totalGames,
    levelsCompleted: completedCount,
    totalBlackTilesPressed: totalTiles,
    totalMisses: totalMisses,
    totalWrongLanes: currentStats.totalWrongLanes,
    overallAccuracy: overallAcc,
    bestAccuracy: Math.max(currentStats.bestAccuracy, breakdown.accuracy),
    averageReactionTimeMs: avgReact,
    bestReactionTimeMs: currentStats.bestReactionTimeMs > 0 && breakdown.bestReactionMs > 0
      ? Math.min(currentStats.bestReactionTimeMs, breakdown.bestReactionMs)
      : breakdown.bestReactionMs,
    bestCombo: Math.max(currentStats.bestCombo, breakdown.maxCombo),
    totalPlayTimeSeconds: currentStats.totalPlayTimeSeconds + timeTakenSeconds,
    bestLevelScore: Math.max(currentStats.bestLevelScore, breakdown.finalScore),
  };

  // Check achievements
  const newAchievements: string[] = [];
  const updatedAchievements = { ...progress.achievements };

  const check = (id: string, condition: boolean) => {
    if (condition && !updatedAchievements[id]) {
      updatedAchievements[id] = true;
      newAchievements.push(id);
    }
  };

  check('first_100', updatedStats.totalBlackTilesPressed >= 100);
  check('speed_player', breakdown.avgReactionMs > 0 && breakdown.avgReactionMs <= 210);
  check('combo_master', breakdown.maxCombo >= 50);
  check('century_streak', breakdown.maxCombo >= 100);
  check('perfect_run', breakdown.accuracy === 100 && breakdown.misses === 0);
  check('hard_tier', completedCount >= 5);
  check('very_hard_tier', completedCount >= 10);
  check('expert_tier', completedCount >= 20);
  check('expert_plus_tier', completedCount >= 30);
  check('extreme_tier', completedCount >= 39);
  check('grand_master', completedCount >= 40 || updatedCompleted[40] !== undefined);
  check('precision_virtuoso', breakdown.precisionPercent >= 85);
  check('endurance_champion', updatedStats.totalBlackTilesPressed >= 1000);
  check('tournament_titan', newTotalScore >= 5000);

  const updatedProgress: PopPianoProgress = {
    highestUnlockedLevel: nextLevel,
    completedLevels: updatedCompleted,
    totalScore: newTotalScore,
    stats: updatedStats,
    achievements: updatedAchievements,
    settings: progress.settings,
  };

  savePopPianoProgress(updatedProgress);

  return { updatedProgress, newAchievementsUnlocked: newAchievements };
}

/**
 * Resets tournament progress cleanly
 */
export function resetPopPianoProgress(): PopPianoProgress {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
  return INITIAL_PROGRESS;
}
