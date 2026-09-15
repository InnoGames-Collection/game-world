/**
 * EMOJI IQ — Equation Card Presentation
 * Displays the 3-4 vertical equation rows matching the reference video layout:
 * [Emoji A] + [Emoji A] = 10
 * [Emoji A] + [Emoji B] = 17
 * [Emoji B] + [Emoji C] = 22
 * [Emoji A] + [Emoji B] × [Emoji C] = ?
 */

import React from 'react';
import { EquationRow, EquationItem } from '../types';
import { EMOJI_IQ_COLORS } from '../colors';

interface EmojiIqEquationCardProps {
  equations: EquationRow[];
}

export const EmojiIqEquationCard: React.FC<EmojiIqEquationCardProps> = ({ equations }) => {
  return (
    <div
      className="w-full max-w-sm bg-white rounded-3xl p-3.5 sm:p-4 shadow-md border flex flex-col gap-2 sm:gap-2.5 select-none"
      style={{
        borderColor: 'rgba(108, 92, 231, 0.15)',
        boxShadow: '0 8px 24px -4px rgba(108, 92, 231, 0.12)',
      }}
    >
      {equations.map((row, rowIdx) => {
        const isTargetRow = row.result === '?';

        return (
          <div
            key={rowIdx}
            className={`flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-2xl transition-all ${
              isTargetRow
                ? 'bg-gradient-to-r from-[#6C5CE7]/10 via-[#00B8D9]/10 to-[#6C5CE7]/10 border-2 border-[#6C5CE7]/40 shadow-sm'
                : 'bg-[#F7F5FF] border border-[#6C5CE7]/10'
            }`}
          >
            {/* Left side: Equation terms */}
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
              {row.items.map((item, itemIdx) => {
                if (typeof item === 'string') {
                  // Math operator (+, -, ×, ÷)
                  return (
                    <span
                      key={itemIdx}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-sm sm:text-base select-none shadow-sm"
                      style={{
                        backgroundColor: isTargetRow ? '#6C5CE7' : '#FFFFFF',
                        color: isTargetRow ? '#FFFFFF' : '#241F3D',
                        border: '1px solid rgba(108, 92, 231, 0.2)',
                      }}
                    >
                      {item}
                    </span>
                  );
                }

                const eqItem = item as EquationItem;
                return (
                  <div
                    key={itemIdx}
                    className="flex items-center justify-center p-1 rounded-xl relative group transition-transform hover:scale-105"
                  >
                    <span
                      className="text-2xl sm:text-3xl leading-none filter drop-shadow-sm"
                      style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))' }}
                    >
                      {eqItem.emoji}
                    </span>
                    {eqItem.count && eqItem.count > 1 && (
                      <span className="sr-only">{eqItem.label || `${eqItem.count} items`}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Equals sign & result */}
            <div className="flex items-center gap-2 pl-2">
              <span
                className="text-lg sm:text-xl font-black"
                style={{ color: EMOJI_IQ_COLORS.textSecondary }}
              >
                =
              </span>

              {isTargetRow ? (
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl animate-pulse shadow-md"
                  style={{
                    backgroundColor: EMOJI_IQ_COLORS.accent,
                    color: EMOJI_IQ_COLORS.bgDark,
                    boxShadow: '0 4px 12px rgba(255, 183, 3, 0.4)',
                  }}
                >
                  ?
                </div>
              ) : (
                <div
                  className="min-w-[36px] sm:min-w-[40px] px-2.5 py-1 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl font-mono shadow-inner border"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: EMOJI_IQ_COLORS.textPrimary,
                    borderColor: 'rgba(108, 92, 231, 0.2)',
                  }}
                >
                  {row.result}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
