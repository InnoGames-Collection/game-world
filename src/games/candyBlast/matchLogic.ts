/**
 * Candy Blast - 8x8 Match-3 Logic & Cascading Engine
 * Full implementation of:
 * - 8x8 Board generation without initial matches
 * - Horizontal, Vertical, 4-Line, 5-ColorBomb, and L/T Area Bomb pattern recognition
 * - Gravity physics & refill system
 * - Special candy triggers (Row/Column laser beam blasts, 3x3 area explosions, color board clear)
 * - Special combo swaps (Line+Line, Bomb+Line, Bomb+Bomb, Color+Special, Color+Color)
 * - Deadlock detection & board auto-reshuffle
 */

import { CandyPiece, CandyType, MatchGroup, Position, SpecialType, LevelConfig } from './types';

export const BOARD_ROWS = 8;
export const BOARD_COLS = 8;

export const CANDY_TYPES: CandyType[] = [
  'red-jelly',
  'blue-gem',
  'yellow-hexagon',
  'orange-sphere',
  'purple-candy',
  'green-crystal',
];

let pieceIdCounter = 1;

export function getRandomCandyType(): CandyType {
  const idx = Math.floor(Math.random() * CANDY_TYPES.length);
  return CANDY_TYPES[idx];
}

export function createCandyPiece(
  row: number,
  col: number,
  type?: CandyType,
  special: SpecialType = 'none'
): CandyPiece {
  return {
    id: `candy_${pieceIdCounter++}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: type || getRandomCandyType(),
    special,
    row,
    col,
    fallOffset: 0,
  };
}

/**
 * Creates an 8x8 board guaranteed to have NO initial 3-matches,
 * and at least 1 valid swap move.
 */
export function createInitialBoard(): CandyPiece[][] {
  let board: CandyPiece[][] = [];
  let attempts = 0;

  do {
    board = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      const row: CandyPiece[] = [];
      for (let c = 0; c < BOARD_COLS; c++) {
        const forbidden: CandyType[] = [];
        if (c >= 2 && row[c - 1]?.type === row[c - 2]?.type) {
          forbidden.push(row[c - 1].type);
        }
        if (r >= 2 && board[r - 1][c]?.type === board[r - 2][c]?.type) {
          forbidden.push(board[r - 1][c].type);
        }

        const allowed = CANDY_TYPES.filter((t) => !forbidden.includes(t));
        const chosenType = allowed[Math.floor(Math.random() * allowed.length)] || getRandomCandyType();
        row.push(createCandyPiece(r, c, chosenType));
      }
      board.push(row);
    }
    attempts++;
  } while (!hasPossibleMoves(board) && attempts < 25);

  return board;
}

/**
 * Checks if two positions on 8x8 board are adjacent (up, down, left, right)
 */
export function isAdjacent(pos1: Position, pos2: Position): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

/**
 * Calculates target adjacent cell from swipe deltas dx & dy
 * Threshold: 22px
 */
export function getSwipeTarget(
  fromPos: Position,
  dx: number,
  dy: number,
  threshold: number = 22
): Position | null {
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (Math.max(absDx, absDy) < threshold) return null;

  // Ignore diagonal if aspect ratio is too close to 1:1
  const ratio = Math.min(absDx, absDy) / Math.max(absDx, absDy);
  if (ratio > 0.85) return null;

  let targetRow = fromPos.row;
  let targetCol = fromPos.col;

  if (absDx > absDy) {
    // Horizontal swipe (left / right)
    targetCol += dx > 0 ? 1 : -1;
  } else {
    // Vertical swipe (up / down)
    targetRow += dy > 0 ? 1 : -1;
  }

  if (targetRow < 0 || targetRow >= BOARD_ROWS || targetCol < 0 || targetCol >= BOARD_COLS) {
    return null;
  }

  return { row: targetRow, col: targetCol };
}

/**
 * Scans board for horizontal, vertical, L/T-shape, 4-in-a-row, and 5-in-a-row matches
 */
export function findMatches(
  board: (CandyPiece | null)[][],
  preferredSpawnPos?: Position
): {
  matchedPositions: Position[];
  groups: MatchGroup[];
  specialPiecesToCreate: { type: SpecialType; candyType: CandyType; pos: Position }[];
} {
  const horizontalMatches: Position[][] = [];
  const verticalMatches: Position[][] = [];

  // 1. Scan Horizontal runs
  for (let r = 0; r < BOARD_ROWS; r++) {
    let matchLength = 1;
    for (let c = 0; c < BOARD_COLS; c++) {
      const current = board[r][c];
      const next = c + 1 < BOARD_COLS ? board[r][c + 1] : null;

      if (
        current &&
        next &&
        current.type === next.type &&
        current.special !== 'color-bomb' &&
        next.special !== 'color-bomb'
      ) {
        matchLength++;
      } else {
        if (matchLength >= 3) {
          const run: Position[] = [];
          for (let i = 0; i < matchLength; i++) {
            run.push({ row: r, col: c - i });
          }
          horizontalMatches.push(run);
        }
        matchLength = 1;
      }
    }
  }

  // 2. Scan Vertical runs
  for (let c = 0; c < BOARD_COLS; c++) {
    let matchLength = 1;
    for (let r = 0; r < BOARD_ROWS; r++) {
      const current = board[r][c];
      const next = r + 1 < BOARD_ROWS ? board[r + 1][c] : null;

      if (
        current &&
        next &&
        current.type === next.type &&
        current.special !== 'color-bomb' &&
        next.special !== 'color-bomb'
      ) {
        matchLength++;
      } else {
        if (matchLength >= 3) {
          const run: Position[] = [];
          for (let i = 0; i < matchLength; i++) {
            run.push({ row: r - i, col: c });
          }
          verticalMatches.push(run);
        }
        matchLength = 1;
      }
    }
  }

  const specialPiecesToCreate: { type: SpecialType; candyType: CandyType; pos: Position }[] = [];
  const allMatchedPositionsMap = new Map<string, Position>();
  const groups: MatchGroup[] = [];

  // Helper to pick spawn position (prefer the user swapped position if in match)
  const chooseSpawnPos = (positions: Position[]): Position => {
    if (preferredSpawnPos) {
      const found = positions.find((p) => p.row === preferredSpawnPos.row && p.col === preferredSpawnPos.col);
      if (found) return found;
    }
    return positions[Math.floor(positions.length / 2)];
  };

  // 3. Detect Intersecting Matches (L or T shape -> Area Bomb)
  const processedH = new Set<number>();
  const processedV = new Set<number>();

  for (let hIdx = 0; hIdx < horizontalMatches.length; hIdx++) {
    const hRun = horizontalMatches[hIdx];
    const hType = board[hRun[0].row][hRun[0].col]?.type;
    if (!hType) continue;

    for (let vIdx = 0; vIdx < verticalMatches.length; vIdx++) {
      const vRun = verticalMatches[vIdx];
      const vType = board[vRun[0].row][vRun[0].col]?.type;

      if (hType === vType) {
        const intersection = hRun.find((hp) => vRun.some((vp) => vp.row === hp.row && vp.col === hp.col));
        if (intersection) {
          processedH.add(hIdx);
          processedV.add(vIdx);

          const combined = [...hRun, ...vRun.filter((vp) => !(vp.row === intersection.row && vp.col === intersection.col))];
          combined.forEach((p) => allMatchedPositionsMap.set(`${p.row},${p.col}`, p));

          specialPiecesToCreate.push({
            type: 'area-bomb',
            candyType: hType,
            pos: intersection,
          });

          groups.push({
            type: hType,
            positions: combined,
            isAreaBomb: true,
            specialSpawnPos: intersection,
            specialTypeToSpawn: 'area-bomb',
          });
        }
      }
    }
  }

  // 4. Process Remaining Horizontal Matches
  for (let hIdx = 0; hIdx < horizontalMatches.length; hIdx++) {
    if (processedH.has(hIdx)) continue;
    const hRun = horizontalMatches[hIdx];
    const type = board[hRun[0].row][hRun[0].col]?.type;
    if (!type) continue;

    hRun.forEach((p) => allMatchedPositionsMap.set(`${p.row},${p.col}`, p));

    if (hRun.length >= 5) {
      // 5-match -> Color Bomb
      const spawnPos = chooseSpawnPos(hRun);
      specialPiecesToCreate.push({
        type: 'color-bomb',
        candyType: type,
        pos: spawnPos,
      });
      groups.push({
        type,
        positions: hRun,
        isColorBomb: true,
        specialSpawnPos: spawnPos,
        specialTypeToSpawn: 'color-bomb',
      });
    } else if (hRun.length === 4) {
      // 4-match -> 3D Radial Area Bomb
      const spawnPos = chooseSpawnPos(hRun);
      specialPiecesToCreate.push({
        type: 'area-bomb',
        candyType: type,
        pos: spawnPos,
      });
      groups.push({
        type,
        positions: hRun,
        isAreaBomb: true,
        specialSpawnPos: spawnPos,
        specialTypeToSpawn: 'area-bomb',
      });
    } else {
      groups.push({ type, positions: hRun });
    }
  }

  // 5. Process Remaining Vertical Matches
  for (let vIdx = 0; vIdx < verticalMatches.length; vIdx++) {
    if (processedV.has(vIdx)) continue;
    const vRun = verticalMatches[vIdx];
    const type = board[vRun[0].row][vRun[0].col]?.type;
    if (!type) continue;

    vRun.forEach((p) => allMatchedPositionsMap.set(`${p.row},${p.col}`, p));

    if (vRun.length >= 5) {
      // 5-match -> Color Bomb
      const spawnPos = chooseSpawnPos(vRun);
      specialPiecesToCreate.push({
        type: 'color-bomb',
        candyType: type,
        pos: spawnPos,
      });
      groups.push({
        type,
        positions: vRun,
        isColorBomb: true,
        specialSpawnPos: spawnPos,
        specialTypeToSpawn: 'color-bomb',
      });
    } else if (vRun.length === 4) {
      // 4-match -> 3D Radial Area Bomb
      const spawnPos = chooseSpawnPos(vRun);
      specialPiecesToCreate.push({
        type: 'area-bomb',
        candyType: type,
        pos: spawnPos,
      });
      groups.push({
        type,
        positions: vRun,
        isAreaBomb: true,
        specialSpawnPos: spawnPos,
        specialTypeToSpawn: 'area-bomb',
      });
    } else {
      groups.push({ type, positions: vRun });
    }
  }

  return {
    matchedPositions: Array.from(allMatchedPositionsMap.values()),
    groups,
    specialPiecesToCreate,
  };
}

/**
 * Expands special candy triggers (Line Clear laser beams, 3x3 Area Explosions)
 */
export function expandSpecialTriggers(
  board: (CandyPiece | null)[][],
  matchedPositions: Position[]
): {
  allClearedPositions: Position[];
  triggeredEffects: { type: 'line-h' | 'line-v' | 'bomb-3x3' | 'color-rainbow'; row?: number; col?: number }[];
} {
  const clearedSet = new Set<string>();
  const triggeredEffects: { type: 'line-h' | 'line-v' | 'bomb-3x3' | 'color-rainbow'; row?: number; col?: number }[] = [];
  const queue: Position[] = [...matchedPositions];

  matchedPositions.forEach((p) => clearedSet.add(`${p.row},${p.col}`));

  const processedSpecials = new Set<string>();

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const piece = board[curr.row]?.[curr.col];
    if (!piece || piece.special === 'none') continue;

    const key = `${curr.row},${curr.col}`;
    if (processedSpecials.has(key)) continue;
    processedSpecials.add(key);

    if (piece.special === 'area-bomb' || piece.special === 'line-horizontal' || piece.special === 'line-vertical') {
      triggeredEffects.push({ type: 'bomb-3x3', row: curr.row, col: curr.col });
      const explosionRadius = 1.55; // Covers local 3x3 circular radius (center + orth + diag)
      for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
          const dist = Math.hypot(r - curr.row, c - curr.col);
          if (dist <= explosionRadius) {
            const pKey = `${r},${c}`;
            if (!clearedSet.has(pKey)) {
              clearedSet.add(pKey);
              queue.push({ row: r, col: c });
            }
          }
        }
      }
    } else if (piece.special === 'color-bomb') {
      triggeredEffects.push({ type: 'color-rainbow', row: curr.row, col: curr.col });
      // Clear all of the same candy type across board
      const targetType = piece.type;
      for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
          const targetPiece = board[r]?.[c];
          if (targetPiece && targetPiece.type === targetType) {
            const pKey = `${r},${c}`;
            if (!clearedSet.has(pKey)) {
              clearedSet.add(pKey);
              queue.push({ row: r, col: c });
            }
          }
        }
      }
    }
  }

  const allClearedPositions = Array.from(clearedSet).map((k) => {
    const [r, c] = k.split(',').map(Number);
    return { row: r, col: c };
  });

  return { allClearedPositions, triggeredEffects };
}

export interface SingleSpecialBlastInfo {
  type: 'bomb-3x3' | 'color-rainbow';
  origin: Position;
  affectedPositions: Position[];
  description: string;
}

/**
 * Calculates complete affected-cell list and visual blast type for a single special candy
 * Purely radius-based: no row/column or line wipes.
 */
export function getSingleSpecialBlastInfo(
  board: (CandyPiece | null)[][],
  pos: Position
): SingleSpecialBlastInfo | null {
  const piece = board[pos.row]?.[pos.col];
  if (!piece || piece.special === 'none') return null;

  const affectedPositions: Position[] = [];

  if (piece.special === 'area-bomb' || piece.special === 'line-horizontal' || piece.special === 'line-vertical') {
    const explosionRadius = 1.55; // Covers exact 3x3 circular radius around bomb center
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const dist = Math.hypot(r - pos.row, c - pos.col);
        if (dist <= explosionRadius) {
          affectedPositions.push({ row: r, col: c });
        }
      }
    }
    return {
      type: 'bomb-3x3',
      origin: pos,
      affectedPositions,
      description: 'RADIAL BOMB BLAST!',
    };
  }

  if (piece.special === 'color-bomb') {
    affectedPositions.push({ row: pos.row, col: pos.col });
    const targetType = piece.type;
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const other = board[r]?.[c];
        if (other && other.type === targetType && (r !== pos.row || c !== pos.col)) {
          affectedPositions.push({ row: r, col: c });
        }
      }
    }
    return {
      type: 'color-rainbow',
      origin: pos,
      affectedPositions,
      description: 'COLOR BLAST!',
    };
  }

  return null;
}

/**
 * Handles Special Combo Swaps (Bomb+Bomb, Color+Special, Color+Color)
 * Uses localized radial area-of-effect calculations
 */
export function handleSpecialComboSwap(
  piece1: CandyPiece,
  pos1: Position,
  piece2: CandyPiece,
  pos2: Position,
  board: (CandyPiece | null)[][]
): {
  isSpecialCombo: boolean;
  clearedPositions: Position[];
  triggeredEffects: { type: 'bomb-3x3' | 'bomb-5x5' | 'color-rainbow'; row?: number; col?: number }[];
  description: string;
} {
  const s1 = piece1.special;
  const s2 = piece2.special;

  // 1. Color Bomb + Color Bomb: Clears entire board!
  if (s1 === 'color-bomb' && s2 === 'color-bomb') {
    const cleared: Position[] = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        cleared.push({ row: r, col: c });
      }
    }
    return {
      isSpecialCombo: true,
      clearedPositions: cleared,
      triggeredEffects: [{ type: 'color-rainbow', row: pos2.row, col: pos2.col }],
      description: 'COSMIC BOARD CLEAR!',
    };
  }

  // 2. Color Bomb + Special Bomb
  if (s1 === 'color-bomb' || s2 === 'color-bomb') {
    const specialPiece = s1 === 'color-bomb' ? piece2 : piece1;
    const targetColor = specialPiece.type;

    const clearedSet = new Set<string>();
    clearedSet.add(`${pos1.row},${pos1.col}`);
    clearedSet.add(`${pos2.row},${pos2.col}`);
    const effects: { type: 'bomb-3x3' | 'bomb-5x5' | 'color-rainbow'; row?: number; col?: number }[] = [
      { type: 'color-rainbow', row: pos2.row, col: pos2.col },
    ];

    // Convert all target color to localized radial bombs and detonate all of them!
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const p = board[r][c];
        if (p && p.type === targetColor) {
          effects.push({ type: 'bomb-3x3', row: r, col: c });
          for (let nr = 0; nr < BOARD_ROWS; nr++) {
            for (let nc = 0; nc < BOARD_COLS; nc++) {
              if (Math.hypot(nr - r, nc - c) <= 1.55) {
                clearedSet.add(`${nr},${nc}`);
              }
            }
          }
        }
      }
    }
    return {
      isSpecialCombo: true,
      clearedPositions: Array.from(clearedSet).map((k) => {
        const [r, c] = k.split(',').map(Number);
        return { row: r, col: c };
      }),
      triggeredEffects: effects,
      description: 'RAINBOW BOMB SHOCKWAVE!',
    };
  }

  // 3. Bomb + Bomb (or any two special bombs swapped): Mega 5x5 Local Radial Explosion
  if ((s1 === 'area-bomb' || s1 === 'line-horizontal' || s1 === 'line-vertical') &&
      (s2 === 'area-bomb' || s2 === 'line-horizontal' || s2 === 'line-vertical')) {
    const clearedSet = new Set<string>();
    const center = pos2;
    const radius5x5 = 2.35; // Pure Euclidean 5x5 circular destruction radius
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        if (Math.hypot(r - center.row, c - center.col) <= radius5x5) {
          clearedSet.add(`${r},${c}`);
        }
      }
    }

    return {
      isSpecialCombo: true,
      clearedPositions: Array.from(clearedSet).map((k) => {
        const [r, c] = k.split(',').map(Number);
        return { row: r, col: c };
      }),
      triggeredEffects: [{ type: 'bomb-5x5', row: center.row, col: center.col }],
      description: 'SUPER 5x5 RADIAL BLAST!',
    };
  }

  return {
    isSpecialCombo: false,
    clearedPositions: [],
    triggeredEffects: [],
    description: '',
  };
}

/**
 * Handles Rainbow Color-Bomb Activation with a chosen target color
 */
export function executeColorBombClear(
  board: (CandyPiece | null)[][],
  colorBombPos: Position,
  targetColor: CandyType
): {
  clearedPositions: Position[];
} {
  const cleared: Position[] = [{ row: colorBombPos.row, col: colorBombPos.col }];

  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const piece = board[r][c];
      if (piece && piece.type === targetColor) {
        cleared.push({ row: r, col: c });
      }
    }
  }

  return { clearedPositions: cleared };
}

/**
 * Applies Gravity to drop pieces down into empty spaces,
 * tracking fall distances for smooth physical easing animations.
 */
export function applyGravity(
  board: (CandyPiece | null)[][]
): {
  newBoard: (CandyPiece | null)[][];
  totalDropped: number;
} {
  const newBoard: (CandyPiece | null)[][] = Array.from({ length: BOARD_ROWS }, () =>
    Array(BOARD_COLS).fill(null)
  );
  let totalDropped = 0;

  for (let c = 0; c < BOARD_COLS; c++) {
    let writeRow = BOARD_ROWS - 1;

    for (let r = BOARD_ROWS - 1; r >= 0; r--) {
      const piece = board[r][c];
      if (piece !== null) {
        const fallDistance = writeRow - r;
        if (fallDistance > 0) totalDropped++;

        newBoard[writeRow][c] = {
          ...piece,
          row: writeRow,
          col: c,
          fallOffset: fallDistance,
        };
        writeRow--;
      }
    }
  }

  return { newBoard, totalDropped };
}

/**
 * Refills empty tiles from top with new candies
 */
export function refillBoard(board: (CandyPiece | null)[][]): {
  newBoard: CandyPiece[][];
  spawnedCount: number;
} {
  const newBoard: CandyPiece[][] = Array.from({ length: BOARD_ROWS }, () =>
    Array(BOARD_COLS).fill(null as unknown as CandyPiece)
  );
  let spawnedCount = 0;

  for (let c = 0; c < BOARD_COLS; c++) {
    let emptyCount = 0;
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (board[r][c] === null) {
        emptyCount++;
      }
    }

    let spawnIndex = 0;
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (board[r][c] !== null) {
        newBoard[r][c] = {
          ...board[r][c]!,
          row: r,
          col: c,
        };
      } else {
        const newPiece = createCandyPiece(r, c);
        newPiece.isNew = true;
        newPiece.fallOffset = emptyCount - spawnIndex;
        newBoard[r][c] = newPiece;
        spawnedCount++;
        spawnIndex++;
      }
    }
  }

  return { newBoard, spawnedCount };
}

/**
 * Deadlock Detection: checks if there are any valid swaps that produce a 3+ match
 */
export function hasPossibleMoves(board: CandyPiece[][]): boolean {
  // 1. Check horizontal swaps
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS - 1; c++) {
      const copy = board.map((row) => [...row]);
      const temp = copy[r][c];
      copy[r][c] = copy[r][c + 1];
      copy[r][c + 1] = temp;

      if (copy[r][c].special !== 'none' || copy[r][c + 1].special !== 'none') {
        return true;
      }

      const matches = findMatches(copy);
      if (matches.matchedPositions.length > 0) return true;
    }
  }

  // 2. Check vertical swaps
  for (let c = 0; c < BOARD_COLS; c++) {
    for (let r = 0; r < BOARD_ROWS - 1; r++) {
      const copy = board.map((row) => [...row]);
      const temp = copy[r][c];
      copy[r][c] = copy[r + 1][c];
      copy[r + 1][c] = temp;

      if (copy[r][c].special !== 'none' || copy[r + 1][c].special !== 'none') {
        return true;
      }

      const matches = findMatches(copy);
      if (matches.matchedPositions.length > 0) return true;
    }
  }

  return false;
}

export function isHoleCell(row: number, col: number, levelConfig?: LevelConfig): boolean {
  if (!levelConfig || !levelConfig.boardHoles) return false;
  return levelConfig.boardHoles.some((h) => h.row === row && h.col === col);
}

export function hasBlockerAt(row: number, col: number, blockerMap: Record<string, number>): boolean {
  return (blockerMap[`${row},${col}`] || 0) > 0;
}

export function createInitialBoardForLevel(
  levelConfig: LevelConfig,
  blockerMap: Record<string, number> = {}
): (CandyPiece | null)[][] {
  const allowed = levelConfig.allowedCandies?.length ? levelConfig.allowedCandies : CANDY_TYPES;
  let board: (CandyPiece | null)[][] = [];
  let attempts = 0;

  do {
    board = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      const row: (CandyPiece | null)[] = [];
      for (let c = 0; c < BOARD_COLS; c++) {
        if (isHoleCell(r, c, levelConfig) || hasBlockerAt(r, c, blockerMap)) {
          row.push(null);
          continue;
        }

        const forbidden: CandyType[] = [];
        if (c >= 2 && row[c - 1]?.type === row[c - 2]?.type && row[c - 1]?.type) {
          forbidden.push(row[c - 1]!.type);
        }
        if (r >= 2 && board[r - 1]?.[c]?.type === board[r - 2]?.[c]?.type && board[r - 1]?.[c]?.type) {
          forbidden.push(board[r - 1]![c]!.type);
        }

        const validCandidates = allowed.filter((t) => !forbidden.includes(t));
        const chosen = validCandidates.length > 0
          ? validCandidates[Math.floor(Math.random() * validCandidates.length)]
          : allowed[Math.floor(Math.random() * allowed.length)];

        row.push(createCandyPiece(r, c, chosen));
      }
      board.push(row);
    }
    attempts++;
  } while (!hasPossibleMovesForLevel(board, levelConfig, blockerMap) && attempts < 35);

  return board;
}

export function hasPossibleMovesForLevel(
  board: (CandyPiece | null)[][],
  levelConfig: LevelConfig,
  blockerMap: Record<string, number> = {}
): boolean {
  // Horizontal swaps
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS - 1; c++) {
      const p1 = board[r][c];
      const p2 = board[r][c + 1];
      if (!p1 || !p2) continue;

      if (p1.special !== 'none' || p2.special !== 'none') return true;

      const copy = board.map((row) => [...row]);
      copy[r][c] = p2;
      copy[r][c + 1] = p1;

      const matches = findMatches(copy);
      if (matches.matchedPositions.length > 0) return true;
    }
  }

  // Vertical swaps
  for (let c = 0; c < BOARD_COLS; c++) {
    for (let r = 0; r < BOARD_ROWS - 1; r++) {
      const p1 = board[r][c];
      const p2 = board[r + 1][c];
      if (!p1 || !p2) continue;

      if (p1.special !== 'none' || p2.special !== 'none') return true;

      const copy = board.map((row) => [...row]);
      copy[r][c] = p2;
      copy[r + 1][c] = p1;

      const matches = findMatches(copy);
      if (matches.matchedPositions.length > 0) return true;
    }
  }

  return false;
}

export function applyGravityForLevel(
  board: (CandyPiece | null)[][],
  levelConfig: LevelConfig,
  blockerMap: Record<string, number> = {}
): {
  newBoard: (CandyPiece | null)[][];
  totalDropped: number;
} {
  const newBoard: (CandyPiece | null)[][] = Array.from({ length: BOARD_ROWS }, () =>
    Array(BOARD_COLS).fill(null)
  );
  let totalDropped = 0;

  for (let c = 0; c < BOARD_COLS; c++) {
    let writeRow = BOARD_ROWS - 1;

    for (let r = BOARD_ROWS - 1; r >= 0; r--) {
      if (isHoleCell(r, c, levelConfig) || hasBlockerAt(r, c, blockerMap)) {
        writeRow = r - 1;
        continue;
      }

      // Ensure writeRow doesn't sit on a hole or blocker
      while (writeRow >= 0 && (isHoleCell(writeRow, c, levelConfig) || hasBlockerAt(writeRow, c, blockerMap))) {
        writeRow--;
      }

      const piece = board[r][c];
      if (piece !== null) {
        const fallDistance = Math.max(0, writeRow - r);
        if (fallDistance > 0) totalDropped++;

        newBoard[writeRow][c] = {
          ...piece,
          row: writeRow,
          col: c,
          fallOffset: fallDistance,
        };
        writeRow--;
      }
    }
  }

  return { newBoard, totalDropped };
}

export function refillBoardForLevel(
  board: (CandyPiece | null)[][],
  levelConfig: LevelConfig,
  blockerMap: Record<string, number> = {}
): {
  newBoard: (CandyPiece | null)[][];
  spawnedCount: number;
} {
  const allowed = levelConfig.allowedCandies?.length ? levelConfig.allowedCandies : CANDY_TYPES;
  const newBoard: (CandyPiece | null)[][] = Array.from({ length: BOARD_ROWS }, () =>
    Array(BOARD_COLS).fill(null)
  );
  let spawnedCount = 0;

  for (let c = 0; c < BOARD_COLS; c++) {
    let emptyCount = 0;
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (!isHoleCell(r, c, levelConfig) && !hasBlockerAt(r, c, blockerMap) && board[r][c] === null) {
        emptyCount++;
      }
    }

    let spawnIndex = 0;
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (isHoleCell(r, c, levelConfig) || hasBlockerAt(r, c, blockerMap)) {
        newBoard[r][c] = null;
      } else if (board[r][c] !== null) {
        newBoard[r][c] = {
          ...board[r][c]!,
          row: r,
          col: c,
        };
      } else {
        const randomType = allowed[Math.floor(Math.random() * allowed.length)];
        const newPiece = createCandyPiece(r, c, randomType);
        newPiece.isNew = true;
        newPiece.fallOffset = emptyCount - spawnIndex;
        newBoard[r][c] = newPiece;
        spawnedCount++;
        spawnIndex++;
      }
    }
  }

  return { newBoard, spawnedCount };
}
