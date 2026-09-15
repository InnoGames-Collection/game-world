/**
 * Premium 3D Glossy Block & Blocker Renderer
 * Delivers glossy specular reflections, dimensional extrusion, and rich tactile depth.
 */

import React from 'react';
import { BlockColor, BlockerType, SpecialBlockType } from './types';

interface BlockRendererProps {
  color?: BlockColor;
  blocker?: BlockerType;
  iceHits?: number;
  special?: SpecialBlockType;
  size?: number; // Size in pixels
  className?: string;
  isGhost?: boolean;
  isValidGhost?: boolean;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  color = 'cyan',
  blocker = 'none',
  iceHits = 0,
  special = 'none',
  size = 36,
  className = '',
  isGhost = false,
  isValidGhost = true,
}) => {
  // Ghost preview styling
  if (isGhost) {
    return (
      <div
        className={`rounded-md transition-all duration-100 ${
          isValidGhost
            ? 'bg-amber-400/40 border-2 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse'
            : 'bg-red-500/40 border-2 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
        } ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // 1. Stone Blocker (Indestructible Granite)
  if (blocker === 'stone') {
    return (
      <div
        className={`relative rounded-md overflow-hidden bg-gradient-to-b from-stone-500 via-stone-700 to-stone-900 border border-stone-400/60 shadow-md ${className}`}
        style={{ width: size, height: size }}
      >
        {/* Chiseled bevel highlights */}
        <div className="absolute inset-0 border-t border-l border-stone-300/40 pointer-events-none" />
        <div className="absolute inset-0 border-b border-r border-black/80 pointer-events-none" />
        {/* Granite Texture Marks */}
        <div className="absolute inset-1 border border-stone-800/60 rounded flex items-center justify-center">
          <div className="w-1/2 h-1/2 border border-stone-400/20 rotate-45" />
        </div>
      </div>
    );
  }

  // 2. Wood Blocker (Requires adjacent line clear)
  if (blocker === 'wood') {
    return (
      <div
        className={`relative rounded-md overflow-hidden bg-gradient-to-b from-[#8d4f2b] via-[#6e371a] to-[#4e240f] border border-[#b36a3c] shadow-md ${className}`}
        style={{ width: size, height: size }}
      >
        {/* Top wood bevel */}
        <div className="absolute inset-0 border-t border-l border-[#d48c5a]/60 pointer-events-none" />
        <div className="absolute inset-0 border-b border-r border-[#260f04]/90 pointer-events-none" />
        {/* Timber grain lines */}
        <div className="absolute inset-1 flex flex-col justify-between py-1 opacity-40">
          <div className="h-[1px] bg-[#d48c5a]" />
          <div className="h-[1px] bg-[#260f04]" />
          <div className="h-[1px] bg-[#d48c5a]" />
        </div>
        {/* Corner Rivets */}
        <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-[#e8a87c] shadow-[0_0_2px_#000]" />
        <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#e8a87c] shadow-[0_0_2px_#000]" />
        <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-[#e8a87c] shadow-[0_0_2px_#000]" />
        <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-[#e8a87c] shadow-[0_0_2px_#000]" />
      </div>
    );
  }

  // 3. Ice Blocker (Cracked after 1 hit, breaks after 2)
  if (blocker === 'ice') {
    const isCracked = iceHits >= 1;
    return (
      <div
        className={`relative rounded-md overflow-hidden bg-gradient-to-br from-cyan-100 via-sky-300 to-blue-500 border border-cyan-200 shadow-md ${className}`}
        style={{ width: size, height: size }}
      >
        {/* Crystal highlight */}
        <div className="absolute inset-0 border-t border-l border-white/80 pointer-events-none" />
        <div className="absolute inset-0 border-b border-r border-blue-900/60 pointer-events-none" />
        {/* Ice Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent rounded-t" />
        {/* Fracture cracks if hit once */}
        {isCracked ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 30 30" className="w-full h-full p-1 stroke-white stroke-2 fill-none drop-shadow">
              <path d="M 5,5 L 15,15 L 25,12 M 15,15 L 10,25 M 15,15 L 22,24" />
            </svg>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <div className="w-3 h-3 rotate-45 border border-white" />
          </div>
        )}
      </div>
    );
  }

  // 4. Locked Cell (Cannot be placed upon until unlocked)
  if (blocker === 'locked') {
    return (
      <div
        className={`relative rounded-md overflow-hidden bg-gradient-to-b from-[#2d1b16] to-[#1a0e0b] border border-amber-800/70 shadow-inner ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-amber-500/80">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C9.24 2 7 4.24 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.76-2.24-5-5-5zm-3 5c0-1.66 1.34-3 3-3s3 1.34 3 3v3H9V7zm3 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
          </svg>
        </div>
      </div>
    );
  }

  // 5. Standard 3D Glossy Blocks
  // Color configuration: Top shine, Body gradient, Border highlight, Bottom extrusion
  const colorStyles: Record<BlockColor, {
    from: string;
    via: string;
    to: string;
    borderTop: string;
    borderBottom: string;
    highlight: string;
    shadow: string;
  }> = {
    cyan: {
      from: '#38bdf8',
      via: '#0284c7',
      to: '#0369a1',
      borderTop: '#7dd3fc',
      borderBottom: '#075985',
      highlight: '#bae6fd',
      shadow: 'rgba(2,132,199,0.5)',
    },
    green: {
      from: '#34d399',
      via: '#059669',
      to: '#047857',
      borderTop: '#6ee7b7',
      borderBottom: '#064e3b',
      highlight: '#a7f3d0',
      shadow: 'rgba(5,150,105,0.5)',
    },
    magenta: {
      from: '#f43f5e',
      via: '#e11d48',
      to: '#be123c',
      borderTop: '#fda4af',
      borderBottom: '#9f1239',
      highlight: '#fecdd3',
      shadow: 'rgba(225,29,72,0.5)',
    },
    yellow: {
      from: '#fde047',
      via: '#eab308',
      to: '#ca8a04',
      borderTop: '#fef08a',
      borderBottom: '#a16207',
      highlight: '#fef9c3',
      shadow: 'rgba(234,179,8,0.5)',
    },
    orange: {
      from: '#fb923c',
      via: '#ea580c',
      to: '#c2410c',
      borderTop: '#fdba74',
      borderBottom: '#9a3412',
      highlight: '#ffedd5',
      shadow: 'rgba(234,88,12,0.5)',
    },
    purple: {
      from: '#c084fc',
      via: '#9333ea',
      to: '#7e22ce',
      borderTop: '#d8b4fe',
      borderBottom: '#6b21a8',
      highlight: '#f3e8ff',
      shadow: 'rgba(147,51,234,0.5)',
    },
  };

  const style = colorStyles[color] || colorStyles.cyan;

  return (
    <div
      className={`relative rounded-[6px] overflow-hidden select-none transform transition-transform duration-100 ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(180deg, ${style.from} 0%, ${style.via} 60%, ${style.to} 100%)`,
        boxShadow: `0 2px 4px rgba(0,0,0,0.4), inset 0 1px 1px ${style.borderTop}, inset 0 -2px 1px ${style.borderBottom}`,
      }}
    >
      {/* 3D Top Bevel Specular Highlight */}
      <div
        className="absolute top-[2px] left-[2px] right-[2px] h-[38%] rounded-t-[4px] pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${style.highlight} 0%, rgba(255,255,255,0.05) 100%)`,
          opacity: 0.85,
        }}
      />

      {/* Side extruded highlight */}
      <div
        className="absolute top-0 left-0 bottom-0 w-[2px] pointer-events-none"
        style={{ background: style.borderTop, opacity: 0.6 }}
      />
      <div
        className="absolute top-0 right-0 bottom-0 w-[2px] pointer-events-none"
        style={{ background: style.borderBottom, opacity: 0.8 }}
      />

      {/* Special Block Badges */}
      {special === 'bomb' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-slate-950 border border-amber-300 flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-[10px] leading-none">💣</span>
          </div>
        </div>
      )}

      {special === 'line_h' && (
        <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
          </svg>
        </div>
      )}

      {special === 'line_v' && (
        <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow">
          <svg className="w-4 h-4 rotate-90" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
          </svg>
        </div>
      )}
    </div>
  );
};
