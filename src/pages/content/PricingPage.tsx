/**
 * GameON Tele - Pricing & Wallet Packages
 * Direct telebirr SuperApp instant billing for game coins and all-access passes.
 */

import React from 'react';
import { 
  BadgePercent, 
  ArrowLeft, 
  Coins, 
  Trophy, 
  Gift, 
  CheckCircle2, 
  Sparkles, 
  CreditCard,
  Wallet,
  ShieldCheck
} from 'lucide-react';

interface PricingPageProps {
  onBack?: () => void;
  showHeader?: boolean;
  onBuyCoins?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onBack,
  showHeader = true,
  onBuyCoins,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-[#17202A] pb-24 max-w-md sm:max-w-lg mx-auto px-4 pt-3 select-none">
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-sm mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="pricing-back-btn"
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <BadgePercent className="w-5 h-5 text-amber-300 shrink-0" />
              <h1 className="text-base font-black tracking-tight">Pricing & Wallet</h1>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* SECTION 1: ALL-ACCESS PASSES */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <CreditCard className="w-4 h-4 text-[#1688C9]" />
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-wider">
              All-Access Passes
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { package: 'Daily', price: '5 ETB', duration: '24 Hours' },
              { package: 'Weekly', price: '20 ETB', duration: '7 Days', bonus: '+30 Coins', popular: true },
              { package: 'Monthly', price: '50 ETB', duration: '30 Days', bonus: '+100 Coins' },
            ].map((pkg) => (
              <div
                key={pkg.package}
                className={`rounded-2xl p-3 border flex flex-col justify-between text-center transition-all bg-white ${
                  pkg.popular ? 'border-[#8BCB3D] ring-2 ring-[#8BCB3D]/20 shadow-xs' : 'border-slate-200/80 shadow-2xs'
                }`}
              >
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    {pkg.package}
                  </span>
                  <div className="text-sm sm:text-base font-black text-[#1688C9] mt-0.5">
                    {pkg.price}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {pkg.duration}
                  </div>
                  {pkg.bonus && (
                    <div className="text-[9px] font-black text-[#8BCB3D] bg-lime-50 rounded-md py-0.5 mt-1 border border-lime-200">
                      {pkg.bonus}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: COIN PACKS */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-black text-slate-600 uppercase tracking-wider">
                Coin Packs
              </h2>
            </div>
            {onBuyCoins && (
              <button
                type="button"
                onClick={onBuyCoins}
                className="text-xs font-black text-[#1688C9] hover:underline cursor-pointer"
              >
                Top Up
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { coins: 10, price: '10 ETB', label: 'Starter' },
              { coins: 25, price: '25 ETB', label: 'Popular', popular: true },
              { coins: 50, price: '50 ETB', label: 'Best Value' },
            ].map((item) => (
              <button
                key={item.coins}
                type="button"
                onClick={onBuyCoins}
                className={`p-3 rounded-2xl border text-center transition-all bg-white cursor-pointer active:scale-98 ${
                  item.popular ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-xs' : 'border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="text-sm sm:text-base font-black text-[#17202A]">🪙 {item.coins}</div>
                <div className="text-xs font-black text-[#1688C9] mt-0.5">{item.price}</div>
                <div className="text-[9px] text-amber-700 font-extrabold mt-1 uppercase tracking-wider">
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* SECTION 3: WELCOME BONUS */}
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-3.5 border border-amber-200/80 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-amber-950">
              telebirr SuperApp Welcome Bonus
            </h3>
            <p className="text-[11px] text-amber-900 mt-0.5 leading-snug">
              Every verified telebirr user receives <strong>50 Free Coins</strong> on first visit!
            </p>
          </div>
        </section>

        {/* SECTION 4: TOURNAMENT PRIZE POOL */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-wider">
              Championship Prize Pool
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs bg-white">
            <div className="divide-y divide-slate-100 text-xs">
              {[
                { rank: '🥇 1st Place', prize: '50,000 ETB' },
                { rank: '🥈 2nd Place', prize: '30,000 ETB' },
                { rank: '🥉 3rd Place', prize: '20,000 ETB' },
                { rank: 'Top 5 (4th-5th)', prize: '10,000 ETB' },
                { rank: 'Top 10 (6th-10th)', prize: '5,000 ETB' },
              ].map((row, idx) => (
                <div key={idx} className="px-3.5 py-2.5 flex items-center justify-between">
                  <span className="font-bold text-slate-700">{row.rank}</span>
                  <span className="font-black font-mono text-[#1688C9]">{row.prize}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold">
        <ShieldCheck className="w-3.5 h-3.5 text-[#8BCB3D]" />
        <span>telebirr SuperApp Instant Settlement • Secure & Transparent</span>
      </div>
    </div>
  );
};
