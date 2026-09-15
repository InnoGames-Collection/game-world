/**
 * KNIFE MADNESS - 40 Progressive Tournament Levels
 * Defined deterministically from Level 1 (Hard) to Level 40 (Master).
 * Includes Boss Levels at 5, 10, 15, 20, 25, 30, 35, 40,
 * diverse rotation physics, target material changes, and fruit variations.
 */

import { LevelConfig, TargetTheme, FruitType } from './types';

// Theme map matching the 40-level requirements
const LEVEL_THEMES: TargetTheme[] = [
  'wood_log',       // L1: Classic polished timber wood log
  'apple',          // L2: Red apple target
  'orange',         // L3: Orange citrus target
  'watermelon',     // L4: Striped watermelon target
  'golden_boss',    // L5: Golden Boss Target (BOSS)
  'green_apple',    // L6: Green fruit target
  'coconut',        // L7: Coconut-style target
  'pumpkin',        // L8: Pumpkin-style target
  'kiwi',           // L9: Kiwi green fruit target
  'metal_gear',     // L10: Premium boss target (BOSS)
  'cheese',         // L11: Swiss cheese
  'waffle',         // L12: Golden waffle
  'peach',          // L13: Peach fruit
  'plum',           // L14: Plum fruit
  'golden_shield',  // L15: Royal Boss Shield (BOSS)
  'tire',           // L16: Armored tire
  'basketball',     // L17: Basketball core
  'eight_ball',     // L18: Eight-ball
  'lifebuoy',       // L19: Lifebuoy ring
  'metal_gear',     // L20: Cyber Boss Cog (BOSS)
  'dragon_fruit',   // L21: Dragonfruit
  'watermelon',     // L22: Sliced crimson melon
  'orange',         // L23: Blood orange
  'kiwi',           // L24: Gold kiwi
  'golden_boss',    // L25: Imperial Sun Boss (BOSS)
  'stone_disc',     // L26: Rune stone disc
  'wood_log',       // L27: Ancient ironwood
  'coconut',        // L28: Tropical coconut
  'pumpkin',        // L29: Autumn pumpkin
  'golden_shield',  // L30: Aegis Boss Shield (BOSS)
  'metal_gear',     // L31: Clockwork core
  'tire',           // L32: Heavy spiked tire
  'apple',          // L33: Crimson honeycrisp
  'dragon_fruit',   // L34: Mythic pitaya
  'golden_boss',    // L35: Solar Boss Core (BOSS)
  'stone_disc',     // L36: Celestial rune stone
  'waffle',         // L37: Iron waffle
  'cheese',         // L38: Volcanic cheese
  'lifebuoy',       // L39: Nautical storm buoy
  'golden_boss',    // L40: Supreme Master Core (MASTER BOSS)
];

// Helper to provide alternate visual themes for same level attempt variation
function getThemeVariationsForLevel(levelNumber: number, baseTheme: TargetTheme): TargetTheme[] {
  const fruitVariations: TargetTheme[] = ['apple', 'orange', 'green_apple', 'watermelon', 'kiwi', 'coconut', 'peach'];
  const mechanicalVariations: TargetTheme[] = ['metal_gear', 'tire', 'golden_shield', 'stone_disc'];
  const foodVariations: TargetTheme[] = ['cheese', 'waffle', 'watermelon', 'pumpkin', 'apple'];

  if (fruitVariations.includes(baseTheme)) {
    return [baseTheme, ...fruitVariations.filter((t) => t !== baseTheme).slice(0, 3)];
  }
  if (mechanicalVariations.includes(baseTheme)) {
    return [baseTheme, ...mechanicalVariations.filter((t) => t !== baseTheme).slice(0, 3)];
  }
  return [baseTheme, ...foodVariations.filter((t) => t !== baseTheme).slice(0, 3)];
}

export const KNIFE_LEVELS: LevelConfig[] = Array.from({ length: 40 }, (_, idx) => {
  const levelNumber = idx + 1;
  const isBossLevel = levelNumber % 5 === 0;
  const theme = LEVEL_THEMES[idx];
  const stageNumber = Math.min(4, Math.ceil(levelNumber / 10));

  // Boss Titles
  let bossTitle: string | undefined;
  if (isBossLevel) {
    const titles: Record<number, string> = {
      5: 'STAGE 1 BOSS: THE GOLDEN HARVEST',
      10: 'STAGE 1 CLIMAX: TITANIUM COG',
      15: 'STAGE 2 BOSS: ROYAL SHIELD',
      20: 'STAGE 2 CLIMAX: CYBER OVERDRIVE',
      25: 'STAGE 3 BOSS: IMPERIAL SUN',
      30: 'STAGE 3 CLIMAX: AEGIS FORTRESS',
      35: 'STAGE 4 BOSS: SOLAR CRUCIBLE',
      40: 'MASTER FINALE: SUPREME HORIZON',
    };
    bossTitle = titles[levelNumber] || `STAGE ${stageNumber} BOSS`;
  }

  // Fruit types palette
  const fruitPalette: FruitType[] = [
    'apple',
    'orange',
    'lemon',
    'watermelon',
    'kiwi',
    'strawberry',
    'peach',
    'coconut',
    'cherry',
    'plum',
  ];

  // =========================================================================
  // TIER 1: HARD (Levels 1 to 5) - Level 1 is NOT a tutorial, it is already HARD!
  // =========================================================================
  if (levelNumber <= 5) {
    const requiredKnives = isBossLevel ? 9 : 7 + (levelNumber % 2); // 7 to 9 knives
    const preCount = levelNumber === 1 ? 2 : isBossLevel ? 3 : 2 + (levelNumber % 2);

    const preEmbeddedKnives = [];
    for (let i = 0; i < preCount; i++) {
      preEmbeddedKnives.push({
        angle: (i * (2 * Math.PI / preCount)) + (0.32 * (i + 1)),
        type: (i % 2 === 0 ? 'standard' : 'bone') as 'standard' | 'bone',
      });
    }

    const appleCount = isBossLevel ? 3 : 1 + (levelNumber % 3);
    const apples: { angle: number; type: FruitType }[] = [];
    for (let i = 0; i < appleCount; i++) {
      apples.push({
        angle: (i * 1.7) + 0.85,
        type: fruitPalette[i % fruitPalette.length],
      });
    }

    return {
      levelNumber,
      stageNumber: 1,
      stageName: isBossLevel ? (bossTitle || 'BOSS STAGE') : 'STAGE 1: TIMBER & ORCHARD',
      theme,
      isBossLevel,
      isBoss: isBossLevel,
      bossTitle,
      requiredKnives,
      preEmbeddedKnives,
      apples,
      baseSpeed: 2.1 + levelNumber * 0.18,
      speedPattern: levelNumber === 1 ? 'variable' : isBossLevel ? 'pulsing' : levelNumber % 2 === 0 ? 'reverse' : 'variable',
      patternParams: {
        speedMin: 1.2,
        speedMax: 3.2,
        period: 3.8 - levelNumber * 0.15,
        pauseChance: 0.18,
        reverseChance: levelNumber > 1 ? 0.35 : 0.1,
      },
      hitToleranceDegrees: 15.2 - levelNumber * 0.25,
      themeVariations: getThemeVariationsForLevel(levelNumber, theme),
    };
  }

  // =========================================================================
  // TIER 2: VERY HARD (Levels 6 to 10)
  // =========================================================================
  if (levelNumber <= 10) {
    const requiredKnives = isBossLevel ? 11 : 8 + (levelNumber - 5); // 9 to 11 knives
    const preCount = isBossLevel ? 4 : 2 + (levelNumber % 3);

    const preEmbeddedKnives = [];
    for (let i = 0; i < preCount; i++) {
      preEmbeddedKnives.push({
        angle: (i * (2 * Math.PI / preCount)) + 0.42,
        type: (i % 2 === 0 ? 'dagger' : 'standard') as 'dagger' | 'standard',
      });
    }

    const apples: { angle: number; type: FruitType }[] = [
      { angle: 1.1, type: fruitPalette[(levelNumber * 2) % fruitPalette.length] },
      { angle: 3.3, type: fruitPalette[(levelNumber * 2 + 1) % fruitPalette.length] },
      ...(isBossLevel ? [{ angle: 5.2, type: 'strawberry' as FruitType }] : []),
    ];

    return {
      levelNumber,
      stageNumber: 1,
      stageName: isBossLevel ? (bossTitle || 'BOSS STAGE') : 'STAGE 1: HARDWOOD & METAL',
      theme,
      isBossLevel,
      isBoss: isBossLevel,
      bossTitle,
      requiredKnives,
      preEmbeddedKnives,
      apples,
      baseSpeed: 2.8 + (levelNumber - 5) * 0.22,
      speedPattern: isBossLevel ? 'jerky' : levelNumber % 2 === 0 ? 'reverse' : 'pulsing',
      patternParams: {
        speedMin: 0.8,
        speedMax: 4.2,
        period: 3.0,
        reverseChance: 0.45,
        pauseChance: 0.25,
        jerkFrequency: 1.8,
      },
      hitToleranceDegrees: 13.8 - (levelNumber - 5) * 0.2,
      themeVariations: getThemeVariationsForLevel(levelNumber, theme),
    };
  }

  // =========================================================================
  // TIER 3: EXPERT (Levels 11 to 20)
  // =========================================================================
  if (levelNumber <= 20) {
    const requiredKnives = isBossLevel ? 12 : 9 + ((levelNumber - 10) % 3); // 9 to 12
    const preCount = isBossLevel ? 5 : 3 + ((levelNumber - 10) % 3); // 3 to 5 pre-embedded

    const preEmbeddedKnives = [];
    for (let i = 0; i < preCount; i++) {
      preEmbeddedKnives.push({
        angle: (i * (2 * Math.PI / preCount)) + (levelNumber * 0.22),
        type: (i % 3 === 0 ? 'bone' : i % 3 === 1 ? 'dagger' : 'standard') as 'bone' | 'dagger' | 'standard',
      });
    }

    const apples: { angle: number; type: FruitType }[] = [
      { angle: 0.8, type: fruitPalette[(levelNumber) % fruitPalette.length] },
      { angle: 2.7, type: fruitPalette[(levelNumber + 3) % fruitPalette.length] },
      { angle: 4.6, type: fruitPalette[(levelNumber + 6) % fruitPalette.length] },
    ];

    return {
      levelNumber,
      stageNumber: 2,
      stageName: isBossLevel ? (bossTitle || 'EXPERT BOSS') : 'STAGE 2: FEAST & ALLOY',
      theme,
      isBossLevel,
      isBoss: isBossLevel,
      bossTitle,
      requiredKnives,
      preEmbeddedKnives,
      apples,
      baseSpeed: 3.5 + (levelNumber - 10) * 0.16,
      speedPattern: isBossLevel ? 'extreme_oscillation' : levelNumber % 3 === 0 ? 'jerky' : 'reverse',
      patternParams: {
        speedMin: 1.2,
        speedMax: 4.8,
        period: 2.6,
        reverseChance: 0.55,
        pauseChance: 0.3,
        jerkFrequency: 2.2,
      },
      hitToleranceDegrees: 12.8 - ((levelNumber - 10) * 0.1),
      themeVariations: getThemeVariationsForLevel(levelNumber, theme),
    };
  }

  // =========================================================================
  // TIER 4: EXPERT+ (Levels 21 to 30)
  // =========================================================================
  if (levelNumber <= 30) {
    const requiredKnives = isBossLevel ? 13 : 10 + ((levelNumber - 20) % 3); // 10 to 13
    const preCount = isBossLevel ? 5 : 4 + ((levelNumber - 20) % 3); // 4 to 6 pre-embedded

    const preEmbeddedKnives = [];
    for (let i = 0; i < preCount; i++) {
      preEmbeddedKnives.push({
        angle: (i * (2 * Math.PI / preCount)) + 0.38,
        type: (i % 2 === 0 ? 'pin' : 'dagger') as 'pin' | 'dagger',
      });
    }

    const apples: { angle: number; type: FruitType }[] = [
      { angle: 1.3, type: fruitPalette[(levelNumber * 3) % fruitPalette.length] },
      { angle: 3.9, type: fruitPalette[(levelNumber * 3 + 1) % fruitPalette.length] },
      ...(isBossLevel ? [{ angle: 5.4, type: 'dragon_fruit' as any }] : []),
    ];

    return {
      levelNumber,
      stageNumber: 3,
      stageName: isBossLevel ? (bossTitle || 'TITAN BOSS') : 'STAGE 3: HEAVY ARMOR',
      theme,
      isBossLevel,
      isBoss: isBossLevel,
      bossTitle,
      requiredKnives,
      preEmbeddedKnives,
      apples,
      baseSpeed: 4.2 + (levelNumber - 20) * 0.14,
      speedPattern: 'extreme_oscillation',
      patternParams: {
        speedMin: 1.4,
        speedMax: 5.4,
        period: 2.0,
        reverseChance: 0.65,
        pauseChance: 0.35,
        jerkFrequency: 2.6,
      },
      hitToleranceDegrees: 11.9 - ((levelNumber - 20) * 0.08),
      themeVariations: getThemeVariationsForLevel(levelNumber, theme),
    };
  }

  // =========================================================================
  // TIER 5: EXTREME & MASTER (Levels 31 to 40)
  // =========================================================================
  const isMasterFinal = levelNumber === 40;
  const requiredKnives = isMasterFinal ? 14 : isBossLevel ? 13 : 11 + ((levelNumber - 30) % 3);
  const preCount = isMasterFinal ? 6 : isBossLevel ? 5 : 4 + ((levelNumber - 30) % 2);

  const preEmbeddedKnives = [];
  for (let i = 0; i < preCount; i++) {
    preEmbeddedKnives.push({
      angle: (i * (2 * Math.PI / preCount)) + 0.24,
      type: (i % 2 === 0 ? 'dagger' : 'pin') as 'dagger' | 'pin',
    });
  }

  const apples: { angle: number; type: FruitType }[] = [
    { angle: 1.2, type: fruitPalette[(levelNumber) % fruitPalette.length] },
    { angle: 3.1, type: fruitPalette[(levelNumber + 2) % fruitPalette.length] },
    { angle: 5.0, type: fruitPalette[(levelNumber + 4) % fruitPalette.length] },
  ];

  return {
    levelNumber,
    stageNumber: 4,
    stageName: isMasterFinal ? 'STAGE 4: SUPREME MASTER FINALE' : isBossLevel ? (bossTitle || 'MYTHIC BOSS') : 'STAGE 4: MYTHIC CORES',
    theme,
    isBossLevel,
    isBoss: isBossLevel,
    bossTitle,
    requiredKnives,
    preEmbeddedKnives,
    apples,
    baseSpeed: 4.9 + (levelNumber - 30) * 0.12,
    speedPattern: 'extreme_oscillation',
    patternParams: {
      speedMin: 1.8,
      speedMax: 6.0,
      period: 1.7,
      reverseChance: 0.7,
      pauseChance: 0.4,
      jerkFrequency: 3.0,
    },
    hitToleranceDegrees: 11.2 - ((levelNumber - 30) * 0.05),
    themeVariations: getThemeVariationsForLevel(levelNumber, theme),
  };
});

export const KNIFE_MADNESS_LEVELS = KNIFE_LEVELS;

export interface StageGroup {
  stage: number;
  name: string;
  desc: string;
  description: string;
  themeLabel: string;
  bossLevel: number;
  startLevel: number;
  endLevel: number;
  themeColor: string;
}

export const STAGE_GROUPS: StageGroup[] = [
  {
    stage: 1,
    name: 'STAGE 1: HARDWOOD & ORCHARD',
    desc: 'Levels 1 - 10 • Fast Rotations & Orchard Targets',
    description: 'Fast Rotations & Orchard Targets with Titanium Boss',
    themeLabel: 'TIMBER & FRUIT',
    bossLevel: 10,
    startLevel: 1,
    endLevel: 10,
    themeColor: 'from-amber-600 to-amber-800',
  },
  {
    stage: 2,
    name: 'STAGE 2: HEAVY METAL & GEARS',
    desc: 'Levels 11 - 20 • Reversal Oscillations & Iron Bosses',
    description: 'Reversal Oscillations & Armored Boss Cogs',
    themeLabel: 'METAL & GEARS',
    bossLevel: 20,
    startLevel: 11,
    endLevel: 20,
    themeColor: 'from-blue-600 to-slate-800',
  },
  {
    stage: 3,
    name: 'STAGE 3: IMPERIAL ARMORY',
    desc: 'Levels 21 - 30 • Sudden Braking & Shield Cores',
    description: 'Sudden Braking & Imperial Shield Fortresses',
    themeLabel: 'IMPERIAL SHIELDS',
    bossLevel: 30,
    startLevel: 21,
    endLevel: 30,
    themeColor: 'from-purple-600 to-slate-900',
  },
  {
    stage: 4,
    name: 'STAGE 4: MYTHIC HORIZON',
    desc: 'Levels 31 - 40 • Jerk Acceleration & Supreme Finale',
    description: 'Jerk Acceleration & 40-Stage Supreme Finale',
    themeLabel: 'MYTHIC CORES',
    bossLevel: 40,
    startLevel: 31,
    endLevel: 40,
    themeColor: 'from-rose-600 to-amber-950',
  },
];
