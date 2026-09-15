/**
 * Mobile-First Bottom Navigation Bar for TelePlus (EthioTelecom)
 * Strict Requirements:
 * - Exactly 4 tabs: HOME, GAMES, LEADERBOARD, PROFILE
 * - Equal-width tab containers (grid grid-cols-4), zero horizontal overflow, no clipping on 360dp/390dp/412dp
 * - Comfortable vertical height (h-16)
 * - Clear icon + label
 * - Selected tab: compact green (#8BCB3D) rounded rectangle/pill background with white icon and bold text
 * - Unselected tabs: neutral dark/black icon and text (#17202A)
 * - Navigation background: clean white (#FFFFFF) with subtle top border
 */

import React from 'react';
import { NavigationTab } from '../types';
import { Home, Gamepad2, Trophy, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  labels?: {
    home?: string;
    games?: string;
    leaderboard?: string;
    profile?: string;
  };
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, labels }) => {
  const tabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: labels?.home || 'HOME', icon: Home },
    { id: 'games', label: labels?.games || 'GAMES', icon: Gamepad2 },
    { id: 'leaderboard', label: labels?.leaderboard || 'LEADERBOARD', icon: Trophy },
    { id: 'profile', label: labels?.profile || 'PROFILE', icon: User },
  ];

  return (
    <nav 
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-md select-none h-16"
    >
      <div className="max-w-md md:max-w-xl mx-auto h-full px-2 grid grid-cols-4 items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 cursor-pointer w-full ${
                isSelected
                  ? 'bg-[#8BCB3D] text-white shadow-xs font-black'
                  : 'bg-transparent text-[#17202A] hover:text-[#1688C9] hover:bg-slate-50 font-bold'
              }`}
            >
              <Icon 
                className={`w-5 h-5 shrink-0 ${
                  isSelected ? 'text-white stroke-[2.5]' : 'text-[#17202A] stroke-2'
                }`} 
              />
              <span 
                className={`text-[9.5px] sm:text-[10px] uppercase tracking-tight text-center truncate w-full mt-0.5 leading-none ${
                  isSelected ? 'font-black text-white' : 'font-extrabold text-[#17202A]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
