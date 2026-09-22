/**
 * GameON Tele - Official Customer Home Portal
 * 
 * InnoArcade Vertical 2-Column Discovery Architecture:
 * - Top Featured Hero Carousel with promotional banner
 * - Recently Played horizontal strip (only if user has played games)
 * - Category filter pills ("All Games", "Action", "Arcade", "Puzzle", etc.)
 * - Continuous vertical 2-column grid of 4:3 poster cards (matching innoarcade-deploy)
 */

import React, { useState, useMemo } from 'react';
import { GameDefinition, UserProfile } from '../types';
import { GameCatalog } from '../services/gameCatalog';
import { EntitlementService } from '../services/entitlementService';
import { catalogGameToDefinition } from '../games/registry';
import { FeaturedHeroCarousel } from '../components/FeaturedHeroCarousel';
import { RecentlyPlayedSection } from '../components/RecentlyPlayedSection';
import { GameCard } from '../components/GameCard';
import { ChevronRight } from 'lucide-react';

interface HomePageProps {
  games?: GameDefinition[];
  profile: UserProfile;
  onLaunchGame: (game: GameDefinition) => void;
  onOpenDetails?: (game: GameDefinition) => void;
  onOpenBuyCoins?: () => void;
  onNavigateToGames?: (category?: string) => void;
  activeEntitlements?: Record<string, boolean>;
}

export const HomePage: React.FC<HomePageProps> = ({
  games = [],
  profile,
  onLaunchGame,
  onOpenDetails,
  onOpenBuyCoins,
  onNavigateToGames,
  activeEntitlements = {},
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Games');

  // 1. Featured Games from Catalog
  const featuredCatalog = GameCatalog.getFeatured();
  const featuredGames: GameDefinition[] = featuredCatalog.map(catalogGameToDefinition);

  // 2. Recently Played
  const recentlyPlayedIds = EntitlementService.getRecentlyPlayedIds();
  const recentlyPlayedGames = GameCatalog.getRecentlyPlayed(recentlyPlayedIds).map(catalogGameToDefinition);

  // 3. Categories with games
  const availableCategories = useMemo(() => {
    return ['All Games', ...GameCatalog.getCategoriesWithGames().filter((c) => c !== 'All Games')];
  }, []);

  // 4. Filtered games for the 2-column vertical grid
  const displayedGames: GameDefinition[] = useMemo(() => {
    let result = GameCatalog.getAll();
    if (selectedCategory !== 'All Games') {
      result = result.filter(
        (g) => g.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    return result.map(catalogGameToDefinition);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 select-none">
      <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto space-y-5 pt-3">
        
        {/* =========================================================================
            1. HERO / FEATURED BANNER CAROUSEL
           ========================================================================= */}
        <div className="px-3.5 sm:px-4">
          <FeaturedHeroCarousel
            featuredGames={featuredGames}
            onPlayGame={onLaunchGame}
            onClickDetails={onOpenDetails}
            activeEntitlements={activeEntitlements}
          />
        </div>

        {/* =========================================================================
            2. RECENTLY PLAYED (Only rendered if user has played games)
           ========================================================================= */}
        {recentlyPlayedGames.length > 0 && (
          <div className="px-3.5 sm:px-4">
            <RecentlyPlayedSection
              games={recentlyPlayedGames}
              onPlayGame={onLaunchGame}
            />
          </div>
        )}

        {/* =========================================================================
            3. QUICK CATEGORY PILLS STRIP
           ========================================================================= */}
        <div className="px-3.5 sm:px-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Browse Categories
            </span>
            {onNavigateToGames && (
              <button
                onClick={() => onNavigateToGames('All Games')}
                className="text-xs font-bold text-[#1688C9] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Full Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div 
            className="flex gap-2 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs shrink-0 snap-start transition-all cursor-pointer active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-[#8BCB3D] text-white shadow-xs font-black'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#17202A]'
                }`}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================================
            4. MAIN VERTICAL 2-COLUMN GAME GRID (Matches innoarcade-deploy)
           ========================================================================= */}
        <section id="home-games-grid" className="px-3.5 sm:px-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#8BCB3D]" />
              <h2 className="text-base sm:text-lg font-black text-[#17202A] tracking-tight uppercase">
                {selectedCategory}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                {displayedGames.length}
              </span>
            </div>
          </div>

          {/* Clean 2-column mobile vertical grid (3-4 cols on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {displayedGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPlay={onLaunchGame}
                onClickDetails={onOpenDetails}
                layout="grid"
                aspectRatio="4/3"
                hasActiveAccess={Boolean(activeEntitlements[game.id])}
              />
            ))}
          </div>
        </section>

        {/* Bottom telebirr verified footer note */}
        <div className="px-4 pt-2 text-center text-[11px] text-slate-400 font-medium">
          Official telebirr SuperApp Game Center • Instant Play
        </div>

      </div>
    </div>
  );
};
