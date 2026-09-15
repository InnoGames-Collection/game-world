import React from 'react';

/**
 * REVOLUTIONARY 3D CARD BACK — AAA PHYSICAL GAME OBJECT
 * 
 * Aesthetic Directives:
 * - Material: Deep graphite, rich charcoal, midnight obsidian, and brushed titanium (#141923, #0D1117, #1E2532)
 * - Bevel & Edges: Multi-tiered physical bevel with top-left specular platinum highlights and bottom-right deep drop-shadow
 * - Inset Tray: Stepped recessed bed with anisotropic micro-grain metallic texture
 * - Centerpiece: Refined, compact 3D dimensional platinum prism monolith with subtle internal luminescent core (never oversized or dominating)
 * - Corner Elements: Precision aerospace chamfered corner brackets with micro-etched alignment pips
 * - Specular Sheen: Realistic dynamic glass/metal diagonal light sheen across the surface
 */
export const PremiumCardBack: React.FC = () => {
  return (
    <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden select-none flex items-center justify-center bg-[#0D1117]">
      {/* -------------------------------------------------------------
          1. PHYSICAL 3D COMPOSITE BASE & BEVELED PERIMETER
         ------------------------------------------------------------- */}
      <div 
        className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(145deg, #1E2532 0%, #151A24 45%, #0B0E14 100%)',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.35), inset 0 -1px 2px rgba(0, 0, 0, 0.9), inset 1px 0 1px rgba(255, 255, 255, 0.15), inset -1px 0 2px rgba(0, 0, 0, 0.7)',
        }}
      />

      {/* -------------------------------------------------------------
          2. STEPPED RECESSED INNER BED (Gives Physical Depth)
         ------------------------------------------------------------- */}
      <div 
        className="absolute inset-[3px] sm:inset-[4px] rounded-[9px] sm:rounded-[12px] overflow-hidden pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, #18202C 0%, #0F141D 55%, #080B10 100%)',
          boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.85), inset 0 -1px 2px rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Subtle Anisotropic Brushed Metal Vector Texture */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-35" 
          viewBox="0 0 100 135" 
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <linearGradient id="metalSheenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#475569" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.2" />
            </linearGradient>

            <pattern id="microFacetPattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M5 0 L10 5 L5 10 L0 5 Z" stroke="#334155" strokeWidth="0.35" fill="none" opacity="0.6" />
              <circle cx="5" cy="5" r="0.5" fill="#64748B" opacity="0.4" />
            </pattern>
          </defs>

          {/* Micro Geometric Matrix */}
          <rect width="100" height="135" fill="url(#microFacetPattern)" />

          {/* Precision Aerospace Inset Frame */}
          <rect x="4" y="4" width="92" height="127" rx="6" stroke="#475569" strokeWidth="0.75" opacity="0.7" />
          <rect x="6.5" y="6.5" width="87" height="122" rx="4.5" stroke="#94A3B8" strokeWidth="0.4" strokeDasharray="4 2" opacity="0.5" />

          {/* 4 Corner High-Precision Brackets with Platinum Specular Accent */}
          {/* Top-Left */}
          <path d="M4 14 L4 4 L14 4" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="7" cy="7" r="0.8" fill="#E2E8F0" />

          {/* Top-Right */}
          <path d="M96 14 L96 4 L86 4" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="93" cy="7" r="0.8" fill="#E2E8F0" />

          {/* Bottom-Left */}
          <path d="M4 121 L4 131 L14 131" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="7" cy="128" r="0.8" fill="#E2E8F0" />

          {/* Bottom-Right */}
          <path d="M96 121 L96 131 L86 131" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="93" cy="128" r="0.8" fill="#E2E8F0" />

          {/* Subtle Outer Boundary Edge Chamfer Marks */}
          <line x1="50" y1="4" x2="50" y2="8" stroke="#64748B" strokeWidth="0.75" opacity="0.8" />
          <line x1="50" y1="127" x2="50" y2="131" stroke="#64748B" strokeWidth="0.75" opacity="0.8" />
          <line x1="4" y1="67.5" x2="8" y2="67.5" stroke="#64748B" strokeWidth="0.75" opacity="0.8" />
          <line x1="92" y1="67.5" x2="96" y2="67.5" stroke="#64748B" strokeWidth="0.75" opacity="0.8" />
        </svg>

        {/* -------------------------------------------------------------
            3. AMBIENT CORE AURA (Subtle Deep Luminescence)
           ------------------------------------------------------------- */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.06) 40%, transparent 70%)',
          }}
        />

        {/* -------------------------------------------------------------
            4. REFINED CENTRAL 3D PRISM MONOLITH
            Proportional, elegant, jewel-faceted — never dominating
           ------------------------------------------------------------- */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-10 h-14 sm:w-12 sm:h-16 flex items-center justify-center drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]">
            <svg viewBox="0 0 60 80" className="w-full h-full" fill="none">
              <defs>
                {/* Platinum Bevel Gradient */}
                <linearGradient id="prismPlatinumTop" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#E2E8F0" />
                  <stop offset="100%" stopColor="#94A3B8" />
                </linearGradient>

                {/* Titanium Shadow Gradient */}
                <linearGradient id="prismTitaniumBottom" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="60%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>

                {/* Internal Luminous Energy Core */}
                <linearGradient id="coreEnergyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#0284C7" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0369A1" stopOpacity="0.8" />
                </linearGradient>

                {/* Champagne Specular Point */}
                <radialGradient id="prismLightPoint" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <stop offset="40%" stopColor="#E0F2FE" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Recessed Outer Housing Ring */}
              <circle cx="30" cy="40" r="24" stroke="#334155" strokeWidth="0.6" opacity="0.6" />
              <circle cx="30" cy="40" r="21" stroke="#64748B" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.5" />

              {/* 3D Dimensional Faceted Diamond Body */}
              {/* Top-Left Facet (Highlighted Platinum) */}
              <polygon points="30,18 46,40 30,40" fill="url(#prismPlatinumTop)" opacity="0.95" />
              
              {/* Top-Right Facet (Mid-Tone Titanium) */}
              <polygon points="30,18 46,40 30,40" fill="#CBD5E1" opacity="0.8" transform="scale(-1, 1) translate(-60, 0)" />
              
              {/* Bottom-Left Facet (Deep Shadow) */}
              <polygon points="30,62 14,40 30,40" fill="url(#prismTitaniumBottom)" opacity="0.95" />
              
              {/* Bottom-Right Facet (Specular Reflected) */}
              <polygon points="30,62 46,40 30,40" fill="#334155" opacity="0.9" />

              {/* Raised Platinum Outer Keystones */}
              <polygon 
                points="30,18 46,40 30,62 14,40" 
                stroke="#E2E8F0" 
                strokeWidth="0.9" 
                fill="none" 
              />

              {/* Inner Floating Luminescent Jewel Prism */}
              <polygon 
                points="30,27 40,40 30,53 20,40" 
                fill="url(#coreEnergyGlow)" 
                stroke="#38BDF8" 
                strokeWidth="0.6"
                opacity="0.9"
              />

              {/* Facet Convergence Lines */}
              <line x1="30" y1="27" x2="30" y2="53" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.7" />
              <line x1="20" y1="40" x2="40" y2="40" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.7" />

              {/* Center Specular Glint */}
              <circle cx="30" cy="40" r="2" fill="url(#prismLightPoint)" />
              <circle cx="30" cy="40" r="0.8" fill="#FFFFFF" />

              {/* Micro Compass Points */}
              <line x1="30" y1="13" x2="30" y2="16" stroke="#94A3B8" strokeWidth="0.7" strokeLinecap="round" />
              <line x1="30" y1="64" x2="30" y2="67" stroke="#94A3B8" strokeWidth="0.7" strokeLinecap="round" />
              <line x1="9" y1="40" x2="12" y2="40" stroke="#94A3B8" strokeWidth="0.7" strokeLinecap="round" />
              <line x1="48" y1="40" x2="51" y2="40" stroke="#94A3B8" strokeWidth="0.7" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* -------------------------------------------------------------
            5. REALISTIC SPECULAR SURFACE LIGHT SWEEP (130-degree angle)
           ------------------------------------------------------------- */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: 'linear-gradient(130deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 22%, transparent 48%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      </div>

      {/* -------------------------------------------------------------
          6. EXTREME PERIMETER SPECULAR PLATINUM HAIRLINE
         ------------------------------------------------------------- */}
      <div 
        className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none border border-white/20"
        style={{
          boxShadow: 'inset 0 0 1px 1px rgba(255, 255, 255, 0.08)',
        }}
      />
    </div>
  );
};
