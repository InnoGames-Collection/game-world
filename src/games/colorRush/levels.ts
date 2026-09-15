/**
 * Color Rush - 40 Progressive Championship Levels
 * 
 * Strict progression:
 * - Increasing option counts (4 -> 6 -> 8 -> 9)
 * - Tighter chromatic discrimination (hue delta shrinks from 50° down to 4°)
 * - Faster decision windows (3200ms down to 850ms)
 * - Scaled rounds (5 up to 12)
 * - Proportional difficulty and perfect bonuses
 */

import { LevelConfig, DifficultyTier } from './types';

export const TOTAL_COLOR_RUSH_LEVELS = 40;

export const COLOR_RUSH_LEVELS: LevelConfig[] = [
  // --- TIER 1: BEGINNER (Levels 1 - 5) ---
  {
    level: 1,
    title: 'Chromatic Awakening',
    difficulty: 'Beginner',
    rounds: 5,
    optionCount: 4,
    timeLimitMs: 3200,
    hueDeltaRange: [40, 55],
    lightDeltaRange: [18, 26],
    difficultyBonus: 10,
    perfectBonus: 25,
    minAccuracyToPass: 50,
  },
  {
    level: 2,
    title: 'Vibrant Distinction',
    difficulty: 'Beginner',
    rounds: 5,
    optionCount: 4,
    timeLimitMs: 3000,
    hueDeltaRange: [36, 50],
    lightDeltaRange: [16, 24],
    difficultyBonus: 12,
    perfectBonus: 28,
    minAccuracyToPass: 50,
  },
  {
    level: 3,
    title: 'Spectrum Spark',
    difficulty: 'Beginner',
    rounds: 6,
    optionCount: 4,
    timeLimitMs: 2900,
    hueDeltaRange: [34, 46],
    lightDeltaRange: [15, 22],
    difficultyBonus: 15,
    perfectBonus: 32,
    minAccuracyToPass: 50,
  },
  {
    level: 4,
    title: 'Rapid Prism',
    difficulty: 'Beginner',
    rounds: 6,
    optionCount: 4,
    timeLimitMs: 2800,
    hueDeltaRange: [32, 44],
    lightDeltaRange: [14, 20],
    difficultyBonus: 18,
    perfectBonus: 36,
    minAccuracyToPass: 60,
  },
  {
    level: 5,
    title: 'Beginner Graduation',
    difficulty: 'Beginner',
    rounds: 6,
    optionCount: 4,
    timeLimitMs: 2700,
    hueDeltaRange: [30, 42],
    lightDeltaRange: [14, 20],
    difficultyBonus: 22,
    perfectBonus: 40,
    minAccuracyToPass: 60,
  },

  // --- TIER 2: NOVICE (Levels 6 - 10) ---
  {
    level: 6,
    title: 'Hex Shifter',
    difficulty: 'Novice',
    rounds: 7,
    optionCount: 6,
    timeLimitMs: 2600,
    hueDeltaRange: [28, 38],
    lightDeltaRange: [13, 18],
    difficultyBonus: 26,
    perfectBonus: 45,
    minAccuracyToPass: 60,
  },
  {
    level: 7,
    title: 'Neon Reflex',
    difficulty: 'Novice',
    rounds: 7,
    optionCount: 6,
    timeLimitMs: 2500,
    hueDeltaRange: [26, 36],
    lightDeltaRange: [12, 17],
    difficultyBonus: 30,
    perfectBonus: 50,
    minAccuracyToPass: 60,
  },
  {
    level: 8,
    title: 'Chromatic Velocity',
    difficulty: 'Novice',
    rounds: 7,
    optionCount: 6,
    timeLimitMs: 2400,
    hueDeltaRange: [24, 34],
    lightDeltaRange: [11, 16],
    difficultyBonus: 35,
    perfectBonus: 55,
    minAccuracyToPass: 60,
  },
  {
    level: 9,
    title: 'Pulsing Hues',
    difficulty: 'Novice',
    rounds: 8,
    optionCount: 6,
    timeLimitMs: 2300,
    hueDeltaRange: [22, 32],
    lightDeltaRange: [10, 15],
    difficultyBonus: 40,
    perfectBonus: 60,
    minAccuracyToPass: 65,
  },
  {
    level: 10,
    title: 'Novice Championship',
    difficulty: 'Novice',
    rounds: 8,
    optionCount: 6,
    timeLimitMs: 2200,
    hueDeltaRange: [20, 30],
    lightDeltaRange: [10, 14],
    difficultyBonus: 45,
    perfectBonus: 65,
    minAccuracyToPass: 65,
  },

  // --- TIER 3: INTERMEDIATE (Levels 11 - 16) ---
  {
    level: 11,
    title: 'Tone Horizon',
    difficulty: 'Intermediate',
    rounds: 8,
    optionCount: 6,
    timeLimitMs: 2100,
    hueDeltaRange: [18, 28],
    lightDeltaRange: [9, 14],
    difficultyBonus: 50,
    perfectBonus: 70,
    minAccuracyToPass: 65,
  },
  {
    level: 12,
    title: 'Subtle Chroma',
    difficulty: 'Intermediate',
    rounds: 8,
    optionCount: 6,
    timeLimitMs: 2000,
    hueDeltaRange: [17, 26],
    lightDeltaRange: [8, 13],
    difficultyBonus: 55,
    perfectBonus: 75,
    minAccuracyToPass: 65,
  },
  {
    level: 13,
    title: 'Prismatic Focus',
    difficulty: 'Intermediate',
    rounds: 9,
    optionCount: 6,
    timeLimitMs: 1950,
    hueDeltaRange: [16, 25],
    lightDeltaRange: [8, 12],
    difficultyBonus: 60,
    perfectBonus: 80,
    minAccuracyToPass: 70,
  },
  {
    level: 14,
    title: 'Twin Shades',
    difficulty: 'Intermediate',
    rounds: 9,
    optionCount: 6,
    timeLimitMs: 1900,
    hueDeltaRange: [15, 24],
    lightDeltaRange: [7, 12],
    difficultyBonus: 65,
    perfectBonus: 85,
    minAccuracyToPass: 70,
  },
  {
    level: 15,
    title: 'Flash Chroma',
    difficulty: 'Intermediate',
    rounds: 9,
    optionCount: 6,
    timeLimitMs: 1850,
    hueDeltaRange: [14, 23],
    lightDeltaRange: [7, 11],
    difficultyBonus: 70,
    perfectBonus: 90,
    minAccuracyToPass: 70,
  },
  {
    level: 16,
    title: 'Intermediate Peak',
    difficulty: 'Intermediate',
    rounds: 9,
    optionCount: 6,
    timeLimitMs: 1800,
    hueDeltaRange: [13, 22],
    lightDeltaRange: [6, 10],
    difficultyBonus: 75,
    perfectBonus: 95,
    minAccuracyToPass: 70,
  },

  // --- TIER 4: ADVANCED (Levels 17 - 22) ---
  {
    level: 17,
    title: 'Quantum Tint',
    difficulty: 'Advanced',
    rounds: 10,
    optionCount: 6,
    timeLimitMs: 1750,
    hueDeltaRange: [12, 20],
    lightDeltaRange: [6, 10],
    difficultyBonus: 80,
    perfectBonus: 100,
    minAccuracyToPass: 70,
  },
  {
    level: 18,
    title: 'Rapid Illusion',
    difficulty: 'Advanced',
    rounds: 10,
    optionCount: 6,
    timeLimitMs: 1700,
    hueDeltaRange: [11, 19],
    lightDeltaRange: [5, 9],
    difficultyBonus: 85,
    perfectBonus: 105,
    minAccuracyToPass: 70,
  },
  {
    level: 19,
    title: 'Octa Spectrum',
    difficulty: 'Advanced',
    rounds: 10,
    optionCount: 8,
    timeLimitMs: 1650,
    hueDeltaRange: [11, 18],
    lightDeltaRange: [5, 9],
    difficultyBonus: 90,
    perfectBonus: 110,
    minAccuracyToPass: 70,
  },
  {
    level: 20,
    title: 'Laser Precision',
    difficulty: 'Advanced',
    rounds: 10,
    optionCount: 8,
    timeLimitMs: 1600,
    hueDeltaRange: [10, 17],
    lightDeltaRange: [5, 8],
    difficultyBonus: 95,
    perfectBonus: 115,
    minAccuracyToPass: 70,
  },
  {
    level: 21,
    title: 'Sonic Spectrum',
    difficulty: 'Advanced',
    rounds: 10,
    optionCount: 8,
    timeLimitMs: 1550,
    hueDeltaRange: [10, 16],
    lightDeltaRange: [4, 8],
    difficultyBonus: 100,
    perfectBonus: 120,
    minAccuracyToPass: 75,
  },
  {
    level: 22,
    title: 'Advanced Gauntlet',
    difficulty: 'Advanced',
    rounds: 10,
    optionCount: 8,
    timeLimitMs: 1500,
    hueDeltaRange: [9, 15],
    lightDeltaRange: [4, 7],
    difficultyBonus: 105,
    perfectBonus: 125,
    minAccuracyToPass: 75,
  },

  // --- TIER 5: EXPERT (Levels 23 - 28) ---
  {
    level: 23,
    title: 'Microchromatic Wave',
    difficulty: 'Expert',
    rounds: 11,
    optionCount: 8,
    timeLimitMs: 1450,
    hueDeltaRange: [9, 14],
    lightDeltaRange: [4, 7],
    difficultyBonus: 110,
    perfectBonus: 130,
    minAccuracyToPass: 75,
  },
  {
    level: 24,
    title: 'Cyber Mirage',
    difficulty: 'Expert',
    rounds: 11,
    optionCount: 8,
    timeLimitMs: 1400,
    hueDeltaRange: [8, 13],
    lightDeltaRange: [4, 6],
    difficultyBonus: 115,
    perfectBonus: 135,
    minAccuracyToPass: 75,
  },
  {
    level: 25,
    title: 'Hypersonic Tint',
    difficulty: 'Expert',
    rounds: 11,
    optionCount: 8,
    timeLimitMs: 1350,
    hueDeltaRange: [8, 12],
    lightDeltaRange: [3, 6],
    difficultyBonus: 120,
    perfectBonus: 140,
    minAccuracyToPass: 75,
  },
  {
    level: 26,
    title: 'Shadow Variance',
    difficulty: 'Expert',
    rounds: 11,
    optionCount: 8,
    timeLimitMs: 1300,
    hueDeltaRange: [7, 12],
    lightDeltaRange: [3, 5],
    difficultyBonus: 125,
    perfectBonus: 145,
    minAccuracyToPass: 75,
  },
  {
    level: 27,
    title: 'Matrix Shifter',
    difficulty: 'Expert',
    rounds: 11,
    optionCount: 8,
    timeLimitMs: 1250,
    hueDeltaRange: [7, 11],
    lightDeltaRange: [3, 5],
    difficultyBonus: 130,
    perfectBonus: 150,
    minAccuracyToPass: 80,
  },
  {
    level: 28,
    title: 'Expert Championship',
    difficulty: 'Expert',
    rounds: 11,
    optionCount: 8,
    timeLimitMs: 1200,
    hueDeltaRange: [6, 10],
    lightDeltaRange: [3, 5],
    difficultyBonus: 135,
    perfectBonus: 155,
    minAccuracyToPass: 80,
  },

  // --- TIER 6: MASTER (Levels 29 - 33) ---
  {
    level: 29,
    title: 'Sub-Pixel Iris',
    difficulty: 'Master',
    rounds: 12,
    optionCount: 8,
    timeLimitMs: 1180,
    hueDeltaRange: [6, 9],
    lightDeltaRange: [2, 5],
    difficultyBonus: 140,
    perfectBonus: 165,
    minAccuracyToPass: 80,
  },
  {
    level: 30,
    title: 'Optic Thunder',
    difficulty: 'Master',
    rounds: 12,
    optionCount: 8,
    timeLimitMs: 1140,
    hueDeltaRange: [5, 9],
    lightDeltaRange: [2, 4],
    difficultyBonus: 145,
    perfectBonus: 175,
    minAccuracyToPass: 80,
  },
  {
    level: 31,
    title: 'Prismatic Chaos',
    difficulty: 'Master',
    rounds: 12,
    optionCount: 8,
    timeLimitMs: 1100,
    hueDeltaRange: [5, 8],
    lightDeltaRange: [2, 4],
    difficultyBonus: 150,
    perfectBonus: 185,
    minAccuracyToPass: 80,
  },
  {
    level: 32,
    title: 'Nano Hue',
    difficulty: 'Master',
    rounds: 12,
    optionCount: 8,
    timeLimitMs: 1060,
    hueDeltaRange: [5, 8],
    lightDeltaRange: [2, 4],
    difficultyBonus: 155,
    perfectBonus: 195,
    minAccuracyToPass: 80,
  },
  {
    level: 33,
    title: 'Master Sentinel',
    difficulty: 'Master',
    rounds: 12,
    optionCount: 8,
    timeLimitMs: 1020,
    hueDeltaRange: [4, 7],
    lightDeltaRange: [2, 4],
    difficultyBonus: 160,
    perfectBonus: 205,
    minAccuracyToPass: 80,
  },

  // --- TIER 7: GRANDMASTER (Levels 34 - 37) ---
  {
    level: 34,
    title: 'Infinite Spectrum',
    difficulty: 'Grandmaster',
    rounds: 12,
    optionCount: 9,
    timeLimitMs: 980,
    hueDeltaRange: [4, 7],
    lightDeltaRange: [2, 3],
    difficultyBonus: 170,
    perfectBonus: 220,
    minAccuracyToPass: 80,
  },
  {
    level: 35,
    title: 'Singularity Tone',
    difficulty: 'Grandmaster',
    rounds: 12,
    optionCount: 9,
    timeLimitMs: 950,
    hueDeltaRange: [4, 6],
    lightDeltaRange: [2, 3],
    difficultyBonus: 180,
    perfectBonus: 235,
    minAccuracyToPass: 80,
  },
  {
    level: 36,
    title: 'Overdrive Iris',
    difficulty: 'Grandmaster',
    rounds: 12,
    optionCount: 9,
    timeLimitMs: 920,
    hueDeltaRange: [4, 6],
    lightDeltaRange: [1, 3],
    difficultyBonus: 190,
    perfectBonus: 250,
    minAccuracyToPass: 80,
  },
  {
    level: 37,
    title: 'Grandmaster Summit',
    difficulty: 'Grandmaster',
    rounds: 13,
    optionCount: 9,
    timeLimitMs: 900,
    hueDeltaRange: [3, 6],
    lightDeltaRange: [1, 3],
    difficultyBonus: 200,
    perfectBonus: 265,
    minAccuracyToPass: 85,
  },

  // --- TIER 8: LEGEND (Levels 38 - 40) ---
  {
    level: 38,
    title: 'Cosmic Refraction',
    difficulty: 'Legend',
    rounds: 13,
    optionCount: 9,
    timeLimitMs: 880,
    hueDeltaRange: [3, 5],
    lightDeltaRange: [1, 3],
    difficultyBonus: 220,
    perfectBonus: 285,
    minAccuracyToPass: 85,
  },
  {
    level: 39,
    title: 'Apex Vision',
    difficulty: 'Legend',
    rounds: 13,
    optionCount: 9,
    timeLimitMs: 860,
    hueDeltaRange: [3, 5],
    lightDeltaRange: [1, 2],
    difficultyBonus: 240,
    perfectBonus: 310,
    minAccuracyToPass: 85,
  },
  {
    level: 40,
    title: 'COLOR RUSH GOD',
    difficulty: 'Legend',
    rounds: 14,
    optionCount: 9,
    timeLimitMs: 840,
    hueDeltaRange: [3, 5],
    lightDeltaRange: [1, 2],
    difficultyBonus: 260,
    perfectBonus: 350,
    minAccuracyToPass: 85,
  },
];

export function getLevelConfig(level: number): LevelConfig {
  const found = COLOR_RUSH_LEVELS.find((l) => l.level === level);
  if (found) return found;
  // Fallback to max level configuration
  return COLOR_RUSH_LEVELS[COLOR_RUSH_LEVELS.length - 1];
}

export function getDifficultyBadgeColor(difficulty: DifficultyTier): {
  bg: string;
  text: string;
  border: string;
} {
  switch (difficulty) {
    case 'Beginner':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'Novice':
      return { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    case 'Intermediate':
      return { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'Advanced':
      return { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30' };
    case 'Expert':
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'Master':
      return { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' };
    case 'Grandmaster':
      return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' };
    case 'Legend':
      return { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300', border: 'border-fuchsia-500/40' };
  }
}

export function calculateStars(score: number, levelConfig: LevelConfig): number {
  if (score <= 0) return 0;
  // Standard 3-star scale based on potential maximum
  const maxPossible = 
    levelConfig.rounds * (1 + 3 + 2) + 
    levelConfig.difficultyBonus + 
    levelConfig.level * 5 + 
    levelConfig.perfectBonus;

  const ratio = score / maxPossible;
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.60) return 2;
  return 1;
}
