/**
 * Color Rush - Daily Challenge Engine
 * Generates a unique daily competitive challenge seeded by the current calendar date.
 */

import { DailyChallengeConfig, LevelConfig } from './types';

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getDailyChallengeConfig(dateStr: string = getTodayDateString()): DailyChallengeConfig {
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) % 100000;
  }

  const themes = [
    { title: 'Chroma Blitz', desc: '12 rounds of lightning-fast primary and secondary clashes.' },
    { title: 'Neon Overdrive', desc: 'Accelerated countdown with high-contrast electric hues.' },
    { title: 'Spectral Mirage', desc: 'Subtle chromatic shifts demanding razor-sharp eyesight.' },
    { title: 'Prism Overload', desc: '9-color matrix challenge with micro-hue variances.' },
    { title: 'Sonic Hues', desc: 'Pure speed test: Under 1.2s per round with bonus points.' },
  ];

  const theme = themes[seed % themes.length];
  const optionCount = (seed % 2 === 0 ? 6 : 8) as 6 | 8;
  const timeLimitMs = 1500 - (seed % 4) * 100; // 1200ms - 1500ms

  return {
    date: dateStr,
    title: theme.title,
    description: theme.desc,
    rounds: 12,
    optionCount,
    timeLimitMs,
    hueDeltaRange: [10, 18],
    multiplier: 1.5,
  };
}

export function getDailyChallengeAsLevelConfig(daily: DailyChallengeConfig): LevelConfig {
  return {
    level: 999, // Special Daily ID
    title: `Daily: ${daily.title}`,
    difficulty: 'Master',
    rounds: daily.rounds,
    optionCount: daily.optionCount,
    timeLimitMs: daily.timeLimitMs,
    hueDeltaRange: daily.hueDeltaRange,
    lightDeltaRange: [4, 8],
    difficultyBonus: 100,
    perfectBonus: 150,
    minAccuracyToPass: 70,
  };
}
