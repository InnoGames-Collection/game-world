/**
 * How to Play Tutorial Modal
 */

import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const rules = [
    {
      step: '1',
      title: 'Drag Pieces',
      desc: 'Touch and drag block shapes from the bottom tray onto the 10x10 board.',
    },
    {
      step: '2',
      title: 'Fill Rows & Columns',
      desc: 'Form complete 10-cell horizontal lines or vertical columns to clear them.',
    },
    {
      step: '3',
      title: 'Multi-Line Combos',
      desc: 'Clearing 2 or more lines simultaneously awards huge combo bonus points!',
    },
    {
      step: '4',
      title: 'Break Blockers',
      desc: 'Clear lines adjacent to Wood and Ice blocks to damage and shatter them.',
    },
    {
      step: '5',
      title: 'Plan Ahead',
      desc: 'The game ends when none of your 3 tray pieces can fit on the board. Keep open space!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#6b2a12] via-[#4e1d0c] to-[#2c0d05] border-2 border-[#d97c38] shadow-[0_20px_40px_rgba(0,0,0,0.8)] p-6 flex flex-col items-center gap-4 text-amber-100">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <h2 className="text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow">
            HOW TO PLAY
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-[#341107] border border-[#6e2e14] text-amber-300 flex items-center justify-center cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="w-full flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {rules.map((rule) => (
            <div
              key={rule.step}
              className="p-3 rounded-xl bg-[#240c06]/80 border border-[#8a3f20]/50 flex items-start gap-3 shadow-inner"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
                {rule.step}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-amber-300">{rule.title}</span>
                <span className="text-xs text-amber-100/80 leading-snug mt-0.5">{rule.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-black text-sm shadow-lg border border-amber-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
        >
          <CheckCircle className="w-4 h-4 stroke-[2.5]" />
          <span>GOT IT!</span>
        </button>
      </div>
    </div>
  );
};
