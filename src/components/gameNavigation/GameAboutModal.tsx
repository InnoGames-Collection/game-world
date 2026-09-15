import React from 'react';
import { Info, ShieldCheck, Sparkles, X, ArrowLeft } from 'lucide-react';
import { GameConfig } from './types';

interface GameAboutModalProps {
  gameConfig: GameConfig;
  onClose: () => void;
}

export const GameAboutModal: React.FC<GameAboutModalProps> = ({ gameConfig, onClose }) => {
  const { about } = gameConfig;

  return (
    <div
      id="game-about-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="relative w-full max-w-md flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/15 shadow-2xl text-white overflow-hidden">
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
            <div className="flex items-center justify-center gap-1.5 text-blue-400">
              <Info className="w-4 h-4" />
              <span className="text-xs font-black tracking-widest uppercase">ABOUT GAME</span>
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

        {/* Body */}
        <div className="p-5 space-y-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/20 mx-auto flex items-center justify-center text-4xl shadow-inner">
            {gameConfig.theme.iconEmoji}
          </div>

          <div>
            <h4 className="text-xl font-black text-white">{gameConfig.title}</h4>
            <p className="text-xs font-bold text-amber-300">{gameConfig.titleAmharic}</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              {gameConfig.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-400">Version</div>
              <div className="text-xs font-bold text-white font-mono">{about.version}</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-400">Developer</div>
              <div className="text-xs font-bold text-white truncate">{about.developer}</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 col-span-2">
              <div className="text-[10px] uppercase font-bold text-slate-400">Physics & Graphics Engine</div>
              <div className="text-xs font-bold text-slate-200">{about.engine}</div>
            </div>
          </div>

          {/* Platform Credentials */}
          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300/90 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>EthioTelecom TelePlay Verified • Ethiopian Gaming Portal</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold uppercase tracking-wider text-white border border-white/15 transition-all cursor-pointer"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
