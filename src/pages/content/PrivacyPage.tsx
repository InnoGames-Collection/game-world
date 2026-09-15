/**
 * Privacy Policy Page Component for TelePlus
 * 
 * Verbatim data and compliance text based on Document Section 14.24 and TelePlus privacy practices.
 */

import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, Smartphone, Database, CheckCircle2 } from 'lucide-react';
import { TELEPLUS_PRIVACY_POLICY } from '../../data/teleplusContent';

interface PrivacyPageProps {
  onBack?: () => void;
  showHeader?: boolean;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack, showHeader = true }) => {
  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none">
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="privacy-back-btn"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
              <h1 className="text-base font-black tracking-tight">Privacy Policy</h1>
            </div>
          </div>
        </div>
      )}

      {/* 2. Overview Card */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-950 leading-relaxed mb-4 space-y-1">
        <h2 className="font-black text-emerald-900 text-sm">{TELEPLUS_PRIVACY_POLICY.title}</h2>
        <p>{TELEPLUS_PRIVACY_POLICY.summary}</p>
      </div>

      {/* 3. Sections */}
      <div className="space-y-3">
        {TELEPLUS_PRIVACY_POLICY.sections.map((section, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#1688C9] shrink-0" />
              <h3 className="text-xs sm:text-sm font-black text-[#17202A]">{section.title}</h3>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed pl-1">
              {section.paragraphs.map((p, pIdx) => (
                <p key={pIdx}>{p}</p>
              ))}

              {section.bulletPoints && (
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                  {section.bulletPoints.map((bp, bIdx) => (
                    <li key={bIdx}>{bp}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
