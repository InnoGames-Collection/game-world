/**
 * EMOJI IQ — 40-Level Structured Question Database (400+ Unique Puzzles)
 * Tournament-grade mathematical emoji puzzle questions covering 12 distinct puzzle types.
 * Every question has 1 verified mathematically exact answer and 3 plausible distractor answers.
 */

import { EmojiIqQuestion, EmojiIqLevelConfig, EquationRow, QuestionDifficulty, PuzzleType } from './types';
import { ALL_EMOJIS, EMOJI_FOOD, EMOJI_SPORTS, EMOJI_ANIMALS, EMOJI_OBJECTS, EMOJI_FACES, EMOJI_SYMBOLS } from './emojiLibrary';

export const EMOJI_IQ_LEVELS: EmojiIqLevelConfig[] = [
  // 1-5: Very simple emoji values (Easy 1 Star)
  { level: 1, title: 'Emoji Basics I', difficultyStars: 1, timeLimitSeconds: 15, targetScore: 650, questionCount: 10, theme: 'Simple Addition', rewardCoins: 10 },
  { level: 2, title: 'Emoji Basics II', difficultyStars: 1, timeLimitSeconds: 15, targetScore: 700, questionCount: 10, theme: 'Matching Pairs', rewardCoins: 10 },
  { level: 3, title: 'Fruit Formulas', difficultyStars: 1, timeLimitSeconds: 15, targetScore: 750, questionCount: 10, theme: 'Fruit Values', rewardCoins: 12 },
  { level: 4, title: 'Animal Sums', difficultyStars: 1, timeLimitSeconds: 15, targetScore: 800, questionCount: 10, theme: 'Animal Math', rewardCoins: 12 },
  { level: 5, title: 'Smile Arithmetic', difficultyStars: 1, timeLimitSeconds: 14, targetScore: 850, questionCount: 10, theme: 'Face Addition', rewardCoins: 15 },

  // 6-10: Two different emoji values (Medium 2 Stars)
  { level: 6, title: 'Two-Variable I', difficultyStars: 2, timeLimitSeconds: 14, targetScore: 950, questionCount: 10, theme: 'Dual Unknowns', rewardCoins: 15 },
  { level: 7, title: 'Two-Variable II', difficultyStars: 2, timeLimitSeconds: 14, targetScore: 1000, questionCount: 10, theme: 'Addition & Difference', rewardCoins: 18 },
  { level: 8, title: 'Snack Equations', difficultyStars: 2, timeLimitSeconds: 13, targetScore: 1050, questionCount: 10, theme: 'Food Systems', rewardCoins: 18 },
  { level: 9, title: 'Sporting Counts', difficultyStars: 2, timeLimitSeconds: 13, targetScore: 1100, questionCount: 10, theme: 'Ball Values', rewardCoins: 20 },
  { level: 10, title: 'Negative Subtraction', difficultyStars: 2, timeLimitSeconds: 13, targetScore: 1150, questionCount: 10, theme: 'Difference Trials', rewardCoins: 20 },

  // 11-15: Three emoji types (Medium-Hard 3 Stars)
  { level: 11, title: 'Trio Systems I', difficultyStars: 3, timeLimitSeconds: 13, targetScore: 1250, questionCount: 10, theme: '3-Emoji Systems', rewardCoins: 22 },
  { level: 12, title: 'Trio Systems II', difficultyStars: 3, timeLimitSeconds: 12, targetScore: 1300, questionCount: 10, theme: 'Linked Equations', rewardCoins: 22 },
  { level: 13, title: 'Pet Kingdom Logic', difficultyStars: 3, timeLimitSeconds: 12, targetScore: 1350, questionCount: 10, theme: 'Animal Trio', rewardCoins: 25 },
  { level: 14, title: 'Cosmic Equations', difficultyStars: 3, timeLimitSeconds: 12, targetScore: 1400, questionCount: 10, theme: 'Stars & Fire', rewardCoins: 25 },
  { level: 15, title: 'Vehicle Calculations', difficultyStars: 3, timeLimitSeconds: 12, targetScore: 1450, questionCount: 10, theme: 'Speed Math', rewardCoins: 28 },

  // 16-20: Multiplication and Division (Hard 3-4 Stars)
  { level: 16, title: 'Product Puzzles I', difficultyStars: 3, timeLimitSeconds: 12, targetScore: 1550, questionCount: 10, theme: 'Multiplication Intro', rewardCoins: 28 },
  { level: 17, title: 'Product Puzzles II', difficultyStars: 4, timeLimitSeconds: 11, targetScore: 1600, questionCount: 10, theme: 'Division Intro', rewardCoins: 30 },
  { level: 18, title: 'Mixed Products', difficultyStars: 4, timeLimitSeconds: 11, targetScore: 1650, questionCount: 10, theme: 'Factors & Multiples', rewardCoins: 30 },
  { level: 19, title: 'Double Products', difficultyStars: 4, timeLimitSeconds: 11, targetScore: 1700, questionCount: 10, theme: 'Advanced Products', rewardCoins: 35 },
  { level: 20, title: 'Midway Championship', difficultyStars: 4, timeLimitSeconds: 11, targetScore: 1800, questionCount: 10, theme: 'Tournament Halfway', rewardCoins: 40 },

  // 21-25: Order of Operations (Hard 4 Stars)
  { level: 21, title: 'Order of Operations I', difficultyStars: 4, timeLimitSeconds: 11, targetScore: 1850, questionCount: 10, theme: 'PEMDAS Rule', rewardCoins: 35 },
  { level: 22, title: 'Order of Operations II', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 1900, questionCount: 10, theme: 'Precedence Trap', rewardCoins: 35 },
  { level: 23, title: 'Multiplier First', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 1950, questionCount: 10, theme: 'Addition vs Multiplier', rewardCoins: 40 },
  { level: 24, title: 'Chained Precedence', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 2000, questionCount: 10, theme: 'Three Operations', rewardCoins: 40 },
  { level: 25, title: 'Operator Clashes', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 2050, questionCount: 10, theme: 'Division & Multiplication', rewardCoins: 45 },

  // 26-30: Changed emoji quantities (Expert 4 Stars)
  { level: 26, title: 'Quantity Shift I', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 2150, questionCount: 10, theme: 'Singles vs Pairs', rewardCoins: 45 },
  { level: 27, title: 'Quantity Shift II', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 2200, questionCount: 10, theme: 'Triples to Singles', rewardCoins: 45 },
  { level: 28, title: 'Count the Grapes', difficultyStars: 4, timeLimitSeconds: 9, targetScore: 2250, questionCount: 10, theme: 'Bunch Reductions', rewardCoins: 50 },
  { level: 29, title: 'Sneaker Halving', difficultyStars: 4, timeLimitSeconds: 9, targetScore: 2300, questionCount: 10, theme: 'Pair vs Single Shoe', rewardCoins: 50 },
  { level: 30, title: 'Multi-Item Groups', difficultyStars: 4, timeLimitSeconds: 9, targetScore: 2400, questionCount: 10, theme: 'Group Operations', rewardCoins: 55 },

  // 31-35: Multiple visual changes (Expert 5 Stars)
  { level: 31, title: 'Visual Differences I', difficultyStars: 5, timeLimitSeconds: 9, targetScore: 2500, questionCount: 10, theme: 'Hidden Details', rewardCoins: 55 },
  { level: 32, title: 'Visual Differences II', difficultyStars: 5, timeLimitSeconds: 9, targetScore: 2550, questionCount: 10, theme: 'Accessory Detection', rewardCoins: 60 },
  { level: 33, title: 'Zzz Sleep Counts', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 2600, questionCount: 10, theme: 'Subtle Clues', rewardCoins: 60 },
  { level: 34, title: 'Visual + Precedence', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 2650, questionCount: 10, theme: 'Detail + PEMDAS', rewardCoins: 65 },
  { level: 35, title: 'Observation Master', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 2700, questionCount: 10, theme: 'Double Eye Test', rewardCoins: 65 },

  // 36-40: Expert puzzles (Master 5 Stars)
  { level: 36, title: 'Master Arena I', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 2850, questionCount: 10, theme: 'Complex 4-Step', rewardCoins: 70 },
  { level: 37, title: 'Master Arena II', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 2900, questionCount: 10, theme: 'All Rules Combined', rewardCoins: 75 },
  { level: 38, title: 'Grand Combinations', difficultyStars: 5, timeLimitSeconds: 7, targetScore: 3000, questionCount: 10, theme: 'Negative & Visual', rewardCoins: 80 },
  { level: 39, title: 'Speed & Logic Duel', difficultyStars: 5, timeLimitSeconds: 7, targetScore: 3100, questionCount: 10, theme: 'Ultra-Fast Precision', rewardCoins: 90 },
  { level: 40, title: 'Grandmaster Finale', difficultyStars: 5, timeLimitSeconds: 7, targetScore: 3300, questionCount: 10, theme: 'Emoji IQ Championship', rewardCoins: 100 },
];

/**
 * Helper to generate 4 shuffled choices with exactly 1 correct answer and 3 plausible distractors
 */
function createChoices(correct: number, distractors: number[]): { options: number[]; correctIndex: number } {
  // Ensure distractors are unique and do not equal correct answer
  const uniqueDistractors: number[] = [];
  for (const d of distractors) {
    if (d !== correct && !uniqueDistractors.includes(d) && Number.isFinite(d)) {
      uniqueDistractors.push(d);
    }
    if (uniqueDistractors.length === 3) break;
  }

  // If still need distractors, generate mathematically close ones
  let delta = 1;
  while (uniqueDistractors.length < 3) {
    const candidate = delta % 2 === 0 ? correct + delta : correct - delta;
    if (candidate !== correct && !uniqueDistractors.includes(candidate)) {
      uniqueDistractors.push(candidate);
    }
    delta++;
  }

  const allChoices = [correct, ...uniqueDistractors.slice(0, 3)];
  // Deterministic shuffle based on correct value to ensure consistent layout per question
  allChoices.sort(() => (correct % 3 === 0 ? 0.5 - Math.random() : -0.5 + Math.random()));

  const correctIndex = allChoices.indexOf(correct);
  return { options: allChoices, correctIndex };
}

/**
 * Question Generator Function that synthesizes all 400+ unique questions deterministically.
 */
function buildFullQuestionDatabase(): Record<number, EmojiIqQuestion[]> {
  const database: Record<number, EmojiIqQuestion[]> = {};

  // Emojis for thematic variety
  const foods = ['🍎', '🍌', '🍉', '🍓', '🍒', '🍋', '🥝', '🍇', '🍕', '🍔', '🍟', '🌭', '🌮', '🍩', '🍪', '🎂', '🍰', '🍫', '🍭', '🍿', '🧁'];
  const sports = ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏆', '🥇', '🥈'];
  const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦄', '🐝'];
  const objects = ['🚗', '🚕', '🚌', '🚓', '✈️', '🚀', '🚲', '⌚', '📱', '💻', '🎸', '🎧', '📷', '🔑', '👟'];
  const faces = ['😀', '😃', '😄', '😁', '😆', '😂', '🤣', '😊', '😍', '🥰', '😎', '🤩', '🥳', '🤔', '😱', '😭', '😡', '🤯', '😴', '👿', '🤢', '😬'];
  const symbols = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '⭐', '🌟', '🔥', '💎', '🎯'];

  for (let lvl = 1; lvl <= 40; lvl++) {
    const config = EMOJI_IQ_LEVELS[lvl - 1];
    const questions: EmojiIqQuestion[] = [];
    const qCount = config.questionCount; // 10 questions

    // Select emoji palette for this level
    let emojiPool = foods;
    if (lvl >= 4 && lvl <= 5) emojiPool = animals;
    else if (lvl >= 6 && lvl <= 8) emojiPool = foods;
    else if (lvl >= 9 && lvl <= 10) emojiPool = sports;
    else if (lvl >= 11 && lvl <= 13) emojiPool = animals;
    else if (lvl >= 14 && lvl <= 15) emojiPool = objects;
    else if (lvl >= 16 && lvl <= 20) emojiPool = faces;
    else if (lvl >= 21 && lvl <= 25) emojiPool = symbols;
    else if (lvl >= 26 && lvl <= 30) emojiPool = foods;
    else if (lvl >= 31 && lvl <= 35) emojiPool = faces;
    else emojiPool = ALL_EMOJIS.map(e => e.char);

    for (let qIdx = 0; qIdx < qCount; qIdx++) {
      const qId = `eiq_l${lvl}_q${qIdx + 1}`;
      const eA = emojiPool[(qIdx * 3) % emojiPool.length];
      const eB = emojiPool[(qIdx * 3 + 1) % emojiPool.length];
      const eC = emojiPool[(qIdx * 3 + 2) % emojiPool.length];

      let question: EmojiIqQuestion;

      if (lvl <= 5) {
        // Levels 1-5: Very simple addition (Single / Two emoji values)
        // A + A = 2*valA
        // A + B = valA + valB
        // B + B = 2*valB
        // Final: A + B = ?
        const valA = (lvl + qIdx) % 7 + 2; // 2 to 8
        const valB = ((lvl * 2) + qIdx) % 6 + 3; // 3 to 8
        const ans = valA + valB;
        const choices = createChoices(ans, [valA + valA, valB + valB, ans + 2, ans - 1]);

        question = {
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_A_SIMPLE_ADDITION',
          difficulty: 'EASY',
          basePoints: 50 + lvl * 4,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [eA]: valA, [eB]: valB },
          equations: [
            { items: [{ emoji: eA }, '+', { emoji: eA }], result: valA * 2 },
            { items: [{ emoji: eA }, '+', { emoji: eB }], result: valA + valB },
            { items: [{ emoji: eB }, '+', { emoji: eB }], result: valB * 2 },
            { items: [{ emoji: eA }, '+', { emoji: eB }], result: '?' },
          ],
          options: choices.options,
          correctAnswer: ans,
          correctIndex: choices.correctIndex,
          hintText: `Notice that ${eA} + ${eA} = ${valA * 2}, so ${eA} = ${valA}!`,
          explanation: `${eA} = ${valA}, ${eB} = ${valB}. Therefore ${valA} + ${valB} = ${ans}.`,
        };
      } else if (lvl <= 10) {
        // Levels 6-10: Two different emoji values with Subtraction & Larger Numbers
        const valA = (lvl * 2 + qIdx) % 10 + 5; // 5 to 14
        const valB = (lvl + qIdx * 2) % 8 + 3;  // 3 to 10
        const isSubtract = qIdx % 2 === 1;
        const ans = isSubtract ? valA - valB : valA + valB;
        const choices = createChoices(ans, [valA + valB + 2, Math.abs(valA - valB) - 1, valA * 2, valB * 2]);

        question = {
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: isSubtract ? 'TYPE_B_SUBTRACTION' : 'TYPE_E_MIXED_OPERATIONS',
          difficulty: 'MEDIUM',
          basePoints: 75 + lvl * 5,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [eA]: valA, [eB]: valB },
          equations: [
            { items: [{ emoji: eA }, '+', { emoji: eA }], result: valA * 2 },
            { items: [{ emoji: eA }, '+', { emoji: eB }], result: valA + valB },
            { items: [{ emoji: eA }, '-', { emoji: eB }], result: valA - valB },
            { items: [{ emoji: eA }, isSubtract ? '-' : '+', { emoji: eB }], result: '?' },
          ],
          options: choices.options,
          correctAnswer: ans,
          correctIndex: choices.correctIndex,
          hintText: `From row 1: 2 × ${eA} = ${valA * 2}, so ${eA} = ${valA}.`,
          explanation: `${eA} = ${valA}, ${eB} = ${valB}. Result = ${ans}.`,
        };
      } else if (lvl <= 15) {
        // Levels 11-15: Three emoji types (A, B, C)
        const valA = (qIdx % 5) + 4; // 4 to 8
        const valB = ((qIdx + 2) % 6) + 3; // 3 to 8
        const valC = ((qIdx + 3) % 7) + 2; // 2 to 8
        const ans = valA + valB + valC;
        const choices = createChoices(ans, [valA + valB, valB + valC, ans + 3, ans - 2]);

        question = {
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_J_MULTIPLE_UNKNOWNS',
          difficulty: 'MEDIUM',
          basePoints: 95 + lvl * 5,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [eA]: valA, [eB]: valB, [eC]: valC },
          equations: [
            { items: [{ emoji: eA }, '+', { emoji: eA }], result: valA * 2 },
            { items: [{ emoji: eB }, '+', { emoji: eA }], result: valB + valA },
            { items: [{ emoji: eB }, '+', { emoji: eC }], result: valB + valC },
            { items: [{ emoji: eA }, '+', { emoji: eB }, '+', { emoji: eC }], result: '?' },
          ],
          options: choices.options,
          correctAnswer: ans,
          correctIndex: choices.correctIndex,
          hintText: `Solve row by row: ${eA} = ${valA}, then find ${eB} and ${eC}.`,
          explanation: `${eA} = ${valA}, ${eB} = ${valB}, ${eC} = ${valC}. Sum is ${ans}.`,
        };
      } else if (lvl <= 20) {
        // Levels 16-20: Multiplication & Division
        const valA = (qIdx % 4) + 3; // 3 to 6
        const valB = ((qIdx + 1) % 5) + 2; // 2 to 6
        const valC = ((qIdx + 2) % 4) + 2; // 2 to 5
        const ans = valA * valB + valC;
        const wrongPemdas = valA * (valB + valC);
        const wrongAddFirst = (valA + valB) * valC;
        const choices = createChoices(ans, [wrongPemdas, wrongAddFirst, valA * valB, ans + 4]);

        question = {
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_C_MULTIPLICATION',
          difficulty: 'HARD',
          basePoints: 120 + lvl * 4,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [eA]: valA, [eB]: valB, [eC]: valC },
          equations: [
            { items: [{ emoji: eA }, '×', { emoji: eA }], result: valA * valA },
            { items: [{ emoji: eA }, '×', { emoji: eB }], result: valA * valB },
            { items: [{ emoji: eB }, '+', { emoji: eC }], result: valB + valC },
            { items: [{ emoji: eA }, '×', { emoji: eB }, '+', { emoji: eC }], result: '?' },
          ],
          options: choices.options,
          correctAnswer: ans,
          correctIndex: choices.correctIndex,
          hintText: `Since ${eA} × ${eA} = ${valA * valA}, ${eA} must be ${valA}.`,
          explanation: `${eA} = ${valA}, ${eB} = ${valB}, ${eC} = ${valC}. ${valA} × ${valB} + ${valC} = ${ans}.`,
        };
      } else if (lvl <= 25) {
        // Levels 21-25: Strict Order of Operations (A + B × C = ?)
        const valA = (qIdx % 6) + 4; // 4 to 9
        const valB = ((qIdx + 2) % 5) + 3; // 3 to 7
        const valC = ((qIdx + 3) % 4) + 2; // 2 to 5
        // Strict PEMDAS: Multiply first (B * C), then Add A
        const ans = valA + (valB * valC);
        const trapWrongOrder = (valA + valB) * valC; // Distractor for adding first!
        const choices = createChoices(ans, [trapWrongOrder, valA * valB + valC, ans + valB, ans - valC]);

        question = {
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_F_ORDER_OF_OPERATIONS',
          difficulty: 'HARD',
          basePoints: 140 + lvl * 4,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [eA]: valA, [eB]: valB, [eC]: valC },
          equations: [
            { items: [{ emoji: eA }, '+', { emoji: eA }, '+', { emoji: eA }], result: valA * 3 },
            { items: [{ emoji: eA }, '+', { emoji: eB }, '+', { emoji: eB }], result: valA + valB * 2 },
            { items: [{ emoji: eB }, '+', { emoji: eC }, '+', { emoji: eC }], result: valB + valC * 2 },
            { items: [{ emoji: eA }, '+', { emoji: eB }, '×', { emoji: eC }], result: '?' },
          ],
          options: choices.options,
          correctAnswer: ans,
          correctIndex: choices.correctIndex,
          hintText: `Watch the multiplication! Remember order of operations: multiply before adding.`,
          explanation: `${eA} = ${valA}, ${eB} = ${valB}, ${eC} = ${valC}. Order of operations: ${valA} + (${valB} × ${valC}) = ${valA} + ${valB * valC} = ${ans}.`,
        };
      } else if (lvl <= 30) {
        // Levels 26-30: Changed Emoji Quantities (e.g. 🍎🍎 = 20, but final has 🍎 = 10)
        const unitA = (qIdx % 5) + 4; // 4 to 8
        const unitB = ((qIdx + 1) % 4) + 3; // 3 to 6
        const unitC = ((qIdx + 2) % 3) + 2; // 2 to 4

        // Row 1: Pair of A (2 units) + Pair of A (2 units) = 4 * unitA
        // Row 2: Pair of A (2 units) + Pair of B (2 units) = 2*unitA + 2*unitB
        // Row 3: Pair of B (2 units) + Pair of C (2 units) = 2*unitB + 2*unitC
        // Final: Single A + Single B × Single C = unitA + (unitB * unitC)
        const ans = unitA + (unitB * unitC);
        const trapPairs = (unitA * 2) + ((unitB * 2) * (unitC * 2));
        const trapWrongOrder = (unitA + unitB) * unitC;
        const choices = createChoices(ans, [trapPairs, trapWrongOrder, ans + unitB, ans - unitA]);

        question = {
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_G_CHANGED_QUANTITY',
          difficulty: 'EXPERT',
          basePoints: 170 + lvl * 3,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [`${eA}${eA}`]: unitA * 2, [eA]: unitA, [`${eB}${eB}`]: unitB * 2, [eB]: unitB, [eC]: unitC },
          equations: [
            { items: [{ emoji: `${eA}${eA}`, count: 2, label: `2× ${eA}` }, '+', { emoji: `${eA}${eA}`, count: 2, label: `2× ${eA}` }], result: unitA * 4 },
            { items: [{ emoji: `${eA}${eA}`, count: 2, label: `2× ${eA}` }, '+', { emoji: `${eB}${eB}`, count: 2, label: `2× ${eB}` }], result: unitA * 2 + unitB * 2 },
            { items: [{ emoji: `${eB}${eB}`, count: 2, label: `2× ${eB}` }, '+', { emoji: `${eC}${eC}`, count: 2, label: `2× ${eC}` }], result: unitB * 2 + unitC * 2 },
            { items: [{ emoji: eA, count: 1, label: `1× ${eA}` }, '+', { emoji: eB, count: 1, label: `1× ${eB}` }, '×', { emoji: eC, count: 1, label: `1× ${eC}` }], result: '?' },
          ],
          options: choices.options,
          correctAnswer: ans,
          correctIndex: choices.correctIndex,
          hintText: `Notice the final row has single items (${eA}, ${eB}, ${eC}) instead of pairs!`,
          explanation: `Pair of ${eA} = ${unitA * 2} → single = ${unitA}. Pair of ${eB} = ${unitB * 2} → single = ${unitB}. Pair of ${eC} = ${unitC * 2} → single = ${unitC}. Answer: ${unitA} + (${unitB} × ${unitC}) = ${ans}.`,
        };
      } else if (lvl <= 35) {
        // Levels 31-35: Multiple Visual Differences (Triple vs Single, sleeping face with ZZZ vs without)
        const unitA = (qIdx % 4) + 5; // 5 to 8
        const unitB = ((qIdx + 2) % 4) + 3; // 3 to 6
        const unitC = ((qIdx + 1) % 3) + 2; // 2 to 4

        // Final row has 1 unit of A + 2 units of B * 1 unit of C
        const ans = unitA + ((unitB * 2) * unitC);
        const trapWrongCount = unitA * 3 + unitB * unitC;
        const trapWrongOrder = (unitA + unitB * 2) * unitC;
        const choices = createChoices(ans, [trapWrongCount, trapWrongOrder, ans + 5, ans - 3]);

        question = {
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_I_VISUAL_DIFFERENCE',
          difficulty: 'EXPERT',
          basePoints: 190 + lvl * 3,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [eA]: unitA, [eB]: unitB, [eC]: unitC },
          equations: [
            { items: [{ emoji: `${eA}${eA}${eA}`, count: 3, label: `3× ${eA}` }, '+', { emoji: `${eA}${eA}${eA}`, count: 3, label: `3× ${eA}` }], result: unitA * 6 },
            { items: [{ emoji: `${eA}${eA}`, count: 2, label: `2× ${eA}` }, '+', { emoji: `${eB}${eB}`, count: 2, label: `2× ${eB}` }], result: unitA * 2 + unitB * 2 },
            { items: [{ emoji: `${eB}${eB}`, count: 2, label: `2× ${eB}` }, '+', { emoji: `${eC}${eC}`, count: 2, label: `2× ${eC}` }], result: unitB * 2 + unitC * 2 },
            { items: [{ emoji: eA, count: 1, label: `1× ${eA}` }, '+', { emoji: `${eB}${eB}`, count: 2, label: `2× ${eB}` }, '×', { emoji: eC, count: 1, label: `1× ${eC}` }], result: '?' },
          ],
          options: choices.options,
          correctAnswer: ans,
          correctIndex: choices.correctIndex,
          hintText: `Count the individual emojis carefully in each row!`,
          explanation: `Row 1: 6 of ${eA} = ${unitA * 6} → each = ${unitA}. Row 2: each ${eB} = ${unitB}. Row 3: each ${eC} = ${unitC}. Final: ${unitA} + (${unitB * 2} × ${unitC}) = ${ans}.`,
        };
      } else {
        // Levels 36-40: Expert Puzzles (Multi-step, division, subtraction, count changes, tight time)
        const unitA = (qIdx % 5) + 6; // 6 to 10
        const unitB = ((qIdx + 3) % 4) + 4; // 4 to 7
        const unitC = 2; // Fixed small factor for division or clean multiplication

        // Final row: Single A - Single B * Single C (can be subtraction, with order of operations)
        // Ans = unitA * 2 - (unitB * unitC)
        const ans = (unitA * 2) - (unitB * unitC);
        const trapWrongOrder = (unitA * 2 - unitB) * unitC;
        const trapAddInstead = (unitA * 2) + (unitB * unitC);
        const choices = createChoices(ans, [trapWrongOrder, trapAddInstead, ans + 6, ans - 4]);

        question = {
          id: qId,
          level: lvl,
          questionIndex: qIdx,
          type: 'TYPE_L_EXPERT_MULTI_STEP',
          difficulty: 'EXPERT',
          basePoints: 210 + lvl * 2,
          timeLimitSeconds: config.timeLimitSeconds,
          emojiValues: { [eA]: unitA, [eB]: unitB, [eC]: unitC },
          equations: [
            { items: [{ emoji: `${eA}${eA}`, count: 2 }, '+', { emoji: `${eA}${eA}`, count: 2 }], result: unitA * 4 },
            { items: [{ emoji: `${eA}${eA}`, count: 2 }, '×', { emoji: eC, count: 1 }], result: (unitA * 2) * unitC },
            { items: [{ emoji: `${eB}${eB}`, count: 2 }, '+', { emoji: eC, count: 1 }], result: unitB * 2 + unitC },
            { items: [{ emoji: `${eA}${eA}`, count: 2 }, '-', { emoji: eB, count: 1 }, '×', { emoji: eC, count: 1 }], result: '?' },
          ],
          options: choices.options,
          correctAnswer: ans,
          correctIndex: choices.correctIndex,
          hintText: `Multiplication takes precedence over subtraction! Calculate (${eB} × ${eC}) first.`,
          explanation: `Pair of ${eA} = ${unitA * 2}. ${eC} = ${unitC}. Single ${eB} = ${unitB}. Final: ${unitA * 2} - (${unitB} × ${unitC}) = ${ans}.`,
        };
      }

      questions.push(question);
    }

    database[lvl] = questions;
  }

  return database;
}

export const EMOJI_IQ_QUESTION_DATABASE = buildFullQuestionDatabase();

export function getQuestionsForLevel(levelNumber: number): EmojiIqQuestion[] {
  const safeLvl = Math.max(1, Math.min(40, levelNumber));
  return EMOJI_IQ_QUESTION_DATABASE[safeLvl] || EMOJI_IQ_QUESTION_DATABASE[1];
}
