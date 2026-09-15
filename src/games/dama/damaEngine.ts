/**
 * DAMA - Core Draughts / Checkers Rule Engine
 * Deterministic, complete, strictly enforcing standard draughts rules:
 * - 8x8 board, 32 playable dark squares
 * - Diagonal forward movement for standard pieces
 * - Mandatory captures: when any capture is possible, only captures are legal
 * - Multiple chain captures recursively explored
 * - King promotion upon reaching opponent's back rank
 * - 4-directional diagonal movement and capture for Kings
 */

import { Piece, PieceColor, BoardState, DamaMove, MoveStep } from './types';

export const BOARD_SIZE = 8;

/**
 * Validates if square is within bounds
 */
export function isWithinBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/**
 * Validates if a square is a playable dark square
 */
export function isPlayableSquare(row: number, col: number): boolean {
  return isWithinBoard(row, col) && (row + col) % 2 === 1;
}

/**
 * Deep clones the 8x8 board state
 */
export function cloneBoard(board: BoardState): BoardState {
  return board.map((row) =>
    row.map((cell) => (cell ? { ...cell } : null))
  );
}

/**
 * Creates the standard initial 8x8 Draughts board
 * Rows 0, 1, 2: Black pieces (Computer) on dark squares (12 pieces)
 * Rows 3, 4: Empty
 * Rows 5, 6, 7: White pieces (Player) on dark squares (12 pieces)
 */
export function createInitialBoard(): BoardState {
  const board: BoardState = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  let pieceIndex = 1;

  // Computer (Black) on top 3 rows
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isPlayableSquare(r, c)) {
        board[r][c] = {
          id: `b_${pieceIndex++}`,
          color: 'black',
          isKing: false,
          row: r,
          col: c,
        };
      }
    }
  }

  // Player (White) on bottom 3 rows
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isPlayableSquare(r, c)) {
        board[r][c] = {
          id: `w_${pieceIndex++}`,
          color: 'white',
          isKing: false,
          row: r,
          col: c,
        };
      }
    }
  }

  return board;
}

/**
 * Finds all single-step non-capture diagonal moves for a piece
 */
export function getSimpleMovesForPiece(board: BoardState, piece: Piece): DamaMove[] {
  const moves: DamaMove[] = [];
  const { row, col, color, isKing } = piece;

  // Directions: White moves row - 1 (up), Black moves row + 1 (down), Kings move both
  const forwardDir = color === 'white' ? -1 : 1;
  const rowDirs = isKing ? [-1, 1] : [forwardDir];
  const colDirs = [-1, 1];

  for (const dr of rowDirs) {
    for (const dc of colDirs) {
      const nr = row + dr;
      const nc = col + dc;

      if (isWithinBoard(nr, nc) && board[nr][nc] === null) {
        const promotes = !isKing && (color === 'white' ? nr === 0 : nr === 7);
        moves.push({
          fromRow: row,
          fromCol: col,
          toRow: nr,
          toCol: nc,
          isCapture: false,
          path: [{ fromRow: row, fromCol: col, toRow: nr, toCol: nc }],
          capturedPieces: [],
          promotesToKing: promotes,
        });
      }
    }
  }

  return moves;
}

/**
 * Recursively discovers all capture chains (single and multiple jumps) for a piece
 */
export function getCaptureChainsForPiece(
  board: BoardState,
  currentPiece: Piece,
  startRow: number,
  startCol: number,
  currentPath: MoveStep[],
  capturedList: { row: number; col: number; pieceId: string }[]
): DamaMove[] {
  const chains: DamaMove[] = [];
  const { color, isKing } = currentPiece;

  // Jump directions:
  // Kings can jump in all 4 diagonal directions.
  // Standard men jump forward (and optionally backward in international).
  // In standard draughts tournament rules, kings jump all 4 diagonal directions,
  // and normal pieces jump forward (and backward for captures in standard Dama).
  // Allowing 4-way capture for all pieces on capture is the official Dama standard!
  // Normal pieces move forward only, but can capture in all 4 diagonal directions.
  const rowDirs = [-1, 1];
  const colDirs = [-1, 1];

  let foundJump = false;

  for (const dr of rowDirs) {
    for (const dc of colDirs) {
      // Normal piece without king status cannot jump backward in American checkers,
      // but in Dama (International & African standard) capture is allowed in both directions!
      // If we restrict men to forward jumps only, check:
      const jumpRow = currentPiece.row + dr;
      const jumpCol = currentPiece.col + dc;
      const landRow = currentPiece.row + dr * 2;
      const landCol = currentPiece.col + dc * 2;

      // Check boundaries
      if (!isWithinBoard(jumpRow, jumpCol) || !isWithinBoard(landRow, landCol)) {
        continue;
      }

      const midPiece = board[jumpRow][jumpCol];
      const landSquare = board[landRow][landCol];

      // Must jump over an opposing piece into an empty square
      if (midPiece !== null && midPiece.color !== color && landSquare === null) {
        // Prevent capturing the same piece twice in a single chain
        if (capturedList.some((c) => c.row === jumpRow && c.col === jumpCol)) {
          continue;
        }

        foundJump = true;

        // Simulate jumping
        const nextBoard = cloneBoard(board);
        nextBoard[currentPiece.row][currentPiece.col] = null;
        nextBoard[jumpRow][jumpCol] = null; // Temporarily remove captured

        const willPromote = !isKing && (color === 'white' ? landRow === 0 : landRow === 7);
        const movedPiece: Piece = {
          ...currentPiece,
          row: landRow,
          col: landCol,
          isKing: isKing || willPromote,
        };
        nextBoard[landRow][landCol] = movedPiece;

        const nextStep: MoveStep = {
          fromRow: currentPiece.row,
          fromCol: currentPiece.col,
          toRow: landRow,
          toCol: landCol,
          capturedRow: jumpRow,
          capturedCol: jumpCol,
        };

        const nextCapturedList = [
          ...capturedList,
          { row: jumpRow, col: jumpCol, pieceId: midPiece.id },
        ];

        // If promoted mid-jump, the jump chain completes here according to standard rules
        if (willPromote) {
          chains.push({
            fromRow: startRow,
            fromCol: startCol,
            toRow: landRow,
            toCol: landCol,
            isCapture: true,
            path: [...currentPath, nextStep],
            capturedPieces: nextCapturedList,
            promotesToKing: true,
          });
        } else {
          // Check for subsequent jumps from the landing square
          const subChains = getCaptureChainsForPiece(
            nextBoard,
            movedPiece,
            startRow,
            startCol,
            [...currentPath, nextStep],
            nextCapturedList
          );

          if (subChains.length > 0) {
            chains.push(...subChains);
          } else {
            // Leaf jump reached
            chains.push({
              fromRow: startRow,
              fromCol: startCol,
              toRow: landRow,
              toCol: landCol,
              isCapture: true,
              path: [...currentPath, nextStep],
              capturedPieces: nextCapturedList,
              promotesToKing: isKing,
            });
          }
        }
      }
    }
  }

  // If no jump was found from this position and we already completed at least 1 jump
  if (!foundJump && currentPath.length > 0) {
    chains.push({
      fromRow: startRow,
      fromCol: startCol,
      toRow: currentPiece.row,
      toCol: currentPiece.col,
      isCapture: true,
      path: currentPath,
      capturedPieces: capturedList,
      promotesToKing: isKing,
    });
  }

  return chains;
}

/**
 * Returns all legal moves for a specific piece, respecting mandatory captures
 */
export function getLegalMovesForPiece(board: BoardState, row: number, col: number): DamaMove[] {
  const piece = board[row][col];
  if (!piece) return [];

  // 1. Check if ANY piece of this color has a capture move
  const allCaptures = getAllCaptures(board, piece.color);

  if (allCaptures.length > 0) {
    // Mandatory capture rule: return only capture moves for this piece
    return allCaptures.filter((m) => m.fromRow === row && m.fromCol === col);
  }

  // No captures exist anywhere for this color: return simple non-capture moves
  return getSimpleMovesForPiece(board, piece);
}

/**
 * Gets all capture moves available for a given color
 */
export function getAllCaptures(board: BoardState, color: PieceColor): DamaMove[] {
  const captures: DamaMove[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const pieceCaptures = getCaptureChainsForPiece(board, piece, r, c, [], []);
        captures.push(...pieceCaptures);
      }
    }
  }

  return captures;
}

/**
 * Gets all legal moves for the active player, strictly enforcing mandatory captures
 */
export function getAllLegalMoves(board: BoardState, color: PieceColor): DamaMove[] {
  // 1. Check mandatory captures
  const captures = getAllCaptures(board, color);
  if (captures.length > 0) {
    return captures;
  }

  // 2. If no captures, gather simple moves
  const simpleMoves: DamaMove[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        simpleMoves.push(...getSimpleMovesForPiece(board, piece));
      }
    }
  }

  return simpleMoves;
}

/**
 * Executes a DamaMove on the board, producing a new board state and returning captured piece IDs
 */
export function applyDamaMove(
  board: BoardState,
  move: DamaMove
): { newBoard: BoardState; newlyPromoted: boolean } {
  const newBoard = cloneBoard(board);
  const sourcePiece = newBoard[move.fromRow][move.fromCol];

  if (!sourcePiece) {
    throw new Error(`Invalid move: no piece at (${move.fromRow}, ${move.fromCol})`);
  }

  // Remove captured pieces from board
  for (const cap of move.capturedPieces) {
    newBoard[cap.row][cap.col] = null;
  }

  // Move source piece to final destination
  newBoard[move.fromRow][move.fromCol] = null;

  const becomesKing = sourcePiece.isKing || move.promotesToKing;
  const landedPiece: Piece = {
    ...sourcePiece,
    row: move.toRow,
    col: move.toCol,
    isKing: becomesKing,
  };

  newBoard[move.toRow][move.toCol] = landedPiece;

  return {
    newBoard,
    newlyPromoted: !sourcePiece.isKing && becomesKing,
  };
}

/**
 * Counts piece totals for both sides
 */
export function countPieces(board: BoardState): {
  whiteCount: number;
  blackCount: number;
  whiteKings: number;
  blackKings: number;
} {
  let whiteCount = 0;
  let blackCount = 0;
  let whiteKings = 0;
  let blackKings = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p) {
        if (p.color === 'white') {
          whiteCount++;
          if (p.isKing) whiteKings++;
        } else {
          blackCount++;
          if (p.isKing) blackKings++;
        }
      }
    }
  }

  return { whiteCount, blackCount, whiteKings, blackKings };
}

/**
 * Evaluates game status: checks if active player has moves or if piece counts are 0
 */
export function evaluateGameOutcome(
  board: BoardState,
  nextTurnColor: PieceColor,
  consecutiveNonCaptureMoves: number = 0
): { isOver: boolean; winner: PieceColor | 'draw' | null; reason: string } {
  const { whiteCount, blackCount } = countPieces(board);

  if (whiteCount === 0) {
    return { isOver: true, winner: 'black', reason: 'Computer captured all player pieces' };
  }

  if (blackCount === 0) {
    return { isOver: true, winner: 'white', reason: 'Player captured all computer pieces' };
  }

  // Draw rule: 40 consecutive moves without captures
  if (consecutiveNonCaptureMoves >= 40) {
    return { isOver: true, winner: 'draw', reason: 'Draw: 40 moves without capture' };
  }

  const legalMoves = getAllLegalMoves(board, nextTurnColor);
  if (legalMoves.length === 0) {
    // Player with no moves loses
    const winner: PieceColor = nextTurnColor === 'white' ? 'black' : 'white';
    const reason = nextTurnColor === 'white'
      ? 'Player has no legal moves remaining'
      : 'Computer has no legal moves remaining';
    return { isOver: true, winner, reason };
  }

  return { isOver: false, winner: null, reason: '' };
}
