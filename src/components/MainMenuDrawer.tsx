/**
 * Main Menu Drawer Component for TelePlus
 * 
 * Strict Requirement:
 * The TelePlus menu must contain these seven sections in this exact order:
 * 1. Games
 * 2. FAQ
 * 3. Help & Support
 * 4. Subscription
 * 5. Pricing
 * 6. Terms & Conditions
 * 7. Privacy Policy
 * 
 * Each menu item is clickable and navigates to its full content page.
 */

import React from 'react';
import { 
  Gamepad2, 
  HelpCircle, 
  Headphones, 
  CreditCard, 
  BadgePercent, 
  FileText, 
  ShieldCheck, 
  X, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export type MainMenuSection = 
  | 'games'
  | 'faq'
  | 'help_support'
  | 'subscription'
  | 'pricing'
  | 'terms'
  | 'privacy';

interface MainMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (section: MainMenuSection) => void;
}

export const MainMenuDrawer: React.FC<MainMenuDrawerProps> = ({
  isOpen,
  onClose,
  onSelectSection,
}) => {
  if (!isOpen) return null;

  const menuItems: {
    id: MainMenuSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      id: 'games',
      label: 'Games',
      icon: Gamepad2,
      accentColor: 'text-[#8BCB3D] bg-emerald-50 border-emerald-100',
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: HelpCircle,
      accentColor: 'text-amber-500 bg-amber-50 border-amber-100',
    },
    {
      id: 'help_support',
      label: 'Help & Support',
      icon: Headphones,
      accentColor: 'text-[#1688C9] bg-blue-50 border-blue-100',
    },
    {
      id: 'subscription',
      label: 'Subscription',
      icon: CreditCard,
      accentColor: 'text-[#8BCB3D] bg-emerald-50 border-emerald-100',
    },
    {
      id: 'pricing',
      label: 'Pricing',
      icon: BadgePercent,
      accentColor: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      id: 'terms',
      label: 'Terms & Conditions',
      icon: FileText,
      accentColor: 'text-slate-600 bg-slate-50 border-slate-200',
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: ShieldCheck,
      accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <div 
      id="main-menu-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        id="main-menu-panel"
        className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-[#1688C9] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs">
              TP
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight uppercase">TelePlus Menu</h2>
              <span className="text-[10px] text-blue-100 font-medium">EthioTelecom Official Portal</span>
            </div>
          </div>

          <button
            id="main-menu-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Close Menu"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* 7 Menu Items in Exact Required Order */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="space-y-1.5 pt-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`main-menu-item-${item.id}`}
                  onClick={() => {
                    onSelectSection(item.id);
                    onClose();
                  }}
                  className="w-full p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#1688C9]/40 shadow-2xs flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.accentColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="text-sm font-black text-[#17202A] group-hover:text-[#1688C9] transition-colors leading-tight">
                      {item.label}
                    </h3>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1688C9] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
