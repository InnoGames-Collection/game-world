import React from 'react';

/**
 * AAA 3D CINEMATIC GAMING ENVIRONMENT
 * 
 * Features:
 * - Layered 3D digital game arena space
 * - Receding perspective platform floor with subtle depth reflections
 * - Soft volumetric conical lighting from overhead studio luminaires
 * - Floating 3D optical light motes / micro-particles
 * - Graphite, charcoal, and obsidian atmospheric depth (#090C10, #040608)
 * - Deep cinematic vignette maintaining pristine card contrast
 */
export const CinematicBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] bg-[#07090E] overflow-hidden flex flex-col items-center justify-start text-white select-none">
      {/* -------------------------------------------------------------
          LAYER 1: Deep Graphite / Obsidian Atmospheric Gradient
         ------------------------------------------------------------- */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 25%, #121824 0%, #0B0E15 45%, #05070A 85%, #030406 100%)',
        }}
      />

      {/* -------------------------------------------------------------
          LAYER 2: Receding 3D Perspective Grid Platform Floor
         ------------------------------------------------------------- */}
      <div 
        className="fixed bottom-0 inset-x-0 h-[45vh] pointer-events-none z-0 overflow-hidden opacity-30"
        style={{
          perspective: '600px',
        }}
      >
        <div 
          className="w-full h-[200%] origin-top"
          style={{
            transform: 'rotateX(68deg) translateY(-15%)',
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 15%, rgba(0,0,0,0.3) 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 15%, rgba(0,0,0,0.3) 60%, transparent 100%)',
          }}
        />
      </div>

      {/* -------------------------------------------------------------
          LAYER 3: Soft Volumetric Overhead Conical Light Beams
         ------------------------------------------------------------- */}
      <svg 
        className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-25"
        viewBox="0 0 1000 800" 
        preserveAspectRatio="none"
      >
        <defs>
          {/* Main Cool Platinum Overhead Spotlight */}
          <linearGradient id="volumetricMain" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#94A3B8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0B0E15" stopOpacity="0" />
          </linearGradient>

          {/* Left Horizon Rim Light */}
          <linearGradient id="volumetricLeft" x1="0%" y1="0%" x2="45%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
            <stop offset="65%" stopColor="#0284C7" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#07090E" stopOpacity="0" />
          </linearGradient>

          {/* Right Champagne Warm Accent */}
          <linearGradient id="volumetricRight" x1="100%" y1="0%" x2="55%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#D97706" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#07090E" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Center Overhead Spotlight Cone */}
        <polygon points="460,-40 540,-40 760,820 240,820" fill="url(#volumetricMain)" />
        {/* Left Peripheral Beam */}
        <polygon points="60,-30 200,-30 460,820 300,820" fill="url(#volumetricLeft)" />
        {/* Right Peripheral Beam */}
        <polygon points="940,-30 800,-30 540,820 700,820" fill="url(#volumetricRight)" />
      </svg>

      {/* -------------------------------------------------------------
          LAYER 4: Soft Radial Aura behind Game Card Matrix
         ------------------------------------------------------------- */}
      <div 
        className="fixed top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] sm:w-[960px] h-[580px] pointer-events-none z-0 opacity-40 blur-[100px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.15) 0%, rgba(30, 41, 59, 0.25) 50%, transparent 80%)',
        }}
      />

      {/* -------------------------------------------------------------
          LAYER 5: Horizon Platform Edge Reflection Glow
         ------------------------------------------------------------- */}
      <div 
        className="fixed bottom-[22%] inset-x-0 h-16 pointer-events-none z-0 opacity-20 blur-[30px]"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(148, 163, 184, 0.4) 0%, rgba(56, 189, 248, 0.2) 40%, transparent 75%)',
        }}
      />

      {/* -------------------------------------------------------------
          LAYER 6: Floating 3D Optical Dust Motes & Ambient Sparks
         ------------------------------------------------------------- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[18%] left-[22%] w-1.5 h-1.5 rounded-full bg-white opacity-40 shadow-[0_0_8px_#FFF] animate-pulse" />
        <div className="absolute top-[35%] left-[78%] w-2 h-2 rounded-full bg-[#38BDF8] opacity-35 shadow-[0_0_10px_#38BDF8] animate-ping" style={{ animationDuration: '4.5s' }} />
        <div className="absolute top-[62%] left-[16%] w-1.5 h-1.5 rounded-full bg-[#94A3B8] opacity-30 shadow-[0_0_6px_#94A3B8] animate-pulse" style={{ animationDuration: '3.8s' }} />
        <div className="absolute top-[50%] left-[84%] w-1.5 h-1.5 rounded-full bg-[#F59E0B] opacity-35 shadow-[0_0_8px_#F59E0B] animate-pulse" style={{ animationDuration: '5.2s' }} />
        <div className="absolute top-[75%] left-[42%] w-2 h-2 rounded-full bg-white opacity-20 shadow-[0_0_8px_#FFF] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-[28%] left-[52%] w-1 h-1 rounded-full bg-[#38BDF8] opacity-50 shadow-[0_0_6px_#38BDF8] animate-pulse" style={{ animationDuration: '2.5s' }} />
      </div>

      {/* -------------------------------------------------------------
          LAYER 7: Cinematic Depth Vignette (Preserves Contrast)
         ------------------------------------------------------------- */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          boxShadow: 'inset 0 0 160px 70px rgba(3, 4, 7, 0.88)',
        }}
      />

      {/* Content wrapper sitting cleanly above the 3D environment */}
      <div className="relative z-10 w-full flex flex-col items-center flex-1">
        {children}
      </div>
    </div>
  );
};
