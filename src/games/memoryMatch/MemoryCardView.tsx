import React from 'react';
import { MemoryCard } from './types';
import { CARD_SYMBOLS } from './cardSymbols';
import { FullBleedCardArt } from './cardArtEngine';
import { PremiumCardBack } from './PremiumCardBack';

interface MemoryCardViewProps {
  card: MemoryCard;
  isInteractable: boolean;
  onCardClick: (card: MemoryCard) => void;
  widthPx?: number;
  heightPx?: number;
  sizePx?: number; // legacy fallback
  showCategoryTag?: boolean;
  showCardTitle?: boolean;
}

/**
 * 3D MEMORY CARD VIEW — AAA COMMERCIAL PHYSICAL OBJECT
 * 
 * Design Standards:
 * - Perfectly matched physical front and back frames (same graphite/titanium composite body)
 * - 90-95% surface dedicated to full-bleed hero artwork
 * - Specular 3D flip animation with genuine depth and directional light reflections
 * - Polished state transitions:
 *    * Normal: Titanium chamfer with specular hairline
 *    * Matched: Emerald-platinum luminous pulse and jewel badge
 *    * Error: Controlled mechanical recoil with crimson-amber warning border
 */
export const MemoryCardView: React.FC<MemoryCardViewProps> = ({
  card,
  isInteractable,
  onCardClick,
  widthPx,
  heightPx,
  sizePx = 76,
  showCategoryTag = true,
  showCardTitle = true,
}) => {
  const finalWidth = widthPx || sizePx;
  const finalHeight = heightPx || Math.round(finalWidth * 1.34);

  const symDef = CARD_SYMBOLS.find((s) => s.id === card.symbolId) || CARD_SYMBOLS[0];
  const isRevealed = card.isFlipped || card.isMatched;

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isInteractable || isRevealed) return;
    onCardClick(card);
  };

  return (
    <div
      className={`relative select-none touch-manipulation cursor-pointer group transition-transform duration-150 ${
        isInteractable && !isRevealed ? 'hover:-translate-y-0.5 active:scale-97' : ''
      }`}
      style={{
        width: finalWidth,
        height: finalHeight,
        perspective: '1000px',
      }}
      onClick={handleClick}
    >
      {/* 3D Flip Container with physical elevation */}
      <div
        className={`w-full h-full relative transition-transform duration-350 ease-out transform-gpu ${
          card.isError ? 'animate-shake' : ''
        } ${card.isJustMatched ? 'scale-104 transition-transform duration-150' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
          boxShadow: isRevealed 
            ? '0 8px 24px -2px rgba(0, 0, 0, 0.8), 0 3px 8px -1px rgba(0, 0, 0, 0.65)' 
            : '0 6px 18px -2px rgba(0, 0, 0, 0.75), 0 2px 6px -1px rgba(0, 0, 0, 0.55)',
        }}
      >
        {/* =========================================================
            1. CARD BACK (Face Down) - AAA Titanium/Graphite Slab
           ========================================================= */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-xl"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <PremiumCardBack />
        </div>

        {/* =========================================================
            2. CARD FRONT (Face Up) - Full-Bleed Hero Artwork (90-95%)
           ========================================================= */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundColor: '#0D1117',
          }}
        >
          {/* Edge-to-Edge Full-Bleed Artwork Engine */}
          <div className="absolute inset-[2px] rounded-[10px] sm:rounded-[14px] overflow-hidden pointer-events-none">
            <FullBleedCardArt symbolId={card.symbolId} />
          </div>

          {/* Dynamic Specular Light Sheen sweep on Card Reveal */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-30 z-10"
            style={{
              background: 'linear-gradient(130deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 22%, transparent 45%, rgba(16,185,129,0.08) 100%)',
            }}
          />

          {/* Top Status Bar: Category Pill & Matched Jewel */}
          <div className="relative z-20 w-full flex items-center justify-between px-1.5 pt-1.5 pointer-events-none">
            {showCategoryTag ? (
              <span
                className="text-[6px] sm:text-[7.5px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full backdrop-blur-md bg-black/70 shadow-xs border leading-none"
                style={{
                  color: card.isMatched ? '#34D399' : '#E2E8F0',
                  borderColor: card.isMatched ? 'rgba(52, 211, 153, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                }}
              >
                {symDef.categoryLabel}
              </span>
            ) : <span />}

            {/* Matched Success Jewel at Top Right */}
            {card.isMatched && (
              <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981,0_0_14px_rgba(16,185,129,0.6)] ring-1 ring-white/80 animate-pulse ml-auto" />
            )}
          </div>

          {/* Bottom Minimal Scrim (Ensures text legibility without blocking artwork) */}
          {showCardTitle && (
            <div 
              className="absolute inset-x-0 bottom-0 h-6 sm:h-7 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to top, rgba(13, 17, 23, 0.95) 0%, rgba(13, 17, 23, 0.55) 60%, transparent 100%)',
              }}
            />
          )}

          {/* Small, Crisp, High-Contrast Card Title at Bottom */}
          {showCardTitle && (
            <div className="relative z-20 w-full pb-1 px-1 text-center pointer-events-none">
              <span 
                className={`block text-[7.5px] sm:text-[9px] font-extrabold truncate leading-tight tracking-wide uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] ${
                  card.isMatched ? 'text-emerald-300' : 'text-slate-100'
                }`}
                title={symDef.name}
              >
                {symDef.name}
              </span>
            </div>
          )}

          {/* Chamfered Metallic Outer Frame matching the Card Back */}
          <div 
            className={`absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none z-30 transition-all duration-250 ${
              card.isMatched 
                ? 'border-2 border-[#10B981] shadow-[inset_0_0_12px_rgba(16,185,129,0.45),0_0_16px_rgba(16,185,129,0.7)]' 
                : card.isError 
                ? 'border-2 border-rose-500 shadow-[inset_0_0_10px_rgba(244,63,94,0.45),0_0_14px_rgba(244,63,94,0.6)]' 
                : 'border border-slate-700/70 shadow-[inset_0_0_3px_rgba(255,255,255,0.12)]'
            }`}
          />

          {/* Inner Specular Platinum Edge Line */}
          <div className="absolute inset-[2px] rounded-[10px] sm:rounded-[14px] border border-white/20 pointer-events-none z-30" />

          {/* Precision Corner Accent Marks */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" viewBox="0 0 100 134" preserveAspectRatio="none">
            <path d="M4 10 L4 4 L10 4" stroke={card.isMatched ? '#34D399' : '#CBD5E1'} strokeWidth="1.1" fill="none" opacity="0.8" />
            <path d="M96 10 L96 4 L90 4" stroke={card.isMatched ? '#34D399' : '#CBD5E1'} strokeWidth="1.1" fill="none" opacity="0.8" />
            <path d="M4 124 L4 130 L10 130" stroke={card.isMatched ? '#34D399' : '#CBD5E1'} strokeWidth="1.1" fill="none" opacity="0.8" />
            <path d="M96 124 L96 130 L90 130" stroke={card.isMatched ? '#34D399' : '#CBD5E1'} strokeWidth="1.1" fill="none" opacity="0.8" />
          </svg>

          {/* Matched Success Glow Baseline */}
          {card.isMatched && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#10B981] to-transparent pointer-events-none z-30 shadow-[0_0_8px_#10B981]" />
          )}
        </div>
      </div>
    </div>
  );
};
