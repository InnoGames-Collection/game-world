/**
 * Crazy Colors Type Definitions
 * 40-level progression, precise segment-based geometry, color matching, and save data.
 */

export type CrazyColor = 'pink' | 'cyan' | 'yellow' | 'purple';

export type ShapeType =
  | 'square'
  | 'rotated_square'
  | 'rectangle'
  | 'diamond'
  | 'open_square'
  | 'u_shape'
  | 'v_shape'
  | 'inverted_v'
  | 'c_shape'
  | 'triangle'
  | 'cross'
  | 'hexagon'
  | 'circle_ring'
  | 'double_ring'
  | 'concentric_square'
  | 'horizontal_bars'
  | 'star_polygon';

export type GameState =
  | 'MENU'
  | 'LEVEL_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER'
  | 'HOW_TO_PLAY'
  | 'LEADERBOARD';

export interface ColoredSegment {
  id: string;
  color: CrazyColor;
  // Relative coordinates from obstacle center (0,0) in world units
  type: 'line' | 'arc';
  // For line segments:
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  // For arc segments:
  radius?: number;
  startAngle?: number; // radians
  endAngle?: number;   // radians
}

export interface ObstacleInstance {
  id: string;
  y: number; // World Y position (player climbs up, so world Y decreases or increases)
  shapeType: ShapeType;
  rotation: number; // Current rotation angle in radians
  rotationSpeed: number; // radians per second (positive = clockwise, negative = ccw)
  scale: number;
  segments: ColoredSegment[];
  passed: boolean;
  oscillationX?: {
    amplitude: number;
    speed: number;
    offset: number;
  };
}

export interface ColorSwitcherInstance {
  id: string;
  y: number;
  rotation: number;
  nextColor?: CrazyColor; // Optional forced color, or random from remaining 3
  collected: boolean;
}

export interface StarCollectible {
  id: string;
  y: number;
  collected: boolean;
}

export interface LevelDefinition {
  id: number; // 1 to 40
  title: string;
  difficulty: 'hard' | 'very_hard' | 'very_hard+' | 'expert' | 'expert+' | 'extreme' | 'master' | 'master+' | 'final_challenge';
  description: string;
  obstacles: Array<{
    shapeType: ShapeType;
    rotationSpeed: number; // rad/s
    scale?: number;
    oscillationX?: { amplitude: number; speed: number };
  }>;
  startColor: CrazyColor;
  starThresholds: [number, number, number, number, number]; // 1 to 5 star scores
}

export interface CrazyColorsSaveData {
  highestUnlockedLevel: number; // 1 to 40
  stars: Record<number, number>; // levelId -> 1 to 5
  bestScores: Record<number, number>; // levelId -> score
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}
