/**
 * Pop Piano - Complete Tournament Types & Interfaces
 * 40-Level Skill Progression & Competitive Scoring Engine
 */

export type GameStatus =
  | 'MAIN_MENU'
  | 'LEVEL_SELECT'
  | 'LEADERBOARD'
  | 'HOW_TO_PLAY'
  | 'ACHIEVEMENTS'
  | 'STATISTICS'
  | 'SETTINGS'
  | 'ABOUT'
  | 'READY'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER'
  | 'ALL_CLEARED';

export type JudgementType = 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS';

export type DifficultyTier =
  | 'Hard'         // Level 1–5
  | 'Very Hard'    // Level 6–10
  | 'Expert'       // Level 11–20
  | 'Expert+'      // Level 21–30
  | 'Extreme'      // Level 31–39
  | 'Master';      // Level 40

export type PatternStyle =
  | 'linear_melodic'      // Smooth scales and steps (accessible, rhythmic)
  | 'alternating_duo'     // Fast back-and-forth between lanes (0-2-0-2 or 1-3-1-3)
  | 'staircase_cascade'   // Continuous 4-lane sweeps (0-1-2-3, 3-2-1-0)
  | 'arpeggio_jumps'      // Skipping lanes (0-2-1-3, 3-1-2-0)
  | 'syncopated_bursts'   // Rapid pairs with rhythmic phrasing
  | 'trill_swarms'        // Fast trills (1-2-1-2, 0-3-0-3)
  | 'virtuoso_hybrid';    // Professional multi-phrase rhapsodies

export type MusicalScaleType =
  | 'major'
  | 'pentatonic'
  | 'harmonic_minor'
  | 'canon'
  | 'chromatic';

export interface PopPianoLevelConfig {
  level: number;            // 1 to 40 (NEVER 41)
  name: string;             // Title descriptor (e.g. Allegro Prelude)
  tier: DifficultyTier;     // Hard, Very Hard, Expert, Expert+, Extreme, Master
  targetNotes: number;      // Mandatory black tiles required (100 for Level 1, up to 320)
  speed: number;            // px/s downward velocity (390 to 950)
  spacingRatio: number;     // Multiplier for tile vertical spacing (1.38 down to 1.06)
  patternStyle: PatternStyle;
  musicalScale: MusicalScaleType;
  description: string;      // Objective description
}

export interface PianoTileModel {
  id: string;
  noteIndex: number;
  lane: 0 | 1 | 2 | 3;
  y: number; // Current Y position in canvas coordinates
  height: number;
  width: number;
  pitch: string;
  frequency: number;
  isHit: boolean;
  isMissed: boolean;
  hitAnimTime: number; // ms elapsed since hit (0-120ms)
  spawnTimestamp: number; // For reaction time calculation
  judgement?: JudgementType;
}

export interface HitEffectParticle {
  id: string;
  lane: 0 | 1 | 2 | 3;
  x: number;
  y: number;
  text: string;
  type: JudgementType;
  points: number;
  alpha: number;
  scale: number;
  createdAt: number;
}

export interface LevelSaveData {
  highScore: number;
  bestAccuracy: number;
  bestCombo: number;
  bestAvgReactionMs: number;
  bestTimeSeconds: number;
  stars: number; // 1, 2, or 3 stars
  completedAt: number;
}

export interface PopPianoStats {
  gamesPlayed: number;
  levelsCompleted: number;
  totalBlackTilesPressed: number;
  totalMisses: number;
  totalWrongLanes: number;
  overallAccuracy: number;
  bestAccuracy: number;
  averageReactionTimeMs: number;
  bestReactionTimeMs: number;
  bestCombo: number;
  totalPlayTimeSeconds: number;
  bestLevelScore: number;
}

export interface PopPianoProgress {
  highestUnlockedLevel: number; // 1 to 40 (initially 1)
  completedLevels: Record<number, LevelSaveData>;
  totalScore: number; // Authoritative sum of best scores of completed levels
  stats: PopPianoStats;
  achievements: Record<string, boolean>;
  settings: {
    isAudioMuted: boolean;
  };
}

export interface ScoreBreakdown {
  levelNumber: number;
  levelName: string;
  tier: DifficultyTier;
  tilesHit: number;
  targetNotes: number;
  accuracy: number;
  avgReactionMs: number;
  bestReactionMs: number;
  maxCombo: number;
  misses: number;
  precisionPercent: number;
  efficiencyPercent: number;

  // Controlled score components
  baseScore: number;         // tilesHit * 1
  speedBonus: number;        // based on avgReactionMs
  accuracyBonus: number;     // based on accuracy %
  comboBonus: number;        // based on maxCombo
  streakBonus: number;       // milestone streaks
  precisionBonus: number;    // % of PERFECTs
  efficiencyBonus: number;   // 0 or low mistakes
  difficultyBonus: number;   // tier weight
  completionBonus: number;   // awarded on clear
  penalties: number;         // miss/wrong lane deductions

  finalScore: number;        // total points for this run
  previousBest: number;
  isNewBest: boolean;
  newCumulativeTotal: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isUnlocked: boolean;
  progressText: string;
}
