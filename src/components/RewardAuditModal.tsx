/**
 * Reward Audit Log Modal
 * Displays confirmed server-side reward transaction records,
 * idempotency audit hashes, MSISDN identifiers, timestamps, and disbursement status.
 */

import React from 'react';
import { RewardTransaction } from '../types';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  FileText
} from 'lucide-react';

interface RewardAuditModalProps {
  transactions: RewardTransaction[];
  onClose: () => void;
}

export const RewardAuditModal: React.FC<RewardAuditModalProps> = ({
  transactions,
  onClose,
}) => {
  return (
    <div
      id="reward-audit-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-6 relative my-6 max-h-[90vh] flex flex-col text-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-[#0057A8]" />
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Reward Audit & Transaction Log
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Idempotent server-verified disbursement ledger. Real rewards are only issued upon verified server-side validation.
          </p>
        </div>

        {/* Notice Badge */}
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-slate-700 mb-4 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-[#0057A8] shrink-0" />
          <span>
            <strong>Server-Authoritative Payout Engine:</strong> All prize distributions use deterministic idempotency keys to prevent duplicate payout transactions.
          </span>
        </div>

        {/* Transaction Records List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {transactions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              No prize transactions logged yet. Play in live tournaments to qualify for verified TeleBirr distributions!
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors space-y-2 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 text-[#0057A8] text-xs font-mono font-black flex items-center justify-center">
                      #{tx.rank}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      {tx.gameTitle}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      (Score: {tx.score.toLocaleString()})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        tx.status === 'DISBURSED' || tx.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {tx.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Recipient Identifier: </span>
                    <span className="text-slate-900 font-mono font-bold">{tx.msisdnMasked}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Allocated Reward: </span>
                    <span className="text-[#78BE20] font-bold">{tx.reward}</span>
                  </div>
                </div>

                {/* Audit Hashes */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[9px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div className="truncate max-w-[280px]">
                    <span className="text-slate-400">IDEMP:</span> {tx.idempotencyKey}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <ShieldCheck className="w-3 h-3 text-[#0057A8]" />
                    <span>AUDIT HASH: {tx.auditHash}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};

