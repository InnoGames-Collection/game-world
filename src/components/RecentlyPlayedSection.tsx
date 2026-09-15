/**
 * GameON Tele - Recently Played Games Horizontal Strip
 * Only renders when the user has actually played games, showing a clean horizontal strip.
 */

import React from 'react';
import { GameDefinition } from '../types';
import { Play, History } from 'lucide-react';

interface RecentlyPlayedSectionProps {
  games: GameDefinition[];
  onPlayGame: (game: GameDefinition) => void;
}

export const RecentlyPlayedSection: React.FC<RecentlyPlayedSectionProps> = ({
  games,
  onPlayGame,
}) => {
  if (!games || games.length === 0) return null;

  return (
    <section id="home-recently-played" className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <History className="w-4 h-4 text-[#1688C9]" />
        <h2 className="text-sm sm:text-base font-black text-[#17202A] tracking-tight uppercase">
          Recently Played
        </h2>
      </div>

      <div 
        className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {games.map((game) => (
          <div
            key={game.id}
            onClick={() => onPlayGame(game)}
            className="group flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shrink-0 snap-start select-none w-52 sm:w-60"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0">
              <img
                src={game.thumbnailUrl || game.bannerUrl}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-[#17202A] truncate">
                {game.title}
              </h4>
              <span className="text-[10px] text-slate-500 font-medium capitalize">
                {game.category}
              </span>
            </div>

            <div className="w-7 h-7 rounded-lg bg-[#8BCB3D] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
