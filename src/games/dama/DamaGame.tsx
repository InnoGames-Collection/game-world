/**
 * DAMA — Tournament Edition (Ethiopian Draughts)
 * 40-Level Sequential Tournament System, Pre-Game Main Menu,
 * Deterministic Competitive Scoring, and Real Telemetry Persistence.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition, UserProfile } from '../../types';
import {
  BoardState,
  DamaMove,
  GameStatus,
  GameTurn,
  MatchStats,
  Piece,
  DamaProgress,
  DamaScoreBreakdown,
} from './types';
import {
  createInitialBoard,
  getAllCaptures,
  getAllLegalMoves,
  getLegalMovesForPiece,
  applyDamaMove,
  evaluateGameOutcome,
  countPieces,
} from './damaEngine';
import { computeBestComputerMove, getLevelConfig } from './damaAi';
import { Dama3DRenderer } from './dama3dRenderer';
import { damaAudio } from './damaAudio';
import {
  loadDamaProgress,
  saveDamaProgress,
  calculateDamaScore,
  recordCompletedDamaMatch,
  resetDamaProgress,
} from './damaScoring';
import { DamaMenu } from './components/DamaMenu';
import { DamaLevelSelect } from './components/DamaLevelSelect';
import { DamaLeaderboard } from './components/DamaLeaderboard';
import { DamaHowToPlay } from './components/DamaHowToPlay';
import { DamaAchievements } from './components/DamaAchievements';
import { DamaStatistics } from './components/DamaStatistics';
import { DamaSettings } from './components/DamaSettings';
import { DamaAbout } from './components/DamaAbout';
import { DamaResultModal } from './components/DamaResultModal';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Crown,
  ShieldAlert,
  HelpCircle,
  Grid,
} from 'lucide-react';

type DamaView =
  | 'MENU'
  | 'LEVEL_SELECT'
  | 'GAMEPLAY'
  | 'LEADERBOARD'
  | 'HOW_TO_PLAY'
  | 'ACHIEVEMENTS'
  | 'STATISTICS'
  | 'SETTINGS'
  | 'ABOUT';

interface DamaGameProps {
  game: GameDefinition;
  profile?: UserProfile;
  onGameOver: (result: {
    score: number;
    durationSeconds: number;
    stars?: number;
    cleared?: boolean;
    level?: number;
  }) => void;
  onExit: () => void;
  isAudioEnabled?: boolean;
}

export const DamaGame: React.FC<DamaGameProps> = ({
  game,
  profile,
  onGameOver,
  onExit,
  isAudioEnabled = true,
}) => {
  // 1. Authoritative Tournament Progress (Levels 1 to 40)
  const [progress, setProgress] = useState<DamaProgress>(() => loadDamaProgress());
  const progressRef = useRef<DamaProgress>(progress);
  progressRef.current = progress;

  // 2. Primary Navigation View State — MUST start on 'MENU'
  const [view, setView] = useState<DamaView>('MENU');
  const [currentLevel, setCurrentLevel] = useState<number>(() => progress.highestUnlockedLevel || 1);

  // 3. Strict Finite State Machine for Gameplay
  type DamaTurnState =
    | 'IDLE'
    | 'PLAYER_TURN'
    | 'PLAYER_MOVING'
    | 'COMPUTER_THINKING'
    | 'COMPUTER_MOVING'
    | 'GAME_OVER';

  const [turnState, setTurnState] = useState<DamaTurnState>('PLAYER_TURN');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [turn, setTurn] = useState<GameTurn>('player');
  const [board, setBoard] = useState<BoardState>(() => createInitialBoard());
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [activeLegalMoves, setActiveLegalMoves] = useState<DamaMove[]>([]);
  const [hasMandatoryCapture, setHasMandatoryCapture] = useState<boolean>(false);
  const [matchDuration, setMatchDuration] = useState<number>(0);

  // Score breakdown and result modal state
  const [activeBreakdown, setActiveBreakdown] = useState<DamaScoreBreakdown | null>(null);
  const [unlockedNewLevel, setUnlockedNewLevel] = useState<boolean>(false);

  // Match telemetry tracking for deterministic scoring
  const invalidMovesCountRef = useRef<number>(0);
  const moveTimestampsRef = useRef<number[]>([]);
  const lastPlayerActionTimeRef = useRef<number>(Date.now());
  const tacticalStreakRef = useRef<number>(0);

  const [stats, setStats] = useState<MatchStats>({
    playerPiecesCaptured: 0,
    computerPiecesCaptured: 0,
    playerKingsCreated: 0,
    computerKingsCreated: 0,
    movesPlayed: 0,
    matchDurationSeconds: 0,
    invalidMoveAttempts: 0,
    tacticalCapturesSequence: 0,
    avgMoveTimeSeconds: 0,
    bestMoveTimeSeconds: 0,
  });

  // Critical Refs to completely prevent race conditions, rapid inputs, and stale closures
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Dama3DRenderer | null>(null);
  const boardRef = useRef<BoardState>(board);
  boardRef.current = board;

  const turnStateRef = useRef<DamaTurnState>('PLAYER_TURN');
  turnStateRef.current = turnState;

  const isMoveLockedRef = useRef<boolean>(false);
  const turnSeqRef = useRef<number>(0);
  const consecutiveNonCapturesRef = useRef<number>(0);
  const currentLevelRef = useRef<number>(currentLevel);
  currentLevelRef.current = currentLevel;
  const statsRef = useRef<MatchStats>(stats);
  statsRef.current = stats;
  const selectedPieceRef = useRef<Piece | null>(selectedPiece);
  selectedPieceRef.current = selectedPiece;
  const activeLegalMovesRef = useRef<DamaMove[]>(activeLegalMoves);
  activeLegalMovesRef.current = activeLegalMoves;

  const matchTimerRef = useRef<number | null>(null);

  // Sync audio state to audio engine
  useEffect(() => {
    damaAudio.setEnabled(!progress.settings.isAudioMuted && isAudioEnabled);
  }, [progress.settings.isAudioMuted, isAudioEnabled]);

  // Track match duration timer (only active while playing in GAMEPLAY view)
  useEffect(() => {
    if (view === 'GAMEPLAY' && turnState !== 'IDLE' && turnState !== 'GAME_OVER') {
      matchTimerRef.current = window.setInterval(() => {
        setMatchDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (matchTimerRef.current) {
        clearInterval(matchTimerRef.current);
        matchTimerRef.current = null;
      }
    }

    return () => {
      if (matchTimerRef.current) {
        clearInterval(matchTimerRef.current);
      }
    };
  }, [view, turnState]);

  // Check if player has mandatory capture moves
  const updateMandatoryCaptureStatus = useCallback((currentBoard: BoardState) => {
    const caps = getAllCaptures(currentBoard, 'white');
    setHasMandatoryCapture(caps.length > 0);
  }, []);

  /**
   * Handles end of match (Victory, Defeat, Draw)
   */
  const handleGameEnd = useCallback(
    (outcome: 'player_won' | 'computer_won' | 'draw', currentStats: MatchStats) => {
      setTurnState('GAME_OVER');
      turnStateRef.current = 'GAME_OVER';
      setGameStatus(outcome);
      isMoveLockedRef.current = false;

      const isWin = outcome === 'player_won';
      const pieces = countPieces(boardRef.current);

      if (isWin) {
        damaAudio.playWin();
      } else {
        damaAudio.playDefeat();
      }

      // Calculate move times
      const timestamps = moveTimestampsRef.current;
      const moveDurations: number[] = [];
      for (let i = 1; i < timestamps.length; i++) {
        moveDurations.push((timestamps[i] - timestamps[i - 1]) / 1000);
      }
      const avgMoveTime =
        moveDurations.length > 0
          ? Math.round(
              (moveDurations.reduce((a, b) => a + b, 0) / moveDurations.length) * 10
            ) / 10
          : 2.1;
      const bestMoveTime =
        moveDurations.length > 0
          ? Math.round(Math.min(...moveDurations) * 10) / 10
          : 0.8;

      const currentProg = progressRef.current;
      const levelConfig = getLevelConfig(currentLevelRef.current);

      // Deterministic scoring calculation
      const breakdown = calculateDamaScore({
        levelConfig,
        isWin,
        matchStats: {
          ...currentStats,
          invalidMoveAttempts: invalidMovesCountRef.current,
          tacticalCapturesSequence: tacticalStreakRef.current,
          avgMoveTimeSeconds: avgMoveTime,
          bestMoveTimeSeconds: bestMoveTime,
        },
        playerPiecesRemaining: pieces.whiteCount,
        currentProgress: currentProg,
      });

      // Record level completion and persist progress
      const { updatedProgress, unlockedNewLevel: unlockedNext } = recordCompletedDamaMatch(
        currentProg,
        breakdown
      );

      setProgress(updatedProgress);
      progressRef.current = updatedProgress;
      saveDamaProgress(updatedProgress);

      setActiveBreakdown(breakdown);
      setUnlockedNewLevel(unlockedNext);

      // Report to platform host
      onGameOver({
        score: breakdown.finalScore,
        durationSeconds: matchDuration,
        stars: breakdown.starsEarned,
        cleared: isWin,
        level: currentLevelRef.current,
      });
    },
    [matchDuration, onGameOver]
  );

  /**
   * Executes the computer turn with safe AI search, time limit, and guaranteed transition
   */
  const runComputerTurn = useCallback(
    async (currentBoard: BoardState, currentStats: MatchStats, seq: number) => {
      const thinkingDelay = 320 + Math.random() * 160;

      let aiMove: DamaMove | null = null;
      try {
        const [computedMove] = await Promise.all([
          computeBestComputerMove(currentBoard, currentLevelRef.current),
          new Promise((resolve) => setTimeout(resolve, thinkingDelay)),
        ]);
        aiMove = computedMove;
      } catch (err) {
        console.warn('AI calculation exception, retrieving fallback move:', err);
        const legal = getAllLegalMoves(currentBoard, 'black');
        aiMove = legal.length > 0 ? legal[0] : null;
      }

      if (seq !== turnSeqRef.current) return;

      if (!aiMove) {
        // Computer has no legal moves -> Player wins immediately!
        handleGameEnd('player_won', currentStats);
        return;
      }

      // Transition to COMPUTER_MOVING
      isMoveLockedRef.current = true;
      setTurnState('COMPUTER_MOVING');
      turnStateRef.current = 'COMPUTER_MOVING';
      setGameStatus('animating');

      const executeComputerAnimation = () => {
        if (!rendererRef.current) {
          isMoveLockedRef.current = false;
          return;
        }

        rendererRef.current.animateMove(aiMove!, () => {
          if (seq !== turnSeqRef.current) return;

          try {
            const { newBoard, newlyPromoted } = applyDamaMove(boardRef.current, aiMove!);
            setBoard(newBoard);
            boardRef.current = newBoard;

            if (rendererRef.current) {
              rendererRef.current.syncBoardState(newBoard);
            }

            const newStats: MatchStats = {
              ...currentStats,
              playerPiecesCaptured:
                currentStats.playerPiecesCaptured + aiMove!.capturedPieces.length,
              computerKingsCreated: currentStats.computerKingsCreated + (newlyPromoted ? 1 : 0),
              movesPlayed: currentStats.movesPlayed + 1,
            };
            setStats(newStats);
            statsRef.current = newStats;

            if (aiMove!.isCapture) {
              consecutiveNonCapturesRef.current = 0;
            } else {
              consecutiveNonCapturesRef.current += 1;
            }

            // Immediately evaluate if computer's move resulted in game over
            const outcome = evaluateGameOutcome(
              newBoard,
              'white',
              consecutiveNonCapturesRef.current
            );

            if (outcome.isOver) {
              handleGameEnd(
                outcome.winner === 'black'
                  ? 'computer_won'
                  : outcome.winner === 'white'
                  ? 'player_won'
                  : 'draw',
                newStats
              );
              return;
            }

            // Transition cleanly back to PLAYER_TURN
            lastPlayerActionTimeRef.current = Date.now();
            setTurn('player');
            setTurnState('PLAYER_TURN');
            turnStateRef.current = 'PLAYER_TURN';
            setGameStatus('playing');
            isMoveLockedRef.current = false;
            updateMandatoryCaptureStatus(newBoard);
          } catch (err) {
            console.error('Error applying computer move:', err);
            setTurn('player');
            setTurnState('PLAYER_TURN');
            turnStateRef.current = 'PLAYER_TURN';
            setGameStatus('playing');
            isMoveLockedRef.current = false;
            updateMandatoryCaptureStatus(boardRef.current);
          }
        });
      };

      executeComputerAnimation();
    },
    [handleGameEnd, updateMandatoryCaptureStatus]
  );

  /**
   * Initializes or resets a match at the specified level (1 to 40)
   */
  const startMatch = useCallback(
    (targetLevel: number) => {
      const validLevel = Math.max(1, Math.min(40, targetLevel));

      turnSeqRef.current++;
      isMoveLockedRef.current = false;
      consecutiveNonCapturesRef.current = 0;
      invalidMovesCountRef.current = 0;
      tacticalStreakRef.current = 0;
      moveTimestampsRef.current = [Date.now()];
      lastPlayerActionTimeRef.current = Date.now();

      const newBoard = createInitialBoard();
      setBoard(newBoard);
      boardRef.current = newBoard;
      setCurrentLevel(validLevel);
      currentLevelRef.current = validLevel;

      setTurn('player');
      setTurnState('PLAYER_TURN');
      turnStateRef.current = 'PLAYER_TURN';
      setGameStatus('playing');

      setSelectedPiece(null);
      selectedPieceRef.current = null;
      setActiveLegalMoves([]);
      activeLegalMovesRef.current = [];
      setMatchDuration(0);
      setActiveBreakdown(null);
      setUnlockedNewLevel(false);

      const initialStats: MatchStats = {
        playerPiecesCaptured: 0,
        computerPiecesCaptured: 0,
        playerKingsCreated: 0,
        computerKingsCreated: 0,
        movesPlayed: 0,
        matchDurationSeconds: 0,
        invalidMoveAttempts: 0,
        tacticalCapturesSequence: 0,
        avgMoveTimeSeconds: 0,
        bestMoveTimeSeconds: 0,
      };
      setStats(initialStats);
      statsRef.current = initialStats;

      if (rendererRef.current) {
        rendererRef.current.syncBoardState(newBoard);
        rendererRef.current.clearHighlights();
      }

      updateMandatoryCaptureStatus(newBoard);
      setView('GAMEPLAY');
    },
    [updateMandatoryCaptureStatus]
  );

  /**
   * Callback: Player taps on a piece
   */
  const handlePieceSelected = useCallback((piece: Piece) => {
    if (
      turnStateRef.current !== 'PLAYER_TURN' ||
      isMoveLockedRef.current ||
      rendererRef.current?.isAnimating
    ) {
      return;
    }

    if (piece.color !== 'white') {
      return;
    }

    const legalMoves = getLegalMovesForPiece(boardRef.current, piece.row, piece.col);

    if (legalMoves.length === 0) {
      damaAudio.playButtonClick();
      return;
    }

    damaAudio.playPieceSelect();
    setSelectedPiece(piece);
    selectedPieceRef.current = piece;
    setActiveLegalMoves(legalMoves);
    activeLegalMovesRef.current = legalMoves;

    if (rendererRef.current) {
      rendererRef.current.setSelectedPiece(piece, legalMoves);
    }
  }, []);

  /**
   * Callback: Player taps on a destination square
   */
  const handleSquareClicked = useCallback(
    (row: number, col: number) => {
      if (
        turnStateRef.current !== 'PLAYER_TURN' ||
        isMoveLockedRef.current ||
        rendererRef.current?.isAnimating
      ) {
        return;
      }

      const activePiece = selectedPieceRef.current;
      if (!activePiece) return;

      const legalMoves = activeLegalMovesRef.current;

      const chosenMove = legalMoves.find(
        (m) =>
          (m.toRow === row && m.toCol === col) ||
          m.path.some((step) => step.toRow === row && step.toCol === col)
      );

      if (!chosenMove) {
        // Tapped outside legal destinations -> mark mistake and clear active selection
        invalidMovesCountRef.current++;
        setSelectedPiece(null);
        selectedPieceRef.current = null;
        setActiveLegalMoves([]);
        activeLegalMovesRef.current = [];
        if (rendererRef.current) {
          rendererRef.current.clearHighlights();
        }
        return;
      }

      // Record move timestamp
      moveTimestampsRef.current.push(Date.now());
      if (chosenMove.isCapture) {
        tacticalStreakRef.current++;
      }

      // ATOMIC MOVE LOCK: Lock input immediately
      isMoveLockedRef.current = true;
      setTurnState('PLAYER_MOVING');
      turnStateRef.current = 'PLAYER_MOVING';
      setGameStatus('animating');

      setSelectedPiece(null);
      selectedPieceRef.current = null;
      setActiveLegalMoves([]);
      activeLegalMovesRef.current = [];

      const currentSeq = ++turnSeqRef.current;

      if (rendererRef.current) {
        rendererRef.current.animateMove(chosenMove, () => {
          if (currentSeq !== turnSeqRef.current) return;

          try {
            const { newBoard, newlyPromoted } = applyDamaMove(boardRef.current, chosenMove);
            setBoard(newBoard);
            boardRef.current = newBoard;

            if (rendererRef.current) {
              rendererRef.current.syncBoardState(newBoard);
            }

            const newStats: MatchStats = {
              ...statsRef.current,
              computerPiecesCaptured:
                statsRef.current.computerPiecesCaptured + chosenMove.capturedPieces.length,
              playerKingsCreated: statsRef.current.playerKingsCreated + (newlyPromoted ? 1 : 0),
              movesPlayed: statsRef.current.movesPlayed + 1,
            };
            setStats(newStats);
            statsRef.current = newStats;

            if (chosenMove.isCapture) {
              consecutiveNonCapturesRef.current = 0;
            } else {
              consecutiveNonCapturesRef.current += 1;
            }

            // Check if player's move ended the game
            const outcome = evaluateGameOutcome(
              newBoard,
              'black',
              consecutiveNonCapturesRef.current
            );

            if (outcome.isOver) {
              handleGameEnd(
                outcome.winner === 'white'
                  ? 'player_won'
                  : outcome.winner === 'black'
                  ? 'computer_won'
                  : 'draw',
                newStats
              );
              return;
            }

            // Transition to COMPUTER_THINKING
            setTurn('computer');
            setTurnState('COMPUTER_THINKING');
            turnStateRef.current = 'COMPUTER_THINKING';
            setGameStatus('computer_thinking');
            isMoveLockedRef.current = false;

            // Trigger computer response
            runComputerTurn(newBoard, newStats, currentSeq);
          } catch (err) {
            console.error('Error executing player move:', err);
            isMoveLockedRef.current = false;
            setTurnState('PLAYER_TURN');
            turnStateRef.current = 'PLAYER_TURN';
            setGameStatus('playing');
          }
        });
      } else {
        isMoveLockedRef.current = false;
        setTurnState('PLAYER_TURN');
        turnStateRef.current = 'PLAYER_TURN';
        setGameStatus('playing');
      }
    },
    [handleGameEnd, runComputerTurn]
  );

  // Stable callback bridge for Three.js 3D renderer
  const callbacksRef = useRef({
    onPieceSelected: handlePieceSelected,
    onSquareClicked: handleSquareClicked,
  });
  callbacksRef.current = {
    onPieceSelected: handlePieceSelected,
    onSquareClicked: handleSquareClicked,
  };

  /**
   * Mount Three.js 3D scene when entering GAMEPLAY view
   */
  useEffect(() => {
    if (view !== 'GAMEPLAY' || !containerRef.current) return;

    const renderer = new Dama3DRenderer(containerRef.current, {
      onPieceSelected: (piece) => callbacksRef.current.onPieceSelected(piece),
      onSquareClicked: (row, col) => callbacksRef.current.onSquareClicked(row, col),
      onAnimationComplete: () => {},
    });

    rendererRef.current = renderer;
    renderer.syncBoardState(boardRef.current);
    updateMandatoryCaptureStatus(boardRef.current);

    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [view, updateMandatoryCaptureStatus]);

  // Handle audio toggle
  const handleToggleAudio = () => {
    const updated: DamaProgress = {
      ...progress,
      settings: {
        ...progress.settings,
        isAudioMuted: !progress.settings.isAudioMuted,
      },
    };
    setProgress(updated);
    progressRef.current = updated;
    saveDamaProgress(updated);
  };

  // Handle reset progress
  const handleResetProgress = () => {
    const fresh = resetDamaProgress();
    setProgress(fresh);
    progressRef.current = fresh;
    setCurrentLevel(1);
    currentLevelRef.current = 1;
  };

  const pieceTotals = countPieces(board);
  const currentLevelConfig = getLevelConfig(currentLevel);

  // -------------------------------------------------------------
  // VIEW ROUTING
  // -------------------------------------------------------------

  if (view === 'MENU') {
    return (
      <DamaMenu
        progress={progress}
        onPlay={() => {
          // Continue at highest unlocked level (capped at 40)
          const target = Math.min(40, progress.highestUnlockedLevel || 1);
          startMatch(target);
        }}
        onStartLevel={(lvl) => {
          startMatch(lvl);
        }}
        onNavigate={(navView) => {
          if (navView === 'LEVEL_SELECT') setView('LEVEL_SELECT');
          else if (navView === 'LEADERBOARD') setView('LEADERBOARD');
          else if (navView === 'HOW_TO_PLAY') setView('HOW_TO_PLAY');
          else if (navView === 'ACHIEVEMENTS') setView('ACHIEVEMENTS');
          else if (navView === 'STATISTICS') setView('STATISTICS');
          else if (navView === 'SETTINGS') setView('SETTINGS');
          else if (navView === 'ABOUT') setView('ABOUT');
          else if (navView === 'GAMEPLAY') {
            const target = Math.min(40, progress.highestUnlockedLevel || 1);
            startMatch(target);
          }
        }}
        onLevels={() => setView('LEVEL_SELECT')}
        onLeaderboard={() => setView('LEADERBOARD')}
        onHowToPlay={() => setView('HOW_TO_PLAY')}
        onAchievements={() => setView('ACHIEVEMENTS')}
        onStatistics={() => setView('STATISTICS')}
        onSettings={() => setView('SETTINGS')}
        onAbout={() => setView('ABOUT')}
        onExit={onExit}
      />
    );
  }

  if (view === 'LEVEL_SELECT') {
    return (
      <DamaLevelSelect
        progress={progress}
        currentLevel={currentLevel}
        onSelectLevel={(lvl) => {
          startMatch(lvl);
        }}
        onBack={() => setView('MENU')}
      />
    );
  }

  if (view === 'LEADERBOARD') {
    return (
      <DamaLeaderboard
        progress={progress}
        profile={profile}
        onBack={() => setView('MENU')}
      />
    );
  }

  if (view === 'HOW_TO_PLAY') {
    return <DamaHowToPlay onBack={() => setView('MENU')} />;
  }

  if (view === 'ACHIEVEMENTS') {
    return <DamaAchievements progress={progress} onBack={() => setView('MENU')} />;
  }

  if (view === 'STATISTICS') {
    return <DamaStatistics progress={progress} onBack={() => setView('MENU')} />;
  }

  if (view === 'SETTINGS') {
    return (
      <DamaSettings
        progress={progress}
        onToggleAudio={handleToggleAudio}
        onResetProgress={handleResetProgress}
        onBack={() => setView('MENU')}
      />
    );
  }

  if (view === 'ABOUT') {
    return <DamaAbout onBack={() => setView('MENU')} />;
  }

  // GAMEPLAY VIEW
  return (
    <div
      id="dama-game-root"
      className="relative w-full h-[90vh] max-h-[860px] bg-[#150d07] text-amber-100 flex flex-col select-none overflow-hidden font-sans rounded-2xl shadow-2xl border border-amber-950/60"
    >
      {/* 1. TOP GAMEPLAY BAR (Natural Wood Header) */}
      <header
        id="dama-header"
        className="relative z-20 flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-b from-[#3d2616] via-[#2f1c0f] to-[#25150c]/90 border-b border-amber-700/40 shadow-lg backdrop-blur-md"
      >
        {/* Left: Exit/Menu & Level Selector */}
        <div className="flex items-center gap-2">
          <button
            id="dama-btn-exit"
            onClick={() => {
              damaAudio.playButtonClick();
              setView('LEVEL_SELECT');
            }}
            className="w-9 h-9 rounded-xl bg-[#4a2e1c] hover:bg-[#5a3822] active:scale-95 border border-amber-600/40 flex items-center justify-center text-amber-200 transition-transform shadow cursor-pointer"
            title="Return to Levels"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Level Selector Button (Level 1 to 40) */}
          <button
            id="dama-btn-level-select"
            onClick={() => {
              damaAudio.playButtonClick();
              setView('LEVEL_SELECT');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#52331f] hover:bg-[#633e25] border border-amber-500/50 text-amber-100 active:scale-95 transition-all shadow cursor-pointer"
            title="Select Level (1 - 40)"
          >
            <Grid className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-200">
              LVL {currentLevel}
            </span>
          </button>
        </div>

        {/* Center: Piece Scoreboard (Computer VS Player) */}
        <div className="flex items-center gap-2.5 bg-[#1e1109]/80 px-3 py-1 rounded-xl border border-amber-700/50 shadow-inner text-xs">
          {/* Player White Pieces */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#fbf7ee] border border-amber-300 shadow-sm" />
            <span className="font-black text-white">{pieceTotals.whiteCount}</span>
            {pieceTotals.whiteKings > 0 && (
              <span className="text-[10px] text-yellow-400 flex items-center">
                <Crown className="w-3 h-3 inline" /> {pieceTotals.whiteKings}
              </span>
            )}
          </div>

          <span className="text-amber-500/60 font-black text-[10px]">VS</span>

          {/* Computer Black Pieces */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#1b100a] border border-amber-600 shadow-sm" />
            <span className="font-bold text-amber-300">{pieceTotals.blackCount}</span>
            {pieceTotals.blackKings > 0 && (
              <span className="text-[10px] text-yellow-500 flex items-center">
                <Crown className="w-3 h-3 inline" /> {pieceTotals.blackKings}
              </span>
            )}
          </div>
        </div>

        {/* Right: Controls (Restart, Sound, Help) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              damaAudio.playButtonClick();
              setView('HOW_TO_PLAY');
            }}
            className="w-8 h-8 rounded-lg bg-[#4a2e1c] hover:bg-[#5a3822] active:scale-95 border border-amber-700/50 flex items-center justify-center text-amber-300 cursor-pointer"
            title="Rules & How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              damaAudio.playButtonClick();
              startMatch(currentLevel);
            }}
            className="w-8 h-8 rounded-lg bg-[#4a2e1c] hover:bg-[#5a3822] active:scale-95 border border-amber-700/50 flex items-center justify-center text-amber-300 cursor-pointer"
            title="Restart Level"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            id="dama-btn-sound"
            onClick={handleToggleAudio}
            className="w-8 h-8 rounded-lg bg-[#4a2e1c] hover:bg-[#5a3822] active:scale-95 border border-amber-700/50 flex items-center justify-center text-amber-300 cursor-pointer"
            title={!progress.settings.isAudioMuted ? 'Mute' : 'Unmute'}
          >
            {!progress.settings.isAudioMuted ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-amber-600" />
            )}
          </button>
        </div>
      </header>

      {/* 2. TURN & STATUS BAR */}
      <div
        id="dama-status-bar"
        className="relative z-10 px-4 py-1.5 flex items-center justify-between bg-[#24150c]/80 border-b border-amber-900/40 text-xs backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          {turnState === 'PLAYER_TURN' ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
              <span>Your Turn (White) — Tap piece, then tap destination</span>
            </div>
          ) : turnState === 'PLAYER_MOVING' ? (
            <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shadow-sm shadow-emerald-400/50" />
              <span>Moving...</span>
            </div>
          ) : turnState === 'COMPUTER_MOVING' ? (
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shadow-sm shadow-amber-400/50" />
              <span>Computer Moving ({currentLevelConfig.name})...</span>
            </div>
          ) : turnState === 'COMPUTER_THINKING' ? (
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shadow-sm shadow-amber-400/50" />
              <span>Computer Thinking ({currentLevelConfig.name})...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-200/80 font-medium">
              <span>Match Ended</span>
            </div>
          )}
        </div>

        {/* Mandatory capture alert */}
        {hasMandatoryCapture && turnState === 'PLAYER_TURN' && (
          <div className="flex items-center gap-1 text-rose-400 font-bold text-[11px] animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 inline" />
            <span>Mandatory jump required!</span>
          </div>
        )}
      </div>

      {/* 3. MAIN 3D WOODEN TABLE & DRAUGHTS BOARD CANVAS */}
      <div
        id="dama-3d-canvas-container"
        ref={containerRef}
        className="relative flex-1 w-full h-full overflow-hidden cursor-pointer touch-none"
      />

      {/* 4. RESULT MODAL OVERLAY */}
      {activeBreakdown && (
        <DamaResultModal
          breakdown={activeBreakdown}
          unlockedNewLevel={unlockedNewLevel}
          onNextLevel={() => {
            startMatch(currentLevel + 1);
          }}
          onRetry={() => {
            startMatch(currentLevel);
          }}
          onLevels={() => {
            setActiveBreakdown(null);
            setView('LEVEL_SELECT');
          }}
          onMenu={() => {
            setActiveBreakdown(null);
            setView('MENU');
          }}
        />
      )}
    </div>
  );
};
