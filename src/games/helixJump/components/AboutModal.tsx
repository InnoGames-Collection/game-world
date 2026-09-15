/**
 * Helix Jump About Modal
 * Game info, version, controls overview, and credits.
 */

import React from 'react';
import { X, Info, Sparkles, Gamepad2, Shield, Heart } from 'lucide-react';
import { helixAudio } from '../audioEngine';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div
      id="helix-about-modal"
      className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider leading-none">
                About
              </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-1">
                Helix Jump Edition v2.4
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              helixAudio.playButtonClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 text-xs text-slate-300">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Real 3D Physics Engine</div>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Rendered with hardware-accelerated Three.js WebGL and procedural swept-slab collision detection. Features 40 long, hand-tuned levels with progressive difficulty.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">40 Bespoke Palettes</div>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Dynamic ring color transitions, depth fogging, contact paint splatters, and fiery combo shatter explosions.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Visual Impact System</div>
              <p className="text-slate-400 mt-1 leading-relaxed">
                High-contrast danger zones with authoritative collision recoil, radial shockwaves, and spark debris physics.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center mt-1">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Teleplay Arcade
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              All Rights Reserved • v2.4.0 Final
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
