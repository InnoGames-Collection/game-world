/**
 * GameON Tele - Official Game Catalog Discovery Page
 * 
 * Category-driven discovery:
 * - Category filter pills: [ All Games ] [ Action ] [ Arcade ] [ Puzzle ] [ Racing ] [ Sports ] [ Board ] [ Music ]
 * - Only displays categories that currently contain games (except All Games).
 * - Instant search filter across 100+ scalable games architecture.
 * - Large banner-style cards with clear access indicators (FREE, COIN, SUBSCRIPTION).
 */

import React, { useState, useMemo } from 'react';
import { GameDefinition, UserProfile } from '../types';
import { GameCatalog } from '../services/gameCatalog';
import { TournamentService } from '../services/tournamentService';
import { catalogGameToDefinition } from '../games/registry';
import { GameCard } from '../components/GameCard';
import { GameDetailsModal } from '../components/GameDetailsModal';
import { Search, Sparkles, Filter, X, Coins, Trophy } from 'lucide-react';

interface GamesPageProps {
  games: GameDefinition[];
  profile: UserProfile;
  onLaunchGame: (game: GameDefinition) => void;
  onOpenBuyCoins?: () => void;
  initialCategory?: string;
  activeEntitlements?: Record<string, boolean>;
}

export const GamesPage: React.FC<GamesPageProps> = ({
  games,
  profile,
  onLaunchGame,
  onOpenBuyCoins,
  initialCategory = 'All Games',
  activeEntitlements = {},
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<GameDefinition | null>(null);

  // Categories with games (plus 'All Games')
  const categories = useMemo(() => {
    return GameCatalog.getCategoriesWithGames();
  }, []);

  // Filter games by category and search query
  const filteredGames = useMemo(() => {
    let result = GameCatalog.getAll();

    if (selectedCategory !== 'All Games') {
      result = result.filter(
        (g) => g.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.gameName.toLowerCase().includes(q) ||
          g.titleAmharic.includes(searchQuery) ||
          g.category.toLowerCase().includes(q) ||
          g.tagline.toLowerCase().includes(q) ||
          g.genre.toLowerCase().includes(q)
      );
    }

    return result.map(catalogGameToDefinition);
  }, [selectedCategory, searchQuery]);

  const bestScore = useMemo(() => {
    const scores = Object.values(profile.highScores || {}) as number[];
    const maxProfileScore = scores.length > 0 ? Math.max(...scores) : 0;
    const tournamentSummary = TournamentService.getTournamentSummary(profile);
    const tournamentBest = tournamentSummary.currentUserBestScore || 0;
    return Math.max(maxProfileScore, tournamentBest);
  }, [profile]);

  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 select-none">
      <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto px-3 sm:px-4 pt-3 space-y-4">
        
        {/* Game Details Modal */}
        <GameDetailsModal
          game={selectedGameForDetails}
          isOpen={Boolean(selectedGameForDetails)}
          onClose={() => setSelectedGameForDetails(null)}
          onPlayGame={onLaunchGame}
          hasActiveAccess={selectedGameForDetails ? Boolean(activeEntitlements[selectedGameForDetails.id]) : false}
        />

        {/* 1. STATS: AVAILABLE COINS | BEST SCORE */}
        <div className="grid grid-cols-2 gap-3">
          {/* Available Coins */}
          <div 
            id="games-stat-available-coins"
            onClick={onOpenBuyCoins}
            className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs hover:border-[#8BCB3D]/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1 mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                Available Coins
              </span>
              <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#17202A] font-mono">
              {(profile.coins ?? 50).toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <span>+ Buy coins</span>
            </div>
          </div>

          {/* Best Score */}
          <div 
            id="games-stat-best-score"
            className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1 mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                Best Score
              </span>
              <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <Trophy className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#17202A] font-mono">
              {bestScore > 0 ? bestScore.toLocaleString() : '-'}
            </div>
            <div className="text-[10px] text-slate-400 font-bold mt-1">
              {bestScore > 0 ? 'Across all games' : 'Play games to rank'}
            </div>
          </div>
        </div>

        {/* 2. SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games, categories, or tags..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-[#17202A] text-xs sm:text-sm font-bold border border-transparent focus:border-[#1688C9] outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-300 hover:bg-slate-400 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* 2. CATEGORY FILTER PILLS */}
        <div 
          className="flex gap-2 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs shrink-0 snap-start transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-[#8BCB3D] text-white shadow-xs font-black'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#17202A]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 3. CATALOG GRID (Smart 2-Column Mobile, 3-4 Column Web) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
              {selectedCategory} ({filteredGames.length})
            </span>
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPlay={onLaunchGame}
                  onClickDetails={(g) => setSelectedGameForDetails(g)}
                  layout="grid"
                  aspectRatio="4/3"
                  hasActiveAccess={Boolean(activeEntitlements[game.id])}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-sm font-bold text-slate-600">
                No games found matching "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Games');
                }}
                className="px-4 py-2 rounded-xl bg-[#1688C9] text-white text-xs font-black cursor-pointer hover:bg-[#1272aa] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
