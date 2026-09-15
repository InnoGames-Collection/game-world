/**
 * GAMEON TELE - Official telebirr SuperApp Game Center
 * Main Application Orchestrator
 */

import React, { useState, useEffect } from 'react';
import { usePortalState } from './hooks/usePortalState';
import { GameRegistry } from './games/registry';
import { GameDefinition } from './types';
import { EntitlementService } from './services/entitlementService';
import { CatalogGame, GameCatalog } from './services/gameCatalog';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { NotificationToast } from './components/NotificationToast';
import { ErrorBoundary } from './components/ErrorBoundary';

// Modals
import { GameLauncherModal } from './components/GameLauncherModal';
import { GameAccessModal } from './components/GameAccessModal';
import { CoinTopupModal } from './components/CoinTopupModal';
import { GameDetailsModal } from './components/GameDetailsModal';
import { TermsAndPrivacyModal } from './components/TermsAndPrivacyModal';
import { MainMenuDrawer, MainMenuSection } from './components/MainMenuDrawer';

// Pages
import { HomePage } from './pages/HomePage';
import { GamesPage } from './pages/GamesPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { GamesContentPage } from './pages/content/GamesContentPage';
import { FAQPage } from './pages/content/FAQPage';
import { HelpSupportPage } from './pages/content/HelpSupportPage';
import { SubscriptionPage } from './pages/content/SubscriptionPage';
import { PricingPage } from './pages/content/PricingPage';
import { TermsPage } from './pages/content/TermsPage';
import { PrivacyPage } from './pages/content/PrivacyPage';

export default function App() {
  const {
    activeTab,
    setActiveTab,
    profile,
    setProfile,
    language,
    changeLanguage,
    t,
    // Game Launcher State
    activeGameToLaunch,
    launchGame,
    closeGameLauncher,
    handleGameFinished,
    lastGameSessionResult,
    // Modals
    isLegalModalOpen,
    setIsLegalModalOpen,
    legalModalTab,
    openLegalModal,
    // Actions
    resetDemoState,
    wipeAccountData,
    signOut,
    // Settings & Toasts
    audioEnabled,
    toasts,
    showToast,
    dismissToast,
  } = usePortalState();

  const [isAppLaunching, setIsAppLaunching] = useState(true);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [contentView, setContentView] = useState<MainMenuSection | null>(null);

  // Game Access & Modals State
  const [pendingAccessGame, setPendingAccessGame] = useState<CatalogGame | null>(null);
  const [isCoinTopupOpen, setIsCoinTopupOpen] = useState(false);
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<GameDefinition | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All Games');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLaunching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Handle browser back button when a content page is open
  useEffect(() => {
    const handlePopState = () => {
      if (contentView !== null) {
        setContentView(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [contentView]);

  const navigateToContentSection = (section: MainMenuSection) => {
    window.history.pushState({ contentView: section }, '');
    setContentView(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromContent = () => {
    setContentView(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allGames = GameRegistry.getAllGames();

  // Active access map for all games
  const activeEntitlements = allGames.reduce((acc, g) => {
    acc[g.id] = EntitlementService.checkAccess(g.id, profile).hasAccess;
    return acc;
  }, {} as Record<string, boolean>);

  /**
   * Centralized Game Play Controller:
   * Checks access entitlement -> if authorized, launches game;
   * If not, prompts GameAccessModal for telebirr authorization or coin payment.
   */
  const handlePlayGame = (game: GameDefinition) => {
    const accessCheck = EntitlementService.checkAccess(game.id, profile);
    if (accessCheck.hasAccess) {
      EntitlementService.recordGamePlayed(game.id);
      launchGame(game);
    } else {
      const catalogGame = GameCatalog.getById(game.id);
      if (catalogGame) {
        setPendingAccessGame(catalogGame);
      } else {
        launchGame(game);
      }
    }
  };

  const handleAccessGranted = (updatedProfile: typeof profile, gameToPlay: CatalogGame) => {
    setProfile(updatedProfile);
    setPendingAccessGame(null);
    EntitlementService.recordGamePlayed(gameToPlay.gameId);
    showToast('success', `Access granted to ${gameToPlay.gameName}!`, 'telebirr Authorized');
    const def = GameRegistry.getGameById(gameToPlay.gameId);
    if (def) {
      launchGame(def);
    }
  };

  // Splash Screen
  if (isAppLaunching) {
    return (
      <div className="fixed inset-0 z-50 bg-[#17202A] text-white flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[#8BCB3D] flex items-center justify-center shadow-xl mb-4 border border-white/20">
          <span className="font-black text-2xl text-white tracking-tight">GO</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5 uppercase">
          <span>GAMEON</span>
          <span className="text-[#1688C9]">TELE</span>
        </h1>
        <p className="text-xs text-slate-300 mt-1 font-medium">telebirr SuperApp Game Center</p>
        <div className="mt-6 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#8BCB3D] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#8BCB3D] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#8BCB3D] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#8BCB3D] selection:text-white">
      
      {/* 1. Global Native Mini-App Header */}
      <Header
        profile={profile}
        onOpenBuyCoins={() => setIsCoinTopupOpen(true)}
        onOpenMenu={() => setIsMainMenuOpen(true)}
      />

      {/* 2. Main Dynamic Content Area */}
      <main className="flex-1 w-full">
        {/* Content Pages from Main Menu */}
        {contentView === 'games' && (
          <div className="py-2">
            <GamesContentPage
              games={allGames}
              profile={profile}
              onLaunchGame={handlePlayGame}
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {contentView === 'faq' && (
          <div className="py-2">
            <FAQPage
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {contentView === 'help_support' && (
          <div className="py-2">
            <HelpSupportPage
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {contentView === 'subscription' && (
          <div className="py-2">
            <SubscriptionPage
              onBack={handleBackFromContent}
              showHeader={true}
              profile={profile}
              onProfileUpdate={setProfile}
            />
          </div>
        )}

        {contentView === 'pricing' && (
          <div className="py-2">
            <PricingPage
              onBack={handleBackFromContent}
              showHeader={true}
              onBuyCoins={() => setIsCoinTopupOpen(true)}
            />
          </div>
        )}

        {contentView === 'terms' && (
          <div className="py-2">
            <TermsPage
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {contentView === 'privacy' && (
          <div className="py-2">
            <PrivacyPage
              onBack={handleBackFromContent}
              showHeader={true}
            />
          </div>
        )}

        {/* Tab Views (Active when no top-level content view is open) */}
        {contentView === null && (
          <>
            {activeTab === 'home' && (
              <HomePage
                games={allGames}
                profile={profile}
                onLaunchGame={handlePlayGame}
                onOpenDetails={(g) => setSelectedGameForDetails(g)}
                onOpenBuyCoins={() => setIsCoinTopupOpen(true)}
                onNavigateToGames={(category) => {
                  setSelectedCategoryFilter(category || 'All Games');
                  setActiveTab('games');
                }}
                activeEntitlements={activeEntitlements}
              />
            )}

            {activeTab === 'games' && (
              <GamesPage
                games={allGames}
                profile={profile}
                onLaunchGame={handlePlayGame}
                initialCategory={selectedCategoryFilter}
                activeEntitlements={activeEntitlements}
              />
            )}

            {activeTab === 'leaderboard' && (
              <LeaderboardPage
                profile={profile}
                games={allGames}
                onPlayGame={handlePlayGame}
              />
            )}

            {activeTab === 'profile' && (
              <ProfilePage
                profile={profile}
                games={allGames}
                language={language}
                onLanguageChange={changeLanguage}
                onPlayGame={handlePlayGame}
                onOpenBuyCoins={() => setIsCoinTopupOpen(true)}
                onProfileUpdate={setProfile}
              />
            )}
          </>
        )}
      </main>

      {/* 3. Main Menu Drawer */}
      <MainMenuDrawer
        isOpen={isMainMenuOpen}
        onClose={() => setIsMainMenuOpen(false)}
        onSelectSection={(sec) => navigateToContentSection(sec)}
      />

      {/* 4. Mobile-First Bottom Navigation Bar (4 Exact Tabs) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        labels={{
          home: 'HOME',
          games: 'GAMES',
          leaderboard: 'LEADERBOARD',
          profile: 'PROFILE',
        }}
      />

      {/* 5. Game Access & Entitlement Modal */}
      {pendingAccessGame && (
        <GameAccessModal
          game={pendingAccessGame}
          profile={profile}
          isOpen={Boolean(pendingAccessGame)}
          onClose={() => setPendingAccessGame(null)}
          onAccessGranted={handleAccessGranted}
          onOpenTopup={() => setIsCoinTopupOpen(true)}
        />
      )}

      {/* 6. Coin Topup Modal (telebirr Instant Wallet Billing) */}
      <CoinTopupModal
        isOpen={isCoinTopupOpen}
        onClose={() => setIsCoinTopupOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
      />

      {/* 7. Game Details Modal */}
      {selectedGameForDetails && (
        <GameDetailsModal
          game={selectedGameForDetails}
          isOpen={Boolean(selectedGameForDetails)}
          onClose={() => setSelectedGameForDetails(null)}
          onPlayGame={handlePlayGame}
          hasActiveAccess={Boolean(activeEntitlements[selectedGameForDetails.id])}
        />
      )}

      {/* 8. Fullscreen Game Launcher / Active Game Session Modal */}
      {activeGameToLaunch && (
        <GameLauncherModal
          game={activeGameToLaunch}
          profile={profile}
          lastResult={lastGameSessionResult}
          onClose={closeGameLauncher}
          onGameOver={handleGameFinished}
          onPlayAgain={() => {
            const currentGame = activeGameToLaunch;
            closeGameLauncher();
            setTimeout(() => handlePlayGame(currentGame), 100);
          }}
          isAudioEnabled={audioEnabled}
        />
      )}

      {/* 9. Legal, Terms & Privacy Modal */}
      {isLegalModalOpen && (
        <TermsAndPrivacyModal
          initialTab={legalModalTab}
          onClose={() => setIsLegalModalOpen(false)}
          onConfirmDeleteAccount={wipeAccountData}
        />
      )}

        {/* 10. Floating Toast Notifications */}
        <NotificationToast toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ErrorBoundary>
  );
}
