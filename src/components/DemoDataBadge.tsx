/**
 * Demo Data Indicator Badge
 * Clearly marks that the portal is currently displaying offline demo/simulation data
 * as mandated in the requirements.
 */

import React from 'react';
import { Database, RotateCcw } from 'lucide-react';

interface DemoDataBadgeProps {
  onResetDemo: () => void;
  label?: string;
}

export const DemoDataBadge: React.FC<DemoDataBadgeProps> = ({ onResetDemo, label = 'DEMO DATA LAYER' }) => {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#70C922] animate-pulse" />
        <Database className="w-3.5 h-3.5 text-[#70C922]" />
        <span className="font-semibold text-slate-300 tracking-wider uppercase">{label}</span>
        <span className="hidden sm:inline text-slate-500 font-mono">| Offline-Ready Telecom Sandbox</span>
      </div>
      <button
        onClick={onResetDemo}
        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 hover:border-slate-600"
        title="Reset mock state to fresh defaults"
      >
        <RotateCcw className="w-3 h-3 text-[#70C922]" />
        <span>Reset State</span>
      </button>
    </div>
  );
};
