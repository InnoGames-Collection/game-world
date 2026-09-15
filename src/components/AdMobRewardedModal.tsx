/**
 * Google AdMob Rewarded Video Modal Component
 * 
 * Enforces compliance:
 * - Upfront explicit reward contract: "+20 Coins"
 * - Clear non-deceptive video simulator container
 * - Timer countdown with completion callback
 * - Never can be closed prematurely to bypass reward logic
 */

import React, { useState, useEffect } from 'react';
import { RewardedAdState } from '../types';
import { 
  X, 
  Tv, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  Volume2, 
  VolumeX
} from 'lucide-react';

interface AdMobRewardedModalProps {
  adState: RewardedAdState;
  onClose: () => void;
}

export const AdMobRewardedModal: React.FC<AdMobRewardedModalProps> = ({
  adState,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(adState.durationSeconds || 5);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      setIsCompleted(true);
      adState.onRewardClaimed();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, adState]);

  const progressPercent = Math.min(
    100,
    ((adState.durationSeconds - secondsRemaining) / adState.durationSeconds) * 100
  );

  return (
    <div
      id="admob-rewarded-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative flex flex-col">
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-[#0057A8] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-mono font-black uppercase tracking-wider">
              Rewarded Ad
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[160px]">
              {adState.brand || 'EthioTelecom Sponsor'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {isCompleted ? (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-[#78BE20] text-white hover:bg-[#68a81b] font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs font-mono font-black text-amber-300 px-2 py-1 bg-black/30 rounded-lg border border-white/20">
                Reward in {secondsRemaining}s
              </span>
            )}
          </div>
        </div>

        {/* Reward Contract Notice Banner */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center justify-between text-xs font-black">
          <div className="flex items-center gap-1.5 text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Guaranteed Reward:</span>
          </div>
          <span className="text-emerald-700 font-mono font-extrabold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 fill-current text-amber-500" /> +{adState.rewardAmount || 20} Coins
          </span>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-video bg-slate-900 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-white shadow-md mb-2">
            <Tv className="w-8 h-8" />
          </div>

          <h3 className="text-base font-black text-white mb-1">
            {adState.brand || 'TeleBirr SuperApp'}
          </h3>
          <p className="text-xs text-slate-300 max-w-xs">
            Send money to anyone across Ethiopia with 0% service charge using your verified phone number.
          </p>

          {/* Progress bar at bottom of video */}
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-800">
            <div
              className="h-full bg-[#78BE20] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Completion Action Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          {isCompleted ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-black text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <span>Reward unlocked & credited to your account!</span>
              </div>
              <button
                id="claim-rewarded-ad-close-btn"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#78BE20] hover:bg-[#68a81b] text-white font-black text-sm active:scale-95 transition-all shadow-sm uppercase tracking-wider"
              >
                Collect & Return to Game
              </button>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-500 font-medium">
              Please watch the full sponsor message ({secondsRemaining}s remaining) to receive your reward.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

