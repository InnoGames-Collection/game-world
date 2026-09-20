/**
 * GoPlay - Official telebirr SuperApp Game Center
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
import { GoPlayLogo } from './components/GoPlayLogo';

// Modals
import { GameLauncherModal } from './components/GameLauncherModal';
import { GameAccessModal } from './components/GameAccessModal';
import { CoinTopupModal } from './components/CoinTopupModal';
import { GameDetailsModal } from './components/GameDetailsModal';
import { TermsAndPrivacyModal } from './components/TermsAndPrivacyModal';
import { MainMenuDrawer, MainMenuSection } from './components/MainMenuDrawer';

// Telebirr Game Center Miniapp Flow Modals (Mazaber Flow Images 1 to 11)
import { TelebirrAuthHandshakeModal } from './components/TelebirrAuthHandshakeModal';
import { TelebirrPlanSelectionModal, GamePlan, GAME_PLANS } from './components/TelebirrPlanSelectionModal';
import { TelebirrPurchaseConsentModal } from './components/TelebirrPurchaseConsentModal';
import { TelebirrPaymentProcessingModal, PaymentReceiptData } from './components/TelebirrPaymentProcessingModal';
import { TelebirrPaymentReceiptModal } from './components/TelebirrPaymentReceiptModal';

// Pages
import { HomePage } from './pages/HomePage';
import { GamesPage } from './pages/GamesPage';
import { TournamentPage } from './pages/TournamentPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPortalPage } from './pages/admin/AdminPortalPage';
import { GamesContentPage } from './pages/content/GamesContentPage';
import { FAQPage } from './pages/content/FAQPage';
import { HelpSupportPage } from './pages/content/HelpSupportPage';
import { SubscriptionPage } from './pages/content/SubscriptionPage';
import { PricingPage } from './pages/content/PricingPage';
import { TermsPage } from './pages/content/TermsPage';
import { PrivacyPage } from './pages/content/PrivacyPage';
import { StorageService } from './services/storageService';

export default function App() {
  const {
    activeTab,
    setActiveTab,
    profile,
    setProfile,
    language,
    changeLanguage,
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
    // Actions
    wipeAccountData,
    // Settings & Toasts
    audioEnabled,
    toasts,
    showToast,
    dismissToast,
  } = usePortalState();

  const [isAppLaunching, setIsAppLaunching] = useState(true);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [contentView, setContentView] = useState<MainMenuSection | null>(null);

  // Game Access & Details Modal State
  const [pendingAccessGame, setPendingAccessGame] = useState<CatalogGame | null>(null);
  const [isCoinTopupOpen, setIsCoinTopupOpen] = useState(false);
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<GameDefinition | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All Games');

  // Telebirr Game Center Flow States (Screenshots 1-11)
  const [isHandshakeOpen, setIsHandshakeOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlanForConsent, setSelectedPlanForConsent] = useState<GamePlan | null>(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<GamePlan | null>(null);
  const [completedReceipt, setCompletedReceipt] = useState<PaymentReceiptData | null>(null);

  useEffect(() => {
    // Check if entered from telebirr or initial session or admin tab
    const params = new URLSearchParams(window.location.search);
    const hasTelebirrParams = params.has('msisdn') || params.has('token') || params.has('from');
    
    if (params.get('tab') === 'admin' || params.get('admin') === 'true') {
      setActiveTab('admin');
    } else if (hasTelebirrParams || !sessionStorage.getItem('telebirr_handshake_seen')) {
      setIsHandshakeOpen(true);
      sessionStorage.setItem('telebirr_handshake_seen', 'true');
    }

    const timer = setTimeout(() => {
      setIsAppLaunching(false);
    }, 400);
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

  // Helper to check if current subscription is strictly valid and not expired
  const isSubscriptionValid = () => {
    if (!profile.subscription?.isActive) return false;
    if (!profile.subscription.expiresAt) return true;
    return Date.now() < profile.subscription.expiresAt;
  };

  // Active access map for all games
  const activeEntitlements = allGames.reduce((acc, g) => {
    const isFreebie = g.id === 'candy-blast' || g.id === 'world-legends' || g.isFree;
    const hasSub = isSubscriptionValid();
    acc[g.id] = isFreebie || hasSub || EntitlementService.checkAccess(g.id, profile).hasAccess;
    return acc;
  }, {} as Record<string, boolean>);

  /**
   * Centralized Game Play Controller:
   * 1. Free games (Candy Blast, World Legends, etc.) -> instant launch!
   * 2. Active on-demand subscription pass -> instant launch!
   * 3. Expired subscription pass or unsubscribed -> open Telebirr Plan Selection Modal!
   */
  const handlePlayGame = (game: GameDefinition) => {
    const isFree = game.id === 'candy-blast' || game.id === 'world-legends' || game.isFree;

    if (isFree) {
      EntitlementService.recordGamePlayed(game.id);
      launchGame(game);
      return;
    }

    // Check on-demand 24h pass validity
    if (isSubscriptionValid()) {
      EntitlementService.recordGamePlayed(game.id);
      launchGame(game);
      return;
    }

    // Pass expired or not active -> prompt telebirr on-demand plan selection (Screenshot 6)
    if (profile.subscription?.expiresAt && Date.now() >= profile.subscription.expiresAt) {
      showToast('info', 'Your 24-hour pass has expired. Select a plan to continue.', 'Pass Expired');
    }

    setIsPlanModalOpen(true);
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

  // Handshake success
  const handleHandshakeSuccess = (phone?: string) => {
    setIsHandshakeOpen(false);
    if (phone) {
      const updated = {
        ...profile,
        phoneNumber: phone,
        isRegistered: true,
        telebirrLinked: true,
      };
      setProfile(updated);
      StorageService.saveProfile(updated);
      showToast('success', `Signed in as ${phone}`, 'telebirr Connected');
    }
  };

  // On-Demand Plan Flow Handlers
  const handleSelectPlan = (plan: GamePlan) => {
    setIsPlanModalOpen(false);
    setSelectedPlanForConsent(plan);
  };

  const handleConfirmConsent = () => {
    const plan = selectedPlanForConsent;
    setSelectedPlanForConsent(null);
    if (plan) {
      setSelectedPlanForPayment(plan);
    }
  };

  const handlePaymentSuccess = (receipt: PaymentReceiptData) => {
    setSelectedPlanForPayment(null);
    setCompletedReceipt(receipt);
  };

  const handleReceiptConfirmed = () => {
    if (!completedReceipt) return;

    // Calculate exact on-demand expiration timestamp
    const durationMs = completedReceipt.plan.durationHours * 60 * 60 * 1000;
    const expiresAt = Date.now() + durationMs;

    const updated = {
      ...profile,
      coins: profile.coins + 25, // Bonus coins for purchasing plan
      subscription: {
        plan: completedReceipt.plan.id,
        isActive: true,
        expiresAt,
        autoRenew: false,
      },
    };

    setProfile(updated);
    StorageService.saveProfile(updated);
    setCompletedReceipt(null);
    showToast(
      'success',
      `On-Demand ${completedReceipt.plan.name} activated! Valid for ${completedReceipt.plan.durationLabel}.`,
      'telebirr Confirmed'
    );
  };

  // Splash Screen with GoPlay Identity
  if (isAppLaunching) {
    return (
      <div className="fixed inset-0 z-50 bg-[#17202A] text-white flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
        <div className="bg-white p-3.5 rounded-2xl shadow-xl mb-4 flex items-center justify-center">
          <GoPlayLogo size="xl" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
          <span>GoPlay</span>
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
        
        {/* Active Pass Expiry Floating Banner */}
        {isSubscriptionValid() && profile.subscription.expiresAt && (
          <div className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-1.5">
              <span>⚡</span>
              <span>All-Access Active</span>
            </span>
            <span className="font-mono text-[10px] bg-emerald-700/80 px-2 py-0.5 rounded-md">
              Expires: {new Date(profile.subscription.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {/* 1. Global Native Mini-App Header */}
        <Header
          profile={profile}
          onOpenBuyCoins={() => setIsCoinTopupOpen(true)}
          onOpenMenu={() => setIsMainMenuOpen(true)}
        />

        {/* 2. Main Dynamic Content Area */}
        <main className="flex-1 w-full pb-20">
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

              {activeTab === 'tournament' && (
                <TournamentPage
                  profile={profile}
                  onPlayGame={handlePlayGame}
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
                  onOpenAdmin={() => setActiveTab('admin')}
                />
              )}

              {activeTab === 'admin' && (
                <AdminPortalPage
                  profile={profile}
                  onBack={() => setActiveTab('home')}
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

        {/* 4. Mobile-First Bottom Navigation Bar (5 Tabs) */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          labels={{
            home: 'HOME',
            games: 'GAMES',
            tournament: 'TOURNAMENT',
            leaderboard: 'LEADERBOARD',
            profile: 'PROFILE',
          }}
        />

        {/* =========================================================================
            TELEBIRR GAME CENTER MINIAPP INTEGRATION MODALS (MAZABER FLOW 1-11)
           ========================================================================= */}
        {/* A. SSO Handshake ("Getting your info...") */}
        {isHandshakeOpen && (
          <TelebirrAuthHandshakeModal
            onSuccess={handleHandshakeSuccess}
          />
        )}

        {/* B. Choose a Plan (Daily: 10 ETB / 24h, Weekly: 50 ETB, Monthly: 175 ETB) */}
        <TelebirrPlanSelectionModal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          onSelectPlan={handleSelectPlan}
        />

        {/* C. Legal Purchase Consent */}
        {selectedPlanForConsent && (
          <TelebirrPurchaseConsentModal
            isOpen={Boolean(selectedPlanForConsent)}
            plan={selectedPlanForConsent}
            onConfirm={handleConfirmConsent}
            onBack={() => {
              const plan = selectedPlanForConsent;
              setSelectedPlanForConsent(null);
              setIsPlanModalOpen(true);
            }}
            onClose={() => setSelectedPlanForConsent(null)}
          />
        )}

        {/* D. Payment Processing ("Awaiting payment..." + Native Telebirr Sheet) */}
        {selectedPlanForPayment && (
          <TelebirrPaymentProcessingModal
            isOpen={Boolean(selectedPlanForPayment)}
            plan={selectedPlanForPayment}
            profile={profile}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setSelectedPlanForPayment(null)}
          />
        )}

        {/* E. Payment Confirmation Receipt */}
        {completedReceipt && (
          <TelebirrPaymentReceiptModal
            isOpen={Boolean(completedReceipt)}
            receipt={completedReceipt}
            onConfirm={handleReceiptConfirmed}
          />
        )}

        {/* 5. Game Access & Entitlement Modal (Fallback) */}
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
