import React from 'react';
import { Play, Trophy, ArrowLeft, Volume2, VolumeX, Gauge, Flame } from 'lucide-react';

interface MotoRaceMainMenuProps {
  playerMsisdnMasked: string;
  currentLevel: number;
  totalScore: number;
  globalRank: string;
  onPlay: () => void;
  onLeaderboard: () => void;
  onExit: () => void;
  isAudioMuted?: boolean;
  onToggleAudio?: () => void;
}

export const MotoRaceMainMenu: React.FC<MotoRaceMainMenuProps> = ({
  playerMsisdnMasked,
  currentLevel,
  totalScore,
  globalRank,
  onPlay,
  onLeaderboard,
  onExit,
  isAudioMuted = false,
  onToggleAudio,
}) => {
  return (
    <div
      id="moto-race-main-menu"
      className="absolute inset-0 z-40 flex flex-col justify-between items-center select-none bg-[#141820] text-white p-4 sm:p-6 overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 25%, rgba(244, 63, 94, 0.12) 0%, rgba(20, 24, 32, 0.96) 55%, #0d1017 100%), linear-gradient(180deg, rgba(30, 36, 48, 0.4) 0%, rgba(13, 16, 23, 0.9) 100%)',
      }}
    >
      {/* Top Header Bar */}
      <div
        className="w-full max-w-md flex items-center justify-between pt-1 flex-shrink-0"
        style={{ paddingTop: 'max(0.4rem, env(safe-area-inset-top, 0.4rem))' }}
      >
        <button
          id="moto-menu-exit-btn"
          onClick={onExit}
          className="h-10 px-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700/80 shadow-md transition-all cursor-pointer"
          title="Exit to GoPlay Portal"
          aria-label="Exit Game"
        >
          <ArrowLeft className="w-4 h-4 text-rose-400 stroke-[2.5]" />
          <span className="text-[11px] uppercase tracking-wider">Portal</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
            Season 1
          </span>
        </div>

        {onToggleAudio && (
          <button
            id="moto-menu-sound-btn"
            onClick={onToggleAudio}
            className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 flex items-center justify-center border border-slate-700/80 shadow-md transition-all cursor-pointer"
            title="Toggle Sound"
            aria-label="Toggle Sound"
          >
            {isAudioMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        )}
      </div>

      {/* Main Center Stage */}
      <div className="w-full max-w-md flex flex-col items-center justify-center my-auto py-2">
        {/* Motorcycle Tachometer & Racing Insignia */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-400 p-[2px] shadow-2xl shadow-rose-900/40">
            <div className="w-full h-full rounded-3xl bg-gradient-to-b from-[#1e2430] to-[#121620] flex flex-col items-center justify-center relative overflow-hidden border border-slate-700/40">
              <span className="text-4xl sm:text-5xl drop-shadow-[0_8px_16px_rgba(244,63,94,0.5)]">
                🏍️
              </span>
              <div className="flex items-center gap-1 mt-1 text-[9px] font-mono font-black text-rose-400 tracking-wider">
                <Gauge className="w-3 h-3 text-rose-400" />
                <span>200 KM/H</span>
              </div>
              {/* Subtle Speed Slash Accent */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -rotate-45 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Title: MOTO RACE */}
        <h1
          id="moto-race-main-title"
          className="text-4xl sm:text-5xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-center leading-none mb-1.5"
        >
          Moto Race
        </h1>

        {/* Subtitle Divider */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-[1px] bg-gradient-to-r from-transparent to-rose-500/60" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-400/90 flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-400 fill-current" />
            Grand Prix Tournament
          </span>
          <div className="w-10 h-[1px] bg-gradient-to-l from-transparent to-rose-500/60" />
        </div>

        {/* Player Information Card (Charcoal, Metallic Silver, Strong Contrast) */}
        <div
          id="moto-player-card"
          className="w-full rounded-2xl bg-gradient-to-b from-[#1f2533]/90 to-[#141822]/90 border border-slate-700/80 shadow-2xl shadow-black/60 p-4 mb-6"
        >
          {/* Top row: Player Masked MSISDN & Global Rank */}
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-700/60">
            {/* PLAYER (MASKED MSISDN) */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Player
              </span>
              <span className="text-sm sm:text-base font-mono font-black text-rose-300 tracking-tight">
                {playerMsisdnMasked}
              </span>
            </div>

            {/* GLOBAL RANK */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Global Rank
              </span>
              <span className="text-sm sm:text-base font-mono font-black text-amber-400 tracking-tight">
                {globalRank}
              </span>
            </div>
          </div>

          {/* Bottom row: Current Level & Total Score */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            {/* CURRENT LEVEL */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Current Level
              </span>
              <span className="text-base sm:text-lg font-mono font-black text-white tracking-tight flex items-baseline gap-1">
                {currentLevel}{' '}
                <span className="text-xs text-slate-400 font-bold">/ 40</span>
              </span>
            </div>

            {/* TOTAL SCORE */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Total Score
              </span>
              <span className="text-base sm:text-lg font-mono font-black text-emerald-400 tracking-tight">
                {totalScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          {/* PLAY BUTTON (Navigates to 40-Level Selection) */}
          <button
            id="moto-play-btn"
            onClick={onPlay}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-black text-lg sm:text-xl tracking-wider uppercase shadow-xl shadow-rose-900/40 border-t border-white/30 flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Play className="w-6 h-6 fill-current text-white stroke-[2]" />
            <span>Play</span>
          </button>

          {/* LEADERBOARD BUTTON */}
          <button
            id="moto-leaderboard-btn"
            onClick={onLeaderboard}
            className="w-full py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600/80 hover:border-slate-500 text-slate-200 hover:text-white font-black text-base tracking-wider uppercase shadow-lg shadow-black/50 flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Trophy className="w-5 h-5 text-amber-400 fill-amber-400/20 stroke-[2.5]" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Subtle Footer */}
      <div
        className="w-full max-w-md text-center pb-2 pointer-events-none flex-shrink-0"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }}
      >
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Official 40-Stage Highway Championship
        </span>
      </div>
    </div>
  );
};
