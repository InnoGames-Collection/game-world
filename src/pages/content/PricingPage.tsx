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
    <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none">
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="pricing-back-btn"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
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
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#1688C9]" />
            <h2 className="text-xs font-black text-[#17202A] uppercase tracking-wider">
              1. All-Access Passes (telebirr Billing)
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { package: 'Daily', price: '5 ETB', duration: '24 Hours' },
              { package: 'Weekly', price: '20 ETB', duration: '7 Days', bonus: '+30 Coins' },
              { package: 'Monthly', price: '50 ETB', duration: '30 Days', bonus: '+100 Coins' },
            ].map((pkg) => (
              <div
                key={pkg.package}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between text-center space-y-2"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {pkg.package}
                  </span>
                  <div className="text-sm sm:text-base font-black text-[#1688C9] mt-0.5">
                    {pkg.price}
                  </div>
                  <div className="text-[9.5px] text-slate-400 mt-0.5">
                    {pkg.duration}
                  </div>
                  {pkg.bonus && (
                    <div className="text-[9px] font-black text-[#8BCB3D] mt-1">
                      {pkg.bonus}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: COIN TOP-UP PACKAGES */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-black text-[#17202A] uppercase tracking-wider">
                2. Coin Packs (telebirr Wallet)
              </h2>
            </div>
            {onBuyCoins && (
              <button
                onClick={onBuyCoins}
                className="text-xs font-bold text-[#1688C9] hover:underline cursor-pointer"
              >
                Top Up Now
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { coins: 10, price: '10 ETB', label: 'Starter' },
              { coins: 25, price: '25 ETB', label: 'Popular', popular: true },
              { coins: 50, price: '50 ETB', label: 'Best Value' },
            ].map((item) => (
              <div
                key={item.coins}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  item.popular ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300' : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-base font-black text-[#17202A]">🪙 {item.coins} Coins</div>
                <div className="text-xs font-black text-[#1688C9] mt-0.5">{item.price}</div>
                <div className="text-[10px] text-amber-700 font-bold mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: WELCOME BONUS */}
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="text-sm font-black text-amber-950">
              telebirr SuperApp Welcome Bonus
            </h3>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Every verified telebirr user receives <strong>50 Free Coins</strong> automatically on their first visit to explore any coin-based game in GoPlay.
          </p>
        </section>

        {/* SECTION 4: TOURNAMENT PRIZE POOLS */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-black text-[#17202A] uppercase tracking-wider">
              3. Monthly Champion Prize Pool (Total 233,000 ETB)
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="divide-y divide-slate-100 text-xs">
              {[
                { rank: '1st Place', prize: '50,000 ETB' },
                { rank: '2nd Place', prize: '30,000 ETB' },
                { rank: '3rd Place', prize: '20,000 ETB' },
                { rank: '4th - 5th Place', prize: '10,000 ETB' },
                { rank: '6th - 10th Place', prize: '5,000 ETB' },
              ].map((row, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between bg-white">
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
