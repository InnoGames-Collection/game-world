/**
 * Soccer Shooter - 40 Tournament Levels
 * Progressive championship difficulty starting hard from Level 1 up to Level 40 World Cup Final.
 * Hand-crafted, deterministic, and 100% solvable layouts with diverse tactical formations.
 */

import { SoccerLevelConfig, SoccerTeamColor } from './types';

export const SOCCER_LEVELS: SoccerLevelConfig[] = [
  // -------------------------------------------------------------
  // STAGE 1: GROUP STAGE KICKOFF (Levels 1 - 5) - High skill from the start!
  // -------------------------------------------------------------
  {
    levelNumber: 1,
    title: 'Opening Kickoff',
    subtitle: 'Group Stage Match 1 • Calculate bank-shots to unlock roots',
    availableColors: ['BRAZIL', 'ARGENTINA', 'ENGLAND'],
    maxFouls: 5,
    targetScore: 2400,
    rows: [
      ['BRAZIL', 'BRAZIL', 'ARGENTINA', 'ARGENTINA', 'ENGLAND', 'ENGLAND', 'BRAZIL', 'BRAZIL'],
      ['ARGENTINA', 'ARGENTINA', 'ENGLAND', 'ENGLAND', 'BRAZIL', 'BRAZIL', 'ARGENTINA'],
      ['BRAZIL', null, 'ARGENTINA', 'ENGLAND', 'ENGLAND', 'ARGENTINA', null, 'BRAZIL'],
      ['ARGENTINA', 'BRAZIL', 'ENGLAND', null, 'ENGLAND', 'BRAZIL', 'ARGENTINA'],
      [null, 'ARGENTINA', 'BRAZIL', 'ENGLAND', 'BRAZIL', 'ARGENTINA', null],
    ],
  },
  {
    levelNumber: 2,
    title: 'Defensive Wall',
    subtitle: 'Free-kick barrier • Precision wall ricochets required',
    availableColors: ['BRAZIL', 'ARGENTINA', 'ENGLAND', 'FRANCE'],
    maxFouls: 5,
    targetScore: 2800,
    rows: [
      ['FRANCE', 'FRANCE', 'BRAZIL', 'BRAZIL', 'ARGENTINA', 'ARGENTINA', 'ENGLAND', 'ENGLAND'],
      ['FRANCE', 'BRAZIL', 'BRAZIL', 'ARGENTINA', 'ARGENTINA', 'ENGLAND', 'ENGLAND'],
      ['ENGLAND', null, 'FRANCE', 'BRAZIL', 'ARGENTINA', 'FRANCE', null, 'ENGLAND'],
      ['BRAZIL', 'FRANCE', null, 'ARGENTINA', null, 'FRANCE', 'BRAZIL'],
      [null, 'ENGLAND', 'FRANCE', 'ARGENTINA', 'FRANCE', 'ENGLAND', null],
    ],
  },
  {
    levelNumber: 3,
    title: 'Midfield Diamond',
    subtitle: 'Central diamond formation with isolated flank clusters',
    availableColors: ['BRAZIL', 'ARGENTINA', 'ENGLAND', 'SPAIN'],
    maxFouls: 5,
    targetScore: 3200,
    rows: [
      ['SPAIN', 'SPAIN', null, 'BRAZIL', 'BRAZIL', null, 'ARGENTINA', 'ARGENTINA'],
      ['SPAIN', 'ENGLAND', 'BRAZIL', 'BRAZIL', 'ENGLAND', 'ARGENTINA', 'ARGENTINA'],
      [null, 'ENGLAND', 'ENGLAND', 'SPAIN', 'SPAIN', 'ENGLAND', 'ENGLAND', null],
      ['BRAZIL', null, 'SPAIN', 'SPAIN', 'SPAIN', null, 'BRAZIL'],
      ['ARGENTINA', 'BRAZIL', null, 'ENGLAND', null, 'BRAZIL', 'ARGENTINA'],
      [null, 'ARGENTINA', 'ENGLAND', 'ENGLAND', 'ARGENTINA', null],
    ],
  },
  {
    levelNumber: 4,
    title: 'Winger Flank Cross',
    subtitle: 'Heavy touchline blockades demanding acute bank shots',
    availableColors: ['BRAZIL', 'ARGENTINA', 'FRANCE', 'SPAIN'],
    maxFouls: 5,
    targetScore: 3500,
    rows: [
      ['BRAZIL', 'BRAZIL', 'FRANCE', 'FRANCE', 'SPAIN', 'SPAIN', 'ARGENTINA', 'ARGENTINA'],
      ['BRAZIL', 'BRAZIL', null, null, null, 'ARGENTINA', 'ARGENTINA'],
      ['FRANCE', 'FRANCE', 'BRAZIL', null, null, 'ARGENTINA', 'SPAIN', 'SPAIN'],
      ['FRANCE', null, null, 'SPAIN', 'SPAIN', null, null, 'FRANCE'],
      ['SPAIN', 'BRAZIL', 'ARGENTINA', 'FRANCE', 'ARGENTINA', 'BRAZIL', 'SPAIN'],
      [null, 'SPAIN', 'ARGENTINA', null, 'ARGENTINA', 'SPAIN', null],
    ],
  },
  {
    levelNumber: 5,
    title: 'Goalmouth Scramble',
    subtitle: 'Group Decider • Interlocking double chevrons',
    availableColors: ['BRAZIL', 'ARGENTINA', 'ENGLAND', 'FRANCE', 'SPAIN'],
    maxFouls: 4,
    targetScore: 4000,
    rows: [
      ['SPAIN', 'SPAIN', 'BRAZIL', 'BRAZIL', 'ENGLAND', 'ENGLAND', 'FRANCE', 'FRANCE'],
      ['SPAIN', 'BRAZIL', 'ARGENTINA', 'ARGENTINA', 'ENGLAND', 'FRANCE', 'FRANCE'],
      ['ARGENTINA', null, 'BRAZIL', 'SPECIAL_GOLD', 'ENGLAND', null, 'ARGENTINA', 'ARGENTINA'],
      ['ARGENTINA', 'SPAIN', null, 'FRANCE', null, 'SPAIN', 'ARGENTINA'],
      [null, 'SPAIN', 'FRANCE', 'BRAZIL', 'FRANCE', 'SPAIN', null],
      ['ENGLAND', 'ENGLAND', null, null, null, 'ENGLAND', 'ENGLAND'],
    ],
  },

  // -------------------------------------------------------------
  // STAGE 2: ROUND OF 32 (Levels 6 - 10) - Tighter angles & 4 colors
  // -------------------------------------------------------------
  {
    levelNumber: 6,
    title: 'Sweeper Inversion',
    subtitle: 'Inverted apex formation anchored to upper posts',
    availableColors: ['BRAZIL', 'ARGENTINA', 'GERMANY', 'SPAIN'],
    maxFouls: 4,
    targetScore: 4200,
    rows: [
      ['GERMANY', 'GERMANY', 'BRAZIL', 'BRAZIL', 'SPAIN', 'SPAIN', 'ARGENTINA', 'ARGENTINA'],
      ['GERMANY', 'GERMANY', 'BRAZIL', 'SPAIN', 'ARGENTINA', 'ARGENTINA', 'ARGENTINA'],
      [null, 'GERMANY', 'BRAZIL', null, null, 'ARGENTINA', 'SPAIN', null],
      [null, 'BRAZIL', 'SPAIN', 'SPAIN', 'BRAZIL', null, null],
      [null, null, 'SPAIN', 'GERMANY', 'SPAIN', null, null],
      [null, null, null, 'GERMANY', null, null, null, null],
    ],
  },
  {
    levelNumber: 7,
    title: 'Counter Attack Twin Pillars',
    subtitle: 'Two massive vertical pillars shielding the center',
    availableColors: ['FRANCE', 'ENGLAND', 'GERMANY', 'ITALY'],
    maxFouls: 4,
    targetScore: 4500,
    rows: [
      ['ITALY', 'ITALY', null, 'FRANCE', 'FRANCE', null, 'GERMANY', 'GERMANY'],
      ['ITALY', 'ITALY', null, 'FRANCE', 'FRANCE', null, 'GERMANY', 'GERMANY'],
      ['ENGLAND', 'ENGLAND', null, 'ENGLAND', 'ENGLAND', null, 'ENGLAND', 'ENGLAND'],
      ['ITALY', 'ITALY', null, 'FRANCE', null, null, 'GERMANY', 'GERMANY'],
      ['ITALY', 'ENGLAND', null, null, null, 'ENGLAND', 'GERMANY'],
      ['ENGLAND', 'ENGLAND', null, null, null, null, 'ENGLAND', 'ENGLAND'],
    ],
  },
  {
    levelNumber: 8,
    title: 'Offside Trap',
    subtitle: 'Staggered horizontal defensive line with concealed cores',
    availableColors: ['BRAZIL', 'FRANCE', 'SPAIN', 'ITALY'],
    maxFouls: 4,
    targetScore: 4800,
    rows: [
      ['BRAZIL', 'BRAZIL', 'FRANCE', 'FRANCE', 'SPAIN', 'SPAIN', 'ITALY', 'ITALY'],
      ['ITALY', 'BRAZIL', 'BRAZIL', 'FRANCE', 'SPAIN', 'SPAIN', 'ITALY'],
      ['ITALY', 'ITALY', 'SPAIN', 'SPAIN', 'FRANCE', 'FRANCE', 'BRAZIL', 'BRAZIL'],
      ['BRAZIL', null, 'SPAIN', 'SPECIAL_GOLD', 'FRANCE', null, 'BRAZIL'],
      [null, 'ITALY', 'ITALY', null, 'SPAIN', 'SPAIN', null],
      ['FRANCE', null, null, 'BRAZIL', null, null, 'FRANCE'],
    ],
  },
  {
    levelNumber: 9,
    title: 'The Tiki-Taka Grid',
    subtitle: 'Interleaved passing network requiring quick color rotation',
    availableColors: ['SPAIN', 'ARGENTINA', 'GERMANY', 'BRAZIL'],
    maxFouls: 4,
    targetScore: 5000,
    rows: [
      ['SPAIN', 'ARGENTINA', 'SPAIN', 'ARGENTINA', 'GERMANY', 'BRAZIL', 'GERMANY', 'BRAZIL'],
      ['ARGENTINA', 'SPAIN', 'ARGENTINA', 'SPAIN', 'BRAZIL', 'GERMANY', 'BRAZIL'],
      ['SPAIN', 'ARGENTINA', 'SPAIN', 'ARGENTINA', 'GERMANY', 'BRAZIL', 'GERMANY', 'BRAZIL'],
      ['GERMANY', null, 'BRAZIL', null, 'SPAIN', null, 'ARGENTINA'],
      [null, 'GERMANY', 'BRAZIL', 'BRAZIL', 'SPAIN', 'ARGENTINA', null],
    ],
  },
  {
    levelNumber: 10,
    title: 'Stadium Floodlights',
    subtitle: 'Round of 32 Finale • Radiant angled formations',
    availableColors: ['BRAZIL', 'ARGENTINA', 'ENGLAND', 'FRANCE', 'GERMANY'],
    maxFouls: 4,
    targetScore: 5500,
    rows: [
      ['GERMANY', 'GERMANY', 'BRAZIL', 'BRAZIL', 'ARGENTINA', 'ARGENTINA', 'FRANCE', 'FRANCE'],
      ['GERMANY', 'BRAZIL', 'ENGLAND', 'ENGLAND', 'ARGENTINA', 'FRANCE', 'FRANCE'],
      ['ENGLAND', null, 'BRAZIL', 'SPECIAL_GOLD', 'ARGENTINA', null, 'ENGLAND', 'ENGLAND'],
      ['ENGLAND', 'GERMANY', null, 'FRANCE', null, 'GERMANY', 'ENGLAND'],
      [null, 'GERMANY', 'BRAZIL', 'ARGENTINA', 'FRANCE', 'GERMANY', null],
      ['FRANCE', null, 'BRAZIL', null, 'ARGENTINA', null, 'FRANCE'],
    ],
  },

  // -------------------------------------------------------------
  // STAGE 3: ROUND OF 16 (Levels 11 - 15) - High precision bank shots
  // -------------------------------------------------------------
  {
    levelNumber: 11,
    title: 'Zonal Marking',
    subtitle: 'Distinct tactical zones locked behind perimeter barriers',
    availableColors: ['ARGENTINA', 'ENGLAND', 'ITALY', 'SPAIN'],
    maxFouls: 4,
    targetScore: 5800,
    rows: [
      ['ARGENTINA', 'ARGENTINA', 'ENGLAND', 'ENGLAND', 'ITALY', 'ITALY', 'SPAIN', 'SPAIN'],
      ['ARGENTINA', 'ARGENTINA', 'ENGLAND', 'ITALY', 'ITALY', 'SPAIN', 'SPAIN'],
      ['SPAIN', null, 'ARGENTINA', 'ENGLAND', 'ITALY', 'SPAIN', null, 'ARGENTINA'],
      ['SPAIN', 'SPAIN', null, 'ENGLAND', null, 'ARGENTINA', 'ARGENTINA'],
      [null, 'ITALY', 'ITALY', 'ENGLAND', 'ITALY', 'ITALY', null],
      ['ENGLAND', null, null, null, null, null, 'ENGLAND'],
    ],
  },
  {
    levelNumber: 12,
    title: 'Penalty Arc Defense',
    subtitle: 'Curved defensive arc shielding high-value ceiling drops',
    availableColors: ['BRAZIL', 'FRANCE', 'GERMANY', 'ITALY'],
    maxFouls: 4,
    targetScore: 6200,
    rows: [
      ['ITALY', 'ITALY', 'GERMANY', 'GERMANY', 'FRANCE', 'FRANCE', 'BRAZIL', 'BRAZIL'],
      ['ITALY', 'GERMANY', null, null, null, 'FRANCE', 'BRAZIL'],
      ['GERMANY', null, 'ITALY', 'ITALY', 'BRAZIL', 'BRAZIL', null, 'FRANCE'],
      ['GERMANY', 'GERMANY', null, 'FRANCE', null, 'BRAZIL', 'BRAZIL'],
      [null, 'ITALY', 'FRANCE', 'SPECIAL_GOLD', 'ITALY', 'BRAZIL', null],
      ['FRANCE', null, null, 'GERMANY', null, null, 'BRAZIL'],
    ],
  },
  {
    levelNumber: 13,
    title: 'Flying Header',
    subtitle: 'Asymmetrical suspended clusters requiring rebound bank shots',
    availableColors: ['ARGENTINA', 'BRAZIL', 'ENGLAND', 'GERMANY'],
    maxFouls: 4,
    targetScore: 6600,
    rows: [
      ['ARGENTINA', 'ARGENTINA', 'ARGENTINA', null, null, 'BRAZIL', 'BRAZIL', 'BRAZIL'],
      ['ARGENTINA', 'ARGENTINA', null, null, null, 'BRAZIL', 'BRAZIL'],
      [null, 'ENGLAND', 'ENGLAND', 'GERMANY', 'GERMANY', 'ENGLAND', 'ENGLAND', null],
      ['GERMANY', 'GERMANY', null, 'ARGENTINA', null, 'GERMANY', 'GERMANY'],
      ['BRAZIL', null, 'ARGENTINA', 'BRAZIL', 'ARGENTINA', null, 'BRAZIL'],
      [null, 'BRAZIL', 'ENGLAND', null, 'ENGLAND', 'BRAZIL', null],
    ],
  },
  {
    levelNumber: 14,
    title: 'Crossbar Rebound',
    subtitle: 'Dense top beam with razor-thin shooting channels',
    availableColors: ['SPAIN', 'FRANCE', 'ITALY', 'ENGLAND', 'BRAZIL'],
    maxFouls: 4,
    targetScore: 7000,
    rows: [
      ['SPAIN', 'SPAIN', 'FRANCE', 'FRANCE', 'ITALY', 'ITALY', 'ENGLAND', 'ENGLAND'],
      ['SPAIN', 'BRAZIL', 'FRANCE', 'ITALY', 'BRAZIL', 'ENGLAND', 'ENGLAND'],
      ['BRAZIL', 'BRAZIL', null, 'SPECIAL_GOLD', null, 'BRAZIL', 'BRAZIL', 'BRAZIL'],
      ['SPAIN', null, 'FRANCE', 'ITALY', 'ENGLAND', null, 'SPAIN'],
      [null, 'SPAIN', 'FRANCE', null, 'ENGLAND', 'SPAIN', null],
      ['ITALY', 'ITALY', null, null, null, 'ITALY', 'ITALY'],
    ],
  },
  {
    levelNumber: 15,
    title: 'Round of 16 Decider',
    subtitle: 'Major Tournament Milestone • Collapse outer pillars for massive score',
    availableColors: ['BRAZIL', 'ARGENTINA', 'GERMANY', 'FRANCE', 'SPAIN'],
    maxFouls: 3,
    targetScore: 7500,
    rows: [
      ['BRAZIL', 'BRAZIL', 'ARGENTINA', 'ARGENTINA', 'GERMANY', 'GERMANY', 'FRANCE', 'FRANCE'],
      ['BRAZIL', 'SPAIN', 'ARGENTINA', 'GERMANY', 'SPAIN', 'FRANCE', 'FRANCE'],
      ['SPAIN', 'SPAIN', null, 'SPECIAL_GOLD', null, 'SPAIN', 'SPAIN', 'SPAIN'],
      ['BRAZIL', null, 'ARGENTINA', 'GERMANY', 'FRANCE', null, 'BRAZIL'],
      [null, 'BRAZIL', 'ARGENTINA', 'GERMANY', 'FRANCE', 'BRAZIL', null],
      ['SPAIN', null, null, 'GERMANY', null, null, 'SPAIN'],
    ],
  },

  // -------------------------------------------------------------
  // STAGE 4: QUARTER-FINALS (Levels 16 - 25) - 5 Colors & 3-Foul Pressure
  // -------------------------------------------------------------
  {
    levelNumber: 16,
    title: 'Quarter-Final Kick',
    subtitle: 'Precision bank-shot maze with high foul stakes',
    availableColors: ['ENGLAND', 'ITALY', 'GERMANY', 'ARGENTINA', 'BRAZIL'],
    maxFouls: 3,
    targetScore: 8000,
    rows: [
      ['ENGLAND', 'ENGLAND', 'ITALY', 'ITALY', 'GERMANY', 'GERMANY', 'ARGENTINA', 'ARGENTINA'],
      ['ENGLAND', 'BRAZIL', 'ITALY', 'GERMANY', 'BRAZIL', 'ARGENTINA', 'ARGENTINA'],
      ['BRAZIL', 'BRAZIL', null, null, null, 'BRAZIL', 'BRAZIL', 'BRAZIL'],
      ['ITALY', null, 'ENGLAND', 'GERMANY', 'ARGENTINA', null, 'ITALY'],
      [null, 'ITALY', 'ENGLAND', 'ARGENTINA', 'ITALY', null],
      ['GERMANY', 'GERMANY', null, null, null, 'GERMANY', 'GERMANY'],
    ],
  },
  {
    levelNumber: 17,
    title: 'Bicycle Kick',
    subtitle: 'Inverted wedge with isolated ceiling drop triggers',
    availableColors: ['SPAIN', 'FRANCE', 'BRAZIL', 'GERMANY', 'ENGLAND'],
    maxFouls: 3,
    targetScore: 8400,
    rows: [
      ['SPAIN', 'SPAIN', 'FRANCE', 'FRANCE', 'BRAZIL', 'BRAZIL', 'GERMANY', 'GERMANY'],
      ['SPAIN', 'ENGLAND', 'FRANCE', 'BRAZIL', 'ENGLAND', 'GERMANY', 'GERMANY'],
      [null, 'ENGLAND', 'ENGLAND', null, null, 'ENGLAND', 'ENGLAND', null],
      ['BRAZIL', null, 'SPAIN', 'FRANCE', 'GERMANY', null, 'BRAZIL'],
      [null, 'BRAZIL', 'SPAIN', 'GERMANY', 'BRAZIL', null],
      [null, null, 'SPECIAL_GOLD', null, null, null],
    ],
  },
  {
    levelNumber: 18,
    title: 'Touchline Press',
    subtitle: 'Narrow channel shooting with mandatory bank shot mastery',
    availableColors: ['ARGENTINA', 'ITALY', 'FRANCE', 'BRAZIL', 'SPAIN'],
    maxFouls: 3,
    targetScore: 8800,
    rows: [
      ['ARGENTINA', 'ARGENTINA', 'ITALY', 'ITALY', 'FRANCE', 'FRANCE', 'BRAZIL', 'BRAZIL'],
      ['ARGENTINA', 'SPAIN', 'ITALY', 'FRANCE', 'SPAIN', 'BRAZIL', 'BRAZIL'],
      ['SPAIN', 'SPAIN', null, 'SPECIAL_GOLD', null, 'SPAIN', 'SPAIN', 'SPAIN'],
      ['ARGENTINA', null, 'ITALY', 'FRANCE', 'BRAZIL', null, 'ARGENTINA'],
      ['ITALY', 'ITALY', null, null, null, 'BRAZIL', 'BRAZIL'],
      [null, 'ITALY', null, 'FRANCE', null, 'BRAZIL', null],
    ],
  },
  {
    levelNumber: 19,
    title: 'Volley Blitz',
    subtitle: 'Staggered checkerboard with minimal margin for error',
    availableColors: ['GERMANY', 'ENGLAND', 'SPAIN', 'ARGENTINA', 'BRAZIL'],
    maxFouls: 3,
    targetScore: 9200,
    rows: [
      ['GERMANY', 'ENGLAND', 'GERMANY', 'ENGLAND', 'SPAIN', 'ARGENTINA', 'SPAIN', 'ARGENTINA'],
      ['ENGLAND', 'GERMANY', 'ENGLAND', 'GERMANY', 'ARGENTINA', 'SPAIN', 'ARGENTINA'],
      ['BRAZIL', 'BRAZIL', null, 'SPECIAL_GOLD', null, 'BRAZIL', 'BRAZIL', 'BRAZIL'],
      ['GERMANY', null, 'ENGLAND', 'SPAIN', 'ARGENTINA', null, 'GERMANY'],
      [null, 'GERMANY', 'ENGLAND', 'ARGENTINA', 'GERMANY', null],
      ['SPAIN', 'SPAIN', null, null, null, 'SPAIN', 'SPAIN'],
    ],
  },
  {
    levelNumber: 20,
    title: 'Quarter-Final Showdown',
    subtitle: 'Midpoint Championship Decider • Dense defensive barrier',
    availableColors: ['BRAZIL', 'ARGENTINA', 'FRANCE', 'GERMANY', 'ITALY'],
    maxFouls: 3,
    targetScore: 9800,
    rows: [
      ['BRAZIL', 'BRAZIL', 'ARGENTINA', 'ARGENTINA', 'FRANCE', 'FRANCE', 'GERMANY', 'GERMANY'],
      ['BRAZIL', 'ITALY', 'ARGENTINA', 'FRANCE', 'ITALY', 'GERMANY', 'GERMANY'],
      ['ITALY', 'ITALY', null, 'SPECIAL_GOLD', null, 'ITALY', 'ITALY', 'ITALY'],
      ['BRAZIL', null, 'ARGENTINA', 'FRANCE', 'GERMANY', null, 'BRAZIL'],
      [null, 'BRAZIL', 'ARGENTINA', 'GERMANY', 'BRAZIL', null],
      ['FRANCE', 'FRANCE', null, null, null, 'FRANCE', 'FRANCE'],
    ],
  },
  {
    levelNumber: 21,
    title: 'Golden Goal Protocol',
    subtitle: 'Tight foul tolerance • Exploit ceiling roots to clear fast',
    availableColors: ['SPAIN', 'ENGLAND', 'BRAZIL', 'ARGENTINA', 'FRANCE'],
    maxFouls: 3,
    targetScore: 10200,
    rows: [
      ['SPAIN', 'SPAIN', 'ENGLAND', 'ENGLAND', 'BRAZIL', 'BRAZIL', 'ARGENTINA', 'ARGENTINA'],
      ['SPAIN', 'FRANCE', 'ENGLAND', 'BRAZIL', 'FRANCE', 'ARGENTINA', 'ARGENTINA'],
      ['FRANCE', 'FRANCE', null, null, null, 'FRANCE', 'FRANCE', 'FRANCE'],
      ['SPAIN', null, 'ENGLAND', 'BRAZIL', 'ARGENTINA', null, 'SPAIN'],
      [null, 'SPAIN', 'ENGLAND', 'ARGENTINA', 'SPAIN', null],
      ['BRAZIL', 'BRAZIL', null, 'SPECIAL_GOLD', null, 'BRAZIL', 'BRAZIL'],
    ],
  },
  {
    levelNumber: 22,
    title: 'Hat-Trick Gateway',
    subtitle: 'Triple-cluster gateways blocking access to upper rows',
    availableColors: ['ITALY', 'GERMANY', 'FRANCE', 'ENGLAND', 'BRAZIL'],
    maxFouls: 3,
    targetScore: 10600,
    rows: [
      ['ITALY', 'ITALY', 'GERMANY', 'GERMANY', 'FRANCE', 'FRANCE', 'ENGLAND', 'ENGLAND'],
      ['ITALY', 'BRAZIL', 'GERMANY', 'FRANCE', 'BRAZIL', 'ENGLAND', 'ENGLAND'],
      ['BRAZIL', 'BRAZIL', null, 'SPECIAL_GOLD', null, 'BRAZIL', 'BRAZIL', 'BRAZIL'],
      ['GERMANY', null, 'ITALY', 'FRANCE', 'ENGLAND', null, 'GERMANY'],
      [null, 'GERMANY', 'ITALY', 'ENGLAND', 'GERMANY', null],
      ['FRANCE', 'FRANCE', null, null, null, 'FRANCE', 'FRANCE'],
    ],
  },
  {
    levelNumber: 23,
    title: 'Tactical Substitution',
    subtitle: 'Shift colors rapidly to avert penalty row descent',
    availableColors: ['ARGENTINA', 'BRAZIL', 'SPAIN', 'GERMANY', 'ITALY'],
    maxFouls: 3,
    targetScore: 11000,
    rows: [
      ['ARGENTINA', 'ARGENTINA', 'BRAZIL', 'BRAZIL', 'SPAIN', 'SPAIN', 'GERMANY', 'GERMANY'],
      ['ARGENTINA', 'ITALY', 'BRAZIL', 'SPAIN', 'ITALY', 'GERMANY', 'GERMANY'],
      ['ITALY', 'ITALY', null, null, null, 'ITALY', 'ITALY', 'ITALY'],
      ['ARGENTINA', null, 'BRAZIL', 'SPAIN', 'GERMANY', null, 'ARGENTINA'],
      [null, 'ARGENTINA', 'BRAZIL', 'GERMANY', 'ARGENTINA', null],
      ['SPAIN', 'SPAIN', null, 'SPECIAL_GOLD', null, 'SPAIN', 'SPAIN'],
    ],
  },
  {
    levelNumber: 24,
    title: 'Corner Flag Inswing',
    subtitle: 'Acute angle bank shots from the deepest corners',
    availableColors: ['ENGLAND', 'FRANCE', 'ITALY', 'BRAZIL', 'SPAIN'],
    maxFouls: 3,
    targetScore: 11500,
    rows: [
      ['ENGLAND', 'ENGLAND', 'FRANCE', 'FRANCE', 'ITALY', 'ITALY', 'BRAZIL', 'BRAZIL'],
      ['ENGLAND', 'SPAIN', 'FRANCE', 'ITALY', 'SPAIN', 'BRAZIL', 'BRAZIL'],
      ['SPAIN', 'SPAIN', null, 'SPECIAL_GOLD', null, 'SPAIN', 'SPAIN', 'SPAIN'],
      ['ENGLAND', null, 'FRANCE', 'ITALY', 'BRAZIL', null, 'ENGLAND'],
      [null, 'ENGLAND', 'FRANCE', 'BRAZIL', 'ENGLAND', null],
      ['ITALY', 'ITALY', null, null, null, 'ITALY', 'ITALY'],
    ],
  },
  {
    levelNumber: 25,
    title: 'Semi-Final Berth',
    subtitle: 'Quarter-Final Finale • Massive tactical drop opportunities',
    availableColors: ['BRAZIL', 'ARGENTINA', 'GERMANY', 'FRANCE', 'SPAIN', 'ITALY'],
    maxFouls: 3,
    targetScore: 12000,
    rows: [
      ['BRAZIL', 'BRAZIL', 'ARGENTINA', 'ARGENTINA', 'GERMANY', 'GERMANY', 'FRANCE', 'FRANCE'],
      ['SPAIN', 'SPAIN', 'ITALY', 'ITALY', 'SPAIN', 'SPAIN', 'ITALY'],
      ['BRAZIL', null, 'ARGENTINA', 'SPECIAL_GOLD', 'GERMANY', null, 'FRANCE', 'FRANCE'],
      ['SPAIN', 'ITALY', null, 'BRAZIL', null, 'SPAIN', 'ITALY'],
      [null, 'ARGENTINA', 'GERMANY', 'FRANCE', 'ARGENTINA', null],
      ['BRAZIL', null, null, null, null, null, 'FRANCE'],
    ],
  },

  // -------------------------------------------------------------
  // STAGE 5: SEMI-FINALS (Levels 26 - 35) - Expert Difficulty & 6 Colors
  // -------------------------------------------------------------
  {
    levelNumber: 26,
    title: 'Semi-Final Stage 1',
    subtitle: 'Intense foul penalty • Calculate 3 moves ahead',
    availableColors: ['BRAZIL', 'ARGENTINA', 'ENGLAND', 'GERMANY', 'SPAIN'],
    maxFouls: 3,
    targetScore: 12600,
    rows: [
      ['BRAZIL', 'BRAZIL', 'ARGENTINA', 'ARGENTINA', 'ENGLAND', 'ENGLAND', 'GERMANY', 'GERMANY'],
      ['SPAIN', 'SPAIN', 'BRAZIL', 'ARGENTINA', 'ENGLAND', 'SPAIN', 'SPAIN'],
      [null, 'SPAIN', null, 'SPECIAL_GOLD', null, 'SPAIN', null, null],
      ['GERMANY', 'GERMANY', 'BRAZIL', 'ARGENTINA', 'ENGLAND', 'GERMANY', 'GERMANY'],
      [null, 'GERMANY', 'BRAZIL', 'ENGLAND', 'GERMANY', null],
      ['ARGENTINA', null, null, null, null, null, 'ARGENTINA'],
    ],
  },
  {
    levelNumber: 27,
    title: 'High Pressing Trap',
    subtitle: 'Interlocked color chevrons with high foul vulnerability',
    availableColors: ['FRANCE', 'ITALY', 'SPAIN', 'ARGENTINA', 'ENGLAND'],
    maxFouls: 3,
    targetScore: 13200,
    rows: [
      ['FRANCE', 'FRANCE', 'ITALY', 'ITALY', 'SPAIN', 'SPAIN', 'ARGENTINA', 'ARGENTINA'],
      ['ENGLAND', 'ENGLAND', 'FRANCE', 'ITALY', 'SPAIN', 'ENGLAND', 'ENGLAND'],
      [null, 'ENGLAND', null, null, null, 'ENGLAND', null, null],
      ['ARGENTINA', 'ARGENTINA', 'FRANCE', 'ITALY', 'SPAIN', 'ARGENTINA', 'ARGENTINA'],
      [null, 'ARGENTINA', 'FRANCE', 'SPAIN', 'ARGENTINA', null],
      ['SPECIAL_GOLD', null, null, 'ITALY', null, null, 'SPECIAL_GOLD'],
    ],
  },
  {
    levelNumber: 28,
    title: 'Curving Free Kick',
    subtitle: 'Curving ballistic trajectories required through narrow slots',
    availableColors: ['BRAZIL', 'GERMANY', 'FRANCE', 'ITALY', 'SPAIN'],
    maxFouls: 3,
    targetScore: 13800,
    rows: [
      ['BRAZIL', 'BRAZIL', 'GERMANY', 'GERMANY', 'FRANCE', 'FRANCE', 'ITALY', 'ITALY'],
      ['SPAIN', 'SPAIN', 'BRAZIL', 'GERMANY', 'FRANCE', 'SPAIN', 'SPAIN'],
      ['SPAIN', null, 'SPECIAL_GOLD', null, null, 'SPECIAL_GOLD', null, 'SPAIN'],
      ['ITALY', 'ITALY', 'BRAZIL', 'GERMANY', 'FRANCE', 'ITALY', 'ITALY'],
      [null, 'ITALY', 'BRAZIL', 'FRANCE', 'ITALY', null],
      ['GERMANY', null, null, null, null, null, 'GERMANY'],
    ],
  },
  {
    levelNumber: 29,
    title: 'Penalty Shootout Nerves',
    subtitle: 'Extreme pressure • Zero tolerance for aim drift',
    availableColors: ['ARGENTINA', 'ENGLAND', 'GERMANY', 'FRANCE', 'BRAZIL'],
    maxFouls: 3,
    targetScore: 14400,
    rows: [
      ['ARGENTINA', 'ARGENTINA', 'ENGLAND', 'ENGLAND', 'GERMANY', 'GERMANY', 'FRANCE', 'FRANCE'],
      ['BRAZIL', 'BRAZIL', 'ARGENTINA', 'ENGLAND', 'GERMANY', 'BRAZIL', 'BRAZIL'],
      [null, 'BRAZIL', null, 'SPECIAL_GOLD', null, 'BRAZIL', null, null],
      ['FRANCE', 'FRANCE', 'ARGENTINA', 'ENGLAND', 'GERMANY', 'FRANCE', 'FRANCE'],
      [null, 'FRANCE', 'ARGENTINA', 'GERMANY', 'FRANCE', null],
      ['ENGLAND', null, null, null, null, null, 'ENGLAND'],
    ],
  },
  {
    levelNumber: 30,
    title: 'Semi-Final Leg 2',
    subtitle: 'Championship Qualifier • Dislodge key pins to unleash drops',
    availableColors: ['BRAZIL', 'ARGENTINA', 'ENGLAND', 'FRANCE', 'GERMANY', 'SPAIN'],
    maxFouls: 3,
    targetScore: 15000,
    rows: [
      ['BRAZIL', 'BRAZIL', 'ARGENTINA', 'ARGENTINA', 'ENGLAND', 'ENGLAND', 'FRANCE', 'FRANCE'],
      ['GERMANY', 'GERMANY', 'SPAIN', 'SPAIN', 'GERMANY', 'GERMANY', 'SPAIN'],
      ['BRAZIL', null, 'ARGENTINA', 'SPECIAL_GOLD', 'ENGLAND', null, 'FRANCE', 'FRANCE'],
      ['GERMANY', 'SPAIN', null, 'BRAZIL', null, 'GERMANY', 'SPAIN'],
      [null, 'ARGENTINA', 'ENGLAND', 'FRANCE', 'ARGENTINA', null],
      ['BRAZIL', null, null, null, null, null, 'FRANCE'],
    ],
  },
  {
    levelNumber: 31,
    title: 'The Golden Boot',
    subtitle: 'Complex diamond honeycomb demanding sniper precision',
    availableColors: ['ITALY', 'SPAIN', 'GERMANY', 'ENGLAND', 'BRAZIL'],
    maxFouls: 3,
    targetScore: 15600,
    rows: [
      ['ITALY', 'ITALY', 'SPAIN', 'SPAIN', 'GERMANY', 'GERMANY', 'ENGLAND', 'ENGLAND'],
      ['BRAZIL', 'BRAZIL', 'ITALY', 'SPAIN', 'GERMANY', 'BRAZIL', 'BRAZIL'],
      [null, 'BRAZIL', null, 'SPECIAL_GOLD', null, 'BRAZIL', null, null],
      ['ENGLAND', 'ENGLAND', 'ITALY', 'SPAIN', 'GERMANY', 'ENGLAND', 'ENGLAND'],
      [null, 'ENGLAND', 'ITALY', 'GERMANY', 'ENGLAND', null],
      ['SPAIN', null, null, null, null, null, 'SPAIN'],
    ],
  },
  {
    levelNumber: 32,
    title: 'Extra Time Drama',
    subtitle: 'Narrow vertical chimneys requiring acute double bank-shots',
    availableColors: ['ARGENTINA', 'FRANCE', 'ITALY', 'BRAZIL', 'GERMANY'],
    maxFouls: 3,
    targetScore: 16200,
    rows: [
      ['ARGENTINA', 'ARGENTINA', 'FRANCE', 'FRANCE', 'ITALY', 'ITALY', 'BRAZIL', 'BRAZIL'],
      ['GERMANY', 'GERMANY', 'ARGENTINA', 'FRANCE', 'ITALY', 'GERMANY', 'GERMANY'],
      [null, 'GERMANY', null, 'SPECIAL_GOLD', null, 'GERMANY', null, null],
      ['BRAZIL', 'BRAZIL', 'ARGENTINA', 'FRANCE', 'ITALY', 'BRAZIL', 'BRAZIL'],
      [null, 'BRAZIL', 'ARGENTINA', 'ITALY', 'BRAZIL', null],
      ['FRANCE', null, null, null, null, null, 'FRANCE'],
    ],
  },
  {
    levelNumber: 33,
    title: 'The Cattenaccio Lock',
    subtitle: 'Famous Italian master defense • Crack the outer lock first',
    availableColors: ['ITALY', 'BRAZIL', 'GERMANY', 'ENGLAND', 'SPAIN'],
    maxFouls: 3,
    targetScore: 16800,
    rows: [
      ['ITALY', 'ITALY', 'ITALY', 'ITALY', 'ITALY', 'ITALY', 'ITALY', 'ITALY'],
      ['BRAZIL', 'BRAZIL', 'GERMANY', 'GERMANY', 'ENGLAND', 'ENGLAND', 'SPAIN'],
      ['BRAZIL', null, 'GERMANY', 'SPECIAL_GOLD', 'ENGLAND', null, 'SPAIN', 'SPAIN'],
      ['ITALY', 'BRAZIL', null, 'GERMANY', null, 'ENGLAND', 'ITALY'],
      [null, 'BRAZIL', 'GERMANY', 'ENGLAND', 'BRAZIL', null],
      ['SPAIN', null, null, null, null, null, 'SPAIN'],
    ],
  },
  {
    levelNumber: 34,
    title: 'Total Football Flux',
    subtitle: 'Interleaved patterns that shift dynamically on descent',
    availableColors: ['BRAZIL', 'ARGENTINA', 'FRANCE', 'SPAIN', 'GERMANY'],
    maxFouls: 3,
    targetScore: 17400,
    rows: [
      ['BRAZIL', 'ARGENTINA', 'FRANCE', 'SPAIN', 'GERMANY', 'BRAZIL', 'ARGENTINA', 'FRANCE'],
      ['ARGENTINA', 'FRANCE', 'SPAIN', 'GERMANY', 'BRAZIL', 'ARGENTINA', 'FRANCE'],
      ['BRAZIL', null, 'SPECIAL_GOLD', null, 'SPECIAL_GOLD', null, 'BRAZIL', 'BRAZIL'],
      ['SPAIN', 'GERMANY', 'BRAZIL', 'ARGENTINA', 'FRANCE', 'SPAIN', 'GERMANY'],
      [null, 'SPAIN', 'BRAZIL', 'FRANCE', 'SPAIN', null],
      ['ARGENTINA', null, null, null, null, null, 'ARGENTINA'],
    ],
  },
  {
    levelNumber: 35,
    title: 'Final Ticket Decider',
    subtitle: 'Semi-Final Finale • Win this to enter the World Cup Final arena',
    availableColors: ['BRAZIL', 'ARGENTINA', 'ENGLAND', 'FRANCE', 'GERMANY', 'ITALY'],
    maxFouls: 3,
    targetScore: 18000,
    rows: [
      ['BRAZIL', 'BRAZIL', 'ARGENTINA', 'ARGENTINA', 'ENGLAND', 'ENGLAND', 'FRANCE', 'FRANCE'],
      ['GERMANY', 'GERMANY', 'ITALY', 'ITALY', 'GERMANY', 'GERMANY', 'ITALY'],
      ['BRAZIL', null, 'ARGENTINA', 'SPECIAL_GOLD', 'ENGLAND', null, 'FRANCE', 'FRANCE'],
      ['GERMANY', 'ITALY', null, 'BRAZIL', null, 'GERMANY', 'ITALY'],
      [null, 'ARGENTINA', 'ENGLAND', 'FRANCE', 'ARGENTINA', null],
      ['BRAZIL', null, null, null, null, null, 'FRANCE'],
    ],
  },

  // -------------------------------------------------------------
  // STAGE 6: THE WORLD CUP FINAL TOURNAMENT (Levels 36 - 40) - Championship Extreme
  // -------------------------------------------------------------
  {
    levelNumber: 36,
    title: 'Grand Stadium Arrival',
    subtitle: 'Championship Stage 1 • Dense 6-nation puzzle matrix',
    availableColors: ['BRAZIL', 'ARGENTINA', 'ENGLAND', 'FRANCE', 'GERMANY', 'SPAIN'],
    maxFouls: 3,
    targetScore: 19000,
    rows: [
      ['BRAZIL', 'ARGENTINA', 'ENGLAND', 'FRANCE', 'GERMANY', 'SPAIN', 'BRAZIL', 'ARGENTINA'],
      ['ENGLAND', 'FRANCE', 'GERMANY', 'SPAIN', 'BRAZIL', 'ARGENTINA', 'ENGLAND'],
      ['BRAZIL', null, 'SPECIAL_GOLD', null, null, 'SPECIAL_GOLD', null, 'BRAZIL'],
      ['FRANCE', 'GERMANY', 'SPAIN', 'BRAZIL', 'ARGENTINA', 'ENGLAND', 'FRANCE'],
      [null, 'GERMANY', 'SPAIN', 'ARGENTINA', 'ENGLAND', null],
      ['BRAZIL', null, null, null, null, null, 'BRAZIL'],
    ],
  },
  {
    levelNumber: 37,
    title: 'The Iron Crossbar',
    subtitle: 'Championship Stage 2 • Triple bank-shot geometry required',
    availableColors: ['ITALY', 'GERMANY', 'FRANCE', 'ENGLAND', 'BRAZIL', 'ARGENTINA'],
    maxFouls: 3,
    targetScore: 20000,
    rows: [
      ['ITALY', 'ITALY', 'GERMANY', 'GERMANY', 'FRANCE', 'FRANCE', 'ENGLAND', 'ENGLAND'],
      ['BRAZIL', 'BRAZIL', 'ARGENTINA', 'ARGENTINA', 'BRAZIL', 'BRAZIL', 'ARGENTINA'],
      ['ITALY', null, 'SPECIAL_GOLD', null, null, 'SPECIAL_GOLD', null, 'ENGLAND'],
      ['BRAZIL', 'ARGENTINA', 'ITALY', 'GERMANY', 'FRANCE', 'BRAZIL', 'ARGENTINA'],
      [null, 'ARGENTINA', 'GERMANY', 'FRANCE', 'BRAZIL', null],
      ['ENGLAND', null, null, null, null, null, 'ITALY'],
    ],
  },
  {
    levelNumber: 38,
    title: 'Penalty Sudden Death',
    subtitle: 'Championship Stage 3 • Every shot must be calculated with laser precision',
    availableColors: ['SPAIN', 'BRAZIL', 'ARGENTINA', 'GERMANY', 'ITALY', 'ENGLAND'],
    maxFouls: 3,
    targetScore: 21500,
    rows: [
      ['SPAIN', 'SPAIN', 'BRAZIL', 'BRAZIL', 'ARGENTINA', 'ARGENTINA', 'GERMANY', 'GERMANY'],
      ['ITALY', 'ITALY', 'ENGLAND', 'ENGLAND', 'ITALY', 'ITALY', 'ENGLAND'],
      ['SPAIN', null, 'SPECIAL_GOLD', null, null, 'SPECIAL_GOLD', null, 'GERMANY'],
      ['ITALY', 'ENGLAND', 'BRAZIL', 'ARGENTINA', 'ITALY', 'ENGLAND', 'BRAZIL'],
      [null, 'ENGLAND', 'BRAZIL', 'ARGENTINA', 'ITALY', null],
      ['SPAIN', null, null, null, null, null, 'GERMANY'],
    ],
  },
  {
    levelNumber: 39,
    title: 'The 90th Minute',
    subtitle: 'Championship Semi-Climax • Break the ceiling roots before whistle blows',
    availableColors: ['BRAZIL', 'ARGENTINA', 'ENGLAND', 'FRANCE', 'GERMANY', 'SPAIN'],
    maxFouls: 3,
    targetScore: 23000,
    rows: [
      ['BRAZIL', 'BRAZIL', 'ARGENTINA', 'ARGENTINA', 'ENGLAND', 'ENGLAND', 'FRANCE', 'FRANCE'],
      ['GERMANY', 'GERMANY', 'SPAIN', 'SPAIN', 'GERMANY', 'GERMANY', 'SPAIN'],
      ['BRAZIL', null, 'ARGENTINA', 'SPECIAL_GOLD', 'ENGLAND', null, 'FRANCE', 'FRANCE'],
      ['GERMANY', 'SPAIN', null, 'BRAZIL', null, 'GERMANY', 'SPAIN'],
      [null, 'ARGENTINA', 'ENGLAND', 'FRANCE', 'ARGENTINA', null],
      ['BRAZIL', null, null, null, null, null, 'FRANCE'],
    ],
  },
  {
    levelNumber: 40,
    title: 'World Cup Trophy Final',
    subtitle: 'The Ultimate Championship Match • Clear the legendary Stadium Matrix!',
    availableColors: ['BRAZIL', 'ARGENTINA', 'ENGLAND', 'FRANCE', 'GERMANY', 'SPAIN', 'ITALY'],
    maxFouls: 3,
    targetScore: 25000,
    rows: [
      ['BRAZIL', 'ARGENTINA', 'ENGLAND', 'FRANCE', 'GERMANY', 'SPAIN', 'ITALY', 'BRAZIL'],
      ['ITALY', 'SPAIN', 'GERMANY', 'FRANCE', 'ENGLAND', 'ARGENTINA', 'BRAZIL'],
      ['BRAZIL', null, 'SPECIAL_GOLD', 'SPECIAL_GOLD', 'SPECIAL_GOLD', null, 'BRAZIL', 'BRAZIL'],
      ['ARGENTINA', 'ENGLAND', null, 'FRANCE', null, 'GERMANY', 'SPAIN'],
      [null, 'ENGLAND', 'GERMANY', 'SPAIN', 'ITALY', null],
      ['ITALY', null, null, null, null, null, 'BRAZIL'],
    ],
  },
];

export interface SoccerDifficultyInfo {
  label: string;
  stageName: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  scoreMultiplier: number;
}

export function getSoccerLevel(levelNum: number): SoccerLevelConfig {
  const normalized = Math.max(1, Math.min(40, levelNum));
  return SOCCER_LEVELS[normalized - 1] || SOCCER_LEVELS[0];
}

export function getSoccerLevelDifficulty(levelNum: number): SoccerDifficultyInfo {
  if (levelNum === 40) {
    return {
      label: 'Maximum Tournament Difficulty',
      stageName: 'World Cup Grand Final',
      badgeBg: 'bg-amber-950/80',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-500/80',
      scoreMultiplier: 3.5,
    };
  }
  if (levelNum >= 35) {
    return {
      label: 'Elite',
      stageName: 'Championship Semi-Finals',
      badgeBg: 'bg-indigo-950/80',
      badgeText: 'text-indigo-300',
      badgeBorder: 'border-indigo-500/60',
      scoreMultiplier: 3.0,
    };
  }
  if (levelNum >= 30) {
    return {
      label: 'Extreme',
      stageName: 'Championship Quarter-Finals',
      badgeBg: 'bg-purple-950/80',
      badgeText: 'text-purple-300',
      badgeBorder: 'border-purple-500/60',
      scoreMultiplier: 2.6,
    };
  }
  if (levelNum >= 25) {
    return {
      label: 'Expert+',
      stageName: 'Knockout Round of 16',
      badgeBg: 'bg-rose-950/80',
      badgeText: 'text-rose-300',
      badgeBorder: 'border-rose-500/60',
      scoreMultiplier: 2.2,
    };
  }
  if (levelNum >= 20) {
    return {
      label: 'Expert',
      stageName: 'Knockout Stage',
      badgeBg: 'bg-red-950/80',
      badgeText: 'text-red-300',
      badgeBorder: 'border-red-500/60',
      scoreMultiplier: 1.9,
    };
  }
  if (levelNum >= 15) {
    return {
      label: 'Very Advanced',
      stageName: 'Round of 32 Decider',
      badgeBg: 'bg-orange-950/80',
      badgeText: 'text-orange-300',
      badgeBorder: 'border-orange-500/60',
      scoreMultiplier: 1.6,
    };
  }
  if (levelNum >= 10) {
    return {
      label: 'Advanced',
      stageName: 'Group Stage Top Clash',
      badgeBg: 'bg-amber-950/80',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-500/60',
      scoreMultiplier: 1.4,
    };
  }
  if (levelNum >= 5) {
    return {
      label: 'Very Hard',
      stageName: 'Group Stage Match 2',
      badgeBg: 'bg-emerald-950/80',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-500/60',
      scoreMultiplier: 1.2,
    };
  }
  return {
    label: 'Hard',
    stageName: 'Group Kickoff',
    badgeBg: 'bg-sky-950/80',
    badgeText: 'text-sky-300',
    badgeBorder: 'border-sky-500/60',
    scoreMultiplier: 1.0,
  };
}
