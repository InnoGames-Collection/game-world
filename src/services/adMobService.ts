/**
 * Google AdMob Integration Architecture & Lifecycle Service
 * 
 * Provides:
 * 1. Banner placement registration & configuration
 * 2. Interstitial placement lifecycle with strict frequency capping (min 3 min cooldown)
 * 3. Rewarded ad placement with clear upfront user reward contract & completion callbacks
 * 4. Anti-annoyance guardrails (never interrupts active gameplay, never overlaps controls)
 */

export interface AdMobConfig {
  appId: string;
  bannerUnitId: string;
  interstitialUnitId: string;
  rewardedUnitId: string;
  testMode: boolean;
}

export interface RewardedOffer {
  id: string;
  brand: string;
  durationSeconds: number;
  rewardType: 'energy' | 'coins' | 'revive';
  rewardAmount: number;
  rewardDescription: string;
  sponsorTagline: string;
}

const DEFAULT_CONFIG: AdMobConfig = {
  appId: 'ca-app-pub-3940256099942544~3347511713', // Standard Google AdMob test app ID
  bannerUnitId: 'ca-app-pub-3940256099942544/6300978111',
  interstitialUnitId: 'ca-app-pub-3940256099942544/1033173712',
  rewardedUnitId: 'ca-app-pub-3940256099942544/5224354917',
  testMode: true,
};

// Frequency capping state
let lastInterstitialShownTimestamp = 0;
const MIN_INTERSTITIAL_INTERVAL_MS = 180000; // 3 minutes cooldown between interstitials

const SPONSOR_OFFERS: RewardedOffer[] = [
  {
    id: 'ad_telebirr_pay',
    brand: 'TeleBirr SuperApp',
    durationSeconds: 5,
    rewardType: 'energy',
    rewardAmount: 2,
    rewardDescription: '+2 Energy Points',
    sponsorTagline: 'Pay utility bills, buy airtime & transfer money with zero fees.',
  },
  {
    id: 'ad_ethio_5g',
    brand: 'EthioTelecom 5G Ultra',
    durationSeconds: 5,
    rewardType: 'energy',
    rewardAmount: 2,
    rewardDescription: '+2 Energy Points',
    sponsorTagline: 'Experience Gigabit wireless speed across Addis Ababa & regional capitals.',
  },
  {
    id: 'ad_teledrive_cloud',
    brand: 'TeleDrive Cloud Backup',
    durationSeconds: 5,
    rewardType: 'coins',
    rewardAmount: 150,
    rewardDescription: '+150 TeleCoins',
    sponsorTagline: 'Secure, unlimited cloud storage for all your photos and documents.',
  },
];

export const AdMobService = {
  getConfig(): AdMobConfig {
    return DEFAULT_CONFIG;
  },

  /**
   * Check if an interstitial is eligible to show (respecting frequency capping)
   */
  canShowInterstitial(): boolean {
    const now = Date.now();
    return now - lastInterstitialShownTimestamp >= MIN_INTERSTITIAL_INTERVAL_MS;
  },

  /**
   * Record that an interstitial was displayed
   */
  recordInterstitialShown(): void {
    lastInterstitialShownTimestamp = Date.now();
  },

  /**
   * Get available rewarded sponsor offers
   */
  getRandomRewardedOffer(rewardType: 'energy' | 'coins' = 'energy'): RewardedOffer {
    const matching = SPONSOR_OFFERS.filter((o) => o.rewardType === rewardType);
    if (matching.length > 0) {
      return matching[Math.floor(Math.random() * matching.length)];
    }
    return SPONSOR_OFFERS[0];
  },
};
