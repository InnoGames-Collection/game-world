/**
 * GameON Tele - Game Details & Instructions Modal
 */

import React from 'react';
import { GameDefinition } from '../types';
import { 
  X, 
  Play, 
  Star, 
  Gamepad2, 
  BookOpen, 
  ShieldCheck, 
  Trophy, 
  Flame, 
  Sparkles,
  Coins
} from 'lucide-react';

interface GameDetailsModalProps {
  game: GameDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayGame: (game: GameDefinition) => void;
  hasActiveAccess?: boolean;
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  isOpen,
  onClose,
  onPlayGame,
  hasActiveAccess = false,
}) => {
  if (!isOpen || !game) return null;

  const isCoinGame = game.accessType === 'COIN' || (!game.isFree && Boolean(game.requiresCoins));
  const isSubscriptionGame = game.accessType === 'SUBSCRIPTION';
  const coinCost = game.coinCost || (game.id === 'world-legends' ? 15 : 10);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Artwork */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-900 overflow-hidden shrink-0">
          <img
            src={game.bannerUrl || game.thumbnailUrl}
            alt={game.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17202A] via-[#17202A]/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#8BCB3D] text-white text-[10px] font-black uppercase tracking-wider">
              {game.category}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-black/50 text-white text-[9.5px] font-bold">
              ★ {game.rating}
            </span>
          </div>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="text-2xl font-black leading-tight drop-shadow-sm">
              {game.title}
            </h2>
            <p className="text-xs text-slate-200 mt-0.5 line-clamp-1">
              {game.tagline}
            </p>
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Access</div>
              <div className="text-xs font-black text-[#17202A] mt-0.5">
                {isCoinGame ? `🪙 ${coinCost} Coins` : isSubscriptionGame ? 'Subscription' : 'Free Access'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Plays</div>
              <div className="text-xs font-black text-[#17202A] mt-0.5">
                {Math.floor(game.playsCount / 1000)}k+
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Ranking</div>
              <div className="text-xs font-black text-[#17202A] mt-0.5">
                {game.leaderboardEnabled ? 'Per-Game' : 'Practice'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h4 className="text-xs font-black text-[#17202A] uppercase tracking-wider">
              About the Game
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {game.description}
            </p>
          </div>

          {/* Instructions */}
          {game.instructions && game.instructions.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#17202A] uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-[#1688C9]" />
                <span>How to Play</span>
              </div>
              <ul className="space-y-1">
                {game.instructions.map((inst, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Controls */}
          {game.controlsDescription && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#17202A] uppercase tracking-wider">
                <Gamepad2 className="w-3.5 h-3.5 text-[#8BCB3D]" />
                <span>Controls</span>
              </div>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {game.controlsDescription}
              </p>
            </div>
          )}

          {/* Play Action */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onPlayGame(game);
              }}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                isCoinGame && !hasActiveAccess
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-[#8BCB3D] hover:bg-[#7cb934] text-white shadow-[#8BCB3D]/20'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {isCoinGame && !hasActiveAccess ? `Unlock & Play (${coinCost} Coins)` : 'Play Now'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
