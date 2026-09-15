/**
 * Juicy Match - Match-3 Gameplay & Board Resolution Engine
 * Handles swaps, match detection, special power-ups, cascades, and blockers.
 */

import { Cell, LevelConfig, FruitType, SpecialType, FruitPiece, BlockerType } from './types';

let nextFruitId = 1;

export function generateFruit(type: FruitType, special: SpecialType = 'none'): FruitPiece {
  return {
    id: `fruit_${Date.now()}_${nextFruitId++}`,
    type,
    special,
    scale: 1,
    opacity: 1,
    isMatched: false,
    isNew: false,
  };
}

/**
 * Creates initial valid board guaranteed to have NO initial 3-matches
 * and at least 1 legal move available.
 */
export function createInitialBoard(config: LevelConfig): Cell[][] {
  const h = config.gridHeight;
  const w = config.gridWidth;
  const grid: Cell[][] = [];

  for (let y = 0; y < h; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < w; x++) {
      const isValid = config.validMatrix[y] ? config.validMatrix[y][x] === 1 : true;
      row.push({
        x,
        y,
        valid: isValid,
        fruit: null,
        underlay: 'none',
        blocker: null,
        overlay: 'none',
      });
    }
    grid.push(row);
  }

  // 1. Apply Underlays (Juice stains)
  if (config.underlays) {
    config.underlays.forEach((u) => {
      if (grid[u.y] && grid[u.y][u.x] && grid[u.y][u.x].valid) {
        grid[u.y][u.x].underlay = u.type;
      }
    });
  }

  // 2. Apply Blockers (Crates, Chests)
  if (config.blockers) {
    config.blockers.forEach((b) => {
      if (grid[b.y] && grid[b.y][b.x] && grid[b.y][b.x].valid) {
        grid[b.y][b.x].blocker = b.type;
      }
    });
  }

  // 3. Apply Overlays (Ice, Chains)
  if (config.overlays) {
    config.overlays.forEach((o) => {
      if (grid[o.y] && grid[o.y][o.x] && grid[o.y][o.x].valid) {
        grid[o.y][o.x].overlay = o.type;
      }
    });
  }

  // 4. Populate Fruits without creating initial 3-matches
  let attempts = 0;
  let populated = false;

  while (!populated && attempts < 50) {
    attempts++;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const cell = grid[y][x];
        if (cell.valid && !cell.blocker) {
          // Find color that doesn't create match with left 2 or top 2
          const forbidden: FruitType[] = [];
          if (x >= 2 && grid[y][x - 1]?.fruit && grid[y][x - 2]?.fruit) {
            if (grid[y][x - 1].fruit!.type === grid[y][x - 2].fruit!.type) {
              forbidden.push(grid[y][x - 1].fruit!.type);
            }
          }
          if (y >= 2 && grid[y - 1][x]?.fruit && grid[y - 2][x]?.fruit) {
            if (grid[y - 1][x].fruit!.type === grid[y - 2][x].fruit!.type) {
              forbidden.push(grid[y - 1][x].fruit!.type);
            }
          }

          const pool = config.availableFruits.filter((f) => !forbidden.includes(f));
          const chosen = pool.length > 0
            ? pool[Math.floor(Math.random() * pool.length)]
            : config.availableFruits[Math.floor(Math.random() * config.availableFruits.length)];

          cell.fruit = generateFruit(chosen);
        }
      }
    }

    if (hasLegalMoves(grid, config.availableFruits)) {
      populated = true;
    }
  }

  return grid;
}

/**
 * Checks if at least one valid swap exists on the board
 */
export function hasLegalMoves(grid: Cell[][], availableFruits: FruitType[]): boolean {
  const h = grid.length;
  const w = grid[0].length;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c1 = grid[y][x];
      if (!c1.valid || !c1.fruit || c1.blocker || c1.overlay === 'chain') continue;

      // Rainbow fruit always provides a legal move when adjacent to any fruit
      if (c1.fruit.special === 'rainbow') return true;

      // Try Right
      if (x + 1 < w) {
        const c2 = grid[y][x + 1];
        if (c2.valid && c2.fruit && !c2.blocker && c2.overlay !== 'chain') {
          if (c2.fruit.special === 'rainbow') return true;
          if (c1.fruit.special !== 'none' && c2.fruit.special !== 'none') return true;
          // Swap temporarily
          const temp = c1.fruit;
          c1.fruit = c2.fruit;
          c2.fruit = temp;
          const matches = findMatches(grid);
          // Restore
          c2.fruit = c1.fruit;
          c1.fruit = temp;
          if (matches.matchedCells.length > 0) return true;
        }
      }

      // Try Down
      if (y + 1 < h) {
        const c2 = grid[y + 1][x];
        if (c2.valid && c2.fruit && !c2.blocker && c2.overlay !== 'chain') {
          if (c2.fruit.special === 'rainbow') return true;
          if (c1.fruit.special !== 'none' && c2.fruit.special !== 'none') return true;
          // Swap temporarily
          const temp = c1.fruit;
          c1.fruit = c2.fruit;
          c2.fruit = temp;
          const matches = findMatches(grid);
          // Restore
          c2.fruit = c1.fruit;
          c1.fruit = temp;
          if (matches.matchedCells.length > 0) return true;
        }
      }
    }
  }
  return false;
}

/**
 * Reshuffle only movable fruits when no legal moves are available
 */
export function reshuffleMovableFruits(grid: Cell[][], availableFruits: FruitType[]): boolean {
  const movableCoords: [number, number][] = [];
  const fruits: FruitPiece[] = [];

  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell.valid && cell.fruit && !cell.blocker && cell.overlay !== 'chain') {
        movableCoords.push([x, y]);
        fruits.push(cell.fruit);
      }
    });
  });

  if (fruits.length < 3) return false;

  let success = false;
  let attempts = 0;

  while (!success && attempts < 30) {
    attempts++;
    // Fisher-Yates shuffle
    for (let i = fruits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fruits[i], fruits[j]] = [fruits[j], fruits[i]];
    }

    // Place back
    movableCoords.forEach(([x, y], idx) => {
      grid[y][x].fruit = fruits[idx];
    });

    const m = findMatches(grid);
    if (m.matchedCells.length === 0 && hasLegalMoves(grid, availableFruits)) {
      success = true;
    }
  }

  return success;
}

export interface MatchResult {
  matchedCells: [number, number][];
  specialCreations: { x: number; y: number; special: SpecialType; fruitType: FruitType }[];
}

/**
 * Scans board for matches of 3, 4, 5, L-shapes, T-shapes
 */
export function findMatches(grid: Cell[][]): MatchResult {
  const h = grid.length;
  const w = grid[0].length;
  const matchedSet = new Set<string>();
  const specialCreations: { x: number; y: number; special: SpecialType; fruitType: FruitType }[] = [];

  // Horizontal Lines
  const hLines: { x: number; y: number; len: number; type: FruitType }[] = [];
  for (let y = 0; y < h; y++) {
    let matchLen = 1;
    for (let x = 0; x < w; x++) {
      const current = grid[y][x];
      const next = x + 1 < w ? grid[y][x + 1] : null;

      if (
        current.valid &&
        current.fruit &&
        next &&
        next.valid &&
        next.fruit &&
        current.fruit.type === next.fruit.type
      ) {
        matchLen++;
      } else {
        if (matchLen >= 3 && current.fruit) {
          hLines.push({
            x: x - matchLen + 1,
            y,
            len: matchLen,
            type: current.fruit.type,
          });
          for (let i = 0; i < matchLen; i++) {
            matchedSet.add(`${x - i},${y}`);
          }
        }
        matchLen = 1;
      }
    }
  }

  // Vertical Lines
  const vLines: { x: number; y: number; len: number; type: FruitType }[] = [];
  for (let x = 0; x < w; x++) {
    let matchLen = 1;
    for (let y = 0; y < h; y++) {
      const current = grid[y][x];
      const next = y + 1 < h ? grid[y + 1][x] : null;

      if (
        current.valid &&
        current.fruit &&
        next &&
        next.valid &&
        next.fruit &&
        current.fruit.type === next.fruit.type
      ) {
        matchLen++;
      } else {
        if (matchLen >= 3 && current.fruit) {
          vLines.push({
            x,
            y: y - matchLen + 1,
            len: matchLen,
            type: current.fruit.type,
          });
          for (let i = 0; i < matchLen; i++) {
            matchedSet.add(`${x},${y - i}`);
          }
        }
        matchLen = 1;
      }
    }
  }

  // Detect 5 in a row -> Rainbow Fruit
  hLines.forEach((hl) => {
    if (hl.len >= 5) {
      specialCreations.push({
        x: hl.x + 2,
        y: hl.y,
        special: 'rainbow',
        fruitType: hl.type,
      });
    }
  });

  vLines.forEach((vl) => {
    if (vl.len >= 5 && !specialCreations.some((s) => s.x === vl.x && s.y === vl.y + 2)) {
      specialCreations.push({
        x: vl.x,
        y: vl.y + 2,
        special: 'rainbow',
        fruitType: vl.type,
      });
    }
  });

  // Detect T-shapes & L-shapes -> Fruit Bomb
  hLines.forEach((hl) => {
    vLines.forEach((vl) => {
      if (hl.type === vl.type && hl.len < 5 && vl.len < 5) {
        // Intersection check
        if (vl.x >= hl.x && vl.x < hl.x + hl.len && hl.y >= vl.y && hl.y < vl.y + vl.len) {
          if (!specialCreations.some((s) => s.x === vl.x && s.y === hl.y)) {
            specialCreations.push({
              x: vl.x,
              y: hl.y,
              special: 'bomb',
              fruitType: hl.type,
            });
          }
        }
      }
    });
  });

  // Detect 4 in a row -> Striped Fruit
  hLines.forEach((hl) => {
    if (hl.len === 4) {
      if (!specialCreations.some((s) => s.y === hl.y && s.x >= hl.x && s.x < hl.x + hl.len)) {
        specialCreations.push({
          x: hl.x + 1,
          y: hl.y,
          special: 'striped_v', // clears perpendicular column
          fruitType: hl.type,
        });
      }
    }
  });

  vLines.forEach((vl) => {
    if (vl.len === 4) {
      if (!specialCreations.some((s) => s.x === vl.x && s.y >= vl.y && s.y < vl.y + vl.len)) {
        specialCreations.push({
          x: vl.x,
          y: vl.y + 1,
          special: 'striped_h', // clears perpendicular row
          fruitType: vl.type,
        });
      }
    }
  });

  const matchedCells: [number, number][] = Array.from(matchedSet).map((s) => {
    const [x, y] = s.split(',').map(Number);
    return [x, y];
  });

  return { matchedCells, specialCreations };
}

/**
 * Handle Special Combination when two special pieces are swapped
 */
export function handleSpecialCombination(
  grid: Cell[][],
  c1: Cell,
  c2: Cell
): { affectedCells: [number, number][]; comboType: string } | null {
  const s1 = c1.fruit?.special;
  const s2 = c2.fruit?.special;

  if (!s1 || !s2) return null;

  const h = grid.length;
  const w = grid[0].length;
  const affectedSet = new Set<string>();

  // 1. Rainbow + Rainbow: Wipes the entire board!
  if (s1 === 'rainbow' && s2 === 'rainbow') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (grid[y][x].valid) affectedSet.add(`${x},${y}`);
      }
    }
    return {
      affectedCells: Array.from(affectedSet).map((s) => s.split(',').map(Number) as [number, number]),
      comboType: 'rainbow_rainbow',
    };
  }

  // 2. Rainbow + Striped: Turns all fruits of that color into striped fruits and clears them!
  if ((s1 === 'rainbow' && (s2 === 'striped_h' || s2 === 'striped_v')) ||
      (s2 === 'rainbow' && (s1 === 'striped_h' || s1 === 'striped_v'))) {
    const targetType = s1 === 'rainbow' ? c2.fruit!.type : c1.fruit!.type;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (grid[y][x].fruit?.type === targetType) {
          // Clear entire row and column
          for (let i = 0; i < w; i++) affectedSet.add(`${i},${y}`);
          for (let j = 0; j < h; j++) affectedSet.add(`${x},${j}`);
        }
      }
    }
    return {
      affectedCells: Array.from(affectedSet).map((s) => s.split(',').map(Number) as [number, number]),
      comboType: 'rainbow_striped',
    };
  }

  // 3. Rainbow + Bomb: Clears all of that color + surrounding 3x3 blasts
  if ((s1 === 'rainbow' && s2 === 'bomb') || (s2 === 'rainbow' && s1 === 'bomb')) {
    const targetType = s1 === 'rainbow' ? c2.fruit!.type : c1.fruit!.type;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (grid[y][x].fruit?.type === targetType) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (ny >= 0 && ny < h && nx >= 0 && nx < w && grid[ny][nx].valid) {
                affectedSet.add(`${nx},${ny}`);
              }
            }
          }
        }
      }
    }
    return {
      affectedCells: Array.from(affectedSet).map((s) => s.split(',').map(Number) as [number, number]),
      comboType: 'rainbow_bomb',
    };
  }

  // 4. Striped + Striped: Clears both row and column (cross laser)
  if ((s1 === 'striped_h' || s1 === 'striped_v') && (s2 === 'striped_h' || s2 === 'striped_v')) {
    for (let x = 0; x < w; x++) affectedSet.add(`${x},${c2.y}`);
    for (let y = 0; y < h; y++) affectedSet.add(`${c2.x},${y}`);
    return {
      affectedCells: Array.from(affectedSet).map((s) => s.split(',').map(Number) as [number, number]),
      comboType: 'striped_striped',
    };
  }

  // 5. Striped + Bomb: Clears 3 full rows and 3 full columns!
  if (((s1 === 'striped_h' || s1 === 'striped_v') && s2 === 'bomb') ||
      (s1 === 'bomb' && (s2 === 'striped_h' || s2 === 'striped_v'))) {
    for (let dy = -1; dy <= 1; dy++) {
      const ny = c2.y + dy;
      if (ny >= 0 && ny < h) {
        for (let x = 0; x < w; x++) affectedSet.add(`${x},${ny}`);
      }
    }
    for (let dx = -1; dx <= 1; dx++) {
      const nx = c2.x + dx;
      if (nx >= 0 && nx < w) {
        for (let y = 0; y < h; y++) affectedSet.add(`${nx},${y}`);
      }
    }
    return {
      affectedCells: Array.from(affectedSet).map((s) => s.split(',').map(Number) as [number, number]),
      comboType: 'striped_bomb',
    };
  }

  // 6. Bomb + Bomb: Massive 5x5 explosion
  if (s1 === 'bomb' && s2 === 'bomb') {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = c2.x + dx;
        const ny = c2.y + dy;
        if (ny >= 0 && ny < h && nx >= 0 && nx < w && grid[ny][nx].valid) {
          affectedSet.add(`${nx},${ny}`);
        }
      }
    }
    return {
      affectedCells: Array.from(affectedSet).map((s) => s.split(',').map(Number) as [number, number]),
      comboType: 'bomb_bomb',
    };
  }

  // 7. Rainbow + Normal Fruit: Clears all of that color
  if (s1 === 'rainbow' || s2 === 'rainbow') {
    const normalCell = s1 === 'rainbow' ? c2 : c1;
    const targetType = normalCell.fruit?.type;
    if (targetType) {
      affectedSet.add(`${c1.x},${c1.y}`);
      affectedSet.add(`${c2.x},${c2.y}`);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (grid[y][x].fruit?.type === targetType) {
            affectedSet.add(`${x},${y}`);
          }
        }
      }
      return {
        affectedCells: Array.from(affectedSet).map((s) => s.split(',').map(Number) as [number, number]),
        comboType: 'rainbow_fruit',
      };
    }
  }

  return null;
}

/**
 * Executes a single special piece detonation (striped, bomb, etc.)
 */
export function activateSpecialPiece(
  grid: Cell[][],
  x: number,
  y: number,
  special: SpecialType
): [number, number][] {
  const h = grid.length;
  const w = grid[0].length;
  const affected: [number, number][] = [];

  if (special === 'striped_h') {
    for (let cx = 0; cx < w; cx++) {
      if (grid[y][cx].valid) affected.push([cx, y]);
    }
  } else if (special === 'striped_v') {
    for (let cy = 0; cy < h; cy++) {
      if (grid[cy][x].valid) affected.push([x, cy]);
    }
  } else if (special === 'bomb') {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (ny >= 0 && ny < h && nx >= 0 && nx < w && grid[ny][nx].valid) {
          affected.push([nx, ny]);
        }
      }
    }
  }

  return affected;
}

/**
 * Applies damage to adjacent blockers and clears underlays
 */
export function damageBlockersAndUnderlays(
  grid: Cell[][],
  clearedCells: [number, number][]
): {
  juiceCleared: number;
  cratesBroken: number;
  chestsOpened: number;
  brokenBlockerCoords: [number, number][];
} {
  let juiceCleared = 0;
  let cratesBroken = 0;
  let chestsOpened = 0;
  const brokenBlockerCoords: [number, number][] = [];

  const h = grid.length;
  const w = grid[0].length;
  const adjacentCoordsSet = new Set<string>();

  clearedCells.forEach(([cx, cy]) => {
    // 1. Clear underlays directly under matched cells
    const cell = grid[cy][cx];
    if (cell.underlay === 'juice_1') {
      cell.underlay = 'none';
      juiceCleared++;
    } else if (cell.underlay === 'juice_2') {
      cell.underlay = 'juice_1';
      juiceCleared++;
    }

    // Clear overlay directly on top (ice or chain)
    if (cell.overlay !== 'none') {
      cell.overlay = 'none';
    }

    // 2. Find adjacent cells for crates / chests
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => {
      const nx = cx + dx;
      const ny = cy + dy;
      if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
        adjacentCoordsSet.add(`${nx},${ny}`);
      }
    });
  });

  // Damage adjacent crates and chests
  adjacentCoordsSet.forEach((coordStr) => {
    const [ax, ay] = coordStr.split(',').map(Number);
    const cell = grid[ay][ax];

    if (cell.blocker) {
      brokenBlockerCoords.push([ax, ay]);
      if (cell.blocker === 'crate_1') {
        cell.blocker = null;
        cratesBroken++;
      } else if (cell.blocker === 'crate_2') {
        cell.blocker = 'crate_1';
      } else if (cell.blocker === 'crate_3') {
        cell.blocker = 'crate_2';
      } else if (cell.blocker === 'chest') {
        cell.blocker = null;
        chestsOpened++;
      }
    }

    if (cell.overlay === 'ice' || cell.overlay === 'chain') {
      cell.overlay = 'none';
    }
  });

  return { juiceCleared, cratesBroken, chestsOpened, brokenBlockerCoords };
}

/**
 * Gravity step: pieces fall downward into empty valid cells
 */
export function applyGravity(grid: Cell[][]): boolean {
  const h = grid.length;
  const w = grid[0].length;
  let moved = false;

  for (let x = 0; x < w; x++) {
    for (let y = h - 1; y > 0; y--) {
      const targetCell = grid[y][x];

      if (targetCell.valid && !targetCell.fruit && !targetCell.blocker) {
        // Find highest fruit above in this column
        for (let searchY = y - 1; searchY >= 0; searchY--) {
          const sourceCell = grid[searchY][x];
          if (sourceCell.blocker) {
            // Crate stops falling through
            break;
          }
          if (sourceCell.valid && sourceCell.fruit && sourceCell.overlay !== 'chain') {
            targetCell.fruit = sourceCell.fruit;
            sourceCell.fruit = null;
            moved = true;
            break;
          }
        }
      }
    }
  }

  return moved;
}

/**
 * Refill step: spawns new random fruits from the top into empty cells
 */
export function refillTopCells(grid: Cell[][], availableFruits: FruitType[]): boolean {
  const h = grid.length;
  const w = grid[0].length;
  let refilled = false;

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const cell = grid[y][x];
      if (cell.valid && !cell.blocker && !cell.fruit) {
        const randomFruit = availableFruits[Math.floor(Math.random() * availableFruits.length)];
        const newPiece = generateFruit(randomFruit);
        newPiece.isNew = true;
        cell.fruit = newPiece;
        refilled = true;
      }
    }
  }

  return refilled;
}
