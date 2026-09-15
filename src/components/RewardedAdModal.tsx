/**
 * Rewarded Video Ad Showcase Modal
 * Simulates rewarded partner video/banner ads from EthioTelecom and TeleBirr
 */

import React, { useState, useEffect } from 'react';
import { RewardedAdState } from '../types';
import { DEMO_TELECOM_ADS } from '../services/demoData';
import { 
  Tv, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Zap, 
  Coins,
  ShieldCheck
} from 'lucide-react';

interface RewardedAdModalProps {
  adState: RewardedAdState;
  onClose: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({ adState, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);

  // Pick random telecom showcase ad
  const [adContent] = useState(() => {
    return DEMO_TELECOM_ADS[Math.floor(Math.random() * DEMO_TELECOM_ADS.length)];
  });

  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setTimeout(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsCompleted(true);
    }
  }, [secondsLeft]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-[#70C922]/50 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Ad Banner Header */}
        <div className="px-4 py-3 bg-[#05234A] border-b border-[#0B3B70] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-orange-500 text-white font-extrabold text-[10px] uppercase">
              AD
            </span>
            <span className="text-xs font-bold text-white">{adContent.brand}</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#70C922]">
            {!isCompleted ? (
              <span>Reward in {secondsLeft}s...</span>
            ) : (
              <span className="flex items-center gap-1 text-[#70C922]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready!
              </span>
            )}
          </div>
        </div>

        {/* Ad Content Visual Frame */}
        <div className="relative h-56 bg-slate-950 overflow-hidden flex items-center justify-center">
          <img
            src={adContent.videoBanner}
            alt={adContent.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Ad Copy */}
          <div className="absolute bottom-4 left-4 right-4 text-left">
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#70C922] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Sponsored Showcase
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white leading-snug mb-1">
              {adContent.title}
            </h4>
            <p className="text-xs text-slate-300 line-clamp-2">{adContent.tagline}</p>
          </div>

          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
            <div
              className="h-full bg-[#70C922] transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Bottom CTA / Claim Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              {adState.rewardType === 'energy' ? (
                <Zap className="w-4 h-4 text-[#70C922] fill-current" />
              ) : (
                <Coins className="w-4 h-4 text-amber-400" />
              )}
              <span className="font-semibold">
                Reward: +{adState.rewardAmount} {adState.rewardType.toUpperCase()}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">EthioTelecom Partner Ad</span>
          </div>

          {isCompleted ? (
            <button
              onClick={adState.onRewardClaimed}
              className="w-full py-3.5 rounded-xl bg-[#70C922] text-[#05234A] font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#70C922]/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>CLAIM REWARD & RETURN</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <span>Please wait {secondsLeft} seconds to claim reward...</span>
            </button>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#70C922]" /> Verified EthioTelecom Offer
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white underline text-[11px]"
            >
              Cancel Ad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
