/**
 * GoPlay - Coin Purchase Wallet
 * Simplified clean purchase interface for GoPlay Coins via telebirr.
 * 10 coins for 10 ETB = 5 tournament plays (2 coins per play).
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storageService';
import { PaymentService } from '../services/paymentService';
import { 
  X, 
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
  { coins: 10, priceETB: 10, playsLabel: '5 Tournament Plays', packageId: 'COIN_PACK_10' as const },
  { coins: 30, priceETB: 30, playsLabel: '15 Tournament Plays', packageId: 'COIN_PACK_30' as const },
  { coins: 50, priceETB: 50, playsLabel: '25 Tournament Plays', packageId: 'COIN_PACK_50' as const },
];

export const CoinTopupModal: React.FC<CoinTopupModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedPack = COIN_PACKAGES[selectedIdx];

  const handlePurchase = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      const res = await PaymentService.processPayment(profile, {
        method: 'TELEBIRR',
        amountETB: selectedPack.priceETB,
        packageId: selectedPack.packageId,
        itemType: 'COIN_PACK',
        itemTitle: `${selectedPack.coins} GoPlay Coins`,
      });

      if (res.status === 'SUCCESS') {
        const updated: UserProfile = {
          ...profile,
          coins: (profile.coins || 0) + selectedPack.coins,
        };
        StorageService.saveProfile(updated);
        onProfileUpdate(updated);

        setSuccessMsg(`Successfully credited ${selectedPack.coins} GoPlay Coins!`);
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 1200);
      } else if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        setErrorMsg(res.message || 'Payment initiation failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error with telebirr billing.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1688C9] text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black tracking-tight">GoPlay Coins</h3>
            <p className="text-xs text-blue-100 font-medium mt-0.5">
              1 Coin = 1 ETB
            </p>
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

          {/* 3 Clean Selectable Packages */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {COIN_PACKAGES.map((pkg, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={pkg.coins}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`relative p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-[#8BCB3D] bg-lime-50/70 shadow-md ring-2 ring-[#8BCB3D] -translate-y-0.5'
                      : 'border-slate-200 hover:border-slate-300 bg-white shadow-2xs'
                  }`}
                >
                  <div className="text-2xl sm:text-3xl mb-1.5">🪙</div>
                  <div className="text-sm font-black text-[#17202A] tracking-tight">
                    {pkg.coins} Coins
                  </div>
                </button>
              );
            })}
          </div>

          {/* Purchase Action Button */}
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-xl bg-[#8BCB3D] hover:bg-[#7cb934] active:scale-[0.99] text-white font-black text-sm tracking-wide transition-all shadow-md flex items-center justify-center cursor-pointer uppercase"
          >
            {isProcessing ? (
              <span className="inline-block animate-pulse">Connecting to telebirr...</span>
            ) : (
              <span>Buy</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
