import React from 'react';
import { Play, Trophy, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { fruitAudio } from '../fruitSliceAudio';

interface FruitNinjaMainMenuProps {
  userRank: string;
  userScore: number;
  playerMsisdnMasked: string;
  onPlay: () => void;
  onLeaderboard: () => void;
  onExit: () => void;
  soundMuted?: boolean;
  onToggleSound?: () => void;
}

export const FruitNinjaMainMenu: React.FC<FruitNinjaMainMenuProps> = ({
  userRank,
  userScore,
  playerMsisdnMasked,
  onPlay,
  onLeaderboard,
  onExit,
  soundMuted = false,
  onToggleSound,
}) => {
  const handlePlayClick = () => {
    fruitAudio.playButtonClick();
    onPlay();
  };

  const handleLeaderboardClick = () => {
    fruitAudio.playButtonClick();
    onLeaderboard();
  };

  const handleExitClick = () => {
    fruitAudio.playButtonClick();
    onExit();
  };

  return (
    <div
      id="fruit-ninja-main-menu"
      className="absolute inset-0 z-40 flex flex-col justify-between items-center select-none bg-[#120803] text-white p-4 sm:p-6 overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 30%, rgba(234, 88, 12, 0.18) 0%, rgba(34, 14, 5, 0.95) 60%, #0d0502 100%)',
      }}
    >
      {/* Top Header Bar */}
      <div
        className="w-full max-w-md flex items-center justify-between pt-1"
        style={{ paddingTop: 'max(0.4rem, env(safe-area-inset-top, 0.4rem))' }}
      >
        <button
          id="fruit-ninja-menu-exit-btn"
          onClick={handleExitClick}
          className="h-10 px-3 rounded-xl bg-stone-900/80 hover:bg-stone-800 active:scale-95 text-stone-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-amber-500/20 shadow-md transition-all cursor-pointer"
          title="Exit to TelePlus Portal"
          aria-label="Exit Game"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400 stroke-[2.5]" />
          <span className="hidden xs:inline text-[11px] uppercase tracking-wider">Portal</span>
        </button>

        {onToggleSound && (
          <button
            id="fruit-ninja-menu-sound-btn"
            onClick={() => {
              fruitAudio.playButtonClick();
              onToggleSound();
            }}
            className="w-10 h-10 rounded-xl bg-stone-900/80 hover:bg-stone-800 active:scale-95 flex items-center justify-center border border-amber-500/20 shadow-md transition-all cursor-pointer"
            title="Toggle Sound"
            aria-label="Toggle Sound"
          >
            {soundMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        )}
      </div>

      {/* Main Center Stage */}
      <div className="w-full max-w-md flex flex-col items-center justify-center my-auto py-2">
        {/* Sleek Fruit Blade Emblem */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 p-[2px] shadow-2xl shadow-orange-600/30">
            <div className="w-full h-full rounded-3xl bg-gradient-to-b from-[#241105] to-[#120803] flex items-center justify-center text-5xl sm:text-6xl relative overflow-hidden">
              <span className="drop-shadow-[0_8px_16px_rgba(234,88,12,0.6)]">🍉</span>
              {/* Subtle Katana Slash Accent */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -rotate-45 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Title: FRUIT NINJA */}
        <h1
          id="fruit-ninja-main-title"
          className="text-4xl sm:text-5xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-center leading-none mb-1"
        >
          Fruit Ninja
        </h1>

        {/* Blade Slicing Katana Subtitle Divider */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-[1px] bg-gradient-to-r from-transparent to-amber-500/60" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400/90">
            Championship
          </span>
          <div className="w-10 h-[1px] bg-gradient-to-l from-transparent to-amber-500/60" />
        </div>

        {/* Small Player Information Area */}
        <div
          id="fruit-ninja-player-card"
          className="w-full rounded-2xl bg-gradient-to-b from-[#251307]/90 to-[#170b04]/90 border border-amber-500/30 shadow-xl shadow-black/50 p-3.5 sm:p-4 mb-6"
        >
          <div className="grid grid-cols-3 divide-x divide-amber-500/20 text-center">
            {/* YOUR RANK */}
            <div className="px-1.5 flex flex-col justify-center">
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-300/80 uppercase tracking-wider mb-0.5">
                Your Rank
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-amber-400 tracking-tight">
                {userRank}
              </span>
            </div>

            {/* YOUR SCORE */}
            <div className="px-1.5 flex flex-col justify-center">
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-300/80 uppercase tracking-wider mb-0.5">
                Your Score
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-white tracking-tight">
                {userScore.toLocaleString()}
              </span>
            </div>

            {/* PLAYER (MASKED MSISDN) */}
            <div className="px-1.5 flex flex-col justify-center">
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-300/80 uppercase tracking-wider mb-0.5">
                Player
              </span>
              <span className="text-xs sm:text-sm font-black font-mono text-amber-200 truncate tracking-tight">
                {playerMsisdnMasked}
              </span>
            </div>
          </div>
        </div>

        {/* Prominent Action Buttons */}
        <div className="w-full space-y-3">
          {/* PLAY BUTTON (Navigates to EXISTING Select Level) */}
          <button
            id="fruit-ninja-play-btn"
            onClick={handlePlayClick}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-lg sm:text-xl tracking-wider uppercase shadow-xl shadow-green-700/40 border-t border-white/40 flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Play className="w-6 h-6 fill-current text-white stroke-[2]" />
            <span>Play</span>
          </button>

          {/* LEADERBOARD BUTTON */}
          <button
            id="fruit-ninja-leaderboard-btn"
            onClick={handleLeaderboardClick}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600/25 via-amber-500/35 to-amber-600/25 hover:from-amber-600/35 hover:to-amber-500/45 border border-amber-400/50 hover:border-amber-300 text-amber-300 hover:text-white font-black text-base sm:text-lg tracking-wider uppercase shadow-lg shadow-black/50 flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Trophy className="w-5 h-5 text-amber-400 fill-amber-400/20 stroke-[2.5]" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Subtle Footer */}
      <div
        className="w-full max-w-md text-center pb-2 pointer-events-none"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }}
      >
        <span className="text-[10px] font-bold text-amber-400/40 uppercase tracking-widest">
          Official Blade Tournament
        </span>
      </div>
    </div>
  );
};
