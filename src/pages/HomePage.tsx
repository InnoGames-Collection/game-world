/**
 * GameON Tele - Official Customer Home Portal
 * 
 * Category-driven game discovery structure:
 * - Top Featured Hero Carousel with large artwork banners & Play action
 * - Recently Played horizontal strip (only if user has played games)
 * - Recommended Section
 * - Category Horizontal Carousels (Action, Arcade, Puzzle, Racing, Sports, Board, Music)
 * - Large banner-style cards with clear horizontal swipe indication and partial next-card peek.
 */

import React, { useState } from 'react';
import { GameDefinition, UserProfile } from '../types';
import { GameCatalog, CatalogGame } from '../services/gameCatalog';
import { EntitlementService } from '../services/entitlementService';
import { catalogGameToDefinition } from '../games/registry';
import { FeaturedHeroCarousel } from '../components/FeaturedHeroCarousel';
import { RecentlyPlayedSection } from '../components/RecentlyPlayedSection';
import { GameCategorySection } from '../components/GameCategorySection';
import { Sparkles, Gamepad2, Flame, Award, ChevronRight } from 'lucide-react';

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
  // 1. Featured Games from Catalog
  const featuredCatalog = GameCatalog.getFeatured();
  const featuredGames: GameDefinition[] = featuredCatalog.map(catalogGameToDefinition);

  // 2. Recommended Games
  const recommendedCatalog = GameCatalog.getRecommended();
  const recommendedGames: GameDefinition[] = recommendedCatalog.map(catalogGameToDefinition);

  // 3. Recently Played
  const recentlyPlayedIds = EntitlementService.getRecentlyPlayedIds();
  const recentlyPlayedGames = GameCatalog.getRecentlyPlayed(recentlyPlayedIds).map(catalogGameToDefinition);

  // 4. Categories with games (except "All Games")
  const availableCategories = GameCatalog.getCategoriesWithGames().filter((c) => c !== 'All Games');

  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 select-none">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto space-y-6 pt-3">
        
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
                <span>View All Games</span>
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
                onClick={() => onNavigateToGames?.(cat)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#17202A] font-extrabold text-xs shrink-0 snap-start transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================================
            4. RECOMMENDED SECTION
           ========================================================================= */}
        {recommendedGames.length > 0 && (
          <GameCategorySection
            category="Recommended For You"
            games={recommendedGames}
            onPlayGame={onLaunchGame}
            onClickDetails={onOpenDetails}
            activeEntitlements={activeEntitlements}
          />
        )}

        {/* =========================================================================
            5. CATEGORY HORIZONTAL CAROUSELS
            Renders only categories that currently contain active games.
           ========================================================================= */}
        <div className="space-y-6">
          {availableCategories.map((cat) => {
            const catGames = GameCatalog.getByCategory(cat).map(catalogGameToDefinition);
            return (
              <GameCategorySection
                key={cat}
                category={cat}
                games={catGames}
                onPlayGame={onLaunchGame}
                onClickDetails={onOpenDetails}
                activeEntitlements={activeEntitlements}
              />
            );
          })}
        </div>

        {/* Bottom telebirr verified footer note */}
        <div className="px-4 pt-2 text-center text-[11px] text-slate-400 font-medium">
          Official telebirr SuperApp Game Center • Instant Play
        </div>

      </div>
    </div>
  );
};
