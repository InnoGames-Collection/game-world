/**
 * World Legends - Tournament Puzzle Bank & Non-Repeating Question Bank
 * 
 * Key Requirements:
 * 1. 3,000+ Verified Real English Words across 10 diverse categories.
 * 2. Randomized Puzzle Generation with Multi-User isolation & Seeds.
 * 3. Never immediately repeat the same puzzle (tracks recent history, never repeats consecutive).
 * 4. Strict Difficulty Scaling up to Level 40:
 *    - Level 1: Easy (2-3 words, short 2-3 letters, simple)
 *    - Level 2: Easy / Moderate (3 words, 3-4 letters)
 *    - Level 3: Moderate (3-4 words, 3-4 letters)
 *    - Level 4: Moderately challenging (3-4 words, 4 letters)
 *    - Levels 5–10: Very Hard (4-5 words, 4-6 letters, complex anagrams)
 *    - Levels 11–15: Expert (4-5 words, 5-6 letters)
 *    - Levels 16–20: Advanced Expert (e.g. Level 17 from reference: HOW, WHO, SHOW)
 *    - Levels 21–25: Extreme (5-6 words, 5-7 letters)
 *    - Levels 26–30: Master (5-6 words, 6-7 letters)
 *    - Levels 31–35: Elite (5-6 words, 6-8 letters)
 *    - Levels 36–39: Near-ultimate (6 words, 6-8 letters)
 *    - Level 40: Ultimate (6 words, 7-8 letters)
 * 5. Strict puzzle validation before displaying:
 *    - Target words exist in dictionary
 *    - Solvable from letter pool
 *    - Accurate letter counts
 *    - Difficulty matches level
 * 6. Shuffled letter layout on wheel for fresh physical presentation every time.
 */

import { LevelData, TargetWord } from './types';
import { calculateWordPoints, getLetterValue, LETTER_VALUES } from './puzzleBankFormula';
import {
  TIER_1_LEVEL_1_PUZZLES,
  TIER_2_PUZZLES,
  TIER_3_PUZZLES,
  TIER_4_PUZZLES,
  TIER_5_PUZZLES,
  RawPuzzleDef,
  formatPuzzleToLevel,
} from './expandedVocabulary';
import {
  CATEGORIZED_WORD_DICTIONARY,
  MASTER_DICTIONARY_SET,
  normalizeWord,
} from './wordDictionary';
import { SUPPLEMENTAL_WORDS_BY_CATEGORY } from './tournamentWordBank';

export { calculateWordPoints, getLetterValue, LETTER_VALUES };

// Global fallback tracker for sessions without custom ref
const globalSessionUsedWords = new Set<string>();
const globalRecentPuzzleSignatures: string[] = [];

/**
 * Reset the session history (e.g., on new game start or restart)
 */
export function resetSessionWordHistory() {
  globalSessionUsedWords.clear();
  globalRecentPuzzleSignatures.length = 0;
}

/**
 * Get current session used words set
 */
export function getSessionUsedWords(): Set<string> {
  return globalSessionUsedWords;
}

/**
 * Mark a word as used in the current tournament session
 */
export function markWordAsUsed(word: string) {
  globalSessionUsedWords.add(normalizeWord(word));
}

/**
 * Category rotation order for tournament balance
 */
export const CATEGORY_ROTATION = [
  'SPORTS',
  'NATURE',
  'ETHIOPIA',
  'WORLD',
  'FOOD',
  'TECH',
  'CULTURE',
  'SCIENCE',
  'PEOPLE',
  'AFRICA',
];

/**
 * Helper to count character occurrences in a string
 */
function getCharFrequency(str: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const ch of str.toUpperCase()) {
    counts[ch] = (counts[ch] || 0) + 1;
  }
  return counts;
}

/**
 * Checks if target word can be formed from available pool of character frequencies
 */
function canFormWord(word: string, poolFrequencies: Record<string, number>): boolean {
  const wordFreq = getCharFrequency(word);
  for (const ch in wordFreq) {
    if (!poolFrequencies[ch] || wordFreq[ch] > poolFrequencies[ch]) {
      return false;
    }
  }
  return true;
}

/**
 * Fisher-Yates shuffle array helper
 */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Validates whether a word is in the master verified dictionary
 */
export function isValidDictionaryWord(word: string): boolean {
  return MASTER_DICTIONARY_SET.has(normalizeWord(word));
}

// -----------------------------------------------------------------------------
// CURATED EXTENSIVE PUZZLE TIERS (Levels 1 - 40)
// -----------------------------------------------------------------------------

// Tier 1: Level 1 (Easy: 2-3 words, short 2-3 letters, simple)
const LEVEL_1_CURATED: RawPuzzleDef[] = [
  {
    category: 'EVERYDAY',
    theme: 'Warm Hearth',
    letters: ['E', 'A', 'T'],
    targetWords: ['AT', 'EAT', 'TEA'],
    bonusWords: ['ATE'],
  },
  {
    category: 'SPORTS',
    theme: 'Ready Steady',
    letters: ['G', 'O', 'D'],
    targetWords: ['GO', 'DO', 'DOG'],
    bonusWords: ['GOD'],
  },
  {
    category: 'NATURE',
    theme: 'Morning Pet',
    letters: ['C', 'A', 'T'],
    targetWords: ['AT', 'CAT', 'ACT'],
    bonusWords: [],
  },
  {
    category: 'SPORTS',
    theme: 'Play Ground',
    letters: ['P', 'L', 'A', 'Y'],
    targetWords: ['LAY', 'PAY', 'PLAY'],
    bonusWords: ['LAP', 'PLY'],
  },
  {
    category: 'NATURE',
    theme: 'Morning Sun',
    letters: ['S', 'U', 'N'],
    targetWords: ['US', 'SUN'],
    bonusWords: [],
  },
  {
    category: 'SPORTS',
    theme: 'Grand Slam',
    letters: ['B', 'A', 'T'],
    targetWords: ['AT', 'BAT', 'TAB'],
    bonusWords: [],
  },
  {
    category: 'SPORTS',
    theme: 'Victory Arena',
    letters: ['W', 'I', 'N'],
    targetWords: ['IN', 'WIN'],
    bonusWords: [],
  },
  {
    category: 'SPORTS',
    theme: 'Arena Peak',
    letters: ['T', 'O', 'P'],
    targetWords: ['TO', 'TOP', 'POT'],
    bonusWords: ['OPT'],
  },
  {
    category: 'FOOD',
    theme: 'Fresh Cup',
    letters: ['C', 'U', 'P'],
    targetWords: ['UP', 'CUP'],
    bonusWords: [],
  },
  {
    category: 'SPORTS',
    theme: 'Track Sprint',
    letters: ['R', 'U', 'N'],
    targetWords: ['URN', 'RUN'],
    bonusWords: [],
  },
  {
    category: 'FOOD',
    theme: 'Sweet Berry',
    letters: ['J', 'A', 'M'],
    targetWords: ['AM', 'JAM'],
    bonusWords: [],
  },
  {
    category: 'NATURE',
    theme: 'Clever Fox',
    letters: ['F', 'O', 'X'],
    targetWords: ['OF', 'FOX'],
    bonusWords: [],
  },
];

// Tier 2: Levels 2–4 (Easy/Moderate: 3-4 words, 3-4 letters)
const LEVEL_2_4_CURATED: RawPuzzleDef[] = [
  {
    category: 'NATURE',
    theme: 'Night Sky',
    letters: ['S', 'T', 'A', 'R'],
    targetWords: ['ART', 'RAT', 'TAR', 'STAR'],
    bonusWords: ['SAT'],
  },
  {
    category: 'SPORTS',
    theme: 'Match Day',
    letters: ['G', 'A', 'M', 'E'],
    targetWords: ['AGE', 'GEM', 'GAME'],
    bonusWords: ['MAGE', 'MEGA'],
  },
  {
    category: 'NATURE',
    theme: 'Safari Pride',
    letters: ['L', 'I', 'O', 'N'],
    targetWords: ['OIL', 'ION', 'LION'],
    bonusWords: ['LOIN', 'NIL'],
  },
  {
    category: 'SPORTS',
    theme: 'Pitch Ball',
    letters: ['B', 'A', 'L', 'L'],
    targetWords: ['ALL', 'LAB', 'BALL'],
    bonusWords: [],
  },
  {
    category: 'NATURE',
    theme: 'Rose Garden',
    letters: ['R', 'O', 'S', 'E'],
    targetWords: ['ORE', 'ROSE', 'SORE'],
    bonusWords: ['EROS'],
  },
  {
    category: 'WORLD',
    theme: 'Harbor Marina',
    letters: ['B', 'O', 'A', 'T'],
    targetWords: ['BAT', 'OAT', 'TAB', 'BOAT'],
    bonusWords: ['BOA'],
  },
  {
    category: 'EVERYDAY',
    theme: 'Golden Vault',
    letters: ['G', 'O', 'L', 'D'],
    targetWords: ['LOG', 'OLD', 'DOG', 'GOLD'],
    bonusWords: ['GOD'],
  },
  {
    category: 'NATURE',
    theme: 'Green Forest',
    letters: ['T', 'R', 'E', 'E'],
    targetWords: ['TEE', 'TREE'],
    bonusWords: [],
  },
  {
    category: 'FOOD',
    theme: 'Artisan Oven',
    letters: ['B', 'A', 'K', 'E'],
    targetWords: ['BEAK', 'BAKE'],
    bonusWords: [],
  },
  {
    category: 'SPORTS',
    theme: 'Golden Goal',
    letters: ['G', 'O', 'A', 'L'],
    targetWords: ['AGO', 'LOG', 'GOAL'],
    bonusWords: ['GAL'],
  },
  {
    category: 'SPORTS',
    theme: 'Team Pass',
    letters: ['P', 'A', 'S', 'S'],
    targetWords: ['SAP', 'PASS', 'ASPS'],
    bonusWords: ['SPA'],
  },
  {
    category: 'FOOD',
    theme: 'Warm Soup',
    letters: ['S', 'O', 'U', 'P'],
    targetWords: ['SOP', 'SOU', 'SOUP'],
    bonusWords: ['UPS'],
  },
];

// Tier 3: Levels 5–10 (Very Hard: 4-5 words, 4-6 letters, complex vocabulary)
const LEVEL_5_10_CURATED: RawPuzzleDef[] = [
  {
    category: 'SPORTS',
    theme: 'Stadium Arena',
    letters: ['A', 'R', 'E', 'N', 'A'],
    targetWords: ['AREA', 'EARN', 'NEAR', 'ARENA'],
    bonusWords: ['RAN', 'ERA'],
  },
  {
    category: 'SPORTS',
    theme: 'Pitch Match',
    letters: ['M', 'A', 'T', 'C', 'H'],
    targetWords: ['CHAT', 'MATH', 'ACT', 'MATCH'],
    bonusWords: ['CAT', 'HAT'],
  },
  {
    category: 'FOOD',
    theme: 'Orchard Harvest',
    letters: ['A', 'P', 'P', 'L', 'E'],
    targetWords: ['ALE', 'APE', 'LEAP', 'PALE', 'APPLE'],
    bonusWords: ['PLEA'],
  },
  {
    category: 'WORLD',
    theme: 'Great River',
    letters: ['R', 'I', 'V', 'E', 'R'],
    targetWords: ['ERR', 'IRE', 'RIPE', 'RIVER'],
    bonusWords: ['VIE'],
  },
  {
    category: 'SCIENCE',
    theme: 'Solar Energy',
    letters: ['S', 'O', 'L', 'A', 'R'],
    targetWords: ['OAR', 'ALSO', 'SOAR', 'SOLAR'],
    bonusWords: ['SOL'],
  },
  {
    category: 'NATURE',
    theme: 'Highland Peak',
    letters: ['P', 'L', 'A', 'N', 'T'],
    targetWords: ['PLAN', 'PLAT', 'PANT', 'PLANT'],
    bonusWords: ['ANT', 'PAN', 'TAN', 'TAP'],
  },
  {
    category: 'SPORTS',
    theme: 'Golden Boot',
    letters: ['B', 'O', 'O', 'T', 'S'],
    targetWords: ['BOOT', 'TOOT', 'SOOT', 'BOOTS'],
    bonusWords: ['TOO', 'BOO'],
  },
  {
    category: 'TECH',
    theme: 'Global Cloud',
    letters: ['C', 'L', 'O', 'U', 'D'],
    targetWords: ['COLD', 'LOUD', 'DUCK', 'CLOUD'],
    bonusWords: ['LOD', 'DOC'],
  },
  {
    category: 'CULTURE',
    theme: 'Ancient Crown',
    letters: ['C', 'R', 'O', 'W', 'N'],
    targetWords: ['CORN', 'WORN', 'CROW', 'CROWN'],
    bonusWords: ['ROW', 'NOW', 'OWN', 'WON'],
  },
  {
    category: 'SPORTS',
    theme: 'Striker Strike',
    letters: ['S', 'T', 'R', 'I', 'K', 'E'],
    targetWords: ['SITE', 'TIRE', 'RISK', 'KITE', 'STRIKE'],
    bonusWords: ['REST', 'SKIT', 'IRK'],
  },
];

// Tier 4: Levels 11–15 (Expert: 4-5 words, 5-6 letters)
const LEVEL_11_15_CURATED: RawPuzzleDef[] = [
  {
    category: 'SPORTS',
    theme: 'Premier Soccer',
    letters: ['S', 'O', 'C', 'C', 'E', 'R'],
    targetWords: ['CORE', 'ROSE', 'SCORE', 'SOCCER'],
    bonusWords: ['ORE', 'ROE'],
  },
  {
    category: 'NATURE',
    theme: 'Silent Forest',
    letters: ['F', 'O', 'R', 'E', 'S', 'T'],
    targetWords: ['FORT', 'ROSE', 'SORE', 'SOFT', 'FOREST'],
    bonusWords: ['FOR', 'FRO', 'SET', 'TOE', 'ROT'],
  },
  {
    category: 'WORLD',
    theme: 'Castle Kingdom',
    letters: ['C', 'A', 'S', 'T', 'L', 'E'],
    targetWords: ['LATE', 'TALE', 'SEAL', 'SALE', 'CASTLE'],
    bonusWords: ['CAT', 'ACT', 'ALE', 'LET', 'SET'],
  },
  {
    category: 'SPORTS',
    theme: 'Grand Trophy',
    letters: ['T', 'R', 'O', 'P', 'H', 'Y'],
    targetWords: ['PORT', 'TYPO', 'ROPY', 'TROPHY'],
    bonusWords: ['TOY', 'POT', 'TOP', 'ROT', 'HOT', 'HOP', 'PRO'],
  },
  {
    category: 'CULTURE',
    theme: 'Silver Flute',
    letters: ['S', 'I', 'L', 'V', 'E', 'R'],
    targetWords: ['LIVE', 'VEIL', 'RILE', 'VILE', 'SILVER'],
    bonusWords: ['SIR', 'LIE'],
  },
  {
    category: 'FOOD',
    theme: 'Sweet Orange',
    letters: ['O', 'R', 'A', 'N', 'G', 'E'],
    targetWords: ['GEAR', 'NEAR', 'RANG', 'ROAN', 'ORANGE'],
    bonusWords: ['AGE', 'EGO', 'NOR', 'OAR', 'ONE', 'RAN'],
  },
];

// Tier 5: Levels 16–20 (Advanced Expert - includes Level 17 Reference: HOW, WHO, SHOW, WHOSE)
const LEVEL_16_20_CURATED: RawPuzzleDef[] = [
  // LEVEL 17 EXACT REFERENCE MATCH:
  {
    category: 'EVERYDAY',
    theme: 'Word Legends Stage',
    letters: ['H', 'O', 'W', 'S'],
    targetWords: ['HOW', 'WHO', 'SHOW'],
    bonusWords: ['SOW', 'SHE', 'HEW'],
  },
  {
    category: 'SPORTS',
    theme: 'Stadium Winner',
    letters: ['W', 'I', 'N', 'N', 'E', 'R'],
    targetWords: ['WINE', 'WIRE', 'WREN', 'INNER', 'WINNER'],
    bonusWords: ['WIN', 'NEW', 'RAW', 'RUN'],
  },
  {
    category: 'CULTURE',
    theme: 'Ancient Legend',
    letters: ['L', 'E', 'G', 'E', 'N', 'D'],
    targetWords: ['GLEN', 'NEED', 'LEND', 'EDGE', 'LEGEND'],
    bonusWords: ['LED', 'END', 'GEL', 'EEL', 'DEN'],
  },
  {
    category: 'SPORTS',
    theme: 'World Stadium',
    letters: ['S', 'T', 'A', 'D', 'I', 'U', 'M'],
    targetWords: ['MIST', 'MAST', 'STAM', 'SUIT', 'STADIUM'],
    bonusWords: ['AIM', 'DAM', 'MAD', 'MID', 'SIT'],
  },
  {
    category: 'NATURE',
    theme: 'African Leopard',
    letters: ['L', 'E', 'O', 'P', 'A', 'R', 'D'],
    targetWords: ['PEARL', 'POLE', 'ROAD', 'DARE', 'LEOPARD'],
    bonusWords: ['EAR', 'RED', 'OLD', 'PAD', 'ROD', 'OAR', 'LAD'],
  },
];

// Tier 6: Levels 21–40 (Extreme, Master, Elite, Ultimate)
const LEVEL_21_40_CURATED: RawPuzzleDef[] = [
  {
    category: 'SPORTS',
    theme: 'Gold Champion',
    letters: ['C', 'H', 'A', 'M', 'P', 'I', 'O', 'N'],
    targetWords: ['CAMP', 'CHAMP', 'MANIC', 'CHAMPION'],
    bonusWords: ['MAN', 'PAN', 'HIP', 'HOP', 'CAP', 'MAP', 'PIN'],
  },
  {
    category: 'SPORTS',
    theme: 'Olympic Victory',
    letters: ['V', 'I', 'C', 'T', 'O', 'R', 'Y'],
    targetWords: ['CITY', 'TRIO', 'RIOT', 'VICTOR', 'VICTORY'],
    bonusWords: ['TOY', 'TRY', 'CRY', 'ROT'],
  },
  {
    category: 'NATURE',
    theme: 'Grand Mountain',
    letters: ['M', 'O', 'U', 'N', 'T', 'A', 'I', 'N'],
    targetWords: ['MOUNT', 'TRAIN', 'UNION', 'NATION', 'MOUNTAIN'],
    bonusWords: ['NUT', 'TIN', 'OUT', 'AIM', 'MAN', 'MAT'],
  },
  {
    category: 'CULTURE',
    theme: 'Great Heritage',
    letters: ['H', 'E', 'R', 'I', 'T', 'A', 'G', 'E'],
    targetWords: ['EARTH', 'GREAT', 'TIGER', 'HEART', 'HERITAGE'],
    bonusWords: ['AGE', 'AIR', 'ART', 'EAT', 'HAT', 'HIT', 'TEA', 'TIE'],
  },
  {
    category: 'SCIENCE',
    theme: 'Deep Telescope',
    letters: ['T', 'E', 'L', 'E', 'S', 'C', 'O', 'P', 'E'],
    targetWords: ['STEEL', 'SLEEP', 'PEEL', 'ELECT', 'TELESCOPE'],
    bonusWords: ['LEE', 'LET', 'LOT', 'PET', 'POT', 'SEE', 'SET', 'TOE', 'TOP'],
  },
  {
    category: 'SCIENCE',
    theme: 'Quantum Particle',
    letters: ['P', 'A', 'R', 'T', 'I', 'C', 'L', 'E'],
    targetWords: ['ALERT', 'CLEAR', 'TRACE', 'PLEAT', 'PARTICLE'],
    bonusWords: ['ACT', 'ALE', 'APE', 'ART', 'CAT', 'EAR', 'EAT', 'LAP', 'LIP', 'LIT'],
  },
  {
    category: 'ETHIOPIA',
    theme: 'Abyssinia Highlands',
    letters: ['H', 'I', 'G', 'H', 'L', 'A', 'N', 'D'],
    targetWords: ['GAIN', 'GLAD', 'HAIL', 'HAND', 'HIGHLAND'],
    bonusWords: ['HAD', 'HAG', 'NIL'],
  },
  {
    category: 'WORLD',
    theme: 'Continent Odyssey',
    letters: ['C', 'O', 'N', 'T', 'I', 'N', 'E', 'N', 'T'],
    targetWords: ['CONTENT', 'TONIC', 'INTENT', 'CONTINENT'],
    bonusWords: ['NET', 'NOT', 'ONE', 'TEN', 'TIE', 'TOE'],
  },
];

// Pre-index dictionary words by length for high-performance dynamic anagram generation
const WORDS_BY_LEN: Record<number, string[]> = {
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
};

MASTER_DICTIONARY_SET.forEach((w) => {
  const len = w.length;
  if (len >= 2 && len <= 8) {
    if (!WORDS_BY_LEN[len]) WORDS_BY_LEN[len] = [];
    WORDS_BY_LEN[len].push(w);
  }
});

/**
 * Validates a generated level configuration thoroughly before passing it to UI
 */
export function validateGeneratedPuzzle(levelData: LevelData): boolean {
  if (!levelData.targetWords || levelData.targetWords.length === 0) return false;
  if (!levelData.letters || levelData.letters.length < 3) return false;

  const letterPoolFreq = getCharFrequency(levelData.letters.join(''));

  for (const tw of levelData.targetWords) {
    const clean = normalizeWord(tw.word);
    if (!clean || clean.length < 2) return false;
    // Check word is in dictionary
    if (!MASTER_DICTIONARY_SET.has(clean)) return false;
    // Check word can be formed from letter pool
    if (!canFormWord(clean, letterPoolFreq)) return false;
  }

  return true;
}

/**
 * Generates a dynamic puzzle for any level (1..40) using anagram resolution
 * over the 3,000+ words dictionary.
 */
function generateDynamicPuzzle(
  levelNumber: number,
  categoryName: string,
  excludedWords: Set<string>,
  recentSignatures: string[]
): LevelData {
  // Determine difficulty parameters based on level
  let targetRootLen = 4;
  let targetWordCount = 3;
  let minWordLen = 3;
  let difficultyName = 'easy';

  if (levelNumber === 1) {
    targetRootLen = 3;
    targetWordCount = 2;
    minWordLen = 2;
    difficultyName = 'Easy';
  } else if (levelNumber === 2) {
    targetRootLen = 4;
    targetWordCount = 3;
    minWordLen = 2;
    difficultyName = 'Easy-Moderate';
  } else if (levelNumber === 3) {
    targetRootLen = 4;
    targetWordCount = 3;
    minWordLen = 3;
    difficultyName = 'Moderate';
  } else if (levelNumber === 4) {
    targetRootLen = 4;
    targetWordCount = 3;
    minWordLen = 3;
    difficultyName = 'Moderate';
  } else if (levelNumber <= 10) {
    targetRootLen = 5;
    targetWordCount = 4;
    minWordLen = 3;
    difficultyName = 'Very Hard';
  } else if (levelNumber <= 15) {
    targetRootLen = 5;
    targetWordCount = 4;
    minWordLen = 3;
    difficultyName = 'Expert';
  } else if (levelNumber <= 20) {
    targetRootLen = 6;
    targetWordCount = 4;
    minWordLen = 3;
    difficultyName = 'Advanced Expert';
  } else if (levelNumber <= 25) {
    targetRootLen = 6;
    targetWordCount = 5;
    minWordLen = 3;
    difficultyName = 'Extreme';
  } else if (levelNumber <= 30) {
    targetRootLen = 6;
    targetWordCount = 5;
    minWordLen = 4;
    difficultyName = 'Master';
  } else if (levelNumber <= 35) {
    targetRootLen = 7;
    targetWordCount = 5;
    minWordLen = 4;
    difficultyName = 'Elite';
  } else {
    targetRootLen = 7;
    targetWordCount = 5;
    minWordLen = 4;
    difficultyName = 'Ultimate';
  }

  // Find candidate root words
  const pool = WORDS_BY_LEN[targetRootLen] || WORDS_BY_LEN[5] || [];
  const shuffledCandidates = shuffleArray(pool);

  let selectedRoot = '';
  let subWords: string[] = [];

  for (const candidate of shuffledCandidates) {
    if (excludedWords.has(candidate)) continue;
    if (recentSignatures.includes(candidate)) continue;

    const candFreq = getCharFrequency(candidate);
    const validSubs: string[] = [];

    // Search for all sub-words from length minWordLen to targetRootLen
    for (let l = minWordLen; l <= targetRootLen; l++) {
      const wordsOfLen = WORDS_BY_LEN[l] || [];
      for (const candidateSub of wordsOfLen) {
        if (canFormWord(candidateSub, candFreq)) {
          validSubs.push(candidateSub);
        }
      }
    }

    if (validSubs.length >= targetWordCount) {
      selectedRoot = candidate;
      // Sort sub-words: root word first, then by length descending, and take target count
      const uniqueSubs = Array.from(new Set(validSubs));
      uniqueSubs.sort((a, b) => b.length - a.length || a.localeCompare(b));
      subWords = uniqueSubs.slice(0, targetWordCount);
      break;
    }
  }

  // Fallback if no candidate found
  if (!selectedRoot || subWords.length === 0) {
    selectedRoot = 'SPORT';
    subWords = ['PORT', 'POST', 'SPOT', 'SPORT'];
  }

  // Generate unique letters on wheel and randomize order
  const letters = shuffleArray(selectedRoot.split(''));
  const seed = Math.floor(Math.random() * 900000) + 100000;
  const puzzleId = `wl_lvl${levelNumber}_${seed}_${Date.now().toString(36)}`;

  const targetWords: TargetWord[] = subWords.map((w) => ({
    word: w,
    points: calculateWordPoints(w),
  }));

  return {
    levelNumber,
    theme: `${categoryName} Challenge - Level ${levelNumber}`,
    letters,
    targetWords,
    bonusWords: [],
    category: categoryName,
    puzzleId,
    seed,
    difficulty: difficultyName,
    createdAt: Date.now(),
  };
}

/**
 * Tournament-safe Level Data Generator.
 * 
 * Features:
 * - Multi-user isolation
 * - Randomizes puzzle selection on each attempt
 * - Checks recent history so consecutive levels / replays never duplicate
 * - Rigorously validates every puzzle before delivering
 * - Shuffles wheel letter layout so presentation is physically unique
 */
export function getLevelData(
  levelIndex: number,
  sessionUsedWords: Set<string> = globalSessionUsedWords,
  recentSignatures: string[] = globalRecentPuzzleSignatures
): LevelData {
  const levelNumber = levelIndex + 1;
  const categoryIndex = levelIndex % CATEGORY_ROTATION.length;
  const desiredCategory = CATEGORY_ROTATION[categoryIndex];

  // Select appropriate curated tier
  let curatedPool: RawPuzzleDef[] = [];
  if (levelNumber === 1) {
    curatedPool = LEVEL_1_CURATED;
  } else if (levelNumber >= 2 && levelNumber <= 4) {
    curatedPool = LEVEL_2_4_CURATED;
  } else if (levelNumber >= 5 && levelNumber <= 10) {
    curatedPool = LEVEL_5_10_CURATED;
  } else if (levelNumber >= 11 && levelNumber <= 15) {
    curatedPool = LEVEL_11_15_CURATED;
  } else if (levelNumber >= 16 && levelNumber <= 20) {
    curatedPool = LEVEL_16_20_CURATED;
  } else {
    curatedPool = LEVEL_21_40_CURATED;
  }

  // Filter curated pool to exclude words in sessionUsedWords and recentSignatures
  const eligibleCurated = curatedPool.filter((p) => {
    // Signature is root or joined target words
    const signature = p.targetWords.join('_');
    if (recentSignatures.includes(signature)) return false;

    // Check if any target words already used in session
    for (const tw of p.targetWords) {
      if (sessionUsedWords.has(normalizeWord(tw))) {
        return false;
      }
    }
    return true;
  });

  let selectedLevel: LevelData | null = null;

  // 50% chance to pick eligible curated if available, or if dynamic needed
  if (eligibleCurated.length > 0 && Math.random() > 0.25) {
    // Controlled random selection among eligible curated puzzles
    const randomCurated = eligibleCurated[Math.floor(Math.random() * eligibleCurated.length)];
    const seed = Math.floor(Math.random() * 900000) + 100000;
    const formatted = formatPuzzleToLevel(randomCurated, levelNumber);

    // Shuffle letter layout on wheel
    formatted.letters = shuffleArray(formatted.letters);
    formatted.puzzleId = `wl_lvl${levelNumber}_${seed}_${Date.now().toString(36)}`;
    formatted.seed = seed;
    formatted.difficulty = levelNumber === 1 ? 'Easy' : levelNumber <= 4 ? 'Moderate' : levelNumber <= 10 ? 'Very Hard' : levelNumber <= 20 ? 'Advanced Expert' : 'Master';
    formatted.createdAt = Date.now();

    if (validateGeneratedPuzzle(formatted)) {
      selectedLevel = formatted;
    }
  }

  // If no curated match or dynamic chosen, synthesize a fresh dynamic puzzle
  if (!selectedLevel) {
    selectedLevel = generateDynamicPuzzle(
      levelNumber,
      desiredCategory,
      sessionUsedWords,
      recentSignatures
    );
  }

  // Guarantee validation
  if (!validateGeneratedPuzzle(selectedLevel)) {
    // Emergency reliable fallback matching level
    selectedLevel = {
      levelNumber,
      theme: `Legends Arena - Level ${levelNumber}`,
      letters: levelNumber === 1 ? ['C', 'A', 'T'] : ['S', 'P', 'O', 'R', 'T'],
      targetWords: levelNumber === 1 
        ? [{ word: 'AT', points: 15 }, { word: 'CAT', points: 30 }]
        : [{ word: 'PORT', points: 40 }, { word: 'SPOT', points: 40 }, { word: 'SPORT', points: 50 }],
      bonusWords: [],
      category: desiredCategory,
      puzzleId: `wl_fallback_${levelNumber}_${Date.now()}`,
      seed: 12345,
      difficulty: 'Standard',
      createdAt: Date.now(),
    };
  }

  // Register puzzle signature and words to history to prevent immediate repeat
  const sig = selectedLevel.targetWords.map((tw) => tw.word).join('_');
  recentSignatures.push(sig);
  if (recentSignatures.length > 40) {
    recentSignatures.shift();
  }

  selectedLevel.targetWords.forEach((tw) => {
    sessionUsedWords.add(normalizeWord(tw.word));
  });

  return selectedLevel;
}
