/**
 * Emoji Fun — How to Play & Tournament Scoring Guide Modal
 */

import React from 'react';
import { X, Trophy, Flame, Clock, Star, Heart, Lightbulb } from 'lucide-react';
import { emojiAudio } from '../emojiAudio';

interface EmojiFunHowToPlayModalProps {
  onClose: () => void;
}

export const EmojiFunHowToPlayModal: React.FC<EmojiFunHowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md max-h-[85vh] rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border-4 border-yellow-300 text-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤔</span>
            <div>
              <h2 className="text-xl font-black font-['Fredoka',sans-serif] tracking-wide uppercase leading-none">
                How to Play Emoji Fun
              </h2>
              <p className="text-[11px] font-bold text-amber-100">Official Tournament Rules</p>
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

        {/* Scrollable Rules */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
          {/* Tournament Scoring Rules */}
          <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200">
            <div className="flex items-center gap-1.5 font-black text-purple-900 mb-1">
              <Trophy className="w-4 h-4 text-purple-700" />
              <span className="text-sm">Variable Skill Scoring</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              In tournament competition, players do <strong>not</strong> get the same score! Your score depends on:
            </p>
            <ul className="mt-1.5 space-y-1 text-slate-700 font-medium">
              <li>⚡ <strong>Response Speed:</strong> Answering within 3s awards up to a +50% speed bonus!</li>
              <li>🔥 <strong>Combo Multipliers:</strong> Consecutive correct answers build your multiplier up to 2.5x!</li>
              <li>⭐ <strong>Perfect Answer Bonus:</strong> Fast correct answers with no hints award bonus tournament points.</li>
              <li>💡 <strong>Hint Penalty:</strong> Using hints helps you survive, but slightly reduces question score by 15%.</li>
            </ul>
          </div>

          {/* Puzzle Types */}
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
              <Star className="w-4 h-4 text-amber-600" />
              <span className="text-sm">15 Unique Puzzle Categories</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Explore diverse puzzles including <strong>Odd Emoji Out</strong>, <strong>Emoji Equations</strong> (e.g. 🌧️ + ☀️ = 🌈), <strong>Emoji Sequences</strong>, <strong>Memory Flash</strong>, <strong>Guess the Movie</strong>, <strong>Category Sorting</strong>, and <strong>Opposite Emojis</strong>!
            </p>
          </div>

          {/* Lives & Hints */}
          <div className="bg-pink-50 p-3 rounded-2xl border border-pink-200">
            <div className="flex items-center gap-1.5 font-black text-pink-900 mb-1">
              <Heart className="w-4 h-4 text-pink-600" />
              <span className="text-sm">Lives & Hints System</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              You start each level with <strong>3 Lives ❤️</strong>. An incorrect answer or timer expiration consumes 1 life. Use your <strong>💡 Hints</strong> to eliminate 1 or 2 wrong answer tiles!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <button
            onClick={() => {
              emojiAudio.playTap();
              onClose();
            }}
            className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-sm uppercase tracking-wide shadow"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
