/**
 * SOCCER PING PONG - Trophies and Career Achievements
 */

import { Trophy, PlayerProgress } from './types';

export const INITIAL_TROPHIES: Trophy[] = [
  {
    id: 'first_kickoff',
    title: 'First Kickoff',
    description: 'Complete your first Soccer Ping Pong level',
    icon: '⚽',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'rally_master_5',
    title: 'Rally Starter',
    description: 'Achieve a continuous rally of 5 or more hits',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'rally_master_15',
    title: 'Ping Pong Prodigy',
    description: 'Achieve a continuous rally of 15 or more hits',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    maxProgress: 15,
  },
  {
    id: 'rally_master_25',
    title: 'Marathon Volley',
    description: 'Achieve a continuous rally of 25 or more hits',
    icon: '👑',
    unlocked: false,
    progress: 0,
    maxProgress: 25,
  },
  {
    id: 'clean_sheet',
    title: 'Clean Sheet',
    description: 'Win a match without conceding any lives (3 balls remaining)',
    icon: '🛡️',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'win_streak_5',
    title: 'Unstoppable Run',
    description: 'Win 5 matches in a row without defeat',
    icon: '🌟',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'century_scorer',
    title: 'Century Scorer',
    description: 'Accumulate over 25,000 total career score',
    icon: '🏆',
    unlocked: false,
    progress: 0,
    maxProgress: 25000,
  },
  {
    id: 'championship_hero',
    title: 'Grand Champion',
    description: 'Unlock and conquer all 20 championship levels',
    icon: '🥇',
    unlocked: false,
    progress: 0,
    maxProgress: 20,
  },
];

export function evaluateTrophies(progress: PlayerProgress, matchRally: number, matchLives: number): string[] {
  const newlyUnlocked: string[] = [];
  const currentUnlocked = new Set(progress.unlockedTrophies || []);

  const checkAndUnlock = (id: string, condition: boolean) => {
    if (condition && !currentUnlocked.has(id)) {
      newlyUnlocked.push(id);
      currentUnlocked.add(id);
    }
  };

  checkAndUnlock('first_kickoff', progress.completedLevels.length >= 1);
  checkAndUnlock('rally_master_5', Math.max(progress.highestRallyOverall, matchRally) >= 5);
  checkAndUnlock('rally_master_15', Math.max(progress.highestRallyOverall, matchRally) >= 15);
  checkAndUnlock('rally_master_25', Math.max(progress.highestRallyOverall, matchRally) >= 25);
  checkAndUnlock('clean_sheet', matchLives === 3);
  checkAndUnlock('win_streak_5', progress.winStreak >= 5);
  checkAndUnlock('century_scorer', progress.currentTotalScore >= 25000);
  checkAndUnlock('championship_hero', progress.completedLevels.length >= 20);

  return Array.from(currentUnlocked);
}
