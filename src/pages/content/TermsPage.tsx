/**
 * Terms & Conditions Page Component for TelePlus
 * 
 * Verbatim content from Document Section 14:
 * Complete Sections 14.1 through 14.32 with structured numbering and readable layout.
 */

import React, { useState } from 'react';
import { FileText, ArrowLeft, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { TELEPLUS_TERMS_SECTIONS } from '../../data/teleplusContent';

interface TermsPageProps {
  onBack?: () => void;
  showHeader?: boolean;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack, showHeader = true }) => {
  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none">
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="terms-back-btn"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-200 shrink-0" />
              <h1 className="text-base font-black tracking-tight">Terms & Conditions</h1>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Summary Card */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed mb-4">
        <p className="font-bold text-[#17202A]">
          Official TelePlus EthioTelecom Gaming Terms & Conditions (Section 14)
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Governing tournament participation, score caps, fair play, subscriber billing, and prize distribution.
        </p>
      </div>

      {/* 3. All 32 Terms Sections */}
      <div className="space-y-3">
        {TELEPLUS_TERMS_SECTIONS.map((section) => (
          <div
            key={section.number}
            id={`term-section-${section.number.replace('.', '-')}`}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1688C9] font-mono font-black text-xs">
                {section.number}
              </span>
              <h2 className="text-xs sm:text-sm font-black text-[#17202A]">{section.title}</h2>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed pl-1">
              {section.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}

              {section.bulletPoints && section.bulletPoints.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                  {section.bulletPoints.map((bp, bIdx) => (
                    <li key={bIdx}>{bp}</li>
                  ))}
                </ul>
              )}

              {section.table && (
                <div className="mt-2 rounded-xl border border-slate-200 overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {section.table.map((row, rIdx) => (
                      <div
                        key={rIdx}
                        className="px-3 py-1.5 flex items-center justify-between text-xs bg-slate-50/50"
                      >
                        <span className="font-bold text-slate-700">{row.col1}</span>
                        <span className="font-mono font-black text-[#1688C9]">{row.col2}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
