/**
 * Hexagonal Grid Physics, Geometry, and Graph Algorithms for Bubble Shooter
 */

import { BubbleColor, GridBubble, TrajectoryPoint, TrajectorySegment } from './types';

export const COLS_EVEN = 8;
export const COLS_ODD = 7;
export const MAX_GRID_ROWS = 14;

export const BUBBLE_PALETTE: Record<
  BubbleColor,
  {
    name: string;
    base: string;
    highlight: string;
    shadow: string;
    glow: string;
    accent: string;
  }
> = {
  RED: {
    name: 'Ruby Red',
    base: '#F23838',
    highlight: '#FFA4A4',
    shadow: '#8E0D0D',
    glow: 'rgba(242, 56, 56, 0.4)',
    accent: '#FF6B6B',
  },
  BLUE: {
    name: 'Sapphire Blue',
    base: '#1788E8',
    highlight: '#A0D5FF',
    shadow: '#0B4E8C',
    glow: 'rgba(23, 136, 232, 0.4)',
    accent: '#47A7F5',
  },
  GREEN: {
    name: 'Emerald Green',
    base: '#20C95A',
    highlight: '#A7F7C1',
    shadow: '#0D6A2B',
    glow: 'rgba(32, 201, 90, 0.4)',
    accent: '#4EE07F',
  },
  YELLOW: {
    name: 'Golden Amber',
    base: '#F7B51D',
    highlight: '#FFE8A3',
    shadow: '#8C6005',
    glow: 'rgba(247, 181, 29, 0.4)',
    accent: '#FFC84A',
  },
  PURPLE: {
    name: 'Magenta Orchid',
    base: '#E447C8',
    highlight: '#F9B4EF',
    shadow: '#7A1368',
    glow: 'rgba(228, 71, 200, 0.4)',
    accent: '#EB72D6',
  },
  WHITE: {
    name: 'Pearl White',
    base: '#ECEFF4',
    highlight: '#FFFFFF',
    shadow: '#94A3B8',
    glow: 'rgba(236, 239, 244, 0.35)',
    accent: '#CBD5E1',
  },
};

/**
 * Returns number of columns for a given row in staggered hex grid
 */
export function getColsInRow(row: number): number {
  return row % 2 === 0 ? COLS_EVEN : COLS_ODD;
}

/**
 * Authoritative single source of truth for playable Bubble Shooter metrics.
 * Calculates bubble radius and exact side margin to fit COLS_EVEN (8) bubbles
 * across the playable board with no cropping, symmetric margins, and crisp scale.
 */
export function calculateBoardMetrics(width: number): { radius: number; sideMargin: number } {
  // Target small padding on left and right (~2-3% of width, min 6px)
  const minMargin = Math.max(6, Math.floor(width * 0.025));
  const availableForCols = width - 2 * minMargin;
  // 8 columns with 2 * radius per column = 16 * radius
  const calculatedRadius = Math.floor(availableForCols / (COLS_EVEN * 2));
  // Bound radius to maintain comfortable touch scale while preventing oversized bubbles
  const radius = Math.max(16, Math.min(calculatedRadius, 28));
  // Symmetrically center the 8 columns across the board
  const sideMargin = Math.max(4, Math.floor((width - radius * COLS_EVEN * 2) / 2));
  return { radius, sideMargin };
}

/**
 * Calculates center (x, y) for a bubble at (row, col)
 * Follows strict 1:1 circular packed hexagonal geometry.
 * Odd rows are staggered by exactly half bubble diameter (radius).
 * Row height is exactly radius * sqrt(3).
 * Symmetrically offset by sideMargin to keep full board boundary within view.
 */
export function getBubbleCenter(
  row: number,
  col: number,
  radius: number,
  ceilingOffset: number = 0,
  sideMargin: number = 0
): { x: number; y: number } {
  const isEven = row % 2 === 0;
  const x = isEven
    ? sideMargin + radius + col * (radius * 2)
    : sideMargin + radius * 2 + col * (radius * 2);
  const rowHeight = radius * Math.sqrt(3);
  const y = ceilingOffset + radius + row * rowHeight;
  return { x, y };
}

/**
 * Returns valid neighbor coordinates for a cell (row, col)
 */
export function getHexNeighbors(row: number, col: number): { row: number; col: number }[] {
  const isEven = row % 2 === 0;
  const neighbors: { row: number; col: number }[] = [];

  // Left & Right
  neighbors.push({ row, col: col - 1 });
  neighbors.push({ row, col: col + 1 });

  if (isEven) {
    // Top-Left and Top-Right
    neighbors.push({ row: row - 1, col: col - 1 });
    neighbors.push({ row: row - 1, col: col });
    // Bottom-Left and Bottom-Right
    neighbors.push({ row: row + 1, col: col - 1 });
    neighbors.push({ row: row + 1, col: col });
  } else {
    // Top-Left and Top-Right
    neighbors.push({ row: row - 1, col: col });
    neighbors.push({ row: row - 1, col: col + 1 });
    // Bottom-Left and Bottom-Right
    neighbors.push({ row: row + 1, col: col });
    neighbors.push({ row: row + 1, col: col + 1 });
  }

  // Filter within valid grid bounds
  return neighbors.filter(
    (n) => n.row >= 0 && n.row < MAX_GRID_ROWS && n.col >= 0 && n.col < getColsInRow(n.row)
  );
}

/**
 * Find the closest vacant valid hex cell for a projectile that has collided
 */
export function findSnapCell(
  projX: number,
  projY: number,
  grid: (GridBubble | null)[][],
  radius: number,
  ceilingOffset: number = 0,
  sideMargin: number = 0
): { row: number; col: number } | null {
  let bestCell: { row: number; col: number } | null = null;
  let bestDistSq = Infinity;

  // Search candidate vacant cells
  for (let r = 0; r < MAX_GRID_ROWS; r++) {
    const cols = getColsInRow(r);
    for (let c = 0; c < cols; c++) {
      if (grid[r] && grid[r][c] !== null) continue; // Already occupied

      // If row 0, it is anchored to ceiling; otherwise, it MUST have at least one occupied neighbor
      if (r > 0) {
        const neighbors = getHexNeighbors(r, c);
        const hasOccupiedNeighbor = neighbors.some(
          (n) => grid[n.row] && grid[n.row][n.col] !== null
        );
        if (!hasOccupiedNeighbor) continue;
      }

      const { x, y } = getBubbleCenter(r, c, radius, ceilingOffset, sideMargin);
      const dx = projX - x;
      const dy = projY - y;
      const distSq = dx * dx + dy * dy;

      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        bestCell = { row: r, col: c };
      }
    }
  }

  return bestCell;
}

/**
 * Find all matching connected bubbles of the same color starting at (startRow, startCol)
 */
export function findMatchingCluster(
  startRow: number,
  startCol: number,
  grid: (GridBubble | null)[][]
): { row: number; col: number }[] {
  const startBubble = grid[startRow]?.[startCol];
  if (!startBubble) return [];

  const targetColor = startBubble.color;
  const visited = new Set<string>();
  const matchGroup: { row: number; col: number }[] = [];
  const queue: { row: number; col: number }[] = [{ row: startRow, col: startCol }];
  visited.add(`${startRow},${startCol}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    matchGroup.push(current);

    const neighbors = getHexNeighbors(current.row, current.col);
    for (const nb of neighbors) {
      const key = `${nb.row},${nb.col}`;
      if (!visited.has(key)) {
        visited.add(key);
        const nbBubble = grid[nb.row]?.[nb.col];
        if (nbBubble && nbBubble.color === targetColor) {
          queue.push(nb);
        }
      }
    }
  }

  return matchGroup;
}

/**
 * Find all floating/unsupported bubbles disconnected from row 0
 */
export function findDisconnectedBubbles(
  grid: (GridBubble | null)[][]
): { row: number; col: number; bubble: GridBubble }[] {
  const anchored = new Set<string>();
  const queue: { row: number; col: number }[] = [];

  // Seed with all bubbles in row 0
  const cols0 = getColsInRow(0);
  for (let c = 0; c < cols0; c++) {
    if (grid[0] && grid[0][c] !== null) {
      anchored.add(`0,${c}`);
      queue.push({ row: 0, col: c });
    }
  }

  // BFS flood-fill anchor reachability
  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = getHexNeighbors(curr.row, curr.col);

    for (const nb of neighbors) {
      const key = `${nb.row},${nb.col}`;
      if (!anchored.has(key)) {
        const nbBubble = grid[nb.row]?.[nb.col];
        if (nbBubble !== null && nbBubble !== undefined) {
          anchored.add(key);
          queue.push(nb);
        }
      }
    }
  }

  // Any occupied bubble NOT in anchored is unsupported
  const unsupported: { row: number; col: number; bubble: GridBubble }[] = [];
  for (let r = 0; r < grid.length; r++) {
    const cols = getColsInRow(r);
    for (let c = 0; c < cols; c++) {
      const bubble = grid[r]?.[c];
      if (bubble) {
        if (!anchored.has(`${r},${c}`)) {
          unsupported.push({ row: r, col: c, bubble });
        }
      }
    }
  }

  return unsupported;
}

/**
 * Ray vs Circle intersection test
 */
function rayCircleIntersection(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  cx: number,
  cy: number,
  r: number
): number | null {
  const fx = ox - cx;
  const fy = oy - cy;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;

  const sqrtD = Math.sqrt(discriminant);
  const t1 = (-b - sqrtD) / (2 * a);
  const t2 = (-b + sqrtD) / (2 * a);

  if (t1 > 0) return t1;
  if (t2 > 0) return t2;
  return null;
}

/**
 * Predict aiming trajectory with mathematically accurate side-wall bank shot reflection
 */
export function calculateTrajectory(
  originX: number,
  originY: number,
  angleRad: number, // Direction angle (negative y)
  grid: (GridBubble | null)[][],
  boardWidth: number,
  radius: number,
  ceilingOffset: number = 0,
  sideMargin: number = 0
): TrajectorySegment {
  const points: TrajectoryPoint[] = [{ x: originX, y: originY }];
  let curX = originX;
  let curY = originY;
  let vx = Math.cos(angleRad);
  let vy = Math.sin(angleRad);

  const leftWall = sideMargin + radius;
  const rightWall = boardWidth - sideMargin - radius;
  const ceilingY = radius + ceilingOffset;

  let reflectionPoint: TrajectoryPoint | undefined = undefined;

  // Segment 1: from launcher towards target / first wall
  const stepDist = 8;
  let maxSteps = 160;

  for (let step = 0; step < maxSteps; step++) {
    const nextX = curX + vx * stepDist;
    const nextY = curY + vy * stepDist;

    // Check collision with ceiling
    if (nextY <= ceilingY) {
      points.push({ x: nextX, y: ceilingY });
      break;
    }

    // Check collision with side walls
    if (nextX <= leftWall && vx < 0) {
      // Wall bank on left
      const frac = (leftWall - curX) / (nextX - curX);
      const hitY = curY + (nextY - curY) * frac;
      reflectionPoint = { x: leftWall, y: hitY };
      points.push(reflectionPoint);
      curX = leftWall;
      curY = hitY;
      vx = -vx; // Reflect horizontally
      continue;
    } else if (nextX >= rightWall && vx > 0) {
      // Wall bank on right
      const frac = (rightWall - curX) / (nextX - curX);
      const hitY = curY + (nextY - curY) * frac;
      reflectionPoint = { x: rightWall, y: hitY };
      points.push(reflectionPoint);
      curX = rightWall;
      curY = hitY;
      vx = -vx; // Reflect horizontally
      continue;
    }

    // Check collision with any existing bubble
    let hitBubble = false;
    for (let r = 0; r < grid.length; r++) {
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const bubble = grid[r]?.[c];
        if (!bubble) continue;

        const bCenter = getBubbleCenter(r, c, radius, ceilingOffset, sideMargin);
        const distSq =
          (nextX - bCenter.x) * (nextX - bCenter.x) + (nextY - bCenter.y) * (nextY - bCenter.y);
        const collisionRadius = radius * 1.88; // Tactile collision contact threshold
        if (distSq <= collisionRadius * collisionRadius) {
          hitBubble = true;
          break;
        }
      }
      if (hitBubble) break;
    }

    if (hitBubble) {
      points.push({ x: nextX, y: nextY });
      break;
    }

    points.push({ x: nextX, y: nextY });
    curX = nextX;
    curY = nextY;
  }

  return { points, reflectionPoint };
}
