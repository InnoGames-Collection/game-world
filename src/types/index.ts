/**
 * Core type definitions for TelePlay Ethiopia (EthioTelecom Gaming Portal)
 */

export type NavigationTab = 'home' | 'games' | 'tournament' | 'leaderboard' | 'profile' | 'admin';

export type GameCategory = 
  | 'all' 
  | 'Action'
  | 'Arcade'
  | 'Puzzle'
  | 'Racing'
  | 'Sports'
  | 'Adventure'
  | 'Board'
  | 'Music'
  | 'Casual'
  | 'Strategy'
  | 'Other'
  | 'puzzle' 
  | 'reaction' 
  | 'knowledge' 
  | 'music' 
  | 'racing' 
  | 'sports'
  | 'arcade' 
  | 'strategy' 
  | 'action' 
  | 'trivia';

export type LanguageCode = 'en' | 'am' | 'om' | 'ti';

export type SubscriptionPlan = 'free' | 'daily' | 'weekly' | 'monthly';

export interface UserProfile {
  id: string;
  phoneNumber: string; // e.g. 0912345678 or +251 91 142 8890
  displayName: string;
  avatarId: string;
  isRegistered: boolean;
  telebirrLinked: boolean;
  telebirrBalance: number; // in ETB
  coins: number;
  xp: number;
  level: number;
  energy: number;
  maxEnergy: number;
  lastEnergyRefillTimestamp: number; // unix timestamp in ms
  hasReceivedInitialCoins?: boolean; // one-time 25 coins upon confirmed subscription
  subscription: {
    plan: SubscriptionPlan;
    isActive: boolean;
    expiresAt?: number;
    autoRenew: boolean;
  };
  streak: {
    current: number;
    lastClaimedDate: string; // YYYY-MM-DD
    hasClaimedToday: boolean;
  };
  highScores: Record<string, number>; // gameId -> highScore
  dailyScores?: Record<string, Record<string, number>>;
  achievements: string[];
  matchesPlayed: number;
  trophiesCount: number;
  // telebirr identity
  telebirrId?: string;
  role?: 'player' | 'admin';
  // Aliases for game engine compatibility
  phone?: string;
  name?: string;
  username?: string;
  energyBalance?: number;
}

export interface GameDefinition {
  id: string;
  title: string;
  titleAmharic: string;
  category: GameCategory;
  genre: string;
  tagline: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | string;
  thumbnailUrl: string;
  bannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
  rating: number;
  playsCount: number;
  energyCost: number;
  entryCostCoins?: number;
  featured: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  instructions: string[];
  controlsDescription: string;
  // GameON Tele extensions:
  accessType?: 'FREE' | 'COIN' | 'SUBSCRIPTION' | 'PURCHASE' | 'TRIAL';
  isFree?: boolean;
  requiresCoins?: boolean;
  coinCost?: number;
  price?: number;
  subscriptionOptions?: {
    daily?: { enabled: boolean; priceETB: number };
    weekly?: { enabled: boolean; priceETB: number };
    monthly?: { enabled: boolean; priceETB: number };
  };
  leaderboardEnabled?: boolean;
  sortOrder?: number;
  providerId?: string;
  providerName?: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  displayName: string;
  phoneNumberMasked: string; // e.g. +251 91 **** 456 (MSISDN masked)
  avatarId: string;
  score: number;
  gameId: string;
  gameTitle: string;
  reward?: string; // e.g. "20,000 ETB TeleBirr", "5,000 ETB + VIP Pass"
  isVip: boolean;
  region: string; // Addis Ababa, Oromia, Amhara, Dire Dawa, Sidama, etc.
  timestamp: string;
}

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'alltime';
export type TournamentCycle = 'daily' | 'weekly' | 'monthly';
export type TournamentStatus = 'Upcoming' | 'Live' | 'Ended';

export interface Tournament {
  id: string;
  title: string;
  gameId: string;
  gameTitle: string;
  cycle: TournamentCycle;
  bannerImage: string;
  prizePoolETB: number;
  prizePoolCoins: number;
  entryFeeEnergy: number;
  entryRequirement: string; // e.g. "Free (1 Energy)" / "VIP Pass Required" / "Level 2+"
  startDate: string; // ISO or formatted date
  endDate: string; // ISO or formatted date
  status: TournamentStatus;
  participantsCount: number;
  sponsor: string; // "EthioTelecom 5G" / "TeleBirr SuperApp"
  playerRank?: number;
  playerScore?: number;
  hasSubmitted?: boolean;
  prizes: {
    rank: string;
    reward: string;
    telebirrETB: number;
  }[];
}

export interface RewardTransaction {
  id: string;
  idempotencyKey: string;
  userId: string;
  msisdnMasked: string;
  gameId: string;
  gameTitle: string;
  tournamentId?: string;
  score: number;
  rank: number;
  reward: string; // e.g. "1,500 ETB TeleBirr Transfer"
  rewardETB: number;
  rewardCoins: number;
  timestamp: string;
  status: 'PENDING' | 'CONFIRMED' | 'DISBURSED' | 'FAILED';
  verificationSource: 'SERVER_AUTHORITATIVE' | 'DEMO_SIMULATION';
  auditHash: string;
}

export interface DailyRewardItem {
  day: number;
  coins: number;
  energy: number;
  badge?: string;
  special?: boolean;
}

export type EnergyTransactionType = 
  | 'DAILY_REGEN' 
  | 'PURCHASE_TELEBIRR' 
  | 'PURCHASE_AIRTIME' 
  | 'GAME_CONSUMPTION' 
  | 'REWARDED_AD_BONUS' 
  | 'TOURNAMENT_ENTRY' 
  | 'DAILY_REWARD';

export interface EnergyTransaction {
  transactionId: string;
  type: EnergyTransactionType;
  amount: number; // positive for additions (+10), negative for consumptions (-1)
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  details?: string;
}

export type PaymentMethod = 'TELEBIRR' | 'ETHIO_AIRTIME' | 'USSD_CARRIER';
export type PaymentStatus = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface PaymentTransaction {
  transactionId: string;
  method: PaymentMethod;
  amountETB: number;
  itemType: 'ENERGY_PACK' | 'VIP_SUBSCRIPTION' | 'TOURNAMENT_BUYIN';
  itemTitle: string;
  timestamp: string;
  status: PaymentStatus;
  msisdnMasked: string;
  errorCode?: string;
  errorMessage?: string;
  referenceCode?: string;
}

export interface ClaimableReward {
  id: string;
  tournamentId?: string;
  gameTitle: string;
  rank: number;
  rewardText: string;
  amountETB: number;
  claimed: boolean;
  claimedAt?: string;
  telebirrRef?: string;
  status: 'READY' | 'PROCESSING' | 'DISBURSED' | 'EXPIRED';
}

export interface RewardedAdState {
  isOpen: boolean;
  adId: string;
  brand: string;
  durationSeconds: number;
  rewardType: 'energy' | 'coins' | 'revive';
  rewardAmount: number;
  onRewardClaimed: () => void;
}

export interface InterstitialAdState {
  isOpen: boolean;
  adId: string;
  brand: string;
  durationSeconds: number;
  onAdClosed: () => void;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'energy';
  title: string;
  description?: string;
}

export interface GameSessionResult {
  gameId: string;
  score: number;
  coinsEarned: number;
  goldEarned?: number;
  xpEarned: number;
  isNewHighScore: boolean;
  durationSeconds: number;
}

export interface GameEntitlement {
  gameId: string;
  gameName: string;
  accessType: 'FREE' | 'COIN' | 'SUBSCRIPTION';
  billingPeriod?: 'daily' | 'weekly' | 'monthly';
  grantedAt: number;
  expiresAt?: number;
  transactionRef?: string;
}

