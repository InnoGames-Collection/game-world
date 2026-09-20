/**
 * Master Puzzle Block Game Component
 * Features 10x10 authentic wooden board, 40-level progression, 3-piece tray,
 * professional pre-game menu, real drag & drop with touch offset and anchor precision,
 * multi-line combos, and procedural Web Audio.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GridCell,
  PolyominoShape,
  TrayPiece,
  LevelDefinition,
  PuzzleBlockSaveData,
  PuzzleBlockView,
} from './types';
import { PUZZLE_BLOCK_LEVELS } from './levelBank';
import { generateTrayPieces } from './shapes';
import { puzzleBlockAudio } from './audioEngine';
import { MainMenu } from './components/MainMenu';
import { TopHud } from './components/TopHud';
import { Board } from './components/Board';
import { Tray } from './components/Tray';
import { PauseModal } from './components/PauseModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { LevelIntroModal } from './components/LevelIntroModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { StatisticsModal } from './components/StatisticsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { DailyChallengeBanner } from './components/DailyChallengeBanner';
import { BlockRenderer, ConnectedPieceRenderer } from './blockRenderer';
import { GameLeaderboardModal, GAME_CONFIGS } from '../../components/gameNavigation';

const STORAGE_KEY = 'teleplus_puzzle_block_savedata_v1';

function loadSaveData(): PuzzleBlockSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        highestUnlockedLevel: Math.min(40, Math.max(1, parsed.highestUnlockedLevel || 1)),
        stars: parsed.stars || {},
        bestScores: parsed.bestScores || {},
        soundEnabled: parsed.soundEnabled ?? true,
        musicEnabled: parsed.musicEnabled ?? true,
        hapticEnabled: parsed.hapticEnabled ?? true,
        dailyChallengeCompleted: parsed.dailyChallengeCompleted || false,
        dailyChallengeDate: parsed.dailyChallengeDate || new Date().toISOString().slice(0, 10),
        totalScore: parsed.totalScore || 0,
        highestScore: parsed.highestScore || 0,
        totalLinesCleared: parsed.totalLinesCleared || 0,
        totalBlocksPlaced: parsed.totalBlocksPlaced || 0,
        totalGamesPlayed: parsed.totalGamesPlayed || 0,
        levelsCompletedCount: parsed.levelsCompletedCount || 0,
      };
    }
  } catch {
    // Fallback to default
  }
  return {
    highestUnlockedLevel: 1,
    stars: {},
    bestScores: {},
    soundEnabled: true,
    musicEnabled: true,
    hapticEnabled: true,
    dailyChallengeCompleted: false,
    dailyChallengeDate: new Date().toISOString().slice(0, 10),
    totalScore: 0,
    highestScore: 0,
    totalLinesCleared: 0,
    totalBlocksPlaced: 0,
    totalGamesPlayed: 0,
    levelsCompletedCount: 0,
  };
}

function persistSaveData(data: PuzzleBlockSaveData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // LocalStorage quota or privacy exception
  }
}

/**
 * Finds the anchor cell inside a polyomino matrix (closest occupied cell to matrix center)
 */
function getShapeCenterAnchor(matrix: number[][]): { r: number; c: number } {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const midR = Math.floor(rows / 2);
  const midC = Math.floor(cols / 2);
  if (matrix[midR] && matrix[midR][midC] === 1) {
    return { r: midR, c: midC };
  }
  let best = { r: 0, c: 0 };
  let minD = Infinity;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] === 1) {
        const d = Math.abs(r - midR) + Math.abs(c - midC);
        if (d < minD) {
          minD = d;
          best = { r, c };
        }
      }
    }
  }
  return best;
}

interface PuzzleBlockGameProps {
  onExit: () => void;
}

export const PuzzleBlockGame: React.FC<PuzzleBlockGameProps> = ({ onExit }) => {
  // Save Data State
  const [saveData, setSaveData] = useState<PuzzleBlockSaveData>(loadSaveData);
  const [currentLevel, setCurrentLevel] = useState<LevelDefinition>(() => {
    const saved = loadSaveData();
    const lvlId = Math.min(40, saved.highestUnlockedLevel || 1);
    return PUZZLE_BLOCK_LEVELS.find((l) => l.id === lvlId) || PUZZLE_BLOCK_LEVELS[0];
  });

  // Game UI View State (Defaults to MENU for pre-game experience)
  const [currentView, setCurrentView] = useState<PuzzleBlockView>('MENU');
  const [showDailyBanner, setShowDailyBanner] = useState(true);
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);

  // Gameplay State
  const [grid, setGrid] = useState<GridCell[][]>(() => createEmptyGrid());
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [reshuffleRemaining, setReshuffleRemaining] = useState(2);
  const [trayPieces, setTrayPieces] = useState<TrayPiece[]>([]);
  const [clearingCells, setClearingCells] = useState<Set<string>>(new Set());
  const [comboText, setComboText] = useState<{ text: string; scoreText: string } | null>(null);
  const [comboStreak, setComboStreak] = useState(0);

  // Drag & Drop State with Precision Anchor Math
  const [draggingPiece, setDraggingPiece] = useState<TrayPiece | null>(null);
  const [dragAnchor, setDragAnchor] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [dragPointerPos, setDragPointerPos] = useState<{
    x: number;
    y: number;
    effectiveX: number;
    effectiveY: number;
  } | null>(null);
  const [hoverGridPos, setHoverGridPos] = useState<{ row: number; col: number } | null>(null);
  const [isValidHover, setIsValidHover] = useState(false);

  // Refs for Drag Listeners to avoid stale closure issues
  const draggingPieceRef = useRef<TrayPiece | null>(null);
  const dragAnchorRef = useRef<{ r: number; c: number }>({ r: 0, c: 0 });
  const hoverGridPosRef = useRef<{ row: number; col: number } | null>(null);
  const isValidHoverRef = useRef<boolean>(false);
  const gridRef = useRef<GridCell[][]>(grid);
  gridRef.current = grid;

  // Layout Sizing
  const [boardSizePx, setBoardSizePx] = useState(340);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Sync sound settings to audio engine on mount
  useEffect(() => {
    puzzleBlockAudio.setSoundEnabled(saveData.soundEnabled);
    puzzleBlockAudio.setMusicEnabled(saveData.musicEnabled);
    return () => {
      puzzleBlockAudio.stopAmbientMusic();
    };
  }, []);

  // Responsive board calculation
  useEffect(() => {
    const updateDimensions = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Reserve space for Top HUD (~75px), Tray (~120px), and Margins (~40px)
      const maxAvailableHeight = h - 235;
      const maxAvailableWidth = Math.min(w - 24, 460);
      const calculated = Math.min(maxAvailableWidth, maxAvailableHeight);
      setBoardSizePx(Math.max(280, Math.min(420, calculated)));
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Android Back Navigation & Escape Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        setShowDebugOverlay((prev) => !prev);
      }

      if (e.key === 'Escape' || e.key === 'Backspace') {
        if (currentView === 'PLAYING') {
          e.preventDefault();
          puzzleBlockAudio.playButtonTap();
          setCurrentView('PAUSED');
        } else if (
          currentView === 'PAUSED' ||
          currentView === 'INTRO' ||
          currentView === 'LEVEL_SELECT' ||
          currentView === 'HELP' ||
          currentView === 'DAILY_CHALLENGE' ||
          currentView === 'ACHIEVEMENTS' ||
          currentView === 'STATISTICS' ||
          currentView === 'SETTINGS' ||
          currentView === 'ABOUT' ||
          currentView === 'GAME_OVER' ||
          currentView === 'LEVEL_COMPLETE'
        ) {
          e.preventDefault();
          puzzleBlockAudio.playButtonTap();
          setCurrentView('MENU');
        } else if (currentView === 'MENU') {
          e.preventDefault();
          puzzleBlockAudio.playButtonTap();
          onExit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, onExit]);

  // Helper: Create 100% empty 10x10 grid (all 100 cells unoccupied)
  function createEmptyGrid(): GridCell[][] {
    return Array.from({ length: 10 }, () =>
      Array.from({ length: 10 }, () => ({
        occupied: false,
        blocker: 'none',
        iceHits: 0,
        special: 'none',
      }))
    );
  }

  // BUG #1 FIX: Board MUST ALWAYS start 100% empty
  const initLevel = useCallback((level: LevelDefinition) => {
    const newGrid = createEmptyGrid();
    setGrid(newGrid);
    setScore(0);
    setLinesCleared(0);
    setTurnIndex(0);
    setReshuffleRemaining(level.reshuffleLimit);
    setClearingCells(new Set());
    setComboText(null);
    setComboStreak(0);
    setDraggingPiece(null);
    draggingPieceRef.current = null;
    setHoverGridPos(null);
    hoverGridPosRef.current = null;
    setIsValidHover(false);
    isValidHoverRef.current = false;

    // Generate initial 3 tray pieces with board awareness
    const diffTier = getDifficultyTier(level.difficulty);
    const initialPieces = generateTrayPieces(level.id, 0, diffTier, level.allowedShapes, newGrid);
    setTrayPieces(initialPieces);
  }, []);

  function getDifficultyTier(diff: string): number {
    switch (diff) {
      case 'starter': return 1;
      case 'easy': return 2;
      case 'medium': return 3;
      case 'hard': return 4;
      case 'hard+': return 5;
      case 'very_hard': return 6;
      case 'expert': return 7;
      case 'master':
      case 'master+': return 8;
      default: return 2;
    }
  }

  // Start current level
  const handleStartLevel = () => {
    puzzleBlockAudio.playButtonTap();
    initLevel(currentLevel);
    setCurrentView('PLAYING');
    if (saveData.musicEnabled) {
      puzzleBlockAudio.startAmbientMusic();
    }
    const updated: PuzzleBlockSaveData = {
      ...saveData,
      totalGamesPlayed: (saveData.totalGamesPlayed || 0) + 1,
    };
    setSaveData(updated);
    persistSaveData(updated);
  };

  // Reshuffle Tray Pieces
  const handleReshuffle = () => {
    if (reshuffleRemaining <= 0) return;
    puzzleBlockAudio.playReshuffle();

    const diffTier = getDifficultyTier(currentLevel.difficulty);
    const newPieces = generateTrayPieces(currentLevel.id, turnIndex + 100, diffTier, currentLevel.allowedShapes, gridRef.current);
    setTrayPieces(newPieces);
    setReshuffleRemaining((prev) => Math.max(0, prev - 1));
  };

  // Sound Toggle Handler
  const handleToggleSound = () => {
    const nextSound = !saveData.soundEnabled;
    puzzleBlockAudio.playButtonTap();
    puzzleBlockAudio.setSoundEnabled(nextSound);
    puzzleBlockAudio.setMusicEnabled(nextSound);

    const updated = {
      ...saveData,
      soundEnabled: nextSound,
      musicEnabled: nextSound,
    };
    setSaveData(updated);
    persistSaveData(updated);
  };

  // Reset Progress Handler
  const handleResetProgress = () => {
    puzzleBlockAudio.playButtonTap();
    const freshSave: PuzzleBlockSaveData = {
      highestUnlockedLevel: 1,
      stars: {},
      bestScores: {},
      soundEnabled: saveData.soundEnabled,
      musicEnabled: saveData.musicEnabled,
      hapticEnabled: saveData.hapticEnabled ?? true,
      dailyChallengeCompleted: false,
      dailyChallengeDate: new Date().toISOString().slice(0, 10),
      totalScore: 0,
      highestScore: 0,
      totalLinesCleared: 0,
      totalBlocksPlaced: 0,
      totalGamesPlayed: 0,
      levelsCompletedCount: 0,
    };
    setSaveData(freshSave);
    persistSaveData(freshSave);
    const lvl1 = PUZZLE_BLOCK_LEVELS[0];
    setCurrentLevel(lvl1);
    initLevel(lvl1);
  };

  // --------------------------------------------------------------------------
  // BUG #2 FIX: DRAG & DROP HANDLING WITH UNIFIED COORDINATE ANCHOR PRECISION
  // --------------------------------------------------------------------------
  const handleGlobalPointerMove = useCallback((e: PointerEvent) => {
    const piece = draggingPieceRef.current;
    if (!piece) return;
    e.preventDefault();

    const gridEl = document.getElementById('puzzle-block-grid');
    if (!gridEl) return;

    const rect = gridEl.getBoundingClientRect();
    const cellWidth = rect.width / 10;
    const cellHeight = rect.height / 10;

    // Is touch device? Lift piece 65px so finger does not block view
    const isTouch = e.pointerType === 'touch' || (!window.matchMedia('(pointer: fine)').matches);
    const touchOffsetY = isTouch ? 65 : 0;

    const effectiveX = e.clientX;
    const effectiveY = e.clientY - touchOffsetY;

    setDragPointerPos({
      x: e.clientX,
      y: e.clientY,
      effectiveX,
      effectiveY,
    });

    const anchor = dragAnchorRef.current;
    const anchorCol = Math.floor((effectiveX - rect.left) / cellWidth);
    const anchorRow = Math.floor((effectiveY - rect.top) / cellHeight);

    const startR = anchorRow - anchor.r;
    const startC = anchorCol - anchor.c;

    const shapeRows = piece.shape.matrix.length;
    const shapeCols = piece.shape.matrix[0].length;

    // Check if the piece is over the board area
    const isNearbyBoard =
      startR + shapeRows > 0 &&
      startR < 10 &&
      startC + shapeCols > 0 &&
      startC < 10;

    if (isNearbyBoard) {
      const valid = canPlaceShape(gridRef.current, piece.shape, startR, startC);
      setHoverGridPos({ row: startR, col: startC });
      hoverGridPosRef.current = { row: startR, col: startC };
      setIsValidHover(valid);
      isValidHoverRef.current = valid;
    } else {
      setHoverGridPos(null);
      hoverGridPosRef.current = null;
      setIsValidHover(false);
      isValidHoverRef.current = false;
    }
  }, []);

  const handleGlobalPointerUp = useCallback(() => {
    window.removeEventListener('pointermove', handleGlobalPointerMove);
    window.removeEventListener('pointerup', handleGlobalPointerUp);
    window.removeEventListener('pointercancel', handleGlobalPointerUp);

    const piece = draggingPieceRef.current;
    const hoverPos = hoverGridPosRef.current;
    const valid = isValidHoverRef.current;

    if (piece && hoverPos && valid) {
      // PREVIEW CELLS = FINAL DROP PLACEMENT CELLS (100% Identical)
      placePiece(piece, hoverPos.row, hoverPos.col);
    } else if (piece) {
      puzzleBlockAudio.playInvalid();
    }

    setDraggingPiece(null);
    draggingPieceRef.current = null;
    setDragPointerPos(null);
    setHoverGridPos(null);
    hoverGridPosRef.current = null;
    setIsValidHover(false);
    isValidHoverRef.current = false;
  }, [handleGlobalPointerMove]);

  const handlePiecePointerDown = (
    e: React.PointerEvent,
    piece: TrayPiece,
    _pieceIndex: number,
    anchorR?: number,
    anchorC?: number
  ) => {
    if (currentView !== 'PLAYING' || piece.placed) return;
    e.preventDefault();

    puzzleBlockAudio.playPiecePickup();

    let r = anchorR;
    let c = anchorC;
    if (r === undefined || c === undefined || piece.shape.matrix[r]?.[c] !== 1) {
      const center = getShapeCenterAnchor(piece.shape.matrix);
      r = center.r;
      c = center.c;
    }

    const anchor = { r, c };
    setDragAnchor(anchor);
    dragAnchorRef.current = anchor;
    setDraggingPiece(piece);
    draggingPieceRef.current = piece;

    const isTouch = e.pointerType === 'touch' || (!window.matchMedia('(pointer: fine)').matches);
    const touchOffsetY = isTouch ? 65 : 0;
    const effectiveX = e.clientX;
    const effectiveY = e.clientY - touchOffsetY;

    setDragPointerPos({
      x: e.clientX,
      y: e.clientY,
      effectiveX,
      effectiveY,
    });

    const gridEl = document.getElementById('puzzle-block-grid');
    if (gridEl) {
      const rect = gridEl.getBoundingClientRect();
      const cellWidth = rect.width / 10;
      const cellHeight = rect.height / 10;
      const anchorCol = Math.floor((effectiveX - rect.left) / cellWidth);
      const anchorRow = Math.floor((effectiveY - rect.top) / cellHeight);
      const startR = anchorRow - anchor.r;
      const startC = anchorCol - anchor.c;

      const shapeRows = piece.shape.matrix.length;
      const shapeCols = piece.shape.matrix[0].length;
      const isNearbyBoard =
        startR + shapeRows > 0 &&
        startR < 10 &&
        startC + shapeCols > 0 &&
        startC < 10;

      if (isNearbyBoard) {
        const valid = canPlaceShape(gridRef.current, piece.shape, startR, startC);
        setHoverGridPos({ row: startR, col: startC });
        hoverGridPosRef.current = { row: startR, col: startC };
        setIsValidHover(valid);
        isValidHoverRef.current = valid;
      }
    }

    // Attach global listeners
    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
  };

  // Check if a shape can be legally placed at (targetR, targetC) on a 10x10 board
  function canPlaceShape(
    currentGrid: GridCell[][],
    shape: PolyominoShape,
    targetR: number,
    targetC: number
  ): boolean {
    const rows = shape.matrix.length;
    const cols = shape.matrix[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (shape.matrix[r][c] === 1) {
          const gridR = targetR + r;
          const gridC = targetC + c;

          // Out of bounds check: 10x10 board (0 to 9)
          if (gridR < 0 || gridR >= 10 || gridC < 0 || gridC >= 10) {
            return false;
          }

          const cell = currentGrid[gridR][gridC];
          // Must not already be occupied, locked, or stone
          if (cell.occupied) {
            return false;
          }
          if (cell.blocker === 'locked' || cell.blocker === 'stone') {
            return false;
          }
        }
      }
    }
    return true;
  }

  // Check if ANY available piece in the tray can legally fit on the board
  function checkHasAnyLegalMoves(currentGrid: GridCell[][], availablePieces: TrayPiece[]): boolean {
    const unplacedPieces = availablePieces.filter((p) => !p.placed);
    if (unplacedPieces.length === 0) return true; // Will generate next 3 pieces

    for (const piece of unplacedPieces) {
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          if (canPlaceShape(currentGrid, piece.shape, r, c)) {
            return true; // At least one legal move exists!
          }
        }
      }
    }
    return false; // NO legal moves for ANY piece!
  }

  // Place Piece into the Grid & Check Line Clears
  const placePiece = (piece: TrayPiece, startR: number, startC: number) => {
    puzzleBlockAudio.playPiecePlace();

    // 1. Update Grid with new piece blocks
    const newGrid = gridRef.current.map((row) => row.map((cell) => ({ ...cell })));
    let placedBlockCount = 0;
    const bombCellsToClear: { r: number; c: number }[] = [];
    const lineClearHRows: number[] = [];
    const lineClearVCols: number[] = [];

    for (let r = 0; r < piece.shape.matrix.length; r++) {
      for (let c = 0; c < piece.shape.matrix[r].length; c++) {
        if (piece.shape.matrix[r][c] === 1) {
          const gr = startR + r;
          const gc = startC + c;
          newGrid[gr][gc] = {
            occupied: true,
            color: piece.shape.color,
            blocker: 'none',
            iceHits: 0,
            special: piece.shape.special || 'none',
          };
          placedBlockCount++;

          // Check if placed piece has special abilities
          if (piece.shape.special === 'bomb') {
            bombCellsToClear.push({ r: gr, c: gc });
          } else if (piece.shape.special === 'line_h') {
            lineClearHRows.push(gr);
          } else if (piece.shape.special === 'line_v') {
            lineClearVCols.push(gc);
          }
        }
      }
    }

    // 2. Mark Piece as placed in Tray
    const nextPieces = trayPieces.map((p) =>
      p.instanceId === piece.instanceId ? { ...p, placed: true } : p
    );

    // Placement Points: +10 pts per cell
    let moveScore = placedBlockCount * 10;

    // 3. Detect completed horizontal rows and vertical columns
    const fullRows: number[] = [];
    const fullCols: number[] = [];

    // Horizontal check
    for (let r = 0; r < 10; r++) {
      let isFull = true;
      for (let c = 0; c < 10; c++) {
        if (!newGrid[r][c].occupied) {
          isFull = false;
          break;
        }
      }
      if (isFull) fullRows.push(r);
    }

    // Vertical check
    for (let c = 0; c < 10; c++) {
      let isFull = true;
      for (let r = 0; r < 10; r++) {
        if (!newGrid[r][c].occupied) {
          isFull = false;
          break;
        }
      }
      if (isFull) fullCols.push(c);
    }

    // Include specials
    lineClearHRows.forEach((r) => !fullRows.includes(r) && fullRows.push(r));
    lineClearVCols.forEach((c) => !fullCols.includes(c) && fullCols.push(c));

    const totalLines = fullRows.length + fullCols.length;

    // 4. If lines are cleared, calculate scores, combo badges, and blocker damage
    if (totalLines > 0 || bombCellsToClear.length > 0) {
      let linePoints = 0;
      if (totalLines === 1) linePoints = 100;
      else if (totalLines === 2) linePoints = 300;
      else if (totalLines === 3) linePoints = 600;
      else if (totalLines >= 4) linePoints = 1000 + (totalLines - 4) * 400;

      const isCrossClear = fullRows.length > 0 && fullCols.length > 0;
      if (isCrossClear) {
        linePoints += 200;
      }

      const nextStreak = comboStreak + 1;
      setComboStreak(nextStreak);
      const streakBonus = nextStreak > 1 ? (nextStreak - 1) * 75 : 0;
      moveScore += linePoints + streakBonus;

      if (isCrossClear) {
        puzzleBlockAudio.playCombo(4);
        setComboText({ text: 'CROSS CLEAR!', scoreText: `+${moveScore}` });
      } else if (nextStreak >= 3) {
        puzzleBlockAudio.playCombo(Math.min(4, nextStreak));
        setComboText({ text: `COMBO x${nextStreak}!`, scoreText: `+${moveScore}` });
      } else if (totalLines >= 4) {
        puzzleBlockAudio.playCombo(4);
        setComboText({ text: 'QUAD CLEAR!', scoreText: `+${moveScore}` });
      } else if (totalLines === 3) {
        puzzleBlockAudio.playCombo(3);
        setComboText({ text: 'TRIPLE CLEAR!', scoreText: `+${moveScore}` });
      } else if (totalLines === 2) {
        puzzleBlockAudio.playCombo(2);
        setComboText({ text: 'DOUBLE CLEAR!', scoreText: `+${moveScore}` });
      } else {
        puzzleBlockAudio.playLineClear(totalLines);
        setComboText({ text: 'LINE CLEAR!', scoreText: `+${moveScore}` });
      }

      const clearingSet = new Set<string>();
      fullRows.forEach((r) => {
        for (let c = 0; c < 10; c++) clearingSet.add(`${r}-${c}`);
      });
      fullCols.forEach((c) => {
        for (let r = 0; r < 10; r++) clearingSet.add(`${r}-${c}`);
      });

      bombCellsToClear.forEach((bomb) => {
        puzzleBlockAudio.playSpecial('bomb');
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const br = bomb.r + dr;
            const bc = bomb.c + dc;
            if (br >= 0 && br < 10 && bc >= 0 && bc < 10) {
              clearingSet.add(`${br}-${bc}`);
            }
          }
        }
      });

      // Apply blocker damage to neighbors
      clearingSet.forEach((key) => {
        const [rStr, cStr] = key.split('-');
        const r = parseInt(rStr, 10);
        const c = parseInt(cStr, 10);

        const neighbors = [
          [r - 1, c],
          [r + 1, c],
          [r, c - 1],
          [r, c + 1],
        ];

        neighbors.forEach(([nr, nc]) => {
          if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
            const neighbor = newGrid[nr][nc];
            if (neighbor.blocker === 'wood') {
              puzzleBlockAudio.playBlockerHit('wood');
              neighbor.occupied = false;
              neighbor.blocker = 'none';
              moveScore += 50;
            } else if (neighbor.blocker === 'ice') {
              puzzleBlockAudio.playBlockerHit('ice');
              if ((neighbor.iceHits || 0) >= 1) {
                neighbor.occupied = false;
                neighbor.blocker = 'none';
                neighbor.iceHits = 0;
                moveScore += 100;
              } else {
                neighbor.iceHits = 1;
              }
            } else if (neighbor.blocker === 'locked') {
              neighbor.blocker = 'none';
              moveScore += 25;
            }
          }
        });
      });

      setClearingCells(clearingSet);

      setTimeout(() => {
        clearingSet.forEach((key) => {
          const [rStr, cStr] = key.split('-');
          const r = parseInt(rStr, 10);
          const c = parseInt(cStr, 10);
          if (newGrid[r][c].blocker !== 'stone') {
            newGrid[r][c].occupied = false;
            newGrid[r][c].blocker = 'none';
            newGrid[r][c].special = 'none';
          }
        });

        setGrid(newGrid);
        setClearingCells(new Set());
        setComboText(null);
      }, 240);
    } else {
      setComboStreak(0);
      setGrid(newGrid);
    }

    // Update Score & Lines
    const newScore = score + moveScore;
    const newLines = linesCleared + totalLines;
    setScore(newScore);
    setLinesCleared(newLines);

    // Update career statistics in save data
    const updatedStats: PuzzleBlockSaveData = {
      ...saveData,
      totalScore: (saveData.totalScore || 0) + moveScore,
      highestScore: Math.max(saveData.highestScore || 0, newScore),
      totalLinesCleared: (saveData.totalLinesCleared || 0) + totalLines,
      totalBlocksPlaced: (saveData.totalBlocksPlaced || 0) + placedBlockCount,
      dailyChallengeCompleted:
        saveData.dailyChallengeCompleted || newScore >= 2500,
    };
    setSaveData(updatedStats);
    persistSaveData(updatedStats);

    // 5. Check Level Complete Objective
    const isTargetScoreMet = newScore >= currentLevel.targetScore;
    const isTargetLinesMet = !currentLevel.targetLines || newLines >= currentLevel.targetLines;

    if (isTargetScoreMet && isTargetLinesMet) {
      handleLevelComplete(newScore, newLines);
      return;
    }

    // 6. Check if tray is empty -> generate next 3 pieces
    let activeTray = nextPieces;
    const allPlaced = nextPieces.every((p) => p.placed);
    if (allPlaced) {
      const nextStep = turnIndex + 1;
      setTurnIndex(nextStep);
      const diffTier = getDifficultyTier(currentLevel.difficulty);
      activeTray = generateTrayPieces(currentLevel.id, nextStep, diffTier, currentLevel.allowedShapes, newGrid);
      setTrayPieces(activeTray);
    } else {
      setTrayPieces(nextPieces);
    }

    // 7. Test for Game Over
    setTimeout(() => {
      const hasMoves = checkHasAnyLegalMoves(newGrid, activeTray);
      if (!hasMoves) {
        puzzleBlockAudio.playGameOver();
        setCurrentView('GAME_OVER');
      }
    }, 280);
  };

  // Level Complete Routine
  const handleLevelComplete = (finalScore: number, _finalLines: number) => {
    puzzleBlockAudio.playLevelComplete();

    let starsEarned = 1;
    if (finalScore >= currentLevel.starThresholds[2]) starsEarned = 3;
    else if (finalScore >= currentLevel.starThresholds[1]) starsEarned = 2;

    const nextUnlocked = Math.min(40, Math.max(saveData.highestUnlockedLevel, currentLevel.id + 1));
    const prevStars = saveData.stars[currentLevel.id] || 0;
    const bestScore = Math.max(saveData.bestScores[currentLevel.id] || 0, finalScore);

    const newStarsRecord = {
      ...saveData.stars,
      [currentLevel.id]: Math.max(prevStars, starsEarned),
    };

    const updatedSave: PuzzleBlockSaveData = {
      ...saveData,
      highestUnlockedLevel: nextUnlocked,
      stars: newStarsRecord,
      bestScores: {
        ...saveData.bestScores,
        [currentLevel.id]: bestScore,
      },
      levelsCompletedCount: (Object.values(newStarsRecord) as number[]).filter((s) => s > 0).length,
    };

    setSaveData(updatedSave);
    persistSaveData(updatedSave);
    setCurrentView('LEVEL_COMPLETE');
  };

  // Next Level Handler
  const handleNextLevel = () => {
    puzzleBlockAudio.playButtonTap();
    const nextLvlId = currentLevel.id + 1;
    if (nextLvlId <= 40) {
      const nextLvl = PUZZLE_BLOCK_LEVELS.find((l) => l.id === nextLvlId);
      if (nextLvl) {
        setCurrentLevel(nextLvl);
        initLevel(nextLvl);
        setCurrentView('PLAYING');
      }
    } else {
      setCurrentView('LEVEL_SELECT');
    }
  };

  // Cell size for preview rendering matching Board.tsx
  const boardCellSize = Math.floor((boardSizePx - 24) / 10);

  // If in Main Menu or menu sub-modal view, render the MainMenu container
  const isMenuView =
    currentView === 'MENU' ||
    currentView === 'SETTINGS' ||
    currentView === 'STATISTICS' ||
    currentView === 'ACHIEVEMENTS' ||
    currentView === 'DAILY_CHALLENGE' ||
    currentView === 'ABOUT' ||
    currentView === 'LEADERBOARD';

  if (isMenuView) {
    return (
      <div className="relative w-full h-full min-h-screen">
        <MainMenu
          saveData={saveData}
          onPlay={() => {
            puzzleBlockAudio.playButtonTap();
            initLevel(currentLevel);
            setCurrentView('INTRO');
          }}
          onOpenLevels={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('LEVEL_SELECT');
          }}
          onOpenLeaderboard={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('LEADERBOARD');
          }}
          onOpenHowToPlay={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('HELP');
          }}
          onOpenDailyChallenge={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('DAILY_CHALLENGE');
          }}
          onOpenAchievements={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('ACHIEVEMENTS');
          }}
          onOpenStatistics={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('STATISTICS');
          }}
          onOpenSettings={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('SETTINGS');
          }}
          onOpenAbout={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('ABOUT');
          }}
          onToggleSound={handleToggleSound}
          onExit={onExit}
        />

        {/* Menu Sub-Modals */}
        {currentView === 'SETTINGS' && (
          <SettingsModal
            saveData={saveData}
            onUpdateSettings={(newVals) => {
              const updated = { ...saveData, ...newVals };
              setSaveData(updated);
              persistSaveData(updated);
              if (newVals.soundEnabled !== undefined) {
                puzzleBlockAudio.setSoundEnabled(newVals.soundEnabled);
              }
              if (newVals.musicEnabled !== undefined) {
                puzzleBlockAudio.setMusicEnabled(newVals.musicEnabled);
              }
            }}
            onResetProgress={handleResetProgress}
            onClose={() => setCurrentView('MENU')}
          />
        )}

        {currentView === 'STATISTICS' && (
          <StatisticsModal saveData={saveData} onClose={() => setCurrentView('MENU')} />
        )}

        {currentView === 'ACHIEVEMENTS' && (
          <AchievementsModal saveData={saveData} onClose={() => setCurrentView('MENU')} />
        )}

        {currentView === 'DAILY_CHALLENGE' && (
          <DailyChallengeModal
            saveData={saveData}
            onStartChallenge={() => {
              puzzleBlockAudio.playButtonTap();
              initLevel(currentLevel);
              setCurrentView('PLAYING');
              if (saveData.musicEnabled) {
                puzzleBlockAudio.startAmbientMusic();
              }
            }}
            onClose={() => setCurrentView('MENU')}
          />
        )}

        {currentView === 'ABOUT' && (
          <AboutModal onClose={() => setCurrentView('MENU')} />
        )}

        {currentView === 'LEADERBOARD' && (
          <GameLeaderboardModal
            gameConfig={GAME_CONFIGS['puzzle-block']}
            onClose={() => setCurrentView('MENU')}
          />
        )}
      </div>
    );
  }

  return (
    <div
      ref={gameContainerRef}
      className="relative w-full h-full min-h-screen bg-gradient-to-b from-[#5a2418] via-[#481a10] to-[#2e0f08] flex flex-col justify-between items-center select-none overflow-hidden touch-none font-['Plus_Jakarta_Sans',sans-serif]"
      style={{
        backgroundImage: `radial-gradient(ellipse at center, rgba(138, 63, 32, 0.4) 0%, rgba(20, 5, 2, 0.95) 100%)`,
      }}
    >
      {/* Top Button-based HUD */}
      <TopHud
        score={score}
        currentLevel={currentLevel}
        linesCleared={linesCleared}
        soundEnabled={saveData.soundEnabled}
        onBack={() => {
          puzzleBlockAudio.playButtonTap();
          setCurrentView('MENU');
        }}
        onPause={() => {
          puzzleBlockAudio.playButtonTap();
          setCurrentView('PAUSED');
        }}
        onToggleSound={handleToggleSound}
        onOpenHelp={() => {
          puzzleBlockAudio.playButtonTap();
          setCurrentView('HELP');
        }}
      />

      {/* Floating Combo Popup */}
      {comboText && (
        <div className="absolute top-28 z-40 flex flex-col items-center pointer-events-none animate-bounce">
          <span className="text-2xl font-black text-amber-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] tracking-wider font-serif">
            {comboText.text}
          </span>
          <span className="text-lg font-black text-emerald-300 drop-shadow font-mono">
            {comboText.scoreText}
          </span>
        </div>
      )}

      {/* 10x10 Wooden Game Board (ALWAYS 100% EMPTY AT LEVEL START) */}
      <div className="flex-1 flex items-center justify-center w-full px-2">
        <Board
          grid={grid}
          boardSizePx={boardSizePx}
          hoverPos={hoverGridPos}
          draggedShape={draggingPiece ? draggingPiece.shape : null}
          isValidHover={isValidHover}
          clearingCells={clearingCells}
        />
      </div>

      {/* Bottom 3-Piece Tray with Reshuffle */}
      <Tray
        pieces={trayPieces}
        reshuffleRemaining={reshuffleRemaining}
        onReshuffle={handleReshuffle}
        onPiecePointerDown={handlePiecePointerDown}
        activeDragPieceId={draggingPiece?.instanceId || null}
      />

      {/* Active Floating Dragged Piece with Connected Mesh Rendering & Touch Offset */}
      {draggingPiece && dragPointerPos && (
        <div
          className="fixed pointer-events-none z-50 transition-none select-none filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.9)] scale-105"
          style={{
            left: dragPointerPos.effectiveX - (dragAnchor.c + 0.5) * boardCellSize,
            top: dragPointerPos.effectiveY - (dragAnchor.r + 0.5) * boardCellSize,
            width: draggingPiece.shape.matrix[0].length * boardCellSize,
            height: draggingPiece.shape.matrix.length * boardCellSize,
          }}
        >
          <ConnectedPieceRenderer
            matrix={draggingPiece.shape.matrix}
            color={draggingPiece.shape.color}
            special={draggingPiece.shape.special}
            cellSize={boardCellSize}
          />
        </div>
      )}

      {/* Real-time Coordinate Precision Debug Overlay (Toggle with 'D' key) */}
      {showDebugOverlay && (
        <div className="fixed top-2 left-2 z-50 p-2.5 rounded-xl bg-black/90 text-[10px] font-mono text-emerald-400 border border-emerald-500/50 shadow-2xl pointer-events-none">
          <div>BOARD SIZE: {boardSizePx}px | CELL: {boardCellSize}px</div>
          <div>HOVER: {hoverGridPos ? `R:${hoverGridPos.row} C:${hoverGridPos.col}` : 'NONE'}</div>
          <div>ANCHOR: R:{dragAnchor.r} C:{dragAnchor.c}</div>
          <div>VALID: {isValidHover ? 'YES (GOLD)' : 'NO (RED)'}</div>
          <div>POINTER: {dragPointerPos ? `X:${Math.round(dragPointerPos.x)} Y:${Math.round(dragPointerPos.y)}` : 'IDLE'}</div>
        </div>
      )}

      {/* Modals */}
      {currentView === 'INTRO' && (
        <LevelIntroModal
          level={currentLevel}
          onStart={handleStartLevel}
          onLevelSelect={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('LEVEL_SELECT');
          }}
        />
      )}

      {currentView === 'PAUSED' && (
        <PauseModal
          score={score}
          levelId={currentLevel.id}
          onResume={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('PLAYING');
          }}
          onLeaderboard={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('LEADERBOARD');
          }}
          onHowToPlay={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('HELP');
          }}
          onRestart={() => {
            puzzleBlockAudio.playButtonTap();
            initLevel(currentLevel);
            setCurrentView('PLAYING');
          }}
          onLevelSelect={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('LEVEL_SELECT');
          }}
          onHome={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('MENU');
          }}
        />
      )}

      {currentView === 'LEVEL_SELECT' && (
        <LevelSelectModal
          highestUnlockedLevel={saveData.highestUnlockedLevel}
          starsRecord={saveData.stars}
          bestScores={saveData.bestScores}
          onSelectLevel={(lvl) => {
            puzzleBlockAudio.playButtonTap();
            setCurrentLevel(lvl);
            initLevel(lvl);
            setCurrentView('INTRO');
          }}
          onBack={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('MENU');
          }}
        />
      )}

      {currentView === 'LEVEL_COMPLETE' && (
        <LevelCompleteModal
          level={currentLevel}
          score={score}
          lines={linesCleared}
          bestScore={Math.max(saveData.bestScores[currentLevel.id] || 0, score)}
          stars={score >= currentLevel.starThresholds[2] ? 3 : score >= currentLevel.starThresholds[1] ? 2 : 1}
          hasNextLevel={currentLevel.id < 40}
          onNextLevel={handleNextLevel}
          onReplay={() => {
            puzzleBlockAudio.playButtonTap();
            initLevel(currentLevel);
            setCurrentView('PLAYING');
          }}
          onLevelSelect={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('LEVEL_SELECT');
          }}
        />
      )}

      {currentView === 'GAME_OVER' && (
        <GameOverModal
          level={currentLevel}
          score={score}
          bestScore={Math.max(saveData.bestScores[currentLevel.id] || 0, score)}
          onRetry={() => {
            puzzleBlockAudio.playButtonTap();
            initLevel(currentLevel);
            setCurrentView('PLAYING');
          }}
          onLevelSelect={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('LEVEL_SELECT');
          }}
          onHome={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('MENU');
          }}
        />
      )}

      {currentView === 'HELP' && (
        <HowToPlayModal
          onClose={() => {
            puzzleBlockAudio.playButtonTap();
            setCurrentView('MENU');
          }}
        />
      )}
    </div>
  );
};
