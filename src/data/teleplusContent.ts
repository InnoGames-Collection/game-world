/**
 * GoPlay Official Content Source of Truth
 * 
 * Sourced directly from the official GoPlay content specification document.
 * This canonical file supplies text and structured data across the entire application.
 */

export interface GameContentDetails {
  id: string;
  name: string;
  genre: string;
  competitionCycle: 'weekly' | 'monthly';
  overview: string;
  howToPlay: string[];
  skillFocus: string[];
  gameDuration?: string;
  gameDurationNotes?: string[];
  difficultyProgression?: { range: string; activeBalloons: string; speed: string; diameter: string }[];
  balloonColors?: { name: string; hex: string }[];
  visualDirection?: string;
  visualRule?: string;
  importantRules?: string[];
}

export const GOPLAY_GAMES_CONTENT: GameContentDetails[] = [
  // 1.1 CANDY BLAST
  {
    id: 'candy-blast',
    name: 'Candy Blast',
    genre: 'Match-and-Clear Puzzle',
    competitionCycle: 'weekly',
    overview:
      'Candy Blast is a fast-paced match-and-clear puzzle game where players identify matching candies, create combinations, build combos, and achieve the highest possible score through accuracy, timing, planning, and consistency.\n\nThe game becomes progressively more challenging throughout the session, requiring players to make increasingly difficult decisions and maintain strong performance.',
    howToPlay: [
      'Start the game.',
      'Identify matching candies on the game board.',
      'Move or swap candies to create valid matches.',
      'Create larger combinations whenever possible.',
      'Use special combinations strategically.',
      'Maintain combos and avoid unnecessary mistakes.',
      'As the game progresses, the challenges become more difficult.',
      'Continue playing with increasing accuracy and precision to achieve a higher score.',
      'Your highest valid score for the applicable day contributes to the leaderboard according to the competition rules.',
    ],
    skillFocus: [
      'Reaction speed',
      'Accuracy',
      'Planning',
      'Precision',
      'Combo management',
      'Decision-making',
      'Consistency',
    ],
  },

  // 1.2 COLOR RUSH
  {
    id: 'color-rush',
    name: 'Color Rush',
    genre: 'Fast-Reaction Color Match',
    competitionCycle: 'weekly',
    overview:
      'Color Rush is a fast-reaction game that challenges players to recognize and respond to colors quickly and accurately.\n\nThe game begins with a meaningful challenge and progressively increases in speed and difficulty, requiring concentration and rapid decision-making.',
    howToPlay: [
      'Start the game.',
      'Watch the active color carefully.',
      'Identify the correct color.',
      'Tap or select the corresponding gaming control.',
      'Respond as quickly and accurately as possible.',
      'Avoid incorrect selections.',
      'Continue through increasingly difficult color challenges.',
      'Maintain fast and accurate reactions to achieve a higher score.',
    ],
    skillFocus: [
      'Reaction speed',
      'Color recognition',
      'Accuracy',
      'Concentration',
      'Timing',
      'Decision-making',
      'Consistency',
    ],
  },

  // 1.3 WORLD LEGENDS
  {
    id: 'world-legends',
    name: 'World Legends',
    genre: 'Knowledge & Word Puzzle',
    competitionCycle: 'weekly',
    overview:
      'World Legends is a knowledge-based skill game that challenges players through progressively more difficult questions, words, or knowledge challenges.\n\nPlayers must combine knowledge, accuracy, decision-making, and response speed to achieve a high score.',
    howToPlay: [
      'Start the game.',
      'Read and understand the presented challenge.',
      'Select or provide the correct response.',
      'Respond accurately and as quickly as possible.',
      'Continue through increasingly difficult challenges.',
      'Avoid incorrect answers.',
      'Maintain consistent performance throughout the session.',
      'Achieve the highest possible score through knowledge, accuracy, and speed.',
    ],
    skillFocus: [
      'Knowledge',
      'Accuracy',
      'Reaction time',
      'Decision-making',
      'Concentration',
      'Consistency',
    ],
  },

  // 1.4 POP PIANO
  {
    id: 'pop-piano',
    name: 'Pop Piano',
    genre: 'Timing & Rhythm Reaction',
    competitionCycle: 'monthly',
    overview:
      'Pop Piano is a timing and reaction-based piano game where players interact with piano elements at the correct time.\n\nThe game requires increasingly precise timing and concentration as gameplay progresses.',
    howToPlay: [
      'Start the game.',
      'Watch the incoming piano elements carefully.',
      'Tap the correct piano element at the correct time.',
      'Maintain accurate timing.',
      'Avoid incorrect taps and missed elements.',
      'Maintain combos where possible.',
      'As the session progresses, timing and patterns become more demanding.',
      'Continue performing accurately to achieve a higher score.',
    ],
    skillFocus: [
      'Timing',
      'Reaction speed',
      'Precision',
      'Rhythm',
      'Concentration',
      'Consistency',
    ],
    visualRule:
      'The existing black-and-white piano design remains unchanged. The green rope/cable must not be part of the game. The existing black lower failure boundary is the failure area.',
  },

  // 1.5 HILL CLIMB
  {
    id: 'hill-rider',
    name: 'Hill Climb',
    genre: 'Skill-Based 3D Physics Driving',
    competitionCycle: 'monthly',
    overview:
      'Hill Climb is a skill-based driving game where players control a vehicle across challenging terrain while maintaining balance, control, timing, and precision.\n\nThe game progressively increases in difficulty and requires increasingly careful vehicle control.',
    howToPlay: [
      'Start the Hill Climb session.',
      'Control the vehicle carefully across the terrain.',
      'Balance acceleration and vehicle movement.',
      'Adapt to increasingly difficult hills and terrain.',
      'Avoid losing control.',
      'Maintain the best possible driving performance.',
      'Continue for the complete 2-minute gameplay session.',
      'Achieve the highest possible score through skilled driving and consistent control.',
    ],
    gameDuration: 'Exactly 2 minutes / 120 seconds.',
    gameDurationNotes: [
      'The timer begins when gameplay starts.',
      'When 120 seconds is reached, the gameplay session ends.',
      'If the game is paused: Vehicle movement freezes, Physics freeze, Timer freezes.',
      'The remaining gameplay time is preserved.',
      'Paused time does not count toward the 2-minute session.',
    ],
    skillFocus: [
      'Vehicle control',
      'Balance',
      'Timing',
      'Precision',
      'Reaction',
      'Terrain management',
      'Consistency',
    ],
    visualDirection:
      'The existing white background direction should remain. The game may receive surrounding presentation polish, but it should not be converted into a dark game.',
  },

  // 1.6 POP BALLOON
  {
    id: 'archery-strike', // mapped to pop balloon id in registry
    name: 'Pop Balloon',
    genre: 'Fast-Paced Reaction Balloon Pop',
    competitionCycle: 'monthly',
    overview:
      'Pop Balloon is a fast-paced reaction game where players must accurately pop moving colored balloons while avoiding incorrect taps and missed balloons.\n\nThe game becomes progressively faster and more demanding, requiring excellent reaction speed, precision, target tracking, and concentration.',
    howToPlay: [
      'Start the game.',
      'Complete the 3-2-1-GO countdown.',
      'Multiple colored balloons appear immediately.',
      'Tap the actual colored balloons accurately.',
      'Balloons progressively become faster and more challenging.',
      'Avoid tapping empty areas.',
      'Avoid tapping anything that is not an actual colored balloon.',
      'Do not allow a balloon to reach the bottom unpopped.',
      'Maintain accurate reactions and combos.',
      'Continue playing throughout the 2-minute session.',
    ],
    difficultyProgression: [
      { range: '0–10 seconds', activeBalloons: '3–5 active balloons', speed: '300–360 px/s', diameter: '55–65 px diameter' },
      { range: '10–30 seconds', activeBalloons: '4–5 active balloons', speed: '360–410 px/s', diameter: '50–60 px diameter' },
      { range: '30–60 seconds', activeBalloons: '4–6 active balloons', speed: '410–460 px/s', diameter: '46–56 px diameter' },
      { range: '60–90 seconds', activeBalloons: '5–6 active balloons', speed: '460–510 px/s', diameter: '44–52 px diameter' },
      { range: '90–110 seconds', activeBalloons: '5–7 active balloons', speed: '500–550 px/s', diameter: '42–50 px diameter' },
      { range: '110–120 seconds', activeBalloons: '5–7 active balloons', speed: '520–560 px/s', diameter: '40–48 px diameter' },
    ],
    balloonColors: [
      { name: 'Red', hex: '#FF3B30' },
      { name: 'Blue', hex: '#007AFF' },
      { name: 'Green', hex: '#34C759' },
      { name: 'Yellow', hex: '#FFD60A' },
      { name: 'Purple', hex: '#AF52DE' },
      { name: 'Orange', hex: '#FF9500' },
      { name: 'Pink', hex: '#FF2D55' },
    ],
    skillFocus: [
      'Reaction speed',
      'Accuracy',
      'Precision',
      'Target tracking',
      'Timing',
      'Concentration',
      'Consistency',
    ],
  },

  // 1.7 DAMA (3D Draughts / Checkers)
  {
    id: 'dama',
    name: 'Dama',
    genre: 'Championship 3D Draughts / Checkers',
    competitionCycle: 'monthly',
    overview:
      'Dama is a premium single-player 3D draughts game against an advanced tactical computer AI.\n\nFeaturing an authentic elevated perspective, rich wooden textures, cylindrical pieces with beveled edges, mandatory captures, multi-jumps, and king crowning across progressive difficulty tiers.',
    howToPlay: [
      'Select your white pieces to reveal legal diagonal moves and jump opportunities.',
      'Tap any highlighted dark destination square to move or capture.',
      'Jumps and multi-captures are strictly mandatory whenever available.',
      'Reach the opposite back rank to crown your piece into a powerful 4-way King.',
      'Capture all computer pieces or restrict the opponent from making legal moves to win.',
    ],
    skillFocus: [
      'Strategy',
      'Tactics',
      'Forward planning',
      'Position evaluation',
      'Board control',
      'Trap detection',
      'Endgame mastery',
    ],
    visualDirection:
      'Elevated 3D perspective on a rich mahogany and dark walnut table, beveled board edges, realistic lighting, and tactile wooden piece interactions.',
  },

  // 1.8 SOCCER PING PONG (3D Sports Arcade)
  {
    id: 'soccer-ping-pong',
    name: 'Soccer Ping Pong',
    genre: '3D Sports Arcade & Teqball',
    competitionCycle: 'monthly',
    overview:
      'Soccer Ping Pong is a fast-paced 3D football table tennis game combining rapid ball control, sweet-spot power strikes, and sharp spin volleys across 20 progressive difficulty stages.\n\nFeaturing 6 authentic stadium tiers ranging from daylight training grounds to night floodlight arenas and the ultimate World Championship Stadium.',
    howToPlay: [
      'Slide your striker paddle left and right across the baseline to intercept incoming shots.',
      'Time your returns precisely as the ball enters the glowing Sweet-Spot zone for high-velocity power shots.',
      'Target bullseye rings, bounce off spring bumpers, and maneuver around moving defender obstacles.',
      'Maintain continuous rally streaks to multiply your score and earn 3 gold stars.',
      'Keep your 3 soccer balls in play to complete each stage and unlock subsequent championship levels.',
    ],
    skillFocus: [
      'Reflex speed',
      'Timing precision',
      'Sweet-spot accuracy',
      'Trajectory prediction',
      'Combo maintenance',
      'Spin control',
      'Hand-eye coordination',
    ],
    visualDirection:
      'Realistic 3D football, manicured turf lawn stripes, center net, dynamic floodlight beams, stadium grandstands, and pyrotechnic victory celebrations.',
  },

  // 1.9 SORTING BALLS (3D Color-Sorting Puzzle)
  {
    id: 'sorting-balls',
    name: 'Sorting Balls',
    genre: '3D Color-Sorting Puzzle',
    competitionCycle: 'weekly',
    overview:
      'Sorting Balls is a relaxing and mentally engaging 3D color sorting puzzle game featuring 40 progressive stages.\n\nSort vibrant glossy 3D spheres between transparent glass test cylinders until every tube contains exclusively matching colors. Features realistic glass reflections, smooth trajectory arcs, and strict progressive locking.',
    howToPlay: [
      'Tap any tube to select its top ball, which lifts and hovers above the tube opening.',
      'Tap an available destination tube to transfer the floating ball.',
      'A ball can only be placed into an empty tube or onto a matching ball color.',
      'Sort all 4 balls of each color into their dedicated tube to solve the level.',
      'Use the Undo button to reverse your last move, or tap +1 to add an extra empty tube.',
    ],
    skillFocus: [
      'Spatial planning',
      'Color perception',
      'Step-ahead prediction',
      'Problem solving',
      'Pattern recognition',
      'Logical deduction',
    ],
    visualDirection:
      'Deep navy/charcoal arena (#171B26), white top application bar, warm orange tactile controls, transparent 3D glass sorting tubes with silver rims, and glossy high-saturation spherical balls.',
  },

  // EMOJI SORTING BALL (3D Emoji Sorting Tournament Puzzle)
  {
    id: 'emoji-sorting-ball',
    name: 'Emoji Sorting Ball',
    genre: '3D Emoji Sorting Tournament Puzzle',
    competitionCycle: 'weekly',
    overview:
      'Emoji Sorting Ball is a tournament 3D puzzle challenge featuring 40 progressive stages.\n\nSort stylized 3D vinyl emoji spheres between color-coded crystal tubes until every cylinder contains exclusively identical emoji types. Features multi-ball sequential transfers, par moves scoring, and tournament leaderboard tracking.',
    howToPlay: [
      'Tap any tube to select and lift its top emoji sphere (or contiguous matching group).',
      'Tap an available destination tube with matching emoji or empty space to transfer.',
      'Contiguous matching emojis transfer together in an efficient sequential wave.',
      'Solve all tubes with 4 matching emojis to complete the level and claim tournament bonuses.',
      'Use Undo, Hints, or Add Extra Buffer Tube when facing complex layouts.',
    ],
    skillFocus: [
      'Visual discrimination',
      'Emoji recognition',
      'Move sequence planning',
      'Combinatorial optimization',
      'Buffer tube management',
    ],
    visualDirection:
      'Midnight violet arena (#060411), 8-tube vibrant mandatory palette (Coral, Aqua, Royal Violet, Golden Amber, Emerald, Rose Pink, Electric Blue, Lime), stylized 3D vinyl emoji spheres, and tactile tournament controls.',
  },
];

// =========================================================================
// 2. FAQ CONTENT (Section 12 in Document)
// =========================================================================
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const GOPLAY_FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What is GoPlay?',
    answer:
      'GoPlay is a mobile gaming entertainment service providing multiple skill-based games, competitions, leaderboards, coins, and prize opportunities.',
  },
  {
    id: 'faq-2',
    question: 'What games are available?',
    answer:
      'GoPlay currently offers:\n\nWeekly:\n• Candy Blast\n• Color Rush\n• World Legends\n\nMonthly:\n• Pop Piano\n• Hill Climb\n• Pop Balloon',
  },
  {
    id: 'faq-3',
    question: 'How do I learn how to play?',
    answer:
      'Each game has a dedicated Overview and How to Play section explaining its objective, gameplay, controls, and important rules.',
  },
  {
    id: 'faq-4',
    question: 'Are GoPlay games skill-based?',
    answer:
      'Yes. Games are designed around skills such as reaction speed, timing, accuracy, precision, decision-making, knowledge, and consistency.',
  },
  {
    id: 'faq-5',
    question: 'Are the games easy at the beginning?',
    answer:
      'No. Games are designed to provide a meaningful challenge from the beginning and progressively increase in difficulty.',
  },
  {
    id: 'faq-6',
    question: 'How much does GoPlay cost?',
    answer:
      'Daily: 5 ETB/day\nWeekly: 15 ETB/week\nMonthly: 35 ETB/month',
  },
  {
    id: 'faq-7',
    question: 'How do I subscribe?',
    answer:
      'Send:\n1 to 977 for Daily\n2 to 977 for Weekly\n3 to 977 for Monthly\n\nUSSD subscription will also be available.',
  },
  {
    id: 'faq-8',
    question: 'How do I unsubscribe?',
    answer:
      'Send:\nSTOP 1 to 977 for Daily\nSTOP 2 to 977 for Weekly\nSTOP 3 to 977 for Monthly',
  },
  {
    id: 'faq-9',
    question: 'Do I receive free coins?',
    answer:
      'Yes. First-time registration provides 25 free coins once per user.',
  },
  {
    id: 'faq-10',
    question: 'How can I buy more coins?',
    answer:
      'Available packages are:\n• 5 coins — 3 ETB\n• 10 coins — 5 ETB\n• 25 coins — 10 ETB',
  },
  {
    id: 'faq-11',
    question: 'Can games give additional coins?',
    answer:
      'Some games may provide additional coins for specific achievements according to their individual rules.',
  },
  {
    id: 'faq-12',
    question: 'How does the leaderboard work?',
    answer:
      'For each day, only your highest valid score among the eligible games you play counts toward that day.\n\nYour scores from multiple games are not added together.',
  },
  {
    id: 'faq-13',
    question: 'What happens if I play several times in one day?',
    answer:
      'Only your highest valid score for that day counts.',
  },
  {
    id: 'faq-14',
    question: "What happens if I don't play one day?",
    answer:
      "That day's score is 0 when calculating the weekly or monthly leaderboard average.",
  },
  {
    id: 'faq-15',
    question: 'How is the weekly score calculated?',
    answer:
      'It is the average of your seven daily best scores.',
  },
  {
    id: 'faq-16',
    question: 'How is the monthly score calculated?',
    answer:
      'It is the average of your daily best scores for all calendar days in the applicable month.',
  },
  {
    id: 'faq-17',
    question: 'What is the maximum score?',
    answer:
      'The internal scoring ceiling is 400. It is not displayed to users as /400 or MAX 400.',
  },
  {
    id: 'faq-18',
    question: 'Is 400 easy to achieve?',
    answer:
      'No. A score near 400 requires extraordinarily strong and sustained performance.',
  },
  {
    id: 'faq-19',
    question: 'What are the prizes?',
    answer:
      'The Top 10 prizes are:\n1. 50,000 ETB\n2. 40,000 ETB\n3. 35,000 ETB\n4. 30,000 ETB\n5. 25,000 ETB\n6. 20,000 ETB\n7. 15,000 ETB\n8. 10,000 ETB\n9. 5,000 ETB\n10. 3,000 ETB\n\nTotal Top-10 prize value: 233,000 ETB per applicable competition period.',
  },
  {
    id: 'faq-20',
    question: 'Are there instant prizes?',
    answer:
      'Yes. GoPlay may provide instant prizes separately from leaderboard prizes according to applicable game or promotion rules.',
  },
  {
    id: 'faq-21',
    question: 'How are winners verified?',
    answer:
      'Prize winners may be required to complete verification before prize delivery. Verification may include participation, mobile number, score, ranking, identity, and other information reasonably required for validation.',
  },
  {
    id: 'faq-22',
    question: 'What if I believe my score is incorrect?',
    answer:
      'Contact GoPlay support and provide the relevant account/mobile number, game, approximate gameplay time, and details of the issue.',
  },
  {
    id: 'faq-23',
    question: 'What if the game is not working?',
    answer:
      'Check your internet connection and reload/restart the service. If the problem continues, contact support.',
  },
  {
    id: 'faq-24',
    question: 'What if I was charged but cannot access the service?',
    answer:
      'Contact GoPlay support with your mobile number, subscription package, approximate time of charging, and relevant transaction information.',
  },
  {
    id: 'faq-25',
    question: 'Does GoPlay require mobile data?',
    answer:
      'Gameplay may require an active internet/mobile data connection depending on the service implementation.',
  },
  {
    id: 'faq-26',
    question: 'Can GoPlay games or rules change?',
    answer:
      'GoPlay may update games, gameplay, features, competitions, scoring, prizes, or other service elements when necessary, subject to applicable terms and notices.',
  },
  {
    id: 'faq-27',
    question: 'Can I stop my subscription?',
    answer:
      'Yes. Use the applicable STOP command listed on the Subscription/Pricing page.',
  },
];

// =========================================================================
// 3. HELP & SUPPORT CONTENT (Section 13 in Document)
// =========================================================================
export interface SupportTopic {
  id: string;
  title: string;
  content: string[];
  steps?: string[];
  note?: string;
}

export const GOPLAY_SUPPORT_TOPICS: SupportTopic[] = [
  {
    id: 'sub-support',
    title: 'Subscription Support',
    content: [
      'For subscription-related problems, provide:',
      '• Mobile number',
      '• Selected package',
      '• Approximate subscription time',
      '• Any confirmation message received',
      '• Description of the problem',
    ],
  },
  {
    id: 'unsub-support',
    title: 'Unsubscription Support',
    content: [
      'If the service does not stop after using the applicable STOP command, provide:',
      '• Mobile number',
      '• Subscription package',
      '• STOP command used',
      '• Approximate time sent',
    ],
  },
  {
    id: 'charging-support',
    title: 'Charging Support',
    content: [
      'For charging-related issues, provide:',
      '• Mobile number',
      '• Package',
      '• Approximate charging time',
      '• Relevant transaction/confirmation information',
      '• Description of the issue',
    ],
  },
  {
    id: 'game-access-support',
    title: 'Game Access & Performance',
    content: ['If a game does not load or perform correctly, follow these troubleshooting steps:'],
    steps: [
      'Check your internet connection.',
      'Reload the game.',
      'Restart the session.',
      'Try again.',
      'Contact support if the issue continues.',
    ],
  },
  {
    id: 'score-issues',
    title: 'Score Issues',
    content: [
      'When reporting a score issue, provide:',
      '• Mobile number',
      '• Game name',
      '• Approximate gameplay time',
      '• Description of what happened',
      '• Any available screenshot or evidence',
    ],
  },
  {
    id: 'leaderboard-issues',
    title: 'Leaderboard Issues',
    content: [
      'For leaderboard questions, provide:',
      '• Mobile number',
      '• Competition period',
      '• Game played',
      '• Approximate score',
      '• Date of gameplay',
    ],
  },
  {
    id: 'prize-support',
    title: 'Prize Support',
    content: [
      'Prize winners may need to complete verification before receiving a prize.',
      'Support may request information necessary to verify:',
      '• Participation',
      '• Mobile number',
      '• Score',
      '• Ranking',
      '• Identity',
      '• Other relevant eligibility information',
    ],
  },
  {
    id: 'technical-problems',
    title: 'Technical Problems',
    content: [
      'Technical issues may include:',
      '• Game not loading',
      '• Game freezing',
      '• Gameplay interruption',
      '• Score not displaying correctly',
      '• Leaderboard not updating',
      '• Subscription access problems',
      '• Other service errors',
      'Provide as much detail as possible when contacting support.',
    ],
  },
  {
    id: 'account-security',
    title: 'Account & Security',
    content: [
      'Users should protect their mobile account and should not share sensitive authentication information with other people.',
      'Do not attempt to manipulate game scores, access other users’ accounts, or interfere with the service.',
    ],
    note: 'Important: A GoPlay support phone number/contact address should only be added when the official support contact is provided. Do not invent one.',
  },
];

// =========================================================================
// 4. SUBSCRIPTION CONTENT (Sections 9 & 10 in Document)
// =========================================================================
export interface SubscriptionPackage {
  package: string;
  price: string;
  subscribeCmd: string;
  unsubscribeCmd: string;
  smsBody: string;
  unsubBody: string;
  recipient: string;
}

export const GOPLAY_SUBSCRIPTION_PACKAGES: SubscriptionPackage[] = [
  {
    package: 'Daily',
    price: '5 ETB/day',
    subscribeCmd: 'Send 1 to 977',
    unsubscribeCmd: 'Send STOP 1 to 977',
    smsBody: '1',
    unsubBody: 'STOP 1',
    recipient: '977',
  },
  {
    package: 'Weekly',
    price: '15 ETB/week',
    subscribeCmd: 'Send 2 to 977',
    unsubscribeCmd: 'Send STOP 2 to 977',
    smsBody: '2',
    unsubBody: 'STOP 2',
    recipient: '977',
  },
  {
    package: 'Monthly',
    price: '35 ETB/month',
    subscribeCmd: 'Send 3 to 977',
    unsubscribeCmd: 'Send STOP 3 to 977',
    smsBody: '3',
    unsubBody: 'STOP 3',
    recipient: '977',
  },
];

export const GOPLAY_SUBSCRIPTION_INFO = {
  ussdInfo: 'USSD subscription will also be available through the applicable GoPlay service channel.',
  afterSubscription:
    'After successful subscription, the user can access the applicable GoPlay service and games according to the subscribed package and service rules.\n\nSubscription charges and renewal operate according to the selected package.',
  renewal:
    'Subscription packages may renew according to the applicable package terms. Users should ensure that sufficient balance is available where required for renewal.',
  unsubscription:
    'Users can stop their service using SMS at any time without penalty. Users should receive appropriate service confirmation according to the applicable service process.',
};

// =========================================================================
// 5. PRICING CONTENT (Section 11 in Document)
// =========================================================================
export const GOPLAY_COIN_PRICING = [
  { coins: 5, priceETB: 3 },
  { coins: 10, priceETB: 5 },
  { coins: 25, priceETB: 10 },
];

export const GOPLAY_WELCOME_BONUS = {
  coins: 25,
  description: '25 free coins for first-time registration, once per user.',
};

export const GOPLAY_TOP10_PRIZES = [
  { rank: '1st', prize: '50,000 ETB' },
  { rank: '2nd', prize: '40,000 ETB' },
  { rank: '3rd', prize: '35,000 ETB' },
  { rank: '4th', prize: '30,000 ETB' },
  { rank: '5th', prize: '25,000 ETB' },
  { rank: '6th', prize: '20,000 ETB' },
  { rank: '7th', prize: '15,000 ETB' },
  { rank: '8th', prize: '10,000 ETB' },
  { rank: '9th', prize: '5,000 ETB' },
  { rank: '10th', prize: '3,000 ETB' },
];

export const GOPLAY_TOTAL_PRIZE_VALUE = '233,000 ETB per applicable competition period.';

// =========================================================================
// 6. TERMS & CONDITIONS CONTENT (Section 14 in Document)
// =========================================================================
export interface TermSection {
  number: string;
  title: string;
  paragraphs: string[];
  bulletPoints?: string[];
  table?: { col1: string; col2: string }[];
}

export const GOPLAY_TERMS_SECTIONS: TermSection[] = [
  {
    number: '14.1',
    title: 'Introduction',
    paragraphs: [
      'These Terms & Conditions govern the use of the GoPlay gaming service.',
      'By accessing or using GoPlay, the user agrees to comply with these Terms & Conditions and the applicable service rules.',
    ],
  },
  {
    number: '14.2',
    title: 'Service',
    paragraphs: [
      'GoPlay provides mobile gaming entertainment, skill-based games, competitions, leaderboards, coins, and prize opportunities.',
      'The available games and features may be updated from time to time.',
    ],
  },
  {
    number: '14.3',
    title: 'Eligibility',
    paragraphs: [
      'Users must meet the eligibility requirements applicable to the GoPlay service.',
      'Additional eligibility conditions may apply to particular games, competitions, promotions, or prizes.',
    ],
  },
  {
    number: '14.4',
    title: 'Registration and Account',
    paragraphs: [
      'Users may be required to register or provide the information necessary to access the service.',
      'Users are responsible for ensuring that information provided during registration is accurate.',
    ],
  },
  {
    number: '14.5',
    title: 'Subscription',
    paragraphs: [
      'GoPlay provides:',
    ],
    bulletPoints: [
      'Daily — 5 ETB/day',
      'Weekly — 15 ETB/week',
      'Monthly — 35 ETB/month',
      'Subscription is initiated through the applicable subscription process.',
      'SMS subscription: 1 to 977 (Daily), 2 to 977 (Weekly), 3 to 977 (Monthly).',
      'USSD subscription may also be available.',
    ],
  },
  {
    number: '14.6',
    title: 'Renewal',
    paragraphs: [
      'Subscription packages may renew according to the applicable package terms.',
      'Users should ensure that sufficient balance is available where required for renewal.',
    ],
  },
  {
    number: '14.7',
    title: 'Unsubscription',
    paragraphs: [
      'Users may stop their subscription using:',
    ],
    bulletPoints: [
      'STOP 1 to 977 — Daily',
      'STOP 2 to 977 — Weekly',
      'STOP 3 to 977 — Monthly',
    ],
  },
  {
    number: '14.8',
    title: 'Games',
    paragraphs: [
      'GoPlay currently provides:',
    ],
    bulletPoints: [
      'Candy Blast',
      'Color Rush',
      'World Legends',
      'Pop Piano',
      'Hill Climb',
      'Pop Balloon',
      'Each game has its own gameplay mechanics and rules.',
    ],
  },
  {
    number: '14.9',
    title: 'Skill-Based Gameplay',
    paragraphs: [
      'GoPlay games are designed around player skill.',
      'Performance may depend on factors such as:',
    ],
    bulletPoints: [
      'Reaction',
      'Timing',
      'Accuracy',
      'Precision',
      'Knowledge',
      'Decision-making',
      'Combos',
      'Streaks',
      'Consistency',
      'Difficulty',
    ],
  },
  {
    number: '14.10',
    title: 'Game Duration',
    paragraphs: [
      'Applicable games may have specific session durations.',
      'Hill Climb has a fixed gameplay duration of exactly 120 seconds / 2 minutes.',
      'Other game durations are determined by the applicable game configuration.',
    ],
  },
  {
    number: '14.11',
    title: 'Scoring',
    paragraphs: [
      'Each game uses an internal score ceiling of 400.',
      'The internal ceiling does not mean that 400 is normally achievable.',
      'Scores may be calculated using multiple game-specific performance factors.',
      'The internal score ceiling must not be interpreted as a guaranteed achievable score.',
    ],
  },
  {
    number: '14.12',
    title: 'Leaderboard',
    paragraphs: [
      'For each calendar day, only the user’s highest valid score among the applicable games contributes to that day’s leaderboard score.',
      'Scores from multiple games are not added together.',
      'Multiple attempts on the same day do not create multiple leaderboard entries; only the highest valid daily score counts.',
    ],
  },
  {
    number: '14.13',
    title: 'Weekly Competition',
    paragraphs: [
      'The weekly leaderboard uses the average of the user’s seven daily best scores.',
      'Days without gameplay contribute 0.',
      'Applicable weekly games are: Candy Blast, Color Rush, World Legends.',
    ],
  },
  {
    number: '14.14',
    title: 'Monthly Competition',
    paragraphs: [
      'The monthly leaderboard uses the average of the user’s daily best scores across the applicable calendar month.',
      'Days without gameplay contribute 0.',
      'Applicable monthly games are: Pop Piano, Hill Climb, Pop Balloon.',
    ],
  },
  {
    number: '14.15',
    title: 'Coins',
    paragraphs: [
      'First-time registration provides: 25 free coins once per user.',
      'Additional coin packages: 5 coins — 3 ETB, 10 coins — 5 ETB, 25 coins — 10 ETB.',
      'Some games may award additional coins for specific achievements.',
      'Coins are separate from game scores and prize money.',
    ],
  },
  {
    number: '14.16',
    title: 'Prizes',
    paragraphs: [
      'The Top-10 prize structure is:',
    ],
    table: [
      { col1: 'Rank 1', col2: '50,000 ETB' },
      { col1: 'Rank 2', col2: '40,000 ETB' },
      { col1: 'Rank 3', col2: '35,000 ETB' },
      { col1: 'Rank 4', col2: '30,000 ETB' },
      { col1: 'Rank 5', col2: '25,000 ETB' },
      { col1: 'Rank 6', col2: '20,000 ETB' },
      { col1: 'Rank 7', col2: '15,000 ETB' },
      { col1: 'Rank 8', col2: '10,000 ETB' },
      { col1: 'Rank 9', col2: '5,000 ETB' },
      { col1: 'Rank 10', col2: '3,000 ETB' },
    ],
  },
  {
    number: '14.17',
    title: 'Instant Prizes',
    paragraphs: [
      'GoPlay may provide instant prizes separately from leaderboard prizes.',
      'Instant prizes are governed by the applicable game or promotional rules.',
    ],
  },
  {
    number: '14.18',
    title: 'Prize Verification',
    paragraphs: [
      'Before prize delivery, GoPlay may verify: User participation, Mobile number, Score, Ranking, Identity, Eligibility, and Compliance with applicable game rules.',
      'A prize may be withheld until required verification is successfully completed.',
    ],
  },
  {
    number: '14.19',
    title: 'Winner Selection and Ties',
    paragraphs: [
      'Winners are determined according to the applicable leaderboard and competition rules.',
      'Where multiple users have identical scores or rankings, applicable tie-breaking or verification procedures may be used.',
    ],
  },
  {
    number: '14.20',
    title: 'Fair Play',
    paragraphs: [
      'Users must not:',
    ],
    bulletPoints: [
      'Use bots',
      'Automate gameplay',
      'Manipulate scores',
      'Exploit software errors',
      'Use unauthorized software',
      'Modify the game',
      'Interfere with the service',
      'Attempt to obtain an unfair advantage',
      'Access or manipulate another user’s account',
      'Circumvent technical controls',
    ],
  },
  {
    number: '14.21',
    title: 'Disqualification',
    paragraphs: [
      'GoPlay may invalidate scores, remove leaderboard entries, withhold prizes, suspend participation, or take other appropriate action where there is evidence of rule violations or unfair gameplay.',
    ],
  },
  {
    number: '14.22',
    title: 'Service Availability',
    paragraphs: [
      'GoPlay aims to provide continuous service but availability may be affected by maintenance, technical issues, network conditions, system upgrades, third-party dependencies, or other circumstances outside reasonable control.',
    ],
  },
  {
    number: '14.23',
    title: 'Updates',
    paragraphs: [
      'GoPlay may modify games, game mechanics, scoring, subscription packages, features, competitions, prize structures, coin packages, or service functionality.',
      'Applicable updates may be communicated through appropriate service channels.',
    ],
  },
  {
    number: '14.24',
    title: 'Data and Privacy',
    paragraphs: [
      'User information may be processed as necessary to provide the service, manage subscriptions, operate games, maintain leaderboards, prevent abuse, provide support, and perform prize verification.',
      'Personal information should be handled in accordance with applicable privacy requirements and GoPlay privacy practices.',
    ],
  },
  {
    number: '14.25',
    title: 'Charges and Mobile Data',
    paragraphs: [
      'Subscription, coin, and other applicable charges are separate from mobile data charges unless otherwise specified.',
      'Users are responsible for applicable data/network costs associated with accessing the service.',
    ],
  },
  {
    number: '14.26',
    title: 'Intellectual Property',
    paragraphs: [
      'GoPlay service content, software, graphics, game designs, interfaces, branding, and other protected materials remain the property of their respective rights holders.',
      'Users may not reproduce, modify, distribute, reverse engineer, or commercially exploit protected service content without authorization.',
    ],
  },
  {
    number: '14.27',
    title: 'Liability',
    paragraphs: [
      'GoPlay is not responsible for circumstances outside its reasonable control, including certain network, connectivity, device, technical, or third-party service issues.',
      'Nothing in these Terms should exclude rights or obligations that cannot legally be excluded.',
    ],
  },
  {
    number: '14.28',
    title: 'Changes to Terms',
    paragraphs: [
      'These Terms & Conditions may be updated when necessary.',
      'Users should review the latest version of the Terms before continuing to use the service.',
    ],
  },
  {
    number: '14.29',
    title: 'Suspension or Termination',
    paragraphs: [
      'GoPlay may suspend or terminate access where necessary, including for terms violations, fair-play violations, abuse, security concerns, technical reasons, or service discontinuation.',
    ],
  },
  {
    number: '14.30',
    title: 'Complaints and Disputes',
    paragraphs: [
      'Users should first contact the applicable GoPlay support channel to resolve service-related complaints.',
      'Applicable laws and dispute-resolution requirements will apply.',
    ],
  },
  {
    number: '14.31',
    title: 'Governing Law',
    paragraphs: [
      'The service and these Terms are subject to applicable Ethiopian laws and regulations.',
      'Specific legal provisions should be finalized through the appropriate legal/compliance review before publication.',
    ],
  },
  {
    number: '14.32',
    title: 'Acceptance',
    paragraphs: [
      'By registering for, subscribing to, or using GoPlay, the user confirms that they have read and accepted the applicable Terms & Conditions.',
    ],
  },
];

// =========================================================================
// 7. PRIVACY POLICY CONTENT (Section 14.24 & GoPlay Privacy Practices)
// =========================================================================
export const GOPLAY_PRIVACY_POLICY = {
  title: 'GoPlay Privacy Policy',
  summary:
    'GoPlay is committed to protecting user privacy and handling personal information responsibly, transparently, and securely in accordance with applicable laws and telecommunications standards.',
  sections: [
    {
      title: 'Data Collection & Processing (Section 14.24)',
      paragraphs: [
        'User information is processed strictly as necessary to provide the gaming service, manage subscriptions, operate skill-based games, calculate leaderboards, prevent unfair gameplay, provide customer support, and complete required prize verifications.',
      ],
      bulletPoints: [
        'Mobile phone number (MSISDN) for subscription management and authentication.',
        'Game session scores, accuracy metrics, and tournament leaderboard timestamps.',
        'Coin balances, transaction records, and prize delivery verifications.',
      ],
    },
    {
      title: 'Masked Identity & Public Display Protection',
      paragraphs: [
        'To protect subscriber identity, phone numbers are masked across all public leaderboard views (e.g., 091*****890). Your full mobile number is never publicly displayed.',
      ],
    },
    {
      title: 'Zero Unnecessary Device Permissions',
      paragraphs: [
        'GoPlay operates within your browser or mobile web container with zero invasive device permissions. The service does not request access to device contacts, microphone, camera, or external file storage.',
      ],
    },
    {
      title: 'Data Security & Fair Play Integrity',
      paragraphs: [
        'All score submissions, coin purchases, and subscription commands are transmitted over secure TLS encrypted connections. Access controls and audit logging prevent unauthorized access and data manipulation.',
      ],
    },
    {
      title: 'Regulatory Compliance & Legal Review Status',
      paragraphs: [
        'This Privacy Policy reflects the current data processing practices of the GoPlay gaming service. Official additional regulatory compliance provisions will be published upon conclusion of scheduled regulatory reviews.',
      ],
    },
  ],
};

// Backward-compatible exports
export const TELEPLUS_GAMES_CONTENT = GOPLAY_GAMES_CONTENT;
export const TELEPLUS_FAQ_ITEMS = GOPLAY_FAQ_ITEMS;
export const TELEPLUS_SUPPORT_TOPICS = GOPLAY_SUPPORT_TOPICS;
export const TELEPLUS_SUBSCRIPTION_PACKAGES = GOPLAY_SUBSCRIPTION_PACKAGES;
export const TELEPLUS_COIN_PRICING = GOPLAY_COIN_PRICING;
export const TELEPLUS_WELCOME_BONUS = GOPLAY_WELCOME_BONUS;
export const TELEPLUS_TOP10_PRIZES = GOPLAY_TOP10_PRIZES;
export const TELEPLUS_TERMS_SECTIONS = GOPLAY_TERMS_SECTIONS;
export const TELEPLUS_PRIVACY_POLICY = GOPLAY_PRIVACY_POLICY;

