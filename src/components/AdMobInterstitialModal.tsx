/**
 * Google AdMob Interstitial Ad Modal Component
 * 
 * Compliant interstitial display:
 * - Only triggered at natural game-over breaks
 * - Clear 3-second countdown before skip is enabled
 * - Never blocks controls or gameplay
 */

import React, { useState, useEffect } from 'react';
import { InterstitialAdState } from '../types';
import { X, Tv, ExternalLink, ShieldCheck } from 'lucide-react';

interface AdMobInterstitialModalProps {
  adState: InterstitialAdState;
  onClose: () => void;
}

export const AdMobInterstitialModal: React.FC<AdMobInterstitialModalProps> = ({
  adState,
  onClose,
}) => {
  const [canSkipInSeconds, setCanSkipInSeconds] = useState(3);

  useEffect(() => {
    if (canSkipInSeconds <= 0) return;

    const timer = setInterval(() => {
      setCanSkipInSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [canSkipInSeconds]);

  return (
    <div
      id="admob-interstitial-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div className="w-full max-w-lg bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative flex flex-col">
        {/* Top Controls */}
        <div className="px-4 py-3 bg-[#0057A8] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-mono font-bold uppercase">
              Ad • Google AdMob
            </span>
            <span className="text-xs font-bold text-white">EthioTelecom Sponsor</span>
          </div>

          <div>
            {canSkipInSeconds > 0 ? (
              <span className="text-xs font-mono font-bold text-white/90 px-2.5 py-1 bg-black/20 rounded-lg border border-white/20">
                Skip in {canSkipInSeconds}s
              </span>
            ) : (
              <button
                id="skip-interstitial-ad-btn"
                onClick={onClose}
                className="px-3 py-1 rounded-lg bg-[#78BE20] hover:bg-[#68a81b] text-white font-black text-xs transition-colors flex items-center gap-1"
              >
                <span>Skip Ad</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sponsor Banner Area */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0057A8] shadow-sm mb-4">
            <Tv className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-black text-slate-900 mb-2">
            {adState.brand || 'EthioTelecom TeleCloud & 5G'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mb-6 leading-relaxed">
            Power your business and digital lifestyle with high-speed 5G network coverage and unlimited fiber connectivity.
          </p>

          <a
            href="https://www.ethiotelecom.et"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-[#78BE20] hover:bg-[#68a81b] text-white font-black text-xs sm:text-sm active:scale-95 transition-all shadow-sm flex items-center gap-2"
          >
            <span>Explore Official Packages</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>EthioTelecom Value Added Services FairPlay Advertising Standard</span>
        </div>
      </div>
    </div>
  );
};

