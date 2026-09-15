/**
 * GameON Tele - Category Carousel Section Component
 * Renders category titles, smooth horizontal swipeable container, partial next card peek,
 * and snap navigation.
 */

import React, { useRef } from 'react';
import { GameDefinition } from '../types';
import { GameCard } from './GameCard';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface GameCategorySectionProps {
  category: string;
  games: GameDefinition[];
  onPlayGame: (game: GameDefinition) => void;
  onClickDetails?: (game: GameDefinition) => void;
  activeEntitlements?: Record<string, boolean>;
}

export const GameCategorySection: React.FC<GameCategorySectionProps> = ({
  category,
  games,
  onPlayGame,
  onClickDetails,
  activeEntitlements = {},
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!games || games.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section 
      id={`category-section-${category.toLowerCase().replace(/\s+/g, '-')}`}
      className="space-y-2.5 py-1"
    >
      {/* Category Header with Title & Action Controls */}
      <div className="flex items-center justify-between px-3.5 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#8BCB3D]" />
          <h2 className="text-base sm:text-lg font-black text-[#17202A] tracking-tight uppercase">
            {category}
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
            {games.length}
          </span>
        </div>

        {/* Desktop Carousel Scroll Arrows */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel with Partial Next-Card Peek & Snap Scrolling */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-3.5 overflow-x-auto scrollbar-none px-3.5 sm:px-4 pb-2 snap-x snap-mandatory scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPlay={onPlayGame}
            onClickDetails={onClickDetails}
            layout="carousel"
            hasActiveAccess={Boolean(activeEntitlements[game.id])}
          />
        ))}
        {/* Trailing spacer for generous right padding */}
        <div className="w-2 shrink-0" />
      </div>
    </section>
  );
};
