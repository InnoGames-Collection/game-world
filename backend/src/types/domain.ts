export type SubscriptionPlan = 'free' | 'daily' | 'weekly' | 'monthly';
export type PaymentMethod = 'TELEBIRR' | 'ETHIO_AIRTIME' | 'USSD_CARRIER';
export type PaymentStatus = 'IDLE' | 'PROCESSING' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface UserProfile {
  id: string;
  phoneNumber: string;       // e.g. 0912345678
  displayName: string;
  avatarId: string;
  isRegistered: boolean;
  telebirrLinked: boolean;
  telebirrBalance: number;   // in ETB
  coins: number;
  xp: number;
  level: number;
  energy: number;
  maxEnergy: number;
  lastEnergyRefillTimestamp: number; // ms
  hasReceivedInitialCoins?: boolean;
  subscription: {
    plan: SubscriptionPlan;
    isActive: boolean;
    expiresAt?: number;
    autoRenew: boolean;
  };
  streak: {
    current: number;
    lastClaimedDate: string;
    hasClaimedToday: boolean;
  };
  highScores: Record<string, number>;
  dailyScores?: Record<string, Record<string, number>>;
  achievements: string[];
  matchesPlayed: number;
  trophiesCount: number;
  telebirrId?: string;
  role?: 'player' | 'admin';
}

export interface UserPreferences {
  language: 'en' | 'am' | 'om' | 'ti';
  audio: boolean;
  haptics: boolean;
  notifications: boolean;
  lowData: boolean;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  displayName: string;
  phoneNumberMasked: string; // 0911*****567
  avatarId: string;
  score: number;
  gameId: string;
  gameTitle: string;
  reward?: string;
  isVip: boolean;
  region: string;
  timestamp: string;
}

export interface Tournament {
  id: string;
  title: string;
  gameId: string;
  gameTitle: string;
  cycle: 'daily' | 'weekly' | 'monthly';
  bannerImage: string;
  prizePoolETB: number;
  prizePoolCoins: number;
  entryFeeEnergy: number;
  entryRequirement: string;
  startDate: string;
  endDate: string;
  status: 'Upcoming' | 'Live' | 'Ended';
  participantsCount: number;
  sponsor: string;
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
  reward: string;
  rewardETB: number;
  rewardCoins: number;
  timestamp: string;
  status: 'PENDING' | 'CONFIRMED' | 'DISBURSED' | 'FAILED';
  verificationSource: 'SERVER_AUTHORITATIVE' | 'DEMO_SIMULATION';
  auditHash: string;
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
  grantedAt: number;
  expiresAt?: number;
  transactionRef?: string;
}

export interface PaymentTransaction {
  transactionId: string;
  method: PaymentMethod;
  amountETB: number;
  itemType: string;
  itemTitle: string;
  timestamp: string;
  status: PaymentStatus;
  msisdnMasked: string;
  errorCode?: string;
  errorMessage?: string;
  referenceCode?: string;
}
