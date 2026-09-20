/**
 * Polyomino Shape Definitions and Intelligent Piece Generation
 * Features 25+ canonical polyomino shapes, distinct visual styling,
 * and guaranteed variety (no duplicate shapes in the tray, fair difficulty progression).
 */

import { BlockColor, PolyominoShape, TrayPiece, GridCell } from './types';

export type ShapeCategory =
  | 'dot'
  | 'domino'
  | 'tromino_line'
  | 'tromino_corner'
  | 'tetromino_square'
  | 'tetromino_line'
  | 'tetromino_l'
  | 'tetromino_t'
  | 'tetromino_skew'
  | 'pentomino_line'
  | 'pentomino_cross'
  | 'pentomino_u'
  | 'pentomino_corner';

export interface DefinedShape extends PolyominoShape {
  category: ShapeCategory;
  cellCount: number;
}

export const ALL_SHAPES: DefinedShape[] = [
  // ==========================================
  // 1-CELL: Dot (■)
  // ==========================================
  {
    id: 'dot',
    name: '1x1 Dot',
    matrix: [[1]],
    color: 'yellow',
    category: 'dot',
    cellCount: 1,
    difficultyWeight: 1,
  },

  // ==========================================
  // 2-CELL: Dominoes (■■)
  // ==========================================
  {
    id: 'domino_h',
    name: '2x1 Line',
    matrix: [[1, 1]],
    color: 'cyan',
    category: 'domino',
    cellCount: 2,
    difficultyWeight: 1,
  },
  {
    id: 'domino_v',
    name: '1x2 Line',
    matrix: [[1], [1]],
    color: 'cyan',
    category: 'domino',
    cellCount: 2,
    difficultyWeight: 1,
  },

  // ==========================================
  // 3-CELL: Tromino Lines (■■■)
  // ==========================================
  {
    id: 'tromino_h',
    name: '3x1 Line',
    matrix: [[1, 1, 1]],
    color: 'green',
    category: 'tromino_line',
    cellCount: 3,
    difficultyWeight: 1,
  },
  {
    id: 'tromino_v',
    name: '1x3 Line',
    matrix: [[1], [1], [1]],
    color: 'green',
    category: 'tromino_line',
    cellCount: 3,
    difficultyWeight: 1,
  },

  // ==========================================
  // 3-CELL: Tromino Corners (L-3 in all 4 orientations)
  // ==========================================
  {
    id: 'corner_3_tl',
    name: 'Corner 3 Top-Left',
    matrix: [
      [1, 1],
      [1, 0],
    ],
    color: 'orange',
    category: 'tromino_corner',
    cellCount: 3,
    difficultyWeight: 1,
  },
  {
    id: 'corner_3_tr',
    name: 'Corner 3 Top-Right',
    matrix: [
      [1, 1],
      [0, 1],
    ],
    color: 'orange',
    category: 'tromino_corner',
    cellCount: 3,
    difficultyWeight: 1,
  },
  {
    id: 'corner_3_bl',
    name: 'Corner 3 Bottom-Left',
    matrix: [
      [1, 0],
      [1, 1],
    ],
    color: 'orange',
    category: 'tromino_corner',
    cellCount: 3,
    difficultyWeight: 1,
  },
  {
    id: 'corner_3_br',
    name: 'Corner 3 Bottom-Right',
    matrix: [
      [0, 1],
      [1, 1],
    ],
    color: 'orange',
    category: 'tromino_corner',
    cellCount: 3,
    difficultyWeight: 1,
  },

  // ==========================================
  // 4-CELL: 2x2 Square (■■ / ■■)
  // ==========================================
  {
    id: 'square_2x2',
    name: '2x2 Square',
    matrix: [
      [1, 1],
      [1, 1],
    ],
    color: 'magenta',
    category: 'tetromino_square',
    cellCount: 4,
    difficultyWeight: 2,
  },

  // ==========================================
  // 4-CELL: Tetromino Lines (■■■■)
  // ==========================================
  {
    id: 'tetromino_h',
    name: '4x1 Line',
    matrix: [[1, 1, 1, 1]],
    color: 'cyan',
    category: 'tetromino_line',
    cellCount: 4,
    difficultyWeight: 2,
  },
  {
    id: 'tetromino_v',
    name: '1x4 Line',
    matrix: [[1], [1], [1], [1]],
    color: 'cyan',
    category: 'tetromino_line',
    cellCount: 4,
    difficultyWeight: 2,
  },

  // ==========================================
  // 4-CELL: L-Shapes (3+1) and J-Shapes
  // ==========================================
  {
    id: 'l_4_bl',
    name: 'L-4 Bottom-Left',
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    color: 'purple',
    category: 'tetromino_l',
    cellCount: 4,
    difficultyWeight: 2,
  },
  {
    id: 'l_4_br',
    name: 'L-4 Bottom-Right',
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    color: 'purple',
    category: 'tetromino_l',
    cellCount: 4,
    difficultyWeight: 2,
  },
  {
    id: 'l_4_tl',
    name: 'L-4 Top-Left',
    matrix: [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    color: 'purple',
    category: 'tetromino_l',
    cellCount: 4,
    difficultyWeight: 2,
  },
  {
    id: 'l_4_tr',
    name: 'L-4 Top-Right',
    matrix: [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
    color: 'purple',
    category: 'tetromino_l',
    cellCount: 4,
    difficultyWeight: 2,
  },
  {
    id: 'l_4_h_bottom',
    name: 'L-4 Horizontal Down',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    color: 'purple',
    category: 'tetromino_l',
    cellCount: 4,
    difficultyWeight: 2,
  },
  {
    id: 'l_4_h_top',
    name: 'L-4 Horizontal Up',
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 'purple',
    category: 'tetromino_l',
    cellCount: 4,
    difficultyWeight: 2,
  },

  // ==========================================
  // 4-CELL: T-Shapes
  // ==========================================
  {
    id: 't_down',
    name: 'T-Shape Down',
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: 'magenta',
    category: 'tetromino_t',
    cellCount: 4,
    difficultyWeight: 2,
  },
  {
    id: 't_up',
    name: 'T-Shape Up',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: 'magenta',
    category: 'tetromino_t',
    cellCount: 4,
    difficultyWeight: 2,
  },
  {
    id: 't_left',
    name: 'T-Shape Left',
    matrix: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    color: 'magenta',
    category: 'tetromino_t',
    cellCount: 4,
    difficultyWeight: 2,
  },
  {
    id: 't_right',
    name: 'T-Shape Right',
    matrix: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    color: 'magenta',
    category: 'tetromino_t',
    cellCount: 4,
    difficultyWeight: 2,
  },

  // ==========================================
  // 4-CELL: S & Z Skew Shapes
  // ==========================================
  {
    id: 's_h',
    name: 'S-Shape H',
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 'green',
    category: 'tetromino_skew',
    cellCount: 4,
    difficultyWeight: 2,
  },
  {
    id: 's_v',
    name: 'S-Shape V',
    matrix: [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    color: 'green',
    category: 'tetromino_skew',
    cellCount: 4,
    difficultyWeight: 2,
  },
  {
    id: 'z_h',
    name: 'Z-Shape H',
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 'orange',
    category: 'tetromino_skew',
    cellCount: 4,
    difficultyWeight: 2,
  },
  {
    id: 'z_v',
    name: 'Z-Shape V',
    matrix: [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    color: 'orange',
    category: 'tetromino_skew',
    cellCount: 4,
    difficultyWeight: 2,
  },

  // ==========================================
  // 5-CELL: Pentomino Lines (■■■■■)
  // ==========================================
  {
    id: 'pentomino_h',
    name: '5x1 Line',
    matrix: [[1, 1, 1, 1, 1]],
    color: 'cyan',
    category: 'pentomino_line',
    cellCount: 5,
    difficultyWeight: 3,
  },
  {
    id: 'pentomino_v',
    name: '1x5 Line',
    matrix: [[1], [1], [1], [1], [1]],
    color: 'cyan',
    category: 'pentomino_line',
    cellCount: 5,
    difficultyWeight: 3,
  },

  // ==========================================
  // 5-CELL: Plus Cross (1-3-1)
  // ==========================================
  {
    id: 'cross_plus',
    name: 'Plus Cross',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: 'purple',
    category: 'pentomino_cross',
    cellCount: 5,
    difficultyWeight: 3,
  },

  // ==========================================
  // 5-CELL: U-Shape
  // ==========================================
  {
    id: 'u_shape',
    name: 'U-Shape',
    matrix: [
      [1, 0, 1],
      [1, 1, 1],
    ],
    color: 'orange',
    category: 'pentomino_u',
    cellCount: 5,
    difficultyWeight: 3,
  },

  // ==========================================
  // 5-CELL: Large 3x3 Corners
  // ==========================================
  {
    id: 'corner_5_tl',
    name: 'Large Corner TL',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
    color: 'yellow',
    category: 'pentomino_corner',
    cellCount: 5,
    difficultyWeight: 3,
  },
  {
    id: 'corner_5_br',
    name: 'Large Corner BR',
    matrix: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 'yellow',
    category: 'pentomino_corner',
    cellCount: 5,
    difficultyWeight: 3,
  },
];

/**
 * Check if a shape can be placed on a grid at (targetR, targetC)
 */
export function canPlaceShapeOnGrid(
  grid: GridCell[][],
  shape: PolyominoShape,
  targetR: number,
  targetC: number
): boolean {
  const rows = shape.matrix.length;
  const cols = shape.matrix[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (shape.matrix[r][c] === 1) {
        const gr = targetR + r;
        const gc = targetC + c;
        if (gr < 0 || gr >= 10 || gc < 0 || gc >= 10) return false;
        const cell = grid[gr]?.[gc];
        if (!cell || cell.occupied || cell.blocker === 'locked' || cell.blocker === 'stone') {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Check if a shape has ANY valid placement on the given 10x10 board
 */
export function shapeHasAnyPlacement(grid: GridCell[][], shape: PolyominoShape): boolean {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if (canPlaceShapeOnGrid(grid, shape, r, c)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Generate 3 tray pieces with guaranteed variety:
 * - NO DUPLICATE SHAPES in the same tray (all 3 IDs are distinct)
 * - Maximum variety of categories and colors
 * - Progressive difficulty based on level
 * - Always ensures at least one small/medium piece (size <= 3) so tray remains playable
 * - If boardGrid is provided, prioritizes shapes that can legally fit to avoid immediate lockups
 */
export function generateTrayPieces(
  levelId: number,
  stepIndex: number,
  difficultyTier: number, // 1 (beginner) to 8 (master)
  allowedShapeIds?: string[],
  currentGrid?: GridCell[][]
): TrayPiece[] {
  // Filter base pool by level tier
  let eligibleShapes: DefinedShape[];

  if (allowedShapeIds && allowedShapeIds.length > 0) {
    eligibleShapes = ALL_SHAPES.filter((s) => allowedShapeIds.includes(s.id));
  } else if (difficultyTier <= 1) {
    // Level 1: 1-cell, 2-cell, 3-cell lines, 3-cell corners, 2x2 square
    eligibleShapes = ALL_SHAPES.filter((s) => s.cellCount <= 3 || s.id === 'square_2x2');
  } else if (difficultyTier <= 2) {
    // Level 2: Adds tetrominoes (up to 4 cells)
    eligibleShapes = ALL_SHAPES.filter((s) => s.cellCount <= 4);
  } else if (difficultyTier <= 4) {
    // Levels 3-5: Mixed pool with small weight on pentominoes
    eligibleShapes = ALL_SHAPES.filter((s) => s.difficultyWeight <= 3);
  } else {
    // Master levels: Full library
    eligibleShapes = ALL_SHAPES;
  }

  if (eligibleShapes.length < 3) {
    eligibleShapes = ALL_SHAPES;
  }

  // Shuffle candidate pool
  const pool = [...eligibleShapes].sort(() => Math.random() - 0.5);

  const selectedShapes: DefinedShape[] = [];
  const usedCategories = new Set<string>();
  const usedColors = new Set<string>();

  // Slot 1: Must be an accessible piece (cellCount <= 3) to guarantee playability
  const smallCandidates = pool.filter((s) => s.cellCount <= 3);
  const firstChoice = smallCandidates.length > 0
    ? smallCandidates[Math.floor(Math.random() * smallCandidates.length)]
    : pool[0];

  selectedShapes.push(firstChoice);
  usedCategories.add(firstChoice.category);
  usedColors.add(firstChoice.color);

  // Slot 2: Distinct shape, preferably different category & color
  const slot2Candidates = pool.filter(
    (s) =>
      s.id !== firstChoice.id &&
      !selectedShapes.some((sel) => sel.id === s.id) &&
      !usedCategories.has(s.category)
  );
  const secondChoice = slot2Candidates.length > 0
    ? slot2Candidates[Math.floor(Math.random() * slot2Candidates.length)]
    : pool.find((s) => s.id !== firstChoice.id) || pool[1];

  selectedShapes.push(secondChoice);
  usedCategories.add(secondChoice.category);
  usedColors.add(secondChoice.color);

  // Slot 3: Distinct shape, strictly no duplicates in tray
  const slot3Candidates = pool.filter(
    (s) =>
      !selectedShapes.some((sel) => sel.id === s.id) &&
      !usedCategories.has(s.category) &&
      !usedColors.has(s.color)
  );
  const fallbackSlot3 = pool.filter((s) => !selectedShapes.some((sel) => sel.id === s.id));
  const thirdChoice = slot3Candidates.length > 0
    ? slot3Candidates[Math.floor(Math.random() * slot3Candidates.length)]
    : fallbackSlot3.length > 0
    ? fallbackSlot3[Math.floor(Math.random() * fallbackSlot3.length)]
    : pool[2];

  selectedShapes.push(thirdChoice);

  // If a grid is passed, ensure that at least 1 or 2 pieces can legally fit
  if (currentGrid) {
    const hasAnyFit = selectedShapes.some((s) => shapeHasAnyPlacement(currentGrid, s));
    if (!hasAnyFit) {
      // Replace the largest shape with a 1x1 dot or 2x1 domino that CAN fit
      const fitPool = ALL_SHAPES.filter((s) => s.cellCount <= 2 && shapeHasAnyPlacement(currentGrid, s));
      if (fitPool.length > 0) {
        selectedShapes[0] = fitPool[Math.floor(Math.random() * fitPool.length)];
      }
    }
  }

  // Map to TrayPiece format with unique instanceIds
  return selectedShapes.map((shape, idx) => ({
    instanceId: `piece-${levelId}-${stepIndex}-${idx}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    shape: { ...shape },
    placed: false,
  }));
}
