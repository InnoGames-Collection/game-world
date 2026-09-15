/**
 * Soccer Shooter - Hexagonal Grid & Physics Engine
 * Mathematically precise staggered hex-grid geometry, raycast trajectory with bank-shots,
 * neighbor adjacency, BFS cluster matching, and ceiling reachability traversal for falling drops.
 */

import { GridBall, SoccerTeamColor } from './types';

export const COLS_EVEN = 8;
export const COLS_ODD = 7;
export const MAX_GRID_ROWS = 14;

/**
 * Returns number of columns in row (8 for even, 7 for odd)
 */
export function getColsInRow(row: number): number {
  return row % 2 === 0 ? COLS_EVEN : COLS_ODD;
}

/**
 * Calculates (x, y) center for a ball at grid (row, col)
 */
export function getBallCenter(
  row: number,
  col: number,
  radius: number,
  ceilingOffset: number = 0
): { x: number; y: number } {
  const isEven = row % 2 === 0;
  const x = isEven
    ? radius + col * (radius * 2)
    : radius * 2 + col * (radius * 2);
  const rowHeight = radius * Math.sqrt(3);
  const y = radius + row * rowHeight + ceilingOffset;
  return { x, y };
}

/**
 * Valid staggered hexagonal neighbors
 */
export function getHexNeighborCoords(
  row: number,
  col: number
): { r: number; c: number }[] {
  const isEven = row % 2 === 0;
  if (isEven) {
    return [
      { r: row - 1, c: col - 1 },
      { r: row - 1, c: col },
      { r: row, c: col - 1 },
      { r: row, c: col + 1 },
      { r: row + 1, c: col - 1 },
      { r: row + 1, c: col },
    ];
  } else {
    return [
      { r: row - 1, c: col },
      { r: row - 1, c: col + 1 },
      { r: row, c: col - 1 },
      { r: row, c: col + 1 },
      { r: row + 1, c: col },
      { r: row + 1, c: col + 1 },
    ];
  }
}

/**
 * Returns all active ball neighbors for a given cell
 */
export function getBallNeighbors(
  row: number,
  col: number,
  grid: (GridBall | null)[][]
): GridBall[] {
  const neighbors: GridBall[] = [];
  const coords = getHexNeighborCoords(row, col);

  for (const { r, c } of coords) {
    if (r >= 0 && r < MAX_GRID_ROWS && c >= 0 && c < getColsInRow(r)) {
      const neighbor = grid[r]?.[c];
      if (neighbor) {
        neighbors.push(neighbor);
      }
    }
  }
  return neighbors;
}

/**
 * BFS to find connected matching balls (3 or more)
 * Special golden ball matches any color!
 */
export function findMatchingCluster(
  startRow: number,
  startCol: number,
  grid: (GridBall | null)[][]
): GridBall[] {
  const root = grid[startRow]?.[startCol];
  if (!root) return [];

  const targetColor = root.color;
  const isWildcard = targetColor === 'SPECIAL_GOLD';

  const visited = new Set<string>();
  const queue: { r: number; c: number }[] = [{ r: startRow, c: startCol }];
  const cluster: GridBall[] = [];

  visited.add(`${startRow},${startCol}`);
  cluster.push(root);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = getBallNeighbors(curr.r, curr.c, grid);

    for (const n of neighbors) {
      const key = `${n.row},${n.col}`;
      if (!visited.has(key)) {
        // Match condition: same team color OR wildcard golden ball
        const matches =
          isWildcard ||
          n.color === targetColor ||
          n.color === 'SPECIAL_GOLD';

        if (matches) {
          visited.add(key);
          cluster.push(n);
          queue.push({ r: n.row, c: n.col });
        }
      }
    }
  }

  // If wildcard triggered match with surrounding neighbors, ensure at least 3
  return cluster.length >= 3 ? cluster : [];
}

/**
 * Identifies all balls no longer connected to the ceiling (Row 0)
 * These balls fall down into the goalmouth for bonus points!
 */
export function findFloatingBalls(grid: (GridBall | null)[][]): GridBall[] {
  const connected = new Set<string>();
  const queue: { r: number; c: number }[] = [];

  // 1. Seed queue with all row 0 balls
  const row0Cols = getColsInRow(0);
  for (let c = 0; c < row0Cols; c++) {
    const b = grid[0]?.[c];
    if (b) {
      const key = `0,${c}`;
      connected.add(key);
      queue.push({ r: 0, c });
    }
  }

  // 2. BFS through all connected balls
  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = getBallNeighbors(curr.r, curr.c, grid);
    for (const n of neighbors) {
      const key = `${n.row},${n.col}`;
      if (!connected.has(key)) {
        connected.add(key);
        queue.push({ r: n.row, c: n.col });
      }
    }
  }

  // 3. Any active ball not in 'connected' is floating
  const floating: GridBall[] = [];
  for (let r = 0; r < grid.length; r++) {
    const cols = getColsInRow(r);
    for (let c = 0; c < cols; c++) {
      const b = grid[r]?.[c];
      if (b && !connected.has(`${r},${c}`)) {
        floating.push(b);
      }
    }
  }

  return floating;
}

/**
 * Snaps projectile to the best valid vacant hexagonal grid cell
 */
export function findSnapCell(
  projX: number,
  projY: number,
  grid: (GridBall | null)[][],
  radius: number,
  ceilingOffset: number = 0
): { row: number; col: number } | null {
  let bestRow = -1;
  let bestCol = -1;
  let minDistanceSq = Infinity;

  // Search through rows
  for (let r = 0; r < MAX_GRID_ROWS; r++) {
    const cols = getColsInRow(r);
    for (let c = 0; c < cols; c++) {
      if (grid[r]?.[c] !== null) continue; // Already occupied

      // Cell must either be in top row (r === 0) or adjacent to an existing ball
      const neighbors = getBallNeighbors(r, c, grid);
      if (r > 0 && neighbors.length === 0) continue;

      const { x: cx, y: cy } = getBallCenter(r, c, radius, ceilingOffset);
      const dx = projX - cx;
      const dy = projY - cy;
      const distSq = dx * dx + dy * dy;

      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        bestRow = r;
        bestCol = c;
      }
    }
  }

  if (bestRow !== -1 && bestCol !== -1) {
    return { row: bestRow, col: bestCol };
  }
  return null;
}

export interface TrajectoryPath {
  points: { x: number; y: number }[];
  reflectionPoint: { x: number; y: number } | null;
}

/**
 * Calculates aiming trajectory with wall bank reflection
 */
export function calculateTrajectory(
  startX: number,
  startY: number,
  angle: number,
  grid: (GridBall | null)[][],
  boardWidth: number,
  radius: number,
  ceilingOffset: number = 0
): TrajectoryPath {
  const points: { x: number; y: number }[] = [{ x: startX, y: startY }];
  let reflectionPoint: { x: number; y: number } | null = null;

  let x = startX;
  let y = startY;
  let vx = Math.cos(angle) * 7;
  let vy = Math.sin(angle) * 7;

  const leftWall = radius;
  const rightWall = boardWidth - radius;
  let hasReflected = false;

  for (let step = 0; step < 260; step++) {
    x += vx;
    y += vy;

    // Wall bounce
    if (!hasReflected) {
      if (x <= leftWall) {
        x = leftWall;
        vx = -vx;
        hasReflected = true;
        reflectionPoint = { x, y };
        points.push({ x, y });
      } else if (x >= rightWall) {
        x = rightWall;
        vx = -vx;
        hasReflected = true;
        reflectionPoint = { x, y };
        points.push({ x, y });
      }
    }

    // Ceiling hit
    if (y <= radius + ceilingOffset + 2) {
      points.push({ x, y: radius + ceilingOffset + 2 });
      break;
    }

    // Ball collision check
    let hitBall = false;
    for (let r = 0; r < grid.length; r++) {
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const b = grid[r]?.[c];
        if (!b) continue;

        const dx = x - b.x;
        const dy = y - b.y;
        const distSq = dx * dx + dy * dy;
        const collisionRadius = radius * 1.85;

        if (distSq <= collisionRadius * collisionRadius) {
          hitBall = true;
          break;
        }
      }
      if (hitBall) break;
    }

    if (hitBall) {
      points.push({ x, y });
      break;
    }

    if (step % 2 === 0) {
      points.push({ x, y });
    }
  }

  return { points, reflectionPoint };
}
