/**
 * Candy Blast - Special Combination Visual Effects Layer
 * Multi-layer cinematic VFX for two-bomb and special+special combinations:
 * - Bomb + Bomb: Anticipation -> 5x5 Seismic Octagonal Shockwave & Core Implosion
 * - Line + Line: Dual-Axis Cross Laser Blades with Energy Streaks
 * - Line + Bomb: Mega Triple Beam Cleaver with Heavy Shockwave
 * - Color + Special: Prismatic Energy Web & Multi-Detonation Cascade
 * - Color + Color: Celestial Supernova Board-Wide Chromatic Ripple
 * 
 * Never obscures the board completely; transparent layered depth.
 */

import React from 'react';
import { Position, SpecialComboAnimation, CandyType, BlastEffect } from './types';
import { BOARD_ROWS, BOARD_COLS } from './matchLogic';

interface SpecialComboLayerProps {
  combo: SpecialComboAnimation | null;
  blastEffects?: BlastEffect[];
}

export const SpecialComboLayer: React.FC<SpecialComboLayerProps> = ({ combo, blastEffects = [] }) => {
  // Convert grid coordinates to percentage positions (0-100%)
  const getPosPercent = (pos: Position) => {
    const x = ((pos.col + 0.5) / BOARD_COLS) * 100;
    const y = ((pos.row + 0.5) / BOARD_ROWS) * 100;
    return { x, y };
  };

  const colorMap: Record<CandyType, string> = {
    'red-jelly': '#F43F5E',
    'blue-gem': '#00E5FF',
    'yellow-hexagon': '#FFD54F',
    'orange-sphere': '#FF6D00',
    'purple-candy': '#E040FB',
    'green-crystal': '#00E5FF',
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-35 overflow-hidden rounded-2xl">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          {/* Energy Tether Shader */}
          <linearGradient id="cbTetherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>

          {/* Prismatic Rainbow Filter */}
          <radialGradient id="cbSupernovaGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#E040FB" stopOpacity="0.75" />
            <stop offset="55%" stopColor="#00E5FF" stopOpacity="0.5" />
            <stop offset="85%" stopColor="#FFD54F" stopOpacity="0.25" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* 5x5 / 3x3 Bomb Shockwave Gradient */}
          <radialGradient id="cbBombShockGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#FFD54F" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#FF6D00" stopOpacity="0.45" />
            <stop offset="90%" stopColor="#D50000" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Glow Filter */}
          <filter id="cbComboGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ====================================================================
            SINGLE SPECIAL CANDY BLAST OVERLAYS (Localized Radial Shockwaves Only)
           ==================================================================== */}
        {blastEffects.map((fx) => {
          const cy = fx.row !== undefined ? ((fx.row + 0.5) / BOARD_ROWS) * 100 : 50;
          const cx = fx.col !== undefined ? ((fx.col + 0.5) / BOARD_COLS) * 100 : 50;

          return (
            <g key={fx.id} filter="url(#cbComboGlow)">
              <circle cx={cx} cy={cy} r="18" fill="url(#cbBombShockGrad)" opacity="0.8" />
              <circle cx={cx} cy={cy} r="10" fill="#FFFFFF" opacity="0.9" />
            </g>
          );
        })}

        {/* ====================================================================
            SPECIAL + SPECIAL COMBOS
           ==================================================================== */}
        {combo && (() => {
          const { type, pos1, pos2, phase, targetPositions, targetColor } = combo;
          const p1 = getPosPercent(pos1);
          const p2 = getPosPercent(pos2);
          const center = {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
          };
          const activeColor = targetColor ? colorMap[targetColor] : '#FFD54F';

          if (phase === 'anticipation') {
            return (
              <g filter="url(#cbComboGlow)">
                {/* Energy Arc between the two swapped candies */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="url(#cbTetherGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  className="animate-pulse"
                />
                {/* P1 Energy Aura */}
                <circle cx={p1.x} cy={p1.y} r="5" fill="#FFFFFF" stroke="#00E5FF" strokeWidth="1.5" className="animate-ping" />
                {/* P2 Energy Aura */}
                <circle cx={p2.x} cy={p2.y} r="5" fill="#FFFFFF" stroke="#FFD54F" strokeWidth="1.5" className="animate-ping" />
                {/* Center fusion spark */}
                <circle cx={center.x} cy={center.y} r="3" fill="#FFFFFF" />
              </g>
            );
          }

          return (
            <>
              {/* 1. BOMB + BOMB (Super 5x5 Layered Area Destruction) */}
              {type === 'bomb-5x5' && (
                <g filter="url(#cbComboGlow)">
                  {/* Concentric Octagonal Shockwave Boundaries */}
                  <polygon
                    points={`${p2.x - 32},${p2.y - 14} ${p2.x - 14},${p2.y - 32} ${p2.x + 14},${p2.y - 32} ${p2.x + 32},${p2.y - 14} ${p2.x + 32},${p2.y + 14} ${p2.x + 14},${p2.y + 32} ${p2.x - 14},${p2.y + 32} ${p2.x - 32},${p2.y + 14}`}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.8"
                    opacity="0.9"
                  />
                  {/* 8-Directional Radiant Energy Streaks */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                    const rad = (angle * Math.PI) / 180;
                    const xEnd = p2.x + Math.cos(rad) * 34;
                    const yEnd = p2.y + Math.sin(rad) * 34;
                    return (
                      <line
                        key={i}
                        x1={p2.x}
                        y1={p2.y}
                        x2={xEnd}
                        y2={yEnd}
                        stroke="#FFD54F"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </g>
              )}

              {/* 2. LINE + LINE (Dual Radial Energy Wave) */}
              {type === 'cross-laser' && (
                <g filter="url(#cbComboGlow)">
                  <circle cx={p2.x} cy={p2.y} r="24" fill="url(#cbBombShockGrad)" opacity="0.85" />
                  <circle cx={p2.x} cy={p2.y} r="12" fill="#FFFFFF" stroke="#FFD54F" strokeWidth="2" />
                  <circle cx={p2.x} cy={p2.y} r="6" fill="#00E5FF" />
                </g>
              )}

              {/* 3. LINE + BOMB (Multi-Lobed Explosive Burst) */}
              {type === 'mega-triple' && (
                <g filter="url(#cbComboGlow)">
                  <circle cx={p2.x} cy={p2.y} r="28" fill="url(#cbBombShockGrad)" opacity="0.9" />
                  <polygon 
                    points={`${p2.x},${p2.y - 14} ${p2.x + 14},${p2.y} ${p2.x},${p2.y + 14} ${p2.x - 14},${p2.y}`} 
                    fill="#FFD54F" 
                    stroke="#FFFFFF" 
                    strokeWidth="2" 
                  />
                  <circle cx={p2.x} cy={p2.y} r="6" fill="#FFFFFF" />
                </g>
              )}

              {/* 4. COLOR BOMB + SPECIAL / COLOR BOMB + CANDY */}
              {(type === 'rainbow-bomb-shockwave' || type === 'rainbow-laser-cascade' || type === 'rainbow-color-blast') && (
                <g filter="url(#cbComboGlow)">
                  {/* Connecting energy arcs from Color Bomb to all target positions */}
                  {targetPositions?.map((tPos, idx) => {
                    const targetPt = getPosPercent(tPos);
                    return (
                      <g key={idx}>
                        <line
                          x1={p2.x}
                          y1={p2.y}
                          x2={targetPt.x}
                          y2={targetPt.y}
                          stroke={activeColor}
                          strokeWidth="2"
                          strokeDasharray="3 1.5"
                        />
                        {/* Target node detonation flare */}
                        <circle cx={targetPt.x} cy={targetPt.y} r="6" fill="#FFFFFF" stroke={activeColor} strokeWidth="1.5" />
                      </g>
                    );
                  })}

                  {/* Central Color Bomb Epicenter */}
                  <circle cx={p2.x} cy={p2.y} r="14" fill="#FFFFFF" stroke="#E040FB" strokeWidth="2.5" />
                  <circle cx={p2.x} cy={p2.y} r="7" fill="#00E5FF" />
                </g>
              )}

              {/* 5. COLOR + COLOR (Cosmic Supernova Board Wipe) */}
              {type === 'cosmic-board-wipe' && (
                <g filter="url(#cbComboGlow)">
                  {/* Supernova Radiant Disc */}
                  <circle cx="50" cy="50" r="48" fill="url(#cbSupernovaGrad)" stroke="#FFFFFF" strokeWidth="2" />
                  
                  {/* Cosmic Concentric Prismatic Rings */}
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#E040FB" strokeWidth="1.5" strokeDasharray="8 4" />
                  <circle cx="50" cy="50" r="22" fill="none" stroke="#00E5FF" strokeWidth="2" />
                  <circle cx="50" cy="50" r="10" fill="#FFFFFF" stroke="#FFD54F" strokeWidth="2" />

                  {/* Radiant Starburst Flare */}
                  <path
                    d="M 50 10 L 52 48 L 90 50 L 52 52 L 50 90 L 48 52 L 10 50 L 48 48 Z"
                    fill="#FFFFFF"
                    opacity="0.9"
                  />
                </g>
              )}
            </>
          );
        })()}
      </svg>
    </div>
  );
};

