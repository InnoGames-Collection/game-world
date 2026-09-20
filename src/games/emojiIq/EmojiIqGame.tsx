/**
 * EMOJI IQ — Main Game Container
 * Professional 40-Stage Tournament Emoji + Number Math Puzzle Game
 * Strictly follows the mandatory color palette and reference video presentation.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { EmojiIqScreen, EmojiIqPlayerStats, TournamentScoreCalculation } from './types';
import { EMOJI_IQ_LEVELS, getQuestionsForLevel } from './questionDatabase';
import { calculateIqTournamentScore } from './scoringEngine';
import { EmojiIqLeaderboardService } from './tournamentLeaderboardService';
import { EMOJI_IQ_COLORS } from './colors';
import { emojiIqAudio } from './emojiIqAudio';

import { EmojiIqHeader } from './components/EmojiIqHeader';
import { EmojiIqHome } from './components/EmojiIqHome';
import { EmojiIqLevelSelect } from './components/EmojiIqLevelSelect';
import { EmojiIqLevelInfo } from './components/EmojiIqLevelInfo';
import { EmojiIqPlayView } from './components/EmojiIqPlayView';
import { EmojiIqFeedbackModal, FeedbackType } from './components/EmojiIqFeedbackModal';
import { EmojiIqLeaderboardModal } from './components/EmojiIqLeaderboardModal';
import { EmojiIqStoreModal } from './components/EmojiIqStoreModal';
import { EmojiIqSettingsModal } from './components/EmojiIqSettingsModal';
import { EmojiIqHowToPlayModal } from './components/EmojiIqHowToPlayModal';

interface EmojiIqGameProps {
  onClose?: () => void;
  onGameCompleted?: (score: number) => void;
}

export const EmojiIqGame: React.FC<EmojiIqGameProps> = ({ onClose, onGameCompleted }) => {
  // Navigation & Screen Lifecycle
  const [screen, setScreen] = useState<EmojiIqScreen>('HOME');
  const [selectedLevelNumber, setSelectedLevelNumber] = useState<number>(1);

  // Modals Visibility
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showStore, setShowStore] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);

  // Player Stats (Persistent)
  const [playerStats, setPlayerStats] = useState<EmojiIqPlayerStats>(() =>
    EmojiIqLeaderboardService.loadPlayerStats()
  );

  const refreshStats = useCallback(() => {
    setPlayerStats(EmojiIqLeaderboardService.loadPlayerStats());
  }, []);

  // Active Level State
  const currentLevelConfig = EMOJI_IQ_LEVELS[selectedLevelNumber - 1] || EMOJI_IQ_LEVELS[0];
  const activeQuestions = getQuestionsForLevel(selectedLevelNumber);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Runtime In-Level Scoring State
  const [levelScore, setLevelScore] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [levelBestCombo, setLevelBestCombo] = useState<number>(0);
  const [levelCorrectCount, setLevelCorrectCount] = useState<number>(0);
  const [levelPerfectCount, setLevelPerfectCount] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [hintsUsedInQuestion, setHintsUsedInQuestion] = useState<number>(0);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [lastScoreCalc, setLastScoreCalc] = useState<TournamentScoreCalculation | null>(null);

  // Initialize questions on level start
  const startLevel = useCallback((levelNum: number) => {
    setSelectedLevelNumber(levelNum);
    setCurrentQuestionIndex(0);
    setLevelScore(0);
    setComboCount(0);
    setLevelBestCombo(0);
    setLevelCorrectCount(0);
    setLevelPerfectCount(0);
    setLives(3);
    setHintsUsedInQuestion(0);
    setEliminatedOptions([]);
    setFeedbackType(null);
    setScreen('PLAYING');
  }, []);

  // Handle User Answer Selection
  const handleSelectAnswer = (optionIndex: number, timeRemainingSeconds: number) => {
    const question = activeQuestions[currentQuestionIndex];
    if (!question) return;

    const isCorrect = optionIndex === question.correctIndex;

    const calc = calculateIqTournamentScore({
      isCorrect,
      basePoints: question.basePoints,
      timeRemainingSeconds,
      totalTimeSeconds: question.timeLimitSeconds,
      currentCombo: comboCount,
      hintsUsedOnQuestion: hintsUsedInQuestion,
      difficulty: question.difficulty,
    });

    setLastScoreCalc(calc);

    if (isCorrect) {
      if (calc.isPerfect) {
        emojiIqAudio.playPerfect();
      } else {
        emojiIqAudio.playCorrect();
      }

      const nextCombo = comboCount + 1;
      setComboCount(nextCombo);
      if (nextCombo > levelBestCombo) {
        setLevelBestCombo(nextCombo);
      }
      if (nextCombo >= 2) {
        emojiIqAudio.playCombo(nextCombo);
      }

      setLevelScore((prev) => prev + calc.totalPointsAwarded);
      setLevelCorrectCount((prev) => prev + 1);
      if (calc.isPerfect) {
        setLevelPerfectCount((prev) => prev + 1);
      }

      setFeedbackType('CORRECT');
    } else {
      emojiIqAudio.playIncorrect();
      setComboCount(0);
      const remaining = lives - 1;
      setLives(remaining);

      if (remaining <= 0) {
        setFeedbackType('NO_LIVES');
      } else {
        setFeedbackType('INCORRECT');
      }
    }
  };

  // Handle Time Expired on Question
  const handleTimeExpired = () => {
    emojiIqAudio.playIncorrect();
    setComboCount(0);
    const remaining = lives - 1;
    setLives(remaining);

    if (remaining <= 0) {
      setFeedbackType('NO_LIVES');
    } else {
      setFeedbackType('TIME_OUT');
    }
  };

  // Handle Hint Usage
  const handleUseHint = () => {
    if (playerStats.availableHints <= 0) {
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

    // Eliminate 1 wrong option
    const toEliminate = wrongIndices.slice(0, 1);
    setEliminatedOptions((prev) => [...prev, ...toEliminate]);
    setHintsUsedInQuestion((prev) => prev + 1);

    EmojiIqLeaderboardService.useHint();
    refreshStats();
    emojiIqAudio.playHint();
  };

  // Advance from Feedback Modal
  const handleAdvanceFromFeedback = () => {
    const currentQ = activeQuestions[currentQuestionIndex];

    if (feedbackType === 'CORRECT') {
      const nextIdx = currentQuestionIndex + 1;

      if (nextIdx >= activeQuestions.length) {
        // LEVEL COMPLETE!
        emojiIqAudio.playLevelClear();

        const finalAccuracy = Math.round(
          (levelCorrectCount / activeQuestions.length) * 100
        );

        EmojiIqLeaderboardService.recordLevelCompletion(
          selectedLevelNumber,
          levelScore,
          finalAccuracy,
          levelBestCombo,
          currentLevelConfig.rewardCoins,
          levelPerfectCount
        );
        refreshStats();

        if (onGameCompleted) {
          onGameCompleted(levelScore);
        }

        setFeedbackType('LEVEL_CLEAR');
      } else {
        setCurrentQuestionIndex(nextIdx);
        setHintsUsedInQuestion(0);
        setEliminatedOptions([]);
        setFeedbackType(null);
      }
    } else if (feedbackType === 'INCORRECT' || feedbackType === 'TIME_OUT') {
      const nextIdx = currentQuestionIndex + 1;
      if (nextIdx >= activeQuestions.length) {
        // Ended questions
        const finalAccuracy = Math.round(
          (levelCorrectCount / activeQuestions.length) * 100
        );
        EmojiIqLeaderboardService.recordLevelCompletion(
          selectedLevelNumber,
          levelScore,
          finalAccuracy,
          levelBestCombo,
          5,
          levelPerfectCount
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
      const nextLevel = Math.min(40, selectedLevelNumber + 1);
      setSelectedLevelNumber(nextLevel);
      setFeedbackType(null);
      setScreen('LEVEL_INFO');
    } else if (feedbackType === 'NO_LIVES') {
      setFeedbackType(null);
      setScreen('LEVEL_INFO');
    }
  };

  // Restore Lives for 30 Coins
  const handleUseCoinsForLives = () => {
    const success = EmojiIqLeaderboardService.restoreLivesForCoins(30);
    if (success) {
      setLives(3);
      refreshStats();
      setFeedbackType(null);
      emojiIqAudio.playCorrect();
    }
  };

  // Store actions
  const handleBuyHints = (count: number, cost: number) => {
    const ok = EmojiIqLeaderboardService.buyHints(count, cost);
    if (ok) {
      refreshStats();
      emojiIqAudio.playPop();
    }
  };

  const handleBuyLives = (count: number, cost: number) => {
    const ok = EmojiIqLeaderboardService.buyLives(count, cost);
    if (ok) {
      setLives(3);
      refreshStats();
      emojiIqAudio.playPop();
    }
  };

  // Reset Progress
  const handleResetProgress = () => {
    localStorage.removeItem('emoji_iq_player_stats_v1');
    refreshStats();
    setSelectedLevelNumber(1);
    setScreen('HOME');
  };

  const activeQuestion = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  return (
    <div
      className="relative w-full h-full min-h-[600px] flex flex-col justify-between overflow-hidden"
      style={{
        backgroundColor: EMOJI_IQ_COLORS.bgLight,
        color: EMOJI_IQ_COLORS.textPrimary,
        fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Background Decorative Soft Gradients */}
      <div
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ backgroundColor: 'rgba(108, 92, 231, 0.25)' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ backgroundColor: 'rgba(0, 184, 217, 0.25)' }}
      />

      {/* Global Header Bar */}
      <EmojiIqHeader
        coins={playerStats.coins}
        lives={lives}
        availableHints={playerStats.availableHints}
        onOpenStore={() => setShowStore(true)}
        onOpenSettings={() => setShowSettings(true)}
        onBack={() => {
          if (screen === 'HOME') {
            if (onClose) onClose();
          } else {
            setScreen('HOME');
          }
        }}
        onUseHint={handleUseHint}
        showHintButton={screen === 'PLAYING'}
        hintsDisabled={eliminatedOptions.length >= 2}
      />

      {/* Active Screen Container */}
      <main className="relative flex-1 w-full flex flex-col justify-between z-10 overflow-hidden">
        {screen === 'HOME' && (
          <EmojiIqHome
            playerStats={playerStats}
            onPlay={() => {
              setSelectedLevelNumber(playerStats.unlockedLevel);
              setScreen('LEVEL_INFO');
            }}
            onOpenLevelSelect={() => setScreen('LEVEL_SELECT')}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenStore={() => setShowStore(true)}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
          />
        )}

        {screen === 'LEVEL_SELECT' && (
          <EmojiIqLevelSelect
            playerStats={playerStats}
            onSelectLevel={(lvl) => {
              setSelectedLevelNumber(lvl);
              setScreen('LEVEL_INFO');
            }}
            onBack={() => setScreen('HOME')}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
          />
        )}

        {screen === 'LEVEL_INFO' && (
          <EmojiIqLevelInfo
            levelConfig={currentLevelConfig}
            playerStats={playerStats}
            onStartLevel={() => startLevel(selectedLevelNumber)}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onBack={() => setScreen('LEVEL_SELECT')}
          />
        )}

        {screen === 'PLAYING' && activeQuestion && (
          <EmojiIqPlayView
            question={activeQuestion}
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
      </main>

      {/* Feedback Modal (Popups from Reference Video) */}
      {feedbackType && (
        <EmojiIqFeedbackModal
          type={feedbackType}
          levelConfig={currentLevelConfig}
          lastScoreCalc={lastScoreCalc}
          levelScore={levelScore}
          totalScore={playerStats.totalTournamentScore}
          accuracy={
            activeQuestions.length > 0
              ? Math.round((levelCorrectCount / (currentQuestionIndex + 1)) * 100)
              : 100
          }
          bestCombo={levelBestCombo}
          perfectCount={levelPerfectCount}
          coinsWon={currentLevelConfig.rewardCoins}
          remainingLives={lives}
          explanation={activeQuestion?.explanation}
          onAdvance={handleAdvanceFromFeedback}
          onOpenLeaderboard={() => {
            setFeedbackType(null);
            setShowLeaderboard(true);
          }}
          onGoHome={() => {
            setFeedbackType(null);
            setScreen('HOME');
          }}
          onUseCoinsForLives={handleUseCoinsForLives}
          playerCoins={playerStats.coins}
        />
      )}

      {/* Leaderboard Modal (Accessible before & after playing) */}
      {showLeaderboard && (
        <EmojiIqLeaderboardModal
          playerStats={playerStats}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Store Modal */}
      {showStore && (
        <EmojiIqStoreModal
          playerStats={playerStats}
          onBuyHints={handleBuyHints}
          onBuyLives={handleBuyLives}
          onClose={() => setShowStore(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <EmojiIqSettingsModal
          onGoHome={() => {
            setFeedbackType(null);
            setScreen('HOME');
          }}
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* How To Play Modal */}
      {showHowToPlay && (
        <EmojiIqHowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
};

export default EmojiIqGame;
