/**
 * EMOJI IQ — Store Modal
 * Purchase Hints and Lives using earned tournament coins.
 */

import React from 'react';
import { EmojiIqPlayerStats } from '../types';
import { EMOJI_IQ_COLORS } from '../colors';
import { X, Lightbulb, Heart, ShoppingBag, Plus } from 'lucide-react';
import { emojiIqAudio } from '../emojiIqAudio';

interface EmojiIqStoreModalProps {
  playerStats: EmojiIqPlayerStats;
  onBuyHints: (count: number, cost: number) => void;
  onBuyLives: (count: number, cost: number) => void;
  onClose: () => void;
}

export const EmojiIqStoreModal: React.FC<EmojiIqStoreModalProps> = ({
  playerStats,
  onBuyHints,
  onBuyLives,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl flex flex-col border-2 border-[#6C5CE7]/30 animate-in zoom-in-95">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#00B8D9]/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#00B8D9]" />
            </div>
            <div className="flex flex-col">
              <h2
                className="text-lg font-black font-['Fredoka',sans-serif] tracking-wide uppercase leading-tight"
                style={{ color: EMOJI_IQ_COLORS.textPrimary }}
              >
                TOURNAMENT STORE
              </h2>
              <span className="text-[11px] font-bold text-[#6B6780]">Powerups & Hearts</span>
            </div>
          </div>

          <button
            onClick={() => {
              emojiIqAudio.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#241F3D] hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Coin Balance */}
        <div className="w-full p-3 rounded-2xl bg-[#F7F5FF] border border-[#6C5CE7]/15 flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-[#6B6780]">Your Coins</span>
          <div className="flex items-center gap-1.5 font-mono font-black text-lg text-[#241F3D]">
            <span>🪙</span>
            <span>{playerStats.coins.toLocaleString()}</span>
          </div>
        </div>

        {/* Store Items List */}
        <div className="w-full flex flex-col gap-3 mb-4">
          {/* 3 Hints Pack */}
          <div className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-[#6C5CE7]/40 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FFB703]/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-[#FFB703] fill-[#FFB703]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-[#241F3D]">+3 Equation Hints</span>
                <span className="text-[11px] font-medium text-[#6B6780]">Eliminates wrong choices</span>
              </div>
            </div>

            <button
              onClick={() => onBuyHints(3, 25)}
              disabled={playerStats.coins < 25}
              className={`px-3 py-2 rounded-xl font-black text-xs font-mono shadow-sm transition-all ${
                playerStats.coins >= 25
                  ? 'bg-[#6C5CE7] text-white hover:brightness-105 active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              25 🪙
            </button>
          </div>

          {/* Full Hearts Restore */}
          <div className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-[#6C5CE7]/40 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FF5A67]/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#FF5A67] fill-[#FF5A67]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-[#241F3D]">Restore All Lives (3 ❤️)</span>
                <span className="text-[11px] font-medium text-[#6B6780]">Reset lives to max</span>
              </div>
            </div>

            <button
              onClick={() => onBuyLives(3, 30)}
              disabled={playerStats.coins < 30 || playerStats.lives >= 3}
              className={`px-3 py-2 rounded-xl font-black text-xs font-mono shadow-sm transition-all ${
                playerStats.coins >= 30 && playerStats.lives < 3
                  ? 'bg-[#20C997] text-white hover:brightness-105 active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {playerStats.lives >= 3 ? 'Full' : '30 🪙'}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            emojiIqAudio.playPop();
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-slate-100 font-bold text-sm text-[#241F3D] hover:bg-slate-200 transition-colors"
        >
          Close Store
        </button>
      </div>
    </div>
  );
};
