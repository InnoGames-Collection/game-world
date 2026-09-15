/**
 * Solitaire Main Game Component (Klondike Solitaire)
 * 40 progressive levels, Draw 1 / Draw 3 modes, daily challenge,
 * procedural Web Audio sound design, authentic playing card artwork,
 * responsive felt board layout, top HUD controls, bottom stats bar, and slide menu.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  Suit,
  GameMode,
  MoveHistoryItem,
  SolitaireSaveData,
} from './types';
import {
  dealInitialBoard,
  canMoveToFoundation,
  canMoveToTableau,
  canMoveSubstackToTableau,
  findBestAutoMove,
  isGameWon,
  canAutoComplete,
  hasAnyLegalMoves,
} from './solitaireLogic';
import { getSolitaireLevelConfig } from './levelBank';
import { soundManager } from './audioEngine';
import { SolitaireStorage } from './storage';
import {
  CardGraphic,
  CardBack,
  FoundationSlot,
  EmptyTableauSlot,
  EmptyStockSlot,
} from './cardRenderer';
import { TopHUD } from './components/TopHUD';
import { BottomInfoBar } from './components/BottomInfoBar';
import { SideMenu } from './components/SideMenu';
import { OpeningScreen } from './components/OpeningScreen';
import { LevelSelectScreen } from './components/LevelSelectScreen';
import { GameModeModal } from './components/GameModeModal';
import { GameLeaderboardModal, GameLeaderboardService, GAME_CONFIGS } from '../../components/gameNavigation';
import {
  PauseModal,
  RestartConfirmModal,
  WinModal,
  FailModal,
  HowToPlayModal,
  DailyChallengeModal,
} from './components/Modals';

interface SolitaireGameProps {
  onExit?: () => void;
}

type ScreenView = 'opening' | 'playing' | 'level_select';

export const SolitaireGame: React.FC<SolitaireGameProps> = ({ onExit }) => {
  // Persistence State
  const [saveData, setSaveData] = useState<SolitaireSaveData>(() => SolitaireStorage.load());

  // Screen View Management
  const [screenView, setScreenView] = useState<ScreenView>('opening');

  // Game Configuration & Mode
  const [currentLevel, setCurrentLevel] = useState<number>(() => saveData.highestUnlockedLevel);
  const [gameMode, setGameMode] = useState<GameMode>('draw1');
  const [isDailyChallenge, setIsDailyChallenge] = useState<boolean>(false);

  // Solitaire Board State
  const [tableau, setTableau] = useState<Card[][]>([[], [], [], [], [], [], []]);
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [foundations, setFoundations] = useState<Card[][]>([[], [], [], []]);

  // Game Stats & Session
  const [score, setScore] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [timeSeconds, setTimeSeconds] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(1000);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isDeadlocked, setIsDeadlocked] = useState<boolean>(false);

  // User Interaction State
  const [selectedCard, setSelectedCard] = useState<{
    source: 'tableau' | 'waste';
    colIndex?: number;
    cardIndex?: number;
    card: Card;
  } | null>(null);
  const [hintCards, setHintCards] = useState<{ sourceId: string; targetId?: string } | null>(null);

  // Move History for Undo
  const [history, setHistory] = useState<MoveHistoryItem[]>([]);

  // Modals Visibility
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const [isModeModalOpen, setIsModeModalOpen] = useState<boolean>(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState<boolean>(false);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Audio & Layout Preferences
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => saveData.soundEnabled);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => saveData.musicEnabled);
  const [handMode, setHandMode] = useState<'left' | 'right'>(() => saveData.handMode);

  // Timer Ref
  const timerRef = useRef<number | null>(null);

  // Sync sound manager settings on change
  useEffect(() => {
    soundManager.setSoundEnabled(soundEnabled);
    const updated = { ...saveData, soundEnabled };
    SolitaireStorage.save(updated);
  }, [soundEnabled]);

  useEffect(() => {
    soundManager.setMusicEnabled(musicEnabled);
    const updated = { ...saveData, musicEnabled };
    SolitaireStorage.save(updated);
  }, [musicEnabled]);

  // Start Level with Seed
  const startLevel = useCallback(
    (lvl: number, overrideMode?: GameMode, isDaily: boolean = false) => {
      const config = getSolitaireLevelConfig(lvl);
      const chosenMode = overrideMode || config.mode;
      const seed = isDaily ? new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate() : config.seed;

      const board = dealInitialBoard(seed);
      setTableau(board.tableau);
      setStock(board.stock);
      setWaste(board.waste);
      setFoundations(board.foundations);

      setCurrentLevel(lvl);
      setGameMode(chosenMode);
      setIsDailyChallenge(isDaily);
      setScore(0);
      setMoves(0);
      setTimeSeconds(0);
      setBonus(1000);
      setIsPaused(false);
      setIsWon(false);
      setIsDeadlocked(false);
      setSelectedCard(null);
      setHintCards(null);
      setHistory([]);
      setScreenView('playing');

      soundManager.playShuffle();
      if (musicEnabled) {
        soundManager.startAmbientMusic();
      }
    },
    [musicEnabled]
  );

  // Timer loop
  useEffect(() => {
    if (screenView === 'playing' && !isPaused && !isWon && !isDeadlocked) {
      timerRef.current = window.setInterval(() => {
        setTimeSeconds((prev) => {
          const next = prev + 1;
          // Dynamically adjust bonus
          setBonus((b) => Math.max(0, 1000 - next * 2 - moves * 3));
          return next;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screenView, isPaused, isWon, isDeadlocked, moves]);

  // Record History Snapshot before a mutating move
  const pushHistorySnapshot = (desc: string) => {
    setHistory((prev) => [
      ...prev,
      {
        tableau: tableau.map((col) => col.map((c) => ({ ...c }))),
        stock: stock.map((c) => ({ ...c })),
        waste: waste.map((c) => ({ ...c })),
        foundations: foundations.map((f) => f.map((c) => ({ ...c }))),
        score,
        moves,
        description: desc,
      },
    ]);
  };

  // Check Victory Condition & Auto-Complete trigger
  useEffect(() => {
    if (screenView !== 'playing' || isWon) return;

    if (isGameWon(foundations)) {
      setIsWon(true);
      soundManager.playWin();
      const config = getSolitaireLevelConfig(currentLevel);
      const totalPoints = score + bonus;
      let stars = 1;
      if (totalPoints >= config.starThresholds[2]) stars = 3;
      else if (totalPoints >= config.starThresholds[1]) stars = 2;

      const { nextUnlocked } = SolitaireStorage.completeLevel(currentLevel, totalPoints, timeSeconds, stars);
      GameLeaderboardService.recordScore('solitaire', totalPoints, 'Player', currentLevel);
      if (isDailyChallenge) {
        const todayStr = new Date().toISOString().split('T')[0];
        SolitaireStorage.completeDailyChallenge(todayStr, totalPoints);
      }
      setSaveData(SolitaireStorage.load());
      return;
    }

    // Auto-complete opportunistically if all cards are face up and stock/waste empty
    if (canAutoComplete({ tableau, stock, waste, foundations })) {
      const autoTimeout = setTimeout(() => {
        autoStepToFoundation();
      }, 350);
      return () => clearTimeout(autoTimeout);
    }

    // Check Deadlock if no legal moves exist
    const boardState = { tableau, stock, waste, foundations };
    if (!hasAnyLegalMoves(boardState, gameMode)) {
      setIsDeadlocked(true);
      soundManager.playFail();
    }
  }, [foundations, tableau, stock, waste, screenView, isWon]);

  // Auto-complete step (cascades automatically to victory)
  const autoStepToFoundation = () => {
    for (let c = 0; c < 7; c++) {
      const col = tableau[c];
      if (col.length > 0) {
        const top = col[col.length - 1];
        for (let f = 0; f < 4; f++) {
          if (canMoveToFoundation(top, foundations[f])) {
            pushHistorySnapshot('Auto move to foundation');
            const newTableau = tableau.map((colArr, idx) =>
              idx === c ? colArr.slice(0, colArr.length - 1) : colArr
            );
            const newFoundations = foundations.map((fArr, idx) =>
              idx === f ? [...fArr, top] : fArr
            );
            setTableau(newTableau);
            setFoundations(newFoundations);
            setScore((s) => s + 10);
            setMoves((m) => m + 1);
            soundManager.playFoundation(top.rank);
            return;
          }
        }
      }
    }
  };

  // Stock Draw / Recycle Handler
  const handleStockClick = () => {
    if (stock.length > 0) {
      pushHistorySnapshot('Draw from stock');
      const drawCount = gameMode === 'draw3' ? Math.min(3, stock.length) : 1;
      const drawnCards = stock.slice(stock.length - drawCount).map((c) => ({ ...c, isFaceUp: true }));
      const newStock = stock.slice(0, stock.length - drawCount);

      setStock(newStock);
      setWaste([...waste, ...drawnCards]);
      setMoves((m) => m + 1);
      soundManager.playCardPickup();
      setSelectedCard(null);
      setHintCards(null);
    } else if (waste.length > 0) {
      // Recycle waste back to stock
      pushHistorySnapshot('Recycle stock');
      const recycledStock = waste.slice().reverse().map((c) => ({ ...c, isFaceUp: false }));
      setStock(recycledStock);
      setWaste([]);
      setMoves((m) => m + 1);
      soundManager.playShuffle();
      setSelectedCard(null);
      setHintCards(null);
    }
  };

  // Tap on Waste Pile Top Card
  const handleWasteCardClick = () => {
    if (waste.length === 0) return;
    const topCard = waste[waste.length - 1];

    // Check Auto-Move first
    const autoMove = findBestAutoMove(topCard, { type: 'waste' }, { tableau, stock, waste, foundations });
    if (autoMove) {
      pushHistorySnapshot('Auto move from waste');
      const newWaste = waste.slice(0, waste.length - 1);
      setWaste(newWaste);

      if (autoMove.dest === 'foundation') {
        const newFoundations = foundations.map((f, idx) =>
          idx === autoMove.destIndex ? [...f, topCard] : f
        );
        setFoundations(newFoundations);
        setScore((s) => s + 10);
        soundManager.playFoundation(topCard.rank);
      } else {
        const newTableau = tableau.map((col, idx) =>
          idx === autoMove.destIndex ? [...col, topCard] : col
        );
        setTableau(newTableau);
        setScore((s) => s + 5);
        soundManager.playCardPlace();
      }

      setMoves((m) => m + 1);
      setSelectedCard(null);
      setHintCards(null);
      return;
    }

    // Otherwise toggle selection
    if (selectedCard && selectedCard.source === 'waste') {
      setSelectedCard(null);
    } else {
      soundManager.playCardPickup();
      setSelectedCard({ source: 'waste', card: topCard });
    }
  };

  // Tap on Tableau Card / Substack
  const handleTableauCardClick = (colIndex: number, cardIndex: number) => {
    const col = tableau[colIndex];
    const card = col[cardIndex];

    // If card is face-down: cannot interact directly
    if (!card.isFaceUp) {
      soundManager.playInvalid();
      return;
    }

    // Case 1: Already have a card/substack selected from another pile, try to place onto this column
    if (selectedCard) {
      if (selectedCard.source === 'tableau' && selectedCard.colIndex === colIndex) {
        // Deselect if clicking own column
        setSelectedCard(null);
        return;
      }

      let movingStack: Card[] = [];
      if (selectedCard.source === 'waste') {
        movingStack = [selectedCard.card];
      } else if (selectedCard.source === 'tableau' && selectedCard.colIndex !== undefined && selectedCard.cardIndex !== undefined) {
        movingStack = tableau[selectedCard.colIndex].slice(selectedCard.cardIndex);
      }

      if (movingStack.length > 0 && canMoveSubstackToTableau(movingStack, col)) {
        pushHistorySnapshot('Move to tableau');
        // Remove from source
        if (selectedCard.source === 'waste') {
          setWaste((w) => w.slice(0, w.length - 1));
          setScore((s) => s + 5);
        } else if (selectedCard.colIndex !== undefined && selectedCard.cardIndex !== undefined) {
          const srcColIdx = selectedCard.colIndex;
          const srcCardIdx = selectedCard.cardIndex;
          const updatedSrcCol = tableau[srcColIdx].slice(0, srcCardIdx);
          // Turn new top card face-up if needed
          if (updatedSrcCol.length > 0 && !updatedSrcCol[updatedSrcCol.length - 1].isFaceUp) {
            updatedSrcCol[updatedSrcCol.length - 1].isFaceUp = true;
            soundManager.playCardFlip();
            setScore((s) => s + 5);
          }
          setTableau((t) => t.map((c, i) => (i === srcColIdx ? updatedSrcCol : c)));
        }

        // Append to target column
        setTableau((t) =>
          t.map((c, i) => (i === colIndex ? [...c, ...movingStack] : c))
        );
        setMoves((m) => m + 1);
        soundManager.playCardPlace();
        setSelectedCard(null);
        setHintCards(null);
        return;
      }
    }

    // Case 2: Try Auto-Move for top single card or sequence
    const isTopCard = cardIndex === col.length - 1;
    const autoMove = findBestAutoMove(
      card,
      { type: 'tableau', colIndex, cardIndex },
      { tableau, stock, waste, foundations }
    );

    if (autoMove && (isTopCard || autoMove.dest === 'tableau')) {
      pushHistorySnapshot('Auto move from tableau');
      const substack = col.slice(cardIndex);
      const updatedSrcCol = col.slice(0, cardIndex);

      // Uncover face-down card underneath
      if (updatedSrcCol.length > 0 && !updatedSrcCol[updatedSrcCol.length - 1].isFaceUp) {
        updatedSrcCol[updatedSrcCol.length - 1].isFaceUp = true;
        soundManager.playCardFlip();
        setScore((s) => s + 5);
      }

      if (autoMove.dest === 'foundation' && isTopCard) {
        setTableau((t) => t.map((c, i) => (i === colIndex ? updatedSrcCol : c)));
        setFoundations((f) =>
          f.map((pile, idx) => (idx === autoMove.destIndex ? [...pile, card] : pile))
        );
        setScore((s) => s + 10);
        soundManager.playFoundation(card.rank);
      } else if (autoMove.dest === 'tableau') {
        setTableau((t) =>
          t.map((c, i) => {
            if (i === colIndex) return updatedSrcCol;
            if (i === autoMove.destIndex) return [...c, ...substack];
            return c;
          })
        );
        soundManager.playCardPlace();
      }

      setMoves((m) => m + 1);
      setSelectedCard(null);
      setHintCards(null);
      return;
    }

    // Case 3: Select this substack
    soundManager.playCardPickup();
    setSelectedCard({
      source: 'tableau',
      colIndex,
      cardIndex,
      card,
    });
  };

  // Tap on Empty Tableau Slot
  const handleEmptyTableauClick = (colIndex: number) => {
    if (!selectedCard) return;

    let movingStack: Card[] = [];
    if (selectedCard.source === 'waste') {
      movingStack = [selectedCard.card];
    } else if (selectedCard.source === 'tableau' && selectedCard.colIndex !== undefined && selectedCard.cardIndex !== undefined) {
      movingStack = tableau[selectedCard.colIndex].slice(selectedCard.cardIndex);
    }

    // Empty column accepts King only
    if (movingStack.length > 0 && movingStack[0].rank === 13) {
      pushHistorySnapshot('King to empty column');
      if (selectedCard.source === 'waste') {
        setWaste((w) => w.slice(0, w.length - 1));
      } else if (selectedCard.colIndex !== undefined && selectedCard.cardIndex !== undefined) {
        const srcCol = selectedCard.colIndex;
        const srcIdx = selectedCard.cardIndex;
        const updatedSrc = tableau[srcCol].slice(0, srcIdx);
        if (updatedSrc.length > 0 && !updatedSrc[updatedSrc.length - 1].isFaceUp) {
          updatedSrc[updatedSrc.length - 1].isFaceUp = true;
          soundManager.playCardFlip();
          setScore((s) => s + 5);
        }
        setTableau((t) => t.map((c, i) => (i === srcCol ? updatedSrc : c)));
      }

      setTableau((t) =>
        t.map((c, i) => (i === colIndex ? [...movingStack] : c))
      );
      setMoves((m) => m + 1);
      soundManager.playCardPlace();
      setSelectedCard(null);
      setHintCards(null);
    } else {
      soundManager.playInvalid();
    }
  };

  // Tap on Foundation Pile
  const handleFoundationClick = (fIndex: number) => {
    if (!selectedCard) return;

    // Only single cards can move to foundation
    const isSingleCard =
      selectedCard.source === 'waste' ||
      (selectedCard.source === 'tableau' &&
        selectedCard.colIndex !== undefined &&
        selectedCard.cardIndex !== undefined &&
        selectedCard.cardIndex === tableau[selectedCard.colIndex].length - 1);

    if (!isSingleCard) {
      soundManager.playInvalid();
      return;
    }

    const card = selectedCard.card;
    if (canMoveToFoundation(card, foundations[fIndex])) {
      pushHistorySnapshot('Move to foundation');
      if (selectedCard.source === 'waste') {
        setWaste((w) => w.slice(0, w.length - 1));
      } else if (selectedCard.colIndex !== undefined) {
        const col = selectedCard.colIndex;
        const updatedCol = tableau[col].slice(0, tableau[col].length - 1);
        if (updatedCol.length > 0 && !updatedCol[updatedCol.length - 1].isFaceUp) {
          updatedCol[updatedCol.length - 1].isFaceUp = true;
          soundManager.playCardFlip();
          setScore((s) => s + 5);
        }
        setTableau((t) => t.map((c, i) => (i === col ? updatedCol : c)));
      }

      setFoundations((f) =>
        f.map((pile, idx) => (idx === fIndex ? [...pile, card] : pile))
      );
      setScore((s) => s + 10);
      setMoves((m) => m + 1);
      soundManager.playFoundation(card.rank);
      setSelectedCard(null);
      setHintCards(null);
    } else {
      soundManager.playInvalid();
    }
  };

  // Undo Handler
  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setTableau(last.tableau);
    setStock(last.stock);
    setWaste(last.waste);
    setFoundations(last.foundations);
    setScore(last.score);
    setMoves(last.moves);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setSelectedCard(null);
    setHintCards(null);
    setIsDeadlocked(false);
  };

  // Hint Resolver
  const handleHint = () => {
    // 1. Check waste to foundation or tableau
    if (waste.length > 0) {
      const topWaste = waste[waste.length - 1];
      for (let f = 0; f < 4; f++) {
        if (canMoveToFoundation(topWaste, foundations[f])) {
          setHintCards({ sourceId: topWaste.id, targetId: `foundation_${f}` });
          soundManager.playHint();
          return;
        }
      }
      for (let t = 0; t < 7; t++) {
        if (canMoveToTableau(topWaste, tableau[t])) {
          setHintCards({ sourceId: topWaste.id, targetId: `tableau_${t}` });
          soundManager.playHint();
          return;
        }
      }
    }

    // 2. Check tableau to foundation
    for (let c = 0; c < 7; c++) {
      const col = tableau[c];
      if (col.length > 0) {
        const top = col[col.length - 1];
        if (top.isFaceUp) {
          for (let f = 0; f < 4; f++) {
            if (canMoveToFoundation(top, foundations[f])) {
              setHintCards({ sourceId: top.id, targetId: `foundation_${f}` });
              soundManager.playHint();
              return;
            }
          }
        }
      }
    }

    // 3. Check tableau to tableau
    for (let c = 0; c < 7; c++) {
      const col = tableau[c];
      for (let r = 0; r < col.length; r++) {
        const card = col[r];
        if (card.isFaceUp) {
          const substack = col.slice(r);
          for (let targetC = 0; targetC < 7; targetC++) {
            if (c === targetC) continue;
            if (r === 0 && card.rank === 13 && tableau[targetC].length === 0) continue;
            if (canMoveSubstackToTableau(substack, tableau[targetC])) {
              setHintCards({ sourceId: card.id, targetId: `tableau_${targetC}` });
              soundManager.playHint();
              return;
            }
          }
        }
      }
    }

    // 4. Check stock draw
    if (stock.length > 0 || waste.length > 0) {
      setHintCards({ sourceId: 'stock_pile' });
      soundManager.playHint();
      return;
    }

    soundManager.playInvalid();
  };

  // Exit Portal Handler
  const handleExitPortal = () => {
    soundManager.stopAmbientMusic();
    if (onExit) onExit();
  };

  // Screen View: Opening Title Screen
  if (screenView === 'opening') {
    return (
      <div className="w-full h-full relative">
        <OpeningScreen
          soundEnabled={soundEnabled}
          currentLevel={currentLevel}
          onPlay={() => startLevel(currentLevel)}
          onOpenLevels={() => setScreenView('level_select')}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenDailyChallenge={() => setIsDailyModalOpen(true)}
          onOpenModeSelect={() => setIsModeModalOpen(true)}
          onToggleSound={() => setSoundEnabled((s) => !s)}
          onOpenMenu={() => setIsSideMenuOpen(true)}
          onExitPortal={handleExitPortal}
        />

        <SideMenu
          isOpen={isSideMenuOpen}
          soundEnabled={soundEnabled}
          musicEnabled={musicEnabled}
          handMode={handMode}
          onClose={() => setIsSideMenuOpen(false)}
          onHome={() => setIsSideMenuOpen(false)}
          onRestartGame={() => {
            setIsSideMenuOpen(false);
            startLevel(currentLevel);
          }}
          onNewGame={() => {
            setIsSideMenuOpen(false);
            startLevel(currentLevel);
          }}
          onLeaderboard={() => {
            setIsSideMenuOpen(false);
            setIsLeaderboardOpen(true);
          }}
          onDailyChallenge={() => {
            setIsSideMenuOpen(false);
            setIsDailyModalOpen(true);
          }}
          onHowToPlay={() => {
            setIsSideMenuOpen(false);
            setIsHowToPlayOpen(true);
          }}
          onToggleSound={() => setSoundEnabled((s) => !s)}
          onToggleMusic={() => setMusicEnabled((m) => !m)}
          onToggleHandMode={() => {
            const next = handMode === 'right' ? 'left' : 'right';
            setHandMode(next);
            SolitaireStorage.save({ ...saveData, handMode: next });
          }}
        />

        {isModeModalOpen && (
          <GameModeModal
            currentMode={gameMode}
            onSelectMode={(mode) => {
              setGameMode(mode);
              setIsModeModalOpen(false);
            }}
            onClose={() => setIsModeModalOpen(false)}
          />
        )}

        {isHowToPlayOpen && <HowToPlayModal onClose={() => setIsHowToPlayOpen(false)} />}

        {isDailyModalOpen && (
          <DailyChallengeModal
            completedToday={saveData.completedDailyChallenges.includes(
              new Date().toISOString().split('T')[0]
            )}
            streak={saveData.dailyStreak}
            onClose={() => setIsDailyModalOpen(false)}
            onPlay={() => {
              setIsDailyModalOpen(false);
              startLevel(1, 'draw3', true);
            }}
          />
        )}

        {isLeaderboardOpen && (
          <GameLeaderboardModal
            gameConfig={GAME_CONFIGS['solitaire']}
            onClose={() => setIsLeaderboardOpen(false)}
          />
        )}
      </div>
    );
  }

  // Screen View: 40 Level Selection Screen
  if (screenView === 'level_select') {
    return (
      <LevelSelectScreen
        saveData={saveData}
        onSelectLevel={(lvl) => startLevel(lvl)}
        onBack={() => setScreenView('opening')}
      />
    );
  }

  // SCREEN VIEW: ACTIVE PLAYING BOARD
  const foundationSuits: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
  const isLeftHand = handMode === 'left';

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#004d2a] select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Emerald Green Felt Table Radial Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #007a40 0%, #005a30 50%, #00361d 100%)',
        }}
      />
      {/* Micro-weave felt fabric texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '4px 4px',
        }}
      />

      {/* 1. TOP GAME HUD: [ BACK ] [ SCORE ] [ PAUSE ] [ SOUND ] */}
      <TopHUD
        score={score}
        level={currentLevel}
        soundEnabled={soundEnabled}
        onBack={() => {
          setIsPaused(true);
          setIsPauseModalOpen(true);
        }}
        onPause={() => {
          setIsPaused(true);
          setIsPauseModalOpen(true);
        }}
        onToggleSound={() => setSoundEnabled((s) => !s)}
      />

      {/* 2. MAIN FELT PLAYING BOARD */}
      <div className="relative z-10 flex-1 flex flex-col p-2 sm:p-4 max-w-4xl mx-auto w-full overflow-hidden">
        {/* TOP ROW: STOCK + WASTE (Left or Right) & 4 FOUNDATIONS (Right or Left) */}
        <div className={`w-full flex items-center justify-between mb-3 sm:mb-4 gap-2 ${isLeftHand ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* STOCK & WASTE PILES */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stock Pile */}
            <div
              id="stock_pile"
              onClick={handleStockClick}
              className={`relative w-[48px] sm:w-[68px] h-[68px] sm:h-[96px] cursor-pointer transition-transform active:scale-95 ${
                hintCards?.sourceId === 'stock_pile' ? 'ring-2 ring-amber-400 rounded-md animate-pulse' : ''
              }`}
            >
              {stock.length > 0 ? (
                <div className="relative w-full h-full shadow-md">
                  <CardBack />
                  <div className="absolute -bottom-1 -right-1 px-1 rounded-full bg-black/70 text-[9px] font-mono text-white font-bold">
                    {stock.length}
                  </div>
                </div>
              ) : (
                <EmptyStockSlot canRecycle={waste.length > 0} />
              )}
            </div>

            {/* Waste Pile (shows drawn cards) */}
            <div
              onClick={handleWasteCardClick}
              className="relative w-[48px] sm:w-[68px] h-[68px] sm:h-[96px] cursor-pointer"
            >
              {waste.length > 0 ? (
                <div className="relative w-full h-full shadow-md">
                  {/* Fanned undercard in draw3 mode for authentic aesthetic */}
                  {gameMode === 'draw3' && waste.length > 1 && (
                    <div className="absolute inset-0 -translate-x-1.5 opacity-60 pointer-events-none">
                      <CardGraphic card={waste[waste.length - 2]} />
                    </div>
                  )}
                  <div
                    className={
                      hintCards?.sourceId === waste[waste.length - 1].id
                        ? 'ring-2 ring-amber-400 rounded-md animate-pulse'
                        : ''
                    }
                  >
                    <CardGraphic
                      card={waste[waste.length - 1]}
                      isSelected={selectedCard?.source === 'waste'}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full rounded-md border border-white/15 bg-black/15 flex items-center justify-center pointer-events-none" />
              )}
            </div>
          </div>

          {/* 4 FOUNDATION PILES (Spades, Hearts, Clubs, Diamonds) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {foundationSuits.map((suit, fIdx) => {
              const pile = foundations[fIdx];
              const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
              const isTargetHint = hintCards?.targetId === `foundation_${fIdx}`;

              return (
                <div
                  key={suit}
                  id={`foundation_${fIdx}`}
                  onClick={() => handleFoundationClick(fIdx)}
                  className={`relative w-[48px] sm:w-[68px] h-[68px] sm:h-[96px] cursor-pointer ${
                    isTargetHint ? 'ring-2 ring-amber-400 rounded-md animate-pulse' : ''
                  }`}
                >
                  {topCard ? (
                    <CardGraphic card={topCard} />
                  ) : (
                    <FoundationSlot suit={suit} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7 TABLEAU COLUMNS (Cascading cards) */}
        <div className="w-full flex-1 grid grid-cols-7 gap-1 sm:gap-2 items-start overflow-y-auto pt-1 pb-4">
          {tableau.map((col, cIdx) => {
            const isTargetHint = hintCards?.targetId === `tableau_${cIdx}`;

            return (
              <div
                key={cIdx}
                id={`tableau_${cIdx}`}
                className={`relative min-h-[140px] sm:min-h-[220px] flex flex-col items-center ${
                  isTargetHint ? 'ring-2 ring-amber-400 rounded-md' : ''
                }`}
              >
                {col.length === 0 ? (
                  <div
                    onClick={() => handleEmptyTableauClick(cIdx)}
                    className="w-[48px] sm:w-[68px] h-[68px] sm:h-[96px]"
                  >
                    <EmptyTableauSlot />
                  </div>
                ) : (
                  <div className="relative w-[48px] sm:w-[68px] h-full">
                    {col.map((card, rIdx) => {
                      // Calculate cascading vertical offset: tighter for face-down cards
                      let topOffset = 0;
                      for (let i = 0; i < rIdx; i++) {
                        topOffset += col[i].isFaceUp ? 22 : 12;
                      }

                      const isSelected =
                        selectedCard?.source === 'tableau' &&
                        selectedCard.colIndex === cIdx &&
                        selectedCard.cardIndex !== undefined &&
                        rIdx >= selectedCard.cardIndex;

                      const isSourceHint = hintCards?.sourceId === card.id;

                      return (
                        <div
                          key={card.id}
                          onClick={() => handleTableauCardClick(cIdx, rIdx)}
                          style={{
                            position: 'absolute',
                            top: `${topOffset}px`,
                            left: 0,
                            right: 0,
                            zIndex: rIdx + 1,
                          }}
                          className={`w-[48px] sm:w-[68px] h-[68px] sm:h-[96px] cursor-pointer transition-all ${
                            isSourceHint ? 'ring-2 ring-amber-400 rounded-md animate-pulse' : ''
                          }`}
                        >
                          <CardGraphic card={card} isSelected={isSelected} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BOTTOM INFO BAR: MENU, TIME, BONUS, POINTS, UNDO, HINT, NEXT */}
      <BottomInfoBar
        timeSeconds={timeSeconds}
        bonus={bonus}
        points={score}
        moves={moves}
        canUndo={history.length > 0}
        onOpenMenu={() => setIsSideMenuOpen(true)}
        onUndo={handleUndo}
        onHint={handleHint}
        isNextAvailable={currentLevel < 40 && isWon}
        onNextLevel={() => startLevel(currentLevel + 1)}
      />

      {/* 4. MODALS & DRAWERS */}
      <SideMenu
        isOpen={isSideMenuOpen}
        soundEnabled={soundEnabled}
        musicEnabled={musicEnabled}
        handMode={handMode}
        onClose={() => setIsSideMenuOpen(false)}
        onHome={() => {
          setIsSideMenuOpen(false);
          setScreenView('opening');
        }}
        onRestartGame={() => {
          setIsSideMenuOpen(false);
          setIsRestartModalOpen(true);
        }}
        onNewGame={() => {
          setIsSideMenuOpen(false);
          startLevel(currentLevel);
        }}
        onDailyChallenge={() => {
          setIsSideMenuOpen(false);
          setIsDailyModalOpen(true);
        }}
        onHowToPlay={() => {
          setIsSideMenuOpen(false);
          setIsHowToPlayOpen(true);
        }}
        onToggleSound={() => setSoundEnabled((s) => !s)}
        onToggleMusic={() => setMusicEnabled((m) => !m)}
        onToggleHandMode={() => {
          const next = handMode === 'right' ? 'left' : 'right';
          setHandMode(next);
          SolitaireStorage.save({ ...saveData, handMode: next });
        }}
      />

      {isPauseModalOpen && (
        <PauseModal
          onResume={() => {
            setIsPaused(false);
            setIsPauseModalOpen(false);
          }}
          onRestart={() => {
            setIsPauseModalOpen(false);
            startLevel(currentLevel);
          }}
          onLeaderboard={() => setIsLeaderboardOpen(true)}
          onLevelSelect={() => {
            setIsPauseModalOpen(false);
            setScreenView('level_select');
          }}
          onHome={() => {
            setIsPauseModalOpen(false);
            setScreenView('opening');
          }}
        />
      )}

      {isRestartModalOpen && (
        <RestartConfirmModal
          onCancel={() => setIsRestartModalOpen(false)}
          onConfirm={() => {
            setIsRestartModalOpen(false);
            startLevel(currentLevel);
          }}
        />
      )}

      {isWon && (
        <WinModal
          level={currentLevel}
          score={score}
          timeSeconds={timeSeconds}
          moves={moves}
          bonus={bonus}
          stars={saveData.stars[currentLevel] || 1}
          onNextLevel={() => startLevel(currentLevel + 1)}
          onReplay={() => startLevel(currentLevel)}
          onLevelSelect={() => setScreenView('level_select')}
        />
      )}

      {isDeadlocked && !isWon && (
        <FailModal
          reason="deadlock"
          onUndo={handleUndo}
          onRestart={() => startLevel(currentLevel)}
          onLevelSelect={() => setScreenView('level_select')}
        />
      )}

      {isHowToPlayOpen && <HowToPlayModal onClose={() => setIsHowToPlayOpen(false)} />}

      {isDailyModalOpen && (
        <DailyChallengeModal
          completedToday={saveData.completedDailyChallenges.includes(
            new Date().toISOString().split('T')[0]
          )}
          streak={saveData.dailyStreak}
          onClose={() => setIsDailyModalOpen(false)}
          onPlay={() => {
            setIsDailyModalOpen(false);
            startLevel(1, 'draw3', true);
          }}
        />
      )}

      {isLeaderboardOpen && (
        <GameLeaderboardModal
          gameConfig={GAME_CONFIGS['solitaire']}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      )}
    </div>
  );
};
