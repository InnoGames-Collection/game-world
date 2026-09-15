/**
 * Notification Toast Component
 */

import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, Info, AlertTriangle, XCircle, Coins, X } from 'lucide-react';

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = 'border-blue-200 bg-white text-slate-900';
        let iconColor = 'text-[#0057A8]';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-emerald-200 bg-white text-slate-900';
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'energy') {
          Icon = Coins;
          borderClass = 'border-amber-200 bg-white text-slate-900';
          iconColor = 'text-amber-500';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-200 bg-white text-slate-900';
          iconColor = 'text-amber-600';
        } else if (toast.type === 'error') {
          Icon = XCircle;
          borderClass = 'border-red-200 bg-white text-slate-900';
          iconColor = 'text-red-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-none p-3.5 rounded-xl border shadow-lg flex items-start gap-3 transition-all transform ${borderClass}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-900 tracking-wide">{toast.title}</h4>
              {toast.description && (
                <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 pointer-events-auto cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

