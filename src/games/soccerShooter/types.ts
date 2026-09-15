/**
 * Soccer Shooter - Types & Interfaces
 * Staggered hexagonal grid soccer-themed bubble shooter
 */

export type SoccerTeamColor =
  | 'BRAZIL'       // Brazil 🇧🇷 (Canary Green / Gold Rhombus / Celestial Blue)
  | 'ARGENTINA'    // Argentina 🇦🇷 (Sky Blue & White curved bands / Sun of May gold)
  | 'ENGLAND'      // England 🏴󠁧󠁢󠁥󠁮󠁧󠁿 (Crisp White / St George Red Cross / Navy trim)
  | 'FRANCE'       // France 🇫🇷 (Bleu, Blanc, Rouge curved tricolor / Gold rooster)
  | 'SPAIN'        // Spain 🇪🇸 (Crimson Red / Spanish Gold / Royal Crest)
  | 'GERMANY'      // Germany 🇩🇪 (White leather / Black, Red, Gold curved sash)
  | 'ITALY'        // Italy 🇮🇹 (Azzurri Cobalt Blue / Tricolore ribbon / Stars)
  | 'ETHIOPIA'     // Ethiopia 🇪🇹 (Green, Yellow, Red curved tricolor / Blue star disc)
  | 'PORTUGAL'     // Portugal 🇵🇹 (Olive Green & Crimson split / Armillary sphere)
  | 'NETHERLANDS'  // Netherlands 🇳🇱 (Royal Orange / Red, White, Blue tricolor)
  | 'JAPAN'        // Japan 🇯🇵 (Pure White / Navy accents / Crimson Sun disc)
  | 'SPECIAL_GOLD';// 24K Championship Trophy Gold Ball (Wildcard / Superstar)

export interface TeamColorDefinition {
  id: SoccerTeamColor;
  name: string;
  country: string;
  flagEmoji: string;
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  shadow: string;
  seamColor: string;
  glow: string;
  isSpecial?: boolean;
}

export interface GridBall {
  id: string;
  color: SoccerTeamColor;
  row: number;
  col: number;
  x: number;
  y: number;
  radius: number;
}

export interface ProjectileBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: SoccerTeamColor;
}

export interface FallingBall {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  radius: number;
  color: SoccerTeamColor;
  scoreAwarded?: boolean;
}

export interface SoccerParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'spark' | 'star' | 'ring';
}

export interface FloatingScore {
  id: string;
  text: string;
  x: number;
  y: number;
  alpha: number;
  color: string;
  fontSize: number;
  isGoal?: boolean;
}

export type SoccerGameState =
  | 'LOADING'
  | 'READY'
  | 'AIMING'
  | 'SHOOTING'
  | 'RESOLVING'
  | 'FOUL'
  | 'ADDING_ROW'
  | 'LEVEL_COMPLETE'
  | 'PAUSED'
  | 'GAME_OVER';

export interface SoccerLevelConfig {
  levelNumber: number;
  title: string;
  subtitle: string;
  availableColors: SoccerTeamColor[];
  maxFouls: number;
  targetScore: number;
  shotLimit?: number;
  rows: (SoccerTeamColor | null)[][];
}

export type SoccerShooterStatus = 'menu' | 'leaderboard' | 'level_select' | 'playing';

export interface SoccerLevelRecord {
  level: number;
  unlocked: boolean;
  completed: boolean;
  bestScore: number;
  stars: number;
  shotsUsed?: number;
  accuracyPercent?: number;
  bestCombo?: number;
}

export interface LevelCompletionStats {
  levelNumber: number;
  successfulShots: number;
  totalShots: number;
  accuracyPercent: number;
  bestCombo: number;
  baseScore: number;
  precisionBonus: number;
  comboBonus: number;
  difficultyBonus: number;
  levelScore: number;
  totalTournamentScore: number;
  globalRank: string;
  isNewUnlock: boolean;
  unlockedLevelNumber?: number;
}

export interface TournamentLeaderboardEntry {
  rank: number;
  rankFormatted: string;
  msisdn: string;
  msisdnMasked: string;
  score: number;
  level: number;
  isCurrentUser?: boolean;
}

export interface SoccerProgress {
  highestUnlockedLevel: number;
  completedLevels: Record<number, SoccerLevelRecord>;
  totalScore: number;
}
