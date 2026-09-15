/**
 * Juicy Match - Core Types and Interfaces
 * Professional Match-3 Fruit Puzzle Architecture
 */

export type FruitType = 
  | 'strawberry' // Red
  | 'blueberry'  // Blue
  | 'kiwi'       // Green
  | 'banana'     // Yellow
  | 'grape'      // Purple
  | 'orange';    // Orange/Citrus

export type SpecialType = 
  | 'none'
  | 'striped_h' // Clears horizontal row
  | 'striped_v' // Clears vertical column
  | 'bomb'      // Explodes in 3x3 radius
  | 'rainbow';   // Clears all fruits of matched color

export interface FruitPiece {
  id: string;
  type: FruitType;
  special: SpecialType;
  // Animation coordinates (relative to cell or in pixels)
  animOffsetX?: number;
  animOffsetY?: number;
  scale?: number;
  opacity?: number;
  isMatched?: boolean;
  isNew?: boolean;
}

export type BlockerType = 
  | 'crate_1' // 1-hit wooden crate
  | 'crate_2' // 2-hit reinforced crate
  | 'crate_3' // 3-hit heavy crate
  | 'chest'   // Treasure chest (contains coins, clears with adjacent match)
  | 'ice'     // Frost covering fruit (fruit can't move until cleared)
  | 'chain';  // Chain locking fruit in place

export type UnderlayType = 
  | 'none'
  | 'juice_1' // Single layer juice puddle (clear with 1 match over it)
  | 'juice_2'; // Double layer juice puddle (clear with 2 matches over it)

export interface Cell {
  x: number;
  y: number;
  valid: boolean; // false if cut out of irregular board
  fruit: FruitPiece | null;
  underlay: UnderlayType; // Juice puddle on cell floor
  blocker: BlockerType | null; // Crate/chest occupying cell (no fruit inside)
  overlay: 'none' | 'ice' | 'chain'; // Frost or chain on top of fruit
}

export type ObjectiveType = 
  | 'collect_fruit' // Collect N fruits of specific type
  | 'clear_juice'   // Clear all juice puddles
  | 'break_crates'  // Break all crates
  | 'open_chests'   // Open all treasure chests
  | 'score_target'; // Reach target score

export interface LevelObjective {
  type: ObjectiveType;
  fruitType?: FruitType;
  target: number;
  current: number;
  label?: string;
}

export interface LevelConfig {
  level: number;
  title: string;
  gridWidth: number;
  gridHeight: number;
  // Matrix of valid cells (0 = hole/cutout, 1 = valid cell)
  validMatrix: number[][];
  moves: number;
  availableFruits: FruitType[];
  // Initial underlays (juice puddles)
  underlays?: { x: number; y: number; type: UnderlayType }[];
  // Initial blockers (crates, chests)
  blockers?: { x: number; y: number; type: BlockerType }[];
  // Initial overlays (ice, chains)
  overlays?: { x: number; y: number; type: 'ice' | 'chain' }[];
  objectives: LevelObjective[];
  starThresholds: [number, number, number]; // Score for 1, 2, 3 stars
  hintMessage?: string;
}

export type GamePlayState = 
  | 'idle'
  | 'swapping'
  | 'matching'
  | 'falling'
  | 'refilling'
  | 'cascading'
  | 'reshuffling'
  | 'booster_active'
  | 'completed'
  | 'failed'
  | 'paused';

export type BoosterType = 'hammer' | 'reshuffle' | 'row_blast' | 'rainbow_bomb';

export interface FloatingScore {
  id: string;
  x: number;
  y: number;
  score: number;
  color?: string;
  createdAt: number;
}

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
  type: 'juice' | 'star' | 'spark' | 'smoke' | 'slice';
  life: number;
  maxLife: number;
}

export interface ComboFeedbackItem {
  id: string;
  text: string;
  subtext?: string;
  color: string;
  bannerType: 'good' | 'great' | 'amazing' | 'juicy' | 'juicy_match' | 'well_done';
  createdAt: number;
}
