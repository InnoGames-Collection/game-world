/**
 * World Legends - Scoring Formula & Letter Values
 */

export const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4,
  I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3,
  Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8,
  Y: 4, Z: 10
};

export const getLetterValue = (char: string): number => {
  return LETTER_VALUES[char.toUpperCase()] || 1;
};

export function calculateWordPoints(word: string): number {
  const len = word.length;
  let lenBonus = 0;
  if (len === 2) lenBonus = 2;
  else if (len === 3) lenBonus = 5;
  else if (len === 4) lenBonus = 10;
  else if (len === 5) lenBonus = 15;
  else if (len === 6) lenBonus = 20;
  else if (len >= 7) lenBonus = 25;

  return len * 2 + lenBonus;
}
