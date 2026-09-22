/**
 * Mobile-First Bottom Navigation Bar for GoPlay
 * Strict Requirements:
 * - Exactly 5 tabs in order: HOME, GAMES, TOURNAMENT, LEADERBOARD, PROFILE
 * - Equal-width tab containers (grid grid-cols-5), zero horizontal overflow, no clipping on 360dp/390dp/412dp
 * - Comfortable vertical height (h-16)
 * - Clear icon + label
 * - Selected tab: compact green (#8BCB3D) rounded rectangle/pill background with white icon and bold text
 * - Unselected tabs: neutral dark/black icon and text (#17202A)
 * - Navigation background: clean white (#FFFFFF) with subtle top border
 */

import React from 'react';
import { NavigationTab } from '../types';
import { Home, Gamepad2, Trophy, User } from 'lucide-react';

// Premium Tournament Championship Trophy Cup Icon
const TournamentCupIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    aria-hidden="true"
  >
    {/* Championship Cup Bowl */}
    <path d="M6 3h12v6c0 3.5-2.5 6-6 6s-6-2.5-6-6V3z" />
    {/* Left Curved Handle */}
    <path d="M6 5H4a2 2 0 0 0-2 2v1a3 3 0 0 0 3 3h1" />
    {/* Right Curved Handle */}
    <path d="M18 5h2a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3h-1" />
    {/* Stem */}
    <path d="M12 15v4" />
    {/* Base Pedestal */}
    <path d="M8 21h8" />
    <path d="M9 19h6" />
    {/* Championship Star in cup center */}
    <path d="M12 6.8l.6 1.3 1.4.2-1 1 .3 1.4-1.3-.7-1.3.7.3-1.4-1-1 1.4-.2L12 6.8z" />
  </svg>
);

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  labels?: {
    home?: string;
    games?: string;
    tournament?: string;
    leaderboard?: string;
    profile?: string;
  };
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, labels }) => {
  const tabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'games', label: labels?.games || 'GAMES', icon: Gamepad2 },
    { id: 'tournament', label: labels?.tournament || 'TOURNAMENT', icon: TournamentCupIcon },
    { id: 'home', label: labels?.home || 'HOME', icon: Home },
    { id: 'leaderboard', label: labels?.leaderboard || 'LEADERBOARD', icon: Trophy },
    { id: 'profile', label: labels?.profile || 'PROFILE', icon: User },
  ];

  return (
    <nav 
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-md select-none h-16"
    >
      <div className="max-w-md md:max-w-xl mx-auto h-full px-1.5 grid grid-cols-5 items-center gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-150 cursor-pointer w-full ${
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
                className={`text-[8.5px] sm:text-[9.5px] uppercase tracking-tight text-center truncate w-full mt-0.5 leading-none ${
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
