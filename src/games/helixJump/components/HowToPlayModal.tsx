/**
 * Helix Jump How To Play / Instructions Guide Modal
 * Complete 8-point gameplay breakdown with visual badges.
 */

import React from 'react';
import { X, ArrowRight, ShieldAlert, Sparkles, Flag, Zap, Trophy, RotateCw, CheckCircle } from 'lucide-react';
import { helixAudio } from '../audioEngine';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const rules = [
    {
      num: 1,
      title: 'Automatic Vertical Movement',
      desc: 'The ball bounces continuously and falls downward with realistic gravity and terminal velocity.',
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    },
    {
      num: 2,
      title: 'Rotate the Helix Tower',
      desc: 'Drag horizontally across the screen or touch display to spin the cylinder around the bouncing ball.',
      icon: RotateCw,
      color: 'text-sky-400 bg-sky-500/20 border-sky-500/30',
    },
    {
      num: 3,
      title: 'Guide Ball Through Safe Gaps',
      desc: 'Line up open ring gaps beneath the ball to plunge through consecutive platform sections.',
      icon: ArrowRight,
      color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    },
    {
      num: 4,
      title: 'Avoid RED Danger Sections',
      desc: 'Red sectors are lethal hazards! Always keep the ball away from red colored platform tiles.',
      icon: ShieldAlert,
      color: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
    },
    {
      num: 5,
      title: 'Safe Platform Progression',
      desc: 'Landing on colorful safe platforms produces safe bounces, giving you time to plan your next rotation.',
      icon: CheckCircle,
      color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    },
    {
      num: 6,
      title: 'Red Contact Causes Failure',
      desc: 'Contact with any RED section triggers immediate failure, particle shockwaves, and ends your run.',
      icon: ShieldAlert,
      color: 'text-red-400 bg-red-500/20 border-red-500/30',
    },
    {
      num: 7,
      title: 'Complete the Entire Tower',
      desc: 'Descend through all vertical ring sections to reach the checkered base ring and unlock the next level.',
      icon: Flag,
      color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    },
    {
      num: 8,
      title: 'Multipliers & High Scores',
      desc: 'Drop through 3 or more rings without touching to trigger Fire Smash combo mode for massive score bonuses!',
      icon: Trophy,
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    },
  ];

  return (
    <div
      id="helix-how-to-play-modal"
      className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider leading-none">
                How To Play
              </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-1">
                8 Core Rules of the Tower
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

        {/* Scrollable Rules List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
          {rules.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.num}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${r.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/10 text-slate-300 font-extrabold">
                      #{r.num}
                    </span>
                    {r.title}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {r.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
