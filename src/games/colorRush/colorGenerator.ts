/**
 * Color Rush - Progressive Color Challenge Generator
 * Generates calibrated target colors and chromatic distractor options.
 */

import { ColorItem, LevelConfig } from './types';

// Convert HSL (0-360, 0-100, 0-100) to standard Hex string
export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// 12 Vivid Palette Anchors for rich chromatic target variety
export const COLOR_PALETTES = [
  { name: 'Crimson Red', hueRange: [345, 15] },
  { name: 'Solar Orange', hueRange: [24, 45] },
  { name: 'Amber Gold', hueRange: [48, 65] },
  { name: 'Lime Electric', hueRange: [75, 105] },
  { name: 'Emerald Green', hueRange: [125, 155] },
  { name: 'Mint Jade', hueRange: [156, 172] },
  { name: 'Cyan Aqua', hueRange: [175, 198] },
  { name: 'Cobalt Blue', hueRange: [210, 238] },
  { name: 'Royal Violet', hueRange: [255, 280] },
  { name: 'Neon Purple', hueRange: [281, 304] },
  { name: 'Neon Magenta', hueRange: [305, 335] },
  { name: 'Hot Coral', hueRange: [336, 344] },
];

/**
 * Generates a challenge for a specific level and round
 */
export function generateLevelChallenge(levelConfig: LevelConfig, currentRound: number): {
  target: ColorItem;
  options: ColorItem[];
  timeLimitMs: number;
} {
  // 1. Pick a vibrant base palette
  const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
  const [minH, maxH] = palette.hueRange;
  const baseHue = minH > maxH 
    ? (Math.random() > 0.5 ? Math.floor(Math.random() * (360 - minH) + minH) : Math.floor(Math.random() * maxH))
    : Math.floor(Math.random() * (maxH - minH) + minH);

  const baseSat = Math.floor(Math.random() * 15 + 82); // 82% - 97% vivid saturation
  const baseLight = Math.floor(Math.random() * 14 + 44); // 44% - 58% lightness

  const targetHex = hslToHex(baseHue, baseSat, baseLight);
  const target: ColorItem = {
    id: `target_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    hex: targetHex,
    name: palette.name,
    hsl: [baseHue, baseSat, baseLight],
    isCorrect: true,
  };

  // 2. Compute dynamic round tightness
  // Later rounds in a level are slightly faster and have slightly tighter hue variance
  const roundProgress = (currentRound - 1) / Math.max(1, levelConfig.rounds - 1);
  const timeLimitMs = Math.max(650, Math.round(levelConfig.timeLimitMs * (1 - roundProgress * 0.15)));

  const hueMin = Math.max(3, Math.round(levelConfig.hueDeltaRange[0] * (1 - roundProgress * 0.2)));
  const hueMax = Math.max(hueMin + 2, Math.round(levelConfig.hueDeltaRange[1] * (1 - roundProgress * 0.15)));
  const lightMin = Math.max(1, Math.round(levelConfig.lightDeltaRange[0] * (1 - roundProgress * 0.2)));
  const lightMax = Math.max(lightMin + 1, Math.round(levelConfig.lightDeltaRange[1] * (1 - roundProgress * 0.15)));

  const optionCount = levelConfig.optionCount;

  // 3. Generate distractors
  const distractors: ColorItem[] = [];
  const usedOffsets = new Set<string>();

  for (let i = 0; i < optionCount - 1; i++) {
    const signH = (i % 2 === 0 ? 1 : -1) * (Math.random() > 0.4 ? 1 : -1);
    const signL = (i % 2 === 1 ? 1 : -1);

    const hOffset = Math.floor(Math.random() * (hueMax - hueMin) + hueMin) * signH;
    const lOffset = Math.floor(Math.random() * (lightMax - lightMin) + lightMin) * signL;

    let distractorHue = (baseHue + hOffset + 360) % 360;
    const offsetKey = `${Math.sign(hOffset)}_${Math.round(Math.abs(hOffset) / 5)}_${Math.sign(lOffset)}`;

    if (usedOffsets.has(offsetKey)) {
      distractorHue = (baseHue + hOffset * 1.25 + (i + 1) * 11 + 360) % 360;
    } else {
      usedOffsets.add(offsetKey);
    }

    const distractorLight = Math.max(22, Math.min(78, baseLight + lOffset));
    const distractorSat = Math.max(65, Math.min(100, baseSat + (Math.random() * 8 - 4)));

    const distHex = hslToHex(distractorHue, distractorSat, distractorLight);

    distractors.push({
      id: `dist_${i}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      hex: distHex,
      hsl: [distractorHue, distractorSat, distractorLight],
      isCorrect: false,
    });
  }

  // 4. Combine and shuffle options
  const correctOption: ColorItem = {
    ...target,
    id: `correct_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };

  const allOptions = [correctOption, ...distractors];
  for (let i = allOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
  }

  return {
    target,
    options: allOptions,
    timeLimitMs,
  };
}

/**
 * Backward compatibility generator
 */
export function generateProgressiveChallenge(round: number): {
  target: ColorItem;
  options: ColorItem[];
  timeLimitMs: number;
} {
  const pseudoConfig: LevelConfig = {
    level: Math.min(40, round * 4),
    title: `Round ${round}`,
    difficulty: round <= 3 ? 'Beginner' : round <= 6 ? 'Intermediate' : round <= 8 ? 'Advanced' : 'Expert',
    rounds: 10,
    optionCount: round <= 4 ? 4 : 6,
    timeLimitMs: Math.max(1000, 2600 - round * 150),
    hueDeltaRange: round <= 3 ? [25, 40] : round <= 6 ? [15, 25] : [7, 14],
    lightDeltaRange: round <= 3 ? [12, 18] : round <= 6 ? [7, 12] : [3, 7],
    difficultyBonus: 20,
    perfectBonus: 50,
    minAccuracyToPass: 60,
  };

  return generateLevelChallenge(pseudoConfig, round);
}
