/**
 * Emoji Fun — In-Game Store Modal
 * Purchase hints, extra lives, and cosmetic effects with coins (No pay-to-win score inflation)
 */

import React from 'react';
import { X, Lightbulb, Heart, Sparkles, Coins, ShoppingBag } from 'lucide-react';
import { emojiAudio } from '../emojiAudio';

interface EmojiFunStoreModalProps {
  coins: number;
  availableHints: number;
  onBuyItem: (itemId: string, costCoins: number, itemType: 'HINT' | 'LIFE' | 'THEME') => void;
  onClose: () => void;
}

export const EmojiFunStoreModal: React.FC<EmojiFunStoreModalProps> = ({
  coins,
  availableHints,
  onBuyItem,
  onClose,
}) => {
  const storeItems = [
    {
      id: 'hint_pack_3',
      name: '3x Puzzle Hints',
      description: 'Removes 1-2 wrong answers on tricky questions',
      icon: '💡',
      costCoins: 30,
      type: 'HINT' as const,
      badge: 'POPULAR',
    },
    {
      id: 'hint_pack_8',
      name: '8x Mega Hints',
      description: 'Stock up for tough tournament levels',
      icon: '💡',
      costCoins: 70,
      type: 'HINT' as const,
      badge: 'BEST VALUE',
    },
    {
      id: 'extra_life_refill',
      name: 'Full Lives Refill',
      description: 'Instantly restore all 3 heart lives',
      icon: '❤️',
      costCoins: 40,
      type: 'LIFE' as const,
    },
    {
      id: 'golden_sparkle_theme',
      name: 'Golden Sparkles Effect',
      description: 'Unlock special gold celebration animations',
      icon: '✨',
      costCoins: 100,
      type: 'THEME' as const,
      badge: 'COSMETIC',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#4db6ac] to-[#00897b] p-5 shadow-2xl border-4 border-white/70 text-white flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🛍️</span>
            <div>
              <h2 className="text-2xl font-black font-['Fredoka',sans-serif] tracking-wide uppercase leading-none">
                Emoji Store
              </h2>
              <p className="text-[11px] font-bold text-teal-100">Helpful boosts & cosmetics</p>
            </div>
          </div>

          <button
            onClick={() => {
              emojiAudio.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Bar */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-2.5 mb-3 flex items-center justify-between border border-white/40">
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <span>Current Balance:</span>
          </div>
          <div className="flex items-center gap-1 bg-amber-400 text-amber-950 px-3 py-1 rounded-full font-black text-xs shadow-sm">
            <span>🪙</span>
            <span>{coins} Coins</span>
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {storeItems.map((item) => {
            const canAfford = coins >= item.costCoins;

            return (
              <div
                key={item.id}
                className="bg-white/90 text-slate-800 rounded-2xl p-3 shadow-md flex items-center justify-between gap-2 border border-white"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm text-slate-900">{item.name}</span>
                      {item.badge && (
                        <span className="text-[9px] font-black uppercase bg-teal-600 text-white px-1.5 py-0.5 rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium block leading-tight">
                      {item.description}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (canAfford) {
                      emojiAudio.playTap();
                      onBuyItem(item.id, item.costCoins, item.type);
                    }
                  }}
                  disabled={!canAfford}
                  className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1 shadow transition-all ${
                    canAfford
                      ? 'bg-[#26a69a] hover:bg-[#00897b] active:scale-95 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>🪙</span>
                  <span>{item.costCoins}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            emojiAudio.playTap();
            onClose();
          }}
          className="w-full mt-4 py-2.5 rounded-2xl bg-white/30 hover:bg-white/40 active:scale-98 text-white font-black text-sm tracking-wider uppercase"
        >
          Done
        </button>
      </div>
    </div>
  );
};
