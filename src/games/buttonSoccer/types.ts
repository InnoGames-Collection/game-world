export type GameState = 
  | 'MENU'
  | 'COUNTRY_SELECT'
  | 'MATCH_SETUP'
  | 'HOW_TO_PLAY'
  | 'GAME_RULES'
  | 'SETTINGS'
  | 'ABOUT'
  | 'LEVEL_SELECT'
  | 'MATCH_INTRO'
  | 'PLAYING'
  | 'PAUSED'
  | 'GOAL_CELEBRATION'
  | 'MATCH_OVER'
  | 'LEADERBOARD';

export type MatchMode = 'CHAMPIONSHIP' | 'QUICK_MATCH';

export type TurnState = 
  | 'USER_TURN' 
  | 'OPPONENT_TURN' 
  | 'PHYSICS_ACTIVE' 
  | 'GOAL_RESET';

export type MatchPhase =
  | 'HUMAN_AIM'
  | 'PHYSICS_SETTLING'
  | 'COMPUTER_THINKING'
  | 'COMPUTER_AIM'
  | 'GOAL_CELEBRATION';

export interface MatchStats {
  userGoals: number;
  opponentGoals: number;
  userShots: number;
  userTurns: number;
  durationSec: number;
  finalScore: number;
  stars: number;
  cleanSheet: boolean;
  scoreBreakdown: {
    baseGoals: number;
    cleanSheetBonus: number;
    accuracyBonus: number;
    turnEfficiencyBonus: number;
    speedBonus: number;
    difficultyMultiplier: number;
  };
}

export interface Vector2D {
  x: number;
  y: number;
}

export type CountryFlagType = 
  | 'ETH' 
  | 'BRA' 
  | 'ARG' 
  | 'FRA' 
  | 'GER' 
  | 'ESP' 
  | 'ENG' 
  | 'POR' 
  | 'ITA' 
  | 'NED' 
  | 'JPN' 
  | 'MAR' 
  | 'RSA';

export interface TeamInfo {
  id: string;
  name: string;
  code: string;
  flagEmoji: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  flagType: CountryFlagType;
  ballTheme: {
    baseColor: string;
    patternColor1: string;
    patternColor2: string;
    starOrEmblemColor?: string;
    seamColor: string;
    patternType: 'ethiopia' | 'brazil' | 'argentina' | 'classic' | 'stripes' | 'sun' | 'stars' | 'cross';
  };
}

export interface Disc {
  id: number;
  team: 'user' | 'opponent';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  friction: number;
  restitution: number;
  isGoalkeeper?: boolean;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  friction: number;
  restitution: number;
  spin: number;
  rollAngleX?: number;
  rollAngleY?: number;
  themeCountryId?: string;
}

export interface PitchDimensions {
  pitchLeft: number;
  pitchRight: number;
  pitchTop: number;
  pitchBottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  goalWidth: number;
  goalDepth: number;
  topGoalY: number;
  bottomGoalY: number;
  centerCircleRadius: number;
  penaltyAreaWidth: number;
  penaltyAreaHeight: number;
  goalAreaWidth: number;
  goalAreaHeight: number;
}

export interface AimState {
  isAiming: boolean;
  discId: number | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  angle: number;
  power: number;
}

export interface LevelConfig {
  levelNum: number;
  title: string;
  opponentTeamId: string;
  targetGoals: number;
  timeLimitSec: number;
  aiDifficulty: number; // 0 to 1 scale (Level 1 starts at 0.76 - Very Difficult!)
  aiPrecision: number;
  aiPower: number;
  aiAggression: number;
  star2GoalsConcededMax: number;
  star3GoalsConcededMax: number;
}

export interface LevelSaveData {
  unlocked: boolean;
  completed: boolean;
  stars: number;
  highScore: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  size: number;
}
