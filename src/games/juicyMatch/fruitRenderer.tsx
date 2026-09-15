/**
 * Juicy Match - 3D Glossy Fruit & Blocker Renderer
 * Delivers volume, specular highlights, rim lighting, and vibrant visual appeal
 */

import React from 'react';
import { FruitType, SpecialType, BlockerType, UnderlayType } from './types';

interface FruitProps {
  type: FruitType;
  special?: SpecialType;
  size?: number;
  className?: string;
  isMatched?: boolean;
}

export const FruitGraphic: React.FC<FruitProps> = ({
  type,
  special = 'none',
  size = 52,
  className = '',
  isMatched = false,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        transform: isMatched ? 'scale(1.2)' : 'scale(1)',
        opacity: isMatched ? 0.7 : 1,
        transition: 'transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 180ms ease-out',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        className="overflow-visible filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]"
      >
        <defs>
          {/* Strawberry Gradients */}
          <radialGradient id="strawberryGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ff4d6d" />
            <stop offset="45%" stopColor="#e60039" />
            <stop offset="85%" stopColor="#b30029" />
            <stop offset="100%" stopColor="#80001a" />
          </radialGradient>
          <linearGradient id="strawberryLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="60%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          {/* Blueberry Gradients */}
          <radialGradient id="blueberryGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="35%" stopColor="#3b82f6" />
            <stop offset="75%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>

          {/* Kiwi Gradients */}
          <radialGradient id="kiwiGrad" cx="38%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#a3e635" />
            <stop offset="50%" stopColor="#84cc16" />
            <stop offset="85%" stopColor="#65a30d" />
            <stop offset="100%" stopColor="#4d7c0f" />
          </radialGradient>
          <radialGradient id="kiwiCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#d9f99d" />
            <stop offset="100%" stopColor="#bef264" />
          </radialGradient>

          {/* Banana Gradients */}
          <radialGradient id="bananaGrad" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#facc15" />
            <stop offset="80%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </radialGradient>

          {/* Grape Gradients */}
          <radialGradient id="grapeGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="45%" stopColor="#9333ea" />
            <stop offset="80%" stopColor="#7e22ce" />
            <stop offset="100%" stopColor="#581c87" />
          </radialGradient>

          {/* Orange Gradients */}
          <radialGradient id="orangeGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="40%" stopColor="#fb923c" />
            <stop offset="80%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>

          {/* Rainbow Super Fruit Gradient */}
          <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="20%" stopColor="#fb923c" />
            <stop offset="40%" stopColor="#facc15" />
            <stop offset="60%" stopColor="#4ade80" />
            <stop offset="80%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          {/* Bomb Core Gradient */}
          <radialGradient id="bombCoreGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="40%" stopColor="#334155" />
            <stop offset="80%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>

        {/* 1. Base Fruit Rendering */}
        {special === 'rainbow' ? (
          <g>
            {/* Rainbow Disco Orb */}
            <circle cx="50" cy="50" r="42" fill="url(#rainbowGrad)" />
            {/* Rainbow swirls */}
            <path
              d="M 50 12 A 38 38 0 0 1 88 50 A 38 38 0 0 1 50 88 A 38 38 0 0 1 12 50 A 38 38 0 0 1 50 12 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeDasharray="8 6"
              opacity="0.85"
            />
            {/* Glossy top-left highlight */}
            <ellipse cx="36" cy="30" rx="14" ry="8" transform="rotate(-30 36 30)" fill="#ffffff" opacity="0.6" />
            {/* Center sparkle star */}
            <path
              d="M 50 28 L 54 44 L 70 50 L 54 56 L 50 72 L 46 56 L 30 50 L 46 44 Z"
              fill="#ffffff"
              filter="drop-shadow(0 0 4px #ffffff)"
            />
          </g>
        ) : type === 'strawberry' ? (
          <g>
            {/* Strawberry Body */}
            <path
              d="M 50 92 C 28 92 14 68 18 42 C 20 28 32 20 50 20 C 68 20 80 28 82 42 C 86 68 72 92 50 92 Z"
              fill="url(#strawberryGrad)"
            />
            {/* 3D Curved Specular Highlight */}
            <path
              d="M 28 36 C 30 26 40 23 52 23 C 44 26 34 32 30 46 C 26 39 27 37 28 36 Z"
              fill="#ffffff"
              opacity="0.55"
            />
            {/* Yellow Achene Seeds */}
            {[
              [35, 42], [50, 40], [65, 42],
              [28, 54], [43, 53], [58, 54], [72, 55],
              [36, 66], [50, 65], [64, 66],
              [44, 76], [56, 76],
              [50, 84]
            ].map(([sx, sy], idx) => (
              <ellipse
                key={idx}
                cx={sx}
                cy={sy}
                rx="2"
                ry="3"
                transform={`rotate(${sx > 50 ? 15 : -15} ${sx} ${sy})`}
                fill="#fef08a"
                opacity="0.9"
              />
            ))}
            {/* Green Calyx Leaves */}
            <path
              d="M 50 22 C 45 10 32 8 26 12 C 34 16 38 22 40 25 C 32 22 20 25 15 32 C 25 31 35 28 42 27 C 40 33 42 38 45 42 C 48 35 50 28 50 25 C 50 28 52 35 55 42 C 58 38 60 33 58 27 C 65 28 75 31 85 32 C 80 25 68 22 60 25 C 62 22 66 16 74 12 C 68 8 55 10 50 22 Z"
              fill="url(#strawberryLeaf)"
            />
            {/* Top Stem */}
            <path d="M 50 22 Q 48 10 55 6" stroke="#15803d" strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        ) : type === 'blueberry' ? (
          <g>
            {/* Blueberry Globe */}
            <circle cx="50" cy="52" r="40" fill="url(#blueberryGrad)" />
            {/* Deep recessed top blossom star */}
            <circle cx="50" cy="24" r="10" fill="#172554" />
            <path
              d="M 50 16 L 53 22 L 60 21 L 56 26 L 59 32 L 52 29 L 48 32 L 51 26 L 47 21 L 54 22 Z"
              fill="#1e3a8a"
              stroke="#60a5fa"
              strokeWidth="1.2"
            />
            {/* Glossy Curved Highlight */}
            <ellipse cx="34" cy="38" rx="14" ry="8" transform="rotate(-35 34 38)" fill="#ffffff" opacity="0.65" />
            <circle cx="28" cy="46" r="3" fill="#ffffff" opacity="0.4" />
          </g>
        ) : type === 'kiwi' ? (
          <g>
            {/* Kiwi Outer Ring */}
            <circle cx="50" cy="50" r="41" fill="url(#kiwiGrad)" />
            {/* Pale Cream Center Disc */}
            <ellipse cx="50" cy="50" rx="20" ry="18" fill="url(#kiwiCenter)" />
            {/* Kiwi Center Core */}
            <ellipse cx="50" cy="50" rx="8" ry="7" fill="#fef08a" />
            {/* Radiating Kiwi Seeds Ring */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              const kx = 50 + Math.cos(rad) * 23;
              const ky = 50 + Math.sin(rad) * 21;
              return (
                <ellipse
                  key={idx}
                  cx={kx}
                  cy={ky}
                  rx="2"
                  ry="3.2"
                  transform={`rotate(${angle + 90} ${kx} ${ky})`}
                  fill="#1c1917"
                />
              );
            })}
            {/* Glossy Top Arch */}
            <path
              d="M 22 42 C 26 26 40 18 58 18 C 42 20 30 28 26 44 Z"
              fill="#ffffff"
              opacity="0.65"
            />
          </g>
        ) : type === 'banana' ? (
          <g>
            {/* Banana Crescent Body */}
            <path
              d="M 22 28 C 16 52 32 84 76 86 C 84 86 86 82 82 78 C 48 76 34 54 40 28 C 42 22 26 20 22 28 Z"
              fill="url(#bananaGrad)"
            />
            {/* Subtle Middle Peel Ridge */}
            <path
              d="M 28 30 C 26 54 42 78 78 80"
              fill="none"
              stroke="#ca8a04"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* Glossy Arch Highlight */}
            <path
              d="M 26 34 C 23 48 30 68 56 78 C 38 70 30 52 32 38 Z"
              fill="#ffffff"
              opacity="0.75"
            />
            {/* Top Stem & Tip */}
            <path d="M 24 24 L 20 16" stroke="#713f12" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="82" cy="82" r="3" fill="#854d0e" />
          </g>
        ) : type === 'grape' ? (
          <g>
            {/* Grapes Cluster (7 glossy globes) */}
            <circle cx="34" cy="40" r="14" fill="url(#grapeGrad)" />
            <circle cx="64" cy="38" r="14" fill="url(#grapeGrad)" />
            <circle cx="48" cy="44" r="15" fill="url(#grapeGrad)" />
            <circle cx="32" cy="62" r="13" fill="url(#grapeGrad)" />
            <circle cx="62" cy="60" r="13" fill="url(#grapeGrad)" />
            <circle cx="48" cy="66" r="14" fill="url(#grapeGrad)" />
            <circle cx="48" cy="84" r="11" fill="url(#grapeGrad)" />

            {/* Specular highlights on grapes */}
            <circle cx="30" cy="36" r="3.5" fill="#ffffff" opacity="0.6" />
            <circle cx="60" cy="34" r="3.5" fill="#ffffff" opacity="0.6" />
            <circle cx="44" cy="40" r="4" fill="#ffffff" opacity="0.7" />
            <circle cx="28" cy="58" r="3" fill="#ffffff" opacity="0.6" />
            <circle cx="58" cy="56" r="3" fill="#ffffff" opacity="0.6" />
            <circle cx="44" cy="62" r="3.5" fill="#ffffff" opacity="0.6" />

            {/* Top Vine & Leaf */}
            <path d="M 48 30 Q 48 16 54 10" stroke="#15803d" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path
              d="M 52 24 C 62 16 74 20 72 28 C 66 26 58 28 52 24 Z"
              fill="#22c55e"
            />
          </g>
        ) : (
          /* Orange / Citrus */
          <g>
            {/* Orange Globe */}
            <circle cx="50" cy="52" r="40" fill="url(#orangeGrad)" />
            {/* Citrus skin subtle pores */}
            {[
              [30, 40], [38, 56], [48, 68], [62, 52], [68, 38], [52, 38]
            ].map(([px, py], i) => (
              <circle key={i} cx={px} cy={py} r="1" fill="#c2410c" opacity="0.5" />
            ))}
            {/* Glossy Top-Left Sheen */}
            <ellipse cx="36" cy="36" rx="14" ry="9" transform="rotate(-30 36 36)" fill="#ffffff" opacity="0.65" />
            <circle cx="28" cy="45" r="3" fill="#ffffff" opacity="0.4" />
            {/* Green Leaf on top */}
            <path d="M 50 16 L 50 20" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
            <ellipse cx="58" cy="18" rx="8" ry="4" transform="rotate(20 58 18)" fill="#22c55e" />
          </g>
        )}

        {/* 2. Special Fruit Overlays */}
        {special === 'striped_h' && (
          <g>
            {/* Horizontal Glowing Energy Stripes */}
            <rect x="4" y="32" width="92" height="7" rx="3.5" fill="#ffffff" opacity="0.9" filter="drop-shadow(0 0 4px #ffffff)" />
            <rect x="4" y="58" width="92" height="7" rx="3.5" fill="#ffffff" opacity="0.9" filter="drop-shadow(0 0 4px #ffffff)" />
            <line x1="2" y1="35.5" x2="98" y2="35.5" stroke="#facc15" strokeWidth="2.5" />
            <line x1="2" y1="61.5" x2="98" y2="61.5" stroke="#facc15" strokeWidth="2.5" />
          </g>
        )}

        {special === 'striped_v' && (
          <g>
            {/* Vertical Glowing Energy Stripes */}
            <rect x="32" y="4" width="7" height="92" rx="3.5" fill="#ffffff" opacity="0.9" filter="drop-shadow(0 0 4px #ffffff)" />
            <rect x="58" y="4" width="7" height="92" rx="3.5" fill="#ffffff" opacity="0.9" filter="drop-shadow(0 0 4px #ffffff)" />
            <line x1="35.5" y1="2" x2="35.5" y2="98" stroke="#facc15" strokeWidth="2.5" />
            <line x1="61.5" y1="2" x2="61.5" y2="98" stroke="#facc15" strokeWidth="2.5" />
          </g>
        )}

        {special === 'bomb' && (
          <g>
            {/* Fruit Bomb Wrapper / Ring */}
            <circle cx="50" cy="50" r="44" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="10 5" />
            <circle cx="50" cy="50" r="16" fill="#f43f5e" opacity="0.85" filter="drop-shadow(0 0 6px #ef4444)" />
            {/* Spark fuse icon */}
            <path d="M 50 12 Q 62 4 68 8" stroke="#facc15" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="68" cy="8" r="4" fill="#ffffff" filter="drop-shadow(0 0 4px #facc15)" />
            <text x="50" y="56" textAnchor="middle" fontSize="18" fill="#ffffff" fontWeight="bold">💣</text>
          </g>
        )}
      </svg>
    </div>
  );
};

export const BlockerGraphic: React.FC<{ type: BlockerType; size?: number }> = ({ type, size = 52 }) => {
  return (
    <div className="relative flex items-center justify-center select-none pointer-events-none" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
        {type === 'crate_1' || type === 'crate_2' || type === 'crate_3' ? (
          <g>
            {/* Wooden Crate Box */}
            <rect x="6" y="6" width="88" height="88" rx="10" fill="#78350f" stroke="#451a03" strokeWidth="4" />
            {/* Interior Planks */}
            <rect x="14" y="14" width="72" height="72" rx="6" fill="#b45309" />
            {/* Cross Planks */}
            <line x1="14" y1="14" x2="86" y2="86" stroke="#78350f" strokeWidth="8" />
            <line x1="86" y1="14" x2="14" y2="86" stroke="#78350f" strokeWidth="8" />
            {/* Corner Iron Brackets */}
            <circle cx="16" cy="16" r="4" fill="#64748b" />
            <circle cx="84" cy="16" r="4" fill="#64748b" />
            <circle cx="16" cy="84" r="4" fill="#64748b" />
            <circle cx="84" cy="84" r="4" fill="#64748b" />

            {type === 'crate_2' && (
              <g>
                {/* Reinforced Metal Band */}
                <rect x="42" y="6" width="16" height="88" fill="#475569" opacity="0.9" stroke="#1e293b" strokeWidth="2" />
                <circle cx="50" cy="20" r="3" fill="#cbd5e1" />
                <circle cx="50" cy="80" r="3" fill="#cbd5e1" />
              </g>
            )}

            {type === 'crate_3' && (
              <g>
                {/* Heavy Steel Strapping */}
                <rect x="42" y="6" width="16" height="88" fill="#334155" stroke="#0f172a" strokeWidth="2" />
                <rect x="6" y="42" width="88" height="16" fill="#334155" stroke="#0f172a" strokeWidth="2" />
                <circle cx="50" cy="50" r="6" fill="#e2e8f0" />
              </g>
            )}
          </g>
        ) : type === 'chest' ? (
          <g>
            {/* Treasure Chest */}
            <rect x="10" y="34" width="80" height="56" rx="8" fill="#92400e" stroke="#451a03" strokeWidth="4" />
            {/* Curved Lid */}
            <path d="M 8 34 C 8 16 92 16 92 34 Z" fill="#b45309" stroke="#451a03" strokeWidth="4" />
            {/* Gold Metal Trim Bands */}
            <rect x="22" y="18" width="10" height="72" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
            <rect x="68" y="18" width="10" height="72" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
            {/* Gold Lock Plate */}
            <rect x="42" y="32" width="16" height="20" rx="3" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
            <circle cx="50" cy="40" r="3" fill="#451a03" />
            <line x1="50" y1="40" x2="50" y2="48" stroke="#451a03" strokeWidth="2" />
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export const UnderlayGraphic: React.FC<{ type: UnderlayType; size?: number }> = ({ type, size = 52 }) => {
  if (type === 'none') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id="juicePuddleGrad" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="45%" stopColor="#fb923c" />
            <stop offset="85%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
        </defs>
        {/* Organic Juice Splash Puddle */}
        <path
          d="M 50 10 C 68 12 86 24 88 44 C 90 62 78 84 56 88 C 34 90 14 80 10 58 C 8 36 26 12 50 10 Z"
          fill="url(#juicePuddleGrad)"
          opacity={type === 'juice_2' ? 0.95 : 0.75}
        />
        {/* Secondary splash droplet */}
        <circle cx="20" cy="22" r="6" fill="#fb923c" opacity="0.8" />
        <circle cx="82" cy="74" r="5" fill="#ea580c" opacity="0.8" />
        {/* Glossy highlight on puddle */}
        <ellipse cx="42" cy="32" rx="18" ry="8" transform="rotate(-15 42 32)" fill="#ffffff" opacity="0.5" />
      </svg>
    </div>
  );
};

export const OverlayGraphic: React.FC<{ type: 'ice' | 'chain'; size?: number }> = ({ type, size = 52 }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {type === 'ice' ? (
          <g>
            {/* Translucent Frost Ice Block */}
            <rect x="6" y="6" width="88" height="88" rx="14" fill="#38bdf8" opacity="0.45" stroke="#bae6fd" strokeWidth="3" />
            {/* Ice cracks */}
            <path d="M 12 24 L 38 42 L 32 64 L 62 78" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.8" />
            <path d="M 82 20 L 58 38 L 74 62" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.8" />
          </g>
        ) : (
          <g>
            {/* Interlocking Metal Chains */}
            <path d="M 12 12 L 88 88" stroke="#cbd5e1" strokeWidth="8" strokeDasharray="14 6" strokeLinecap="round" />
            <path d="M 88 12 L 12 88" stroke="#94a3b8" strokeWidth="8" strokeDasharray="14 6" strokeLinecap="round" />
            {/* Center Golden Padlock */}
            <rect x="40" y="44" width="20" height="22" rx="4" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
            <path d="M 44 44 L 44 36 C 44 32 56 32 56 36 L 56 44" stroke="#e2e8f0" strokeWidth="3" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
};
