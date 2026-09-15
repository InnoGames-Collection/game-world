export type ScoreType = 'score' | 'time' | 'stage';

export interface GameTheme {
  primaryGradient: string;
  accentColor: string;
  badgeBg: string;
  cardBg: string;
  iconEmoji: string;
  bannerBg?: string;
}

export interface HowToPlayConfig {
  summary: string;
  rules: string[];
  controls: string;
  proTips: string[];
}

export interface GameAchievementConfig {
  id: string;
  title: string;
  desc: string;
  icon: string;
  maxProgress: number;
}

export interface GameAboutConfig {
  version: string;
  developer: string;
  engine: string;
  features: string[];
}

export interface GameConfig {
  gameId: string;
  title: string;
  titleAmharic: string;
  genre: string;
  tagline: string;
  description: string;
  hasLevels: boolean;
  totalLevels?: number;
  scoreType: ScoreType;
  scoreLabel: string;
  theme: GameTheme;
  howToPlay: HowToPlayConfig;
  achievements: GameAchievementConfig[];
  about: GameAboutConfig;
}
