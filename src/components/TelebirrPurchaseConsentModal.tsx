/**
 * Telebirr Purchase Consent Modal (Screenshot 7)
 * Displays the mandatory non-refundable service fee disclosure,
 * tournament prize eligibility rules, and agreement checkbox.
 */

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { GoPlayLogo } from './GoPlayLogo';
import { GamePlan } from './TelebirrPlanSelectionModal';

interface TelebirrPurchaseConsentModalProps {
  isOpen: boolean;
  plan: GamePlan;
  onConfirm: () => void;
  onBack: () => void;
  onClose: () => void;
}

export const TelebirrPurchaseConsentModal: React.FC<TelebirrPurchaseConsentModalProps> = ({
  isOpen,
  plan,
  onConfirm,
  onBack,
  onClose,
}) => {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        {/* Top Telebirr Navigation Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-1 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">
            Purchase | GoPlay Game Portal
          </span>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2"
          >
            ✕
          </button>
        </div>

        {/* Brand Logos Header */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
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

            <div className="h-4 w-px bg-slate-200 mx-0.5" />

            <GoPlayLogo size="xs" />
          </div>

          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <span>En</span>
            <span className="text-[10px]">▼</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-xs leading-relaxed">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-900">{plan.name}</span>
            <span className="font-black text-slate-900 font-mono text-sm">
              {plan.priceETB} ETB
            </span>
          </div>

          <p>
            The service fee is non-refundable and is charged before payment confirmation to access GoPlay Games features, activities, and tournaments. Purchasing access allows players to participate in eligible games and competitions during the selected period.
          </p>

          <p>
            Players may receive rewards by winning tournaments or accumulating enough points within the platform. Rewards may include cash prizes transferred to the winner&apos;s Telebirr wallet or in-kind prizes such as mobile phones, power banks, smart watches, and other promotional items based on applicable tournament or campaign rules.
          </p>

          <p>
            Detailed Terms &amp; Conditions, participation rules, eligibility requirements, and reward policies are available within the GoPlay Games platform. By continuing, you confirm that you have read and agree to the GoPlay Games terms and tournament conditions.
          </p>

          {/* Agreement Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <input
                id="consent-agree-checkbox"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-[#8BCB3D] focus:ring-[#8BCB3D] cursor-pointer"
              />
              <span className="text-sm font-bold text-slate-800 select-none">
                I agree to continue
              </span>
            </label>
          </div>

          <div className="pt-2 space-y-2">
            <button
              id="consent-confirm-btn"
              type="button"
              disabled={!agreed}
              onClick={onConfirm}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                agreed
                  ? 'bg-[#8BCB3D] hover:bg-[#7cb934] text-white cursor-pointer active:scale-98'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              Confirm
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
