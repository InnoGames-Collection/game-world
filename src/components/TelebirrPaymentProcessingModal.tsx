/**
 * Telebirr Payment Processing Modal (Screenshots 8 & 9)
 * Displays "Awaiting payment..." with native Telebirr bottom sheet payment dialog.
 */

import React, { useState, useEffect } from 'react';
import { GoPlayLogo } from './GoPlayLogo';
import { ArrowLeft, Check } from 'lucide-react';
import { GamePlan } from './TelebirrPlanSelectionModal';
import { UserProfile } from '../types';

export interface PaymentReceiptData {
  orderId: string;
  amountETB: number;
  transactionTime: string;
  transactionType: string;
  transactionTo: string;
  transactionNumber: string;
  customerName: string;
  customerMobile: string;
  plan: GamePlan;
}

interface TelebirrPaymentProcessingModalProps {
  isOpen: boolean;
  plan: GamePlan;
  profile: UserProfile;
  onSuccess: (receipt: PaymentReceiptData) => void;
  onCancel: () => void;
}

export const TelebirrPaymentProcessingModal: React.FC<TelebirrPaymentProcessingModalProps> = ({
  isOpen,
  plan,
  profile,
  onSuccess,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setShowBottomSheet(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecutePayment = () => {
    setIsProcessing(true);
    setShowBottomSheet(false);

    // Call backend or fulfill payment
    const orderId = `TB_${Date.now().toString(36).toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const txNumber = `DIK${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    setTimeout(() => {
      const receipt: PaymentReceiptData = {
        orderId,
        amountETB: plan.priceETB,
        transactionTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        transactionType: 'Buy Goods',
        transactionTo: 'INNO GAMES PLC - GOPLAY',
        transactionNumber: txNumber,
        customerName: profile.displayName || 'telebirr Gamer',
        customerMobile: profile.phoneNumber || '251923026799',
        plan,
      };
      onSuccess(receipt);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex flex-col items-center justify-between select-none animate-in fade-in duration-150">
      {/* Background Webview (Screenshots 8 & 9) */}
      <div className="w-full max-w-md bg-white flex-1 flex flex-col">
        {/* Top Telebirr Navigation Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="p-1 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">
            Purchase | GoPlay Game Portal
          </span>

          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2"
          >
            ✕
          </button>
        </div>

        {/* Brand Logos Header */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
              <circle cx="16" cy="16" r="14" fill="#0A78BE" />
              <path d="M16 6L20 14H12L16 6Z" fill="#8BCB3D" />
              <circle cx="16" cy="20" r="4" fill="#FFFFFF" />
            </svg>
            <div className="leading-none text-left">
              <span className="text-[10px] font-bold text-slate-800 block">ቴሌብር</span>
              <span className="text-[9px] font-semibold text-[#0A78BE] block">telebirr</span>
            </div>
          </div>

          <GoPlayLogo size="xs" />

          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <span>En</span>
            <span className="text-[10px]">▼</span>
          </div>
        </div>

        {/* Center "Awaiting payment..." state */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 relative mb-6">
            <div className="w-14 h-14 rounded-full border-4 border-slate-200 border-t-[#17202A] animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Awaiting payment...
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Confirm payment on your telebirr bottom sheet dialog
          </p>
        </div>
      </div>

      {/* Foreground Native Telebirr Bottom Sheet (Screenshot 8) */}
      {showBottomSheet && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-0 animate-in slide-in-from-bottom duration-200">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 border-t border-slate-200 space-y-5">
            {/* Sheet Close Button */}
            <div className="flex justify-between items-center">
              <button
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Merchant info */}
            <div className="text-center space-y-1">
              <p className="text-xs font-medium text-slate-600">
                Pay to INNO GAMES PLC - GOPLAY
              </p>
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {plan.priceETB.toFixed(2)}
                <span className="text-sm font-sans font-bold text-slate-500 ml-1">ETB</span>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Payment Method
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center text-lime-700">
                    💳
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">
                      Balance
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      (Available Balance: {(profile.telebirrBalance || 466.58).toFixed(2)} ETB)
                    </span>
                  </div>
                </div>

                <div className="w-5 h-5 rounded-full bg-[#8BCB3D] flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              id="telebirr-sheet-pay-btn"
              type="button"
              onClick={handleExecutePayment}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-[#8BCB3D] hover:bg-[#7cb934] text-white font-bold text-base transition-transform active:scale-98 shadow-md cursor-pointer disabled:opacity-50"
            >
              Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
