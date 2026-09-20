/**
 * GameON Tele - Telebirr SuperApp In-App Subscription & Passes
 * 
 * Compliant with GameON Tele specifications:
 * - NO SMS shortcode flows, no 977, no "Send OK".
 * - Direct in-app telebirr SuperApp wallet billing.
 * - Manages active game subscriptions and passes with expiration tracking.
 */

import React, { useState } from 'react';
import { UserProfile, SubscriptionPlan } from '../../types';
import { EntitlementService } from '../../services/entitlementService';
import { StorageService } from '../../services/storageService';
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Wallet, 
  Calendar,
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react';

interface SubscriptionPageProps {
  onBack?: () => void;
  showHeader?: boolean;
  profile?: UserProfile;
  onProfileUpdate?: (updated: UserProfile) => void;
}

const ALL_ACCESS_PASSES = [
  {
    id: 'daily' as SubscriptionPlan,
    name: 'Daily All-Access Pass',
    priceETB: 5,
    period: '24 Hours',
    features: [
      'Unlimited plays across all standard catalog games',
      'Instant session passes for coin and puzzle titles',
      'Daily leaderboard ranking eligibility',
    ],
  },
  {
    id: 'weekly' as SubscriptionPlan,
    name: 'Weekly Champion Pass',
    priceETB: 20,
    period: '7 Days',
    popular: true,
    features: [
      'Unlimited 7-day plays on all 20+ games',
      'Weekly national championship qualification',
      'Includes 30 bonus GoPlay Coins',
      'Save 43% vs Daily passes',
    ],
  },
  {
    id: 'monthly' as SubscriptionPlan,
    name: 'Monthly VIP Grandmaster',
    priceETB: 50,
    period: '30 Days',
    features: [
      '30 days unlimited access to the entire game catalog',
      '100 bonus GoPlay Coins credited to wallet',
      'Grand tournament leaderboard priority',
      'Best value: save 66%',
    ],
  },
];

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  onBack,
  showHeader = true,
  profile,
  onProfileUpdate,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubscribe = (pass: typeof ALL_ACCESS_PASSES[0]) => {
    if (!profile) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (profile.telebirrBalance < pass.priceETB) {
      setErrorMsg(`Insufficient balance (${profile.telebirrBalance.toFixed(2)} ETB available). Required: ${pass.priceETB} ETB.`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      let durationMs = 24 * 60 * 60 * 1000;
      if (pass.id === 'weekly') durationMs = 7 * 24 * 60 * 60 * 1000;
      if (pass.id === 'monthly') durationMs = 30 * 24 * 60 * 60 * 1000;

      const bonusCoins = pass.id === 'weekly' ? 30 : pass.id === 'monthly' ? 100 : 0;

      const updated: UserProfile = {
        ...profile,
        telebirrBalance: Math.max(0, profile.telebirrBalance - pass.priceETB),
        coins: profile.coins + bonusCoins,
        subscription: {
          plan: pass.id,
          isActive: true,
          expiresAt: Date.now() + durationMs,
          autoRenew: true,
        },
      };

      StorageService.saveProfile(updated);
      if (onProfileUpdate) {
        onProfileUpdate(updated);
      }

      setIsProcessing(false);
      setSuccessMsg(`Activated ${pass.name}!`);
      setTimeout(() => setSuccessMsg(null), 2500);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#17202A] pb-24 max-w-md sm:max-w-lg mx-auto px-4 pt-3 select-none">
      {/* 1. Simplified Top Header */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-sm mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="subscription-back-btn"
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-300 shrink-0" />
              <h1 className="text-base font-black tracking-tight">Subscriptions & Passes</h1>
            </div>
          </div>
          {profile && (
            <div className="text-right">
              <div className="text-[9px] text-blue-100 uppercase tracking-wider font-semibold">Wallet</div>
              <div className="text-xs font-black font-mono">{profile.telebirrBalance.toFixed(2)} ETB</div>
            </div>
          )}
        </div>
      )}

      {/* 2. Feedback Alerts */}
      {errorMsg && (
        <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 mb-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 3. Active Subscription Banner */}
      {profile?.subscription?.isActive && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-xs mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-emerald-950 capitalize">
                {profile.subscription.plan} All-Access Active
              </div>
              <div className="text-[10px] text-emerald-700">
                Auto-renews via telebirr SuperApp
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider">
            ACTIVE
          </span>
        </div>
      )}

      {/* 4. Simplified Passes List */}
      <div className="space-y-3">
        {ALL_ACCESS_PASSES.map((pass) => (
          <div
            key={pass.id}
            className={`p-4 rounded-2xl bg-white border transition-all relative shadow-xs ${
              pass.popular
                ? 'border-[#8BCB3D] ring-2 ring-[#8BCB3D]/20'
                : 'border-slate-200/80'
            }`}
          >
            {pass.popular && (
              <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-[#8BCB3D] text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                Popular Choice
              </span>
            )}

            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-sm sm:text-base font-black text-[#17202A]">{pass.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-semibold text-slate-500">{pass.period}</span>
                  {pass.id === 'weekly' && (
                    <span className="text-[10px] font-black text-[#8BCB3D] bg-lime-50 px-1.5 py-0.5 rounded-md border border-lime-200">
                      +30 Coins
                    </span>
                  )}
                  {pass.id === 'monthly' && (
                    <span className="text-[10px] font-black text-[#8BCB3D] bg-lime-50 px-1.5 py-0.5 rounded-md border border-lime-200">
                      +100 Coins
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg sm:text-xl font-black text-[#1688C9]">{pass.priceETB} ETB</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-2 line-clamp-1">
              {pass.id === 'daily' && 'Instant 24-hour access to all games and tournaments.'}
              {pass.id === 'weekly' && 'Full 7-day all-game access + weekly tournament qualification.'}
              {pass.id === 'monthly' && 'Full 30-day VIP access + grand prize tournament priority.'}
            </p>

            <button
              type="button"
              onClick={() => handleSubscribe(pass)}
              disabled={isProcessing}
              className="mt-3 w-full py-2.5 rounded-xl bg-[#8BCB3D] hover:bg-[#7cb934] active:scale-98 text-white font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Activate with telebirr ({pass.priceETB} ETB)</span>
            </button>
          </div>
        ))}
      </div>

      {/* 5. Security & Settlement Trust Badge */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold">
        <ShieldCheck className="w-3.5 h-3.5 text-[#8BCB3D]" />
        <span>Direct telebirr SuperApp billing • Instant access</span>
      </div>
    </div>
  );
};
