import React, { useState } from 'react';
import { getCardSymbol } from './cardSymbols';

interface FullBleedArtProps {
  symbolId: string;
}

/**
 * FULL-BLEED HERO ARTWORK ENGINE (90-95% Visible Surface)
 * 
 * Directives:
 * - High-resolution photorealistic/cinematic presentation
 * - Custom subject focal position to preserve key elements across all screen densities
 * - Sophisticated graphite/charcoal fallback atmosphere
 * - Subtle perimeter shadow to blend seamlessly with the beveled card bezel
 */
export const FullBleedCardArt: React.FC<FullBleedArtProps> = ({ symbolId }) => {
  const [hasError, setHasError] = useState(false);
  const sym = getCardSymbol(symbolId);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0B0E14] select-none">
      {!hasError ? (
        <img
          src={sym.imageUrl}
          alt={sym.name}
          loading="eager"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          style={{
            objectPosition: sym.objectPosition || 'center 38%',
          }}
          className="w-full h-full object-cover transform-gpu scale-102 transition-transform duration-500 group-hover:scale-106 pointer-events-none"
        />
      ) : (
        /* Refined Graphite / Platinum procedural fallback */
        <div 
          className="w-full h-full flex flex-col items-center justify-center pointer-events-none p-2 text-center"
          style={{ background: sym.fallbackGradient || 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}
        >
          <div className="w-10 h-10 rounded-full border border-white/25 flex items-center justify-center backdrop-blur-xs mb-1">
            <span className="text-sm font-black font-mono text-white/90">
              {sym.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-[7px] text-white/70 font-semibold tracking-wider uppercase truncate max-w-full">
            {sym.name}
          </span>
        </div>
      )}

      {/* Subtle micro-vignette at the boundaries to accent card depth without obscuring art */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 68%, rgba(11, 14, 20, 0.45) 100%)',
        }}
      />
    </div>
  );
};
