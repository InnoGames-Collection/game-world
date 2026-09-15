/**
 * 7-Day Daily Login Streak Reward Modal
 */

import React from 'react';
import { UserProfile } from '../types';
import { DAILY_REWARD_LADDER } from '../services/demoData';
import { 
  X, 
  Flame, 
  Coins, 
  Check, 
  Gift, 
  Sparkles, 
  Lock 
} from 'lucide-react';

interface DailyRewardModalProps {
  profile: UserProfile;
  onClose: () => void;
  onClaim: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  profile,
  onClose,
  onClaim,
}) => {
  const currentStreakDay = ((profile.streak.current - 1) % 7) + 1;
  const canClaim = !profile.streak.hasClaimedToday;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 mx-auto mb-2.5 flex items-center justify-center text-amber-700">
            <Flame className="w-8 h-8 fill-current" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Daily Streak Rewards</h3>
          <p className="text-xs text-slate-600">
            Log in every day to claim bonus coins and the Day 7 Grand Walia Chest!
          </p>
        </div>

        {/* 7-Day Ladder Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
          {DAILY_REWARD_LADDER.map((item) => {
            const isPast = item.day < currentStreakDay;
            const isCurrent = item.day === currentStreakDay;

            return (
              <div
                key={item.day}
                className={`relative rounded-xl p-2.5 flex flex-col items-center justify-between border text-center transition-all ${
                  isCurrent
                    ? 'bg-blue-50/50 border-[#0057A8] ring-2 ring-[#0057A8]/30 scale-105 shadow-sm'
                    : isPast
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-slate-50 border-slate-200'
                } ${item.special ? 'sm:col-span-1 col-span-2' : ''}`}
              >
                <span className="text-[10px] font-bold text-slate-500">Day {item.day}</span>

                <div className="my-1.5 flex flex-col items-center">
                  {item.special ? (
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Gift className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-amber-600">
                      <Coins className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                    +{item.coins}
                  </span>
                </div>

                {isPast ? (
                  <div className="w-4 h-4 rounded-full bg-[#78BE20] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : isCurrent ? (
                  <span className="text-[9px] font-bold text-[#0057A8] uppercase">Today</span>
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Action */}
        {canClaim ? (
          <button
            onClick={() => {
              onClaim();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-[#78BE20] hover:bg-[#68a81b] text-white font-extrabold text-sm active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>CLAIM DAY {currentStreakDay} REWARD</span>
          </button>
        ) : (
          <div className="text-center py-2 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium">
            You have already claimed today's reward. Streak continues tomorrow!
          </div>
        )}
      </div>
    </div>
  );
};

