/**
 * GameON Tele - Telebirr Coin Topup Modal
 * Enables instant coin purchase directly from telebirr balance inside the mini-app.
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storageService';
import { 
  Coins, 
  Wallet, 
  ShieldCheck, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface CoinTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdate: (updated: UserProfile) => void;
}

const COIN_PACKAGES = [
  { coins: 25, priceETB: 10, bonus: '', popular: false },
  { coins: 60, priceETB: 20, bonus: '+10 Free', popular: true },
  { coins: 150, priceETB: 40, bonus: '+50 Free', popular: false },
  { coins: 400, priceETB: 80, bonus: '+150 Free', popular: false },
];

export const CoinTopupModal: React.FC<CoinTopupModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedPack = COIN_PACKAGES[selectedIdx];

  const handlePurchase = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (profile.telebirrBalance < selectedPack.priceETB) {
      setErrorMsg(`Insufficient telebirr balance. Available: ${profile.telebirrBalance.toFixed(2)} ETB, Required: ${selectedPack.priceETB} ETB.`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const updated: UserProfile = {
        ...profile,
        coins: profile.coins + selectedPack.coins,
        telebirrBalance: Math.max(0, profile.telebirrBalance - selectedPack.priceETB),
      };
      StorageService.saveProfile(updated);
      StorageService.recordCoinTransaction({
        id: 'CTX_TB_' + Date.now().toString(36).toUpperCase(),
        type: 'TELEBIRR_PURCHASE',
        amount: selectedPack.coins,
        description: `Purchased ${selectedPack.coins} Coins via telebirr (${selectedPack.priceETB} ETB)`,
        timestamp: new Date().toISOString(),
      });

      onProfileUpdate(updated);
      setIsProcessing(false);
      setSuccessMsg(`Successfully credited ${selectedPack.coins} Coins!`);

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1688C9] text-white p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-amber-300">
              <Coins className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">GameON Coin Wallet</h3>
              <p className="text-[11px] text-blue-100 font-medium">
                Top up coins directly using your telebirr balance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Current Balances Card */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                Current Coins
              </div>
              <div className="text-lg font-black text-amber-950 mt-0.5">
                🪙 {profile.coins}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-800">
                telebirr Balance
              </div>
              <div className="text-lg font-black text-blue-950 mt-0.5">
                {profile.telebirrBalance.toFixed(2)} ETB
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Package Selection */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700">Select Coin Package:</div>
            <div className="grid grid-cols-2 gap-2.5">
              {COIN_PACKAGES.map((pkg, idx) => {
                const isSelected = selectedIdx === idx;
                return (
                  <button
                    key={pkg.coins}
                    type="button"
                    onClick={() => setSelectedIdx(idx)}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#8BCB3D] bg-lime-50/50 shadow-xs ring-2 ring-[#8BCB3D]/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-[#8BCB3D] text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                        Most Popular
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-base font-black text-[#17202A]">
                      <span>🪙 {pkg.coins}</span>
                      {pkg.bonus && (
                        <span className="text-[10px] text-[#8BCB3D] font-bold">{pkg.bonus}</span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-500 mt-1">
                      {pkg.priceETB} ETB
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-xl bg-[#8BCB3D] hover:bg-[#7cb934] text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {isProcessing ? (
              <span className="inline-block animate-pulse">Charging telebirr Balance...</span>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Pay {selectedPack.priceETB} ETB via telebirr</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8BCB3D]" />
            <span>telebirr SuperApp Instant Wallet Billing • Secure & Instant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
