import { LevelConfig, FruitType } from './types';

const ALL_FRUITS: FruitType[] = [
  'watermelon',
  'apple',
  'orange',
  'lemon',
  'lime',
  'banana',
  'peach',
  'pear',
  'pineapple',
  'coconut',
  'strawberry',
  'kiwi',
  'mango',
  'dragonfruit',
  'pomegranate',
];

export const FRUIT_LEVELS: LevelConfig[] = Array.from({ length: 40 }, (_, idx) => {
  const lvl = idx + 1;

  // Quota progression:
  // Level 1 starts with 16 fruits (requires real active focus)
  // Level 40 reaches 80 fruits
  let quota: number;
  if (lvl === 1) {
    quota = 16;
  } else if (lvl <= 5) {
    quota = 16 + (lvl - 1) * 3; // 19, 22, 25, 28
  } else if (lvl <= 10) {
    quota = 28 + (lvl - 5) * 2; // 30 to 38
  } else if (lvl <= 20) {
    quota = 38 + (lvl - 10) * 2; // 40 to 58
  } else if (lvl <= 30) {
    quota = 58 + Math.round((lvl - 20) * 1.5); // 60 to 73
  } else {
    quota = Math.min(85, 73 + (lvl - 30)); // 74 to 83
  }

  // Simultaneous launches:
  // Level 1: 2 to 3
  // Level 2-5: 2 to 4
  // Level 6-10: 3 to 4
  // Level 11-20: 3 to 5
  // Level 21-30: 4 to 6
  // Level 31-40: 4 to 7
  let simultaneousMin = 2;
  let simultaneousMax = 3;
  if (lvl >= 2 && lvl <= 5) {
    simultaneousMin = 2;
    simultaneousMax = 4;
  } else if (lvl >= 6 && lvl <= 10) {
    simultaneousMin = 3;
    simultaneousMax = 4;
  } else if (lvl >= 11 && lvl <= 20) {
    simultaneousMin = 3;
    simultaneousMax = 5;
  } else if (lvl >= 21 && lvl <= 30) {
    simultaneousMin = 4;
    simultaneousMax = 6;
  } else if (lvl >= 31) {
    simultaneousMin = 4;
    simultaneousMax = 7;
  }

  // Spawn intervals (ms):
  // Level 1: 1100ms - 1500ms (fast enough to require active attention, never sluggish)
  // Level 5: 900ms - 1300ms
  // Level 10: 750ms - 1050ms
  // Level 20: 600ms - 850ms
  // Level 30: 500ms - 720ms
  // Level 40: 420ms - 600ms (extreme rapid fire)
  const spawnIntervalMin = Math.max(420, Math.round(1150 - lvl * 18.5));
  const spawnIntervalMax = Math.max(600, Math.round(1550 - lvl * 24));

  // Speeds (vertical & angular impulse):
  // Level 1: 22 to 26
  // Level 10: 26 to 31
  // Level 20: 30 to 35
  // Level 30: 33 to 38
  // Level 40: 36 to 43
  const minSpeed = Math.round(22 + Math.min(15, (lvl - 1) * 0.38));
  const maxSpeed = Math.round(26 + Math.min(18, (lvl - 1) * 0.44));

  // Bomb chance:
  // Starts early at Level 3 (10%), climbing up to 38% at Level 40
  let bombChance = 0;
  if (lvl === 3) bombChance = 0.10;
  else if (lvl === 4) bombChance = 0.12;
  else if (lvl >= 5 && lvl <= 10) bombChance = 0.14 + (lvl - 5) * 0.015; // 14% to 21.5%
  else if (lvl >= 11 && lvl <= 20) bombChance = 0.22 + (lvl - 11) * 0.01; // 22% to 31%
  else if (lvl >= 21 && lvl <= 30) bombChance = 0.31 + (lvl - 21) * 0.005; // 31% to 35.5%
  else if (lvl >= 31) bombChance = Math.min(0.40, 0.36 + (lvl - 31) * 0.004); // 36% to 40%

  // Critical fruit chance (special high-score glowing fruit)
  const criticalChance = 0.07 + Math.min(0.08, lvl * 0.002);

  // Fruit varieties unlocked gradually across 40 levels
  const varietyCount = Math.min(15, 6 + Math.floor((lvl - 1) * 0.25));
  const fruitSubset = ALL_FRUITS.slice(0, varietyCount);

  let tier = 'Novice Slicer';
  if (lvl >= 6 && lvl <= 10) tier = 'Skilled Warrior';
  else if (lvl >= 11 && lvl <= 20) tier = 'Blade Master';
  else if (lvl >= 21 && lvl <= 30) tier = 'Shadow Grandmaster';
  else if (lvl >= 31 && lvl <= 39) tier = 'Katana Legend';
  else if (lvl === 40) tier = 'Supreme Fruit Master (EXTREME)';

  return {
    levelNumber: lvl,
    title: `Level ${lvl} — ${tier}`,
    description: `Slice ${quota} fruits to clear. Beware of live bombs and missed fruits!`,
    quota,
    allowedMisses: 3,
    spawnIntervalMin,
    spawnIntervalMax,
    simultaneousMin,
    simultaneousMax,
    minSpeed,
    maxSpeed,
    bombChance,
    criticalChance,
    fruitTypes: fruitSubset,
  };
});
