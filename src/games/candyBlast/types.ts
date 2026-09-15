/**
 * Candy Blast - Types & Interfaces
 * 8x8 Grid Match-3 Data Models, Piece Definitions, Special Combos & FX
 */

export type CandyType = 
  | 'red-jelly'       // 1. Red Jelly (Gumdrop)
  | 'blue-gem'        // 2. Blue Gem (Sapphire Diamond)
  | 'yellow-hexagon'  // 3. Yellow Hexagon (Honeycomb Prism)
  | 'orange-sphere'   // 4. Orange Sphere (Citrus Orb)
  | 'purple-candy'    // 5. Purple Candy (Swirl Lozenge)
  | 'green-crystal';  // 6. Green Crystal (Faceted Emerald)

export type SpecialType = 
  | 'none'
  | 'line-horizontal'  // 4-match horizontal (clears entire row with laser beam)
  | 'line-vertical'    // 4-match vertical (clears entire column with laser beam)
  | 'area-bomb'        // L or T shape (3x3 explosive shockwave)
  | 'color-bomb';      // 5-match (prismatic core, clears all of chosen color or triggers specials)

export interface CandyPiece {
  id: string;
  type: CandyType;
  special: SpecialType;
  row: number;
  col: number;
  isMatched?: boolean;
  isNew?: boolean;
  isSelected?: boolean;
  isSwapping?: boolean;
  isClearing?: boolean;
  isSpecialTriggered?: boolean;
  isSpawningSpecial?: boolean;
  isFormingSpecial?: boolean;
  isCharging?: boolean;
  isReacting?: boolean;
  reactionColor?: string;
  fallOffset?: number;
  convergeTarget?: Position;
  staggerDelay?: number;
}

export interface Position {
  row: number;
  col: number;
}

export interface MatchGroup {
  type: CandyType | 'color-bomb';
  positions: Position[];
  isLineHorizontal?: boolean;
  isLineVertical?: boolean;
  isAreaBomb?: boolean;
  isColorBomb?: boolean;
  specialSpawnPos?: Position;
  specialTypeToSpawn?: SpecialType;
}

export interface FloatingScore {
  id: string;
  points: number;
  x: number;
  y: number;
  isCombo?: boolean;
  isSpecial?: boolean;
  label?: string;
  color?: string;
}

export interface BlastEffect {
  id: string;
  type: 'line-h' | 'line-v' | 'bomb-3x3' | 'bomb-5x5' | 'color-rainbow' | 'cross-laser' | 'mega-triple';
  row?: number;
  col?: number;
  color?: string;
}

export interface SpecialComboAnimation {
  id: string;
  type: 'cross-laser' | 'mega-triple' | 'bomb-5x5' | 'rainbow-bomb-shockwave' | 'rainbow-laser-cascade' | 'cosmic-board-wipe' | 'rainbow-color-blast';
  pos1: Position;
  pos2: Position;
  targetPositions?: Position[];
  targetColor?: CandyType;
  phase: 'anticipation' | 'detonation' | 'clearing';
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'spark' | 'ring' | 'star';
}

export interface GameStats {
  matchesMade: number;
  specialsCreated: number;
  specialsActivated: number;
  combosTriggered: number;
  bestCombo: number;
  movesMade: number;
}

export type ObjectiveType = 
  | 'score'
  | 'collect_candy'
  | 'clear_jelly'
  | 'clear_blockers'
  | 'create_specials'
  | 'combo_specials';

export interface LevelObjective {
  id: string;
  type: ObjectiveType;
  target: number;
  current: number;
  candyType?: CandyType;
  specialType?: SpecialType | 'any';
  label?: string;
}

export interface BlockerConfig {
  row: number;
  col: number;
  hp: number;
  maxHp: number;
}

export type DifficultyTier = 
  | 'HARD'
  | 'HARD+'
  | 'ADVANCED'
  | 'VERY HARD'
  | 'EXPERT'
  | 'EXPERT+'
  | 'FINAL CHALLENGE';

export interface LevelConfig {
  levelNumber: number;
  name: string;
  description: string;
  difficultyTier?: DifficultyTier;
  moves: number;
  allowedCandies: CandyType[];
  boardHoles?: Position[];
  jellies?: Position[];
  blockers?: { row: number; col: number; hp: number }[];
  objectives: Array<{
    id: string;
    type: ObjectiveType;
    target: number;
    candyType?: CandyType;
    specialType?: SpecialType | 'any';
    label?: string;
  }>;
  starThresholds: [number, number, number];
  tips?: string;
}

export interface LevelRecord {
  stars: number;
  highScore: number;
  completed: boolean;
}

export interface PlayerProgress {
  unlockedLevel: number;
  records: Record<number, LevelRecord>;
}
