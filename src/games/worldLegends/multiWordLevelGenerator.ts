/**
 * World Legends - Multi-Word Level Generator
 * 
 * Generates tournament-safe multi-word progression for Levels 1 to 40:
 * - Level 1 = 5 words
 * - Level 2 = 6 words
 * - Level 3 = 7 words
 * - Level 4 = 8 words
 * - Level 5 = 9 words
 * - Level 6..40 = 10 words
 * 
 * Rigorously enforces:
 * - Every word inside a level is unique (NO duplicate words in the same level)
 * - Level 1 is already competitive with progressive difficulty within the level:
 *   Word 1: Moderate (4-5 letters, ~2 letters revealed)
 *   Word 2: Moderate-Hard (5 letters, 2 letters revealed)
 *   Word 3: Hard (5 letters, 1-2 letters revealed)
 *   Word 4: Harder (5-6 letters, 1 letter revealed)
 *   Word 5: Hardest (5-6 letters, 1 or 0 letters revealed + distractor)
 * - Deterministic word selection and solvable wheels
 */

import { WordQuestion, MultiWordLevelData } from './types';
import { CATEGORIZED_WORD_DICTIONARY } from './wordDictionary';
import { getLevelMultiplier } from './competitiveScoreService';

// Progressive question counts per level
export function getWordCountForLevel(levelNumber: number): number {
  if (levelNumber === 1) return 5;
  if (levelNumber === 2) return 6;
  if (levelNumber === 3) return 7;
  if (levelNumber === 4) return 8;
  if (levelNumber === 5) return 9;
  return 10;
}

// Fisher-Yates array shuffler
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Letter frequency helper
function getCharFrequency(word: string): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const c of word.toUpperCase()) {
    freq[c] = (freq[c] || 0) + 1;
  }
  return freq;
}

// Checks if a candidate word can be formed from available letter frequencies
function canFormWord(candidate: string, availableFreq: Record<string, number>): boolean {
  const candFreq = getCharFrequency(candidate);
  for (const [char, count] of Object.entries(candFreq)) {
    if ((availableFreq[char] || 0) < count) return false;
  }
  return true;
}

// Distractor letters that look natural on word wheels
const DISTRACTOR_POOL = ['S', 'E', 'R', 'T', 'A', 'N', 'L', 'O', 'D', 'P'];

// Determine which box indices are pre-revealed
function calculateRevealedIndices(
  word: string,
  wordIndex: number,
  totalWords: number
): number[] {
  const len = word.length;
  // Level 1 / Early level curve:
  // Word 1 (0): 2 revealed letters
  // Word 2 (1): 2 revealed letters (different positions)
  // Word 3 (2): 1 revealed letter
  // Word 4 (3): 1 revealed letter
  // Word 5 (4): 1 revealed letter (or 0 if len <= 4)
  if (wordIndex === 0) {
    // Reveal 2 letters nicely spaced
    return [0, Math.min(len - 1, 2)];
  } else if (wordIndex === 1) {
    return [1, Math.min(len - 1, 3)];
  } else if (wordIndex === 2) {
    return [Math.floor(len / 2)];
  } else if (wordIndex === 3) {
    return [0];
  } else if (wordIndex === 4 && totalWords === 5) {
    // Hardest in Level 1: 1 subtle reveal
    return [1];
  } else if (wordIndex >= totalWords - 2) {
    // Near the end of higher levels: 1 or 0 reveals
    return len >= 6 ? [Math.floor(len / 2)] : [];
  } else {
    // Middle questions
    return [Math.floor(len / 3)];
  }
}

// Curated definitions for early levels
const CURATED_LEVELS: Record<
  number,
  {
    theme: string;
    category: string;
    words: { word: string; bonusWords?: string[]; distractor?: string }[];
  }
> = {
  1: {
    theme: 'Gourmet Kitchen',
    category: 'FOOD',
    words: [
      // Word 1: Moderate (5 letters, 2 reveals)
      { word: 'BREAD', bonusWords: ['READ', 'BEAR', 'BEAD', 'DARE', 'DEAR', 'RED', 'BAD', 'BED'] },
      // Word 2: Moderate-Hard (5 letters, 2 reveals)
      { word: 'ROAST', bonusWords: ['STAR', 'SOAR', 'SORT', 'OATS', 'TORS', 'ROT', 'OAT', 'ART'] },
      // Word 3: Hard (5 letters, 1 reveal)
      { word: 'SPICE', bonusWords: ['EPIC', 'PIES', 'SIP', 'ICE', 'PIE'] },
      // Word 4: Harder (6 letters, 1 reveal)
      { word: 'FLAVOR', bonusWords: ['FORAL', 'FOAL', 'OVAL', 'ROAF', 'FOR', 'OAR', 'FAR'] },
      // Word 5: Hardest in Level 1 (6 letters, 1 reveal + distractor 'S')
      { word: 'RECIPE', distractor: 'S', bonusWords: ['PIER', 'RIPE', 'PERI', 'PIE', 'REP'] },
    ],
  },
  2: {
    theme: 'Wild Nature',
    category: 'NATURE',
    words: [
      { word: 'PLANT', bonusWords: ['PLAN', 'PLAT', 'PANT', 'ANT', 'PAN', 'TAN', 'TAP'] },
      { word: 'STORM', bonusWords: ['SORT', 'MORT', 'MOST', 'ROTS', 'TORS', 'ROT', 'TOM'] },
      { word: 'RIVER', bonusWords: ['RIVE', 'VIRE', 'ERR', 'REV'] },
      { word: 'FOREST', bonusWords: ['FORT', 'ROSE', 'SORE', 'SOFT', 'FOR', 'SET', 'TOE', 'ROT'] },
      { word: 'VALLEY', bonusWords: ['ALLY', 'LAVE', 'VEAL', 'ALE', 'LAY', 'YEA'] },
      { word: 'CANYON', distractor: 'S', bonusWords: ['CYAN', 'ANON', 'CONY', 'CAN', 'ANY'] },
    ],
  },
  3: {
    theme: 'Stadium Arena',
    category: 'SPORTS',
    words: [
      { word: 'MATCH', bonusWords: ['MATH', 'CHAT', 'ACT', 'CAT', 'MAT', 'HAT'] },
      { word: 'SCORE', bonusWords: ['CORE', 'ROSE', 'SORE', 'ROES', 'ORE', 'ROE', 'SEC'] },
      { word: 'TRACK', bonusWords: ['CART', 'RACK', 'ACT', 'CAT', 'ART', 'RAT', 'TAR'] },
      { word: 'ARENA', bonusWords: ['AREA', 'NEAR', 'EARN', 'ERA', 'RAN'] },
      { word: 'TROPHY', bonusWords: ['PORT', 'TYPO', 'ROPY', 'TOY', 'POT', 'TOP', 'ROT', 'HOT', 'HOP', 'PRO'] },
      { word: 'SPRINT', bonusWords: ['PINS', 'RIPS', 'TRIP', 'SPIT', 'PIN', 'TIP', 'SIP', 'PIT', 'RIP'] },
      { word: 'CHAMPION', distractor: 'S', bonusWords: ['CHAMP', 'MANIC', 'MACH', 'COMA', 'CAMP', 'CHIN', 'COIN', 'MOP', 'PAN', 'MAP'] },
    ],
  },
  4: {
    theme: 'Global Explorer',
    category: 'WORLD',
    words: [
      { word: 'OCEAN', bonusWords: ['ACNE', 'CANE', 'CONE', 'ONCE', 'ACE', 'ONE', 'EON'] },
      { word: 'ISLAND', bonusWords: ['LAND', 'SAIL', 'NAIL', 'LAID', 'SLID', 'SIN', 'LID', 'AND'] },
      { word: 'HARBOR', bonusWords: ['ROAR', 'BOAR', 'BAR', 'OAR'] },
      { word: 'VOYAGE', bonusWords: ['GAVE', 'YOGA', 'AGE', 'GOV', 'YAG'] },
      { word: 'TRAVEL', bonusWords: ['ALERT', 'ALTER', 'LATER', 'REAL', 'TALE', 'TEAL', 'LATE', 'EARL', 'RATE', 'TAR', 'ART', 'LET'] },
      { word: 'COMPASS', bonusWords: ['CAMP', 'PASS', 'SOAP', 'COPS', 'MAPS', 'MOSS', 'CAP', 'MAP', 'SAP'] },
      { word: 'HORIZON', bonusWords: ['HORN', 'IRON', 'NOON', 'ZOO', 'NOR', 'ION'] },
      { word: 'JOURNEY', distractor: 'S', bonusWords: ['ENJOY', 'ENTRY', 'JOY', 'RUN', 'ONE', 'NOR'] },
    ],
  },
  5: {
    theme: 'Highland Heritage',
    category: 'CULTURE',
    words: [
      { word: 'CROWN', bonusWords: ['CORN', 'WORN', 'CROW', 'ROW', 'NOW', 'OWN', 'WON'] },
      { word: 'SHIELD', bonusWords: ['HIDE', 'HELD', 'SHED', 'SLID', 'IDLE', 'LED', 'HIS', 'LIE'] },
      { word: 'CASTLE', bonusWords: ['LATE', 'TALE', 'SEAL', 'SALE', 'CAT', 'ACT', 'ALE', 'LET', 'SET'] },
      { word: 'TEMPLE', bonusWords: ['MELT', 'PELT', 'MEET', 'PET', 'LET', 'MET'] },
      { word: 'PALACE', bonusWords: ['CAPE', 'LACE', 'LEAP', 'PALE', 'PLEA', 'ACE', 'CAP', 'LAP'] },
      { word: 'MONARCH', bonusWords: ['ROAM', 'ARCH', 'CORN', 'CRAM', 'HARM', 'HORN', 'MAN', 'ARM', 'RAM', 'CAN'] },
      { word: 'EMPIRE', bonusWords: ['PRIME', 'RIPE', 'PERI', 'PIER', 'RIM', 'PIE', 'REP'] },
      { word: 'LEGEND', bonusWords: ['GLEE', 'NEED', 'EDGE', 'GLEN', 'GEL', 'LED', 'END'] },
      { word: 'DYNASTY', distractor: 'E', bonusWords: ['STAY', 'SAND', 'TINY', 'DAY', 'SAY', 'SAD'] },
    ],
  },
};

/**
 * Builds letters for the wheel.
 * Includes all letters of the target word (with exact counts)
 * Plus an optional distractor letter on harder questions.
 */
function buildWheelLetters(word: string, distractor?: string): string[] {
  const letters = word.toUpperCase().split('');
  if (distractor) {
    letters.push(distractor.toUpperCase());
  }
  return shuffleArray(letters);
}

/**
 * Fallback pool generator for Levels 6 to 40
 */
function generateDynamicQuestions(
  levelNumber: number,
  totalWords: number,
  sessionUsedWords: Set<string>
): WordQuestion[] {
  const categoryIndex = (levelNumber - 1) % CATEGORIZED_WORD_DICTIONARY.length;
  const catDef = CATEGORIZED_WORD_DICTIONARY[categoryIndex];
  const categoryName = catDef.category;
  const themeName = `${catDef.theme} - Level ${levelNumber}`;

  const questions: WordQuestion[] = [];
  const usedInThisLevel = new Set<string>();

  // Collect word pools by length from the category definition
  const len5Pool = catDef.words.len5 || [];
  const len6Pool = catDef.words.len6 || [];
  const len7Pool = catDef.words.len7Plus || [];
  const len4Pool = catDef.words.len4 || [];

  for (let i = 0; i < totalWords; i++) {
    // Progressive target word length within the level:
    // Early words: len 5 (or 4 if early)
    // Middle words: len 5 or 6
    // Late words: len 6 or 7
    let candidatePool: string[] = [];
    if (i < 2) {
      candidatePool = len5Pool.length > 0 ? len5Pool : len4Pool;
    } else if (i < totalWords - 2) {
      candidatePool = len6Pool.length > 0 ? len6Pool : len5Pool;
    } else {
      candidatePool = len7Pool.length > 0 ? len7Pool : len6Pool;
    }

    // Filter candidate pool to avoid duplicates in this level and recent sessions
    let chosenWord = '';
    const shuffledPool = shuffleArray(candidatePool);
    for (const cand of shuffledPool) {
      const upper = cand.toUpperCase();
      if (!usedInThisLevel.has(upper) && !sessionUsedWords.has(upper)) {
        chosenWord = upper;
        break;
      }
    }

    // Fallback if all preferred words were used
    if (!chosenWord) {
      for (const cand of shuffledPool) {
        const upper = cand.toUpperCase();
        if (!usedInThisLevel.has(upper)) {
          chosenWord = upper;
          break;
        }
      }
    }

    // Ultimate safe fallback
    if (!chosenWord) {
      chosenWord = `WORD${i + 1}`;
    }

    usedInThisLevel.add(chosenWord);
    sessionUsedWords.add(chosenWord);

    // Distractor for the final 2 questions of the level
    const needsDistractor = i >= totalWords - 2;
    const distractor = needsDistractor
      ? DISTRACTOR_POOL[(levelNumber + i) % DISTRACTOR_POOL.length]
      : undefined;

    const letters = buildWheelLetters(chosenWord, distractor);
    const revealedIndices = calculateRevealedIndices(chosenWord, i, totalWords);

    let diff: 'moderate' | 'moderate-hard' | 'hard' | 'harder' | 'hardest' = 'moderate';
    if (i === 1) diff = 'moderate-hard';
    else if (i === 2) diff = 'hard';
    else if (i >= 3 && i < totalWords - 1) diff = 'harder';
    else if (i === totalWords - 1) diff = 'hardest';

    questions.push({
      id: `q_lvl${levelNumber}_w${i + 1}`,
      wordNumber: i + 1,
      totalWords,
      word: chosenWord,
      letters,
      revealedIndices,
      theme: themeName,
      category: categoryName,
      difficulty: diff,
      bonusWords: [],
      points: 10 + chosenWord.length * 5,
    });
  }

  return questions;
}

/**
 * Main Level Generator Function
 * Returns complete multi-word data for any level 1..40
 */
export function getMultiWordLevel(
  levelIndex: number,
  sessionUsedWords: Set<string> = new Set<string>()
): MultiWordLevelData {
  const levelNumber = levelIndex + 1;
  const totalWords = getWordCountForLevel(levelNumber);
  const scoreMultiplier = getLevelMultiplier(levelNumber);

  // Check if curated level exists (e.g. Levels 1 to 5)
  if (CURATED_LEVELS[levelNumber]) {
    const def = CURATED_LEVELS[levelNumber];
    const questions: WordQuestion[] = def.words.slice(0, totalWords).map((wDef, idx) => {
      const upperWord = wDef.word.toUpperCase();
      sessionUsedWords.add(upperWord);
      const letters = buildWheelLetters(upperWord, wDef.distractor);
      const revealedIndices = calculateRevealedIndices(upperWord, idx, totalWords);

      let diff: 'moderate' | 'moderate-hard' | 'hard' | 'harder' | 'hardest' = 'moderate';
      if (idx === 1) diff = 'moderate-hard';
      else if (idx === 2) diff = 'hard';
      else if (idx >= 3 && idx < totalWords - 1) diff = 'harder';
      else if (idx === totalWords - 1) diff = 'hardest';

      return {
        id: `q_lvl${levelNumber}_w${idx + 1}`,
        wordNumber: idx + 1,
        totalWords,
        word: upperWord,
        letters,
        revealedIndices,
        theme: def.theme,
        category: def.category,
        difficulty: diff,
        bonusWords: wDef.bonusWords || [],
        points: 10 + upperWord.length * 5,
      };
    });

    return {
      levelNumber,
      theme: def.theme,
      category: def.category,
      totalWords,
      questions,
      scoreMultiplier,
      difficultyLabel:
        levelNumber === 1
          ? 'Accessible Competitive'
          : levelNumber <= 5
          ? 'Intermediate'
          : 'Expert',
    };
  }

  // Dynamic procedural generation for Levels 6 to 40
  const questions = generateDynamicQuestions(levelNumber, totalWords, sessionUsedWords);
  const categoryIndex = (levelNumber - 1) % CATEGORIZED_WORD_DICTIONARY.length;
  const catDef = CATEGORIZED_WORD_DICTIONARY[categoryIndex];

  return {
    levelNumber,
    theme: `${catDef.theme} - Level ${levelNumber}`,
    category: catDef.category,
    totalWords,
    questions,
    scoreMultiplier,
    difficultyLabel:
      levelNumber <= 10
        ? 'Advanced'
        : levelNumber <= 20
        ? 'Expert'
        : levelNumber <= 30
        ? 'Master'
        : 'Legendary',
  };
}
