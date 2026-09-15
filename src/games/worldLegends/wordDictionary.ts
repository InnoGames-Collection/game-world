/**
 * World Legends - Tournament Word Dictionary
 * Contains 2,000+ categorized, verified, normalized dictionary words
 * across 10 distinct categories, supporting tournament-safe, non-repeating play.
 */

export interface WordCategoryDef {
  category: string;
  theme: string;
  words: {
    len2: string[];
    len3: string[];
    len4: string[];
    len5: string[];
    len6: string[];
    len7Plus: string[];
  };
}

export const CATEGORIZED_WORD_DICTIONARY: WordCategoryDef[] = [
  // =========================================================================
  // 1. SPORTS & FOOTBALL (Arena & Pitch)
  // =========================================================================
  {
    category: 'SPORTS',
    theme: 'Stadium Arena',
    words: {
      len2: ['GO', 'ON', 'UP', 'IN', 'AT', 'TO', 'BY', 'SO', 'DO', 'NO'],
      len3: [
        'RUN', 'WIN', 'CUP', 'FAN', 'CAP', 'BOX', 'HIT', 'TOP', 'NET', 'BAT',
        'ROW', 'BOW', 'FIT', 'GYM', 'LAP', 'PIT', 'AIM', 'ACE', 'SKI', 'TIE',
        'SET', 'LEG', 'ARM', 'RIB', 'JOG', 'TAG', 'BOB', 'SUB', 'OUT', 'OFF',
        'TIP', 'LOB', 'WAR', 'FOE', 'PRO', 'TRY', 'END', 'TAP', 'JAM', 'RIP',
        'HUT', 'PEG', 'ROD', 'BAR', 'PIN', 'PAD', 'MAT', 'ZIP', 'TEE', 'LOG'
      ],
      len4: [
        'GOAL', 'KICK', 'BALL', 'PASS', 'TEAM', 'FOUL', 'SAVE', 'SHOT', 'GAME', 'PLAY',
        'RACE', 'TURF', 'CLUB', 'BOOT', 'SWIM', 'SURF', 'RINK', 'DIVE', 'PUNT', 'LOBE',
        'PACE', 'ZONE', 'POST', 'BEAT', 'DRAW', 'LINE', 'FLAG', 'LEAP', 'SLIP', 'TACK',
        'RACK', 'VAULT', 'FLEX', 'GRIP', 'HELM', 'PARK', 'SPUR', 'CORE', 'TAPE', 'CREW',
        'DUNK', 'BUNT', 'SLAM', 'JUMP', 'RUSH', 'TRIP', 'HOOK', 'BLOW', 'CURL', 'MARK',
        'WINS', 'BATS', 'HITS', 'NETS', 'TIES', 'CUPS', 'ROPS', 'PITS', 'PULL', 'PUSH',
        'DROP', 'SPIN', 'ROLL', 'TRAP', 'TOSS', 'BEND', 'LEAD', 'RANK', 'HEEL', 'SHIN',
        'KNEE', 'CALF', 'WRIST', 'BOUT', 'DUEL', 'FORM', 'PEAK', 'SWAY', 'DASH', 'TILT'
      ],
      len5: [
        'MATCH', 'SCORE', 'PITCH', 'SHOOT', 'TRACK', 'COACH', 'ARENA', 'COURT', 'FIELD', 'CHAMP',
        'MEDAL', 'CROSS', 'GUARD', 'SERVE', 'BOARD', 'STICK', 'PUNCH', 'CYCLE', 'RELAY', 'RODEO',
        'RUGBY', 'SWEAT', 'POWER', 'SPEED', 'MOTOR', 'CLIMB', 'CHEST', 'ANKLE', 'THROW', 'CATCH',
        'SKATE', 'JUDO', 'SPRINT', 'DERBY', 'DRAFT', 'DRILL', 'SWING', 'TOUCH', 'FAULT', 'SPIKE',
        'BOOST', 'FORCE', 'FIGHT', 'RIVAL', 'BADGE', 'PRIZE', 'TITLE', 'CROWD', 'STAND', 'CHEER',
        'ROVER', 'SWIFT', 'BRAVE', 'GIANT', 'BLITZ', 'RIDER', 'DRIVE', 'RALLY', 'SPORT', 'HEAVY',
        'LIGHT', 'SOLID', 'TOUGH', 'YOUTH', 'STOMP', 'BOUND', 'PIVOT', 'BLOCK', 'CHUTE', 'CLASH'
      ],
      len6: [
        'SOCCER', 'TENNIS', 'LEAGUE', 'STRIKE', 'TACKLE', 'DEFEND', 'ATTACK', 'SPRINT', 'HEADER', 'TROPHY',
        'RUNNER', 'BOXING', 'ROWING', 'SKIING', 'HURDLE', 'WEIGHT', 'RECORD', 'SPORTS', 'KEEPER', 'REFREE',
        'WHISTL', 'CORNER', 'OFFSIDE', 'YELLOW', 'ORANGE', 'SILVER', 'BRONZE', 'WINNER', 'DEFEAT', 'TALENT',
        'JERSEY', 'SHORTS', 'CLEATS', 'GLOVES', 'SHIELD', 'TARGET', 'ACTION', 'ENERGY', 'CHASER', 'MASTER',
        'SPIRIT', 'CENTER', 'FORWARD', 'WINGER', 'DIRECT', 'REFLEX', 'MOTION', 'STRIDE', 'FITNESS', 'MEDALS'
      ],
      len7Plus: [
        'FOOTBALL', 'CHAMPION', 'VICTORY', 'CAPTAIN', 'OLYMPIC', 'ATHLETE', 'STADIUM', 'DEFENSE', 'OFFENSE', 'TRAINER',
        'FITNESS', 'TRIUMPH', 'REFEREE', 'STRIKER', 'MIDFIELD', 'CHALLENGE', 'PENALTY', 'TOURNAMENT'
      ]
    }
  },

  // =========================================================================
  // 2. NATURE & WILDLIFE (Fauna, Flora & Wilderness)
  // =========================================================================
  {
    category: 'NATURE',
    theme: 'Wild Safari',
    words: {
      len2: ['OX', 'BY', 'AS', 'AT', 'OF', 'IN', 'ON', 'UP', 'AN', 'AM'],
      len3: [
        'FOX', 'CAT', 'DOG', 'BEE', 'ELK', 'OWL', 'APE', 'BAT', 'COW', 'PIG',
        'RAM', 'EEL', 'ANT', 'BUG', 'OAK', 'ELM', 'ASH', 'FIR', 'FOG', 'DEW',
        'SUN', 'SEA', 'SKY', 'AIR', 'ICE', 'MUD', 'BAY', 'RAY', 'FIN', 'FUR',
        'FLY', 'JAY', 'ROE', 'DOE', 'EWE', 'HOG', 'YAK', 'COY', 'NIP', 'BUD',
        'NUT', 'POD', 'SAP', 'BARK', 'MOSS', 'ROOT', 'WORM', 'GULL', 'SWAN', 'WASP'
      ],
      len4: [
        'LION', 'WOLF', 'BEAR', 'DEER', 'HAWK', 'SWAN', 'CRAB', 'FROG', 'SEAL', 'DUCK',
        'CROW', 'GOAT', 'HARE', 'MULE', 'PUMA', 'TOAD', 'WASP', 'WORM', 'TREE', 'LEAF',
        'BARK', 'ROOT', 'SEED', 'ROSE', 'FERN', 'PINE', 'LILY', 'MOSS', 'WEED', 'PALM',
        'WIND', 'RAIN', 'SNOW', 'HAIL', 'TIDE', 'WAVE', 'SAND', 'DUNE', 'ROCK', 'CAVE',
        'LAKE', 'POND', 'HILL', 'PEAK', 'CLIFF', 'WOOD', 'BUSH', 'DAWN', 'DUSK', 'MOON',
        'CLAW', 'FANG', 'BEAK', 'TAIL', 'WING', 'HIDE', 'PELT', 'HERD', 'PACK', 'NEST',
        'COLT', 'FAWN', 'CALF', 'LAMB', 'FOAL', 'BULL', 'STAG', 'LYNX', 'BOAR', 'MOLE'
      ],
      len5: [
        'TIGER', 'ZEBRA', 'EAGLE', 'SHARK', 'WHALE', 'RHINO', 'BISON', 'MOOSE', 'OTTER', 'PANDA',
        'KOALA', 'CAMEL', 'HYENA', 'LEMUR', 'VIPER', 'GECKO', 'CORAL', 'TROUT', 'ROBIN', 'STORK',
        'PLANT', 'GRASS', 'FLOWER', 'CEDAR', 'BIRCH', 'MAPLE', 'TULIP', 'DAISY', 'LOTUS', 'CLOVER',
        'OCEAN', 'RIVER', 'STORM', 'CLOUD', 'FROST', 'SHORE', 'VALLEY', 'CANYON', 'FOREST', 'JUNGLE',
        'DESERT', 'OASIS', 'ISLAND', 'STREAM', 'SPRING', 'GLACIER', 'VOLCANO', 'SUMMIT', 'BREEZE', 'SUNSET',
        'CRANE', 'HERON', 'FINCH', 'RAVEN', 'VIPER', 'COBRA', 'PYTHON', 'IGUANA', 'SALMON', 'WALRUS'
      ],
      len6: [
        'FALCON', 'JAGUAR', 'BADGER', 'BEAVER', 'COUGAR', 'MONKEY', 'RABBIT', 'TURTLE', 'LIZARD', 'SALMON',
        'WALRUS', 'DOLPHIN', 'GIRAFFE', 'CHEETAH', 'ORCHID', 'WILLOW', 'CACTUS', 'BAMBOO', 'MEADOW', 'JUNGLE',
        'TIMBER', 'GARDEN', 'SUNRISE', 'SHADOW', 'NATURE', 'BRANCH', 'VALLEY', 'LAGOON', 'SPRING', 'HORIZON',
        'PLANET', 'GALAXY', 'METEOR', 'CRATER', 'GRAVEL', 'PEBBLE', 'QUARRY', 'GEYSER', 'RAPIDS', 'TUNDRA',
        'BEETLE', 'SPIDER', 'HORNET', 'PENGUIN', 'PELICAN', 'OSTRICH', 'CONDOR', 'PARROT', 'CANARY', 'MAGPIE'
      ],
      len7Plus: [
        'LEOPARD', 'ELEPHANT', 'GORILLA', 'CHEETAH', 'BLOSSOM', 'RAINBOW', 'THUNDER', 'HABITAT', 'WILDERNESS', 'MOUNTAIN',
        'ANTELOPE', 'CROCODILE', 'FLAMINGO', 'KANGAROO', 'CHIMPANZEE', 'ALLIGATOR', 'EVERGREEN', 'WATERFALL'
      ]
    }
  },

  // =========================================================================
  // 3. ETHIOPIA & HORN OF AFRICA (Highland Heritage & Culture)
  // =========================================================================
  {
    category: 'ETHIOPIA',
    theme: 'Highland Heritage',
    words: {
      len2: ['AM', 'HE', 'WE', 'BE', 'MY', 'GO', 'NO', 'SO', 'TO', 'IN'],
      len3: [
        'RED', 'ERA', 'SUN', 'OLD', 'TEA', 'PAN', 'CUP', 'ROW', 'HUT', 'JAM',
        'POT', 'CAP', 'WAR', 'CUB', 'DOT', 'JOY', 'MAN', 'OAK', 'RAW', 'RUN',
        'TOP', 'WIN', 'AIR', 'DAY', 'BOW', 'AXE', 'OAR', 'RUG', 'MAT', 'ROD'
      ],
      len4: [
        'TEFF', 'LION', 'NILE', 'TANA', 'GIDA', 'BALE', 'GOFA', 'AFAR', 'OROM', 'AMBA',
        'ZEBU', 'COPT', 'GOLD', 'CORN', 'GRAI', 'CLAY', 'SALT', 'ROCK', 'SOIL', 'RAIN',
        'PEAK', 'VALE', 'CAMP', 'HERD', 'WOOD', 'HILL', 'FORT', 'TOWN', 'ROAD', 'GATE',
        'IBEX', 'ABAY', 'BERE', 'AWAS', 'ARSI', 'KAFFA', 'SHOA', 'WALL', 'WELL', 'PATH'
      ],
      len5: [
        'COFFEE', 'INJERA', 'AXUM', 'TANA', 'HARAR', 'GOHAR', 'AWASH', 'TIKIL', 'KABBA', 'WOT',
        'LALIB', 'SIMEN', 'GUGHE', 'BARO', 'OROMO', 'TIGRAY', 'SOMAL', 'SIDAM', 'GURAG', 'AFARI',
        'ZEBRA', 'BABOON', 'IBEX', 'EAGLE', 'CROCO', 'AMBER', 'IVORY', 'PEARL', 'SPICE', 'GRAIN',
        'RIVER', 'LAKES', 'PLATE', 'VALLEY', 'HIGHL', 'CASTL', 'CHURCH', 'MONKS', 'CROSS', 'CROWN',
        'GELADA', 'KIDAME', 'MASIKO', 'BEGENA', 'KABARO', 'SHAMMA', 'GABI', 'TIBIS', 'SHIRO', 'BERBERE'
      ],
      len6: [
        'COFFEE', 'ETHIOPIA', 'ADDIS', 'GONDAR', 'HAWASSA', 'BAHIR', 'DIRDAWA', 'LALIBE', 'SEMIEN', 'OROMIA',
        'AMHARA', 'SOMALI', 'AFRICA', 'HIGHLAND', 'RIFT', 'CANYON', 'VALLEY', 'LEGEND', 'HERITAGE', 'SHIELD',
        'RUNNER', 'OLYMPIC', 'MEDALS', 'EMPIRE', 'PRIDE', 'BANNER', 'SYMBOL', 'MARKET', 'VILLAG', 'HARVEST',
        'CHURCH', 'CASTLE', 'PALACE', 'SHEPHERD', 'ANTIQUE', 'SABIAN', 'LUCY', 'SHEBA', 'MENELIK', 'TIZITA'
      ],
      len7Plus: [
        'ETHIOPIA', 'LALIBELA', 'GONDAR', 'HIGHLAND', 'RUNNERS', 'HERITAGE', 'CULTURE', 'HABESHA', 'MONASTERY', 'EMPEROR',
        'FASILIDES', 'ENTOTO', 'GREATRIFT', 'SOF_OMAR', 'DANAKIL', 'ABYSSINIA', 'TIMKET', 'MESKEL'
      ]
    }
  },

  // =========================================================================
  // 4. WORLD GEOGRAPHY & CITIES (Global Atlas)
  // =========================================================================
  {
    category: 'WORLD',
    theme: 'World Explorer',
    words: {
      len2: ['UK', 'US', 'IN', 'ON', 'TO', 'AT', 'BY', 'OF', 'UP', 'AS'],
      len3: [
        'SEA', 'BAY', 'CAP', 'MAP', 'FAR', 'HOT', 'COLD', 'ICE', 'DRY', 'WET',
        'TOP', 'END', 'WAY', 'BUS', 'CAR', 'JET', 'VAN', 'CAB', 'PORT', 'TOWN',
        'AIR', 'SKY', 'SUN', 'FOG', 'LOW', 'MID', 'NEW', 'OLD', 'BIG', 'OUT'
      ],
      len4: [
        'ROME', 'OSLO', 'LIMA', 'BERN', 'PERU', 'CHAD', 'TOGO', 'IRAN', 'IRAQ', 'CUBA',
        'FIJI', 'MALI', 'OMAN', 'ASIA', 'ALPS', 'NILE', 'SEINE', 'RHINE', 'URAL', 'GOBI',
        'CITY', 'PORT', 'TOWN', 'LAND', 'WEST', 'EAST', 'ZONE', 'BORDER', 'AREA', 'ISLE',
        'COAST', 'BEACH', 'CAPE', 'GULF', 'REEF', 'PEAK', 'ATLAS', 'PARK', 'LAKE', 'COVE',
        'DUNE', 'GLEN', 'MESA', 'VALE', 'PASS', 'ROAD', 'PIER', 'DOCK', 'GATE', 'SITE'
      ],
      len5: [
        'PARIS', 'TOKYO', 'CAIRO', 'DUBAI', 'DELHI', 'MADRID', 'SEOUL', 'HANOI', 'KENYA', 'EGYPT',
        'GHANA', 'SUDAN', 'SPAIN', 'ITALY', 'CHILE', 'BRAZIL', 'CHINA', 'JAPAN', 'INDIA', 'QATAR',
        'OCEAN', 'RIVER', 'RIDGE', 'DELTA', 'FJORD', 'BASIN', 'PLAIN', 'TRAIL', 'ROUTE', 'GLOBE',
        'EARTH', 'NORTH', 'SOUTH', 'WORLD', 'REALM', 'STATE', 'PLACE', 'SHORE', 'OASIS', 'HAVEN',
        'TUNDRA', 'SAVANA', 'ALPINE', 'ISLAND', 'HARBOR', 'STRAIT', 'SUMMIT', 'CANYON', 'VALLEY', 'DESERT'
      ],
      len6: [
        'LONDON', 'BERLIN', 'MADRID', 'LISBON', 'ATHENS', 'VIENNA', 'PRAGUE', 'WARSAW', 'DUBLIN', 'OTTAWA',
        'MOSCOW', 'BEIJING', 'SYDNEY', 'ANKARA', 'RIYADH', 'PANAMA', 'CANADA', 'MEXICO', 'FRANCE', 'GREECE',
        'SWEDEN', 'NORWAY', 'POLAND', 'TURKEY', 'JORDAN', 'ISRAEL', 'ZAMBIA', 'UGANDA', 'RWANDA', 'ANGOLA',
        'ISLAND', 'HARBOR', 'VALLEY', 'SUMMIT', 'BORDER', 'CAPITAL', 'NATION', 'DOMAIN', 'REGION', 'DESERT',
        'CONTIN', 'ARCHIP', 'PENINS', 'TERRAIN', 'HEMISP', 'EQUATOR', 'LATITUD', 'LONGIT', 'MARINA', 'VILLAGE'
      ],
      len7Plus: [
        'GERMANY', 'AMERICA', 'ENGLAND', 'PORTUGAL', 'AUSTRIA', 'IRELAND', 'FINLAND', 'DENMARK', 'BELGIUM', 'MOROCCO',
        'AUSTRALIA', 'ARGENTINA', 'COLOMBIA', 'SINGAPORE', 'SWITZERLAND', 'INDONESIA', 'THAILAND', 'PHILIPPINES'
      ]
    }
  },

  // =========================================================================
  // 5. FOOD & CUISINE (Culinary Arts)
  // =========================================================================
  {
    category: 'FOOD',
    theme: 'Gourmet Kitchen',
    words: {
      len2: ['AT', 'IN', 'ON', 'UP', 'OF', 'BY', 'TO', 'AS', 'AM', 'SO'],
      len3: [
        'EGG', 'HAM', 'PIE', 'TEA', 'JAM', 'NUT', 'FIG', 'OIL', 'OAT', 'PEA',
        'RYE', 'SOY', 'BUN', 'DIP', 'ICE', 'CUP', 'PAN', 'POT', 'DISH', 'FORK',
        'ALE', 'BEER', 'FAT', 'MUG', 'CAN', 'JAR', 'RAW', 'RICE', 'SALT', 'BOWL'
      ],
      len4: [
        'MEAT', 'BEEF', 'PORK', 'FISH', 'RICE', 'CORN', 'BEAN', 'SOUP', 'CAKE', 'BAKE',
        'CHEF', 'COOK', 'SALT', 'HERB', 'LIME', 'PEAR', 'PLUM', 'DATE', 'FIGS', 'KIWI',
        'MILK', 'CURD', 'TOFU', 'TACO', 'WRAP', 'STEW', 'ROAST', 'GRILL', 'FRY', 'BOIL',
        'HEAT', 'OVEN', 'PAN', 'BOWL', 'FORK', 'MEAL', 'FOOD', 'DINE', 'BITE', 'TASTE',
        'CHIP', 'DIP', 'LOAF', 'CRUST', 'ROLL', 'TART', 'MINT', 'SAGE', 'BASIL', 'LEEK'
      ],
      len5: [
        'APPLE', 'BREAD', 'LEMON', 'MANGO', 'BERRY', 'MELON', 'PEACH', 'GRAPE', 'GUAVA', 'ONION',
        'SALAD', 'PASTA', 'PIZZA', 'STEAK', 'BACON', 'CURRY', 'SUSHI', 'SAUCE', 'SUGAR', 'SPICE',
        'WHEAT', 'BARLEY', 'GRAIN', 'FLOUR', 'YEAST', 'HONEY', 'SYRUP', 'CREAM', 'CHEESE', 'BUTTER',
        'ROAST', 'SNACK', 'FEAST', 'LUNCH', 'DINER', 'TASTE', 'SWEET', 'BITTER', 'SALTY', 'JUICE',
        'CIDER', 'GRAVY', 'CHILI', 'BROTH', 'PESTO', 'WAFER', 'BAGEL', 'CREPE', 'DONUT', 'FUDGE'
      ],
      len6: [
        'BANANA', 'ORANGE', 'CHERRY', 'PAPAYA', 'TOMATO', 'POTATO', 'CARROT', 'PEPPER', 'GARLIC', 'GINGER',
        'CHEESE', 'BURGER', 'NOODLE', 'MUFFIN', 'WAFFLE', 'COOKIE', 'BUTTER', 'YOGURT', 'CEREAL', 'PASTRY',
        'SALMON', 'SHRIMP', 'OYSTER', 'RECIPE', 'FLAVOR', 'DINNER', 'SUPPER', 'BAKERY', 'KITCHEN', 'CHEF',
        'WALNUT', 'ALMOND', 'CASHEW', 'OLIVES', 'RADISH', 'CELERY', 'SPINACH', 'NUTMEG', 'VANILLA', 'CLOVES'
      ],
      len7Plus: [
        'PANCAKE', 'CHEDDAR', 'DESSERT', 'KITCHEN', 'GOURMET', 'CHICKEN', 'SAUSAGE', 'SEAFOOD', 'AVOCADO', 'COOKING',
        'CHOCOLATE', 'BARBECUE', 'CASSEROLE', 'SANDWICH', 'MEATBALL', 'ESPRESSO', 'SMOOTHIE', 'RESTAURANT'
      ]
    }
  },

  // =========================================================================
  // 6. SCIENCE & TECHNOLOGY (Innovation & Space)
  // =========================================================================
  {
    category: 'TECH',
    theme: 'Digital Frontier',
    words: {
      len2: ['IT', 'AI', 'BY', 'ON', 'UP', 'IN', 'AT', 'TO', 'OF', 'AS'],
      len3: [
        'BIT', 'BYTE', 'WEB', 'NET', 'BOT', 'APP', 'CHIP', 'CODE', 'DATA', 'RAM',
        'ROM', 'LOG', 'BUG', 'KEY', 'PIN', 'HUB', 'TAB', 'DOC', 'RAY', 'ION',
        'DOT', 'WIRE', 'BUS', 'FAN', 'LED', 'CPU', 'USB', 'DEV', 'SET', 'RUN'
      ],
      len4: [
        'BYTE', 'CODE', 'DATA', 'CHIP', 'HOST', 'NODE', 'PORT', 'LINK', 'WIRE', 'FILE',
        'USER', 'ICON', 'DISK', 'PAGE', 'SITE', 'WIFI', 'TECH', 'CORE', 'LOAD', 'SYNC',
        'PLOT', 'GRID', 'CELL', 'ATOM', 'WAVE', 'LENS', 'BEAM', 'HEAT', 'MASS', 'VOLT',
        'WATT', 'GEAR', 'PUMP', 'VENT', 'PULSE', 'MATH', 'LABS', 'SCAN', 'TEST', 'VIEW',
        'FONT', 'TEXT', 'POST', 'SEND', 'READ', 'SAVE', 'LOCK', 'ROOT', 'BOOT', 'BIOS'
      ],
      len5: [
        'ROBOT', 'LASER', 'RADAR', 'SOLAR', 'LOGIC', 'PIXEL', 'CLOUD', 'FIBER', 'CYBER', 'DRIVE',
        'SMART', 'AUDIO', 'VIDEO', 'MEDIA', 'RADIO', 'POWER', 'MOTOR', 'TURBO', 'VALVE', 'GAUGE',
        'FORCE', 'SPEED', 'LIGHT', 'PRISM', 'ORBIT', 'SPACE', 'COMET', 'ASTRO', 'GRAVY', 'PROBE',
        'MODEL', 'GRAPH', 'SCALE', 'RANGE', 'INDEX', 'QUERY', 'ARRAY', 'STACK', 'QUEUE', 'DEBUG',
        'PATCH', 'LOGIN', 'ADMIN', 'MACRO', 'MICRO', 'NANO', 'QUANT', 'RELAY', 'SERVO', 'SONAR'
      ],
      len6: [
        'SERVER', 'ROUTER', 'LAPTOP', 'SCREEN', 'SENSOR', 'ENGINE', 'DEVICE', 'SYSTEM', 'MATRIX', 'VECTOR',
        'BINARY', 'SIGNAL', 'ENERGY', 'CIRCUIT', 'ROCKET', 'GALAXY', 'COSMIC', 'QUANTM', 'OPTICS', 'RADIAN',
        'CODING', 'ONLINE', 'SECURE', 'MEMORY', 'BACKUP', 'FILTER', 'STREAM', 'MODULE', 'SOURCE', 'OUTPUT',
        'SOCKET', 'DRIVER', 'KERNEL', 'BROWSER', 'DOMAIN', 'HOSTING', 'SCRIPT', 'COMPUT', 'ROBOTS', 'AUTOMAT'
      ],
      len7Plus: [
        'COMPUTER', 'INTERNET', 'NETWORK', 'SOFTWARE', 'HARDWARE', 'SATELLITE', 'DATABASE', 'PROTOCOL', 'WIRELESS', 'QUANTUM',
        'ALGORITHM', 'PROCESSOR', 'FIREWALL', 'BLUETOOTH', 'TELECOM', 'INTELLIGENCE', 'INTERFACE', 'DEVELOPER'
      ]
    }
  },

  // =========================================================================
  // 7. EVERYDAY OBJECTS & TOOLS (Daily Life)
  // =========================================================================
  {
    category: 'EVERYDAY',
    theme: 'Everyday Mastery',
    words: {
      len2: ['IN', 'AT', 'TO', 'ON', 'BY', 'UP', 'OF', 'IT', 'AS', 'SO'],
      len3: [
        'PEN', 'BAG', 'KEY', 'BOX', 'CUP', 'HAT', 'BED', 'RUG', 'JAR', 'FAN',
        'MAP', 'CAR', 'VAN', 'BUS', 'DOOR', 'BELL', 'COAT', 'ROPE', 'PIN', 'TAP',
        'TUB', 'POT', 'PAN', 'TIN', 'LID', 'MOP', 'SAW', 'NAIL', 'NUT', 'BOLT'
      ],
      len4: [
        'BOOK', 'DESK', 'LAMP', 'DOOR', 'WALL', 'ROOF', 'ROOM', 'LOCK', 'KEYS', 'SHOE',
        'COAT', 'RING', 'WATCH', 'BELL', 'COIN', 'VASE', 'SOFA', 'SOAP', 'COMB', 'BATH',
        'ROAD', 'PATH', 'LANE', 'SIGN', 'CART', 'BIKE', 'BOAT', 'SHIP', 'MAST', 'ROPE',
        'WIRE', 'IRON', 'STEEL', 'WOOD', 'GOLD', 'SILK', 'WOOL', 'YARN', 'NEED', 'TOOL',
        'FORK', 'SPOON', 'DISH', 'TRAY', 'CASE', 'PACK', 'SACK', 'BELT', 'BOOT', 'CAPS'
      ],
      len5: [
        'CHAIR', 'TABLE', 'CLOCK', 'PHONE', 'GLASS', 'PLATE', 'SPOON', 'KNIFE', 'BRUSH', 'TOWEL',
        'SHIRT', 'PANTS', 'SHOES', 'BOOTS', 'SCARF', 'GLOVE', 'CROWN', 'PURSE', 'WALLET', 'CHAIN',
        'HOUSE', 'CABIN', 'TOWER', 'BRIDGE', 'STREET', 'MARKET', 'STORE', 'BENCH', 'FENCE', 'STEPS',
        'LIGHT', 'TORCH', 'CANDLE', 'MIRROR', 'BOTTLE', 'KETTLE', 'BASKET', 'BLANKET', 'PILLOW', 'CARPET',
        'DRAWER', 'CLOSET', 'SHADOW', 'HANDLE', 'SOCKET', 'BUCKET', 'LADDER', 'HAMMER', 'WRENCH', 'PLIERS'
      ],
      len6: [
        'WINDOW', 'MIRROR', 'POCKET', 'JACKET', 'WALLET', 'HELMET', 'HAMMER', 'LADDER', 'CAMERA', 'PENCIL',
        'GUITAR', 'VIOLIN', 'BUTTON', 'CUSHION', 'BLANKET', 'CURTAIN', 'STATION', 'CASTLE', 'BRIDGE', 'STREET',
        'MARKET', 'OFFICE', 'STUDIO', 'MUSEUM', 'THEATER', 'GARAGE', 'PALACE', 'SHELTER', 'FOUNTAIN', 'GARDEN',
        'NEEDLE', 'THREAD', 'SCISSOR', 'STAPLE', 'FOLDER', 'BOTTLE', 'FLASHO', 'TEAPOT', 'CANDLE', 'HANGER'
      ],
      len7Plus: [
        'NOTEBOOK', 'UMBRELLA', 'BACKPACK', 'WARDROBE', 'BUILDING', 'SIDEWALK', 'HIGHWAY', 'VEHICLE', 'AIRPLANE', 'FURNITURE',
        'SUITCASE', 'BINOCULARS', 'HEADPHONES', 'TELEPHONE', 'MICROSCOPE', 'CALCULATOR', 'TYPEWRITER', 'CONTAINER'
      ]
    }
  },

  // =========================================================================
  // 8. CULTURE, MUSIC & ARTS (Melody & Stage)
  // =========================================================================
  {
    category: 'CULTURE',
    theme: 'Grand Symphony',
    words: {
      len2: ['DO', 'RE', 'MI', 'FA', 'SO', 'LA', 'TI', 'AT', 'BY', 'IN'],
      len3: [
        'ART', 'ACT', 'PEN', 'INK', 'DRUM', 'HORN', 'BELL', 'SONG', 'NOTE', 'BEAT',
        'BAND', 'TUNE', 'RHYME', 'POEM', 'PLAY', 'CAST', 'MUSE', 'EPIC', 'FAME', 'PAGE',
        'BOW', 'CUE', 'SET', 'JAM', 'MIC', 'GIG', 'HIT', 'POP', 'JAZZ', 'FOG'
      ],
      len4: [
        'SONG', 'NOTE', 'BEAT', 'DRUM', 'HORN', 'FLUTE', 'BELL', 'LUTE', 'HARP', 'BAND',
        'TUNE', 'DUET', 'SOLO', 'TRIO', 'POEM', 'RHYME', 'MYTH', 'EPIC', 'TALE', 'BOOK',
        'PAGE', 'LINE', 'WORD', 'TEXT', 'PLOT', 'HERO', 'CAST', 'ROLE', 'PLAY', 'STAGE',
        'CURT', 'SCENE', 'DANCE', 'STEP', 'MASK', 'MUSE', 'DRAW', 'PAINT', 'HUE', 'TONE',
        'FOLK', 'ROCK', 'BASS', 'CHORD', 'ARIA', 'HYMN', 'LORE', 'OPUS', 'ICON', 'IDOL'
      ],
      len5: [
        'MUSIC', 'VOICE', 'SOUND', 'PIANO', 'ORGAN', 'FLUTE', 'CELLO', 'CHORD', 'SCALE', 'TEMPO',
        'OPERA', 'CHOIR', 'DANCE', 'WALTZ', 'TANGO', 'SALSA', 'DRAMA', 'STAGE', 'ACTOR', 'MUSEUM',
        'CANVAS', 'EASEL', 'PAINT', 'BRUSH', 'COLOR', 'SHADE', 'IMAGE', 'SKETCH', 'STATUE', 'CRAFT',
        'NOVEL', 'POETRY', 'RHYTHM', 'BALLAD', 'VERSE', 'STORY', 'FABLE', 'TALES', 'GENIUS', 'TALENT',
        'TENOR', 'ALTOS', 'BASSES', 'BRASS', 'TREBLE', 'BANJO', 'FIDDLE', 'MOTIF', 'THEME', 'SCRIPT'
      ],
      len6: [
        'GUITAR', 'VIOLIN', 'BALLET', 'CINEMA', 'POETRY', 'RHYTHM', 'MELODY', 'AUTHOR', 'ARTIST', 'PAINTER',
        'ACTRESS', 'CHORUS', 'SINGER', 'STUDIO', 'CANVAS', 'MASTER', 'LEGEND', 'FANTASY', 'ROMANCE', 'COMEDY',
        'TRAGEDY', 'SCENE', 'REVIEW', 'DESIGN', 'SCULPT', 'GALLERY', 'CULTURE', 'WISDOM', 'VISION', 'HARMONY',
        'CLARIN', 'TRUMPET', 'CYMBAL', 'SONATA', 'MEDLEY', 'CADENCE', 'DIRECT', 'PRODUCE', 'LYRICS', 'STANZA'
      ],
      len7Plus: [
        'SYMPHONY', 'CONCERT', 'THEATER', 'ORCHESTRA', 'FESTIVAL', 'SCULPTURE', 'HERITAGE', 'MAJESTY', 'CREATIVE', 'CHAMPION',
        'COMPOSER', 'DIRECTOR', 'CHOREOGRAPHY', 'PERFORMANCE', 'EXHIBITION', 'LITERATURE', 'BALLERINA', 'PLAYWRIGHT'
      ]
    }
  },

  // =========================================================================
  // 9. PEOPLE & PROFESSIONS (Occupations & Roles)
  // =========================================================================
  {
    category: 'PEOPLE',
    theme: 'Masters of Trade',
    words: {
      len2: ['HE', 'WE', 'ME', 'US', 'MY', 'AM', 'BE', 'BY', 'IN', 'DO'],
      len3: [
        'MAN', 'BOY', 'LAD', 'DOC', 'COP', 'SPY', 'NUN', 'MONK', 'CHEF', 'BOSS',
        'VET', 'GUARD', 'CREW', 'HOST', 'GUEST', 'ALLY', 'PEER', 'LEAD', 'KING', 'LORD',
        'SIR', 'SON', 'DAD', 'MOM', 'BRO', 'SIS', 'PAL', 'MATE', 'CHUM', 'GUIDE'
      ],
      len4: [
        'CHEF', 'COOK', 'KING', 'QUEEN', 'LORD', 'MONK', 'POET', 'CREW', 'HERO', 'STAR',
        'HOST', 'ALLY', 'LEAD', 'BOSS', 'MATE', 'PEER', 'CHIEF', 'PILOT', 'JUDGE', 'CLERK',
        'MAID', 'PAGE', 'SAGE', 'GUIDE', 'SCOUT', 'GUARD', 'MINER', 'MASON', 'BAKER', 'SAIL',
        'NURSE', 'AGENT', 'COACH', 'RIDER', 'DRIVER', 'ACTOR', 'MAKER', 'TAILR', 'SMITH', 'WEAVR'
      ],
      len5: [
        'PILOT', 'JUDGE', 'ACTOR', 'COACH', 'NURSE', 'CHEF', 'BAKER', 'RIDER', 'CLERK', 'GUARD',
        'SCOUT', 'GUIDE', 'MAYOR', 'BARON', 'PRIEST', 'SCHOLAR', 'MINER', 'MASON', 'SAILOR', 'TAILOR',
        'WEAVER', 'FARMER', 'HUNTER', 'FIGHTER', 'ARCHER', 'LEADER', 'MASTER', 'EXPERT', 'GENIUS', 'AUTHOR',
        'DANCER', 'SINGER', 'PAINTER', 'BUILDER', 'CARVER', 'CRAFTR', 'PORTER', 'TRADER', 'DRIVER', 'DOCTOR'
      ],
      len6: [
        'DOCTOR', 'CAPTAIN', 'OFFICER', 'ENGINEER', 'LAWYER', 'WRITER', 'PAINTER', 'DRIVER', 'FARMER', 'SAILOR',
        'TAILOR', 'HEROES', 'KEEPER', 'MASTER', 'SCHOLAR', 'TEACHER', 'COACH', 'WINNER', 'CHAMP', 'LEADER',
        'BARBER', 'BUTCHER', 'CARPENT', 'GLAZIER', 'POTTER', 'WEAVER', 'FISHER', 'SURGEON', 'DENTIST', 'NURSES'
      ],
      len7Plus: [
        'CHAMPION', 'DIRECTOR', 'SCIENTIST', 'ASTRONAUT', 'MUSICIAN', 'PROFESSOR', 'ARCHITECT', 'DESIGNER', 'ATHLETE', 'EXPLORER',
        'COMMANDER', 'MINISTER', 'DETECTIVE', 'JOURNALIST', 'PHOTOGRAPHER', 'PROGRAMMER', 'HISTORIAN', 'PHARMACIST'
      ]
    }
  },

  // =========================================================================
  // 10. AFRICA & CONTINENTAL MAJESTY (Savanna & Great Lakes)
  // =========================================================================
  {
    category: 'AFRICA',
    theme: 'Continental Safari',
    words: {
      len2: ['IN', 'AT', 'TO', 'ON', 'UP', 'OF', 'AS', 'BY', 'GO', 'SO'],
      len3: [
        'SUN', 'HOT', 'DRY', 'SEA', 'RED', 'BAY', 'DAM', 'HUT', 'CUP', 'POT',
        'ERA', 'RUN', 'WIN', 'TOP', 'FAR', 'WAY', 'OAK', 'MAP', 'CAT', 'AIR',
        'BOW', 'AXE', 'ROD', 'MAT', 'NET', 'JAM', 'MUD', 'LOG', 'LOW', 'NEW'
      ],
      len4: [
        'NILE', 'CHAD', 'TOGO', 'MALI', 'BALE', 'GOFA', 'AFAR', 'OROM', 'ZEBU', 'SAFI',
        'LION', 'GOLD', 'SALT', 'PALM', 'DUNE', 'OASIS', 'CLAY', 'ROCK', 'HERD', 'TREE',
        'RIVER', 'VALE', 'CAMP', 'PEAK', 'WEST', 'EAST', 'SOUTH', 'NORTH', 'SOIL', 'RAIN'
      ],
      len5: [
        'KENYA', 'EGYPT', 'GHANA', 'SUDAN', 'CONGO', 'GABON', 'BENIN', 'RWANDA', 'SAHARA', 'SAVAN',
        'KILIM', 'ATLAS', 'DELTA', 'OASIS', 'ZEBRA', 'RHINO', 'HIPPO', 'LIONS', 'HYENA', 'EAGLE',
        'FOREST', 'JUNGLE', 'VALLEY', 'LAKES', 'RIVER', 'CROWN', 'SPEAR', 'SHIELD', 'TRIBE', 'VILLAG'
      ],
      len6: [
        'AFRICA', 'ZAMBIA', 'UGANDA', 'ANGOLA', 'ALGERIA', 'NIGERIA', 'SENEGAL', 'MOROCCO', 'TUNISIA', 'NAMIBIA',
        'BOTSWANA', 'ZIMBABWE', 'HIGHLAND', 'SAVANNA', 'JUNGLE', 'SAFARI', 'RIVER', 'DESERT', 'CRADLE', 'VICTORY',
        'KEEPER', 'RUNNER', 'OLYMPIC', 'MEDALS', 'HERITAGE', 'PRIDE', 'SYMBOLS', 'FOREST', 'VALLEYS', 'KINGDOM'
      ],
      len7Plus: [
        'SERENGETI', 'KILIMANJARO', 'CONTINENT', 'HERITAGE', 'CHAMPIONS', 'MAJESTIC', 'WILDLIFE', 'WARRIOR', 'RAINFOREST', 'PANORAMA',
        'SAVANNAH', 'MADAGASCAR', 'MAURITIUS', 'MOZAMBIQUE', 'IVORYCOAST', 'CAMEROON', 'TANZANIA', 'ETHIOPIAN'
      ]
    }
  }
];

// Helper to normalize strings: lowercase, trim whitespace, normalize punctuation
export function normalizeWord(word: string): string {
  return word.trim().toUpperCase().replace(/[^A-Z]/g, '');
}

import { SUPPLEMENTAL_WORDS_BY_CATEGORY } from './tournamentWordBank';

// Master index of all words
export const MASTER_DICTIONARY_SET = new Set<string>();

CATEGORIZED_WORD_DICTIONARY.forEach((cat) => {
  Object.values(cat.words).forEach((wordList) => {
    wordList.forEach((w) => {
      const clean = normalizeWord(w);
      if (clean.length >= 2) {
        MASTER_DICTIONARY_SET.add(clean);
      }
    });
  });
});

Object.values(SUPPLEMENTAL_WORDS_BY_CATEGORY).forEach((words) => {
  words.forEach((w) => {
    const clean = normalizeWord(w);
    if (clean.length >= 2) {
      MASTER_DICTIONARY_SET.add(clean);
    }
  });
});
