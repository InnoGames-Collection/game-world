/**
 * DAMA - Deterministic Tournament Scoring Engine & Progression Manager
 * 
 * Rules:
 * 1. Base Score + Win Bonus + Difficulty Tier + Capture Efficiency + Piece Survival
 *    + King Bonus + Move Efficiency + Time Bonus + Tactical Streak + Clean Play - Penalties.
 * 2. Absolutely zero Math.random() in score calculations.
 * 3. Compact, readable scores (typically 45–130 per level).
 * 4. Anti-score farming: Cumulative Tournament Score = sum of personal BEST scores per level.
 * 5. Replaying a level only improves total score if the new score exceeds previous best.
 */

import {
  DamaProgress,
  DamaScoreBreakdown,
  DamaLevelSaveData,
  LevelDifficultyConfig,
  MatchStats,
} from './types';

export const DAMA_STORAGE_KEY = 'teleplus_dama_tournament_v1';

export const INITIAL_DAMA_PROGRESS: DamaProgress = {
  version: 1,
  highestUnlockedLevel: 1,
  totalScore: 0,
  completedLevels: {},
  achievements: {},
  stats: {
    wins: 0,
    losses: 0,
    draws: 0,
    totalMoves: 0,
    totalCaptures: 0,
    totalKings: 0,
    totalInvalidAttempts: 0,
    bestWinStreak: 0,
    currentWinStreak: 0,
    totalPlayTimeSeconds: 0,
    bestLevelScore: 0,
    bestSingleMatchDuration: 0,
  },
  settings: {
    isAudioMuted: false,
  },
};

/**
 * Loads Dama Tournament Progress from local persistence
 */
export function loadDamaProgress(): DamaProgress {
  try {
    const raw = localStorage.getItem(DAMA_STORAGE_KEY);
    if (!raw) return INITIAL_DAMA_PROGRESS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return INITIAL_DAMA_PROGRESS;

    return {
      version: parsed.version || 1,
      highestUnlockedLevel: Math.max(1, Math.min(40, parsed.highestUnlockedLevel || 1)),
      totalScore: typeof parsed.totalScore === 'number' ? parsed.totalScore : 0,
      completedLevels: parsed.completedLevels || {},
      achievements: parsed.achievements || {},
      stats: {
        wins: parsed.stats?.wins || 0,
        losses: parsed.stats?.losses || 0,
        draws: parsed.stats?.draws || 0,
        totalMoves: parsed.stats?.totalMoves || 0,
        totalCaptures: parsed.stats?.totalCaptures || 0,
        totalKings: parsed.stats?.totalKings || 0,
        totalInvalidAttempts: parsed.stats?.totalInvalidAttempts || 0,
        bestWinStreak: parsed.stats?.bestWinStreak || 0,
        currentWinStreak: parsed.stats?.currentWinStreak || 0,
        totalPlayTimeSeconds: parsed.stats?.totalPlayTimeSeconds || 0,
        bestLevelScore: parsed.stats?.bestLevelScore || 0,
        bestSingleMatchDuration: parsed.stats?.bestSingleMatchDuration || 0,
      },
      settings: {
        isAudioMuted: Boolean(parsed.settings?.isAudioMuted),
      },
    };
  } catch (e) {
    console.warn('Failed to load Dama tournament progress:', e);
    return INITIAL_DAMA_PROGRESS;
  }
}

/**
 * Persists Dama Tournament Progress
 */
export function saveDamaProgress(progress: DamaProgress): void {
  try {
    localStorage.setItem(DAMA_STORAGE_KEY, JSON.stringify(progress));
    // Backward compatibility with legacy keys
    localStorage.setItem('teleplus_dama_unlocked_level', String(progress.highestUnlockedLevel));
  } catch (e) {
    console.warn('Failed to save Dama tournament progress:', e);
  }
}

export interface CalculateScoreParams {
  levelConfig: LevelDifficultyConfig;
  isWin: boolean;
  matchStats: MatchStats;
  playerPiecesRemaining: number;
  currentProgress: DamaProgress;
}

/**
 * Authoritative Deterministic Scoring Formula for Dama Tournament Match
 */
export function calculateDamaScore(params: CalculateScoreParams): DamaScoreBreakdown {
  const {
    levelConfig,
    isWin,
    matchStats,
    playerPiecesRemaining,
    currentProgress,
  } = params;

  const lvl = levelConfig.level;
  const moves = matchStats.movesPlayed;
  const captures = matchStats.playerPiecesCaptured;
  const kings = matchStats.playerKingsCreated;
  const invalidAttempts = matchStats.invalidMoveAttempts;
  const duration = Math.max(1, matchStats.matchDurationSeconds);

  // 1. BASE SCORE: Every completed level earns base score
  const baseScore = 20;

  // 2. WIN BONUS: +25 on victory, 0 on defeat
  const winBonus = isWin ? 25 : 0;

  // 3. DIFFICULTY BONUS: Scaled by level 1..40 and tier
  // Level 1: +5, Level 10: +14, Level 20: +22, Level 30: +30, Level 40: +38
  const difficultyBonus = Math.round(4 + lvl * 0.85);

  // 4. CAPTURE EFFICIENCY: +2 points per captured piece, +4 bonus if all 12 wiped out
  const captureEfficiencyBonus = captures * 2 + (captures >= 12 ? 4 : 0);

  // 5. PIECE SURVIVAL: +2 points per surviving piece
  const pieceSurvivalBonus = Math.max(0, playerPiecesRemaining * 2);

  // 6. KING PROMOTION BONUS: +4 points per crowned king (max 16)
  const kingBonus = Math.min(16, kings * 4);

  // 7. MOVE EFFICIENCY BONUS (Winning in fewer strategic moves)
  let moveEfficiencyBonus = 0;
  if (isWin) {
    if (moves <= 24) moveEfficiencyBonus = 18;
    else if (moves <= 32) moveEfficiencyBonus = 14;
    else if (moves <= 42) moveEfficiencyBonus = 10;
    else if (moves <= 55) moveEfficiencyBonus = 6;
    else moveEfficiencyBonus = 2;
  }

  // 8. TIME BONUS (Rewards steady, decisive moves)
  const avgMoveTime = moves > 0 ? duration / moves : 4;
  let timeBonus = 0;
  if (isWin) {
    if (avgMoveTime <= 2.2) timeBonus = 8;
    else if (avgMoveTime <= 3.8) timeBonus = 5;
    else if (avgMoveTime <= 5.5) timeBonus = 3;
    else timeBonus = 1;
  }

  // 9. TACTICAL STREAK BONUS: +2 per consecutive tactical capture turn (max 8)
  const tacticalStreakBonus = Math.min(8, matchStats.tacticalCapturesSequence * 2);

  // 10. CLEAN PLAY BONUS: 0 invalid attempts = +5
  const cleanPlayBonus = isWin && invalidAttempts === 0 ? 5 : 0;

  // 11. COMPLETION BONUS: +10 on win
  const completionBonus = isWin ? 10 : 0;

  // 12. PENALTIES: -2 per invalid move attempt (capped at -10)
  const penalties = Math.min(10, invalidAttempts * 2);

  // FINAL DETERMINISTIC SCORE
  const rawScore =
    baseScore +
    winBonus +
    difficultyBonus +
    captureEfficiencyBonus +
    pieceSurvivalBonus +
    kingBonus +
    moveEfficiencyBonus +
    timeBonus +
    tacticalStreakBonus +
    cleanPlayBonus +
    completionBonus -
    penalties;

  const finalScore = Math.max(10, rawScore);

  // Star calculation (1 to 3 stars based on performance)
  let starsEarned = 1;
  if (isWin) {
    if (finalScore >= 85 || (moves <= 35 && playerPiecesRemaining >= 6)) starsEarned = 3;
    else if (finalScore >= 60 || playerPiecesRemaining >= 4) starsEarned = 2;
    else starsEarned = 1;
  } else {
    starsEarned = 0;
  }

  // Check against previous best score for this level
  const existingSave = currentProgress.completedLevels[lvl];
  const previousBest = existingSave?.highScore || 0;
  const isNewBest = isWin && finalScore > previousBest;

  // Calculate projected new cumulative total score (Anti-farming: sum of BEST of each level)
  let projectedTotal = 0;
  for (let l = 1; l <= 40; l++) {
    if (l === lvl) {
      projectedTotal += Math.max(previousBest, isWin ? finalScore : previousBest);
    } else if (currentProgress.completedLevels[l]) {
      projectedTotal += currentProgress.completedLevels[l].highScore || 0;
    }
  }

  // Move efficiency percentage
  const efficiencyPercent = Math.min(
    100,
    Math.max(
      30,
      Math.round(((captures * 3 + playerPiecesRemaining * 2) / Math.max(10, moves)) * 25)
    )
  );

  return {
    levelNumber: lvl,
    levelName: levelConfig.name,
    tier: levelConfig.tier,
    isWin,
    baseScore,
    winBonus,
    difficultyBonus,
    captureEfficiencyBonus,
    pieceSurvivalBonus,
    kingBonus,
    moveEfficiencyBonus,
    timeBonus,
    tacticalStreakBonus,
    cleanPlayBonus,
    completionBonus,
    penalties,
    finalScore,
    newCumulativeTotal: projectedTotal,
    isNewBest,
    starsEarned,
    moves,
    captures,
    piecesRemaining: playerPiecesRemaining,
    kings,
    matchDurationSeconds: duration,
    avgMoveTimeSeconds: Math.round(avgMoveTime * 10) / 10,
    bestMoveTimeSeconds: matchStats.bestMoveTimeSeconds || Math.round(avgMoveTime * 0.6 * 10) / 10,
    efficiencyPercent,
  };
}

/**
 * Commits a completed Dama match to progress, unlocking Level N+1 on victory,
 * updating career stats, and evaluating tournament achievements.
 */
export function recordCompletedDamaMatch(
  prevProgress: DamaProgress,
  breakdown: DamaScoreBreakdown
): { updatedProgress: DamaProgress; unlockedNewLevel: boolean } {
  const lvl = breakdown.levelNumber;
  const isWin = breakdown.isWin;
  let unlockedNewLevel = false;

  // 1. Level Unlock Progression: Level N+1 unlocks ONLY after victory on Level N (capped at 40)
  let nextHighestUnlocked = prevProgress.highestUnlockedLevel;
  if (isWin && lvl === prevProgress.highestUnlockedLevel && lvl < 40) {
    nextHighestUnlocked = lvl + 1;
    unlockedNewLevel = true;
  }

  // 2. Anti-Farming Best Score Storage
  const existingSave = prevProgress.completedLevels[lvl];
  const oldBest = existingSave?.highScore || 0;
  const newBest = isWin ? Math.max(oldBest, breakdown.finalScore) : oldBest;

  const updatedLevelSave: DamaLevelSaveData = {
    highScore: newBest,
    stars: Math.max(existingSave?.stars || 0, breakdown.starsEarned),
    wins: (existingSave?.wins || 0) + (isWin ? 1 : 0),
    losses: (existingSave?.losses || 0) + (isWin ? 0 : 1),
    bestMoves: existingSave?.bestMoves ? Math.min(existingSave.bestMoves, breakdown.moves) : breakdown.moves,
    bestCaptures: Math.max(existingSave?.bestCaptures || 0, breakdown.captures),
    bestPiecesRemaining: Math.max(existingSave?.bestPiecesRemaining || 0, breakdown.piecesRemaining),
    bestKings: Math.max(existingSave?.bestKings || 0, breakdown.kings),
    bestTimeSeconds: existingSave?.bestTimeSeconds
      ? Math.min(existingSave.bestTimeSeconds, breakdown.matchDurationSeconds)
      : breakdown.matchDurationSeconds,
    bestEfficiencyPercent: Math.max(existingSave?.bestEfficiencyPercent || 0, breakdown.efficiencyPercent),
    lastPlayedTimestamp: Date.now(),
  };

  const updatedCompletedLevels = {
    ...prevProgress.completedLevels,
    [lvl]: updatedLevelSave,
  };

  // 3. Recalculate Authoritative Cumulative Tournament Score (Sum of each level's BEST score)
  let calculatedTotalScore = 0;
  Object.values(updatedCompletedLevels).forEach((saveData) => {
    calculatedTotalScore += saveData.highScore || 0;
  });

  // 4. Update Lifetime Career Statistics
  const prevStats = prevProgress.stats;
  const newWinStreak = isWin ? prevStats.currentWinStreak + 1 : 0;
  const bestWinStreak = Math.max(prevStats.bestWinStreak, newWinStreak);

  const updatedStats = {
    wins: prevStats.wins + (isWin ? 1 : 0),
    losses: prevStats.losses + (isWin ? 0 : 1),
    draws: prevStats.draws,
    totalMoves: prevStats.totalMoves + breakdown.moves,
    totalCaptures: prevStats.totalCaptures + breakdown.captures,
    totalKings: prevStats.totalKings + breakdown.kings,
    totalInvalidAttempts: prevStats.totalInvalidAttempts + breakdown.penalties / 2,
    bestWinStreak,
    currentWinStreak: newWinStreak,
    totalPlayTimeSeconds: prevStats.totalPlayTimeSeconds + breakdown.matchDurationSeconds,
    bestLevelScore: Math.max(prevStats.bestLevelScore, isWin ? breakdown.finalScore : 0),
    bestSingleMatchDuration: prevStats.bestSingleMatchDuration
      ? Math.min(prevStats.bestSingleMatchDuration, breakdown.matchDurationSeconds)
      : breakdown.matchDurationSeconds,
  };

  // 5. Evaluate Tournament Achievements
  const updatedAchievements = { ...prevProgress.achievements };
  const now = Date.now();

  const grant = (id: string) => {
    if (!updatedAchievements[id]) updatedAchievements[id] = now;
  };

  if (isWin) grant('first_victory');
  if (breakdown.kings >= 1) grant('king_maker');
  if (isWin && breakdown.penalties === 0) grant('clean_win');
  if (breakdown.efficiencyPercent >= 80) grant('tactician');
  if (newWinStreak >= 3) grant('win_streak_3');
  if (newWinStreak >= 5) grant('win_streak_5');
  if (isWin && breakdown.piecesRemaining >= 8) grant('iron_defense');
  if (isWin && breakdown.captures >= 12) grant('clean_sweep');
  if (updatedCompletedLevels[5]?.wins > 0) grant('hard_tier');
  if (updatedCompletedLevels[10]?.wins > 0) grant('level_10');
  if (updatedCompletedLevels[20]?.wins > 0) grant('level_20');
  if (updatedCompletedLevels[30]?.wins > 0) grant('level_30');
  if (updatedCompletedLevels[39]?.wins > 0) grant('extreme_tier');
  if (updatedCompletedLevels[40]?.wins > 0) grant('dama_master');
  if (calculatedTotalScore >= 2000) grant('tournament_titan');

  const updatedProgress: DamaProgress = {
    version: 1,
    highestUnlockedLevel: nextHighestUnlocked,
    totalScore: calculatedTotalScore,
    completedLevels: updatedCompletedLevels,
    achievements: updatedAchievements,
    stats: updatedStats,
    settings: prevProgress.settings,
  };

  saveDamaProgress(updatedProgress);

  return { updatedProgress, unlockedNewLevel };
}

/**
 * Resets Dama Progress back to Initial State
 */
export function resetDamaProgress(): DamaProgress {
  localStorage.removeItem(DAMA_STORAGE_KEY);
  localStorage.removeItem('teleplus_dama_unlocked_level');
  localStorage.removeItem('teleplus_dama_current_level');
  localStorage.removeItem('teleplus_dama_level_stars');
  return INITIAL_DAMA_PROGRESS;
}
