import React from 'react';
import { GameDefinition } from '../types';
import { OriginalGameArtwork } from './OriginalGameArtwork';

export interface ProfessionalGameCardProps {
  game: GameDefinition;
  onPlay: (game: GameDefinition) => void;
  onClickDetails?: (game: GameDefinition) => void;
  layout?: 'carousel' | 'grid';
  aspectRatio?: '4/3' | '16/9';
  hasActiveAccess?: boolean;
  tournamentBadge?: string;
  userScore?: number;
  className?: string;
}

function formatPlays(count?: number): string {
  if (!count) return '—';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}k`;
  return String(count);
}

/**
 * ProfessionalGameCard (InnoArcade Poster Card Format)
 * 
 * Faithfully matches the exact mobile 2-column card architecture from innoarcade-deploy (https://goplay-nu.vercel.app):
 * 1. 4:3 Cover Artwork with top-left "FREE" pill badge and top-right "?" info/rules button.
 * 2. Card body with Game Title, Genre/Category, 4-stat grid (Rating, Players, Duration, High score).
 * 3. Gradient "Play Now" button with signature circular white play arrow.
 */
export const ProfessionalGameCard: React.FC<ProfessionalGameCardProps> = ({
  game,
  onPlay,
  onClickDetails,
  layout = 'grid',
  aspectRatio = '4/3',
  hasActiveAccess = false,
  tournamentBadge,
  userScore,
  className = '',
}) => {
  const isFreeDirectGame = game.id === 'candy-blast' || game.id === 'world-legends';
  const isCoinGame = !isFreeDirectGame && (game.accessType === 'COIN' || (!game.isFree && Boolean(game.requiresCoins)));
  const isSubscriptionGame = !isFreeDirectGame && game.accessType === 'SUBSCRIPTION';
  const coinCost = isFreeDirectGame ? 0 : (game.coinCost || 10);

  const handleCardClick = () => {
    onPlay(game);
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClickDetails) {
      onClickDetails(game);
    } else {
      onPlay(game);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay(game);
  };

  // Status badge on cover
  let statusText: string | null = null;
  let statusEmoji = '';
  if (tournamentBadge) {
    statusText = tournamentBadge;
    statusEmoji = '🏆';
  } else if (hasActiveAccess) {
    // Remove "UNLOCKED" tag per user requirement
    statusText = null;
  } else if (isCoinGame) {
    statusText = `${coinCost} COINS`;
    statusEmoji = '🪙';
  } else if (isSubscriptionGame) {
    const dailyPrice = game.subscriptionOptions?.daily?.priceETB || 5;
    statusText = `${dailyPrice} ETB`;
    statusEmoji = '🏆';
  }

  return (
    <div
      id={`game-card-${game.id}`}
      onClick={handleCardClick}
      className={`game-card group relative rounded-[20px] bg-white border border-[#e8efe0] hover:border-[#2f8fe6]/60 shadow-[0_4px_16px_rgba(20,45,14,0.08)] hover:shadow-[0_12px_28px_rgba(20,45,14,0.15)] transition-all duration-300 overflow-hidden cursor-pointer flex flex-col select-none ${
        layout === 'carousel'
          ? 'w-[280px] xs:w-[300px] sm:w-[320px] shrink-0 snap-start'
          : 'w-full'
      } ${className}`}
    >
      {/* =========================================================================
          ZONE 1: 4:3 COVER IMAGE CONTAINER WITH OVERLAYS
         ========================================================================= */}
      <div className={`game-card-image relative w-full ${aspectRatio === '4/3' ? 'aspect-[4/3]' : 'aspect-[16/9]'} overflow-hidden bg-slate-100 shrink-0`}>
        <OriginalGameArtwork 
          gameId={game.id} 
          imageUrl={game.bannerUrl || game.thumbnailUrl}
          alt={`${game.title} cover`}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" 
        />

        {/* Top-Left Status Pill (Only if present, e.g. 🏆 TOURNAMENT) */}
        {statusText && (
          <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm">
            {statusEmoji && <span className="text-[10px]">{statusEmoji}</span>}
            <span>{statusText}</span>
          </span>
        )}

        {/* Top-Right Info "?" Button (How-to-play) */}
        <button
          type="button"
          onClick={handleDetailsClick}
          aria-label="Game Info & Rules"
          className="absolute top-2.5 right-2.5 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-[#1f7c14] font-black text-xs sm:text-sm flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer border border-emerald-100"
        >
          ?
        </button>
      </div>

      {/* =========================================================================
          ZONE 2: CARD BODY (Title, Category, 4 Stats, and Play Now Button)
         ========================================================================= */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 bg-white">
        <div>
          {/* Game Title */}
          <h3 
            title={game.title}
            className="text-[14px] sm:text-[16px] font-extrabold text-[#14213a] tracking-tight leading-tight line-clamp-1"
          >
            {game.title}
          </h3>

          {/* Subtitle / Genre */}
          <p className="text-[12px] sm:text-[13px] text-[#64748B] font-medium leading-tight line-clamp-1 mt-0.5">
            {game.category || game.genre || 'Arcade'}
          </p>

          {/* 4-Stat Grid (Rating, Players, Duration, High Score) */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 my-2 sm:my-2.5 text-[11px] sm:text-[12px] font-medium text-slate-500">
            <div className="flex items-center gap-1 truncate" title="Rating">
              <span className="text-amber-400 text-xs">⭐</span>
              <span className="font-bold text-amber-500">★★★★★</span>
            </div>
            <div className="flex items-center gap-1 truncate" title="Plays">
              <span className="text-xs">👥</span>
              <span className="font-bold text-slate-700">{formatPlays(game.playsCount)}</span>
            </div>
            <div className="flex items-center gap-1 truncate" title="Estimated Duration">
              <span className="text-xs">⏱</span>
              <span>2m</span>
            </div>
            <div className="flex items-center gap-1 truncate" title={userScore ? "Your Score" : "High Score"}>
              <span className="text-xs">🏆</span>
              <span className={userScore ? "font-bold text-amber-600" : ""}>
                {userScore ? `${userScore.toLocaleString()} pts` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Wide Pill "Play Now" Button with Play Arrow Badge */}
        <button
          type="button"
          onClick={handlePlayClick}
          aria-label={`Play ${game.title}`}
          className="w-full mt-1 py-1.5 sm:py-2 pl-3.5 pr-1.5 rounded-full bg-gradient-to-r from-[#2f8fe6] to-[#1f5fc4] hover:from-[#257cd0] hover:to-[#184fa8] active:scale-98 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <span className="tracking-wide">Play Now</span>
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-[#1f5fc4] flex items-center justify-center shadow-xs text-[10px] sm:text-xs font-black">
            ▶
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProfessionalGameCard;
