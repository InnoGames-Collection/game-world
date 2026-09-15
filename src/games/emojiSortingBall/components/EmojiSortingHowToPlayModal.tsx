import React from 'react';
import { HelpCircle, X, CheckCircle, ArrowRight, Zap, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

interface EmojiSortingHowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmojiSortingHowToPlayModal: React.FC<EmojiSortingHowToPlayModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const rules = [
    {
      num: 1,
      title: 'Select Emoji Ball or Contiguous Group',
      desc: 'Tap any jewel-tone glass cylinder to lift the top emoji ball. If consecutive matching emojis are on top, they lift together as a strategic group.',
      icon: '👆',
    },
    {
      num: 2,
      title: 'Transfer to Valid Tube',
      desc: 'Tap another tube with available capacity. Emoji balls will smoothly fly and drop into place if the move is legal.',
      icon: '🎯',
    },
    {
      num: 3,
      title: 'Identical Emoji Matching Rules',
      desc: 'You can only drop an emoji ball onto an existing ball of the exact same emoji type, or into a completely empty buffer tube.',
      icon: '😀',
    },
    {
      num: 4,
      title: 'Complete Each Tube',
      desc: 'A tube is completed when it holds 4 balls of the exact same emoji. Complete all emoji tubes to win the level.',
      icon: '🧪',
    },
    {
      num: 5,
      title: 'Fewer Moves = Higher Score',
      desc: 'Every level has an optimal Par move target. Solving the puzzle with fewer moves awards significant efficiency bonus points.',
      icon: '⭐',
    },
    {
      num: 6,
      title: 'Speed & Time Efficiency',
      desc: 'Active puzzle-solving time is tracked. Fast tactical completion grants generous speed bonuses.',
      icon: '⏱️',
    },
    {
      num: 7,
      title: 'Hint Penalty (-150 PTS)',
      desc: 'Requesting hints highlights the optimal next step, but applies a competitive penalty to your level score.',
      icon: '💡',
    },
    {
      num: 8,
      title: 'Add Tube Penalty (-250 PTS)',
      desc: 'Adding an extra empty buffer tube makes the puzzle easier, but deducts 250 PTS from the final score.',
      icon: '➕',
    },
    {
      num: 9,
      title: 'Cumulative Championship Score',
      desc: 'Your total tournament score is the sum of your best scores across all completed levels. Advance through all 40 levels to dominate the leaderboard!',
      icon: '🏆',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-start items-center p-4 sm:p-6 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif] text-slate-800"
      style={{
        background: `
          radial-gradient(circle at 18% 12%, #FFE8E8 0%, transparent 48%),
          radial-gradient(circle at 82% 16%, #E8F6FF 0%, transparent 45%),
          radial-gradient(circle at 50% 45%, #F7EFFF 0%, transparent 60%),
          radial-gradient(circle at 15% 85%, #E7F9F3 0%, transparent 50%),
          radial-gradient(circle at 85% 88%, #FFE8E8 0%, transparent 45%),
          #FAF7FD
        `,
      }}
    >
      <div className="w-full max-w-lg mx-auto space-y-4 pb-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                HOW TO PLAY
              </h2>
              <p className="text-xs text-slate-500">
                Official Rules & Competitive Strategy Guide
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border border-purple-100 shadow-xs"
            aria-label="Close How To Play"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 9 Rules Cards */}
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {rules.map((rule) => (
            <div
              key={rule.num}
              className="p-3 rounded-xl bg-white/90 border border-purple-100 shadow-xs flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 font-black font-mono flex items-center justify-center shrink-0 border border-violet-200 text-xs">
                {rule.icon}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-1.5">
                  <span className="text-violet-700 font-mono">0{rule.num}.</span>
                  <span>{rule.title}</span>
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pro Tip Callout */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 shadow-xs flex items-center gap-2.5 text-xs text-amber-900">
          <Flame className="w-4 h-4 text-amber-500 shrink-0 fill-amber-500" />
          <span>
            <strong>Pro Tip:</strong> Keep one buffer tube empty as a transfer hub to avoid deadlocking your stacks!
          </span>
        </div>
      </div>
    </div>
  );
};
