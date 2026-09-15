/**
 * SOCCER PING PONG - Original Fictional Clubs & National Teams Roster
 * Supports both original fictional clubs and country/flag representation.
 * Authentic flag badges, kits, and striker identities without using copyrighted trademarks.
 */

export interface SoccerTeam {
  id: string;
  name: string;
  city: string;
  shortName: string;
  country: string;
  isCountry?: boolean;
  flagEmoji: string;
  crestSymbol: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  pattern: 'stripes' | 'solid' | 'hoops' | 'sash' | 'halves';
  stars: number; // 3 to 5
  stats: {
    speed: number; // 1-100
    power: number; // 1-100
    control: number; // 1-100
  };
  striker: {
    name: string;
    number: number;
    avatar: string; // emoji / icon visual
    hairColor: string;
    skinTone: string;
  };
}

// 1. ORIGINAL FICTIONAL CLUBS
export const FICTIONAL_CLUBS: SoccerTeam[] = [
  {
    id: 'catalonia',
    name: 'FC Catalonia',
    city: 'Barcelona',
    shortName: 'CAT',
    country: 'Spain',
    flagEmoji: '🇪🇸',
    crestSymbol: '🛡️',
    primaryColor: '#004D98', // Blaugrana Navy
    secondaryColor: '#A50044', // Garnet Red
    accentColor: '#EDBB00',
    textColor: '#FFFFFF',
    pattern: 'stripes',
    stars: 5,
    stats: { speed: 92, power: 88, control: 95 },
    striker: {
      name: 'Mateo Cruz',
      number: 10,
      avatar: '⚡',
      hairColor: '#3d2314',
      skinTone: '#e0ac69',
    },
  },
  {
    id: 'capital-royal',
    name: 'Royal Capital',
    city: 'Madrid',
    shortName: 'RCL',
    country: 'Spain',
    flagEmoji: '🇪🇸',
    crestSymbol: '👑',
    primaryColor: '#FFFFFF', // Royal White
    secondaryColor: '#0C2340', // Deep Navy
    accentColor: '#F5A623', // Gold
    textColor: '#0C2340',
    pattern: 'solid',
    stars: 5,
    stats: { speed: 94, power: 93, control: 90 },
    striker: {
      name: 'Lucas Silva',
      number: 7,
      avatar: '👑',
      hairColor: '#1c1917',
      skinTone: '#c68642',
    },
  },
  {
    id: 'manchester-blue',
    name: 'Manchester Blue',
    city: 'Manchester',
    shortName: 'MCB',
    country: 'England',
    flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    crestSymbol: '🌊',
    primaryColor: '#6CABDD', // Sky Blue
    secondaryColor: '#1C2C5B',
    accentColor: '#FFFFFF',
    textColor: '#FFFFFF',
    pattern: 'solid',
    stars: 5,
    stats: { speed: 91, power: 94, control: 93 },
    striker: {
      name: 'Kai Schneider',
      number: 9,
      avatar: '🌪️',
      hairColor: '#eab308',
      skinTone: '#f8d9b6',
    },
  },
  {
    id: 'london-reds',
    name: 'London Gunners',
    city: 'London',
    shortName: 'LDN',
    country: 'England',
    flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    crestSymbol: '🎯',
    primaryColor: '#DB0007', // Red
    secondaryColor: '#FFFFFF', // White sleeves
    accentColor: '#023474',
    textColor: '#FFFFFF',
    pattern: 'halves',
    stars: 4,
    stats: { speed: 89, power: 86, control: 91 },
    striker: {
      name: 'Bukayo Davies',
      number: 14,
      avatar: '🎯',
      hairColor: '#171717',
      skinTone: '#8d5524',
    },
  },
  {
    id: 'bavaria-stars',
    name: 'Bavaria Munich',
    city: 'Munich',
    shortName: 'BAV',
    country: 'Germany',
    flagEmoji: '🇩🇪',
    crestSymbol: '⚔️',
    primaryColor: '#DC052D', // Deep Red
    secondaryColor: '#0066B2',
    accentColor: '#FFFFFF',
    textColor: '#FFFFFF',
    pattern: 'stripes',
    stars: 5,
    stats: { speed: 88, power: 96, control: 89 },
    striker: {
      name: 'Leon Muller',
      number: 9,
      avatar: '💥',
      hairColor: '#a16207',
      skinTone: '#f5d0b0',
    },
  },
  {
    id: 'milan-striker',
    name: 'Milan Striker',
    city: 'Milan',
    shortName: 'MIL',
    country: 'Italy',
    flagEmoji: '🇮🇹',
    crestSymbol: '🔥',
    primaryColor: '#FB090B', // Red & Black
    secondaryColor: '#000000',
    accentColor: '#FBBF24',
    textColor: '#FFFFFF',
    pattern: 'stripes',
    stars: 4,
    stats: { speed: 87, power: 89, control: 88 },
    striker: {
      name: 'Marco Fontana',
      number: 11,
      avatar: '🔥',
      hairColor: '#292524',
      skinTone: '#dfa675',
    },
  },
  {
    id: 'paris-elite',
    name: 'Paris Elite',
    city: 'Paris',
    shortName: 'PAR',
    country: 'France',
    flagEmoji: '🇫🇷',
    crestSymbol: '🗼',
    primaryColor: '#004170', // Midnight Blue
    secondaryColor: '#DA291C', // Red Sash
    accentColor: '#FFFFFF',
    textColor: '#FFFFFF',
    pattern: 'sash',
    stars: 5,
    stats: { speed: 95, power: 90, control: 92 },
    striker: {
      name: 'Alexandre Dupont',
      number: 10,
      avatar: '🚀',
      hairColor: '#171717',
      skinTone: '#784315',
    },
  },
  {
    id: 'rio-samba',
    name: 'Rio Samba',
    city: 'Rio de Janeiro',
    shortName: 'RIO',
    country: 'Brazil',
    flagEmoji: '🇧🇷',
    crestSymbol: '🌴',
    primaryColor: '#FACC15', // Canary Yellow
    secondaryColor: '#15803D', // Green
    accentColor: '#1D4ED8', // Blue
    textColor: '#1E3A8A',
    pattern: 'solid',
    stars: 4,
    stats: { speed: 93, power: 85, control: 97 },
    striker: {
      name: 'Nico Santos',
      number: 10,
      avatar: '✨',
      hairColor: '#18181b',
      skinTone: '#b97a45',
    },
  },
];

// 2. NATIONAL COUNTRY TEAMS
export const COUNTRY_TEAMS: SoccerTeam[] = [
  {
    id: 'country-ethiopia',
    name: 'Ethiopia (Walias)',
    city: 'Addis Ababa',
    shortName: 'ETH',
    country: 'Ethiopia',
    isCountry: true,
    flagEmoji: '🇪🇹',
    crestSymbol: '🌟',
    primaryColor: '#078930', // Ethiopian Green
    secondaryColor: '#FCDD09', // Yellow
    accentColor: '#DA121A', // Red
    textColor: '#FFFFFF',
    pattern: 'stripes',
    stars: 5,
    stats: { speed: 94, power: 90, control: 95 },
    striker: {
      name: 'Yared Bekele',
      number: 10,
      avatar: '⚡',
      hairColor: '#18181b',
      skinTone: '#603813',
    },
  },
  {
    id: 'country-brazil',
    name: 'Brazil (Canarinho)',
    city: 'Brasília',
    shortName: 'BRA',
    country: 'Brazil',
    isCountry: true,
    flagEmoji: '🇧🇷',
    crestSymbol: '⭐',
    primaryColor: '#FEDF00', // Yellow
    secondaryColor: '#009739', // Green
    accentColor: '#002776', // Blue
    textColor: '#002776',
    pattern: 'solid',
    stars: 5,
    stats: { speed: 96, power: 91, control: 98 },
    striker: {
      name: 'Gabriel Silva',
      number: 10,
      avatar: '✨',
      hairColor: '#1c1917',
      skinTone: '#a16207',
    },
  },
  {
    id: 'country-england',
    name: 'England (Three Lions)',
    city: 'London',
    shortName: 'ENG',
    country: 'England',
    isCountry: true,
    flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    crestSymbol: '🦁',
    primaryColor: '#FFFFFF', // White
    secondaryColor: '#CF081F', // Red Cross
    accentColor: '#0B1F44', // Navy
    textColor: '#0B1F44',
    pattern: 'solid',
    stars: 5,
    stats: { speed: 91, power: 95, control: 92 },
    striker: {
      name: 'Harry Sterling',
      number: 9,
      avatar: '🎯',
      hairColor: '#ca8a04',
      skinTone: '#fed7aa',
    },
  },
  {
    id: 'country-france',
    name: 'France (Les Bleus)',
    city: 'Paris',
    shortName: 'FRA',
    country: 'France',
    isCountry: true,
    flagEmoji: '🇫🇷',
    crestSymbol: '🐓',
    primaryColor: '#002395', // Royal Blue
    secondaryColor: '#FFFFFF', // White
    accentColor: '#ED2939', // Red
    textColor: '#FFFFFF',
    pattern: 'solid',
    stars: 5,
    stats: { speed: 97, power: 92, control: 93 },
    striker: {
      name: 'Kylian Moreau',
      number: 10,
      avatar: '🚀',
      hairColor: '#171717',
      skinTone: '#78350f',
    },
  },
  {
    id: 'country-argentina',
    name: 'Argentina (Albiceleste)',
    city: 'Buenos Aires',
    shortName: 'ARG',
    country: 'Argentina',
    isCountry: true,
    flagEmoji: '🇦🇷',
    crestSymbol: '☀️',
    primaryColor: '#75AADB', // Sky Blue
    secondaryColor: '#FFFFFF', // White stripes
    accentColor: '#F6B40E', // Sun gold
    textColor: '#0B1E3F',
    pattern: 'stripes',
    stars: 5,
    stats: { speed: 93, power: 94, control: 99 },
    striker: {
      name: 'Leo Alvarez',
      number: 10,
      avatar: '👑',
      hairColor: '#451a03',
      skinTone: '#fcd34d',
    },
  },
  {
    id: 'country-germany',
    name: 'Germany (Nationalelf)',
    city: 'Berlin',
    shortName: 'GER',
    country: 'Germany',
    isCountry: true,
    flagEmoji: '🇩🇪',
    crestSymbol: '🦅',
    primaryColor: '#FFFFFF', // White
    secondaryColor: '#000000', // Black
    accentColor: '#FFCC00', // Gold
    textColor: '#000000',
    pattern: 'solid',
    stars: 5,
    stats: { speed: 90, power: 96, control: 91 },
    striker: {
      name: 'Max Brandt',
      number: 8,
      avatar: '💥',
      hairColor: '#854d0e',
      skinTone: '#ffedd5',
    },
  },
  {
    id: 'country-spain',
    name: 'Spain (La Roja)',
    city: 'Madrid',
    shortName: 'ESP',
    country: 'Spain',
    isCountry: true,
    flagEmoji: '🇪🇸',
    crestSymbol: '🐂',
    primaryColor: '#AA151B', // Deep Red
    secondaryColor: '#F1BF00', // Spanish Yellow
    accentColor: '#001489',
    textColor: '#FFFFFF',
    pattern: 'solid',
    stars: 5,
    stats: { speed: 92, power: 88, control: 97 },
    striker: {
      name: 'Alvaro Torres',
      number: 7,
      avatar: '⚡',
      hairColor: '#292524',
      skinTone: '#fde047',
    },
  },
  {
    id: 'country-italy',
    name: 'Italy (Gli Azzurri)',
    city: 'Rome',
    shortName: 'ITA',
    country: 'Italy',
    isCountry: true,
    flagEmoji: '🇮🇹',
    crestSymbol: '🛡️',
    primaryColor: '#0055A5', // Azzurro Blue
    secondaryColor: '#FFFFFF', // White
    accentColor: '#009246', // Green
    textColor: '#FFFFFF',
    pattern: 'solid',
    stars: 5,
    stats: { speed: 89, power: 90, control: 94 },
    striker: {
      name: 'Gianluigi Rossi',
      number: 9,
      avatar: '🔥',
      hairColor: '#1c1917',
      skinTone: '#fed7aa',
    },
  },
  {
    id: 'country-portugal',
    name: 'Portugal (Seleção)',
    city: 'Lisbon',
    shortName: 'POR',
    country: 'Portugal',
    isCountry: true,
    flagEmoji: '🇵🇹',
    crestSymbol: '⚔️',
    primaryColor: '#C61E2E', // Garnet Red
    secondaryColor: '#006600', // Green
    accentColor: '#FFD700', // Yellow
    textColor: '#FFFFFF',
    pattern: 'halves',
    stars: 5,
    stats: { speed: 94, power: 95, control: 93 },
    striker: {
      name: 'Cristiano Dantas',
      number: 7,
      avatar: '🌪️',
      hairColor: '#171717',
      skinTone: '#f59e0b',
    },
  },
  {
    id: 'country-nigeria',
    name: 'Nigeria (Super Eagles)',
    city: 'Abuja',
    shortName: 'NGA',
    country: 'Nigeria',
    isCountry: true,
    flagEmoji: '🇳🇬',
    crestSymbol: '🦅',
    primaryColor: '#008751', // Nigerian Green
    secondaryColor: '#FFFFFF', // White
    accentColor: '#10B981', // Emerald
    textColor: '#FFFFFF',
    pattern: 'stripes',
    stars: 4,
    stats: { speed: 97, power: 93, control: 89 },
    striker: {
      name: 'Victor Chukwu',
      number: 9,
      avatar: '⚡',
      hairColor: '#09090b',
      skinTone: '#451a03',
    },
  },
  {
    id: 'country-morocco',
    name: 'Morocco (Atlas Lions)',
    city: 'Rabat',
    shortName: 'MAR',
    country: 'Morocco',
    isCountry: true,
    flagEmoji: '🇲🇦',
    crestSymbol: '🦁',
    primaryColor: '#C1272D', // Red
    secondaryColor: '#006233', // Green Star
    accentColor: '#F59E0B',
    textColor: '#FFFFFF',
    pattern: 'solid',
    stars: 4,
    stats: { speed: 93, power: 88, control: 94 },
    striker: {
      name: 'Hakim Amrabat',
      number: 8,
      avatar: '🎯',
      hairColor: '#18181b',
      skinTone: '#d97706',
    },
  },
  {
    id: 'country-south-africa',
    name: 'South Africa (Bafana)',
    city: 'Johannesburg',
    shortName: 'RSA',
    country: 'South Africa',
    isCountry: true,
    flagEmoji: '🇿🇦',
    crestSymbol: '🌟',
    primaryColor: '#FFB612', // Gold
    secondaryColor: '#007749', // Green
    accentColor: '#001489', // Blue
    textColor: '#0B1F44',
    pattern: 'solid',
    stars: 4,
    stats: { speed: 92, power: 87, control: 91 },
    striker: {
      name: 'Sipho Khumalo',
      number: 11,
      avatar: '✨',
      hairColor: '#09090b',
      skinTone: '#713f12',
    },
  },
  {
    id: 'country-ghana',
    name: 'Ghana (Black Stars)',
    city: 'Accra',
    shortName: 'GHA',
    country: 'Ghana',
    isCountry: true,
    flagEmoji: '🇬🇭',
    crestSymbol: '★',
    primaryColor: '#FFFFFF', // White
    secondaryColor: '#EF3340', // Red
    accentColor: '#FFD100', // Yellow
    textColor: '#09090b',
    pattern: 'solid',
    stars: 4,
    stats: { speed: 94, power: 90, control: 90 },
    striker: {
      name: 'Kwadwo Mensah',
      number: 10,
      avatar: '💥',
      hairColor: '#18181b',
      skinTone: '#451a03',
    },
  },
  {
    id: 'country-egypt',
    name: 'Egypt (Pharaohs)',
    city: 'Cairo',
    shortName: 'EGY',
    country: 'Egypt',
    isCountry: true,
    flagEmoji: '🇪🇬',
    crestSymbol: '🦅',
    primaryColor: '#CE1126', // Red
    secondaryColor: '#FFFFFF', // White
    accentColor: '#000000', // Black
    textColor: '#FFFFFF',
    pattern: 'stripes',
    stars: 4,
    stats: { speed: 95, power: 89, control: 93 },
    striker: {
      name: 'Mo Hassan',
      number: 11,
      avatar: '👑',
      hairColor: '#27272a',
      skinTone: '#b45309',
    },
  },
  {
    id: 'country-usa',
    name: 'USA (Stars & Stripes)',
    city: 'Washington',
    shortName: 'USA',
    country: 'USA',
    isCountry: true,
    flagEmoji: '🇺🇸',
    crestSymbol: '⭐',
    primaryColor: '#FFFFFF', // White
    secondaryColor: '#0C2340', // Blue
    accentColor: '#BA0C2F', // Red
    textColor: '#0C2340',
    pattern: 'sash',
    stars: 4,
    stats: { speed: 91, power: 90, control: 89 },
    striker: {
      name: 'Christian Rey',
      number: 10,
      avatar: '🌪️',
      hairColor: '#713f12',
      skinTone: '#ffedd5',
    },
  },
  {
    id: 'country-japan',
    name: 'Japan (Samurai Blue)',
    city: 'Tokyo',
    shortName: 'JPN',
    country: 'Japan',
    isCountry: true,
    flagEmoji: '🇯🇵',
    crestSymbol: '⛩️',
    primaryColor: '#001D4A', // Samurai Blue
    secondaryColor: '#FFFFFF', // White
    accentColor: '#E60012', // Red Sun
    textColor: '#FFFFFF',
    pattern: 'solid',
    stars: 4,
    stats: { speed: 94, power: 86, control: 96 },
    striker: {
      name: 'Takumi Endo',
      number: 10,
      avatar: '🎯',
      hairColor: '#171717',
      skinTone: '#fef08a',
    },
  },
];

// Complete roster combining Fictional Clubs and Countries
export const SOCCER_TEAMS: SoccerTeam[] = [...FICTIONAL_CLUBS, ...COUNTRY_TEAMS];

export const DEFAULT_PLAYER_TEAM = FICTIONAL_CLUBS[0]; // FC Catalonia
export const DEFAULT_OPPONENT_TEAM = FICTIONAL_CLUBS[1]; // Royal Capital
