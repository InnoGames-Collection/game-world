/**
 * Candy Blast - Original 6 Candy Vector Graphics & Enhanced Special Effects
 * Commercial Mobile-Game Quality Vector Artworks with Dimensional Shading,
 * Specular Shines, Gloss Highlights, Edge Polishing & Contact Shadows.
 * 
 * 6 Original Candy Types (PRESERVED EXACTLY AS DESIGNED):
 * 1. Red Jelly: Plump bell gumdrop with curved gloss dome & specular gleam
 * 2. Blue Gem: Brilliant-cut faceted sapphire diamond with reflective facets
 * 3. Yellow Hexagon: Dimensional beveled honeycomb prism with stepped facets
 * 4. Orange Sphere: 3D glossy citrus orb with orbital accent ring
 * 5. Purple Candy: Wrapped rounded lozenge pill with diagonal sugar swirl ribbon
 * 6. Green Crystal: Faceted octahedron emerald crystal with center light spine
 * 
 * Special Candies have high visual presence:
 * - Line Clear: Horizontal / Vertical glowing laser blades with energy emitters
 * - Area Bomb: 3x3 explosive shock core with active fuse and detonator target
 * - Color Bomb: Multi-faceted rainbow prismatic supernova core with specular luster
 */

import React from 'react';
import { CandyType, SpecialType } from './types';

interface CandyGraphicProps {
  type: CandyType;
  special?: SpecialType;
  size?: number;
  isSelected?: boolean;
  isMatched?: boolean;
  isClearing?: boolean;
  isSpawningSpecial?: boolean;
  isFormingSpecial?: boolean;
  isCharging?: boolean;
  isSpecialTriggered?: boolean;
  isReacting?: boolean;
  reactionColor?: string;
  convergeOffset?: { x: number; y: number };
  fallOffset?: number;
  className?: string;
}

export const CandyGraphic: React.FC<CandyGraphicProps> = ({
  type,
  special = 'none',
  size = 50,
  isSelected = false,
  isMatched = false,
  isClearing = false,
  isSpawningSpecial = false,
  isFormingSpecial = false,
  isCharging = false,
  isSpecialTriggered = false,
  isReacting = false,
  reactionColor,
  convergeOffset,
  fallOffset,
  className = '',
}) => {
  // Determine idle animation & glow styling for special candies
  const getSpecialGlowClass = () => {
    if (special === 'line-horizontal' || special === 'line-vertical') {
      return 'drop-shadow-[0_0_10px_rgba(0,229,255,0.85)]';
    }
    if (special === 'area-bomb') {
      return 'drop-shadow-[0_0_12px_rgba(255,140,0,0.9)]';
    }
    if (special === 'color-bomb') {
      return 'drop-shadow-[0_0_14px_rgba(232,121,249,0.9)]';
    }
    return '';
  };

  const transformStyle: React.CSSProperties = {};
  if (convergeOffset) {
    transformStyle.transform = `translate(${convergeOffset.x}px, ${convergeOffset.y}px) scale(0.65)`;
    transformStyle.opacity = 0.85;
    transformStyle.transition = 'transform 320ms cubic-bezier(0.25, 1, 0.5, 1), opacity 320ms ease-out';
  } else if (fallOffset && fallOffset > 0) {
    transformStyle.animation = `cbFallIntoCell ${Math.min(260, 120 + fallOffset * 30)}ms cubic-bezier(0.2, 0.9, 0.4, 1.05)`;
    (transformStyle as Record<string, string>)['--fall-dist'] = `${fallOffset * 100}%`;
  }

  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none transition-all ${
        isClearing
          ? 'scale-0 opacity-0 duration-150 ease-in'
          : isSpecialTriggered
          ? 'scale-125 brightness-175 duration-90 ease-out z-35 drop-shadow-[0_0_24px_#FFD54F]'
          : isCharging
          ? 'scale-92 brightness-160 duration-120 ease-in z-30'
          : isReacting
          ? 'scale-110 brightness-140 duration-90 ease-out z-25 drop-shadow-[0_0_12px_rgba(255,255,255,0.85)]'
          : isSpawningSpecial
          ? 'scale-115 brightness-135 duration-180 ease-out z-30 drop-shadow-[0_0_16px_#FFD54F]'
          : isFormingSpecial
          ? 'scale-70 brightness-130 duration-140 ease-out'
          : isMatched
          ? 'scale-105 brightness-120 duration-90'
          : isSelected
          ? 'scale-110 drop-shadow-[0_0_14px_rgba(255,213,79,0.95)] ring-2 ring-[#FFD54F]/85 rounded-full'
          : 'hover:scale-105 duration-150'
      } ${getSpecialGlowClass()} ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, ...transformStyle }}
    >
      {/* Laser / Shockwave energy reaction aura */}
      {isReacting && (
        <div 
          className="absolute inset-[-2px] rounded-xl pointer-events-none opacity-60" 
          style={{ backgroundColor: reactionColor || 'rgba(255, 255, 255, 0.4)' }}
        />
      )}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] overflow-visible"
      >
        <defs>
          <style>{`
            @keyframes cbBombCorePulse {
              0%, 100% { transform: scale(1); opacity: 0.92; }
              50% { transform: scale(1.07); opacity: 1.0; }
            }
            @keyframes cbFuseSparkle {
              0%, 100% { transform: scale(0.9); opacity: 0.8; }
              50% { transform: scale(1.4); opacity: 1.0; }
            }
            @keyframes cbMagmaGlow {
              0%, 100% { opacity: 0.75; }
              50% { opacity: 1.0; }
            }
            @keyframes cbMoteSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes cbFallIntoCell {
              0% { transform: translateY(calc(var(--fall-dist, 100%) * -1)); opacity: 0.85; }
              100% { transform: translateY(0); opacity: 1; }
            }
            @keyframes cbCandyShake {
              0% { transform: translate(0, 0) scale(0.94); }
              20% { transform: translate(-2px, 1.5px) scale(0.92); }
              40% { transform: translate(2px, -1.5px) scale(0.95); }
              60% { transform: translate(-1.5px, -1px) scale(0.97); }
              80% { transform: translate(1.5px, 1px) scale(1.0); }
              100% { transform: translate(0, 0) scale(1.02); }
            }
            .cb-bomb-core {
              transform-origin: 50px 51px;
              animation: cbBombCorePulse 1.8s ease-in-out infinite;
            }
            .cb-bomb-fuse {
              transform-origin: 60px 7px;
              animation: cbFuseSparkle 0.9s ease-in-out infinite;
            }
            .cb-bomb-magma {
              animation: cbMagmaGlow 1.4s ease-in-out infinite;
            }
            .cb-bomb-motes {
              transform-origin: 50px 50px;
              animation: cbMoteSpin 4.5s linear infinite;
            }
            .cb-reacting-candy {
              animation: cbCandyShake 0.16s ease-out infinite;
            }
          `}</style>
          {/* 1. RED JELLY SHADERS (Dimensional Gumdrop Dome) */}
          <radialGradient id="cbRedJellyGrad" cx="35%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#ffa6b7" />
            <stop offset="25%" stopColor="#f43f5e" />
            <stop offset="65%" stopColor="#be123c" />
            <stop offset="90%" stopColor="#881337" />
            <stop offset="100%" stopColor="#4c0519" />
          </radialGradient>
          <linearGradient id="cbRedJellyRim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffe4e6" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#fb7185" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4c0519" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id="cbRedInnerGlow" cx="50%" cy="80%" r="50%">
            <stop offset="0%" stopColor="#fda4af" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#be123c" stopOpacity="0" />
          </radialGradient>

          {/* 2. BLUE GEM SHADERS (Faceted Sapphire Diamond) */}
          <linearGradient id="cbBlueGemTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="35%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="cbBlueGemBottom" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="60%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>
          <linearGradient id="cbBlueGemTable" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>

          {/* 3. YELLOW HEXAGON SHADERS (Honeycomb Prism) */}
          <radialGradient id="cbYellowHexGrad" cx="35%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="30%" stopColor="#eab308" />
            <stop offset="70%" stopColor="#ca8a04" />
            <stop offset="90%" stopColor="#854d0e" />
            <stop offset="100%" stopColor="#422006" />
          </radialGradient>
          <linearGradient id="cbYellowHexRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#713f12" />
          </linearGradient>

          {/* 4. ORANGE SPHERE SHADERS (Glossy Citrus Orb) */}
          <radialGradient id="cbOrangeSphereGrad" cx="30%" cy="26%" r="70%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="22%" stopColor="#fb923c" />
            <stop offset="60%" stopColor="#ea580c" />
            <stop offset="85%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#431407" />
          </radialGradient>
          <linearGradient id="cbOrangeRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>

          {/* 5. PURPLE CANDY SHADERS (Wrapped Lozenge Swirl) */}
          <radialGradient id="cbPurpleCandyGrad" cx="34%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fae8ff" />
            <stop offset="28%" stopColor="#c084fc" />
            <stop offset="70%" stopColor="#9333ea" />
            <stop offset="90%" stopColor="#581c87" />
            <stop offset="100%" stopColor="#2e1065" />
          </radialGradient>
          <linearGradient id="cbPurpleSwirl" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#f5d0fe" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.35" />
          </linearGradient>

          {/* 6. GREEN CRYSTAL SHADERS (Octahedron Emerald) */}
          <linearGradient id="cbGreenCrystalL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="35%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="cbGreenCrystalR" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          {/* 3D SPECIAL BOMB METALLIC & PLASMA GRADIENTS */}
          <radialGradient id="cbBombAtmosphereGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF9100" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#FF3D00" stopOpacity="0.25" />
            <stop offset="85%" stopColor="#D50000" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* 3D Spherical Bomb Body with Depth Shading */}
          <radialGradient id="cbBomb3DBody" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#546E7A" />
            <stop offset="18%" stopColor="#37474F" />
            <stop offset="48%" stopColor="#263238" />
            <stop offset="78%" stopColor="#1A2228" />
            <stop offset="95%" stopColor="#0D1117" />
            <stop offset="100%" stopColor="#05070A" />
          </radialGradient>

          {/* Bomb Outer Metallic Heavy Bevel */}
          <linearGradient id="cbBombMetallicRim" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#ECEFF1" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#90A4AE" stopOpacity="0.8" />
            <stop offset="55%" stopColor="#37474F" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#78909C" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#CFD8DC" stopOpacity="0.9" />
          </linearGradient>

          {/* Multi-Layered Molten Internal Plasma Core */}
          <radialGradient id="cbBombPlasmaCore" cx="40%" cy="36%" r="62%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="20%" stopColor="#FFF176" />
            <stop offset="42%" stopColor="#FFB300" />
            <stop offset="68%" stopColor="#FF3D00" />
            <stop offset="88%" stopColor="#DD2C00" />
            <stop offset="100%" stopColor="#510000" />
          </radialGradient>

          {/* Rotating Magma Energy Band */}
          <linearGradient id="cbBombEnergySwirl" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFEA00" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#FF6D00" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#FF1744" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFD600" stopOpacity="0.95" />
          </linearGradient>

          {/* Metallic Top Cap / Igniter Plug */}
          <linearGradient id="cbBombCapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B0BEC5" />
            <stop offset="35%" stopColor="#ECEFF1" />
            <stop offset="70%" stopColor="#78909C" />
            <stop offset="100%" stopColor="#37474F" />
          </linearGradient>

          <linearGradient id="cbMetallicBevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#CBD5E0" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#4A5568" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8" />
          </linearGradient>

          {/* COLOR BOMB PRISMATIC SHADER (5-Match Super Rare) */}
          <radialGradient id="cbRainbowBombGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#f472b6" />
            <stop offset="40%" stopColor="#a855f7" />
            <stop offset="65%" stopColor="#38bdf8" />
            <stop offset="85%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#eab308" />
          </radialGradient>
          <linearGradient id="cbPrismRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#e879f9" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="75%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>

          {/* LASER GLOW FILTER */}
          <filter id="cbLaserGlow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. RED JELLY: Plump Gumdrop with Specular Dome Highlight */}
        {type === 'red-jelly' && special !== 'color-bomb' && (
          <g>
            <ellipse cx="50" cy="86" rx="36" ry="9" fill="rgba(0,0,0,0.38)" />
            <path
              d="M 22 75 C 18 64 24 38 36 24 C 42 17 58 17 64 24 C 76 38 82 64 78 75 C 75 83 66 85 50 85 C 34 85 25 83 22 75 Z"
              fill="url(#cbRedJellyGrad)"
              stroke="url(#cbRedJellyRim)"
              strokeWidth="2.5"
            />
            <path
              d="M 24 74 C 34 82 66 82 76 74 C 66 79 34 79 24 74 Z"
              fill="url(#cbRedInnerGlow)"
            />
            <path
              d="M 32 30 C 40 22 60 22 68 30 C 62 26 42 26 32 30 Z"
              fill="white"
              opacity="0.85"
            />
            <ellipse cx="40" cy="38" rx="8" ry="14" transform="rotate(-25 40 38)" fill="white" opacity="0.55" />
            <circle cx="37" cy="34" r="3.5" fill="white" opacity="0.9" />
          </g>
        )}

        {/* 2. BLUE GEM: Brilliant Diamond with Crisp Facets */}
        {type === 'blue-gem' && special !== 'color-bomb' && (
          <g>
            <ellipse cx="50" cy="88" rx="34" ry="8" fill="rgba(0,0,0,0.38)" />
            <polygon points="50,14 82,34 50,86 18,34" fill="url(#cbBlueGemBottom)" stroke="#7dd3fc" strokeWidth="1.5" />
            <polygon points="50,14 82,34 68,34 50,22 32,34 18,34" fill="url(#cbBlueGemTop)" />
            <polygon points="50,22 68,34 50,86" fill="#0284c7" opacity="0.9" />
            <polygon points="50,22 32,34 50,86" fill="#38bdf8" opacity="0.9" />
            <polygon points="32,34 50,22 68,34 50,42" fill="url(#cbBlueGemTable)" />
            <polygon points="44,24 50,22 56,24 50,28" fill="white" opacity="0.95" />
            <circle cx="50" cy="24" r="2.5" fill="white" />
          </g>
        )}

        {/* 3. YELLOW HEXAGON: Honeycomb Prism with Stepped Depth */}
        {type === 'yellow-hexagon' && special !== 'color-bomb' && (
          <g>
            <ellipse cx="50" cy="87" rx="35" ry="9" fill="rgba(0,0,0,0.38)" />
            <polygon
              points="50,14 82,32 82,68 50,86 18,68 18,32"
              fill="url(#cbYellowHexGrad)"
              stroke="url(#cbYellowHexRim)"
              strokeWidth="2.5"
            />
            <polygon points="50,24 74,38 74,62 50,76 26,62 26,38" fill="#facc15" opacity="0.75" />
            <polygon points="50,24 74,38 50,50 26,38" fill="#fef08a" opacity="0.85" />
            <polygon points="50,30 64,38 50,44 36,38" fill="white" opacity="0.75" />
            <circle cx="50" cy="36" r="3.2" fill="white" opacity="0.95" />
          </g>
        )}

        {/* 4. ORANGE SPHERE: 3D Glossy Citrus Orb */}
        {type === 'orange-sphere' && special !== 'color-bomb' && (
          <g>
            <ellipse cx="50" cy="86" rx="34" ry="10" fill="rgba(0,0,0,0.4)" />
            <circle
              cx="50"
              cy="50"
              r="34"
              fill="url(#cbOrangeSphereGrad)"
              stroke="url(#cbOrangeRingGrad)"
              strokeWidth="2.2"
            />
            <path
              d="M 22 50 C 22 36 78 36 78 50 C 78 64 22 64 22 50 Z"
              fill="none"
              stroke="#ea580c"
              strokeWidth="2.5"
              opacity="0.6"
            />
            <ellipse cx="38" cy="34" rx="14" ry="8" transform="rotate(-30 38 34)" fill="white" opacity="0.8" />
            <circle cx="34" cy="30" r="3.5" fill="white" opacity="0.95" />
            <circle cx="44" cy="34" r="2" fill="white" opacity="0.85" />
          </g>
        )}

        {/* 5. PURPLE CANDY: Wrapped Rounded Lozenge with Swirl Ribbon */}
        {type === 'purple-candy' && special !== 'color-bomb' && (
          <g>
            <ellipse cx="50" cy="87" rx="36" ry="9" fill="rgba(0,0,0,0.38)" />
            <rect
              x="18"
              y="22"
              width="64"
              height="56"
              rx="28"
              fill="url(#cbPurpleCandyGrad)"
              stroke="#f0abfc"
              strokeWidth="2.2"
            />
            <path
              d="M 24 38 Q 50 48 76 38 Q 50 62 24 38 Z"
              fill="url(#cbPurpleSwirl)"
            />
            <path
              d="M 28 54 Q 50 64 72 54 Q 50 78 28 54 Z"
              fill="url(#cbPurpleSwirl)"
              opacity="0.85"
            />
            <ellipse cx="38" cy="32" rx="12" ry="5" transform="rotate(-20 38 32)" fill="white" opacity="0.85" />
            <circle cx="34" cy="30" r="2.8" fill="white" opacity="0.95" />
          </g>
        )}

        {/* 6. GREEN CRYSTAL: Faceted Emerald Octahedron */}
        {type === 'green-crystal' && special !== 'color-bomb' && (
          <g>
            <ellipse cx="50" cy="89" rx="32" ry="8" fill="rgba(0,0,0,0.38)" />
            <polygon points="50,10 84,50 50,90 16,50" fill="url(#cbGreenCrystalL)" stroke="#6ee7b7" strokeWidth="1.6" />
            <polygon points="50,10 84,50 50,90" fill="url(#cbGreenCrystalR)" />
            <line x1="16" y1="50" x2="84" y2="50" stroke="#a7f3d0" strokeWidth="2.2" opacity="0.85" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="#ecfdf5" strokeWidth="2.8" />
            <polygon points="50,38 53,47 62,50 53,53 50,62 47,53 38,50 47,47" fill="white" opacity="0.9" />
            <ellipse cx="42" cy="26" rx="6" ry="3" transform="rotate(-30 42 26)" fill="white" opacity="0.95" />
          </g>
        )}

        {/* =========================================================
            SPECIAL COMBINATION POWERUP OVERLAYS & 3D GLOWS
           ========================================================= */}

        {/* SPECIAL RADIAL BOMB OVERLAY */}
        {(special === 'line-horizontal' || special === 'line-vertical') && (
          <g filter="url(#cbLaserGlow)">
            <circle cx="50" cy="50" r="44" fill="url(#cbBombAtmosphereGlow)" />
            <circle cx="50" cy="50" r="36" fill="url(#cbBomb3DBody)" stroke="url(#cbBombMetallicRim)" strokeWidth="3" />
            <circle cx="50" cy="51" r="24" fill="#101720" stroke="#FF8F00" strokeWidth="2" />
            <circle cx="50" cy="51" r="16" fill="url(#cbBombPlasmaCore)" stroke="#FFF9C4" strokeWidth="1.5" />
            <polygon points="50,38 53,48 63,51 53,54 50,64 47,54 37,51 47,48" fill="#FFFFFF" opacity="0.95" />
            <ellipse cx="38" cy="34" rx="10" ry="5" transform="rotate(-30 38 34)" fill="#FFFFFF" opacity="0.85" />
            <circle cx="34" cy="31" r="2.5" fill="#FFFFFF" opacity="0.95" />
          </g>
        )}

        {/* =========================================================================
            SPECIAL AREA BOMB (REAL 3D GAME POWER-UP WITH DEPTH & MULTI-LAYER PHYSICS)
            Layer 1: Soft Atmospheric Plasma Glow
            Layer 2: Metallic Chassis with 3D Spherical Volume & Drop Shadow
            Layer 3: Concentric Energy Chamber with Active Vent Slits
            Layer 4: Molten High-Energy Radiant Plasma Core
            Layer 5: Internal Energy Flare & Orbiting Sparks
            Layer 6: Dynamic Specular Reflection & Top Cap
           ========================================================================= */}
        {special === 'area-bomb' && (
          <g filter="url(#cbLaserGlow)">
            {/* LAYER 1: Soft Atmospheric Glow */}
            <circle cx="50" cy="50" r="48" fill="url(#cbBombAtmosphereGlow)" />
            
            {/* Atmospheric Ground Contact Shadow */}
            <ellipse cx="50" cy="92" rx="34" ry="7" fill="rgba(0,0,0,0.5)" />

            {/* LAYER 2: Heavy 3D Spherical Solid Body with Metallic Shading */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="url(#cbBomb3DBody)"
              stroke="url(#cbBombMetallicRim)"
              strokeWidth="3.5"
            />

            {/* Metallic Collar / Reinforced Top Vent Cap */}
            <rect x="42" y="10" width="16" height="8" rx="3" fill="url(#cbBombCapGrad)" stroke="#ECEFF1" strokeWidth="1.2" />
            {/* Active Sparking Fuse Tip */}
            <path d="M 50 10 Q 56 4 60 7" fill="none" stroke="#FFD54F" strokeWidth="2" strokeLinecap="round" />
            <circle cx="60" cy="7" r="2.8" fill="#FFFFFF" stroke="#FF6D00" strokeWidth="1.5" className="cb-bomb-fuse" />

            {/* LAYER 3: Beveled Armored Inset Chamber */}
            <circle
              cx="50"
              cy="51"
              r="28"
              fill="#101720"
              stroke="#FF8F00"
              strokeWidth="2"
            />

            {/* Energy Containment Vents / Magma Channels */}
            <path
              d="M 50 24 L 50 29 M 50 73 L 50 78 M 24 51 L 29 51 M 73 51 L 78 51 M 32 33 L 36 37 M 68 69 L 64 65 M 68 33 L 64 37 M 32 69 L 36 65"
              stroke="url(#cbBombEnergySwirl)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="cb-bomb-magma"
            />

            {/* LAYER 4: Molten High-Intensity Internal Luminous Core */}
            <g className="cb-bomb-core">
              <circle
                cx="50"
                cy="51"
                r="20"
                fill="url(#cbBombPlasmaCore)"
                stroke="#FFF9C4"
                strokeWidth="1.8"
              />

              {/* LAYER 5: Internal 4-Point Energy Flare Star */}
              <polygon
                points="50,37 53.5,47.5 64,51 53.5,54.5 50,65 46.5,54.5 36,51 46.5,47.5"
                fill="#FFFFFF"
                opacity="0.95"
              />
              {/* Secondary diagonal diamond flare */}
              <polygon
                points="50,44 54,48 57,51 54,54 50,58 46,54 43,51 46,48"
                fill="#FFF176"
                opacity="0.85"
              />
            </g>

            {/* LAYER 6: Orbiting Energy Spark Beads */}
            <g className="cb-bomb-motes">
              <circle cx="37" cy="40" r="1.8" fill="#FFFFFF" opacity="0.9" />
              <circle cx="62" cy="42" r="1.4" fill="#FFEA00" opacity="0.85" />
              <circle cx="43" cy="62" r="1.2" fill="#FFAB00" opacity="0.8" />
              <circle cx="58" cy="60" r="1.5" fill="#FFFFFF" opacity="0.9" />
            </g>

            {/* LAYER 7: Dynamic 3D Spherical Specular Highlight Arc */}
            <ellipse
              cx="38"
              cy="34"
              rx="11"
              ry="5.5"
              transform="rotate(-30 38 34)"
              fill="#FFFFFF"
              opacity="0.85"
            />
            <circle cx="34" cy="31" r="2.8" fill="#FFFFFF" opacity="0.95" />
          </g>
        )}

        {/* Dynamic Shatter/Impact Crack Overlay during radial blast shockwave */}
        {isReacting && (
          <g filter="url(#cbLaserGlow)">
            <circle cx="50" cy="50" r="42" fill="rgba(255,255,255,0.35)" />
            {/* High-intensity fracture fissures */}
            <path
              d="M 50 14 L 46 34 L 54 48 L 38 58 L 22 78 M 54 48 L 74 42 L 88 56 M 46 34 L 30 26 L 16 32 M 54 48 L 56 68 L 68 84"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 50 14 L 46 34 L 54 48 L 38 58 L 22 78 M 54 48 L 74 42 L 88 56 M 46 34 L 30 26 L 16 32 M 54 48 L 56 68 L 68 84"
              fill="none"
              stroke="#FFD54F"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="50" r="12" fill="#FFFFFF" opacity="0.85" />
          </g>
        )}

        {/* 5-MATCH COLOR BOMB (Rainbow Prismatic Core) */}
        {special === 'color-bomb' && (
          <g filter="url(#cbLaserGlow)">
            {/* Outer Rainbow Orbital Glow */}
            <circle cx="50" cy="50" r="44" fill="url(#cbRainbowBombGrad)" stroke="url(#cbPrismRim)" strokeWidth="4.5" />
            {/* 3D Beveled Casing Ring */}
            <circle cx="50" cy="50" r="36" fill="none" stroke="#FFFFFF" strokeWidth="2.2" opacity="0.8" />
            {/* Prismatic Star Core */}
            <path
              d="M 50 8 Q 50 50 92 50 Q 50 50 50 92 Q 50 50 8 50 Q 50 50 50 8 Z"
              fill="#FFFFFF"
              opacity="0.95"
            />
            {/* Radiant diagonal stars */}
            <path
              d="M 50 18 Q 50 50 82 50 Q 50 50 50 82 Q 50 50 18 50 Q 50 50 50 18 Z"
              fill="#FFD54F"
              opacity="0.9"
            />
            <circle cx="50" cy="50" r="13" fill="#FFFFFF" stroke="#00C853" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="6" fill="#E040FB" />
            <circle cx="46" cy="46" r="2.5" fill="#FFFFFF" />
          </g>
        )}
      </svg>
    </div>
  );
};

interface JellyOverlayProps {
  size?: number;
  className?: string;
}

export const JellyOverlay: React.FC<JellyOverlayProps> = ({ size = 50, className = '' }) => {
  return (
    <div
      className={`absolute inset-0 z-5 pointer-events-none rounded-xl overflow-hidden transition-all duration-200 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-emerald-400/25 border border-cyan-300/40 rounded-xl shadow-[inset_0_0_10px_rgba(0,229,255,0.4)]" />
      {/* Icy Frosting Crystals */}
      <svg viewBox="0 0 50 50" className="w-full h-full opacity-60">
        <path
          d="M 6 6 L 10 10 M 10 6 L 6 10 M 8 5 L 8 11 M 5 8 L 11 8"
          stroke="#E0F7FA"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M 40 40 L 44 44 M 44 40 L 40 44 M 42 39 L 42 45 M 39 42 L 45 42"
          stroke="#E0F7FA"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="25" cy="8" r="1.5" fill="#FFFFFF" opacity="0.8" />
        <circle cx="42" cy="20" r="1.2" fill="#FFFFFF" opacity="0.7" />
        <circle cx="8" cy="38" r="1.5" fill="#FFFFFF" opacity="0.8" />
      </svg>
    </div>
  );
};

interface BlockerGraphicProps {
  hp: number;
  maxHp?: number;
  size?: number;
  isHit?: boolean;
  className?: string;
}

export const BlockerGraphic: React.FC<BlockerGraphicProps> = ({
  hp,
  maxHp = 2,
  size = 50,
  isHit = false,
  className = '',
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none transition-transform duration-100 ${
        isHit ? 'scale-90 brightness-150' : 'hover:scale-98'
      } ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <linearGradient id="blockerBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={hp === 2 ? '#4E342E' : '#3E2723'} />
            <stop offset="45%" stopColor={hp === 2 ? '#5D4037' : '#4E342E'} />
            <stop offset="100%" stopColor="#271815" />
          </linearGradient>
          <linearGradient id="blockerRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8D6E63" />
            <stop offset="100%" stopColor="#1B0000" />
          </linearGradient>
          <linearGradient id="goldBracketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="50%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#FF6F00" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <rect x="10" y="14" width="80" height="80" rx="14" fill="#000000" opacity="0.45" />

        {/* Main Chocolate / Stone Body */}
        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          rx="14"
          fill="url(#blockerBodyGrad)"
          stroke="url(#blockerRimGrad)"
          strokeWidth="3.5"
        />

        {/* Inner Bevel Border */}
        <rect
          x="14"
          y="14"
          width="72"
          height="72"
          rx="10"
          fill="none"
          stroke="#D7CCC8"
          strokeWidth="1.6"
          opacity="0.3"
        />

        {/* Center Choco Cookie Stamp */}
        <rect
          x="26"
          y="26"
          width="48"
          height="48"
          rx="8"
          fill="#3E2723"
          stroke="#271815"
          strokeWidth="2"
          opacity="0.85"
        />
        <circle cx="38" cy="38" r="3.5" fill="#271815" />
        <circle cx="62" cy="38" r="3.5" fill="#271815" />
        <circle cx="38" cy="62" r="3.5" fill="#271815" />
        <circle cx="62" cy="62" r="3.5" fill="#271815" />
        <circle cx="50" cy="50" r="5" fill="#FFD54F" opacity="0.85" />

        {/* 2-HP Reinforced Corner Brackets */}
        {hp >= 2 && (
          <g>
            {/* Top-Left Bracket */}
            <path d="M 12 28 L 12 16 Q 12 12 16 12 L 28 12" fill="none" stroke="url(#goldBracketGrad)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="17" cy="17" r="2.2" fill="#FFE082" />
            {/* Top-Right Bracket */}
            <path d="M 88 28 L 88 16 Q 88 12 84 12 L 72 12" fill="none" stroke="url(#goldBracketGrad)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="83" cy="17" r="2.2" fill="#FFE082" />
            {/* Bottom-Left Bracket */}
            <path d="M 12 72 L 12 84 Q 12 88 16 88 L 28 88" fill="none" stroke="url(#goldBracketGrad)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="17" cy="83" r="2.2" fill="#FFE082" />
            {/* Bottom-Right Bracket */}
            <path d="M 88 72 L 88 84 Q 88 88 84 88 L 72 88" fill="none" stroke="url(#goldBracketGrad)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="83" cy="83" r="2.2" fill="#FFE082" />
          </g>
        )}

        {/* 1-HP Heavy Fracture / Cracks */}
        {hp === 1 && (
          <g>
            <path
              d="M 16 22 L 34 38 L 48 32 L 64 54 L 84 50 M 48 32 L 56 16 M 64 54 L 52 74 L 68 86 M 34 38 L 26 62 L 18 78"
              fill="none"
              stroke="#FFD54F"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 16 22 L 34 38 L 48 32 L 64 54 L 84 50"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
