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
import type { MainMenuSection } from './components/MainMenuDrawer';

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
import { GamesContentPage } from './pages/content/GamesContentPage';
import { FAQPage } from './pages/content/FAQPage';
import { HelpSupportPage } from './pages/content/HelpSupportPage';
import { SubscriptionPage } from './pages/content/SubscriptionPage';
import { PricingPage } from './pages/content/PricingPage';
import { TermsPage } from './pages/content/TermsPage';
import { PrivacyPage } from './pages/content/PrivacyPage';
import { StorageService } from './services/storageService';
import { AuthService } from './services/authService';
import { apiService } from './services/apiService';

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
    requestSessionStart,
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
    const msisdnParam = params.get('msisdn') || params.get('phone');
    const tokenParam = params.get('token');
    const hasTelebirrParams = params.has('msisdn') || params.has('token') || params.has('from');
    
    if (msisdnParam) {
      AuthService.loginWithTeleBirr(msisdnParam, tokenParam || undefined).then((res) => {
        if (res.profile) {
          setProfile(res.profile);
        }
      });
    } else {
      // Sync with real backend profile
      apiService.getProfile().then((backendProfile) => {
        if (backendProfile) {
          setProfile(backendProfile);
          StorageService.saveProfile(backendProfile);
        }
      });
    }

    if (hasTelebirrParams || !sessionStorage.getItem('telebirr_handshake_seen')) {
      setIsHandshakeOpen(true);
      sessionStorage.setItem('telebirr_handshake_seen', 'true');
    }

    const timer = setTimeout(() => {
      setIsAppLaunching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Universal Navigation & History Stack Coordinator
  const openOverlay = (tag: string, action: () => void) => {
    window.history.pushState({ goplay_layer: tag }, '');
    action();
  };

  const closeOverlay = (fallback: () => void) => {
    if (window.history.state?.goplay_layer) {
      window.history.back();
    } else {
      fallback();
    }
  };

  // Comprehensive Mobile Phone Back Button (popstate) Handler
  useEffect(() => {
    const handlePopState = () => {
      // 1. Critical Telebirr payment/receipt dialogs
      if (completedReceipt) {
        setCompletedReceipt(null);
        return;
      }
      if (selectedPlanForPayment) {
        setSelectedPlanForPayment(null);
        return;
      }
      if (selectedPlanForConsent) {
        setSelectedPlanForConsent(null);
        setIsPlanModalOpen(true);
        return;
      }
      if (isPlanModalOpen) {
        setIsPlanModalOpen(false);
        return;
      }

      // 2. Action modals
      if (isCoinTopupOpen) {
        setIsCoinTopupOpen(false);
        return;
      }
      if (selectedGameForDetails) {
        setSelectedGameForDetails(null);
        return;
      }
      if (pendingAccessGame) {
        setPendingAccessGame(null);
        return;
      }
      if (isLegalModalOpen) {
        setIsLegalModalOpen(false);
        return;
      }

      // 3. Main Menu Drawer
      if (isMainMenuOpen) {
        setIsMainMenuOpen(false);
        return;
      }

      // 4. Fullscreen Active Game Session
      if (activeGameToLaunch) {
        closeGameLauncher();
        return;
      }

      // 5. Dedicated Content Views (Subscriptions, Pricing, FAQ, Terms, etc.)
      if (contentView !== null) {
        setContentView(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 6. Navigation Tabs
      if (activeTab !== 'games') {
        setActiveTab('games');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    completedReceipt,
    selectedPlanForPayment,
    selectedPlanForConsent,
    isPlanModalOpen,
    isCoinTopupOpen,
    selectedGameForDetails,
    pendingAccessGame,
    isLegalModalOpen,
    isMainMenuOpen,
    activeGameToLaunch,
    contentView,
    activeTab,
    closeGameLauncher,
  ]);

  const navigateToContentSection = (section: MainMenuSection) => {
    setIsMainMenuOpen(false);
    openOverlay(`content_${section}`, () => {
      setContentView(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleBackFromContent = () => {
    closeOverlay(() => {
      setContentView(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleOpenMainMenu = () => {
    openOverlay('menu', () => setIsMainMenuOpen(true));
  };

  const handleCloseMainMenu = () => {
    closeOverlay(() => setIsMainMenuOpen(false));
  };

  const handleOpenCoinTopup = () => {
    setIsMainMenuOpen(false);
    openOverlay('coin_topup', () => setIsCoinTopupOpen(true));
  };

  const handleCloseCoinTopup = () => {
    closeOverlay(() => setIsCoinTopupOpen(false));
  };

  const handleOpenGameDetails = (g: GameDefinition) => {
    openOverlay(`details_${g.id}`, () => setSelectedGameForDetails(g));
  };

  const handleCloseGameDetails = () => {
    closeOverlay(() => setSelectedGameForDetails(null));
  };

  const handleCloseGameLauncher = () => {
    closeOverlay(() => closeGameLauncher());
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

  const TOURNAMENT_GAMES = ['crazy-colors', 'fruit-slice', 'helix-jump', 'pop-piano'];

  /**
   * Centralized Game Play Controller:
   * 1. All catalog games are 100% FREE!
   * 2. The 4 tournament games require 2 coins to play (10 ETB pack = 10 coins = 5 plays).
   */
  const handlePlayGame = (game: GameDefinition) => {
    setIsMainMenuOpen(false);
    setSelectedGameForDetails(null);
    setPendingAccessGame(null);

    // 1. Mandatory Plan Gating:
    // User must have an active subscription plan (daily, weekly, or monthly) to access games.
    // Coins persist intact even if the plan expires, but a plan is required to play.
    if (!isSubscriptionValid()) {
      if (profile.subscription?.expiresAt && Date.now() >= profile.subscription.expiresAt) {
        showToast('info', 'Your pass has expired. Select a daily, weekly, or monthly plan to play (your coin balance remains intact)!', 'Pass Expired');
      } else {
        showToast('info', 'An active plan is required to access games. Select a plan to start playing!', 'Plan Required');
      }
      openOverlay('plan_selection', () => setIsPlanModalOpen(true));
      return;
    }

    const isTournament = TOURNAMENT_GAMES.includes(game.id);

    // Free Games (All non-tournament games are free under the active plan)
    if (!isTournament) {
      EntitlementService.recordGamePlayed(game.id);
      openOverlay(`game_${game.id}`, () => launchGame(game));
      return;
    }

    // Tournament Games: requires 2 coins
    if (profile.coins >= 2) {
      EntitlementService.recordGamePlayed(game.id);
      openOverlay(`game_${game.id}`, () => launchGame(game));
      return;
    }

    // Insufficient coins for tournament match
    showToast('info', 'Tournament matches require 2 coins. Top up coins via telebirr to play!', 'Coins Required');
    openOverlay('coin_topup', () => setIsCoinTopupOpen(true));
  };

  const handleAccessGranted = (updatedProfile: typeof profile, gameToPlay: CatalogGame) => {
    setProfile(updatedProfile);
    setPendingAccessGame(null);
    EntitlementService.recordGamePlayed(gameToPlay.gameId);
    showToast('success', `Access granted to ${gameToPlay.gameName}!`, 'telebirr Authorized');
    const def = GameRegistry.getGameById(gameToPlay.gameId);
    if (def) {
      openOverlay(`game_${def.id}`, () => launchGame(def));
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
    openOverlay(`consent_${plan.id}`, () => setSelectedPlanForConsent(plan));
  };

  const handleConfirmConsent = () => {
    const plan = selectedPlanForConsent;
    setSelectedPlanForConsent(null);
    if (plan) {
      openOverlay(`payment_${plan.id}`, () => setSelectedPlanForPayment(plan));
    }
  };

  const handlePaymentSuccess = (receipt: PaymentReceiptData) => {
    setSelectedPlanForPayment(null);
    openOverlay('receipt', () => setCompletedReceipt(receipt));
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
    closeOverlay(() => setCompletedReceipt(null));
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

        {/* 1. Global Native Mini-App Header (Hidden in dedicated content views to prevent stacked double headers) */}
        {contentView === null && (
          <Header
            profile={profile}
            onOpenBuyCoins={handleOpenCoinTopup}
          />
        )}

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
                  onOpenDetails={handleOpenGameDetails}
                  onOpenBuyCoins={handleOpenCoinTopup}
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
                  onOpenBuyCoins={handleOpenCoinTopup}
                  initialCategory={selectedCategoryFilter}
                  activeEntitlements={activeEntitlements}
                />
              )}

              {activeTab === 'tournament' && (
                <TournamentPage
                  profile={profile}
                  onPlayGame={handlePlayGame}
                  onOpenBuyCoins={handleOpenCoinTopup}
                  onProfileUpdate={setProfile}
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
                  onOpenBuyCoins={handleOpenCoinTopup}
                  onProfileUpdate={setProfile}
                  onNavigateContent={navigateToContentSection}
                />
              )}
            </>
          )}
        </main>

        {/* 4. Mobile-First Bottom Navigation Bar (5 Tabs) */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (contentView !== null) {
              setContentView(null);
            }
            setIsMainMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setActiveTab(tab);
          }}
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
          onClose={() => closeOverlay(() => setIsPlanModalOpen(false))}
          onSelectPlan={handleSelectPlan}
        />

        {/* C. Legal Purchase Consent */}
        {selectedPlanForConsent && (
          <TelebirrPurchaseConsentModal
            isOpen={Boolean(selectedPlanForConsent)}
            plan={selectedPlanForConsent}
            onConfirm={handleConfirmConsent}
            onBack={() => {
              closeOverlay(() => {
                setSelectedPlanForConsent(null);
                setIsPlanModalOpen(true);
              });
            }}
            onClose={() => closeOverlay(() => setSelectedPlanForConsent(null))}
          />
        )}

        {/* D. Payment Processing ("Awaiting payment..." + Native Telebirr Sheet) */}
        {selectedPlanForPayment && (
          <TelebirrPaymentProcessingModal
            isOpen={Boolean(selectedPlanForPayment)}
            plan={selectedPlanForPayment}
            profile={profile}
            onSuccess={handlePaymentSuccess}
            onCancel={() => closeOverlay(() => setSelectedPlanForPayment(null))}
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
            onClose={() => closeOverlay(() => setPendingAccessGame(null))}
            onAccessGranted={handleAccessGranted}
            onOpenTopup={handleOpenCoinTopup}
          />
        )}

        {/* 6. Coin Topup Modal (telebirr Instant Wallet Billing) */}
        <CoinTopupModal
          isOpen={isCoinTopupOpen}
          onClose={handleCloseCoinTopup}
          profile={profile}
          onProfileUpdate={setProfile}
        />

        {/* 7. Game Details Modal */}
        {selectedGameForDetails && (
          <GameDetailsModal
            game={selectedGameForDetails}
            isOpen={Boolean(selectedGameForDetails)}
            onClose={handleCloseGameDetails}
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
            onClose={handleCloseGameLauncher}
            onGameOver={handleGameFinished}
            onRequestSessionStart={() => requestSessionStart(activeGameToLaunch)}
            onRequireCoins={handleOpenCoinTopup}
            onPlayAgain={() => {
              const currentGame = activeGameToLaunch;
              handleCloseGameLauncher();
              setTimeout(() => handlePlayGame(currentGame), 100);
            }}
            isAudioEnabled={audioEnabled}
          />
        )}

        {/* 9. Legal, Terms & Privacy Modal */}
        {isLegalModalOpen && (
          <TermsAndPrivacyModal
            initialTab={legalModalTab}
            onClose={() => closeOverlay(() => setIsLegalModalOpen(false))}
            onConfirmDeleteAccount={wipeAccountData}
          />
        )}

        {/* 10. Floating Toast Notifications */}
        <NotificationToast toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ErrorBoundary>
  );
}
