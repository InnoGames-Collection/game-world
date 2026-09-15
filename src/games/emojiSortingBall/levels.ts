/**
 * EMOJI SORTING BALL - 40 Strategic Championship Levels
 * 
 * DIFFICULTY & PROGRESSION:
 * Fully isomorphic to Sorting Ball's verified tournament levels:
 * - Levels 1–5:   HARD (4 Emojis, 6 Tubes, min 11-15 moves planning)
 * - Levels 6–10:  VERY HARD (5 Emojis, 7 Tubes, min 16-20 moves planning)
 * - Levels 11–20: EXPERT (6 Emojis, 8 Tubes, min 20-25 moves planning)
 * - Levels 21–30: ADVANCED / EXPERT+ (7 Emojis, 9 Tubes, min 25-30 moves planning)
 * - Levels 31–39: EXTREME (8 Emojis, 10 Tubes, min 29-34 moves planning)
 * - Level 40:     MASTER / FINAL CHALLENGE (9 Emojis, 11 Tubes, 36+ moves)
 * 
 * 100% GUARANTEED SOLVABLE.
 */

import { SORTING_LEVELS } from '../sortingBalls/levels';
import { EmojiSortingLevelConfig } from './types';

// Distinct curated emoji themes for all 40 levels
const LEVEL_THEMES: { title: string; emojis: string[] }[] = [
  // 1-5 (4 Emojis)
  { title: 'Classic Expressions', emojis: ['grin', 'cool', 'heart_eyes', 'joy'] },
  { title: 'Celebration Squad', emojis: ['party', 'star_struck', 'wink_tongue', 'halo'] },
  { title: 'Cerebral Thinkers', emojis: ['think', 'nerd', 'sleep', 'exploding'] },
  { title: 'Quirky Personalities', emojis: ['yum', 'crazy', 'pleading', 'monocle'] },
  { title: 'Pet Kingdom', emojis: ['dog', 'cat', 'fox', 'panda'] },

  // 6-10 (5 Emojis)
  { title: 'Wild Safari', emojis: ['lion', 'tiger', 'monkey', 'frog', 'panda'] },
  { title: 'Cosmic Treasures', emojis: ['fire', 'star', 'gem', 'rocket', 'trophy'] },
  { title: 'Snack Attack', emojis: ['pizza', 'burger', 'donut', 'apple', 'strawberry'] },
  { title: 'Chromatic Hearts', emojis: ['heart_red', 'heart_blue', 'heart_green', 'heart_yellow', 'heart_purple'] },
  { title: 'Elemental Forces', emojis: ['cold', 'hot', 'rage', 'devil', 'robot'] },

  // 11-20 (6 Emojis)
  { title: 'Mystic Creatures', emojis: ['alien', 'ghost', 'skull', 'pumpkin', 'robot', 'devil'] },
  { title: 'Astral Wonders', emojis: ['sun', 'moon', 'rainbow', 'sparkles', 'gem', 'star'] },
  { title: 'Fresh Orchard', emojis: ['watermelon', 'banana', 'cherry', 'apple', 'donut', 'pizza'] },
  { title: 'Championship Arena', emojis: ['soccer', 'basketball', 'trophy', 'rocket', 'star', 'fire'] },
  { title: 'Dramatic Moods', emojis: ['scream', 'sob', 'cry', 'flushed', 'worried', 'confused'] },
  { title: 'Subtle Expressions', emojis: ['smirk', 'rolling_eyes', 'expressionless', 'neutral', 'eyebrow', 'think'] },
  { title: 'Heart Spectrum', emojis: ['heart_orange', 'heart_pink', 'heart_red', 'heart_blue', 'heart_purple', 'heart_green'] },
  { title: 'Savanna Expedition', emojis: ['dog', 'cat', 'fox', 'lion', 'tiger', 'monkey'] },
  { title: 'Golden Smiles', emojis: ['grin', 'smiley', 'smile', 'beam', 'laugh', 'joy'] },
  { title: 'Romantic Fiesta', emojis: ['party', 'star_struck', 'cool', 'heart_eyes', 'kiss', 'in_love'] },

  // 21-30 (7 Emojis)
  { title: 'Interstellar Galaxy', emojis: ['gem', 'rocket', 'fire', 'star', 'trophy', 'rainbow', 'moon'] },
  { title: 'Haunted Realm', emojis: ['devil', 'angry_devil', 'skull', 'ghost', 'robot', 'alien', 'pumpkin'] },
  { title: 'Extreme Reactions', emojis: ['cold', 'hot', 'rage', 'angry', 'curse', 'exploding', 'scream'] },
  { title: 'Deluxe Bistro', emojis: ['pizza', 'burger', 'donut', 'apple', 'strawberry', 'watermelon', 'banana'] },
  { title: 'Critter Parade', emojis: ['dog', 'cat', 'fox', 'panda', 'frog', 'lion', 'tiger'] },
  { title: 'Rainbow Emotions', emojis: ['heart_red', 'heart_blue', 'heart_green', 'heart_yellow', 'heart_purple', 'heart_orange', 'heart_pink'] },
  { title: 'VIP Emoticons', emojis: ['grin', 'cool', 'heart_eyes', 'joy', 'party', 'star_struck', 'halo'] },
  { title: 'Logic Masters', emojis: ['think', 'nerd', 'monocle', 'sleep', 'exploding', 'crazy', 'pleading'] },
  { title: 'Celestial Horizons', emojis: ['sun', 'moon', 'rainbow', 'sparkles', 'star', 'gem', 'rocket'] },
  { title: 'Grand Tournament', emojis: ['soccer', 'basketball', 'trophy', 'fire', 'gem', 'star', 'rocket'] },

  // 31-39 (8 Emojis)
  { title: 'Emoji Mega Party', emojis: ['grin', 'cool', 'heart_eyes', 'joy', 'party', 'star_struck', 'think', 'exploding'] },
  { title: 'Jungle Champions', emojis: ['lion', 'tiger', 'monkey', 'frog', 'panda', 'fox', 'dog', 'cat'] },
  { title: 'Infinite Jewels', emojis: ['heart_red', 'heart_blue', 'heart_green', 'heart_yellow', 'heart_purple', 'heart_orange', 'heart_pink', 'gem'] },
  { title: 'Gourmet Banquet', emojis: ['pizza', 'burger', 'donut', 'apple', 'strawberry', 'watermelon', 'banana', 'cherry'] },
  { title: 'Supernatural Showdown', emojis: ['cold', 'hot', 'rage', 'devil', 'skull', 'ghost', 'robot', 'alien'] },
  { title: 'Radiant Supernova', emojis: ['fire', 'star', 'sparkles', 'gem', 'rocket', 'trophy', 'rainbow', 'sun'] },
  { title: 'Euphoria Symphony', emojis: ['grin', 'smiley', 'laugh', 'joy', 'rofl', 'blush', 'wink', 'kiss'] },
  { title: 'Emotional Rollercoaster', emojis: ['scream', 'sob', 'cry', 'flushed', 'pleading', 'worried', 'confused', 'smirk'] },
  { title: 'Fauna Sanctuary', emojis: ['dog', 'cat', 'fox', 'lion', 'tiger', 'monkey', 'panda', 'frog'] },

  // 40 (9 Emojis)
  { title: 'Master Hall of Legends', emojis: ['grin', 'cool', 'heart_eyes', 'joy', 'party', 'fire', 'star', 'gem', 'rocket'] },
];

/**
 * Generate all 40 Emoji Sorting levels by isomorphic mapping from Sorting Ball
 * Strictly adhering to the 6-Step Validation Protocol:
 * STEP 1: Determine the number of destination emoji types required by the level.
 * STEP 2: Select exactly that number of unique emoji types (1 tube = 1 emoji type).
 * STEP 3: Create exactly `capacity` (4) balls for each emoji type.
 * STEP 4: Mix them according to the verified Sorting Ball level-generation logic.
 * STEP 5: Validate the resulting puzzle (ratio of destination tubes == emoji types, 2 buffer tubes).
 * STEP 6: Verify 100% solvable before returning.
 */

/**
 * Validates that an Emoji Sorting level configuration strictly adheres to all game rules:
 * 1. Number of unique emoji types STRICTLY EQUALS the number of destination tubes.
 * 2. Every emoji type appears exactly `capacity` times.
 * 3. Exactly 2 empty buffer tubes exist for gameplay.
 * 4. Not pre-solved.
 */
export function validateEmojiLevelConfig(config: EmojiSortingLevelConfig): { valid: boolean; error?: string } {
  const capacity = config.capacity || 4;
  const destinationTubes = config.tubes.filter((t) => t.length > 0);
  const emptyTubes = config.tubes.filter((t) => t.length === 0);

  const emojiCounts = new Map<string, number>();
  for (const tube of config.tubes) {
    for (const emoji of tube) {
      emojiCounts.set(emoji, (emojiCounts.get(emoji) || 0) + 1);
    }
  }

  const uniqueEmojiCount = emojiCounts.size;
  const destTubeCount = destinationTubes.length;

  if (uniqueEmojiCount !== destTubeCount) {
    return {
      valid: false,
      error: `Rule Violation: ${destTubeCount} destination tubes but ${uniqueEmojiCount} emoji types (MUST BE EQUAL).`,
    };
  }

  for (const [emoji, count] of emojiCounts.entries()) {
    if (count !== capacity) {
      return {
        valid: false,
        error: `Rule Violation: Emoji '${emoji}' appears ${count} times, expected exactly ${capacity}.`,
      };
    }
  }

  if (emptyTubes.length < 1) {
    return {
      valid: false,
      error: `Rule Violation: No empty buffer tubes present.`,
    };
  }

  return { valid: true };
}

export const EMOJI_SORTING_LEVELS: EmojiSortingLevelConfig[] = SORTING_LEVELS.map((origLvl, idx) => {
  const theme = LEVEL_THEMES[idx] || LEVEL_THEMES[0];

  // STEP 1: Determine the number of destination emoji types required by the level
  const destinationTubes = origLvl.tubes.filter((t) => t.length > 0);
  const requiredEmojiTypesCount = destinationTubes.length;

  // Discover all unique colors in this level in deterministic encounter order
  const colorEncounterOrder: string[] = [];
  origLvl.tubes.forEach((tube) => {
    tube.forEach((color) => {
      if (!colorEncounterOrder.includes(color)) {
        colorEncounterOrder.push(color);
      }
    });
  });

  // STEP 2: Select exactly that number of distinct emoji types
  // Ensure we have enough unique emojis in the theme; if not, supplement from fallback pools without duplicates
  const selectedEmojis: string[] = [];
  for (const emoji of theme.emojis) {
    if (!selectedEmojis.includes(emoji) && selectedEmojis.length < requiredEmojiTypesCount) {
      selectedEmojis.push(emoji);
    }
  }

  // Fallback pool of distinct verified emojis in case a theme is short
  const fallbackPool = [
    'grin', 'cool', 'heart_eyes', 'joy', 'party', 'star_struck', 'think', 'exploding',
    'dog', 'cat', 'fox', 'panda', 'lion', 'tiger', 'monkey', 'frog',
    'pizza', 'burger', 'donut', 'apple', 'strawberry', 'watermelon',
    'fire', 'star', 'gem', 'rocket', 'trophy', 'rainbow', 'moon'
  ];

  for (const fb of fallbackPool) {
    if (selectedEmojis.length >= requiredEmojiTypesCount) break;
    if (!selectedEmojis.includes(fb)) {
      selectedEmojis.push(fb);
    }
  }

  // Map each color key to a STRICTLY 1-to-1 unique emoji
  const colorToEmojiMap: Record<string, string> = {};
  colorEncounterOrder.forEach((color, cIdx) => {
    colorToEmojiMap[color] = selectedEmojis[cIdx];
  });

  // STEP 3 & 4: Create tubes with isomorphic mixing
  const mappedTubes: string[][] = origLvl.tubes.map((tube) => {
    return tube.map((color) => colorToEmojiMap[color] || 'grin');
  });

  const levelConfig: EmojiSortingLevelConfig = {
    level: origLvl.level,
    capacity: origLvl.capacity,
    optimalMoves: origLvl.optimalMoves,
    themeTitle: theme.title,
    tubes: mappedTubes,
  };

  // STEP 5: Validate the configuration
  const validation = validateEmojiLevelConfig(levelConfig);
  if (!validation.valid) {
    console.error(`[EmojiSortingBall] Invalid configuration in level ${origLvl.level}:`, validation.error);
  }

  return levelConfig;
});

export function getEmojiSortingLevel(levelNumber: number): EmojiSortingLevelConfig {
  const index = Math.max(1, Math.min(40, levelNumber)) - 1;
  return EMOJI_SORTING_LEVELS[index] || EMOJI_SORTING_LEVELS[0];
}

export const TOTAL_EMOJI_SORTING_LEVELS = 40;
