/**
 * Help & Support Page Component for TelePlus
 * 
 * Features:
 * - Interactive expandable/collapsible accordion design
 * - Dynamic '+' (collapsed) and '−' (expanded) icons
 * - Verbatim content for all 9 support topics from Document Section 13
 * - Important note: official support phone number notice
 */

import React, { useState } from 'react';
import { Headphones, ArrowLeft, Plus, Minus, Phone, ShieldAlert, LifeBuoy, AlertCircle } from 'lucide-react';
import { TELEPLUS_SUPPORT_TOPICS } from '../../data/teleplusContent';

interface HelpSupportPageProps {
  onBack?: () => void;
  showHeader?: boolean;
}

export const HelpSupportPage: React.FC<HelpSupportPageProps> = ({ onBack, showHeader = true }) => {
  const [openTopicIds, setOpenTopicIds] = useState<Record<string, boolean>>({
    'sub-support': true,
  });

  const toggleTopic = (id: string) => {
    setOpenTopicIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    TELEPLUS_SUPPORT_TOPICS.forEach((t) => {
      allOpen[t.id] = true;
    });
    setOpenTopicIds(allOpen);
  };

  const collapseAll = () => {
    setOpenTopicIds({});
  };

  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none">
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="help-support-back-btn"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-emerald-300 shrink-0" />
              <h1 className="text-base font-black tracking-tight">Help & Support</h1>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Notice & Controls */}
      <div className="space-y-2.5 mb-4">
        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
          <LifeBuoy className="w-4 h-4 text-[#1688C9] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Subscriber Assistance Guide: </span>
            Select a topic below to see what information to prepare and recommended resolution steps for service issues.
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Click any topic to expand details</span>
          <div className="flex items-center gap-3">
            <button
              onClick={expandAll}
              className="text-[#1688C9] hover:underline font-bold cursor-pointer"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              onClick={collapseAll}
              className="text-slate-500 hover:underline font-bold cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* 3. Accordion List of 9 Support Topics */}
      <div className="space-y-2.5">
        {TELEPLUS_SUPPORT_TOPICS.map((topic, index) => {
          const isOpen = !!openTopicIds[topic.id];

          return (
            <div
              key={topic.id}
              id={`support-topic-${topic.id}`}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-white border-[#1688C9]/40 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Row Header */}
              <button
                type="button"
                onClick={() => toggleTopic(topic.id)}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none group"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-[10px] font-black font-mono text-[#1688C9] shrink-0 px-1.5 py-0.5 rounded bg-blue-50">
                    {index + 1}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-black leading-snug transition-colors ${
                      isOpen ? 'text-[#1688C9]' : 'text-[#17202A] group-hover:text-[#1688C9]'
                    }`}
                  >
                    {topic.title}
                  </span>
                </div>

                {/* Dynamic +/- toggle */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isOpen
                      ? 'bg-[#1688C9] text-white'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  }`}
                >
                  {isOpen ? (
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  )}
                </div>
              </button>

              {/* Expanded Body */}
              {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/60 animate-in fade-in slide-in-from-top-1 duration-150 space-y-2.5 pl-6 sm:pl-8">
                  {topic.content.map((p, pIdx) => (
                    <p key={pIdx} className="text-xs text-slate-700 leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {topic.steps && topic.steps.length > 0 && (
                    <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 font-medium pl-1">
                      {topic.steps.map((st, sIdx) => (
                        <li key={sIdx}>{st}</li>
                      ))}
                    </ol>
                  )}

                  {topic.note && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-bold flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{topic.note}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
