/**
 * Telebirr Plan Selection Modal (Screenshot 6)
 * "Choose a Plan: Select a plan to continue."
 * - Daily Access: 1 day — 10 ETB (24 hours on-demand)
 * - Weekly Access: 7 days — 50 ETB
 * - Monthly Access: 30 days — 175 ETB
 */

import React, { useState } from 'react';
import { GoPlayLogo } from './GoPlayLogo';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export interface GamePlan {
  id: 'daily' | 'weekly' | 'monthly';
  name: string;
  durationLabel: string;
  durationHours: number;
  priceETB: number;
  description: string;
  isPopular?: boolean;
}

export const GAME_PLANS: GamePlan[] = [
  {
    id: 'daily',
    name: 'Daily Access',
    durationLabel: '1 day',
    durationHours: 24,
    priceETB: 10,
    description: '24-hour full access to all games and tournaments.',
    isPopular: true,
  },
  {
    id: 'weekly',
    name: 'Weekly Access',
    durationLabel: '7 days',
    durationHours: 168,
    priceETB: 50,
    description: '7-day unlimited access with tournament leaderboard entry.',
  },
  {
    id: 'monthly',
    name: 'Monthly Access',
    durationLabel: '30 days',
    durationHours: 720,
    priceETB: 175,
    description: '30-day VIP access with maximum coin multipliers and rewards.',
  },
];

interface TelebirrPlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: GamePlan) => void;
}

export const TelebirrPlanSelectionModal: React.FC<TelebirrPlanSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  if (!isOpen) return null;

  const selectedPlan = GAME_PLANS.find((p) => p.id === selectedPlanId) || GAME_PLANS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Telebirr Navigation Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Choose a Plan
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Select a plan to continue.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="space-y-3">
            {GAME_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[#8BCB3D] bg-emerald-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-[#8BCB3D] fill-emerald-100" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {plan.name}
                        </span>
                        {plan.isPopular && (
                          <span className="px-2 py-0.5 rounded-full bg-[#8BCB3D] text-white text-[9px] font-black uppercase tracking-wider">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {plan.durationLabel}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 font-mono">
                      {plan.priceETB} ETB
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              id="plan-purchase-btn"
              type="button"
              onClick={() => onSelectPlan(selectedPlan)}
              className="w-full py-3.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-sm transition-transform active:scale-98 shadow-md cursor-pointer"
            >
              Purchase
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 mt-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
