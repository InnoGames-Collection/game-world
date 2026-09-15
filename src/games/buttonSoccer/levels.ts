import { LevelConfig } from './types';

// Premier international football opponent rotation (South Africa is not the default Level 1 opponent)
export const TOURNAMENT_OPPONENT_ROTATION = [
  'morocco',      // Level 1: African powerhouse & World Cup semi-finalist
  'japan',        // Level 2
  'netherlands',  // Level 3
  'portugal',     // Level 4
  'england',      // Level 5
  'italy',        // Level 6
  'spain',        // Level 7
  'germany',      // Level 8
  'france',       // Level 9
  'argentina',    // Level 10
  'brazil',       // Level 11
  'south_africa', // Level 12
];

export function getOpponentForLevel(levelNum: number, userTeamId: string = 'ethiopia'): string {
  const oppIndex = (levelNum - 1) % TOURNAMENT_OPPONENT_ROTATION.length;
  let opponent = TOURNAMENT_OPPONENT_ROTATION[oppIndex];

  // If opponent matches user's chosen country, switch to an alternate world-class rival
  if (opponent === userTeamId) {
    const altIndex = levelNum % TOURNAMENT_OPPONENT_ROTATION.length;
    opponent = TOURNAMENT_OPPONENT_ROTATION[altIndex];
    if (opponent === userTeamId) {
      opponent = TOURNAMENT_OPPONENT_ROTATION[(altIndex + 1) % TOURNAMENT_OPPONENT_ROTATION.length];
    }
  }
  return opponent;
}

export const BUTTON_SOCCER_LEVELS: LevelConfig[] = Array.from({ length: 40 }, (_, idx) => {
  const levelNum = idx + 1;
  const opponentTeamId = getOpponentForLevel(levelNum, 'ethiopia');

  let title = `Group Match #${levelNum}`;
  if (levelNum === 40) {
    title = '🏆 World Championship Final';
  } else if (levelNum >= 36) {
    title = `Semi-Final Stage ${levelNum - 35}`;
  } else if (levelNum >= 31) {
    title = `Quarter-Final Stage ${levelNum - 30}`;
  } else if (levelNum >= 21) {
    title = `Round of 16 Match ${levelNum - 20}`;
  } else if (levelNum >= 11) {
    title = `Knockout Qualifier ${levelNum - 10}`;
  }

  // Level 1 starts VERY DIFFICULT (0.76 difficulty)
  // Scales up smoothly to 0.99 for Level 40
  const progressRatio = (levelNum - 1) / 39;
  const aiDifficulty = 0.76 + progressRatio * 0.23;
  const aiPrecision = 0.80 + progressRatio * 0.19; // Accuracy in shot targeting
  const aiPower = 0.82 + progressRatio * 0.18;     // Power calculation capability
  const aiAggression = 0.75 + progressRatio * 0.24;

  const targetGoals = levelNum === 40 ? 5 : levelNum >= 25 ? 4 : 3;
  const timeLimitSec = 120; // Default match duration reference

  return {
    levelNum,
    title,
    opponentTeamId,
    targetGoals,
    timeLimitSec,
    aiDifficulty,
    aiPrecision,
    aiPower,
    aiAggression,
    star2GoalsConcededMax: 1,
    star3GoalsConcededMax: 0,
  };
});
