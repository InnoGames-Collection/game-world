/**
 * Candy Blast - 40-Level Handcrafted Progressive Campaign
 * 
 * Strict Difficulty Progression:
 * - Levels 1–5:   HARD
 * - Levels 6–10:  HARD+
 * - Levels 11–20: ADVANCED
 * - Levels 21–30: VERY HARD
 * - Levels 31–35: EXPERT
 * - Levels 36–39: EXPERT+
 * - Level 40:     FINAL CHALLENGE
 * 
 * Master Level Economy:
 * - Move count decreases progressively (from 14 down to 6–7)
 * - Multi-layered objectives (Blockers, Target Candies, Score, Specials)
 * - Controlled board geometries with dead zones, holes, and separated obstacle bastions
 * - 100% solvable configurations with guaranteed initial move validation
 */

import { LevelConfig, CandyType } from './types';

const BASE_CANDIES_5: CandyType[] = ['red-jelly', 'blue-gem', 'yellow-hexagon', 'green-crystal', 'purple-candy'];
const ALL_CANDIES_6: CandyType[] = ['red-jelly', 'blue-gem', 'yellow-hexagon', 'green-crystal', 'purple-candy', 'orange-sphere'];

export const CANDY_LEVELS: LevelConfig[] = [
  // =========================================================================
  // TIER: HARD (Levels 1–5)
  // =========================================================================

  // Level 1: Hard introduction (14 moves, score 1,000 + 10 red candies)
  {
    levelNumber: 1,
    name: 'Crimson Initiation',
    description: 'Master your first 14 deliberate moves and harvest red gumdrops.',
    difficultyTier: 'HARD',
    moves: 14,
    allowedCandies: BASE_CANDIES_5,
    objectives: [
      { id: 'target_score', type: 'score', target: 1000, label: 'Target Score' },
      { id: 'collect_red', type: 'collect_candy', candyType: 'red-jelly', target: 10, label: 'Crimson Jellies' },
    ],
    starThresholds: [1000, 1600, 2400],
    tips: 'Every move counts! Look for 4-in-a-row line clears in the center to spark cascades.',
  },

  // Level 2: First restriction (14 moves, 14 frosted jellies + 12 blue gems)
  {
    levelNumber: 2,
    name: 'Glacial Frost',
    description: 'Shatter 14 frozen tiles clustered beneath the central diamond.',
    difficultyTier: 'HARD',
    moves: 14,
    allowedCandies: BASE_CANDIES_5,
    jellies: [
      { row: 1, col: 3 }, { row: 1, col: 4 },
      { row: 2, col: 3 }, { row: 2, col: 4 },
      { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
      { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 },
      { row: 5, col: 3 }, { row: 5, col: 4 },
    ],
    objectives: [
      { id: 'clear_jellies', type: 'clear_jelly', target: 14, label: 'Frozen Tiles' },
      { id: 'collect_blue', type: 'collect_candy', candyType: 'blue-gem', target: 12, label: 'Sapphire Gems' },
    ],
    starThresholds: [1100, 1800, 2600],
    tips: 'Match candies directly over frosted tiles to crack the ice layer.',
  },

  // Level 3: Obstacle control (15 moves, 8 separated blockers + 1,200 score)
  {
    levelNumber: 3,
    name: 'Twin Spires',
    description: 'Demolish the twin stone spires separating the board.',
    difficultyTier: 'HARD',
    moves: 15,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      { row: 2, col: 2, hp: 1 }, { row: 3, col: 2, hp: 1 }, { row: 4, col: 2, hp: 1 }, { row: 5, col: 2, hp: 1 },
      { row: 2, col: 5, hp: 1 }, { row: 3, col: 5, hp: 1 }, { row: 4, col: 5, hp: 1 }, { row: 5, col: 5, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 8, label: 'Stone Blocks' },
      { id: 'target_score', type: 'score', target: 1200, label: 'Target Score' },
    ],
    starThresholds: [1200, 1900, 2800],
    tips: 'Craft horizontal line blasts to pierce both stone spires simultaneously.',
  },

  // Level 4: Special candy pressure (14 moves, 3 specials + 16 yellow prisms)
  {
    levelNumber: 4,
    name: 'Prism Pressure',
    description: 'Synthesize 3 special candies to blast through the corner notches.',
    difficultyTier: 'HARD',
    moves: 14,
    allowedCandies: BASE_CANDIES_5,
    boardHoles: [
      { row: 0, col: 0 }, { row: 0, col: 7 },
      { row: 7, col: 0 }, { row: 7, col: 7 },
    ],
    blockers: [
      { row: 3, col: 3, hp: 1 }, { row: 3, col: 4, hp: 1 },
      { row: 4, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'create_specials', type: 'create_specials', target: 3, label: 'Special Candies' },
      { id: 'collect_yellow', type: 'collect_candy', candyType: 'yellow-hexagon', target: 16, label: 'Honeycomb Prisms' },
    ],
    starThresholds: [1400, 2200, 3200],
    tips: 'Aim for 4-matches or L-shapes to generate line lasers and area bombs.',
  },

  // Level 5: Multi-objective citadel (14 moves, 12 frozen cells + 16 green crystals + 1,500 score)
  {
    levelNumber: 5,
    name: 'Emerald Citadel',
    description: 'Shatter 12 perimeter frost tiles and harvest 16 emerald crystals.',
    difficultyTier: 'HARD',
    moves: 14,
    allowedCandies: BASE_CANDIES_5,
    jellies: [
      { row: 1, col: 2 }, { row: 1, col: 5 },
      { row: 2, col: 1 }, { row: 2, col: 6 },
      { row: 3, col: 3 }, { row: 3, col: 4 },
      { row: 4, col: 3 }, { row: 4, col: 4 },
      { row: 5, col: 1 }, { row: 5, col: 6 },
      { row: 6, col: 2 }, { row: 6, col: 5 },
    ],
    blockers: [
      { row: 3, col: 1, hp: 1 }, { row: 4, col: 1, hp: 1 },
      { row: 3, col: 6, hp: 1 }, { row: 4, col: 6, hp: 1 },
    ],
    objectives: [
      { id: 'clear_jellies', type: 'clear_jelly', target: 12, label: 'Frozen Cells' },
      { id: 'collect_green', type: 'collect_candy', candyType: 'green-crystal', target: 16, label: 'Emeralds' },
      { id: 'target_score', type: 'score', target: 1500, label: 'Target Score' },
    ],
    starThresholds: [1500, 2400, 3500],
    tips: 'Clear the flank blockers early to let new candies cascade into the frost zones.',
  },

  // =========================================================================
  // TIER: HARD+ (Levels 6–10)
  // =========================================================================

  // Level 6: Limited space (13 moves, 14 purple candies + 1,500 score, irregular board)
  {
    levelNumber: 6,
    name: 'Hourglass Choke',
    description: 'Navigate the narrow hourglass corridor with only 13 moves.',
    difficultyTier: 'HARD+',
    moves: 13,
    allowedCandies: BASE_CANDIES_5,
    boardHoles: [
      { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 6 }, { row: 0, col: 7 },
      { row: 7, col: 0 }, { row: 7, col: 1 }, { row: 7, col: 6 }, { row: 7, col: 7 },
    ],
    blockers: [
      { row: 2, col: 3, hp: 1 }, { row: 2, col: 4, hp: 1 },
      { row: 5, col: 3, hp: 1 }, { row: 5, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'collect_purple', type: 'collect_candy', candyType: 'purple-candy', target: 14, label: 'Amethyst Candies' },
      { id: 'target_score', type: 'score', target: 1500, label: 'Target Score' },
    ],
    starThresholds: [1500, 2500, 3600],
    tips: 'Vertical matches down the center neck trigger massive chain falls in the lower wing.',
  },

  // Level 7: Blocker clusters (13 moves, 10 blockers + 16 orange spheres)
  {
    levelNumber: 7,
    name: 'Twin Strongholds',
    description: 'Shatter 10 fortified stone blocks across opposing corners.',
    difficultyTier: 'HARD+',
    moves: 13,
    allowedCandies: ALL_CANDIES_6,
    blockers: [
      // Cluster 1 (5 hits: 1 reinforced hp:2 + 3 hp:1)
      { row: 1, col: 2, hp: 1 }, { row: 2, col: 1, hp: 1 }, { row: 2, col: 2, hp: 2 }, { row: 2, col: 3, hp: 1 },
      // Cluster 2 (5 hits: 1 reinforced hp:2 + 3 hp:1)
      { row: 5, col: 5, hp: 1 }, { row: 5, col: 6, hp: 1 }, { row: 6, col: 5, hp: 2 }, { row: 6, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 10, label: 'Blocker Layers' },
      { id: 'collect_orange', type: 'collect_candy', candyType: 'orange-sphere', target: 16, label: 'Amber Orbs' },
    ],
    starThresholds: [1600, 2600, 3800],
    tips: 'Reinforced 2-HP blocks take two hits to crack. Use bombs for area impact.',
  },

  // Level 8: Special candy challenge (13 moves, 4 specials + 18 blue gems)
  {
    levelNumber: 8,
    name: 'Catalyst Matrix',
    description: 'Synthesize 4 special candies across the segmented matrix.',
    difficultyTier: 'HARD+',
    moves: 13,
    allowedCandies: BASE_CANDIES_5,
    boardHoles: [
      { row: 0, col: 3 }, { row: 0, col: 4 },
      { row: 7, col: 3 }, { row: 7, col: 4 },
    ],
    blockers: [
      { row: 3, col: 2, hp: 1 }, { row: 3, col: 5, hp: 1 },
      { row: 4, col: 2, hp: 1 }, { row: 4, col: 5, hp: 1 },
    ],
    objectives: [
      { id: 'create_specials', type: 'create_specials', target: 4, label: 'Special Candies' },
      { id: 'collect_blue', type: 'collect_candy', candyType: 'blue-gem', target: 18, label: 'Sapphire Gems' },
    ],
    starThresholds: [1700, 2800, 4000],
    tips: 'Combine a line blast with an area bomb for a devastating screen wipe.',
  },

  // Level 9: Combination objective (12 moves, 10 blockers + 3 specials + 1,800 score)
  {
    levelNumber: 9,
    name: 'Tectonic Nexus',
    description: 'Destroy 10 central ring blockers and forge 3 special candies.',
    difficultyTier: 'HARD+',
    moves: 12,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      { row: 2, col: 3, hp: 1 }, { row: 2, col: 4, hp: 1 },
      { row: 3, col: 2, hp: 1 }, { row: 3, col: 5, hp: 1 },
      { row: 4, col: 2, hp: 1 }, { row: 4, col: 5, hp: 1 },
      { row: 5, col: 3, hp: 1 }, { row: 5, col: 4, hp: 1 },
      { row: 3, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 10, label: 'Stone Blocks' },
      { id: 'create_specials', type: 'create_specials', target: 3, label: 'Special Candies' },
      { id: 'target_score', type: 'score', target: 1800, label: 'Target Score' },
    ],
    starThresholds: [1800, 3000, 4200],
    tips: 'Special candy activations damage multiple ring blockers simultaneously.',
  },

  // Level 10: First major checkpoint (12 moves, 20 red candies + 12 blockers + 2,000 score)
  {
    levelNumber: 10,
    name: 'Garrison Gate',
    description: 'Checkpoint 1: Breach the 12 garrison blockers with only 12 moves.',
    difficultyTier: 'HARD+',
    moves: 12,
    allowedCandies: BASE_CANDIES_5,
    boardHoles: [
      { row: 0, col: 0 }, { row: 0, col: 7 },
      { row: 7, col: 0 }, { row: 7, col: 7 },
    ],
    blockers: [
      { row: 2, col: 2, hp: 1 }, { row: 2, col: 3, hp: 1 }, { row: 2, col: 4, hp: 1 }, { row: 2, col: 5, hp: 1 },
      { row: 5, col: 2, hp: 1 }, { row: 5, col: 3, hp: 1 }, { row: 5, col: 4, hp: 1 }, { row: 5, col: 5, hp: 1 },
      { row: 3, col: 2, hp: 1 }, { row: 4, col: 2, hp: 1 }, { row: 3, col: 5, hp: 1 }, { row: 4, col: 5, hp: 1 },
    ],
    objectives: [
      { id: 'collect_red', type: 'collect_candy', candyType: 'red-jelly', target: 20, label: 'Crimson Jellies' },
      { id: 'clear_blockers', type: 'clear_blockers', target: 12, label: 'Fortress Blocks' },
      { id: 'target_score', type: 'score', target: 2000, label: 'Target Score' },
    ],
    starThresholds: [2000, 3200, 4500],
    tips: 'Breach the bottom wall first to open continuous gravity refill streams.',
  },

  // =========================================================================
  // TIER: ADVANCED (Levels 11–20)
  // =========================================================================

  // Level 11: Split obstacle areas (12 moves, 18 blue + 12 blockers + 2,000 score)
  {
    levelNumber: 11,
    name: 'Twin Trenches',
    description: 'Clear 12 split trench blockers and gather 18 sapphire gems.',
    difficultyTier: 'ADVANCED',
    moves: 12,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      { row: 1, col: 1, hp: 1 }, { row: 1, col: 2, hp: 1 }, { row: 1, col: 5, hp: 1 }, { row: 1, col: 6, hp: 1 },
      { row: 2, col: 3, hp: 1 }, { row: 2, col: 4, hp: 1 }, { row: 5, col: 3, hp: 1 }, { row: 5, col: 4, hp: 1 },
      { row: 6, col: 1, hp: 1 }, { row: 6, col: 2, hp: 1 }, { row: 6, col: 5, hp: 1 }, { row: 6, col: 6, hp: 1 },
    ],
    objectives: [
      { id: 'collect_blue', type: 'collect_candy', candyType: 'blue-gem', target: 18, label: 'Sapphire Gems' },
      { id: 'clear_blockers', type: 'clear_blockers', target: 12, label: 'Trench Blocks' },
      { id: 'target_score', type: 'score', target: 2000, label: 'Target Score' },
    ],
    starThresholds: [2000, 3300, 4600],
    tips: 'Vertical line clears along columns 1, 2, 5, and 6 wipe the trenches clean.',
  },

  // Level 12: Restricted center area (12 moves, 20 yellow + 4 specials)
  {
    levelNumber: 12,
    name: 'Void Core',
    description: 'Synthesize 4 specials around the central void chasm.',
    difficultyTier: 'ADVANCED',
    moves: 12,
    allowedCandies: BASE_CANDIES_5,
    boardHoles: [
      { row: 3, col: 3 }, { row: 3, col: 4 },
      { row: 4, col: 3 }, { row: 4, col: 4 },
    ],
    blockers: [
      { row: 2, col: 3, hp: 1 }, { row: 2, col: 4, hp: 1 },
      { row: 5, col: 3, hp: 1 }, { row: 5, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'collect_yellow', type: 'collect_candy', candyType: 'yellow-hexagon', target: 20, label: 'Honeycomb Prisms' },
      { id: 'create_specials', type: 'create_specials', target: 4, label: 'Special Candies' },
    ],
    starThresholds: [2100, 3400, 4800],
    tips: 'Use the left and right corridors to build 5-match color bombs.',
  },

  // Level 13: Difficult-to-reach blockers (11 moves, 14 blockers + 2,200 score)
  {
    levelNumber: 13,
    name: 'Deep Basalt',
    description: 'Demolish 14 bottom perimeter blocks in only 11 moves.',
    difficultyTier: 'ADVANCED',
    moves: 11,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      { row: 7, col: 0, hp: 1 }, { row: 7, col: 1, hp: 1 }, { row: 7, col: 2, hp: 1 }, { row: 7, col: 3, hp: 1 },
      { row: 7, col: 4, hp: 1 }, { row: 7, col: 5, hp: 1 }, { row: 7, col: 6, hp: 1 }, { row: 7, col: 7, hp: 1 },
      { row: 6, col: 0, hp: 1 }, { row: 6, col: 1, hp: 1 }, { row: 6, col: 6, hp: 1 }, { row: 6, col: 7, hp: 1 },
      { row: 0, col: 0, hp: 1 }, { row: 0, col: 7, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 14, label: 'Basalt Blocks' },
      { id: 'target_score', type: 'score', target: 2200, label: 'Target Score' },
    ],
    starThresholds: [2200, 3500, 5000],
    tips: 'A horizontal line blast in row 7 will demolish eight blockers in a single stroke.',
  },

  // Level 14: Advanced multi-objective (11 moves, 22 green + 12 blockers + 2 specials)
  {
    levelNumber: 14,
    name: 'Crossfire Bastion',
    description: 'Break 12 crossfire blockers and harvest 22 emerald crystals.',
    difficultyTier: 'ADVANCED',
    moves: 11,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      { row: 1, col: 3, hp: 1 }, { row: 1, col: 4, hp: 1 },
      { row: 3, col: 1, hp: 1 }, { row: 4, col: 1, hp: 1 },
      { row: 3, col: 6, hp: 1 }, { row: 4, col: 6, hp: 1 },
      { row: 6, col: 3, hp: 1 }, { row: 6, col: 4, hp: 1 },
      { row: 3, col: 3, hp: 1 }, { row: 3, col: 4, hp: 1 },
      { row: 4, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'collect_green', type: 'collect_candy', candyType: 'green-crystal', target: 22, label: 'Emerald Crystals' },
      { id: 'clear_blockers', type: 'clear_blockers', target: 12, label: 'Crossfire Blocks' },
      { id: 'create_specials', type: 'create_specials', target: 2, label: 'Special Candies' },
    ],
    starThresholds: [2300, 3600, 5100],
    tips: 'Create specials early so their detonations clear the inner cross blockers.',
  },

  // Level 15: Irregular shape, restricted corners (11 moves, 2,500 score + 20 purple + 14 blockers)
  {
    levelNumber: 15,
    name: 'Octagonal Citadel',
    description: 'Conquer the 14 citadel blockers in 11 moves on an octagonal board.',
    difficultyTier: 'ADVANCED',
    moves: 11,
    allowedCandies: BASE_CANDIES_5,
    boardHoles: [
      { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 },
      { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 1, col: 7 },
      { row: 6, col: 0 }, { row: 7, col: 0 }, { row: 7, col: 1 },
      { row: 6, col: 7 }, { row: 7, col: 6 }, { row: 7, col: 7 },
    ],
    blockers: [
      { row: 2, col: 2, hp: 1 }, { row: 2, col: 3, hp: 1 }, { row: 2, col: 4, hp: 1 }, { row: 2, col: 5, hp: 1 },
      { row: 5, col: 2, hp: 1 }, { row: 5, col: 3, hp: 1 }, { row: 5, col: 4, hp: 1 }, { row: 5, col: 5, hp: 1 },
      { row: 3, col: 2, hp: 1 }, { row: 4, col: 2, hp: 1 }, { row: 3, col: 5, hp: 1 }, { row: 4, col: 5, hp: 1 },
      { row: 3, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'target_score', type: 'score', target: 2500, label: 'Target Score' },
      { id: 'collect_purple', type: 'collect_candy', candyType: 'purple-candy', target: 20, label: 'Amethysts' },
      { id: 'clear_blockers', type: 'clear_blockers', target: 14, label: 'Citadel Blocks' },
    ],
    starThresholds: [2500, 3800, 5300],
    tips: 'Concentrate on matching near the center to crack multiple perimeter blocks.',
  },

  // Level 16: Checkerboard blockers interfering with matches (11 moves, 5 specials + 20 orange)
  {
    levelNumber: 16,
    name: 'Disruption Grid',
    description: 'Overcome checkerboard interference to forge 5 special candies.',
    difficultyTier: 'ADVANCED',
    moves: 11,
    allowedCandies: ALL_CANDIES_6,
    blockers: [
      { row: 2, col: 2, hp: 1 }, { row: 2, col: 4, hp: 1 },
      { row: 3, col: 3, hp: 1 }, { row: 3, col: 5, hp: 1 },
      { row: 4, col: 2, hp: 1 }, { row: 4, col: 4, hp: 1 },
      { row: 5, col: 3, hp: 1 }, { row: 5, col: 5, hp: 1 },
    ],
    objectives: [
      { id: 'create_specials', type: 'create_specials', target: 5, label: 'Special Candies' },
      { id: 'collect_orange', type: 'collect_candy', candyType: 'orange-sphere', target: 20, label: 'Amber Orbs' },
    ],
    starThresholds: [2600, 4000, 5500],
    tips: 'Destroying even two checkerboard blockers re-establishes normal match lines.',
  },

  // Level 17: Tight move budget (10 moves, 16 blockers + 22 red candies)
  {
    levelNumber: 17,
    name: 'Iron Periphery',
    description: 'Shatter 16 perimeter blockers with only 10 strategic moves.',
    difficultyTier: 'ADVANCED',
    moves: 10,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      { row: 1, col: 2, hp: 1 }, { row: 1, col: 3, hp: 1 }, { row: 1, col: 4, hp: 1 }, { row: 1, col: 5, hp: 1 },
      { row: 6, col: 2, hp: 1 }, { row: 6, col: 3, hp: 1 }, { row: 6, col: 4, hp: 1 }, { row: 6, col: 5, hp: 1 },
      { row: 2, col: 1, hp: 1 }, { row: 3, col: 1, hp: 1 }, { row: 4, col: 1, hp: 1 }, { row: 5, col: 1, hp: 1 },
      { row: 2, col: 6, hp: 1 }, { row: 3, col: 6, hp: 1 }, { row: 4, col: 6, hp: 1 }, { row: 5, col: 6, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 16, label: 'Perimeter Blocks' },
      { id: 'collect_red', type: 'collect_candy', candyType: 'red-jelly', target: 22, label: 'Crimson Jellies' },
    ],
    starThresholds: [2700, 4100, 5700],
    tips: 'Line blasts extending to the outer edges are mandatory to hit this quota.',
  },

  // Level 18: Score and special balance (10 moves, 2,800 score + 4 specials + 18 blue)
  {
    levelNumber: 18,
    name: 'Cobalt Matrix',
    description: 'Score 2,800 points and synthesize 4 specials in 10 moves.',
    difficultyTier: 'ADVANCED',
    moves: 10,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      { row: 2, col: 3, hp: 1 }, { row: 3, col: 3, hp: 1 }, { row: 4, col: 3, hp: 1 }, { row: 5, col: 3, hp: 1 },
      { row: 2, col: 4, hp: 1 }, { row: 3, col: 4, hp: 1 }, { row: 4, col: 4, hp: 1 }, { row: 5, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'target_score', type: 'score', target: 2800, label: 'Target Score' },
      { id: 'create_specials', type: 'create_specials', target: 4, label: 'Special Candies' },
      { id: 'collect_blue', type: 'collect_candy', candyType: 'blue-gem', target: 18, label: 'Sapphire Gems' },
    ],
    starThresholds: [2800, 4200, 5900],
    tips: 'A Color Bomb combined with a Line Blast generates huge cascading point multipliers.',
  },

  // Level 19: Separated blocker zones (10 moves, 18 blockers + 22 yellow + 3,000 score)
  {
    levelNumber: 19,
    name: 'Triple Bastion',
    description: 'Destroy 18 reinforced blocker layers across 3 defensive bastions.',
    difficultyTier: 'ADVANCED',
    moves: 10,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      // Top Bastion (6 hits)
      { row: 1, col: 3, hp: 2 }, { row: 1, col: 4, hp: 2 }, { row: 2, col: 3, hp: 1 }, { row: 2, col: 4, hp: 1 },
      // Left Bastion (6 hits)
      { row: 4, col: 1, hp: 2 }, { row: 4, col: 2, hp: 2 }, { row: 5, col: 1, hp: 1 }, { row: 5, col: 2, hp: 1 },
      // Right Bastion (6 hits)
      { row: 4, col: 5, hp: 2 }, { row: 4, col: 6, hp: 2 }, { row: 5, col: 5, hp: 1 }, { row: 5, col: 6, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 18, label: 'Bastion Layers' },
      { id: 'collect_yellow', type: 'collect_candy', candyType: 'yellow-hexagon', target: 22, label: 'Honeycomb Prisms' },
      { id: 'target_score', type: 'score', target: 3000, label: 'Target Score' },
    ],
    starThresholds: [3000, 4500, 6200],
    tips: 'Work from top to bottom so cascades continuously chip away at the lower bastions.',
  },

  // Level 20: Half-way challenge (10 moves, 3,200 score + 18 blockers + 24 green + 3 specials)
  {
    levelNumber: 20,
    name: 'Citadel Checkpoint',
    description: 'Checkpoint 2: Conquer 18 reinforced blockers and 4 goals in 10 moves.',
    difficultyTier: 'ADVANCED',
    moves: 10,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      // 6 reinforced (hp:2) + 6 standard (hp:1) = 18 blocker hits
      { row: 2, col: 2, hp: 2 }, { row: 2, col: 3, hp: 1 }, { row: 2, col: 4, hp: 1 }, { row: 2, col: 5, hp: 2 },
      { row: 5, col: 2, hp: 2 }, { row: 5, col: 3, hp: 1 }, { row: 5, col: 4, hp: 1 }, { row: 5, col: 5, hp: 2 },
      { row: 3, col: 2, hp: 1 }, { row: 4, col: 2, hp: 2 }, { row: 3, col: 5, hp: 1 }, { row: 4, col: 5, hp: 2 },
    ],
    objectives: [
      { id: 'target_score', type: 'score', target: 3200, label: 'Target Score' },
      { id: 'clear_blockers', type: 'clear_blockers', target: 18, label: 'Fortress Layers' },
      { id: 'collect_green', type: 'collect_candy', candyType: 'green-crystal', target: 24, label: 'Emeralds' },
      { id: 'create_specials', type: 'create_specials', target: 3, label: 'Special Candies' },
    ],
    starThresholds: [3200, 4800, 6600],
    tips: 'A Special+Special combo is almost essential to clear this half-way trial.',
  },

  // =========================================================================
  // TIER: VERY HARD (Levels 21–30)
  // =========================================================================

  // Level 21: High density blockers (10 moves, 20 blockers + 24 purple)
  {
    levelNumber: 21,
    name: 'Obsidian Ring',
    description: 'Destroy 20 obsidian blocker layers with only 10 moves.',
    difficultyTier: 'VERY HARD',
    moves: 10,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      // 8 reinforced (hp:2) + 4 standard (hp:1) = 20 hits
      { row: 2, col: 1, hp: 2 }, { row: 2, col: 2, hp: 2 }, { row: 2, col: 5, hp: 2 }, { row: 2, col: 6, hp: 2 },
      { row: 5, col: 1, hp: 2 }, { row: 5, col: 2, hp: 2 }, { row: 5, col: 5, hp: 2 }, { row: 5, col: 6, hp: 2 },
      { row: 3, col: 3, hp: 1 }, { row: 3, col: 4, hp: 1 }, { row: 4, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 20, label: 'Obsidian Layers' },
      { id: 'collect_purple', type: 'collect_candy', candyType: 'purple-candy', target: 24, label: 'Amethyst Candies' },
    ],
    starThresholds: [3300, 5000, 6800],
    tips: 'Combine a Bomb with a Line Blast to crack 8-12 blocker layers in one strike.',
  },

  // Level 22: Special mastery (10 moves, 5 specials + 3,500 score)
  {
    levelNumber: 22,
    name: 'Prismatic Forge',
    description: 'Forge and detonate 5 special candies while reaching 3,500 score.',
    difficultyTier: 'VERY HARD',
    moves: 10,
    allowedCandies: BASE_CANDIES_5,
    boardHoles: [
      { row: 0, col: 0 }, { row: 0, col: 7 },
      { row: 7, col: 0 }, { row: 7, col: 7 },
    ],
    blockers: [
      { row: 3, col: 1, hp: 1 }, { row: 4, col: 1, hp: 1 },
      { row: 3, col: 6, hp: 1 }, { row: 4, col: 6, hp: 1 },
      { row: 1, col: 3, hp: 1 }, { row: 1, col: 4, hp: 1 },
      { row: 6, col: 3, hp: 1 }, { row: 6, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'create_specials', type: 'create_specials', target: 5, label: 'Special Candies' },
      { id: 'target_score', type: 'score', target: 3500, label: 'Target Score' },
    ],
    starThresholds: [3500, 5200, 7000],
    tips: 'Target 5-in-a-row matches for rainbow Color Bombs.',
  },

  // Level 23: 9-move threshold (9 moves, 20 blockers + 24 red + 3,500 score)
  {
    levelNumber: 23,
    name: 'Crimson Vortex',
    description: 'Crush 20 blocker layers in just 9 moves without wasting a turn.',
    difficultyTier: 'VERY HARD',
    moves: 9,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      { row: 2, col: 2, hp: 2 }, { row: 2, col: 3, hp: 2 }, { row: 2, col: 4, hp: 2 }, { row: 2, col: 5, hp: 2 },
      { row: 5, col: 2, hp: 2 }, { row: 5, col: 3, hp: 2 }, { row: 5, col: 4, hp: 2 }, { row: 5, col: 5, hp: 2 },
      { row: 3, col: 2, hp: 1 }, { row: 4, col: 2, hp: 1 }, { row: 3, col: 5, hp: 1 }, { row: 4, col: 5, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 20, label: 'Vortex Blocks' },
      { id: 'collect_red', type: 'collect_candy', candyType: 'red-jelly', target: 24, label: 'Crimson Jellies' },
      { id: 'target_score', type: 'score', target: 3500, label: 'Target Score' },
    ],
    starThresholds: [3500, 5300, 7200],
    tips: 'Plan 2 moves ahead. A single idle swap will cost you the level.',
  },

  // Level 24: Restricted center (9 moves, 26 blue + 4 specials)
  {
    levelNumber: 24,
    name: 'Abyssal Ring',
    description: 'Harvest 26 sapphire gems around an inaccessible 2x2 abyss.',
    difficultyTier: 'VERY HARD',
    moves: 9,
    allowedCandies: BASE_CANDIES_5,
    boardHoles: [
      { row: 3, col: 3 }, { row: 3, col: 4 },
      { row: 4, col: 3 }, { row: 4, col: 4 },
    ],
    blockers: [
      { row: 2, col: 2, hp: 1 }, { row: 2, col: 5, hp: 1 },
      { row: 5, col: 2, hp: 1 }, { row: 5, col: 5, hp: 1 },
      { row: 2, col: 3, hp: 1 }, { row: 2, col: 4, hp: 1 },
      { row: 5, col: 3, hp: 1 }, { row: 5, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'collect_blue', type: 'collect_candy', candyType: 'blue-gem', target: 26, label: 'Sapphire Gems' },
      { id: 'create_specials', type: 'create_specials', target: 4, label: 'Special Candies' },
    ],
    starThresholds: [3600, 5400, 7400],
    tips: 'Vertical cascades down the outer wings provide the necessary blue matches.',
  },

  // Level 25: 22 blockers (9 moves, 22 blockers + 24 yellow + 4,000 score)
  {
    levelNumber: 25,
    name: 'Sunstone Fortress',
    description: 'Demolish 22 fortress blocker layers with 9 precision moves.',
    difficultyTier: 'VERY HARD',
    moves: 9,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      // 8 hp:2 + 6 hp:1 = 22 hits
      { row: 1, col: 2, hp: 2 }, { row: 1, col: 5, hp: 2 },
      { row: 2, col: 2, hp: 2 }, { row: 2, col: 5, hp: 2 },
      { row: 5, col: 2, hp: 2 }, { row: 5, col: 5, hp: 2 },
      { row: 6, col: 2, hp: 2 }, { row: 6, col: 5, hp: 2 },
      { row: 3, col: 1, hp: 1 }, { row: 4, col: 1, hp: 1 },
      { row: 3, col: 6, hp: 1 }, { row: 4, col: 6, hp: 1 },
      { row: 3, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 22, label: 'Fortress Layers' },
      { id: 'collect_yellow', type: 'collect_candy', candyType: 'yellow-hexagon', target: 24, label: 'Honeycomb Prisms' },
      { id: 'target_score', type: 'score', target: 4000, label: 'Target Score' },
    ],
    starThresholds: [4000, 5800, 7800],
    tips: 'Synthesize an Area Bomb in row 3 to crack both upper and lower fortress pillars.',
  },

  // Level 26: High-tier specials (9 moves, 5 specials + 18 blockers + 4,000 score)
  {
    levelNumber: 26,
    name: 'Plasma Battery',
    description: 'Charge and fire 5 specials while destroying 18 reinforced blocks.',
    difficultyTier: 'VERY HARD',
    moves: 9,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      // 6 hp:2 + 6 hp:1 = 18 hits
      { row: 2, col: 3, hp: 2 }, { row: 2, col: 4, hp: 2 },
      { row: 3, col: 2, hp: 2 }, { row: 3, col: 5, hp: 2 },
      { row: 4, col: 2, hp: 2 }, { row: 4, col: 5, hp: 2 },
      { row: 5, col: 3, hp: 1 }, { row: 5, col: 4, hp: 1 },
      { row: 1, col: 2, hp: 1 }, { row: 1, col: 5, hp: 1 },
      { row: 6, col: 2, hp: 1 }, { row: 6, col: 5, hp: 1 },
    ],
    objectives: [
      { id: 'create_specials', type: 'create_specials', target: 5, label: 'Special Candies' },
      { id: 'clear_blockers', type: 'clear_blockers', target: 18, label: 'Plasma Blocks' },
      { id: 'target_score', type: 'score', target: 4000, label: 'Target Score' },
    ],
    starThresholds: [4000, 5900, 8000],
    tips: 'Color Bomb combos fulfill both score and blocker requirements in one move.',
  },

  // Level 27: 8-move barrier (8 moves, 24 blockers + 26 green)
  {
    levelNumber: 27,
    name: 'Emerald Monolith',
    description: 'Shatter 24 monolith layers in just 8 moves through chain cascades.',
    difficultyTier: 'VERY HARD',
    moves: 8,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      // 10 hp:2 + 4 hp:1 = 24 hits
      { row: 2, col: 2, hp: 2 }, { row: 2, col: 3, hp: 2 }, { row: 2, col: 4, hp: 2 }, { row: 2, col: 5, hp: 2 },
      { row: 5, col: 2, hp: 2 }, { row: 5, col: 3, hp: 2 }, { row: 5, col: 4, hp: 2 }, { row: 5, col: 5, hp: 2 },
      { row: 3, col: 2, hp: 2 }, { row: 4, col: 5, hp: 2 },
      { row: 3, col: 5, hp: 1 }, { row: 4, col: 2, hp: 1 }, { row: 3, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 24, label: 'Monolith Layers' },
      { id: 'collect_green', type: 'collect_candy', candyType: 'green-crystal', target: 26, label: 'Emerald Crystals' },
    ],
    starThresholds: [4200, 6100, 8200],
    tips: 'Chain reactions are mandatory. Look for matches that trigger 3+ cascading falls.',
  },

  // Level 28: 8 moves, 4,500 score + 5 specials + 24 purple
  {
    levelNumber: 28,
    name: 'Amethyst Array',
    description: 'Score 4,500 and create 5 specials with only 8 moves remaining.',
    difficultyTier: 'VERY HARD',
    moves: 8,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      { row: 2, col: 3, hp: 1 }, { row: 2, col: 4, hp: 1 },
      { row: 3, col: 2, hp: 1 }, { row: 3, col: 5, hp: 1 },
      { row: 4, col: 2, hp: 1 }, { row: 4, col: 5, hp: 1 },
      { row: 5, col: 3, hp: 1 }, { row: 5, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'target_score', type: 'score', target: 4500, label: 'Target Score' },
      { id: 'create_specials', type: 'create_specials', target: 5, label: 'Special Candies' },
      { id: 'collect_purple', type: 'collect_candy', candyType: 'purple-candy', target: 24, label: 'Amethyst Candies' },
    ],
    starThresholds: [4500, 6400, 8500],
    tips: 'Match 5 to form a Color Bomb, then swap with a special for cosmic scores.',
  },

  // Level 29: 24 blockers + 28 orange + 4,500 score in 8 moves
  {
    levelNumber: 29,
    name: 'Infernal Core',
    description: 'Overcome 24 molten blocker layers and reach 4,500 score in 8 moves.',
    difficultyTier: 'VERY HARD',
    moves: 8,
    allowedCandies: ALL_CANDIES_6,
    blockers: [
      // 10 hp:2 + 4 hp:1 = 24 hits
      { row: 1, col: 2, hp: 2 }, { row: 1, col: 5, hp: 2 },
      { row: 2, col: 3, hp: 2 }, { row: 2, col: 4, hp: 2 },
      { row: 5, col: 3, hp: 2 }, { row: 5, col: 4, hp: 2 },
      { row: 6, col: 2, hp: 2 }, { row: 6, col: 5, hp: 2 },
      { row: 3, col: 1, hp: 2 }, { row: 4, col: 6, hp: 2 },
      { row: 3, col: 6, hp: 1 }, { row: 4, col: 1, hp: 1 }, { row: 3, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 24, label: 'Molten Layers' },
      { id: 'collect_orange', type: 'collect_candy', candyType: 'orange-sphere', target: 28, label: 'Amber Orbs' },
      { id: 'target_score', type: 'score', target: 4500, label: 'Target Score' },
    ],
    starThresholds: [4500, 6500, 8700],
    tips: 'With 6 candy colors active, special candy planning must be mathematically precise.',
  },

  // Level 30: Advanced checkpoint (8 moves, 26 blockers + 28 red + 5,000 score + 4 specials)
  {
    levelNumber: 30,
    name: 'Iron Citadel',
    description: 'Checkpoint 3: Sunder 26 citadel layers and score 5,000 in 8 moves.',
    difficultyTier: 'VERY HARD',
    moves: 8,
    allowedCandies: BASE_CANDIES_5,
    boardHoles: [
      { row: 0, col: 0 }, { row: 0, col: 7 },
      { row: 7, col: 0 }, { row: 7, col: 7 },
    ],
    blockers: [
      // 10 hp:2 + 6 hp:1 = 26 hits
      { row: 1, col: 3, hp: 2 }, { row: 1, col: 4, hp: 2 },
      { row: 2, col: 2, hp: 2 }, { row: 2, col: 5, hp: 2 },
      { row: 5, col: 2, hp: 2 }, { row: 5, col: 5, hp: 2 },
      { row: 6, col: 3, hp: 2 }, { row: 6, col: 4, hp: 2 },
      { row: 3, col: 1, hp: 2 }, { row: 4, col: 6, hp: 2 },
      { row: 3, col: 3, hp: 1 }, { row: 3, col: 4, hp: 1 },
      { row: 4, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
      { row: 3, col: 6, hp: 1 }, { row: 4, col: 1, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 26, label: 'Citadel Layers' },
      { id: 'collect_red', type: 'collect_candy', candyType: 'red-jelly', target: 28, label: 'Crimson Jellies' },
      { id: 'target_score', type: 'score', target: 5000, label: 'Target Score' },
      { id: 'create_specials', type: 'create_specials', target: 4, label: 'Special Candies' },
    ],
    starThresholds: [5000, 7000, 9200],
    tips: 'Focus on setting up a 5x5 area bomb combo or double line clear.',
  },

  // =========================================================================
  // TIER: EXPERT (Levels 31–35)
  // =========================================================================

  // Level 31: 8 moves, 26 blockers + 28 blue + 5,000 score
  {
    levelNumber: 31,
    name: 'Glacial Monolith',
    description: 'Shatter 26 frozen monolith layers in 8 moves under expert conditions.',
    difficultyTier: 'EXPERT',
    moves: 8,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      // 10 hp:2 + 6 hp:1 = 26 hits
      { row: 2, col: 2, hp: 2 }, { row: 2, col: 5, hp: 2 },
      { row: 3, col: 1, hp: 2 }, { row: 3, col: 6, hp: 2 },
      { row: 4, col: 1, hp: 2 }, { row: 4, col: 6, hp: 2 },
      { row: 5, col: 2, hp: 2 }, { row: 5, col: 5, hp: 2 },
      { row: 2, col: 3, hp: 2 }, { row: 2, col: 4, hp: 2 },
      { row: 5, col: 3, hp: 1 }, { row: 5, col: 4, hp: 1 },
      { row: 3, col: 3, hp: 1 }, { row: 3, col: 4, hp: 1 },
      { row: 4, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 26, label: 'Glacial Layers' },
      { id: 'collect_blue', type: 'collect_candy', candyType: 'blue-gem', target: 28, label: 'Sapphire Gems' },
      { id: 'target_score', type: 'score', target: 5000, label: 'Target Score' },
    ],
    starThresholds: [5000, 7100, 9400],
    tips: 'Use line blasts to slice through the vertical columns of reinforced ice.',
  },

  // Level 32: 8 moves, 6 specials + 20 blockers + 5,200 score
  {
    levelNumber: 32,
    name: 'Prismatic Supernova',
    description: 'Synthesize 6 special candies and crack 20 reinforced blocks in 8 moves.',
    difficultyTier: 'EXPERT',
    moves: 8,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      // 8 hp:2 + 4 hp:1 = 20 hits
      { row: 1, col: 3, hp: 2 }, { row: 1, col: 4, hp: 2 },
      { row: 6, col: 3, hp: 2 }, { row: 6, col: 4, hp: 2 },
      { row: 3, col: 1, hp: 2 }, { row: 4, col: 1, hp: 2 },
      { row: 3, col: 6, hp: 2 }, { row: 4, col: 6, hp: 2 },
      { row: 3, col: 3, hp: 1 }, { row: 3, col: 4, hp: 1 },
      { row: 4, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'create_specials', type: 'create_specials', target: 6, label: 'Special Candies' },
      { id: 'clear_blockers', type: 'clear_blockers', target: 20, label: 'Plasma Blocks' },
      { id: 'target_score', type: 'score', target: 5200, label: 'Target Score' },
    ],
    starThresholds: [5200, 7300, 9600],
    tips: 'Special candy taps count toward the quota. Detonate them promptly!',
  },

  // Level 33: 7 moves threshold (7 moves, 28 blockers + 30 yellow + 5,500 score)
  {
    levelNumber: 33,
    name: 'Golden Fortress',
    description: 'Demolish 28 fortress layers in just 7 moves. Absolute precision required.',
    difficultyTier: 'EXPERT',
    moves: 7,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      // 12 hp:2 + 4 hp:1 = 28 hits
      { row: 1, col: 2, hp: 2 }, { row: 1, col: 5, hp: 2 },
      { row: 2, col: 2, hp: 2 }, { row: 2, col: 5, hp: 2 },
      { row: 5, col: 2, hp: 2 }, { row: 5, col: 5, hp: 2 },
      { row: 6, col: 2, hp: 2 }, { row: 6, col: 5, hp: 2 },
      { row: 2, col: 3, hp: 2 }, { row: 2, col: 4, hp: 2 },
      { row: 5, col: 3, hp: 2 }, { row: 5, col: 4, hp: 2 },
      { row: 3, col: 3, hp: 1 }, { row: 3, col: 4, hp: 1 },
      { row: 4, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 28, label: 'Fortress Layers' },
      { id: 'collect_yellow', type: 'collect_candy', candyType: 'yellow-hexagon', target: 30, label: 'Honeycomb Prisms' },
      { id: 'target_score', type: 'score', target: 5500, label: 'Target Score' },
    ],
    starThresholds: [5500, 7600, 10000],
    tips: 'Every move must hit at least 3-4 blocker layers via cascading specials.',
  },

  // Level 34: 7 moves, 5 specials + 30 green + 24 blockers
  {
    levelNumber: 34,
    name: 'Emerald Reactor',
    description: 'Harvest 30 emeralds, forge 5 specials, and shatter 24 blocks in 7 moves.',
    difficultyTier: 'EXPERT',
    moves: 7,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      // 10 hp:2 + 4 hp:1 = 24 hits
      { row: 1, col: 1, hp: 2 }, { row: 1, col: 6, hp: 2 },
      { row: 6, col: 1, hp: 2 }, { row: 6, col: 6, hp: 2 },
      { row: 2, col: 3, hp: 2 }, { row: 2, col: 4, hp: 2 },
      { row: 5, col: 3, hp: 2 }, { row: 5, col: 4, hp: 2 },
      { row: 3, col: 2, hp: 2 }, { row: 4, col: 5, hp: 2 },
      { row: 3, col: 3, hp: 1 }, { row: 3, col: 4, hp: 1 },
      { row: 4, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'create_specials', type: 'create_specials', target: 5, label: 'Special Candies' },
      { id: 'collect_green', type: 'collect_candy', candyType: 'green-crystal', target: 30, label: 'Emerald Crystals' },
      { id: 'clear_blockers', type: 'clear_blockers', target: 24, label: 'Reactor Blocks' },
    ],
    starThresholds: [5600, 7800, 10200],
    tips: 'Form specials in the upper half to let new candies cascade into the lower blockers.',
  },

  // Level 35: Highly restricted board (7 moves, 6,000 score + 28 blockers + 30 purple)
  {
    levelNumber: 35,
    name: 'Void Fortress',
    description: 'Score 6,000, shatter 28 fortress layers, and harvest 30 amethysts in 7 moves.',
    difficultyTier: 'EXPERT',
    moves: 7,
    allowedCandies: BASE_CANDIES_5,
    boardHoles: [
      { row: 0, col: 3 }, { row: 0, col: 4 },
      { row: 7, col: 3 }, { row: 7, col: 4 },
      { row: 3, col: 0 }, { row: 4, col: 0 },
      { row: 3, col: 7 }, { row: 4, col: 7 },
    ],
    blockers: [
      // 12 hp:2 + 4 hp:1 = 28 hits
      { row: 1, col: 2, hp: 2 }, { row: 1, col: 5, hp: 2 },
      { row: 2, col: 2, hp: 2 }, { row: 2, col: 5, hp: 2 },
      { row: 5, col: 2, hp: 2 }, { row: 5, col: 5, hp: 2 },
      { row: 6, col: 2, hp: 2 }, { row: 6, col: 5, hp: 2 },
      { row: 3, col: 2, hp: 2 }, { row: 4, col: 2, hp: 2 },
      { row: 3, col: 5, hp: 2 }, { row: 4, col: 5, hp: 2 },
      { row: 3, col: 3, hp: 1 }, { row: 3, col: 4, hp: 1 },
      { row: 4, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'target_score', type: 'score', target: 6000, label: 'Target Score' },
      { id: 'clear_blockers', type: 'clear_blockers', target: 28, label: 'Void Layers' },
      { id: 'collect_purple', type: 'collect_candy', candyType: 'purple-candy', target: 30, label: 'Amethysts' },
    ],
    starThresholds: [6000, 8200, 10600],
    tips: 'Deliberate sequencing is critical. Clear central blockers first to unlock matches.',
  },

  // =========================================================================
  // TIER: EXPERT+ (Levels 36–39)
  // =========================================================================

  // Level 36: 7 moves, 6 specials + 26 blockers + 6,000 score
  {
    levelNumber: 36,
    name: 'Cosmic Crucible',
    description: 'Synthesize 6 specials, shatter 26 blocks, and achieve 6,000 score in 7 moves.',
    difficultyTier: 'EXPERT+',
    moves: 7,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      // 10 hp:2 + 6 hp:1 = 26 hits
      { row: 1, col: 3, hp: 2 }, { row: 1, col: 4, hp: 2 },
      { row: 2, col: 2, hp: 2 }, { row: 2, col: 5, hp: 2 },
      { row: 5, col: 2, hp: 2 }, { row: 5, col: 5, hp: 2 },
      { row: 6, col: 3, hp: 2 }, { row: 6, col: 4, hp: 2 },
      { row: 3, col: 1, hp: 2 }, { row: 4, col: 6, hp: 2 },
      { row: 3, col: 3, hp: 1 }, { row: 3, col: 4, hp: 1 },
      { row: 4, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
      { row: 3, col: 6, hp: 1 }, { row: 4, col: 1, hp: 1 },
    ],
    objectives: [
      { id: 'create_specials', type: 'create_specials', target: 6, label: 'Special Candies' },
      { id: 'clear_blockers', type: 'clear_blockers', target: 26, label: 'Crucible Blocks' },
      { id: 'target_score', type: 'score', target: 6000, label: 'Target Score' },
    ],
    starThresholds: [6000, 8300, 10800],
    tips: 'Look for double-special swaps to generate massive secondary explosions.',
  },

  // Level 37: 6 moves boundary (6 moves, 30 blockers + 32 red + 6,500 score)
  {
    levelNumber: 37,
    name: 'Crimson Apocalypse',
    description: 'Demolish 30 blocker layers in only 6 moves. Ultra-efficient matching required.',
    difficultyTier: 'EXPERT+',
    moves: 6,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      // 12 hp:2 + 6 hp:1 = 30 hits
      { row: 1, col: 2, hp: 2 }, { row: 1, col: 5, hp: 2 },
      { row: 2, col: 2, hp: 2 }, { row: 2, col: 5, hp: 2 },
      { row: 5, col: 2, hp: 2 }, { row: 5, col: 5, hp: 2 },
      { row: 6, col: 2, hp: 2 }, { row: 6, col: 5, hp: 2 },
      { row: 2, col: 3, hp: 2 }, { row: 2, col: 4, hp: 2 },
      { row: 5, col: 3, hp: 2 }, { row: 5, col: 4, hp: 2 },
      { row: 3, col: 1, hp: 1 }, { row: 4, col: 1, hp: 1 },
      { row: 3, col: 6, hp: 1 }, { row: 4, col: 6, hp: 1 },
      { row: 3, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 30, label: 'Apocalypse Blocks' },
      { id: 'collect_red', type: 'collect_candy', candyType: 'red-jelly', target: 32, label: 'Crimson Jellies' },
      { id: 'target_score', type: 'score', target: 6500, label: 'Target Score' },
    ],
    starThresholds: [6500, 8800, 11400],
    tips: 'A Color Bomb combined with a Line Clear or Bomb will clear half the board at once.',
  },

  // Level 38: 6 moves, 6 specials + 28 blockers + 30 blue
  {
    levelNumber: 38,
    name: 'Sapphire Singularity',
    description: 'Synthesize 6 specials, shatter 28 blocks, and harvest 30 sapphires in 6 moves.',
    difficultyTier: 'EXPERT+',
    moves: 6,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      // 12 hp:2 + 4 hp:1 = 28 hits
      { row: 1, col: 2, hp: 2 }, { row: 1, col: 5, hp: 2 },
      { row: 2, col: 1, hp: 2 }, { row: 2, col: 6, hp: 2 },
      { row: 5, col: 1, hp: 2 }, { row: 5, col: 6, hp: 2 },
      { row: 6, col: 2, hp: 2 }, { row: 6, col: 5, hp: 2 },
      { row: 3, col: 2, hp: 2 }, { row: 4, col: 2, hp: 2 },
      { row: 3, col: 5, hp: 2 }, { row: 4, col: 5, hp: 2 },
      { row: 3, col: 3, hp: 1 }, { row: 3, col: 4, hp: 1 },
      { row: 4, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'create_specials', type: 'create_specials', target: 6, label: 'Special Candies' },
      { id: 'clear_blockers', type: 'clear_blockers', target: 28, label: 'Singularity Blocks' },
      { id: 'collect_blue', type: 'collect_candy', candyType: 'blue-gem', target: 30, label: 'Sapphire Gems' },
    ],
    starThresholds: [6600, 9000, 11600],
    tips: 'Tap created specials directly to detonate them without needing an adjacent swap.',
  },

  // Level 39: Second hardest challenge (6 moves, 32 blockers + 34 yellow + 7,000 score + 4 specials)
  {
    levelNumber: 39,
    name: 'Penultimate Abyss',
    description: 'Sunder 32 blocker layers, forge 4 specials, and score 7,000 in 6 moves.',
    difficultyTier: 'EXPERT+',
    moves: 6,
    allowedCandies: BASE_CANDIES_5,
    blockers: [
      // 14 hp:2 + 4 hp:1 = 32 hits
      { row: 1, col: 2, hp: 2 }, { row: 1, col: 5, hp: 2 },
      { row: 2, col: 2, hp: 2 }, { row: 2, col: 5, hp: 2 },
      { row: 5, col: 2, hp: 2 }, { row: 5, col: 5, hp: 2 },
      { row: 6, col: 2, hp: 2 }, { row: 6, col: 5, hp: 2 },
      { row: 2, col: 3, hp: 2 }, { row: 2, col: 4, hp: 2 },
      { row: 5, col: 3, hp: 2 }, { row: 5, col: 4, hp: 2 },
      { row: 3, col: 1, hp: 2 }, { row: 4, col: 6, hp: 2 },
      { row: 3, col: 3, hp: 1 }, { row: 3, col: 4, hp: 1 },
      { row: 4, col: 3, hp: 1 }, { row: 4, col: 4, hp: 1 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 32, label: 'Abyssal Blocks' },
      { id: 'collect_yellow', type: 'collect_candy', candyType: 'yellow-hexagon', target: 34, label: 'Honeycomb Prisms' },
      { id: 'target_score', type: 'score', target: 7000, label: 'Target Score' },
      { id: 'create_specials', type: 'create_specials', target: 4, label: 'Special Candies' },
    ],
    starThresholds: [7000, 9500, 12200],
    tips: 'Only high-tier combos (Color Bomb + Bomb or Cross Laser) can achieve this in 6 moves.',
  },

  // =========================================================================
  // TIER: FINAL CHALLENGE (Level 40)
  // =========================================================================

  // Level 40: The Grand Finale (7 moves, 32 blockers + 34 purple + 7,500 score + 5 specials)
  {
    levelNumber: 40,
    name: 'Cosmic Singularity',
    description: 'THE FINAL EXPERT LEVEL: Sunder 32 fortress layers, synthesize 5 specials, and attain 7,500 score.',
    difficultyTier: 'FINAL CHALLENGE',
    moves: 7,
    allowedCandies: BASE_CANDIES_5,
    boardHoles: [
      { row: 0, col: 0 }, { row: 0, col: 7 },
      { row: 7, col: 0 }, { row: 7, col: 7 },
    ],
    blockers: [
      // Exactly 16 double-reinforced 2-HP fortress blockers = 32 blocker hits total!
      // Positioned in 4 symmetrical bastion clusters of 4 blocks each:
      // Top-Left Bastion (8 hits)
      { row: 1, col: 2, hp: 2 }, { row: 2, col: 1, hp: 2 }, { row: 2, col: 2, hp: 2 }, { row: 2, col: 3, hp: 2 },
      // Top-Right Bastion (8 hits)
      { row: 1, col: 5, hp: 2 }, { row: 2, col: 6, hp: 2 }, { row: 2, col: 5, hp: 2 }, { row: 2, col: 4, hp: 2 },
      // Bottom-Left Bastion (8 hits)
      { row: 6, col: 2, hp: 2 }, { row: 5, col: 1, hp: 2 }, { row: 5, col: 2, hp: 2 }, { row: 5, col: 3, hp: 2 },
      // Bottom-Right Bastion (8 hits)
      { row: 6, col: 5, hp: 2 }, { row: 5, col: 6, hp: 2 }, { row: 5, col: 5, hp: 2 }, { row: 5, col: 4, hp: 2 },
    ],
    objectives: [
      { id: 'clear_blockers', type: 'clear_blockers', target: 32, label: 'Singularity Blocks' },
      { id: 'collect_purple', type: 'collect_candy', candyType: 'purple-candy', target: 34, label: 'Cosmic Candies' },
      { id: 'target_score', type: 'score', target: 7500, label: 'Target Score' },
      { id: 'create_specials', type: 'create_specials', target: 5, label: 'Special Candies' },
    ],
    starThresholds: [7500, 10000, 13000],
    tips: 'The ultimate test of Candy Blast mastery. Forge special combos and trigger cosmic board wipes!',
  },
];

/**
 * Retrieves level configuration by 1-based level number
 */
export function getLevelConfig(levelNum: number): LevelConfig {
  const clamped = Math.max(1, Math.min(40, levelNum));
  return CANDY_LEVELS[clamped - 1] || CANDY_LEVELS[0];
}
