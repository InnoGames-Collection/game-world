/**
 * GameON Tele - Customer Profile & Account Page
 * 
 * Compliant with GameON Tele guidelines:
 * - NO customer login screen: User is pre-authenticated by telebirr SuperApp
 * - telebirr Identity: MSISDN, telebirr balance, GameON coin balance
 * - In-app Coin Topup & All-Access Subscription Management
 * - Game History & Personal High Scores
 * - Clean, responsive UI with zero shortcode dependencies
 */

import React, { useState } from 'react';
import { 
  UserProfile, 
  GameDefinition, 
  EnergyTransaction, 
  ClaimableReward,
  LanguageCode 
} from '../types';
import { 
  User, 
  Phone, 
  Coins, 
  Wallet, 
  Gamepad2, 
  Trophy, 
  Gift, 
  Crown, 
  CreditCard, 
  Headphones, 
  HelpCircle, 
  Settings as SettingsIcon, 
  Info, 
  FileText, 
  ShieldCheck, 
  ArrowLeft, 
  ChevronRight, 
  Sparkles, 
  Volume2, 
  VolumeX,
  Plus
} from 'lucide-react';
import { GamesContentPage } from './content/GamesContentPage';
import { PricingPage } from './content/PricingPage';
import { FAQPage } from './content/FAQPage';
import { HelpSupportPage } from './content/HelpSupportPage';
import { SubscriptionPage } from './content/SubscriptionPage';
import { TermsPage } from './content/TermsPage';
import { PrivacyPage } from './content/PrivacyPage';
import { EntitlementService } from '../services/entitlementService';
import { GameCatalog } from '../services/gameCatalog';
import { catalogGameToDefinition } from '../games/registry';

export type ProfileSubView =
  | null
  | 'games'
  | 'pricing'
  | 'my_games'
  | 'my_scores'
  | 'my_rewards'
  | 'my_rank'
  | 'subscriptions'
  | 'help_support'
  | 'faq'
  | 'settings'
  | 'about'
  | 'terms'
  | 'privacy';

interface ProfilePageProps {
  profile: UserProfile;
  games: GameDefinition[];
  energyTransactions?: EnergyTransaction[];
  claimableRewards?: ClaimableReward[];
  language?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  onOpenEnergyModal?: () => void;
  onOpenSubscriptionModal?: () => void;
  onOpenAuthModal?: () => void;
  onPlayGame: (game: GameDefinition) => void;
  onClaimReward?: (rewardId: string) => void;
  onSignOut?: () => void;
  onOpenBuyCoins?: () => void;
  onProfileUpdate?: (updated: UserProfile) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  games,
  language = 'en',
  onLanguageChange,
  onPlayGame,
  onOpenBuyCoins,
  onProfileUpdate,
}) => {
  const [subView, setSubView] = useState<ProfileSubView>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const phone = profile.phoneNumber || '0911234890';
  const maskedMsisdn = `${phone.slice(0, 3)}*****${phone.slice(-3)}`;

  // Played or unlocked games
  const recentlyPlayedIds = EntitlementService.getRecentlyPlayedIds();
  const myGamesList = GameCatalog.getRecentlyPlayed(recentlyPlayedIds).map(catalogGameToDefinition);

  // Active subscriptions count
  const activeSubsCount = EntitlementService.getActiveSubscriptionsList().length;

  // Subview rendering
  if (subView === 'subscriptions') {
    return (
      <SubscriptionPage
        onBack={() => setSubView(null)}
        profile={profile}
        onProfileUpdate={onProfileUpdate}
      />
    );
  }

  if (subView === 'pricing') {
    return (
      <PricingPage
        onBack={() => setSubView(null)}
        onBuyCoins={onOpenBuyCoins}
      />
    );
  }

  if (subView === 'games') {
    return (
      <GamesContentPage
        onBack={() => setSubView(null)}
        onLaunchGame={onPlayGame}
      />
    );
  }

  if (subView === 'terms') {
    return <TermsPage onBack={() => setSubView(null)} />;
  }

  if (subView === 'privacy') {
    return <PrivacyPage onBack={() => setSubView(null)} />;
  }

  if (subView === 'faq') {
    return <FAQPage onBack={() => setSubView(null)} />;
  }

  if (subView === 'help_support') {
    return <HelpSupportPage onBack={() => setSubView(null)} />;
  }

  if (subView === 'my_games') {
    return (
      <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4">
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubView(null)}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <h1 className="text-base font-black tracking-tight">My Games</h1>
          </div>
        </div>

        {myGamesList.length > 0 ? (
          <div className="space-y-2.5">
            {myGamesList.map((g) => (
              <div
                key={g.id}
                onClick={() => onPlayGame(g)}
                className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#1688C9] transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={g.thumbnailUrl || g.bannerUrl}
                    alt={g.title}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-900"
                  />
                  <div>
                    <h4 className="text-sm font-black text-[#17202A]">{g.title}</h4>
                    <span className="text-xs text-slate-500 capitalize">{g.category}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-[#8BCB3D] text-white text-xs font-black"
                >
                  Play
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-sm font-bold text-slate-600">No played games recorded yet.</p>
            <button
              onClick={() => setSubView(null)}
              className="mt-3 px-4 py-2 rounded-xl bg-[#1688C9] text-white text-xs font-black cursor-pointer"
            >
              Explore Catalog
            </button>
          </div>
        )}
      </div>
    );
  }

  if (subView === 'my_scores') {
    return (
      <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none space-y-4">
        <div className="flex items-center justify-between gap-3 bg-[#1688C9] text-white p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubView(null)}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <h1 className="text-base font-black tracking-tight">My Scores</h1>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs divide-y divide-slate-100">
          {Object.entries(profile.highScores || {}).map(([gameId, score]) => {
            const catalogGame = GameCatalog.getById(gameId);
            return (
              <div key={gameId} className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-[#17202A]">
                    {catalogGame?.gameName || gameId}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {catalogGame?.category || 'Standard Game'}
                  </div>
                </div>
                <div className="text-sm font-black text-[#1688C9] font-mono">
                  {score.toLocaleString()} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN PROFILE VIEW
  // =========================================================================
  return (
    <div className="min-h-screen bg-white text-[#17202A] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 space-y-4 select-none">
      
      {/* 1. TOP: Authenticated telebirr SuperApp Identity Card */}
      <div 
        id="profile-telebirr-card"
        className="rounded-3xl bg-[#1688C9] text-white p-4.5 shadow-sm space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 text-[#8BCB3D] flex items-center justify-center font-black">
              <Phone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-blue-100 font-black uppercase tracking-wider">
                  telebirr SuperApp Identity
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-[#8BCB3D] text-white text-[8px] font-black uppercase">
                  VERIFIED
                </span>
              </div>
              <div className="text-base font-black font-mono tracking-wider text-white">
                {maskedMsisdn}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenBuyCoins}
            className="px-3 py-1.5 rounded-full bg-[#8BCB3D] hover:bg-[#7cb934] text-white text-xs font-black flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Top Up</span>
          </button>
        </div>

        {/* 3 Balances: Available Coins | telebirr Balance | Active Subscriptions */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15">
          <div 
            onClick={onOpenBuyCoins}
            className="text-center p-2 rounded-2xl bg-white/10 cursor-pointer hover:bg-white/15 transition-colors"
          >
            <div className="text-[9px] font-bold text-blue-100 uppercase">Coins</div>
            <div className="text-xs sm:text-sm font-black text-white mt-0.5 flex items-center justify-center gap-1">
              <span>🪙</span>
              <span>{profile.coins ?? 50}</span>
            </div>
          </div>

          <div className="text-center p-2 rounded-2xl bg-white/10">
            <div className="text-[9px] font-bold text-blue-100 uppercase">telebirr Wallet</div>
            <div className="text-xs sm:text-sm font-black text-white mt-0.5">
              {profile.telebirrBalance.toFixed(2)} ETB
            </div>
          </div>

          <div 
            onClick={() => setSubView('subscriptions')}
            className="text-center p-2 rounded-2xl bg-white/10 cursor-pointer hover:bg-white/15 transition-colors"
          >
            <div className="text-[9px] font-bold text-blue-100 uppercase">All-Access Pass</div>
            <div className="text-xs sm:text-sm font-black text-[#8BCB3D] mt-0.5">
              {profile.subscription?.isActive ? 'ACTIVE' : 'NONE'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MENU ITEMS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
        {[
          { id: 'subscriptions', label: 'All-Access Passes & Subscriptions', icon: CreditCard, count: activeSubsCount ? '1 Active' : undefined },
          { id: 'pricing', label: 'Pricing & Coin Packages', icon: Coins },
          { id: 'my_games', label: 'My Games', icon: Gamepad2, count: myGamesList.length.toString() },
          { id: 'my_scores', label: 'My High Scores', icon: Trophy },
          { id: 'faq', label: 'Frequently Asked Questions (FAQ)', icon: HelpCircle },
          { id: 'help_support', label: 'Help & Customer Care', icon: Headphones },
          { id: 'terms', label: 'Terms & Conditions', icon: FileText },
          { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSubView(item.id as ProfileSubView)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1688C9] flex items-center justify-center group-hover:bg-[#1688C9] group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-xs sm:text-sm font-black text-[#17202A] group-hover:text-[#1688C9] transition-colors">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {item.count && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {item.count}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1688C9] transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Sound & Preference Settings */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#1688C9]" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
          <span className="text-xs font-bold text-slate-700">Game Sound Effects</span>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            soundEnabled ? 'bg-[#8BCB3D]' : 'bg-slate-300'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
              soundEnabled ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* telebirr Mini-App Info */}
      <div className="text-center pt-2 text-[10px] text-slate-400 font-bold space-y-0.5">
        <div>GameON Tele v2.0 • telebirr Mini-App Edition</div>
        <div>telebirr SuperApp Verified Service</div>
      </div>

    </div>
  );
};
