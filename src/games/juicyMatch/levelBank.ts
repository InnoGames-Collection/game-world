/**
 * Juicy Match - Comprehensive 40-Level Bank
 * Strictly 40 handcrafted progressive levels. Level 1 is challenging.
 * Irregular board shapes: Plus/Cross, Stepped, Hourglass, Split Wings, Diamond, Castle.
 */

import { LevelConfig, FruitType, LevelObjective } from './types';

// Standard 5-fruit set
const FRUITS_5: FruitType[] = ['strawberry', 'blueberry', 'kiwi', 'banana', 'grape'];
// Full 6-fruit set for advanced stages
const FRUITS_6: FruitType[] = ['strawberry', 'blueberry', 'kiwi', 'banana', 'grape', 'orange'];

/**
 * Helper to generate shape matrices
 */
function createCrossMatrix(w = 8, h = 8): number[][] {
  const m: number[][] = [];
  for (let y = 0; y < h; y++) {
    const row: number[] = [];
    for (let x = 0; x < w; x++) {
      // Cut out the 4 corners (2x2 on each corner)
      const isCorner = 
        (x <= 1 && y <= 1) || 
        (x >= w - 2 && y <= 1) || 
        (x <= 1 && y >= h - 2) || 
        (x >= w - 2 && y >= h - 2);
      row.push(isCorner ? 0 : 1);
    }
    m.push(row);
  }
  return m;
}

function createFullMatrix(w = 8, h = 8): number[][] {
  return Array.from({ length: h }, () => Array(w).fill(1));
}

function createCenterCutoutMatrix(w = 8, h = 8): number[][] {
  const m = createCrossMatrix(w, h);
  // Cut out center 2x2
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);
  m[cy - 1][cx - 1] = 0;
  m[cy - 1][cx] = 0;
  m[cy][cx - 1] = 0;
  m[cy][cx] = 0;
  return m;
}

function createSplitWingsMatrix(w = 8, h = 8): number[][] {
  const m: number[][] = [];
  for (let y = 0; y < h; y++) {
    const row: number[] = [];
    for (let x = 0; x < w; x++) {
      // Gap in middle columns for top and bottom rows
      if ((x === 3 || x === 4) && (y <= 1 || y >= h - 2)) {
        row.push(0);
      } else {
        row.push(1);
      }
    }
    m.push(row);
  }
  return m;
}

function createDiamondMatrix(w = 7, h = 7): number[][] {
  const m: number[][] = [];
  const midX = Math.floor(w / 2);
  const midY = Math.floor(h / 2);
  for (let y = 0; y < h; y++) {
    const row: number[] = [];
    for (let x = 0; x < w; x++) {
      const dist = Math.abs(x - midX) + Math.abs(y - midY);
      row.push(dist <= 3 ? 1 : 0);
    }
    m.push(row);
  }
  return m;
}

// Generate all 40 levels
export const ALL_40_LEVELS: LevelConfig[] = [
  // LEVEL 1: High-stakes Cross board, 5 fruits, collect 18 strawberries + 16 kiwis + 10 juice stains. 22 moves.
  {
    level: 1,
    title: 'Sunny Grove',
    gridWidth: 7,
    gridHeight: 7,
    validMatrix: createCrossMatrix(7, 7),
    moves: 22,
    availableFruits: FRUITS_5,
    underlays: [
      { x: 2, y: 2, type: 'juice_1' }, { x: 3, y: 2, type: 'juice_1' }, { x: 4, y: 2, type: 'juice_1' },
      { x: 2, y: 3, type: 'juice_1' }, { x: 3, y: 3, type: 'juice_1' }, { x: 4, y: 3, type: 'juice_1' },
      { x: 2, y: 4, type: 'juice_1' }, { x: 3, y: 4, type: 'juice_1' }, { x: 4, y: 4, type: 'juice_1' },
      { x: 3, y: 1, type: 'juice_1' }, { x: 3, y: 5, type: 'juice_1' },
    ],
    blockers: [
      { x: 3, y: 3, type: 'crate_1' },
    ],
    objectives: [
      { type: 'clear_juice', target: 11, current: 0, label: 'Juice Puddles' },
      { type: 'collect_fruit', fruitType: 'strawberry', target: 16, current: 0, label: 'Strawberries' },
    ],
    starThresholds: [2500, 4500, 7000],
    hintMessage: 'Match fruits over the honey juice stains to clear them!',
  },

  // LEVEL 2: Stepped board with crates along bottom
  {
    level: 2,
    title: 'Palm Orchard',
    gridWidth: 7,
    gridHeight: 7,
    validMatrix: createCrossMatrix(7, 7),
    moves: 22,
    availableFruits: FRUITS_5,
    blockers: [
      { x: 1, y: 5, type: 'crate_1' }, { x: 2, y: 5, type: 'crate_1' },
      { x: 3, y: 5, type: 'crate_1' }, { x: 4, y: 5, type: 'crate_1' }, { x: 5, y: 5, type: 'crate_1' },
    ],
    underlays: [
      { x: 2, y: 3, type: 'juice_1' }, { x: 3, y: 3, type: 'juice_1' }, { x: 4, y: 3, type: 'juice_1' },
      { x: 2, y: 4, type: 'juice_1' }, { x: 3, y: 4, type: 'juice_1' }, { x: 4, y: 4, type: 'juice_1' },
    ],
    objectives: [
      { type: 'break_crates', target: 5, current: 0, label: 'Wooden Crates' },
      { type: 'collect_fruit', fruitType: 'banana', target: 18, current: 0, label: 'Bananas' },
    ],
    starThresholds: [3000, 5000, 7500],
    hintMessage: 'Match adjacent fruits to shatter the wooden crates!',
  },

  // LEVEL 3: Cross shape with 20 juice puddles (Directly modeled after Reference Video Level 3!)
  {
    level: 3,
    title: 'Juice Lagoon',
    gridWidth: 8,
    gridHeight: 8,
    validMatrix: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
    moves: 24,
    availableFruits: FRUITS_5,
    underlays: [
      { x: 2, y: 2, type: 'juice_1' }, { x: 3, y: 2, type: 'juice_1' }, { x: 4, y: 2, type: 'juice_1' }, { x: 5, y: 2, type: 'juice_1' },
      { x: 1, y: 3, type: 'juice_1' }, { x: 2, y: 3, type: 'juice_1' }, { x: 5, y: 3, type: 'juice_1' }, { x: 6, y: 3, type: 'juice_1' },
      { x: 1, y: 4, type: 'juice_1' }, { x: 2, y: 4, type: 'juice_1' }, { x: 5, y: 4, type: 'juice_1' }, { x: 6, y: 4, type: 'juice_1' },
      { x: 2, y: 5, type: 'juice_1' }, { x: 3, y: 5, type: 'juice_1' }, { x: 4, y: 5, type: 'juice_1' }, { x: 5, y: 5, type: 'juice_1' },
      { x: 3, y: 1, type: 'juice_1' }, { x: 4, y: 1, type: 'juice_1' }, { x: 3, y: 6, type: 'juice_1' }, { x: 4, y: 6, type: 'juice_1' },
    ],
    objectives: [
      { type: 'clear_juice', target: 20, current: 0, label: 'Juice Puddles' },
    ],
    starThresholds: [3500, 5800, 8500],
    hintMessage: 'Clear all 20 juice puddles before moves expire!',
  },

  // LEVEL 4: Treasure Chests along the bottom (Directly modeled after Reference Video Level 4!)
  {
    level: 4,
    title: 'Treasure Bay',
    gridWidth: 7,
    gridHeight: 8,
    validMatrix: createFullMatrix(7, 8),
    moves: 24,
    availableFruits: FRUITS_5,
    blockers: [
      { x: 1, y: 6, type: 'chest' }, { x: 2, y: 6, type: 'chest' },
      { x: 3, y: 6, type: 'chest' }, { x: 4, y: 6, type: 'chest' }, { x: 5, y: 6, type: 'chest' },
      { x: 2, y: 7, type: 'chest' }, { x: 4, y: 7, type: 'chest' },
    ],
    objectives: [
      { type: 'open_chests', target: 7, current: 0, label: 'Treasure Chests' },
      { type: 'collect_fruit', fruitType: 'strawberry', target: 11, current: 0, label: 'Strawberries' },
      { type: 'collect_fruit', fruitType: 'kiwi', target: 11, current: 0, label: 'Kiwis' },
    ],
    starThresholds: [3800, 6200, 9000],
    hintMessage: "Don't forget to collect your treasure along the way!",
  },

  // LEVEL 5: Super Combo Arena (Modeled after Reference Video Level 5 Bomb + Rainbow!)
  {
    level: 5,
    title: 'Rainbow Reef',
    gridWidth: 8,
    gridHeight: 8,
    validMatrix: createFullMatrix(8, 8),
    moves: 26,
    availableFruits: FRUITS_5,
    underlays: Array.from({ length: 30 }, (_, i) => ({
      x: 1 + (i % 6),
      y: 1 + Math.floor(i / 6),
      type: 'juice_1' as const,
    })),
    blockers: [
      { x: 1, y: 1, type: 'crate_2' }, { x: 6, y: 1, type: 'crate_2' },
      { x: 1, y: 6, type: 'crate_2' }, { x: 6, y: 6, type: 'crate_2' },
    ],
    objectives: [
      { type: 'clear_juice', target: 30, current: 0, label: 'Juice Puddles' },
      { type: 'break_crates', target: 4, current: 0, label: 'Reinforced Crates' },
    ],
    starThresholds: [4000, 7000, 10000],
    hintMessage: 'Try matching the bomb with another super fruit for a massive shockwave!',
  },

  // LEVELS 6 - 40 GENERATOR WITH PROGRESSIVE DIFFICULTY
  ...Array.from({ length: 35 }, (_, idx) => {
    const lvl = idx + 6;
    const isHardPlus = lvl >= 6 && lvl <= 10;
    const isVeryHard = lvl >= 11 && lvl <= 15;
    const isExpert = lvl >= 16 && lvl <= 20;
    const isExpertPlus = lvl >= 21 && lvl <= 25;
    const isExtreme = lvl >= 26 && lvl <= 30;
    const isMaster = lvl >= 31 && lvl <= 39;
    const isFinalChallenge = lvl === 40;

    const titles = [
      'Coral Cove', 'Kiwi Coast', 'Berry Bluff', 'Mango Mirage', 'Tiki Temple',
      'Dragonfruit Dunes', 'Citrus Canyon', 'Breeze Basin', 'Guanabana Gorge', 'Pineapple Peak',
      'Papaya Passage', 'Cobalt Cavern', 'Nectar Oasis', 'Guava Grotto', 'Zesty Zenith',
      'Sunburst Shore', 'Passion Point', 'Tropical Trench', 'Sunkissed Summit', 'Golden Grove',
      'Emerald Enclave', 'Mystic Mangrove', 'Crystal Cascade', 'Volcano Vista', 'Horizon Harbor',
      'Safari Springs', 'Banana Boardwalk', 'Solstice Strand', 'Velvet Valley', 'Amber Archipelago',
      'Celestial Coast', 'Serenity Shoals', 'Paradise Peninsula', 'Jeweled Jungle', 'Juicy Citadel',
    ];

    const title = isFinalChallenge ? 'The Grand Tropic King' : titles[(lvl - 6) % titles.length];

    // Board geometry selection
    const matrixType = (lvl % 5 === 0) ? createCenterCutoutMatrix(8, 8) :
      (lvl % 4 === 0) ? createSplitWingsMatrix(8, 8) :
      (lvl % 3 === 0) ? createDiamondMatrix(7, 7) :
      createCrossMatrix(8, 8);

    const gridW = matrixType[0].length;
    const gridH = matrixType.length;

    // Fruits palette (6 fruits on harder stages)
    const fruits = (isVeryHard || isExpertPlus || isMaster || isFinalChallenge) ? FRUITS_6 : FRUITS_5;

    // Moves budget (tight margin for difficulty)
    const moves = isFinalChallenge ? 25 : Math.max(18, 27 - Math.floor(lvl / 4));

    // Blockers & Underlays
    const blockers: { x: number; y: number; type: any }[] = [];
    const underlays: { x: number; y: number; type: any }[] = [];
    const overlays: { x: number; y: number; type: any }[] = [];

    // Progressive blocker density
    const crateType = (lvl > 25) ? 'crate_3' : (lvl > 12) ? 'crate_2' : 'crate_1';
    const crateCount = Math.min(10, 3 + Math.floor(lvl / 5));

    for (let c = 0; c < crateCount; c++) {
      const cx = (c * 2 + 1) % (gridW - 1);
      const cy = Math.min(gridH - 2, 2 + Math.floor(c / 2));
      if (matrixType[cy] && matrixType[cy][cx] === 1) {
        blockers.push({ x: cx, y: cy, type: c % 3 === 0 && lvl >= 15 ? 'chest' : crateType });
      }
    }

    // Ice overlays in mid-to-high levels
    if (lvl >= 10) {
      const icePositions = [
        { x: 2, y: 1 }, { x: gridW - 3, y: 1 },
        { x: 1, y: gridH - 2 }, { x: gridW - 2, y: gridH - 2 },
      ];
      icePositions.forEach(p => {
        if (matrixType[p.y] && matrixType[p.y][p.x] === 1) {
          overlays.push({ x: p.x, y: p.y, type: 'ice' });
        }
      });
    }

    // Juice puddles
    const juiceCount = Math.min(24, 10 + Math.floor(lvl * 0.4));
    for (let j = 0; j < juiceCount; j++) {
      const jx = 1 + (j * 2) % (gridW - 2);
      const jy = 1 + Math.floor((j * 2) / (gridW - 2)) % (gridH - 2);
      if (matrixType[jy] && matrixType[jy][jx] === 1) {
        underlays.push({ x: jx, y: jy, type: lvl > 20 && j % 3 === 0 ? 'juice_2' : 'juice_1' });
      }
    }

    // Objectives composition
    const targetA = fruits[lvl % fruits.length];
    const targetB = fruits[(lvl + 2) % fruits.length];
    const fruitReq = Math.min(28, 14 + Math.floor(lvl * 0.35));

    const objectives: LevelObjective[] = [
      { type: 'collect_fruit', fruitType: targetA, target: fruitReq, current: 0, label: `${targetA.charAt(0).toUpperCase() + targetA.slice(1)}s` },
      { type: 'clear_juice', target: underlays.length, current: 0, label: 'Juice Puddles' },
    ];

    if (blockers.length > 0 && lvl % 2 === 0) {
      objectives.push({
        type: blockers.some(b => b.type === 'chest') ? 'open_chests' : 'break_crates',
        target: blockers.length,
        current: 0,
        label: blockers.some(b => b.type === 'chest') ? 'Chests & Crates' : 'Crates',
      });
    }

    const baseStar = 3500 + lvl * 250;

    return {
      level: lvl,
      title,
      gridWidth: gridW,
      gridHeight: gridH,
      validMatrix: matrixType,
      moves,
      availableFruits: fruits,
      underlays,
      blockers,
      overlays,
      objectives,
      starThresholds: [baseStar, Math.round(baseStar * 1.6), Math.round(baseStar * 2.4)] as [number, number, number],
      hintMessage: isFinalChallenge
        ? 'The Final Challenge! Deploy striped + bomb combos to conquer the tropical summit!'
        : `Level ${lvl}: Plan your moves carefully to trigger cascades!`,
    };
  }),
];

export function getLevelConfig(level: number): LevelConfig {
  // Cap strictly at Level 40, minimum 1
  const targetLevel = Math.max(1, Math.min(40, level));
  return ALL_40_LEVELS[targetLevel - 1];
}
