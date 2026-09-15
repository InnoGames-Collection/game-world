/**
 * Game Detail Page Component for TelePlay Ethiopia
 * Displays large original artwork, title, full description, controls, difficulty,
 * best score, coin requirements, Play button, Leaderboard button, and Back button.
 */

import React from 'react';
import { GameDefinition, UserProfile } from '../types';
import { OriginalGameArtwork } from '../components/OriginalGameArtwork';
import { 
  Play, 
  ArrowLeft, 
  Trophy, 
  Coins, 
  Star, 
  Sparkles, 
  Flame, 
  Gamepad2, 
  Puzzle, 
  Activity, 
  BookOpen, 
  Music, 
  Car, 
  Target, 
  CheckCircle2, 
  Share2, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

interface GameDetailPageProps {
  game: GameDefinition;
  profile: UserProfile;
  onBack: () => void;
  onPlay: (game: GameDefinition) => void;
  onViewLeaderboard?: (game: GameDefinition) => void;
}

export const GameDetailPage: React.FC<GameDetailPageProps> = ({
  game,
  profile,
  onBack,
  onPlay,
  onViewLeaderboard,
}) => {
  const userScore = profile.highScores[game.id] || 0;
  const hasEnoughCoins = profile.coins >= (game.entryCostCoins || 0);

  // Genre Icon mapping
  const getGenreIcon = (genre: string, cat: string) => {
    const key = (genre || cat || '').toLowerCase();
    if (key.includes('puzzle')) return <Puzzle className="w-4 h-4" />;
    if (key.includes('reaction')) return <Activity className="w-4 h-4" />;
    if (key.includes('knowledge') || key.includes('trivia')) return <BookOpen className="w-4 h-4" />;
    if (key.includes('music') || key.includes('rhythm')) return <Music className="w-4 h-4" />;
    if (key.includes('racing') || key.includes('speed')) return <Car className="w-4 h-4" />;
    if (key.includes('arcade') || key.includes('balloon') || key.includes('reflex')) return <Sparkles className="w-4 h-4" />;
    if (key.includes('sport') || key.includes('archery')) return <Target className="w-4 h-4" />;
    return <Gamepad2 className="w-4 h-4" />;
  };

  const getDifficultyColor = (diff: string = 'Medium') => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'hard':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'medium':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${game.title} - TelePlay Ethiopia`,
        text: `Play ${game.title} on TelePlay Ethiopia! My high score is ${userScore} points.`,
        url: window.location.href,
      }).catch(() => {});
    }
  };

  return (
    <div className="pb-24 max-w-4xl mx-auto px-3 sm:px-6 pt-2">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          id="detail-back-button"
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#0057A8] hover:border-[#0057A8] transition-colors text-xs font-bold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Deliberate Coin Balance Container */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-mono font-bold shadow-2xs">
            <div className="w-4 h-4 rounded-lg bg-[#8BCB3D] text-white flex items-center justify-center shrink-0">
              <Coins className="w-2.5 h-2.5 fill-current" />
            </div>
            <span className="text-slate-500 font-sans font-semibold text-[10px]">Balance:</span>
            <span className="text-emerald-700 font-black">{profile.coins ?? 25} Coins</span>
          </div>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0057A8] hover:border-[#0057A8] transition-colors shadow-xs"
            title="Share Game"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Large Artwork & Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm mb-6">
        {/* Large Original Artwork Container */}
        <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden bg-slate-100">
          <OriginalGameArtwork gameId={game.id} className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badges Over Artwork */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0057A8] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              {getGenreIcon(game.genre, game.category)}
              <span>{game.genre || game.category}</span>
            </span>

            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border shadow-sm ${getDifficultyColor(game.difficulty)}`}>
              Difficulty: {game.difficulty || 'Medium'}
            </span>

            {game.isTrending && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-current" /> Hot
              </span>
            )}
          </div>
        </div>

        {/* Title, Subtitle, & Quick Stats Overlay */}
        <div className="p-5 sm:p-6 bg-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {game.title}
              </h1>
              <div className="text-sm font-bold text-[#0057A8] mt-0.5">
                {game.titleAmharic}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl leading-relaxed">
                {game.tagline}
              </p>
            </div>

            {/* Rating & Play Stats */}
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200 text-amber-700">
                <Star className="w-4 h-4 fill-current text-amber-500" />
                <span className="text-xs font-black">{game.rating}</span>
              </div>
              <div className="text-right pr-2">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Plays</div>
                <div className="text-xs font-mono font-bold text-slate-900">
                  {game.playsCount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* 1. Best Score Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Personal Best</span>
            </div>
            <div className="text-xl font-black font-mono text-[#0057A8]">
              {userScore > 0 ? `${userScore.toLocaleString()} PTS` : 'No Record Yet'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        {/* 2. Coin Requirement Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>Coins Required</span>
            </div>
            <div className="text-xl font-black font-mono text-slate-900 flex items-center gap-1">
              <span>{game.energyCost * 10} Coins</span>
              <span className="text-xs text-slate-500 font-normal">/ match</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
            <Coins className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* 3. Match Duration & Server */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0057A8]" />
              <span>Session Duration</span>
            </div>
            <div className="text-xl font-black font-mono text-slate-900">
              ~60s - 90s
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0057A8]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Game Description, Rules, & Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* About & Features */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0057A8] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#78BE20]" />
              <span>Game Overview</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
              {game.description}
            </p>

            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                How to Score:
              </div>
              <ul className="space-y-1.5">
                {game.instructions.map((inst, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#78BE20] shrink-0 mt-0.5" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Controls Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0057A8] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[#0057A8]" />
              <span>Controls & Mechanics</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
              <div className="text-xs font-mono font-bold text-slate-900 mb-1">
                {game.controlsDescription}
              </div>
              <div className="text-[11px] text-slate-500">
                Optimized for ultra-responsive mobile touch screens and desktop keyboards.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Primary Input:</span>
                <span className="text-[#0057A8] font-bold">Touch Tap & Swipe / Keyboard</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">FPS Target:</span>
                <span className="text-slate-900 font-mono font-bold">60 FPS Ultra-Smooth</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Data Usage:</span>
                <span className="text-emerald-600 font-bold">&lt; 150 KB per session</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Dock */}
      <div className="sticky bottom-4 z-30 p-3 sm:p-4 rounded-2xl bg-[#0057A8] text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6 text-amber-300 fill-current" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Ready for match</span>
              <span className="text-emerald-300 font-mono font-bold">• 10 Coins</span>
            </div>
            <div className="text-[11px] text-blue-100">
              {hasEnoughCoins ? 'Instant launch available' : 'Low coins - purchase to play'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Leaderboard Button */}
          <button
            id="detail-leaderboard-button"
            onClick={() => {
              if (onViewLeaderboard) {
                onViewLeaderboard(game);
              }
            }}
            className="flex-1 sm:flex-none px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Leaderboard</span>
          </button>

          {/* Play Button */}
          <button
            id="detail-play-button"
            onClick={() => onPlay(game)}
            className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-[#78BE20] hover:bg-[#68a81b] text-white font-black text-sm uppercase tracking-wider active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>PLAY NOW</span>
          </button>
        </div>
      </div>
    </div>
  );
};

