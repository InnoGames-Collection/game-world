/**
 * Solitaire Card Renderer & Visual Assets
 * Authentic playing card artwork: crisp vector pips, ornate court cards (J, Q, K),
 * aces with decorative flourishes, and traditional red-and-white geometric back pattern.
 */

import React from 'react';
import { Suit, Rank, Card } from './types';

// Suit Colors & Symbols
export const SUIT_COLORS: Record<Suit, string> = {
  hearts: '#dc2626',
  diamonds: '#dc2626',
  clubs: '#0f172a',
  spades: '#0f172a',
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

// Rank to Display String
export const getRankLabel = (rank: Rank): string => {
  switch (rank) {
    case 1:
      return 'A';
    case 11:
      return 'J';
    case 12:
      return 'Q';
    case 13:
      return 'K';
    default:
      return rank.toString();
  }
};

/**
 * Pure SVG Suit Icon Component for crisp rendering at any size
 */
export const SuitIcon: React.FC<{ suit: Suit; size?: number; className?: string }> = ({
  suit,
  size = 14,
  className = '',
}) => {
  const color = SUIT_COLORS[suit];

  if (suit === 'hearts') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
  if (suit === 'diamonds') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M12 2L2 12l10 10 10-10L12 2z" />
      </svg>
    );
  }
  if (suit === 'clubs') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <circle cx="8" cy="13" r="4.5" />
        <circle cx="16" cy="13" r="4.5" />
        <circle cx="12" cy="7.5" r="4.5" />
        <path d="M11 13h2v8h-2z" />
        <path d="M9 21h6v-2H9z" />
      </svg>
    );
  }
  // Spades
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 2.5C9.5 6 4 10.5 4 14.5 4 17 6 18.5 8.5 18.5c1.7 0 3-.7 3.5-1.5.5.8 1.8 1.5 3.5 1.5 2.5 0 4.5-1.5 4.5-4 0-4-5.5-8.5-8-12z" />
      <path d="M11 16h2v5.5h-2z" />
      <path d="M9 21.5h6v-1.5H9z" />
    </svg>
  );
};

/**
 * Geometric Red Card Back Pattern
 */
export const CardBack: React.FC<{ width?: number | string; height?: number | string; className?: string }> = ({
  width = '100%',
  height = '100%',
  className = '',
}) => {
  return (
    <div
      style={{ width, height }}
      className={`relative rounded-md overflow-hidden bg-white border border-slate-300 shadow-sm select-none ${className}`}
    >
      {/* Outer White Margin + Dark Crimson Red Back Base */}
      <div className="absolute inset-[2.5px] rounded-[4px] bg-gradient-to-br from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] p-1 flex items-center justify-center overflow-hidden border border-white/40">
        {/* Double Inner White Border Line */}
        <div className="absolute inset-[3px] rounded-[3px] border border-white/50 pointer-events-none" />
        
        {/* Repeating Diamond Guilloche Lattice Grid */}
        <div
          className="absolute inset-[4px] opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1.2px, transparent 1.2px), radial-gradient(circle, #ffffff 1.2px, transparent 1.2px)`,
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 4px 4px',
          }}
        />

        {/* Central Ornate Rosette & Emblem */}
        <div className="relative z-10 w-7 h-7 rounded-full border border-white/70 bg-gradient-to-br from-[#dc2626] to-[#7f1d1d] flex items-center justify-center shadow-inner">
          <div className="w-4 h-4 rounded-full border border-white/60 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Court Card Center Art (Jack, Queen, King)
 */
const CourtCardCenter: React.FC<{ rank: Rank; suit: Suit }> = ({ rank, suit }) => {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const primaryColor = isRed ? '#dc2626' : '#2563eb';
  const goldColor = '#f59e0b';
  const darkColor = '#1e293b';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-0.5 pointer-events-none">
      <svg viewBox="0 0 40 50" className="w-full h-full max-w-[42px] max-h-[52px]">
        {/* Crown / Hat */}
        {rank === 13 && (
          // King: Golden Crown with jewels
          <g>
            <path d="M8 12 L12 18 L20 10 L28 18 L32 12 L30 22 L10 22 Z" fill={goldColor} stroke={darkColor} strokeWidth="1" />
            <circle cx="20" cy="10" r="1.5" fill={primaryColor} />
            <circle cx="8" cy="12" r="1.2" fill={primaryColor} />
            <circle cx="32" cy="12" r="1.2" fill={primaryColor} />
          </g>
        )}
        {rank === 12 && (
          // Queen: Ornate Tiara & Veil
          <g>
            <path d="M12 14 L20 8 L28 14 L26 22 L14 22 Z" fill={goldColor} stroke={darkColor} strokeWidth="1" />
            <circle cx="20" cy="8" r="1.5" fill="#ec4899" />
            <path d="M10 20 Q20 28 30 20" stroke={primaryColor} strokeWidth="1.5" fill="none" />
          </g>
        )}
        {rank === 11 && (
          // Jack: Noble Feathered Cap
          <g>
            <ellipse cx="20" cy="16" rx="10" ry="5" fill={primaryColor} stroke={darkColor} strokeWidth="1" />
            <path d="M26 14 Q32 8 36 12" stroke={goldColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* Face Silhouette */}
        <circle cx="20" cy="23" r="5.5" fill="#fef3c7" stroke={darkColor} strokeWidth="0.8" />
        <circle cx="18.5" cy="22" r="0.7" fill={darkColor} />
        <circle cx="21.5" cy="22" r="0.7" fill={darkColor} />
        {rank === 13 && <path d="M17 25 Q20 27 23 25" stroke={goldColor} strokeWidth="1" fill="none" />}

        {/* Ornate Heraldic Royal Robe */}
        <path d="M10 29 L30 29 L34 46 L6 46 Z" fill={primaryColor} stroke={darkColor} strokeWidth="1" />
        <path d="M15 29 L20 46 L25 29" fill={goldColor} stroke={darkColor} strokeWidth="0.8" />
        
        {/* Suit Badge Center */}
        <circle cx="20" cy="38" r="4" fill="#ffffff" stroke={darkColor} strokeWidth="0.8" />
      </svg>
      <div className="absolute top-[58%] -translate-y-1/2">
        <SuitIcon suit={suit} size={10} />
      </div>
    </div>
  );
};

/**
 * Standard Playing Card Face Component
 */
export const CardFace: React.FC<{
  card: Card;
  width?: number | string;
  height?: number | string;
  isSelected?: boolean;
  className?: string;
}> = ({ card, width = '100%', height = '100%', isSelected = false, className = '' }) => {
  const { rank, suit } = card;
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const textColor = isRed ? 'text-red-600' : 'text-slate-900';
  const label = getRankLabel(rank);

  return (
    <div
      style={{ width, height }}
      className={`relative rounded-md overflow-hidden bg-[#fffdf9] border ${
        isSelected
          ? 'border-amber-400 ring-2 ring-amber-400 shadow-lg -translate-y-0.5'
          : 'border-slate-300 shadow-sm hover:border-slate-400'
      } select-none transition-all duration-150 ${className}`}
    >
      {/* Subtle fine paper texture gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#faf8f4] to-[#f4efe6] pointer-events-none" />

      {/* Top Left Corner Index */}
      <div className="absolute top-0.5 left-1 flex flex-col items-center pointer-events-none z-10 leading-none">
        <span className={`text-[12px] sm:text-[13px] font-black tracking-tighter ${textColor}`}>{label}</span>
        <div className="-mt-0.5">
          <SuitIcon suit={suit} size={9} />
        </div>
      </div>

      {/* Bottom Right Corner Index (Rotated 180°) */}
      <div className="absolute bottom-0.5 right-1 flex flex-col items-center pointer-events-none z-10 leading-none rotate-180">
        <span className={`text-[12px] sm:text-[13px] font-black tracking-tighter ${textColor}`}>{label}</span>
        <div className="-mt-0.5">
          <SuitIcon suit={suit} size={9} />
        </div>
      </div>

      {/* Center Area Rendering */}
      <div className="absolute inset-x-2 inset-y-1 flex items-center justify-center">
        {rank === 1 ? (
          // Ace: Grand decorative emblem
          <div className="flex items-center justify-center">
            <SuitIcon suit={suit} size={26} />
          </div>
        ) : rank >= 11 ? (
          // Court cards: Royal medieval vector portrait
          <CourtCardCenter rank={rank} suit={suit} />
        ) : (
          // Number card pips
          <div className="flex flex-col items-center justify-between h-full py-2.5">
            <div className="flex justify-center gap-2">
              <SuitIcon suit={suit} size={11} />
              {rank >= 4 && <SuitIcon suit={suit} size={11} />}
            </div>

            {/* Middle Pip Row */}
            {(rank === 3 || rank === 5 || rank === 7 || rank === 9) && (
              <div className="flex justify-center">
                <SuitIcon suit={suit} size={11} />
              </div>
            )}
            {rank >= 6 && rank <= 8 && (
              <div className="flex justify-center gap-2">
                <SuitIcon suit={suit} size={11} />
                <SuitIcon suit={suit} size={11} />
              </div>
            )}
            {rank === 10 && (
              <div className="flex flex-col gap-1">
                <SuitIcon suit={suit} size={10} />
                <SuitIcon suit={suit} size={10} />
              </div>
            )}

            <div className="flex justify-center gap-2 rotate-180">
              <SuitIcon suit={suit} size={11} />
              {rank >= 4 && <SuitIcon suit={suit} size={11} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Universal Card Component (Renders Face or Back according to isFaceUp)
 */
export const CardGraphic: React.FC<{
  card: Card;
  width?: number | string;
  height?: number | string;
  isSelected?: boolean;
  className?: string;
}> = ({ card, width, height, isSelected, className }) => {
  if (!card.isFaceUp) {
    return <CardBack width={width} height={height} className={className} />;
  }
  return <CardFace card={card} width={width} height={height} isSelected={isSelected} className={className} />;
};

/**
 * Foundation Slot with Watermark Outline
 */
export const FoundationSlot: React.FC<{
  suit: Suit;
  width?: number | string;
  height?: number | string;
  onClick?: () => void;
}> = ({ suit, width = '100%', height = '100%', onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{ width, height }}
      className="relative rounded-md border border-white/20 bg-black/25 flex items-center justify-center cursor-pointer hover:bg-black/35 transition-colors shadow-inner"
    >
      <div className="opacity-25 grayscale brightness-200">
        <SuitIcon suit={suit} size={22} />
      </div>
      <div className="absolute inset-0 rounded-md border border-dashed border-white/20 pointer-events-none" />
    </div>
  );
};

/**
 * Empty Tableau Column Placeholder (Accepts Kings)
 */
export const EmptyTableauSlot: React.FC<{
  width?: number | string;
  height?: number | string;
  onClick?: () => void;
}> = ({ width = '100%', height = '100%', onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{ width, height }}
      className="relative rounded-md border border-dashed border-white/20 bg-black/20 flex items-center justify-center cursor-pointer hover:bg-black/30 transition-colors shadow-inner"
    >
      <span className="text-white/20 text-xs font-black">K</span>
    </div>
  );
};

/**
 * Empty Stock Slot (Recycle Waste)
 */
export const EmptyStockSlot: React.FC<{
  width?: number | string;
  height?: number | string;
  onClick?: () => void;
  canRecycle?: boolean;
}> = ({ width = '100%', height = '100%', onClick, canRecycle = true }) => {
  return (
    <div
      onClick={onClick}
      style={{ width, height }}
      className={`relative rounded-md border border-white/25 bg-black/25 flex items-center justify-center cursor-pointer transition-colors shadow-inner ${
        canRecycle ? 'hover:bg-black/35 active:scale-95' : 'opacity-40 cursor-default'
      }`}
    >
      {/* Circular Arrow Recycle Icon */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
      </svg>
    </div>
  );
};
