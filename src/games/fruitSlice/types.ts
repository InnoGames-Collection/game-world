import * as THREE from 'three';

export type FruitType =
  | 'watermelon'
  | 'apple'
  | 'orange'
  | 'lemon'
  | 'lime'
  | 'banana'
  | 'peach'
  | 'pear'
  | 'pineapple'
  | 'coconut'
  | 'strawberry'
  | 'kiwi'
  | 'mango'
  | 'dragonfruit'
  | 'pomegranate';

export interface FruitConfig {
  name: string;
  points: number;
  radius: number; // approximate collision radius in world units
  juiceColor: string;
  splatColor: string;
  crunchPitch: number;
  mass: number;
}

export interface FruitHalf {
  group: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  angularVelocity: THREE.Vector3;
  halfType: 'A' | 'B';
}

export interface ActiveFruit {
  id: string;
  type: FruitType;
  isBomb: boolean;
  isSpecialCritical: boolean;
  group: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  angularVelocity: THREE.Vector3;
  radius: number;
  isSliced: boolean;
  slicedTime?: number;
  halves?: [FruitHalf, FruitHalf];
  juiceColor: string;
  splatColor: string;
  points: number;
  fuseLight?: THREE.PointLight;
  fuseSparkMesh?: THREE.Mesh;
  fusePhase?: number;
}

export interface BladePoint {
  x: number; // screen pixel X
  y: number; // screen pixel Y
  worldPos: THREE.Vector3;
  time: number;
}

export interface JuiceParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  gravity: number;
}

export interface WallSplat {
  id: string;
  x: number; // world x on background plane
  y: number; // world y on background plane
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  mesh?: THREE.Mesh;
  droplets: { ox: number; oy: number; r: number }[];
}

export interface ComboBanner {
  id: string;
  count: number;
  bonusPoints: number;
  x: number;
  y: number;
  label: string;
  isCritical?: boolean;
}

export interface LevelConfig {
  levelNumber: number;
  title: string;
  description: string;
  quota: number; // number of fruits required to slice to complete level
  allowedMisses: number; // standard 3 misses
  spawnIntervalMin: number; // ms between launches
  spawnIntervalMax: number;
  simultaneousMin: number; // fruits per launch wave
  simultaneousMax: number;
  minSpeed: number; // vertical launch impulse
  maxSpeed: number;
  bombChance: number; // 0.0 to 0.40
  criticalChance: number; // 0.0 to 0.15
  fruitTypes: FruitType[];
}

export type GameStatus =
  | 'menu'
  | 'leaderboard'
  | 'level_select'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'level_complete'
  | 'game_over';

export interface LevelRecord {
  levelNumber: number;
  stars: number;
  highScore: number;
  unlocked: boolean;
}
