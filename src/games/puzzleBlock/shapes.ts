/**
 * Polyomino Shape Definitions and Deterministic Piece Generation
 */

import { BlockColor, PolyominoShape, TrayPiece } from './types';

export const ALL_SHAPES: PolyominoShape[] = [
  // 1-cell (dot)
  {
    id: 'dot',
    name: '1x1 Dot',
    matrix: [[1]],
    color: 'yellow',
    difficultyWeight: 1,
  },

  // 2-cell dominoes
  {
    id: 'domino_h',
    name: '2x1 Horizontal',
    matrix: [[1, 1]],
    color: 'cyan',
    difficultyWeight: 1,
  },
  {
    id: 'domino_v',
    name: '1x2 Vertical',
    matrix: [[1], [1]],
    color: 'cyan',
    difficultyWeight: 1,
  },

  // 3-cell trominoes
  {
    id: 'tromino_h',
    name: '3x1 Line',
    matrix: [[1, 1, 1]],
    color: 'green',
    difficultyWeight: 2,
  },
  {
    id: 'tromino_v',
    name: '1x3 Line',
    matrix: [[1], [1], [1]],
    color: 'green',
    difficultyWeight: 2,
  },
  {
    id: 'corner_3_tl',
    name: 'Small Corner TL',
    matrix: [
      [1, 1],
      [1, 0],
    ],
    color: 'orange',
    difficultyWeight: 2,
  },
  {
    id: 'corner_3_tr',
    name: 'Small Corner TR',
    matrix: [
      [1, 1],
      [0, 1],
    ],
    color: 'orange',
    difficultyWeight: 2,
  },
  {
    id: 'corner_3_bl',
    name: 'Small Corner BL',
    matrix: [
      [1, 0],
      [1, 1],
    ],
    color: 'orange',
    difficultyWeight: 2,
  },
  {
    id: 'corner_3_br',
    name: 'Small Corner BR',
    matrix: [
      [0, 1],
      [1, 1],
    ],
    color: 'orange',
    difficultyWeight: 2,
  },

  // 4-cell tetrominoes
  {
    id: 'square_2x2',
    name: '2x2 Square',
    matrix: [
      [1, 1],
      [1, 1],
    ],
    color: 'magenta',
    difficultyWeight: 2,
  },
  {
    id: 'tetromino_h',
    name: '4x1 Line',
    matrix: [[1, 1, 1, 1]],
    color: 'cyan',
    difficultyWeight: 3,
  },
  {
    id: 'tetromino_v',
    name: '1x4 Line',
    matrix: [[1], [1], [1], [1]],
    color: 'cyan',
    difficultyWeight: 3,
  },
  {
    id: 't_down',
    name: 'T-Shape Down',
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: 'purple',
    difficultyWeight: 3,
  },
  {
    id: 't_up',
    name: 'T-Shape Up',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: 'purple',
    difficultyWeight: 3,
  },
  {
    id: 't_left',
    name: 'T-Shape Left',
    matrix: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    color: 'purple',
    difficultyWeight: 3,
  },
  {
    id: 't_right',
    name: 'T-Shape Right',
    matrix: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    color: 'purple',
    difficultyWeight: 3,
  },
  {
    id: 'l_tl',
    name: 'L-Shape TL',
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    color: 'yellow',
    difficultyWeight: 3,
  },
  {
    id: 'l_tr',
    name: 'L-Shape TR',
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    color: 'yellow',
    difficultyWeight: 3,
  },
  {
    id: 'l_bl',
    name: 'L-Shape BL',
    matrix: [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    color: 'yellow',
    difficultyWeight: 3,
  },
  {
    id: 'l_br',
    name: 'L-Shape BR',
    matrix: [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
    color: 'yellow',
    difficultyWeight: 3,
  },
  {
    id: 'l_flat_1',
    name: 'Flat L 1',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    color: 'yellow',
    difficultyWeight: 3,
  },
  {
    id: 'l_flat_2',
    name: 'Flat L 2',
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    color: 'yellow',
    difficultyWeight: 3,
  },
  {
    id: 'l_flat_3',
    name: 'Flat L 3',
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: 'yellow',
    difficultyWeight: 3,
  },
  {
    id: 'l_flat_4',
    name: 'Flat L 4',
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 'yellow',
    difficultyWeight: 3,
  },
  {
    id: 's_h',
    name: 'S-Shape H',
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 'green',
    difficultyWeight: 3,
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
    difficultyWeight: 3,
  },
  {
    id: 'z_h',
    name: 'Z-Shape H',
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 'magenta',
    difficultyWeight: 3,
  },
  {
    id: 'z_v',
    name: 'Z-Shape V',
    matrix: [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    color: 'magenta',
    difficultyWeight: 3,
  },

  // 5-cell Pentominoes (for challenging levels)
  {
    id: 'pentomino_h',
    name: '5x1 Line',
    matrix: [[1, 1, 1, 1, 1]],
    color: 'cyan',
    difficultyWeight: 4,
  },
  {
    id: 'pentomino_v',
    name: '1x5 Line',
    matrix: [[1], [1], [1], [1], [1]],
    color: 'cyan',
    difficultyWeight: 4,
  },
  {
    id: 'square_3x3',
    name: '3x3 Giant Square',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    color: 'magenta',
    difficultyWeight: 5,
  },
  {
    id: 'cross_plus',
    name: 'Plus Cross',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: 'purple',
    difficultyWeight: 4,
  },
  {
    id: 'u_shape',
    name: 'U-Shape',
    matrix: [
      [1, 0, 1],
      [1, 1, 1],
    ],
    color: 'orange',
    difficultyWeight: 4,
  },
  {
    id: 'corner_5_tl',
    name: 'Large Corner TL',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
    color: 'orange',
    difficultyWeight: 4,
  },
  {
    id: 'corner_5_br',
    name: 'Large Corner BR',
    matrix: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 'orange',
    difficultyWeight: 4,
  },
];

/**
 * Deterministic pseudo-random number generator (LCG)
 */
export function createPRNG(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generate 3 tray pieces given a level seed, current step, and difficulty
 */
export function generateTrayPieces(
  levelSeed: number,
  stepIndex: number,
  difficultyTier: number, // 1 to 8
  allowedShapeIds?: string[]
): TrayPiece[] {
  const prng = createPRNG(levelSeed * 1000 + stepIndex * 77 + 31);
  const pool = allowedShapeIds && allowedShapeIds.length > 0
    ? ALL_SHAPES.filter(s => allowedShapeIds.includes(s.id))
    : ALL_SHAPES;

  const pieces: TrayPiece[] = [];

  for (let i = 0; i < 3; i++) {
    // Select shapes based on difficulty: higher difficulty introduces larger/challenging shapes
    const filteredPool = pool.filter(shape => {
      const weight = shape.difficultyWeight || 1;
      if (difficultyTier <= 2) {
        return weight <= 3;
      } else if (difficultyTier <= 4) {
        return weight <= 4;
      }
      return true;
    });

    const candidatePool = filteredPool.length > 0 ? filteredPool : pool;
    const randomIndex = Math.floor(prng() * candidatePool.length);
    const chosenShape = { ...candidatePool[randomIndex] };

    // Occasionally create special blocks for higher levels (levels 15+)
    if (difficultyTier >= 4 && prng() < 0.15) {
      const specialTypes = ['bomb', 'line_h', 'line_v'] as const;
      chosenShape.special = specialTypes[Math.floor(prng() * specialTypes.length)];
    }

    pieces.push({
      instanceId: `piece-${stepIndex}-${i}-${Date.now()}-${Math.floor(prng() * 9999)}`,
      shape: chosenShape,
      placed: false,
    });
  }

  return pieces;
}
