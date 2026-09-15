import React from 'react';
import { BookOpen, CheckCircle2, Lightbulb, Gamepad2, X, ArrowLeft } from 'lucide-react';
import { GameConfig } from './types';

interface GameHowToPlayModalProps {
  gameConfig: GameConfig;
  onClose: () => void;
}

export const GameHowToPlayModal: React.FC<GameHowToPlayModalProps> = ({ gameConfig, onClose }) => {
  const { howToPlay } = gameConfig;

  return (
    <div
      id="game-howtoplay-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/15 shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-cyan-400">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-black tracking-widest uppercase">RULES & GUIDE</span>
            </div>
            <h3 className="text-base font-black text-white">{gameConfig.title}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white border border-white/15 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Summary Box */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {howToPlay.summary}
            </p>
          </div>

          {/* Core Rules Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Core Rules</span>
            </h4>
            <div className="space-y-1.5">
              {howToPlay.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls Section */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30">
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 mb-1.5">
              <Gamepad2 className="w-4 h-4" />
              <span>Controls</span>
            </h4>
            <p className="text-xs text-cyan-100 font-medium leading-relaxed">
              {howToPlay.controls}
            </p>
          </div>

          {/* Pro Tips Section */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-4 h-4" />
              <span>Master Pro Tips</span>
            </h4>
            <div className="space-y-1.5">
              {howToPlay.proTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-amber-100/90 leading-snug">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold uppercase tracking-wider text-white border border-white/15 transition-all cursor-pointer"
          >
            Got It, Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
