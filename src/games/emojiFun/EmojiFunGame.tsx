/**
 * Emoji Fun — Main Game Container
 * Implements complete game loop matching reference video 'emoji.mp4'
 * 40 levels, tournament scoring, audio, hints, lives, leaderboard, store, and settings
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameState, EmojiLevelConfig, EmojiQuestion, PlayerStats, TournamentScoreCalculation } from './types';
import { EMOJI_LEVELS_DATABASE, getQuestionsForLevel } from './questionDatabase';
import { calculateQuestionTournamentScore } from './scoringEngine';
import { tournamentLeaderboardService } from './tournamentLeaderboardService';
import { emojiAudio } from './emojiAudio';

// Subcomponents
import { BackgroundEmojis } from './components/BackgroundEmojis';
import { EmojiFunHeader } from './components/EmojiFunHeader';
import { EmojiFunHome } from './components/EmojiFunHome';
import { EmojiFunLevelInfo } from './components/EmojiFunLevelInfo';
import { EmojiFunPlayView } from './components/EmojiFunPlayView';
import { EmojiFunFeedbackModal } from './components/EmojiFunFeedbackModal';
import { EmojiFunLeaderboardModal } from './components/EmojiFunLeaderboardModal';
import { EmojiFunStoreModal } from './components/EmojiFunStoreModal';
import { EmojiFunSettingsModal } from './components/EmojiFunSettingsModal';
import { EmojiFunHowToPlayModal } from './components/EmojiFunHowToPlayModal';

interface EmojiFunGameProps {
  onExit?: () => void;
}

export const EmojiFunGame: React.FC<EmojiFunGameProps> = ({ onExit }) => {
  // Game lifecycle
  const [gameState, setGameState] = useState<GameState>('HOME');
  const [selectedLevelNumber, setSelectedLevelNumber] = useState<number>(1);

  // Player persistent stats
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() =>
    tournamentLeaderboardService.getPlayerStats()
  );

  // In-level active state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [activeQuestions, setActiveQuestions] = useState<EmojiQuestion[]>([]);
  const [lives, setLives] = useState<number>(3);
  const [levelScore, setLevelScore] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [levelBestCombo, setLevelBestCombo] = useState<number>(0);
  const [levelCorrectCount, setLevelCorrectCount] = useState<number>(0);
  const [levelPerfectCount, setLevelPerfectCount] = useState<number>(0);
  const [levelStartTime, setLevelStartTime] = useState<number>(Date.now());
  const [hintsUsedInQuestion, setHintsUsedInQuestion] = useState<number>(0);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);

  // Feedback modal state
  const [feedbackType, setFeedbackType] = useState<
    'CORRECT' | 'INCORRECT' | 'TIME_OUT' | 'NO_LIVES' | 'LEVEL_CLEAR' | null
  >(null);
  const [lastScoreResult, setLastScoreResult] = useState<TournamentScoreCalculation | undefined>(
    undefined
  );

  // Sub-modals
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showStore, setShowStore] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => emojiAudio.isAudioEnabled());
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => emojiAudio.isMusicEnabled());

  // Current active level configuration
  const currentLevelConfig: EmojiLevelConfig =
    EMOJI_LEVELS_DATABASE[selectedLevelNumber - 1] || EMOJI_LEVELS_DATABASE[0];

  // Refresh stats helper
  const refreshStats = () => {
    setPlayerStats({ ...tournamentLeaderboardService.getPlayerStats() });
  };

  // Start Level logic
  const handleStartLevel = () => {
    const questions = getQuestionsForLevel(selectedLevelNumber);
    setActiveQuestions(questions);
    setCurrentQuestionIndex(0);
    setLives(3);
    setLevelScore(0);
    setComboCount(0);
    setLevelBestCombo(0);
    setLevelCorrectCount(0);
    setLevelPerfectCount(0);
    setLevelStartTime(Date.now());
    setHintsUsedInQuestion(0);
    setEliminatedOptions([]);
    setFeedbackType(null);
    setGameState('PLAYING');
  };

  // Handle Answer Selection
  const handleSelectAnswer = (chosenIndex: number, timeRemainingSeconds: number) => {
    const question = activeQuestions[currentQuestionIndex];
    if (!question) return;

    const isCorrect = chosenIndex === question.correctIndex;

    if (isCorrect) {
      // Correct Answer!
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      if (newCombo > levelBestCombo) {
        setLevelBestCombo(newCombo);
      }
      setLevelCorrectCount((prev) => prev + 1);

      // Calculate tournament score using tournament scoring engine
      const scoreCalc = calculateQuestionTournamentScore({
        question,
        timeRemainingSeconds,
        comboCount: newCombo,
        hintsUsedOnThisQuestion: hintsUsedInQuestion,
        levelMultiplier: currentLevelConfig.scoreMultiplier,
      });

      if (scoreCalc.isPerfect) {
        setLevelPerfectCount((prev) => prev + 1);
        emojiAudio.playPerfect();
      } else {
        emojiAudio.playCorrect();
      }

      setLevelScore((prev) => prev + scoreCalc.totalPointsAwarded);
      setLastScoreResult(scoreCalc);
      setFeedbackType('CORRECT');
    } else {
      // Incorrect Answer!
      emojiAudio.playIncorrect();
      setComboCount(0);
      const remainingLives = lives - 1;
      setLives(remainingLives);

      if (remainingLives <= 0) {
        setFeedbackType('NO_LIVES');
      } else {
        setFeedbackType('INCORRECT');
      }
    }
  };

  // Handle Time Expired on Question
  const handleTimeExpired = () => {
    emojiAudio.playIncorrect();
    setComboCount(0);
    const remainingLives = lives - 1;
    setLives(remainingLives);

    if (remainingLives <= 0) {
      setFeedbackType('NO_LIVES');
    } else {
      setFeedbackType('TIME_OUT');
    }
  };

  // Handle Hint Usage
  const handleUseHint = () => {
    if (playerStats.availableHints <= 0) {
      // Prompt store
      setShowStore(true);
      return;
    }

    const question = activeQuestions[currentQuestionIndex];
    if (!question) return;

    // Find wrong options that haven't been eliminated yet
    const wrongIndices = question.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== question.correctIndex && !eliminatedOptions.includes(idx));

    if (wrongIndices.length === 0) return;

    // Pick 1 or 2 options to eliminate
    const toEliminate = wrongIndices.slice(0, 1);
    const nextEliminated = [...eliminatedOptions, ...toEliminate];
    setEliminatedOptions(nextEliminated);
    setHintsUsedInQuestion((prev) => prev + 1);

    // Consume 1 hint from player stats
    tournamentLeaderboardService.useHint();
    refreshStats();
    emojiAudio.playHint();
  };

  // Advance to next question or complete level
  const handleAdvanceFromFeedback = () => {
    if (feedbackType === 'CORRECT') {
      const nextIdx = currentQuestionIndex + 1;

      if (nextIdx >= activeQuestions.length) {
        // LEVEL CLEAR!
        emojiAudio.playLevelClear();

        // Calculate final stats
        const finalAccuracy = Math.round(
          (levelCorrectCount / activeQuestions.length) * 100
        );
        const coinsWon = currentLevelConfig.rewardCoins || 10;

        // Record completed level in tournament leaderboard service
        tournamentLeaderboardService.recordLevelCompletion(
          selectedLevelNumber,
          levelScore,
          finalAccuracy,
          levelBestCombo,
          coinsWon
        );
        refreshStats();

        setFeedbackType('LEVEL_CLEAR');
      } else {
        // Next question
        setCurrentQuestionIndex(nextIdx);
        setHintsUsedInQuestion(0);
        setEliminatedOptions([]);
        setFeedbackType(null);
      }
    } else if (feedbackType === 'INCORRECT' || feedbackType === 'TIME_OUT') {
      // Continue to next question if lives remain
      const nextIdx = currentQuestionIndex + 1;
      if (nextIdx >= activeQuestions.length) {
        // Ended questions with remaining lives
        const finalAccuracy = Math.round(
          (levelCorrectCount / activeQuestions.length) * 100
        );
        tournamentLeaderboardService.recordLevelCompletion(
          selectedLevelNumber,
          levelScore,
          finalAccuracy,
          levelBestCombo,
          5
        );
        refreshStats();
        setFeedbackType('LEVEL_CLEAR');
      } else {
        setCurrentQuestionIndex(nextIdx);
        setHintsUsedInQuestion(0);
        setEliminatedOptions([]);
        setFeedbackType(null);
      }
    } else if (feedbackType === 'LEVEL_CLEAR') {
      // Proceed to Level Info for next level
      const nextLevel = Math.min(40, selectedLevelNumber + 1);
      setSelectedLevelNumber(nextLevel);
      setFeedbackType(null);
      setGameState('LEVEL_INFO');
    } else if (feedbackType === 'NO_LIVES') {
      setFeedbackType(null);
      setGameState('LEVEL_INFO');
    }
  };

  // Buy Item in Store
  const handleBuyStoreItem = (itemId: string, costCoins: number, itemType: 'HINT' | 'LIFE' | 'THEME') => {
    if (itemType === 'HINT') {
      const hintCount = itemId === 'hint_pack_8' ? 8 : 3;
      tournamentLeaderboardService.addHints(hintCount, costCoins);
    } else if (itemType === 'LIFE') {
      tournamentLeaderboardService.addCoins(-costCoins);
      setLives(3);
    } else {
      tournamentLeaderboardService.addCoins(-costCoins);
    }
    refreshStats();
  };

  // Leaderboard data for previews and modals
  const leaderboardPreview = tournamentLeaderboardService.getLeaderboardPreview();
  const allLeaderboardEntries = tournamentLeaderboardService.getLeaderboard();

  // Elapsed time formatted for level clear
  const totalSecondsSpent = Math.max(1, Math.round((Date.now() - levelStartTime) / 1000));
  const timeFormatted = `00:${String(Math.floor(totalSecondsSpent / 60)).padStart(2, '0')}:${String(
    totalSecondsSpent % 60
  ).padStart(2, '0')}`;

  const currentQuestion = activeQuestions[currentQuestionIndex];

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#fce4ec] via-[#f3e5f5] to-[#e1f5fe] font-sans">
      {/* Dynamic Floating Emojis Background (From Video) */}
      <BackgroundEmojis />

      {/* Top Bar HUD */}
      <EmojiFunHeader
        coins={playerStats.coins}
        lives={lives}
        hints={playerStats.availableHints}
        showLives={gameState === 'PLAYING'}
        showHints={gameState === 'PLAYING'}
        onOpenCoins={() => setShowStore(true)}
        onOpenSettings={() => setShowSettings(true)}
        onUseHint={gameState === 'PLAYING' ? handleUseHint : undefined}
        onBack={
          gameState === 'LEVEL_INFO'
            ? () => setGameState('HOME')
            : gameState === 'PLAYING'
            ? () => setGameState('LEVEL_INFO')
            : undefined
        }
        onExit={gameState === 'HOME' ? onExit : undefined}
      />

      {/* VIEW 1: HOME SCREEN */}
      {gameState === 'HOME' && (
        <EmojiFunHome
          totalScore={playerStats.totalTournamentScore}
          currentLevel={playerStats.unlockedLevel}
          onPlay={() => {
            setSelectedLevelNumber(playerStats.unlockedLevel);
            setGameState('LEVEL_INFO');
          }}
          onLeaderboard={() => setShowLeaderboard(true)}
          onStore={() => setShowStore(true)}
          onSettings={() => setShowSettings(true)}
          onHowToPlay={() => setShowHowToPlay(true)}
        />
      )}

      {/* VIEW 2: BEFORE GAME — LEVEL INFORMATION MENU (Section 4) */}
      {gameState === 'LEVEL_INFO' && (
        <EmojiFunLevelInfo
          levelConfig={currentLevelConfig}
          playerStats={playerStats}
          leaderboardPreview={leaderboardPreview}
          onSelectLevel={(lvl) => setSelectedLevelNumber(lvl)}
          onStartLevel={handleStartLevel}
          onOpenFullLeaderboard={() => setShowLeaderboard(true)}
          onBack={() => setGameState('HOME')}
        />
      )}

      {/* VIEW 3: ACTIVE GAMEPLAY VIEW */}
      {gameState === 'PLAYING' && currentQuestion && (
        <EmojiFunPlayView
          question={currentQuestion}
          levelConfig={currentLevelConfig}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={activeQuestions.length}
          levelScore={levelScore}
          comboCount={comboCount}
          hintsUsedOnCurrentQuestion={hintsUsedInQuestion}
          eliminatedOptionIndices={eliminatedOptions}
          onSelectAnswer={handleSelectAnswer}
          onTimeExpired={handleTimeExpired}
        />
      )}

      {/* FEEDBACK & LEVEL CLEAR MODAL */}
      {feedbackType && (
        <EmojiFunFeedbackModal
          type={feedbackType}
          scoreResult={lastScoreResult}
          correctAnswerText={
            feedbackType === 'INCORRECT' || feedbackType === 'TIME_OUT'
              ? currentQuestion?.options[currentQuestion?.correctIndex]
              : undefined
          }
          coinsEarned={currentLevelConfig.rewardCoins || 10}
          timeSpentFormatted={timeFormatted}
          accuracyPercent={
            activeQuestions.length > 0
              ? Math.round((levelCorrectCount / activeQuestions.length) * 100)
              : 100
          }
          levelScore={levelScore}
          totalTournamentScore={playerStats.totalTournamentScore}
          perfectCount={levelPerfectCount}
          bestCombo={levelBestCombo}
          hintsUsed={hintsUsedInQuestion}
          userRank={leaderboardPreview.userRank}
          onContinue={handleAdvanceFromFeedback}
          onRetry={handleStartLevel}
          onLeaderboard={() => {
            setFeedbackType(null);
            setShowLeaderboard(true);
          }}
          onClose={
            feedbackType === 'NO_LIVES'
              ? () => {
                  setFeedbackType(null);
                  setGameState('LEVEL_INFO');
                }
              : undefined
          }
        />
      )}

      {/* LEADERBOARD MODAL */}
      {showLeaderboard && (
        <EmojiFunLeaderboardModal
          entries={allLeaderboardEntries}
          userRank={leaderboardPreview.userRank}
          userScore={playerStats.totalTournamentScore}
          nextPlayerScore={leaderboardPreview.nextPlayerScore}
          pointsToNextRank={leaderboardPreview.pointsToNextRank}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* STORE MODAL */}
      {showStore && (
        <EmojiFunStoreModal
          coins={playerStats.coins}
          availableHints={playerStats.availableHints}
          onBuyItem={handleBuyStoreItem}
          onClose={() => setShowStore(false)}
        />
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <EmojiFunSettingsModal
          soundEnabled={soundEnabled}
          musicEnabled={musicEnabled}
          onToggleSound={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            emojiAudio.setAudioEnabled(next);
          }}
          onToggleMusic={() => {
            const next = !musicEnabled;
            setMusicEnabled(next);
            emojiAudio.setMusicEnabled(next);
          }}
          onHowToPlay={() => {
            setShowSettings(false);
            setShowHowToPlay(true);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && (
        <EmojiFunHowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
};
