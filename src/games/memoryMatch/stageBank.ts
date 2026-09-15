import { LevelConfig, MemoryCard } from './types';
import { CARD_SYMBOLS } from './cardSymbols';

/**
 * 40 PROGRESSIVE COMPETITIVE DIFFICULTY LEVELS
 * Structured into 9 Official Tournament Difficulty Tiers:
 * - Levels 1–5:   HARD (Starts challenging right from Level 1: 12 cards, no trivial tutorial)
 * - Levels 6–10:  HARD+
 * - Levels 11–15: VERY HARD
 * - Levels 16–20: VERY HARD+
 * - Levels 21–25: EXPERT
 * - Levels 26–30: EXPERT+
 * - Levels 31–35: EXTREME
 * - Levels 36–39: MASTER
 * - Level 40:     FINAL CHALLENGE (The Ultimate Grand Master Trial)
 */
export const LEVEL_CONFIGURATIONS: LevelConfig[] = [
  // =========================================================================
  // TIER 1: HARD (Levels 1–5) — No easy tutorial! Instant focus required
  // =========================================================================
  {
    levelNumber: 1,
    pairsCount: 6,
    totalCards: 12,
    cols: 3,
    rows: 4,
    targetMoves: 8,
    timeLimit: 50,
    title: 'Cognitive Awakening',
    themeCategory: 'Discovery',
    difficultyTier: 'HARD',
    difficultyMultiplier: 1.0,
    coinReward: 25,
    visualSimilarityTier: 1,
  },
  {
    levelNumber: 2,
    pairsCount: 7,
    totalCards: 14,
    cols: 4,
    rows: 4,
    targetMoves: 10,
    timeLimit: 52,
    title: 'Highland Recall',
    themeCategory: 'Highland',
    difficultyTier: 'HARD',
    difficultyMultiplier: 1.02,
    coinReward: 30,
    visualSimilarityTier: 1,
  },
  {
    levelNumber: 3,
    pairsCount: 8,
    totalCards: 16,
    cols: 4,
    rows: 4,
    targetMoves: 11,
    timeLimit: 55,
    title: 'Ancient Cipher',
    themeCategory: 'Highland',
    difficultyTier: 'HARD',
    difficultyMultiplier: 1.04,
    coinReward: 35,
    visualSimilarityTier: 1,
  },
  {
    levelNumber: 4,
    pairsCount: 9,
    totalCards: 18,
    cols: 4,
    rows: 5,
    targetMoves: 13,
    timeLimit: 58,
    title: 'Savanna Pulse',
    themeCategory: 'Savanna',
    difficultyTier: 'HARD',
    difficultyMultiplier: 1.06,
    coinReward: 40,
    visualSimilarityTier: 1,
  },
  {
    levelNumber: 5,
    pairsCount: 10,
    totalCards: 20,
    cols: 4,
    rows: 5,
    targetMoves: 14,
    timeLimit: 60,
    title: 'Wilderness Trial',
    themeCategory: 'Wilderness',
    difficultyTier: 'HARD',
    difficultyMultiplier: 1.08,
    coinReward: 45,
    visualSimilarityTier: 1,
  },

  // =========================================================================
  // TIER 2: HARD+ (Levels 6–10)
  // =========================================================================
  {
    levelNumber: 6,
    pairsCount: 10,
    totalCards: 20,
    cols: 4,
    rows: 5,
    targetMoves: 14,
    timeLimit: 55,
    title: 'Echoes of Simien',
    themeCategory: 'Heritage',
    difficultyTier: 'HARD+',
    difficultyMultiplier: 1.10,
    coinReward: 50,
    visualSimilarityTier: 2,
  },
  {
    levelNumber: 7,
    pairsCount: 11,
    totalCards: 22,
    cols: 4,
    rows: 6,
    targetMoves: 16,
    timeLimit: 58,
    title: 'Axum Constellation',
    themeCategory: 'Heritage',
    difficultyTier: 'HARD+',
    difficultyMultiplier: 1.12,
    coinReward: 55,
    visualSimilarityTier: 2,
  },
  {
    levelNumber: 8,
    pairsCount: 12,
    totalCards: 24,
    cols: 4,
    rows: 6,
    targetMoves: 17,
    timeLimit: 60,
    title: 'Champions League',
    themeCategory: 'Champions',
    difficultyTier: 'HARD+',
    difficultyMultiplier: 1.14,
    coinReward: 60,
    visualSimilarityTier: 2,
  },
  {
    levelNumber: 9,
    pairsCount: 12,
    totalCards: 24,
    cols: 4,
    rows: 6,
    targetMoves: 17,
    timeLimit: 58,
    title: 'Golden Stadium',
    themeCategory: 'Champions',
    difficultyTier: 'HARD+',
    difficultyMultiplier: 1.16,
    coinReward: 65,
    visualSimilarityTier: 2,
  },
  {
    levelNumber: 10,
    pairsCount: 12,
    totalCards: 24,
    cols: 4,
    rows: 6,
    targetMoves: 16,
    timeLimit: 54,
    title: 'Global Arena',
    themeCategory: 'World',
    difficultyTier: 'HARD+',
    difficultyMultiplier: 1.18,
    coinReward: 70,
    visualSimilarityTier: 2,
  },

  // =========================================================================
  // TIER 3: VERY HARD (Levels 11–15)
  // =========================================================================
  {
    levelNumber: 11,
    pairsCount: 14,
    totalCards: 28,
    cols: 4,
    rows: 7,
    targetMoves: 19,
    timeLimit: 64,
    title: 'Labyrinth of Gondar',
    themeCategory: 'Treasures',
    difficultyTier: 'VERY HARD',
    difficultyMultiplier: 1.20,
    coinReward: 75,
    visualSimilarityTier: 2,
  },
  {
    levelNumber: 12,
    pairsCount: 14,
    totalCards: 28,
    cols: 4,
    rows: 7,
    targetMoves: 19,
    timeLimit: 62,
    title: 'Treasures of Lalibela',
    themeCategory: 'Treasures',
    difficultyTier: 'VERY HARD',
    difficultyMultiplier: 1.22,
    coinReward: 80,
    visualSimilarityTier: 2,
  },
  {
    levelNumber: 13,
    pairsCount: 15,
    totalCards: 30,
    cols: 5,
    rows: 6,
    targetMoves: 21,
    timeLimit: 64,
    title: 'Blue Nile Surge',
    themeCategory: 'Nature',
    difficultyTier: 'VERY HARD',
    difficultyMultiplier: 1.24,
    coinReward: 85,
    visualSimilarityTier: 2,
  },
  {
    levelNumber: 14,
    pairsCount: 15,
    totalCards: 30,
    cols: 5,
    rows: 6,
    targetMoves: 20,
    timeLimit: 60,
    title: 'Kingdom Legacy',
    themeCategory: 'Kingdoms',
    difficultyTier: 'VERY HARD',
    difficultyMultiplier: 1.26,
    coinReward: 90,
    visualSimilarityTier: 2,
  },
  {
    levelNumber: 15,
    pairsCount: 16,
    totalCards: 32,
    cols: 4,
    rows: 8,
    targetMoves: 22,
    timeLimit: 65,
    title: 'Sonic Symphony',
    themeCategory: 'Musicians',
    difficultyTier: 'VERY HARD',
    difficultyMultiplier: 1.28,
    coinReward: 95,
    visualSimilarityTier: 2,
  },

  // =========================================================================
  // TIER 4: VERY HARD+ (Levels 16–20)
  // =========================================================================
  {
    levelNumber: 16,
    pairsCount: 16,
    totalCards: 32,
    cols: 4,
    rows: 8,
    targetMoves: 22,
    timeLimit: 60,
    title: 'Quantum Gateway',
    themeCategory: 'Technology',
    difficultyTier: 'VERY HARD+',
    difficultyMultiplier: 1.30,
    coinReward: 100,
    visualSimilarityTier: 3,
  },
  {
    levelNumber: 17,
    pairsCount: 18,
    totalCards: 36,
    cols: 6,
    rows: 6,
    targetMoves: 25,
    timeLimit: 68,
    title: 'Cyberpunk Metropolis',
    themeCategory: 'Technology',
    difficultyTier: 'VERY HARD+',
    difficultyMultiplier: 1.32,
    coinReward: 105,
    visualSimilarityTier: 3,
  },
  {
    levelNumber: 18,
    pairsCount: 18,
    totalCards: 36,
    cols: 6,
    rows: 6,
    targetMoves: 24,
    timeLimit: 65,
    title: 'Aero Velocity',
    themeCategory: 'Vehicles',
    difficultyTier: 'VERY HARD+',
    difficultyMultiplier: 1.34,
    coinReward: 110,
    visualSimilarityTier: 3,
  },
  {
    levelNumber: 19,
    pairsCount: 18,
    totalCards: 36,
    cols: 6,
    rows: 6,
    targetMoves: 24,
    timeLimit: 62,
    title: 'Apex Predators',
    themeCategory: 'Wildlife',
    difficultyTier: 'VERY HARD+',
    difficultyMultiplier: 1.36,
    coinReward: 115,
    visualSimilarityTier: 3,
  },
  {
    levelNumber: 20,
    pairsCount: 20,
    totalCards: 40,
    cols: 5,
    rows: 8,
    targetMoves: 27,
    timeLimit: 72,
    title: 'Halfway Colosseum',
    themeCategory: 'Grand Arena',
    difficultyTier: 'VERY HARD+',
    difficultyMultiplier: 1.38,
    coinReward: 125,
    visualSimilarityTier: 3,
  },

  // =========================================================================
  // TIER 5: EXPERT (Levels 21–25)
  // =========================================================================
  {
    levelNumber: 21,
    pairsCount: 20,
    totalCards: 40,
    cols: 5,
    rows: 8,
    targetMoves: 27,
    timeLimit: 68,
    title: 'Master Architect',
    themeCategory: 'Landmarks',
    difficultyTier: 'EXPERT',
    difficultyMultiplier: 1.40,
    coinReward: 135,
    visualSimilarityTier: 3,
  },
  {
    levelNumber: 22,
    pairsCount: 20,
    totalCards: 40,
    cols: 5,
    rows: 8,
    targetMoves: 26,
    timeLimit: 65,
    title: 'Celestial Meridian',
    themeCategory: 'Technology',
    difficultyTier: 'EXPERT',
    difficultyMultiplier: 1.42,
    coinReward: 145,
    visualSimilarityTier: 3,
  },
  {
    levelNumber: 23,
    pairsCount: 21,
    totalCards: 42,
    cols: 6,
    rows: 7,
    targetMoves: 28,
    timeLimit: 70,
    title: 'Olympic Prestige',
    themeCategory: 'Sports',
    difficultyTier: 'EXPERT',
    difficultyMultiplier: 1.44,
    coinReward: 155,
    visualSimilarityTier: 3,
  },
  {
    levelNumber: 24,
    pairsCount: 21,
    totalCards: 42,
    cols: 6,
    rows: 7,
    targetMoves: 27,
    timeLimit: 66,
    title: 'Titanium Crucible',
    themeCategory: 'Grand Arena',
    difficultyTier: 'EXPERT',
    difficultyMultiplier: 1.46,
    coinReward: 165,
    visualSimilarityTier: 3,
  },
  {
    levelNumber: 25,
    pairsCount: 22,
    totalCards: 44,
    cols: 6,
    rows: 8,
    targetMoves: 29,
    timeLimit: 72,
    title: 'Vanguard Protocol',
    themeCategory: 'Elite',
    difficultyTier: 'EXPERT',
    difficultyMultiplier: 1.48,
    coinReward: 175,
    visualSimilarityTier: 3,
  },

  // =========================================================================
  // TIER 6: EXPERT+ (Levels 26–30)
  // =========================================================================
  {
    levelNumber: 26,
    pairsCount: 22,
    totalCards: 44,
    cols: 6,
    rows: 8,
    targetMoves: 29,
    timeLimit: 68,
    title: 'Simien Sovereign',
    themeCategory: 'Heritage',
    difficultyTier: 'EXPERT+',
    difficultyMultiplier: 1.50,
    coinReward: 185,
    visualSimilarityTier: 3,
  },
  {
    levelNumber: 27,
    pairsCount: 24,
    totalCards: 48,
    cols: 6,
    rows: 8,
    targetMoves: 31,
    timeLimit: 74,
    title: 'Pantheon of Mind',
    themeCategory: 'Elite',
    difficultyTier: 'EXPERT+',
    difficultyMultiplier: 1.52,
    coinReward: 195,
    visualSimilarityTier: 3,
  },
  {
    levelNumber: 28,
    pairsCount: 24,
    totalCards: 48,
    cols: 6,
    rows: 8,
    targetMoves: 31,
    timeLimit: 70,
    title: 'Golden Matrix',
    themeCategory: 'Grand Arena',
    difficultyTier: 'EXPERT+',
    difficultyMultiplier: 1.54,
    coinReward: 205,
    visualSimilarityTier: 3,
  },
  {
    levelNumber: 29,
    pairsCount: 24,
    totalCards: 48,
    cols: 6,
    rows: 8,
    targetMoves: 30,
    timeLimit: 68,
    title: 'Shadow Silhouette',
    themeCategory: 'Elite',
    difficultyTier: 'EXPERT+',
    difficultyMultiplier: 1.56,
    coinReward: 215,
    visualSimilarityTier: 3,
  },
  {
    levelNumber: 30,
    pairsCount: 24,
    totalCards: 48,
    cols: 6,
    rows: 8,
    targetMoves: 30,
    timeLimit: 65,
    title: 'Diamond Bastion',
    themeCategory: 'Champions',
    difficultyTier: 'EXPERT+',
    difficultyMultiplier: 1.58,
    coinReward: 230,
    visualSimilarityTier: 3,
  },

  // =========================================================================
  // TIER 7: EXTREME (Levels 31–35) — Tier 4 Visual Similarity
  // =========================================================================
  {
    levelNumber: 31,
    pairsCount: 24,
    totalCards: 48,
    cols: 6,
    rows: 8,
    targetMoves: 30,
    timeLimit: 68,
    title: 'Optical Mirage',
    themeCategory: 'Legendary',
    difficultyTier: 'EXTREME',
    difficultyMultiplier: 1.60,
    coinReward: 250,
    visualSimilarityTier: 4,
  },
  {
    levelNumber: 32,
    pairsCount: 24,
    totalCards: 48,
    cols: 6,
    rows: 8,
    targetMoves: 29,
    timeLimit: 65,
    title: 'Prism Overdrive',
    themeCategory: 'Legendary',
    difficultyTier: 'EXTREME',
    difficultyMultiplier: 1.62,
    coinReward: 270,
    visualSimilarityTier: 4,
  },
  {
    levelNumber: 33,
    pairsCount: 24,
    totalCards: 48,
    cols: 6,
    rows: 8,
    targetMoves: 29,
    timeLimit: 63,
    title: 'Vortex of Synapses',
    themeCategory: 'Legendary',
    difficultyTier: 'EXTREME',
    difficultyMultiplier: 1.64,
    coinReward: 290,
    visualSimilarityTier: 4,
  },
  {
    levelNumber: 34,
    pairsCount: 24,
    totalCards: 48,
    cols: 6,
    rows: 8,
    targetMoves: 28,
    timeLimit: 60,
    title: 'Neural Overload',
    themeCategory: 'Legendary',
    difficultyTier: 'EXTREME',
    difficultyMultiplier: 1.66,
    coinReward: 310,
    visualSimilarityTier: 4,
  },
  {
    levelNumber: 35,
    pairsCount: 24,
    totalCards: 48,
    cols: 6,
    rows: 8,
    targetMoves: 28,
    timeLimit: 58,
    title: 'Hyper Cognition',
    themeCategory: 'Legendary',
    difficultyTier: 'EXTREME',
    difficultyMultiplier: 1.68,
    coinReward: 330,
    visualSimilarityTier: 4,
  },

  // =========================================================================
  // TIER 8: MASTER (Levels 36–39)
  // =========================================================================
  {
    levelNumber: 36,
    pairsCount: 24,
    totalCards: 48,
    cols: 6,
    rows: 8,
    targetMoves: 28,
    timeLimit: 58,
    title: 'Grand Arbiter',
    themeCategory: 'Pantheon',
    difficultyTier: 'MASTER',
    difficultyMultiplier: 1.70,
    coinReward: 360,
    visualSimilarityTier: 4,
  },
  {
    levelNumber: 37,
    pairsCount: 24,
    totalCards: 48,
    cols: 6,
    rows: 8,
    targetMoves: 27,
    timeLimit: 56,
    title: 'Cosmic Memory',
    themeCategory: 'Pantheon',
    difficultyTier: 'MASTER',
    difficultyMultiplier: 1.72,
    coinReward: 390,
    visualSimilarityTier: 4,
  },
  {
    levelNumber: 38,
    pairsCount: 24,
    totalCards: 48,
    cols: 6,
    rows: 8,
    targetMoves: 27,
    timeLimit: 54,
    title: 'Eternal Vanguard',
    themeCategory: 'Pantheon',
    difficultyTier: 'MASTER',
    difficultyMultiplier: 1.74,
    coinReward: 420,
    visualSimilarityTier: 4,
  },
  {
    levelNumber: 39,
    pairsCount: 24,
    totalCards: 48,
    cols: 6,
    rows: 8,
    targetMoves: 26,
    timeLimit: 52,
    title: 'Pinnacle of Thought',
    themeCategory: 'Pantheon',
    difficultyTier: 'MASTER',
    difficultyMultiplier: 1.76,
    coinReward: 460,
    visualSimilarityTier: 4,
  },

  // =========================================================================
  // TIER 9: FINAL CHALLENGE (Level 40) — The Ultimate Masterpiece
  // =========================================================================
  {
    levelNumber: 40,
    pairsCount: 24,
    totalCards: 48,
    cols: 6,
    rows: 8,
    targetMoves: 26,
    timeLimit: 50,
    title: 'The Grand Master Final',
    themeCategory: 'Pantheon',
    difficultyTier: 'FINAL CHALLENGE',
    difficultyMultiplier: 1.80,
    coinReward: 600,
    visualSimilarityTier: 4,
  },
];

export function getLevelConfig(levelNum: number): LevelConfig {
  const clamped = Math.max(1, Math.min(levelNum, LEVEL_CONFIGURATIONS.length));
  return LEVEL_CONFIGURATIONS[clamped - 1];
}

/**
 * Generate randomly arranged matching card pairs for the given level.
 * Curates symbols dynamically according to visual similarity tier:
 * - Tier 1: distinct, colorful subjects across separate categories
 * - Tier 2: themed domain groupings
 * - Tier 3: similar visual silhouettes and palette accents
 * - Tier 4: subtle distinctions, architectural arches, sports gear, flags testing extreme spatial & visual memory
 */
export function generateFreshLevelCards(levelNum: number): MemoryCard[] {
  const config = getLevelConfig(levelNum);
  const neededPairs = config.pairsCount;

  let pool = [...CARD_SYMBOLS];

  if (config.visualSimilarityTier === 1) {
    const categories: Array<typeof CARD_SYMBOLS[number]['category']> = [
      'fruit',
      'landmarks',
      'people',
      'football',
      'musicians',
      'flags',
      'nature',
      'vehicles',
      'technology',
      'sports',
      'ethiopia',
    ];
    const curated: typeof CARD_SYMBOLS = [];
    categories.forEach((cat) => {
      const items = pool.filter((s) => s.category === cat);
      if (items.length > 0) {
        curated.push(items[Math.floor(Math.random() * items.length)]);
      }
    });
    const remainder = pool.filter((s) => !curated.includes(s)).sort(() => Math.random() - 0.5);
    pool = [...curated, ...remainder];
  } else if (config.visualSimilarityTier === 2) {
    const focusCategories = ['sports', 'football', 'vehicles', 'musicians', 'nature', 'fruit'];
    const focusGroup = pool.filter((s) => focusCategories.includes(s.category)).sort(() => Math.random() - 0.5);
    const otherGroup = pool.filter((s) => !focusCategories.includes(s.category)).sort(() => Math.random() - 0.5);
    pool = [...focusGroup, ...otherGroup];
  } else if (config.visualSimilarityTier === 3) {
    const techArchCategories = ['landmarks', 'technology', 'ethiopia', 'flags', 'people'];
    const focusGroup = pool.filter((s) => techArchCategories.includes(s.category)).sort(() => Math.random() - 0.5);
    const otherGroup = pool.filter((s) => !techArchCategories.includes(s.category)).sort(() => Math.random() - 0.5);
    pool = [...focusGroup, ...otherGroup];
  } else {
    // Tier 4: Complete pool shuffled with high spatial density
    pool.sort(() => Math.random() - 0.5);
  }

  // Take exact pairs needed
  const selectedSymbols = pool.slice(0, neededPairs);
  const symLookup = new Map(selectedSymbols.map((s) => [s.id, s]));

  // Build pairs
  const rawCards: Array<{ symbolId: string; pairId: string }> = [];
  selectedSymbols.forEach((sym) => {
    rawCards.push({ symbolId: sym.id, pairId: sym.id });
    rawCards.push({ symbolId: sym.id, pairId: sym.id });
  });

  // Fisher-Yates shuffle
  for (let i = rawCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rawCards[i], rawCards[j]] = [rawCards[j], rawCards[i]];
  }

  const { cols } = config;
  const cards: MemoryCard[] = rawCards.map((item, idx) => {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const uniqueId = `mc-${levelNum}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
    const sym = symLookup.get(item.symbolId);

    return {
      id: uniqueId,
      pairId: item.pairId,
      symbolId: item.symbolId,
      imageUrl: sym?.imageUrl,
      name: sym?.name,
      index: idx,
      row,
      col,
      isFlipped: false,
      isMatched: false,
      isError: false,
      isJustMatched: false,
    };
  });

  return cards;
}
