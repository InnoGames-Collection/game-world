/**
 * DAMA - Intelligent 30-Level Computer AI Opponent
 * Implements Minimax with Alpha-Beta Pruning, Quiescence Search for Captures,
 * Positional Board Weighting, Center Control, and King Promotion Priority.
 *
 * Difficulty tiers:
 * - Level 1-3: Hard immediately (Search Depth 3, tactical captures, center control)
 * - Level 4-7: Very Hard (Depth 4 + capture extension, king promotion priority)
 * - Level 8-12: Expert (Depth 4-5 + back-row defense and trap detection)
 * - Level 13-17: Advanced Expert (Depth 5 + piece coordination)
 * - Level 18-22: Extreme (Depth 5-6 + tactical quiescence)
 * - Level 23-26: Master (Depth 6 + endgame mastery)
 * - Level 27-29: Near-Maximum Challenge (Depth 6-7 + aggressive positional pressure)
 * - Level 30: Ultimate Computer Opponent (Depth 7 + full quiescence search)
 */

import { BoardState, DamaMove, LevelDifficultyConfig, PieceColor } from './types';
import {
  getAllLegalMoves,
  applyDamaMove,
  isPlayableSquare,
  BOARD_SIZE,
} from './damaEngine';

/**
 * Generates the 30 progressive level configurations matching user specification:
 * - Levels 1–5: Beginner AI (simple legal moves, limited strategic planning, approachable)
 * - Levels 6–10: Easy/Intermediate (better capture selection, basic defense)
 * - Levels 11–15: Intermediate (better board evaluation, center control, king promotion)
 * - Levels 16–20: Advanced (deeper move evaluation, strong defense, avoids traps)
 * - Levels 21–25: Expert (deeper search, multi-step tactics, strong positioning)
 * - Levels 26–30: Very Difficult / Grandmaster (deepest search, optimal tactical decisions)
 */
/**
 * Generates the exactly 40 progressive level configurations matching user specification:
 * - LEVEL 1–5: HARD (Strong computer opponent, search depth 3, capture pressure, back-rank defense)
 * - LEVEL 6–10: VERY HARD (Search depth 4, center control, king promotion, quiescence search)
 * - LEVEL 11–20: EXPERT (Search depth 4–5, multi-capture planning, trap detection)
 * - LEVEL 21–30: EXPERT+ (Search depth 5, strategic endgame positioning, piece coordination)
 * - LEVEL 31–39: EXTREME (Search depth 5–6, intense king hunting, positional asphyxiation)
 * - LEVEL 40: MASTER (Search depth 6, flawless tactical calculation, supreme master)
 */
export function generate40LevelConfigs(): LevelDifficultyConfig[] {
  const configs: LevelDifficultyConfig[] = [];

  for (let lvl = 1; lvl <= 40; lvl++) {
    let depth = 3;
    let quiescence = 1;
    let posWeight = 1.2;
    let centerWeight = 1.3;
    let kingWeight = 1.8;
    let defWeight = 1.3;
    let randomness = 0.04;
    let tier: LevelDifficultyConfig['tier'] = 'Hard';
    let name = 'Veteran Tactician';

    if (lvl <= 5) {
      // LEVEL 1–5: HARD (Already competitive tournament introduction)
      tier = 'Hard';
      depth = 3;
      quiescence = 1;
      posWeight = 1.1 + (lvl - 1) * 0.08;
      centerWeight = 1.2 + (lvl - 1) * 0.08;
      kingWeight = 1.8;
      defWeight = 1.2 + (lvl - 1) * 0.05;
      randomness = Math.max(0.015, 0.04 - (lvl - 1) * 0.006);
      const names = [
        'Highland Guardian',
        'Addis Tactician',
        'Plateau Vanguard',
        'Rift Challenger',
        'Abyssinian Knight',
      ];
      name = names[lvl - 1] || `Hard Challenger ${lvl}`;
    } else if (lvl <= 10) {
      // LEVEL 6–10: VERY HARD
      tier = 'Very Hard';
      depth = 4;
      quiescence = 1;
      posWeight = 1.5 + (lvl - 6) * 0.08;
      centerWeight = 1.6 + (lvl - 6) * 0.08;
      kingWeight = 2.0;
      defWeight = 1.5 + (lvl - 6) * 0.05;
      randomness = Math.max(0.005, 0.015 - (lvl - 6) * 0.002);
      const names = [
        'Imperial Strategist',
        'Simien Stalker',
        'Axum Centurion',
        'Sheba Defender',
        'Walia Champion',
      ];
      name = names[lvl - 6] || `Very Hard ${lvl}`;
    } else if (lvl <= 20) {
      // LEVEL 11–20: EXPERT
      tier = 'Expert';
      depth = lvl <= 15 ? 4 : 5;
      quiescence = 2;
      posWeight = 1.9 + (lvl - 11) * 0.04;
      centerWeight = 2.0 + (lvl - 11) * 0.04;
      kingWeight = 2.2;
      defWeight = 1.8 + (lvl - 11) * 0.03;
      randomness = Math.max(0.001, 0.008 - (lvl - 11) * 0.0007);
      const names = [
        'Gondar Warlord',
        'Lalibela Virtuoso',
        'Blue Nile Commander',
        'Bale Mountain Warden',
        'Danakil Sentinel',
        'Harar Gatekeeper',
        'Omo Valley Master',
        'Entoto Sovereign',
        'Fasiledes Marshal',
        'Zobel Strategist',
      ];
      name = names[lvl - 11] || `Expert ${lvl}`;
    } else if (lvl <= 30) {
      // LEVEL 21–30: EXPERT+
      tier = 'Expert+';
      depth = 5;
      quiescence = 2;
      posWeight = 2.3 + (lvl - 21) * 0.03;
      centerWeight = 2.4 + (lvl - 21) * 0.03;
      kingWeight = 2.4;
      defWeight = 2.1 + (lvl - 21) * 0.02;
      randomness = 0.001;
      const names = [
        'Tana Archipelago King',
        'Menelik General',
        'Ras Dashen Colossus',
        'Tewodros Fortress',
        'Yohannes Dominator',
        'Eleni Crownmaster',
        'Ezana Iron Duke',
        'Kaleb conqueror',
        'Zara Yaqob Arbiter',
        'Grand Inquisitor',
      ];
      name = names[lvl - 21] || `Expert+ ${lvl}`;
    } else if (lvl <= 39) {
      // LEVEL 31–39: EXTREME
      tier = 'Extreme';
      depth = lvl <= 35 ? 5 : 6;
      quiescence = 3;
      posWeight = 2.6 + (lvl - 31) * 0.03;
      centerWeight = 2.7 + (lvl - 31) * 0.03;
      kingWeight = 2.6;
      defWeight = 2.3 + (lvl - 31) * 0.02;
      randomness = 0.0;
      const names = [
        'Obsidian Sovereign',
        'Shadow Archon',
        'Crimson Overlord',
        'Titan of Aksum',
        'Grand Chancellor',
        'Apex Apexian',
        'Abyssal Emperor',
        'Eclipse Commander',
        'Vanguard of Kings',
      ];
      name = names[lvl - 31] || `Extreme ${lvl}`;
    } else {
      // LEVEL 40: MASTER
      tier = 'Master';
      depth = 6;
      quiescence = 3;
      posWeight = 3.0;
      centerWeight = 3.0;
      kingWeight = 2.8;
      defWeight = 2.6;
      randomness = 0.0;
      name = 'Supreme Dama Grandmaster';
    }

    configs.push({
      level: lvl,
      name,
      tier,
      searchDepth: depth,
      quiescenceDepth: quiescence,
      positionalWeight: posWeight,
      centerWeight,
      kingWeight,
      defenseWeight: defWeight,
      randomnessFactor: randomness,
      description: `Tournament Tier: ${tier} (Engine Depth ${depth})`,
    });
  }

  return configs;
}

export const DAMA_40_LEVEL_CONFIGS = generate40LevelConfigs();
export const DAMA_30_LEVEL_CONFIGS = DAMA_40_LEVEL_CONFIGS.slice(0, 30); // Backwards compatibility alias

export function getLevelConfig(level: number): LevelDifficultyConfig {
  const safeLvl = Math.max(1, Math.min(40, Math.floor(level)));
  return DAMA_40_LEVEL_CONFIGS[safeLvl - 1];
}

// Center board bonus grid for 8x8 playable squares
const CENTER_BONUS: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 0, 3, 0, 3, 0, 2],
  [0, 0, 4, 0, 5, 0, 4, 0],
  [0, 4, 0, 7, 0, 7, 0, 4],
  [0, 0, 7, 0, 7, 0, 4, 0],
  [0, 4, 0, 5, 0, 4, 0, 0],
  [0, 0, 3, 0, 3, 0, 2, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

/**
 * Heuristic Board Evaluation from perspective of Black (Computer)
 * Positive values favor Computer (Black), Negative favor Player (White)
 */
export function evaluateBoard(board: BoardState, config: LevelDifficultyConfig): number {
  let score = 0;
  let blackPieces = 0;
  let whitePieces = 0;

  const MAN_VALUE = 100;
  const KING_VALUE = Math.round(100 * config.kingWeight);

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!isPlayableSquare(r, c)) continue;
      const p = board[r][c];
      if (!p) continue;

      const isBlack = p.color === 'black';
      const pieceVal = p.isKing ? KING_VALUE : MAN_VALUE;
      const center = CENTER_BONUS[r][c] * config.centerWeight;

      if (isBlack) {
        blackPieces++;
        score += pieceVal;
        score += center;

        if (!p.isKing) {
          // Advancement bonus: Black moves downward (r = 0 to 7)
          score += r * 4 * config.positionalWeight;

          // Back rank defense bonus: keeping row 0 pieces prevents opponent from becoming kings
          if (r === 0) {
            score += 15 * config.defenseWeight;
          }
        }
      } else {
        whitePieces++;
        score -= pieceVal;
        score -= center;

        if (!p.isKing) {
          // Advancement bonus: White moves upward (r = 7 to 0)
          score -= (7 - r) * 4 * config.positionalWeight;

          // Back rank defense bonus for player
          if (r === 7) {
            score -= 15 * config.defenseWeight;
          }
        }
      }
    }
  }

  // Large bonus for wiping out player
  if (whitePieces === 0) return 999999;
  if (blackPieces === 0) return -999999;

  return score;
}

class SearchTimeoutError extends Error {
  constructor() {
    super('SearchTimeout');
    this.name = 'SearchTimeoutError';
  }
}

// Maximum calculation time allowed for the computer AI (500ms max ensures zero stutter)
const MAX_AI_COMPUTE_TIME_MS = 500;

interface SearchContext {
  startTime: number;
  timeLimitMs: number;
  nodeCount: number;
}

function checkTimeLimit(ctx: SearchContext): void {
  ctx.nodeCount++;
  // Check every 32 nodes for performance efficiency
  if ((ctx.nodeCount & 31) === 0) {
    if (performance.now() - ctx.startTime >= ctx.timeLimitMs) {
      throw new SearchTimeoutError();
    }
  }
}

/**
 * Quiescence Search: Continues searching capture sequences to avoid the horizon effect
 */
function quiescence(
  board: BoardState,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  depthLeft: number,
  config: LevelDifficultyConfig,
  ctx: SearchContext
): number {
  checkTimeLimit(ctx);
  const standPat = evaluateBoard(board, config);

  if (depthLeft <= 0) {
    return standPat;
  }

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;

    const captureMoves = getAllLegalMoves(board, 'black').filter((m) => m.isCapture);
    if (captureMoves.length === 0) {
      return standPat;
    }

    for (const move of captureMoves) {
      const { newBoard } = applyDamaMove(board, move);
      const val = quiescence(newBoard, alpha, beta, false, depthLeft - 1, config, ctx);
      if (val >= beta) return beta;
      if (val > alpha) alpha = val;
    }
    return alpha;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;

    const captureMoves = getAllLegalMoves(board, 'white').filter((m) => m.isCapture);
    if (captureMoves.length === 0) {
      return standPat;
    }

    for (const move of captureMoves) {
      const { newBoard } = applyDamaMove(board, move);
      const val = quiescence(newBoard, alpha, beta, true, depthLeft - 1, config, ctx);
      if (val <= alpha) return alpha;
      if (val < beta) beta = val;
    }
    return beta;
  }
}

/**
 * Minimax with Alpha-Beta Pruning, node counting, and deadline checking
 */
function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  config: LevelDifficultyConfig,
  ctx: SearchContext
): number {
  checkTimeLimit(ctx);

  const currentTurn: PieceColor = isMaximizing ? 'black' : 'white';
  const legalMoves = getAllLegalMoves(board, currentTurn);

  // Terminal state: No moves available
  if (legalMoves.length === 0) {
    return isMaximizing ? -500000 + (10 - depth) : 500000 - (10 - depth);
  }

  // Leaf node reached: perform Quiescence search on captures
  if (depth <= 0) {
    if (config.quiescenceDepth > 0) {
      return quiescence(board, alpha, beta, isMaximizing, config.quiescenceDepth, config, ctx);
    }
    return evaluateBoard(board, config);
  }

  // Move ordering: Captures first, then king promotions, then center moves
  legalMoves.sort((a, b) => {
    if (a.isCapture && !b.isCapture) return -1;
    if (!a.isCapture && b.isCapture) return 1;
    if (a.promotesToKing && !b.promotesToKing) return -1;
    if (!a.promotesToKing && b.promotesToKing) return 1;
    return 0;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      const { newBoard } = applyDamaMove(board, move);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, config, ctx);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      const { newBoard } = applyDamaMove(board, move);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, config, ctx);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

/**
 * Validates that a proposed move is strictly legal and valid on the current board
 */
export function isStrictlyLegalMove(board: BoardState, move: DamaMove | null): boolean {
  if (!move) return false;

  // 1. Source square must contain a computer (black) piece
  const sourcePiece = board[move.fromRow]?.[move.fromCol];
  if (!sourcePiece || sourcePiece.color !== 'black') {
    return false;
  }

  // 2. All legal moves for black on current board
  const allLegal = getAllLegalMoves(board, 'black');
  return allLegal.some(
    (m) =>
      m.fromRow === move.fromRow &&
      m.fromCol === move.fromCol &&
      m.toRow === move.toRow &&
      m.toCol === move.toCol
  );
}

/**
 * Computes the optimal computer move for a given board and level configuration.
 * Strictly bounded by MAX_AI_COMPUTE_TIME_MS, using Iterative Deepening.
 * Guaranteed to never freeze, never return invalid moves, and always advance state.
 */
export async function computeBestComputerMove(
  board: BoardState,
  level: number
): Promise<DamaMove | null> {
  const config = getLevelConfig(level);
  const legalMoves = getAllLegalMoves(board, 'black');

  // No legal moves: computer loses immediately
  if (legalMoves.length === 0) return null;

  // Single legal move: return immediately without expensive search
  if (legalMoves.length === 1) return legalMoves[0];

  // Prioritize captures and king promotions in root ordering
  const sortedRootMoves = [...legalMoves].sort((a, b) => {
    if (a.isCapture && !b.isCapture) return -1;
    if (!a.isCapture && b.isCapture) return 1;
    if (a.promotesToKing && !b.promotesToKing) return -1;
    if (!a.promotesToKing && b.promotesToKing) return 1;
    return 0;
  });

  // Default fallback move is the first prioritized legal move
  let bestMoveOverall: DamaMove = sortedRootMoves[0];

  // Brief yield to UI thread to keep animations and state completely smooth
  await new Promise((resolve) => setTimeout(resolve, 16));

  const ctx: SearchContext = {
    startTime: performance.now(),
    timeLimitMs: MAX_AI_COMPUTE_TIME_MS,
    nodeCount: 0,
  };

  try {
    // Iterative Deepening from depth 1 to config.searchDepth
    for (let currentDepth = 1; currentDepth <= config.searchDepth; currentDepth++) {
      // Check remaining time budget before starting deeper iteration
      if (performance.now() - ctx.startTime >= ctx.timeLimitMs) {
        break;
      }

      const scoredMoves: { move: DamaMove; score: number }[] = [];
      let alpha = -Infinity;
      const beta = Infinity;

      for (const move of sortedRootMoves) {
        checkTimeLimit(ctx);
        const { newBoard } = applyDamaMove(board, move);
        const score = minimax(newBoard, currentDepth - 1, alpha, beta, false, config, ctx);
        scoredMoves.push({ move, score });

        if (score > alpha) {
          alpha = score;
        }
      }

      // Sort descending by score
      scoredMoves.sort((a, b) => b.score - a.score);

      if (scoredMoves.length > 0) {
        const bestScore = scoredMoves[0].score;
        const margin = Math.max(2, Math.abs(bestScore) * 0.02);
        const topCandidates = scoredMoves.filter((sm) => sm.score >= bestScore - margin);

        // Apply controlled opening randomness if configured
        if (config.randomnessFactor > 0 && topCandidates.length > 1) {
          if (Math.random() < config.randomnessFactor) {
            const randIdx = Math.floor(Math.random() * Math.min(topCandidates.length, 3));
            bestMoveOverall = topCandidates[randIdx].move;
          } else {
            bestMoveOverall = topCandidates[0].move;
          }
        } else {
          bestMoveOverall = topCandidates[0].move;
        }
      }
    }
  } catch (err) {
    if (err instanceof SearchTimeoutError) {
      // Graceful timeout: use best move found from the deepest completed iteration
    } else {
      console.warn('AI search encountered error, using fallback legal move:', err);
    }
  }

  // Final verification: ensure selected move is strictly legal on current board
  if (isStrictlyLegalMove(board, bestMoveOverall)) {
    return bestMoveOverall;
  }

  // Emergency fallback to guaranteed legal move from fresh evaluation
  const fallbackLegal = getAllLegalMoves(board, 'black');
  if (fallbackLegal.length > 0) {
    return fallbackLegal[0];
  }

  return null;
}
