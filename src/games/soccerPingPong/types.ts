/**
 * SOCCER PING PONG - Professional Types & State Definitions
 * Authentic Vertical 1v1 Soccer Ping-Pong Game matching the reference video:
 * - Vertical pitch orientation (Computer on top, Human on bottom)
 * - 20 Progressive Levels & Championship Standings
 * - Full Mobile Game Hub with Career Stats, Trophies, Team Selection, Settings
 */

import { SoccerTeam } from './soccerTeams';

export type StadiumTier = 
  | 'training'      // Levels 1-5: Grassroots Training Complex (Daylight)
  | 'city'          // Levels 6-10: City Stadium (Twilight/Sunset)
  | 'national'      // Levels 11-15: National Sports Complex (Night Floodlights)
  | 'continental'   // Levels 16-20: Continental Arena
  | 'premier'       // Levels 21-25: Premier Championship Ground
  | 'elite'         // Levels 26-30: Elite Arena
  | 'international' // Levels 31-35: International Grand Dome
  | 'championship'; // Levels 36-40: World Championship Grand Stadium (World Final Gold)

export type DifficultyTier = 'Foundation' | 'Moderate' | 'Challenging' | 'Advanced' | 'Pressure' | 'Expert' | 'Master' | 'Elite';
export type BallSpeedRating = 'NORMAL' | 'FAST' | 'VERY FAST' | 'EXTREME';
export type OpponentSkillRating = 'NOVICE' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'MASTER';
export type SpecialBallType = 'NONE' | 'POWER' | 'PRECISION' | 'SPIN' | 'BONUS';
export type ReturnTrajectory = 'NORMAL' | 'POWER' | 'ANGLE' | 'SPIN' | 'PERFECT';
export type HitQuality = 'PERFECT' | 'GOOD' | 'DEFENSIVE_SAVE' | 'BAD' | 'MISS';

export interface SoccerLevelConfig {
  level: number;
  title: string;
  subtitle: string;
  stadiumTier: StadiumTier;
  stadiumName: string;
  difficultyTier: DifficultyTier;
  difficultyStars: number;       // 1 to 5 stars
  targetGoals: number;           // Target goals required to win match (e.g. 3, 4, or 5 goals)
  targetScore: number;           // Target progression skill score
  targetRally: number;           // Required minimum rally in the level
  targetPerfectHits: number;     // Bonus/required perfect hits
  ballSpeed: BallSpeedRating;    // Human-readable rating for briefing
  ballSpeedMultiplier: number;   // Physics velocity scale (1.0 to 1.85)
  opponentSkill: OpponentSkillRating; // Human-readable rating for briefing
  opponentAccuracy: number;      // 0.55 to 0.96 AI intercept precision
  opponentSpeed: number;         // Lateral movement speed
  spinFactor: number;            // Spin intensity (0.05 to 0.45)
  timingWindow: number;          // Precision timing sweet-spot width
  specialRule: string;           // Briefing rule text
  specialBallType: SpecialBallType; // Special event ball introduced in level
  description: string;
  requiredCumulativeScore: number; // Cumulative score required to unlock this level
  livesAllowed: number;          // Mistakes/misses allowed before game over
  aiAttackDirectionBias: number; // 0.0 to 1.0 probability of targeting extreme wings
  aiReactionDelay: number;       // Seconds before AI reacts to incoming ball
}

export interface PlayerProgress {
  unlockedLevel: number;                // 1 to 20 (strict progression)
  completedLevels: number[];            // array of completed level numbers
  currentTotalScore: number;            // CARRY-FORWARD TOTAL SCORE
  bestTotalScore: number;               // Highest achieved career score
  bestScores: Record<number, number>;   // level -> best score
  stars: Record<number, number>;        // level -> stars (1-3)
  bestCombos: Record<number, number>;   // level -> best combo
  highestRallyOverall: number;          // Career record rally
  winStreak: number;                    // Consecutive rallies/matches won
  totalMatchesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalReturnsCompleted: number;
  selectedTeamId: string;
  tutorialSeen: boolean;
  unlockedTrophies: string[];
}

export interface LeagueStanding {
  teamId: string;
  team: SoccerTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface Trophy {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface MatchStats {
  score: number;
  rallyCount: number;
  highestRally: number;
  perfectHits: number;
  goodHits: number;
  durationSeconds: number;
  powerKicks: number;
}

export interface HitFeedback {
  id: number;
  quality: HitQuality;
  points: number;
  combo: number;
  trajectory: ReturnTrajectory;
  timestamp: number;
}

export type ControlsPreference = 'BUTTONS' | 'DRAG' | 'DUAL';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  controlsMode: ControlsPreference;
  sensitivity: number; // 0.8 to 1.5
}

export type GameState = 
  | 'HUB'               // Main Sports Game Hub
  | 'TEAM_SELECT'       // Pick team / striker
  | 'CHAMPIONSHIP'      // League Standings & 20 Level progression
  | 'MATCH_SETUP'       // Pre-match briefing (Player vs Computer, Objectives)
  | 'COUNTDOWN'         // 3, 2, 1, Kickoff!
  | 'PLAYING'           // Active match gameplay
  | 'PAUSED'            // Pause menu
  | 'RESULT_WIN'        // Victory screen
  | 'RESULT_LOSS'       // Defeat screen
  | 'LEADERBOARD'       // Leaderboard modal/screen
  | 'CAREER_STATS'      // Career stats screen
  | 'TROPHIES'          // Achievements modal
  | 'SETTINGS';         // Settings modal
