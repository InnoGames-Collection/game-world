/**
 * Solitaire Game Mode Selection Modal
 * Replicates the authentic wooden frame modal seen in the reference video:
 * Features "DRAW 1 CARD" and "DRAW 3 CARDS" with realistic card stack illustrations.
 */

import React from 'react';
import { GameMode } from '../types';
import { CardBack } from '../cardRenderer';
import { soundManager } from '../audioEngine';
import { X, Check } from 'lucide-react';

interface GameModeModalProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onClose?: () => void;
}

export const GameModeModal: React.FC<GameModeModalProps> = ({
  currentMode,
  onSelectMode,
  onClose,
}) => {
  const handleSelect = (mode: GameMode) => {
    soundManager.playButton();
    onSelectMode(mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Wooden Frame Panel inspired by video */}
      <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#3e2723] via-[#4e342e] to-[#271510] border-4 border-[#8d6e63] shadow-[0_16px_36px_rgba(0,0,0,0.6)] p-5 text-white">
        {/* Top Decorative Rivets / Bolts */}
        <div className="absolute top-2 left-3 w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow" />
        <div className="absolute top-2 right-3 w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow" />
        <div className="absolute bottom-2 left-3 w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow" />
        <div className="absolute bottom-2 right-3 w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow" />

        {/* Close Button if applicable */}
        {onClose && (
          <button
            onClick={() => {
              soundManager.playButton();
              onClose();
            }}
            className="absolute top-3 right-3 p-1 rounded-full bg-white/10 hover:bg-white/20 text-amber-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Title Header */}
        <div className="text-center mb-5">
          <h2 className="text-2xl font-black tracking-wider text-[#ffd54f] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
            GAME MODE
          </h2>
          <p className="text-xs text-amber-200/80 font-medium mt-0.5">
            Choose your Klondike card draw difficulty
          </p>
        </div>

        {/* Two Options Side by Side */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* OPTION 1: DRAW 1 CARD */}
          <div
            onClick={() => handleSelect('draw1')}
            className={`flex flex-col items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
              currentMode === 'draw1'
                ? 'bg-[#1b5e20]/80 ring-2 ring-[#4caf50] shadow-lg scale-102'
                : 'bg-black/30 hover:bg-black/40 border border-white/10'
            }`}
          >
            {/* Card Graphic: 1 single card */}
            <div className="h-28 flex items-center justify-center mb-2">
              <div className="w-16 h-24 transform hover:scale-105 transition-transform">
                <CardBack />
              </div>
            </div>

            {/* Green Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('draw1');
              }}
              className="w-full py-2 px-2 rounded-lg bg-gradient-to-b from-[#4caf50] to-[#2e7d32] hover:from-[#66bb6a] hover:to-[#388e3c] text-white font-black text-xs uppercase tracking-wide shadow-md border border-[#81c784] active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              {currentMode === 'draw1' && <Check className="w-3.5 h-3.5" />}
              <span>DRAW 1 CARD</span>
            </button>
            <span className="text-[10px] text-emerald-200 font-semibold mt-1">Easier / Strategic</span>
          </div>

          {/* OPTION 2: DRAW 3 CARDS */}
          <div
            onClick={() => handleSelect('draw3')}
            className={`flex flex-col items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
              currentMode === 'draw3'
                ? 'bg-[#1b5e20]/80 ring-2 ring-[#4caf50] shadow-lg scale-102'
                : 'bg-black/30 hover:bg-black/40 border border-white/10'
            }`}
          >
            {/* Card Graphic: 3 fanned cards */}
            <div className="h-28 flex items-center justify-center relative mb-2">
              <div className="relative w-20 h-24 flex items-center justify-center">
                <div className="absolute w-14 h-22 -rotate-12 -translate-x-3 opacity-90">
                  <CardBack />
                </div>
                <div className="absolute w-14 h-22 z-10">
                  <CardBack />
                </div>
                <div className="absolute w-14 h-22 rotate-12 translate-x-3 opacity-90">
                  <CardBack />
                </div>
              </div>
            </div>

            {/* Green Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('draw3');
              }}
              className="w-full py-2 px-2 rounded-lg bg-gradient-to-b from-[#4caf50] to-[#2e7d32] hover:from-[#66bb6a] hover:to-[#388e3c] text-white font-black text-xs uppercase tracking-wide shadow-md border border-[#81c784] active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              {currentMode === 'draw3' && <Check className="w-3.5 h-3.5" />}
              <span>DRAW 3 CARDS</span>
            </button>
            <span className="text-[10px] text-amber-200 font-semibold mt-1">Hard / Expert</span>
          </div>
        </div>
      </div>
    </div>
  );
};
