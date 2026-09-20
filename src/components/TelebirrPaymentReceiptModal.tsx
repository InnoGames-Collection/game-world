/**
 * Telebirr Payment Confirmation Receipt Modal (Screenshot 10)
 * Displays official Telebirr payment receipt with transaction details.
 */

import React from 'react';
import { Check, Download, Share2, Heart, QrCode } from 'lucide-react';
import { PaymentReceiptData } from './TelebirrPaymentProcessingModal';

interface TelebirrPaymentReceiptModalProps {
  isOpen: boolean;
  receipt: PaymentReceiptData | null;
  onConfirm: () => void;
}

export const TelebirrPaymentReceiptModal: React.FC<TelebirrPaymentReceiptModalProps> = ({
  isOpen,
  receipt,
  onConfirm,
}) => {
  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Top Bar: Download & Share */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 text-xs font-bold text-[#8BCB3D]">
          <button 
            type="button"
            onClick={() => alert('Receipt downloaded')}
            className="flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Telebirr Receipt', text: `Payment of ${receipt.amountETB} ETB confirmed` });
              } else {
                alert('Receipt share link copied');
              }
            }}
            className="flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Receipt Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Success Indicator */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#8BCB3D] flex items-center justify-center text-white shadow-md">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Successful</h3>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight pt-1">
              -{receipt.amountETB.toFixed(2)}{' '}
              <span className="text-sm font-sans font-bold text-slate-500">(ETB)</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-3 pt-2 text-xs border-t border-slate-100 divide-y divide-slate-50">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Transaction Time:</span>
              <span className="font-semibold text-slate-800 font-mono">
                {receipt.transactionTime}
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Transaction Type:</span>
              <span className="font-semibold text-slate-800">
                {receipt.transactionType}
              </span>
            </div>

            <div className="flex justify-between py-1.5 text-right">
              <span className="text-slate-500 text-left">Transaction To:</span>
              <span className="font-bold text-slate-900 max-w-[200px]">
                {receipt.transactionTo}
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Transaction Number:</span>
              <span className="font-bold text-slate-900 font-mono">
                {receipt.transactionNumber}
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Customer Name:</span>
              <span className="font-bold text-slate-900">
                {receipt.customerName}
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Customer Mobile Number:</span>
              <span className="font-bold text-slate-900 font-mono">
                {receipt.customerMobile}
              </span>
            </div>
          </div>

          {/* Give Tip & QR Code quick tools */}
          <div className="flex justify-center items-center gap-6 py-2 text-xs font-bold text-slate-600 border-t border-slate-100">
            <button type="button" className="flex items-center gap-1.5 hover:text-[#8BCB3D] cursor-pointer">
              <Heart className="w-4 h-4 text-emerald-600" />
              <span>Give Tip</span>
            </button>
            <span className="text-slate-300">|</span>
            <button type="button" className="flex items-center gap-1.5 hover:text-[#8BCB3D] cursor-pointer">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>QR Code</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => alert('Bill share code copied')}
              className="py-3 px-4 rounded-xl border-2 border-[#8BCB3D] text-[#8BCB3D] font-bold text-xs hover:bg-emerald-50 transition-colors cursor-pointer text-center"
            >
              Bill Share
            </button>

            <button
              id="receipt-ok-btn"
              type="button"
              onClick={onConfirm}
              className="py-3 px-4 rounded-xl bg-[#8BCB3D] hover:bg-[#7cb934] text-white font-bold text-xs shadow-md transition-transform active:scale-98 cursor-pointer text-center"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
