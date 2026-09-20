import React from 'react';
import { 
  Play, 
  Trophy, 
  Map, 
  HelpCircle, 
  Settings, 
  ArrowLeft,
  Award,
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen
} from 'lucide-react';
import { WorldLegendsProgress } from '../worldLegendsStorage';

// Cohesive warm natural wood textures matching the game
const WOOD_MATERIAL = {
  hud: {
    background: 'linear-gradient(180deg, #f5d499 0%, #e0b06b 50%, #c98e40 100%)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 3px 6px rgba(0,0,0,0.35)',
  },
  tileOrButton: {
    background: 'linear-gradient(180deg, #fff2db 0%, #f6ce8e 45%, #e2a652 100%)',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9), 0 3px 0 #915a1a, 0 5px 8px rgba(0,0,0,0.4)',
  },
  primaryButton: {
    background: 'linear-gradient(180deg, #ffe082 0%, #ffb300 45%, #e65100 100%)',
    boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.8), 0 4px 0 #8c2d00, 0 8px 15px rgba(0,0,0,0.5)',
  },
};

interface WordLegendMainMenuProps {
  progress: WorldLegendsProgress;
  onPlayOrContinue: () => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onExitGame: () => void;
  isAudioEnabled?: boolean;
  onToggleAudio?: () => void;
}

export const WordLegendMainMenu: React.FC<WordLegendMainMenuProps> = ({
  progress,
  onPlayOrContinue,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onOpenSettings,
  onExitGame,
  isAudioEnabled = true,
  onToggleAudio,
}) => {
  const currentLevel = progress.unlockedLevel || 1;
  const completedCount = progress.completedLevels.length;
  const totalScore = progress.totalScore || 0;
  const hasProgressed = currentLevel > 1 || completedCount > 0;

  return (
    <div
      id="word-legend-main-menu"
      className="relative w-full max-w-md mx-auto h-[600px] sm:h-[650px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif] border-4 border-[#b37324] select-none text-[#22140a] animate-in fade-in"
      style={{
        background: 'radial-gradient(circle at 50% 20%, #2e1809 0%, #170d05 60%, #0c0702 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), inset 0 0 0 2px #f1bc68, inset 0 0 25px rgba(0,0,0,0.5)',
      }}
    >
      {/* WOODEN AMBIENT BACKDROP LIGHTING */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
        <div className="absolute -top-10 left-1/4 w-48 h-48 rounded-full bg-amber-500/30 blur-3xl" />
        <div className="absolute bottom-1/4 -right-10 w-48 h-48 rounded-full bg-amber-700/20 blur-3xl" />
      </div>

      {/* TOP HEADER BAR */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          id="word-menu-exit-btn"
          type="button"
          onClick={onExitGame}
          className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl text-[#22140a] flex items-center gap-1.5 font-black text-xs border border-[#c98833] active:translate-y-0.5 transition-all cursor-pointer shadow-md"
          style={WOOD_MATERIAL.tileOrButton}
          title="Exit to Game Center"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#b37324] text-[#22140a] text-xs font-black uppercase tracking-wider"
          style={WOOD_MATERIAL.hud}
        >
          <Sparkles className="w-3.5 h-3.5 fill-[#8a501a]" />
          <span>Tournament Puzzle</span>
        </div>

        {onToggleAudio && (
          <button
            id="word-menu-audio-btn"
            type="button"
            onClick={onToggleAudio}
            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl text-[#22140a] border border-[#c98833] flex items-center justify-center transition-all cursor-pointer shadow-md active:translate-y-0.5"
            style={WOOD_MATERIAL.tileOrButton}
            title={isAudioEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {isAudioEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-800" />
            ) : (
              <VolumeX className="w-5 h-5 text-stone-600" />
            )}
          </button>
        )}
      </div>

      {/* CENTER HERO & TITLE */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-2">
        {/* Scrabble/Wood Letter Tile Crest */}
        <div className="relative mb-3 flex items-center justify-center">
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 border-2 border-[#b37324] flex items-center justify-center shadow-2xl"
            style={WOOD_MATERIAL.tileOrButton}
          >
            <div className="w-full h-full rounded-xl bg-gradient-to-b from-[#fce9ca] to-[#e4af62] flex flex-col items-center justify-center text-[#2a1708] font-black shadow-inner border border-[#d8973b]">
              <span className="text-3xl sm:text-4xl font-mono leading-none tracking-widest">W</span>
              <span className="text-[10px] text-[#7a4110] font-mono leading-none mt-0.5">LEGEND</span>
            </div>
          </div>
          <div className="absolute -top-1 -right-2 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-[#22140a] font-black text-xs flex items-center justify-center shadow-lg border-2 border-[#b37324]">
            ★
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-[#f4d8a5]">
          <span>WORD </span>
          <span className="text-[#ffba42]">
            LEGEND
          </span>
        </h1>
        <p className="text-xs text-[#d6b080] font-bold tracking-wide mt-1">
          40 Master Tournament Levels
        </p>

        {/* PLAYER PROGRESS CARD */}
        <div
          id="word-progress-card"
          className="w-full mt-4 p-3.5 rounded-2xl border-2 border-[#b37324] shadow-xl"
          style={WOOD_MATERIAL.hud}
        >
          <div className="flex items-center justify-between text-xs font-black text-[#3d2008] pb-2 border-b border-[#a86c23]/40">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#8c3204]" />
              <span>TOURNAMENT PROGRESS</span>
            </span>
            <span className="font-mono text-[#8c3204]">
              {completedCount} / 40 SOLVED
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2.5 text-center">
            <div 
              className="rounded-xl p-2 border border-[#c98833]"
              style={WOOD_MATERIAL.tileOrButton}
            >
              <div className="text-[9px] text-[#6b3e15] font-black uppercase tracking-wider">CURRENT</div>
              <div className="text-base font-black text-[#2a1708] font-mono">
                LVL {currentLevel}
              </div>
            </div>

            <div 
              className="rounded-xl p-2 border border-[#c98833]"
              style={WOOD_MATERIAL.tileOrButton}
            >
              <div className="text-[9px] text-[#6b3e15] font-black uppercase tracking-wider">SOLVED</div>
              <div className="text-base font-black text-[#1c6628] font-mono flex items-center justify-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{completedCount}</span>
              </div>
            </div>

            <div 
              className="rounded-xl p-2 border border-[#c98833]"
              style={WOOD_MATERIAL.tileOrButton}
            >
              <div className="text-[9px] text-[#6b3e15] font-black uppercase tracking-wider">TOTAL SCORE</div>
              <div className="text-base font-black text-[#853509] font-mono truncate">
                {totalScore.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION ACTION BUTTONS */}
      <div className="relative z-10 w-full flex flex-col gap-2.5 pt-2">
        {/* PRIMARY PLAY / CONTINUE BUTTON */}
        <button
          id="word-primary-play-btn"
          type="button"
          onClick={onPlayOrContinue}
          className="min-h-[54px] w-full py-3.5 px-5 rounded-2xl text-[#22140a] font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 border-2 border-[#b37324] transition-all cursor-pointer active:translate-y-1"
          style={WOOD_MATERIAL.primaryButton}
        >
          <div className="w-7 h-7 rounded-xl bg-black/15 flex items-center justify-center">
            <Play className="w-4 h-4 fill-[#22140a] text-[#22140a]" />
          </div>
          <span>{hasProgressed ? `CONTINUE (LEVEL ${currentLevel})` : 'PLAY (LEVEL 1)'}</span>
        </button>

        {/* SECONDARY MENU BUTTONS GRID */}
        <div className="grid grid-cols-2 gap-2">
          {/* LEVELS BUTTON */}
          <button
            id="word-menu-levels-btn"
            type="button"
            onClick={onOpenLevels}
            className="min-h-[46px] py-2.5 px-3 rounded-2xl text-[#22140a] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-[#c98833] transition-all cursor-pointer active:translate-y-0.5"
            style={WOOD_MATERIAL.tileOrButton}
          >
            <Map className="w-4 h-4 text-[#733a0e]" />
            <span>LEVELS</span>
          </button>

          {/* LEADERBOARD BUTTON */}
          <button
            id="word-menu-leaderboard-btn"
            type="button"
            onClick={onOpenLeaderboard}
            className="min-h-[46px] py-2.5 px-3 rounded-2xl text-[#22140a] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-[#c98833] transition-all cursor-pointer active:translate-y-0.5"
            style={WOOD_MATERIAL.tileOrButton}
          >
            <Trophy className="w-4 h-4 text-[#8a420b]" />
            <span>LEADERBOARD</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* HOW TO PLAY BUTTON */}
          <button
            id="word-menu-howtoplay-btn"
            type="button"
            onClick={onOpenHowToPlay}
            className="min-h-[44px] py-2 px-3 rounded-2xl text-[#f3dac1] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#ffc164]" />
            <span>HOW TO PLAY</span>
          </button>

          {/* SETTINGS BUTTON */}
          <button
            id="word-menu-settings-btn"
            type="button"
            onClick={onOpenSettings}
            className="min-h-[44px] py-2 px-3 rounded-2xl text-[#f3dac1] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-stone-400" />
            <span>SETTINGS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
