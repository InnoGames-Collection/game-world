import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface GameBackButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  themeAccent?: string;
}

export const GameBackButton: React.FC<GameBackButtonProps> = ({
  onClick,
  ariaLabel = 'Back to game menu',
  className = '',
  themeAccent,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative z-40 min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 active:scale-95 text-white border border-white/20 shadow-lg backdrop-blur-md flex items-center justify-center transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-white/40 ${className}`}
      style={themeAccent ? { borderColor: `${themeAccent}50` } : undefined}
    >
      <ArrowLeft className="w-5 h-5 text-white drop-shadow" />
    </button>
  );
};
