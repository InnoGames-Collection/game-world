/**
 * TelePlus Ethiopia - Clean Buy Coins Screen & Compact Confirmation Dialog
 * 
 * Strict Specification:
 * - Title: BUY COINS
 * - Exactly 3 packages:
 *   1. 3 Birr  →  5 Coins
 *   2. 5 Birr  → 10 Coins
 *   3. 10 Birr → 25 Coins
 * - Clean cards, clear typography, professional coin graphics
 * - Compact confirmation dialog:
 *   "Buy X Coins for Y Birr?"
 *   [Cancel]  [Confirm]
 * - ZERO unnecessary marketing text, billing descriptions, MSISDN display, or metadata.
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Coins as CoinsIcon, Check } from 'lucide-react';

export interface CoinPackage {
  id: string;
  coins: number;
  priceBirr: number;
}

export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'pkg_5', coins: 5, priceBirr: 3 },
  { id: 'pkg_10', coins: 10, priceBirr: 5 },
  { id: 'pkg_25', coins: 25, priceBirr: 10 },
];

interface EnergyModalProps {
  profile?: UserProfile;
  onClose: () => void;
  onPurchasePackage: (coinsAmount: number, costETB: number) => Promise<{ success: boolean; message: string }>;
  onWatchAd?: () => void;
  onOpenVIP?: () => void;
  onOpenAuth?: () => void;
}

export const EnergyModal: React.FC<EnergyModalProps> = ({
  onClose,
  onPurchasePackage,
}) => {
  const [selectedPkg, setSelectedPkg] = useState<CoinPackage>(COIN_PACKAGES[0]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenConfirm = (pkg: CoinPackage) => {
    setSelectedPkg(pkg);
    setShowConfirmDialog(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPkg) return;
    setIsProcessing(true);
    try {
      await onPurchasePackage(selectedPkg.coins, selectedPkg.priceBirr);
      setShowConfirmDialog(false);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in select-none">
      <div 
        id="buy-coins-sheet"
        className="w-full max-w-sm bg-white text-[#17202A] rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl p-5 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#8BCB3D] text-white flex items-center justify-center shadow-xs">
              <CoinsIcon className="w-4 h-4 fill-current" />
            </div>
            <h3 className="text-base font-black text-[#17202A] uppercase tracking-wide">
              BUY COINS
            </h3>
          </div>

          <button
            id="close-buy-coins-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#17202A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* The 3 Clean Packages */}
        <div className="space-y-2.5 py-4">
          {COIN_PACKAGES.map((pkg) => {
            const isSelected = selectedPkg.id === pkg.id;
            return (
              <button
                key={pkg.id}
                id={`coin-pkg-${pkg.coins}`}
                onClick={() => setSelectedPkg(pkg)}
                className={`w-full p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/50 border-[#1688C9] ring-2 ring-[#1688C9]/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left: Price */}
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                    isSelected ? 'bg-[#1688C9] text-white' : 'bg-slate-100 text-[#17202A]'
                  }`}>
                    {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <CoinsIcon className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-black text-[#17202A] font-mono">
                    {pkg.priceBirr} Birr
                  </span>
                </div>

                {/* Right: Coins */}
                <div className="flex items-center gap-1.5 font-mono font-black text-sm text-[#1688C9]">
                  <CoinsIcon className="w-4 h-4 text-[#8BCB3D] fill-current" />
                  <span>{pkg.coins} Coins</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary Action Button */}
        <button
          id="proceed-buy-coins-btn"
          onClick={() => handleOpenConfirm(selectedPkg)}
          className="w-full py-3 rounded-xl bg-[#8BCB3D] hover:bg-[#7cb736] active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <CoinsIcon className="w-4 h-4 fill-current" />
          <span>Buy {selectedPkg.coins} Coins ({selectedPkg.priceBirr} Birr)</span>
        </button>

        {/* =========================================================================
            COMPACT CONFIRMATION DIALOG
           ========================================================================= */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div 
              id="coin-purchase-confirm-dialog"
              className="w-full max-w-xs bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl text-center space-y-4 animate-in zoom-in-95"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1688C9] flex items-center justify-center mx-auto border border-blue-100">
                <CoinsIcon className="w-6 h-6 text-[#8BCB3D] fill-current" />
              </div>

              <div>
                <h4 className="text-base font-black text-[#17202A] leading-tight">
                  Buy {selectedPkg.coins} Coins for {selectedPkg.priceBirr} Birr?
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  id="confirm-dialog-cancel-btn"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isProcessing}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#17202A] font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  id="confirm-dialog-confirm-btn"
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="py-2.5 px-3 rounded-xl bg-[#8BCB3D] hover:bg-[#7cb736] text-white font-black text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
