/**
 * EthioTelecom Official Gaming Login Screen (Phase 2 Specification)
 * 
 * Palette:
 * - WHITE background (#FFFFFF)
 * - BLUE elements (#0057A8)
 * - GREEN accents (#78BE20)
 * 
 * Layout:
 * - Top Right: Bold gear Settings icon
 * - Below: Promotional banner
 * - Below banner: Compact white Sign In card
 * - Fields: Phone Number, OTP / 6-digit code, GET CODE, SIGN IN (disabled until valid 6-digit OTP)
 * - Secondary Action: Subscribe button (WHITE bg, GREEN border, GREEN text)
 * - NO "Register Here", NO "VIP", NO "Energy"
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, SubscriptionPlan } from '../types';
import { AuthService } from '../services/authService';
import { 
  Menu, 
  Phone, 
  KeyRound, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (profile: UserProfile) => void;
  onOpenSubscribe: () => void;
  onOpenMenu?: () => void;
  showToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, desc?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenSubscribe,
  onOpenMenu,
  showToast,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('0911428890');
  const [otpCode, setOtpCode] = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Timer countdown for resending code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGetCode = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 9) {
      showToast('error', 'Invalid Phone', 'Please enter a valid EthioTelecom mobile number.');
      return;
    }

    setIsRequestingOtp(true);
    const res = await AuthService.requestOtp(phoneNumber);
    setIsRequestingOtp(false);

    if (res.success) {
      setOtpSent(true);
      setDemoCodeHint(res.demoOtp || '123456');
      setCountdown(60);
      showToast('info', 'Verification Code Sent', res.message);
    } else {
      showToast('error', 'Request Failed', res.message);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      showToast('warning', 'Invalid OTP', 'Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    const res = await AuthService.verifyOtp(phoneNumber, otpCode.trim());
    setIsVerifying(false);

    if (res.success && res.profile) {
      showToast('success', 'Authentication Successful', res.message);
      onLoginSuccess(res.profile);
    } else {
      showToast('error', 'Authentication Failed', res.message);
    }
  };

  const isSignInDisabled = isVerifying || otpCode.trim().length !== 6;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] select-none">
      {/* 1. TOP BAR: Branding & Top-Right Menu Button */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0057A8] flex items-center justify-center text-white font-black text-xs shadow-sm">
            ET
          </div>
          <div>
            <span className="font-black text-sm text-[#0057A8] tracking-tight">TelePlay</span>
            <span className="text-[10px] ml-1 px-1.5 py-0.2 rounded bg-[#78BE20] text-white font-black uppercase">
              Ethiopia
            </span>
          </div>
        </div>

        {onOpenMenu && (
          <button
            id="login-main-menu-btn"
            type="button"
            onClick={onOpenMenu}
            aria-label="Open TelePlus Menu"
            className="p-1.5 rounded-xl text-[#17202A] hover:bg-slate-100 active:scale-95 transition-colors cursor-pointer"
            title="Menu"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}
      </div>

      {/* 2. MAIN CONTAINER */}
      <div className="w-full max-w-md mx-auto my-auto space-y-4 py-2">
        
        {/* Promotional Banner */}
        <div 
          id="login-promo-banner"
          className="relative rounded-3xl bg-[#0057A8] text-white p-5 shadow-lg overflow-hidden border border-blue-800"
        >
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#78BE20] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>OFFICIAL ETHIOTELECOM GAMING</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Play & Win Airtime & TeleBirr Prizes
            </h1>

            <p className="text-xs text-blue-100 leading-relaxed max-w-xs">
              Compete in weekly tournaments, climb the leaderboards and claim national championship rewards.
            </p>
          </div>

          <div className="absolute -right-6 -bottom-8 w-28 h-28 bg-[#78BE20]/20 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Compact White Sign In Card */}
        <div 
          id="login-signin-card"
          className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-4"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-xs text-slate-500">
              Enter your EthioTelecom phone number to access your account.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-3.5">
            {/* Phone Number Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                  <Phone className="w-4 h-4 text-[#0057A8]" />
                  <span>+251</span>
                </div>
                <input
                  id="login-phone-input"
                  type="tel"
                  value={phoneNumber.replace(/^\+251\s?/, '')}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="91 123 4567"
                  required
                  className="w-full pl-20 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-mono text-sm font-semibold focus:border-[#0057A8] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* OTP / 6-digit code Field with GET CODE action */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  OTP / 6-Digit Code
                </label>
                {otpSent && countdown > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Resend in {countdown}s
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-otp-input"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code"
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-mono text-sm font-bold tracking-widest focus:border-[#0057A8] focus:bg-white focus:outline-none transition-colors text-center"
                  />
                </div>

                <button
                  id="login-get-code-btn"
                  type="button"
                  onClick={handleGetCode}
                  disabled={isRequestingOtp || countdown > 0}
                  className="px-4 py-3 bg-[#0057A8] hover:bg-[#004080] disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs rounded-2xl transition-colors shrink-0 active:scale-95 cursor-pointer"
                >
                  {isRequestingOtp ? 'Sending...' : countdown > 0 ? `${countdown}s` : 'GET CODE'}
                </button>
              </div>

              {/* Demo Quick Hint */}
              {demoCodeHint && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
                  <span>Demo Code: <strong>{demoCodeHint}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpCode(demoCodeHint)}
                    className="text-[#78BE20] underline text-[11px] font-black hover:text-[#68a81b] cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}
            </div>

            {/* Primary Action: SIGN IN (Must remain disabled until valid 6-digit OTP is entered) */}
            <button
              id="login-signin-submit-btn"
              type="submit"
              disabled={isSignInDisabled}
              className="w-full py-3.5 rounded-2xl bg-[#0057A8] hover:bg-[#004080] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-sm active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isVerifying ? 'VERIFYING...' : 'SIGN IN'}</span>
            </button>
          </form>

          {/* Secondary Action: Subscribe Button (WHITE background, GREEN border, GREEN text) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              id="login-subscribe-btn"
              type="button"
              onClick={onOpenSubscribe}
              className="w-full py-3 rounded-2xl bg-white border-2 border-[#78BE20] text-[#78BE20] hover:bg-emerald-50/50 font-black text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer shadow-sm"
            >
              <span>SUBSCRIBE TO GAMING PASS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-[#78BE20]" />
          <span>Secured via EthioTelecom Mobile ID Gateway</span>
        </div>
      </div>

      {/* 3. BOTTOM FOOTER */}
      <div className="w-full max-w-md mx-auto text-center py-2 text-[11px] text-slate-400 font-medium">
        <span>Official VAS Service • Shortcode 977 • EthioTelecom</span>
      </div>
    </div>
  );
};
