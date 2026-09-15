/**
 * Solitaire Core Engine & Klondike Rules Logic
 * 52-card deterministic deal generator, move validators,
 * auto-move resolver, deadlock detector, and state checkers.
 */

import { Card, Suit, Rank, SuitColor, GameMode } from './types';

export const SUITS: Suit[] = ['spades', 'clubs', 'diamonds', 'hearts'];

export const getSuitColor = (suit: Suit): SuitColor => {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
};

/**
 * Seeded PRNG (Mulberry32) for reproducible, deterministic card deals
 */
export function mulberry32(seed: number) {
  let s = Math.floor(seed) || 1;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a full standard 52-card deck
 */
export function createStandardDeck(): Card[] {
  const deck: Card[] = [];
  SUITS.forEach((suit) => {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({
        id: `${suit}_${rank}`,
        suit,
        rank: rank as Rank,
        isFaceUp: false,
      });
    }
  });
  return deck;
}

/**
 * Deterministic Fisher-Yates shuffle with seed
 */
export function shuffleDeck(deck: Card[], seed: number): Card[] {
  const random = mulberry32(seed);
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Initial Deal for Klondike Solitaire:
 * - 7 tableau columns (Col 0: 1 card, Col 1: 2 cards... Col 6: 7 cards).
 * - Only top card of each column is face-up.
 * - Remaining 24 cards go to Stock (face-down).
 */
export interface InitialBoardState {
  tableau: Card[][];
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
}

export function dealInitialBoard(seed: number): InitialBoardState {
  const deck = shuffleDeck(createStandardDeck(), seed);
  const tableau: Card[][] = [[], [], [], [], [], [], []];
  let deckIndex = 0;

  // Deal tableau: 1 to 7 cards
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[deckIndex++] };
      // Top card of each column is face-up
      card.isFaceUp = row === col;
      tableau[col].push(card);
    }
  }

  // Remaining cards go to Stock (face-down)
  const stock: Card[] = [];
  while (deckIndex < deck.length) {
    stock.push({ ...deck[deckIndex++], isFaceUp: false });
  }

  return {
    tableau,
    stock,
    waste: [],
    foundations: [[], [], [], []],
  };
}

/**
 * Foundation Move Validation:
 * - Must be same suit
 * - Empty foundation accepts Ace (rank 1)
 * - Non-empty accepts exact next rank (top.rank + 1)
 */
export function canMoveToFoundation(card: Card, foundationPile: Card[]): boolean {
  if (foundationPile.length === 0) {
    return card.rank === 1; // Must be Ace
  }
  const top = foundationPile[foundationPile.length - 1];
  return card.suit === top.suit && card.rank === top.rank + 1;
}

/**
 * Tableau Move Validation:
 * - Empty column accepts King (rank 13) ONLY
 * - Non-empty accepts card with:
 *   - Opposite color
 *   - Rank exactly 1 less than target top card
 */
export function canMoveToTableau(card: Card, tableauPile: Card[]): boolean {
  if (tableauPile.length === 0) {
    return card.rank === 13; // King rule
  }
  const top = tableauPile[tableauPile.length - 1];
  if (!top.isFaceUp) return false;

  const isOppositeColor = getSuitColor(card.suit) !== getSuitColor(top.suit);
  const isOneRankLower = card.rank === top.rank - 1;
  return isOppositeColor && isOneRankLower;
}

/**
 * Validates moving a substack to tableau
 */
export function canMoveSubstackToTableau(substack: Card[], tableauPile: Card[]): boolean {
  if (substack.length === 0) return false;
  const leadCard = substack[0];
  return canMoveToTableau(leadCard, tableauPile);
}

/**
 * Find best auto-move target for a tapped card
 * 1. Checks Foundations first (Aces, next in sequence)
 * 2. Checks Tableau columns next (alternating colors, descending)
 */
export function findBestAutoMove(
  card: Card,
  source: { type: 'tableau' | 'waste'; colIndex?: number; cardIndex?: number },
  state: InitialBoardState
): { dest: 'foundation' | 'tableau'; destIndex: number } | null {
  // If moving a single card, check foundation first
  const isSingleCard =
    source.type === 'waste' ||
    (source.type === 'tableau' &&
      source.colIndex !== undefined &&
      source.cardIndex !== undefined &&
      source.cardIndex === state.tableau[source.colIndex].length - 1);

  if (isSingleCard) {
    for (let f = 0; f < 4; f++) {
      if (canMoveToFoundation(card, state.foundations[f])) {
        return { dest: 'foundation', destIndex: f };
      }
    }
  }

  // Check tableau columns (skip own column if source is tableau)
  for (let t = 0; t < 7; t++) {
    if (source.type === 'tableau' && source.colIndex === t) continue;
    if (canMoveToTableau(card, state.tableau[t])) {
      return { dest: 'tableau', destIndex: t };
    }
  }

  return null;
}

/**
 * Check if the entire game is won (all 4 foundations have 13 cards = 52 cards)
 */
export function isGameWon(foundations: Card[][]): boolean {
  return foundations.every((pile) => pile.length === 13);
}

/**
 * Check if the game is ready for Auto-Complete
 * Requirements:
 * - Stock is empty
 * - Waste is empty
 * - No face-down cards remain anywhere in tableau
 */
export function canAutoComplete(state: InitialBoardState): boolean {
  if (state.stock.length > 0 || state.waste.length > 0) return false;
  for (const col of state.tableau) {
    for (const card of col) {
      if (!card.isFaceUp) return false;
    }
  }
  return true;
}

/**
 * Deadlock / Legal Moves Detector
 */
export function hasAnyLegalMoves(state: InitialBoardState, mode: GameMode): boolean {
  // 1. Can we draw from stock or recycle waste?
  if (state.stock.length > 0 || state.waste.length > 0) {
    return true;
  }

  // 2. Can waste top card move to foundation or tableau?
  if (state.waste.length > 0) {
    const topWaste = state.waste[state.waste.length - 1];
    for (let f = 0; f < 4; f++) {
      if (canMoveToFoundation(topWaste, state.foundations[f])) return true;
    }
    for (let t = 0; t < 7; t++) {
      if (canMoveToTableau(topWaste, state.tableau[t])) return true;
    }
  }

  // 3. Can any face-up card in tableau move to foundation?
  for (let c = 0; c < 7; c++) {
    const col = state.tableau[c];
    if (col.length > 0) {
      const top = col[col.length - 1];
      if (top.isFaceUp) {
        for (let f = 0; f < 4; f++) {
          if (canMoveToFoundation(top, state.foundations[f])) return true;
        }
      }
    }
  }

  // 4. Can any face-up sequence in tableau move to another tableau column?
  for (let c = 0; c < 7; c++) {
    const col = state.tableau[c];
    for (let r = 0; r < col.length; r++) {
      const card = col[r];
      if (card.isFaceUp) {
        const substack = col.slice(r);
        for (let targetC = 0; targetC < 7; targetC++) {
          if (c === targetC) continue;
          // Don't move a King from an empty column base to another empty column
          if (r === 0 && card.rank === 13 && state.tableau[targetC].length === 0) continue;
          if (canMoveSubstackToTableau(substack, state.tableau[targetC])) return true;
        }
      }
    }
  }

  return false;
}
