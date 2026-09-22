/**
 * Telebirr Game Center SSO Handshake Modal (Screenshot 3)
 * Displays "Getting your info..." while authenticating the player
 * using credentials passed from telebirr SuperApp Game Center.
 */

import React, { useEffect, useState } from 'react';

interface TelebirrAuthHandshakeModalProps {
  onSuccess: (phone?: string) => void;
  onCancel?: () => void;
}

export const TelebirrAuthHandshakeModal: React.FC<TelebirrAuthHandshakeModalProps> = ({
  onSuccess,
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Parse query parameters from telebirr mini-app container
    const params = new URLSearchParams(window.location.search);
    const msisdnParam = params.get('msisdn') || params.get('phone');

    const timer = setTimeout(() => {
      onSuccess(msisdnParam || undefined);
    }, 900);

    return () => clearTimeout(timer);
  }, [onSuccess]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-between p-6 select-none animate-in fade-in duration-200">
      {/* Top Header Bar inside Telebirr Mini-App */}
      <div className="w-full max-w-md flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          {/* telebirr Brand SVG */}
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
              <circle cx="16" cy="16" r="14" fill="#0A78BE" />
              <path d="M16 6L20 14H12L16 6Z" fill="#8BCB3D" />
              <circle cx="16" cy="20" r="4" fill="#FFFFFF" />
            </svg>
            <div className="text-left leading-none">
              <span className="text-[10px] font-bold text-white block">ቴሌብር</span>
              <span className="text-[9px] font-semibold text-sky-200 block">telebirr</span>
            </div>
          </div>
        </div>

        {/* Language selector */}
        <div className="text-xs font-semibold text-white/80 flex items-center gap-1">
          <span>En</span>
          <span className="text-[10px]">▼</span>
        </div>
      </div>

      {/* Center Spinner & Handshake Status */}
      <div className="flex flex-col items-center justify-center my-auto text-center">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-slate-700/50" />
          <div className="absolute inset-0 rounded-full border-4 border-[#8BCB3D] border-t-transparent animate-spin" />
        </div>

        <div className="bg-white/95 px-6 py-4 rounded-2xl shadow-xl max-w-xs text-center border border-slate-200">
          <div className="w-8 h-8 mx-auto mb-2 relative">
            <div className="w-8 h-8 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-bold text-[#17202A] tracking-tight">
            Getting your info{dots}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Verifying telebirr Game Center credentials
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pb-4 text-[11px] text-white/70">
        telebirr SuperApp Verified Service
      </div>
    </div>
  );
};
