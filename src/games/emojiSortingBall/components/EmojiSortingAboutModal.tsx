import React from 'react';
import { Info, X, ShieldCheck, Sparkles, Layers } from 'lucide-react';

interface EmojiSortingAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmojiSortingAboutModal: React.FC<EmojiSortingAboutModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif] text-slate-800"
      style={{
        background: `
          radial-gradient(circle at 18% 12%, #FFE8E8 0%, transparent 48%),
          radial-gradient(circle at 82% 16%, #E8F6FF 0%, transparent 45%),
          radial-gradient(circle at 50% 45%, #F7EFFF 0%, transparent 60%),
          radial-gradient(circle at 15% 85%, #E7F9F3 0%, transparent 50%),
          radial-gradient(circle at 85% 88%, #FFE8E8 0%, transparent 45%),
          #FAF7FD
        `,
      }}
    >
      <div className="w-full max-w-md mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shadow-xs">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                ABOUT EMOJI SORTING BALL
              </h2>
              <p className="text-xs text-slate-500">Version 2026.1.0 • Tournament Edition</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border border-purple-100 shadow-xs"
            aria-label="Close About"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-white/90 border border-purple-100 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span>Game Overview</span>
            </h3>
            <p>
              <strong>Emoji Sorting Ball</strong> is a competitive 3D spatial logic puzzle. Test your tactical planning across 40 progressively demanding championship levels, featuring stylized 3D emoji vinyl spheres, authentic physical depth, and fluid Three.js graphics.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 border border-purple-100 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-pink-600" />
              <span>Mandatory Tube Palette & Rendering</span>
            </h3>
            <p>
              Cylinders are rendered in jewel-toned crystal glass using the official tournament palette: Coral Red (#FF6B6B), Aqua Cyan (#22D3EE), Royal Violet (#8B5CF6), Golden Amber (#F59E0B), Emerald (#10B981), Rose Pink (#F472B6), Electric Blue (#3B82F6), and Lime (#84CC16).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 border border-purple-100 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Solvable Championship Puzzles</span>
            </h3>
            <p>
              Every single level is mathematically guaranteed solvable. Focus on freeing up buffer tubes early, keep matching sequences together, and minimize unnecessary moves to maximize your Par Move Efficiency Score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
