import { LevelConfig } from './types';

// 40 Mathematically Verified Solvable Levels with Exact 4 Units Per Color
// Every level is guaranteed solvable with calculated strategic depth and optimal par moves.
export const ROYAL_WATER_SORT_LEVELS: LevelConfig[] = [
  {
    "levelNum": 1,
    "title": "The Royal Gates",
    "difficultyLabel": "HARD",
    "capacity": 4,
    "bottles": [
      [
        "green",
        "red",
        "yellow",
        "blue"
      ],
      [
        "yellow",
        "blue",
        "yellow",
        "blue"
      ],
      [
        "green",
        "green",
        "red",
        "yellow"
      ],
      [
        "red",
        "blue",
        "green",
        "red"
      ],
      []
    ],
    "parMoves": 15,
    "rewardCoins": 100
  },
  {
    "levelNum": 2,
    "title": "Crown Jewels",
    "difficultyLabel": "HARD",
    "capacity": 4,
    "bottles": [
      [
        "yellow",
        "red",
        "red",
        "blue"
      ],
      [
        "blue",
        "green",
        "red",
        "green"
      ],
      [
        "green",
        "blue",
        "red",
        "blue"
      ],
      [
        "green",
        "yellow",
        "yellow",
        "yellow"
      ],
      []
    ],
    "parMoves": 14,
    "rewardCoins": 100
  },
  {
    "levelNum": 3,
    "title": "Imperial Chamber",
    "difficultyLabel": "HARD",
    "capacity": 4,
    "bottles": [
      [
        "green",
        "yellow",
        "green",
        "yellow"
      ],
      [
        "blue",
        "green",
        "yellow",
        "blue"
      ],
      [
        "red",
        "yellow",
        "red",
        "green"
      ],
      [
        "red",
        "blue",
        "red",
        "blue"
      ],
      []
    ],
    "parMoves": 18,
    "rewardCoins": 100
  },
  {
    "levelNum": 4,
    "title": "Sapphire Spire",
    "difficultyLabel": "HARD",
    "capacity": 4,
    "bottles": [
      [
        "green",
        "yellow",
        "green",
        "yellow"
      ],
      [
        "blue",
        "red",
        "blue",
        "blue"
      ],
      [
        "red",
        "green",
        "blue",
        "green"
      ],
      [
        "yellow",
        "red",
        "yellow",
        "red"
      ],
      []
    ],
    "parMoves": 15,
    "rewardCoins": 100
  },
  {
    "levelNum": 5,
    "title": "Golden Scepter",
    "difficultyLabel": "HARD",
    "capacity": 4,
    "bottles": [
      [
        "green",
        "yellow",
        "red",
        "green"
      ],
      [
        "yellow",
        "red",
        "blue",
        "blue"
      ],
      [
        "red",
        "yellow",
        "blue",
        "yellow"
      ],
      [
        "green",
        "red",
        "green",
        "blue"
      ],
      []
    ],
    "parMoves": 15,
    "rewardCoins": 100
  },
  {
    "levelNum": 6,
    "title": "Velvet Throne",
    "difficultyLabel": "VERY HARD",
    "capacity": 4,
    "bottles": [
      [
        "green",
        "blue",
        "red",
        "orange"
      ],
      [
        "blue",
        "green",
        "red",
        "blue"
      ],
      [
        "yellow",
        "green",
        "green",
        "red"
      ],
      [
        "red",
        "yellow",
        "orange",
        "blue"
      ],
      [
        "orange",
        "orange",
        "yellow",
        "yellow"
      ],
      []
    ],
    "parMoves": 18,
    "rewardCoins": 120
  },
  {
    "levelNum": 7,
    "title": "Gilded Hall",
    "difficultyLabel": "VERY HARD",
    "capacity": 4,
    "bottles": [
      [
        "blue",
        "blue",
        "green",
        "yellow"
      ],
      [
        "orange",
        "green",
        "red",
        "blue"
      ],
      [
        "yellow",
        "orange",
        "red",
        "green"
      ],
      [
        "green",
        "orange",
        "orange",
        "yellow"
      ],
      [
        "blue",
        "red",
        "yellow",
        "red"
      ],
      []
    ],
    "parMoves": 20,
    "rewardCoins": 120
  },
  {
    "levelNum": 8,
    "title": "Crystal Chandelier",
    "difficultyLabel": "VERY HARD",
    "capacity": 4,
    "bottles": [
      [
        "red",
        "red",
        "yellow",
        "yellow"
      ],
      [
        "orange",
        "blue",
        "yellow",
        "green"
      ],
      [
        "blue",
        "green",
        "orange",
        "blue"
      ],
      [
        "red",
        "orange",
        "yellow",
        "blue"
      ],
      [
        "orange",
        "green",
        "green",
        "red"
      ],
      []
    ],
    "parMoves": 18,
    "rewardCoins": 120
  },
  {
    "levelNum": 9,
    "title": "Ruby Courtyard",
    "difficultyLabel": "VERY HARD",
    "capacity": 4,
    "bottles": [
      [
        "orange",
        "red",
        "blue",
        "orange"
      ],
      [
        "yellow",
        "green",
        "red",
        "yellow"
      ],
      [
        "blue",
        "yellow",
        "red",
        "blue"
      ],
      [
        "red",
        "blue",
        "green",
        "orange"
      ],
      [
        "green",
        "orange",
        "yellow",
        "green"
      ],
      []
    ],
    "parMoves": 20,
    "rewardCoins": 120
  },
  {
    "levelNum": 10,
    "title": "Emerald Bastion",
    "difficultyLabel": "VERY HARD",
    "capacity": 4,
    "bottles": [
      [
        "red",
        "green",
        "yellow",
        "orange"
      ],
      [
        "orange",
        "blue",
        "green",
        "red"
      ],
      [
        "orange",
        "red",
        "green",
        "blue"
      ],
      [
        "yellow",
        "orange",
        "yellow",
        "blue"
      ],
      [
        "yellow",
        "green",
        "red",
        "blue"
      ],
      []
    ],
    "parMoves": 21,
    "rewardCoins": 120
  },
  {
    "levelNum": 11,
    "title": "Royal Conservatory",
    "difficultyLabel": "EXPERT",
    "capacity": 4,
    "bottles": [
      [
        "cyan",
        "yellow",
        "green",
        "green"
      ],
      [
        "green",
        "yellow",
        "orange",
        "yellow"
      ],
      [
        "red",
        "red",
        "orange",
        "blue"
      ],
      [
        "blue",
        "red",
        "cyan",
        "blue"
      ],
      [
        "orange",
        "orange",
        "cyan",
        "yellow"
      ],
      [
        "red",
        "blue",
        "cyan",
        "green"
      ],
      [],
      []
    ],
    "parMoves": 21,
    "rewardCoins": 150
  },
  {
    "levelNum": 12,
    "title": "Imperial Armoury",
    "difficultyLabel": "EXPERT",
    "capacity": 4,
    "bottles": [
      [
        "cyan",
        "yellow",
        "green",
        "red"
      ],
      [
        "blue",
        "green",
        "red",
        "cyan"
      ],
      [
        "orange",
        "yellow",
        "cyan",
        "red"
      ],
      [
        "orange",
        "blue",
        "yellow",
        "green"
      ],
      [
        "red",
        "cyan",
        "blue",
        "blue"
      ],
      [
        "green",
        "yellow",
        "orange",
        "orange"
      ],
      [],
      []
    ],
    "parMoves": 23,
    "rewardCoins": 150
  },
  {
    "levelNum": 13,
    "title": "Sovereign Sanctum",
    "difficultyLabel": "EXPERT",
    "capacity": 4,
    "bottles": [
      [
        "cyan",
        "yellow",
        "yellow",
        "green"
      ],
      [
        "green",
        "orange",
        "red",
        "blue"
      ],
      [
        "red",
        "orange",
        "blue",
        "cyan"
      ],
      [
        "blue",
        "yellow",
        "green",
        "green"
      ],
      [
        "red",
        "red",
        "yellow",
        "blue"
      ],
      [
        "cyan",
        "orange",
        "orange",
        "cyan"
      ],
      [],
      []
    ],
    "parMoves": 21,
    "rewardCoins": 150
  },
  {
    "levelNum": 14,
    "title": "Celestial Pavilion",
    "difficultyLabel": "EXPERT",
    "capacity": 4,
    "bottles": [
      [
        "orange",
        "yellow",
        "yellow",
        "green"
      ],
      [
        "orange",
        "cyan",
        "green",
        "cyan"
      ],
      [
        "blue",
        "green",
        "red",
        "orange"
      ],
      [
        "cyan",
        "red",
        "blue",
        "blue"
      ],
      [
        "orange",
        "yellow",
        "red",
        "green"
      ],
      [
        "cyan",
        "yellow",
        "blue",
        "red"
      ],
      [],
      []
    ],
    "parMoves": 24,
    "rewardCoins": 150
  },
  {
    "levelNum": 15,
    "title": "Grand Gallery",
    "difficultyLabel": "EXPERT",
    "capacity": 4,
    "bottles": [
      [
        "blue",
        "red",
        "orange",
        "red"
      ],
      [
        "green",
        "green",
        "blue",
        "blue"
      ],
      [
        "yellow",
        "cyan",
        "orange",
        "yellow"
      ],
      [
        "red",
        "red",
        "orange",
        "blue"
      ],
      [
        "green",
        "green",
        "cyan",
        "cyan"
      ],
      [
        "yellow",
        "orange",
        "cyan",
        "yellow"
      ],
      [],
      []
    ],
    "parMoves": 21,
    "rewardCoins": 150
  },
  {
    "levelNum": 16,
    "title": "Opal Observatory",
    "difficultyLabel": "EXPERT",
    "capacity": 4,
    "bottles": [
      [
        "red",
        "orange",
        "orange",
        "blue"
      ],
      [
        "green",
        "orange",
        "red",
        "cyan"
      ],
      [
        "cyan",
        "orange",
        "red",
        "yellow"
      ],
      [
        "green",
        "yellow",
        "red",
        "green"
      ],
      [
        "yellow",
        "blue",
        "blue",
        "blue"
      ],
      [
        "yellow",
        "cyan",
        "cyan",
        "green"
      ],
      [],
      []
    ],
    "parMoves": 20,
    "rewardCoins": 150
  },
  {
    "levelNum": 17,
    "title": "Amber Alcove",
    "difficultyLabel": "EXPERT",
    "capacity": 4,
    "bottles": [
      [
        "yellow",
        "orange",
        "cyan",
        "cyan"
      ],
      [
        "green",
        "blue",
        "blue",
        "orange"
      ],
      [
        "green",
        "yellow",
        "yellow",
        "red"
      ],
      [
        "cyan",
        "red",
        "yellow",
        "orange"
      ],
      [
        "blue",
        "red",
        "blue",
        "orange"
      ],
      [
        "cyan",
        "green",
        "red",
        "green"
      ],
      [],
      []
    ],
    "parMoves": 21,
    "rewardCoins": 150
  },
  {
    "levelNum": 18,
    "title": "Diamond Citadel",
    "difficultyLabel": "EXPERT",
    "capacity": 4,
    "bottles": [
      [
        "orange",
        "blue",
        "green",
        "yellow"
      ],
      [
        "green",
        "cyan",
        "yellow",
        "blue"
      ],
      [
        "blue",
        "yellow",
        "cyan",
        "red"
      ],
      [
        "red",
        "green",
        "orange",
        "green"
      ],
      [
        "orange",
        "red",
        "yellow",
        "red"
      ],
      [
        "cyan",
        "blue",
        "orange",
        "cyan"
      ],
      [],
      []
    ],
    "parMoves": 25,
    "rewardCoins": 150
  },
  {
    "levelNum": 19,
    "title": "Topaz Tower",
    "difficultyLabel": "EXPERT",
    "capacity": 4,
    "bottles": [
      [
        "cyan",
        "cyan",
        "yellow",
        "orange"
      ],
      [
        "orange",
        "red",
        "cyan",
        "blue"
      ],
      [
        "blue",
        "yellow",
        "green",
        "yellow"
      ],
      [
        "red",
        "blue",
        "red",
        "green"
      ],
      [
        "green",
        "red",
        "yellow",
        "cyan"
      ],
      [
        "orange",
        "blue",
        "green",
        "orange"
      ],
      [],
      []
    ],
    "parMoves": 24,
    "rewardCoins": 150
  },
  {
    "levelNum": 20,
    "title": "Majestic Colonnade",
    "difficultyLabel": "EXPERT",
    "capacity": 4,
    "bottles": [
      [
        "cyan",
        "green",
        "green",
        "cyan"
      ],
      [
        "green",
        "yellow",
        "red",
        "orange"
      ],
      [
        "blue",
        "blue",
        "red",
        "cyan"
      ],
      [
        "blue",
        "orange",
        "green",
        "orange"
      ],
      [
        "yellow",
        "cyan",
        "yellow",
        "orange"
      ],
      [
        "yellow",
        "red",
        "blue",
        "red"
      ],
      [],
      []
    ],
    "parMoves": 23,
    "rewardCoins": 150
  },
  {
    "levelNum": 21,
    "title": "The Grand Ballroom",
    "difficultyLabel": "EXPERT+",
    "capacity": 4,
    "bottles": [
      [
        "green",
        "purple",
        "yellow",
        "purple"
      ],
      [
        "cyan",
        "red",
        "orange",
        "orange"
      ],
      [
        "red",
        "blue",
        "red",
        "purple"
      ],
      [
        "orange",
        "green",
        "yellow",
        "orange"
      ],
      [
        "green",
        "purple",
        "cyan",
        "yellow"
      ],
      [
        "red",
        "cyan",
        "cyan",
        "blue"
      ],
      [
        "green",
        "yellow",
        "blue",
        "blue"
      ],
      [],
      []
    ],
    "parMoves": 28,
    "rewardCoins": 200
  },
  {
    "levelNum": 22,
    "title": "Crystal Fountain",
    "difficultyLabel": "EXPERT+",
    "capacity": 4,
    "bottles": [
      [
        "yellow",
        "green",
        "blue",
        "red"
      ],
      [
        "cyan",
        "orange",
        "yellow",
        "green"
      ],
      [
        "purple",
        "orange",
        "blue",
        "green"
      ],
      [
        "red",
        "red",
        "cyan",
        "purple"
      ],
      [
        "purple",
        "orange",
        "cyan",
        "orange"
      ],
      [
        "cyan",
        "blue",
        "yellow",
        "green"
      ],
      [
        "red",
        "blue",
        "purple",
        "yellow"
      ],
      [],
      []
    ],
    "parMoves": 29,
    "rewardCoins": 200
  },
  {
    "levelNum": 23,
    "title": "The Royal Library",
    "difficultyLabel": "EXPERT+",
    "capacity": 4,
    "bottles": [
      [
        "yellow",
        "blue",
        "red",
        "yellow"
      ],
      [
        "purple",
        "cyan",
        "red",
        "green"
      ],
      [
        "cyan",
        "orange",
        "cyan",
        "purple"
      ],
      [
        "orange",
        "purple",
        "cyan",
        "yellow"
      ],
      [
        "red",
        "green",
        "yellow",
        "blue"
      ],
      [
        "blue",
        "red",
        "purple",
        "orange"
      ],
      [
        "green",
        "green",
        "orange",
        "blue"
      ],
      [],
      []
    ],
    "parMoves": 28,
    "rewardCoins": 200
  },
  {
    "levelNum": 24,
    "title": "Imperial Treasury",
    "difficultyLabel": "EXPERT+",
    "capacity": 4,
    "bottles": [
      [
        "blue",
        "purple",
        "blue",
        "red"
      ],
      [
        "green",
        "yellow",
        "orange",
        "green"
      ],
      [
        "cyan",
        "blue",
        "red",
        "yellow"
      ],
      [
        "orange",
        "red",
        "cyan",
        "green"
      ],
      [
        "yellow",
        "blue",
        "purple",
        "orange"
      ],
      [
        "purple",
        "yellow",
        "cyan",
        "red"
      ],
      [
        "purple",
        "cyan",
        "green",
        "orange"
      ],
      [],
      []
    ],
    "parMoves": 29,
    "rewardCoins": 200
  },
  {
    "levelNum": 25,
    "title": "Coronation Hall",
    "difficultyLabel": "EXPERT+",
    "capacity": 4,
    "bottles": [
      [
        "purple",
        "blue",
        "red",
        "cyan"
      ],
      [
        "red",
        "blue",
        "blue",
        "red"
      ],
      [
        "green",
        "purple",
        "red",
        "orange"
      ],
      [
        "yellow",
        "green",
        "orange",
        "yellow"
      ],
      [
        "cyan",
        "orange",
        "green",
        "orange"
      ],
      [
        "blue",
        "yellow",
        "cyan",
        "purple"
      ],
      [
        "cyan",
        "green",
        "purple",
        "yellow"
      ],
      [],
      []
    ],
    "parMoves": 28,
    "rewardCoins": 200
  },
  {
    "levelNum": 26,
    "title": "Crown Solarium",
    "difficultyLabel": "EXPERT+",
    "capacity": 4,
    "bottles": [
      [
        "orange",
        "yellow",
        "orange",
        "orange"
      ],
      [
        "orange",
        "purple",
        "yellow",
        "green"
      ],
      [
        "blue",
        "red",
        "purple",
        "blue"
      ],
      [
        "red",
        "cyan",
        "green",
        "green"
      ],
      [
        "purple",
        "blue",
        "cyan",
        "red"
      ],
      [
        "yellow",
        "cyan",
        "green",
        "yellow"
      ],
      [
        "red",
        "purple",
        "blue",
        "cyan"
      ],
      [],
      []
    ],
    "parMoves": 26,
    "rewardCoins": 200
  },
  {
    "levelNum": 27,
    "title": "Starfire Bastion",
    "difficultyLabel": "EXPERT+",
    "capacity": 4,
    "bottles": [
      [
        "green",
        "green",
        "purple",
        "red"
      ],
      [
        "yellow",
        "purple",
        "blue",
        "purple"
      ],
      [
        "orange",
        "cyan",
        "red",
        "cyan"
      ],
      [
        "orange",
        "blue",
        "red",
        "yellow"
      ],
      [
        "green",
        "blue",
        "yellow",
        "orange"
      ],
      [
        "orange",
        "purple",
        "blue",
        "yellow"
      ],
      [
        "cyan",
        "red",
        "green",
        "cyan"
      ],
      [],
      []
    ],
    "parMoves": 30,
    "rewardCoins": 200
  },
  {
    "levelNum": 28,
    "title": "Astral Cloister",
    "difficultyLabel": "EXPERT+",
    "capacity": 4,
    "bottles": [
      [
        "purple",
        "cyan",
        "cyan",
        "yellow"
      ],
      [
        "green",
        "orange",
        "red",
        "blue"
      ],
      [
        "red",
        "green",
        "red",
        "yellow"
      ],
      [
        "red",
        "orange",
        "blue",
        "yellow"
      ],
      [
        "yellow",
        "orange",
        "blue",
        "orange"
      ],
      [
        "purple",
        "cyan",
        "purple",
        "green"
      ],
      [
        "green",
        "blue",
        "cyan",
        "purple"
      ],
      [],
      []
    ],
    "parMoves": 29,
    "rewardCoins": 200
  },
  {
    "levelNum": 29,
    "title": "Royal Menagerie",
    "difficultyLabel": "EXPERT+",
    "capacity": 4,
    "bottles": [
      [
        "cyan",
        "red",
        "green",
        "cyan"
      ],
      [
        "red",
        "red",
        "purple",
        "blue"
      ],
      [
        "blue",
        "green",
        "orange",
        "yellow"
      ],
      [
        "orange",
        "red",
        "purple",
        "green"
      ],
      [
        "orange",
        "blue",
        "purple",
        "yellow"
      ],
      [
        "blue",
        "purple",
        "cyan",
        "orange"
      ],
      [
        "green",
        "cyan",
        "yellow",
        "yellow"
      ],
      [],
      []
    ],
    "parMoves": 26,
    "rewardCoins": 200
  },
  {
    "levelNum": 30,
    "title": "Jeweled Sanctuary",
    "difficultyLabel": "EXPERT+",
    "capacity": 4,
    "bottles": [
      [
        "purple",
        "green",
        "red",
        "red"
      ],
      [
        "orange",
        "cyan",
        "cyan",
        "green"
      ],
      [
        "yellow",
        "cyan",
        "cyan",
        "green"
      ],
      [
        "purple",
        "blue",
        "yellow",
        "blue"
      ],
      [
        "orange",
        "green",
        "red",
        "purple"
      ],
      [
        "purple",
        "blue",
        "yellow",
        "orange"
      ],
      [
        "blue",
        "red",
        "yellow",
        "orange"
      ],
      [],
      []
    ],
    "parMoves": 26,
    "rewardCoins": 200
  },
  {
    "levelNum": 31,
    "title": "Citadel of Light",
    "difficultyLabel": "EXTREME",
    "capacity": 4,
    "bottles": [
      [
        "orange",
        "red",
        "green",
        "cyan"
      ],
      [
        "cyan",
        "pink",
        "blue",
        "blue"
      ],
      [
        "orange",
        "yellow",
        "green",
        "red"
      ],
      [
        "purple",
        "cyan",
        "red",
        "yellow"
      ],
      [
        "pink",
        "cyan",
        "orange",
        "pink"
      ],
      [
        "blue",
        "orange",
        "purple",
        "red"
      ],
      [
        "yellow",
        "green",
        "pink",
        "green"
      ],
      [
        "blue",
        "yellow",
        "purple",
        "purple"
      ],
      [],
      []
    ],
    "parMoves": 31,
    "rewardCoins": 250
  },
  {
    "levelNum": 32,
    "title": "Tower of Whispers",
    "difficultyLabel": "EXTREME",
    "capacity": 4,
    "bottles": [
      [
        "blue",
        "green",
        "orange",
        "pink"
      ],
      [
        "orange",
        "yellow",
        "purple",
        "yellow"
      ],
      [
        "green",
        "cyan",
        "red",
        "pink"
      ],
      [
        "purple",
        "green",
        "purple",
        "cyan"
      ],
      [
        "orange",
        "red",
        "cyan",
        "blue"
      ],
      [
        "yellow",
        "green",
        "red",
        "red"
      ],
      [
        "blue",
        "cyan",
        "purple",
        "blue"
      ],
      [
        "orange",
        "yellow",
        "pink",
        "pink"
      ],
      [],
      []
    ],
    "parMoves": 31,
    "rewardCoins": 250
  },
  {
    "levelNum": 33,
    "title": "Chamber of Shadows",
    "difficultyLabel": "EXTREME",
    "capacity": 4,
    "bottles": [
      [
        "blue",
        "yellow",
        "yellow",
        "orange"
      ],
      [
        "blue",
        "red",
        "pink",
        "green"
      ],
      [
        "orange",
        "red",
        "purple",
        "cyan"
      ],
      [
        "blue",
        "purple",
        "red",
        "pink"
      ],
      [
        "purple",
        "purple",
        "orange",
        "green"
      ],
      [
        "orange",
        "yellow",
        "cyan",
        "green"
      ],
      [
        "pink",
        "blue",
        "red",
        "yellow"
      ],
      [
        "green",
        "cyan",
        "cyan",
        "pink"
      ],
      [],
      []
    ],
    "parMoves": 31,
    "rewardCoins": 250
  },
  {
    "levelNum": 34,
    "title": "Dragon Glass Hall",
    "difficultyLabel": "EXTREME",
    "capacity": 4,
    "bottles": [
      [
        "yellow",
        "pink",
        "green",
        "orange"
      ],
      [
        "red",
        "red",
        "pink",
        "cyan"
      ],
      [
        "red",
        "green",
        "cyan",
        "purple"
      ],
      [
        "purple",
        "blue",
        "green",
        "yellow"
      ],
      [
        "pink",
        "blue",
        "orange",
        "cyan"
      ],
      [
        "purple",
        "green",
        "red",
        "blue"
      ],
      [
        "orange",
        "orange",
        "yellow",
        "purple"
      ],
      [
        "cyan",
        "pink",
        "yellow",
        "blue"
      ],
      [],
      []
    ],
    "parMoves": 31,
    "rewardCoins": 250
  },
  {
    "levelNum": 35,
    "title": "Crown Labyrinth",
    "difficultyLabel": "EXTREME",
    "capacity": 4,
    "bottles": [
      [
        "green",
        "cyan",
        "orange",
        "green"
      ],
      [
        "purple",
        "purple",
        "pink",
        "pink"
      ],
      [
        "red",
        "red",
        "orange",
        "pink"
      ],
      [
        "purple",
        "yellow",
        "blue",
        "cyan"
      ],
      [
        "yellow",
        "yellow",
        "purple",
        "red"
      ],
      [
        "cyan",
        "green",
        "red",
        "blue"
      ],
      [
        "pink",
        "cyan",
        "green",
        "blue"
      ],
      [
        "orange",
        "yellow",
        "blue",
        "orange"
      ],
      [],
      []
    ],
    "parMoves": 28,
    "rewardCoins": 250
  },
  {
    "levelNum": 36,
    "title": "Throne of Eternity",
    "difficultyLabel": "EXTREME",
    "capacity": 4,
    "bottles": [
      [
        "red",
        "green",
        "green",
        "purple"
      ],
      [
        "red",
        "cyan",
        "purple",
        "orange"
      ],
      [
        "orange",
        "cyan",
        "pink",
        "pink"
      ],
      [
        "yellow",
        "blue",
        "pink",
        "blue"
      ],
      [
        "purple",
        "cyan",
        "yellow",
        "green"
      ],
      [
        "pink",
        "yellow",
        "cyan",
        "purple"
      ],
      [
        "yellow",
        "blue",
        "red",
        "orange"
      ],
      [
        "red",
        "green",
        "blue",
        "orange"
      ],
      [],
      []
    ],
    "parMoves": 33,
    "rewardCoins": 250
  },
  {
    "levelNum": 37,
    "title": "Imperial Apex",
    "difficultyLabel": "EXTREME",
    "capacity": 4,
    "bottles": [
      [
        "green",
        "cyan",
        "pink",
        "red"
      ],
      [
        "orange",
        "pink",
        "green",
        "red"
      ],
      [
        "yellow",
        "blue",
        "yellow",
        "blue"
      ],
      [
        "cyan",
        "blue",
        "orange",
        "purple"
      ],
      [
        "orange",
        "pink",
        "orange",
        "pink"
      ],
      [
        "yellow",
        "yellow",
        "red",
        "purple"
      ],
      [
        "cyan",
        "purple",
        "cyan",
        "red"
      ],
      [
        "green",
        "green",
        "purple",
        "blue"
      ],
      [],
      []
    ],
    "parMoves": 33,
    "rewardCoins": 250
  },
  {
    "levelNum": 38,
    "title": "Prismatic Nexus",
    "difficultyLabel": "EXTREME",
    "capacity": 4,
    "bottles": [
      [
        "blue",
        "pink",
        "purple",
        "purple"
      ],
      [
        "yellow",
        "orange",
        "green",
        "red"
      ],
      [
        "red",
        "blue",
        "orange",
        "blue"
      ],
      [
        "yellow",
        "green",
        "pink",
        "yellow"
      ],
      [
        "green",
        "red",
        "cyan",
        "cyan"
      ],
      [
        "blue",
        "cyan",
        "orange",
        "pink"
      ],
      [
        "cyan",
        "purple",
        "green",
        "orange"
      ],
      [
        "pink",
        "yellow",
        "purple",
        "red"
      ],
      [],
      []
    ],
    "parMoves": 30,
    "rewardCoins": 250
  },
  {
    "levelNum": 39,
    "title": "Sovereign Eclipse",
    "difficultyLabel": "EXTREME",
    "capacity": 4,
    "bottles": [
      [
        "green",
        "orange",
        "yellow",
        "green"
      ],
      [
        "purple",
        "yellow",
        "blue",
        "pink"
      ],
      [
        "orange",
        "blue",
        "cyan",
        "red"
      ],
      [
        "cyan",
        "purple",
        "green",
        "red"
      ],
      [
        "cyan",
        "yellow",
        "orange",
        "purple"
      ],
      [
        "blue",
        "red",
        "red",
        "orange"
      ],
      [
        "pink",
        "green",
        "cyan",
        "blue"
      ],
      [
        "purple",
        "pink",
        "pink",
        "yellow"
      ],
      [],
      []
    ],
    "parMoves": 30,
    "rewardCoins": 250
  },
  {
    "levelNum": 40,
    "title": "The Royal Master Final",
    "difficultyLabel": "MASTER / FINAL CHALLENGE",
    "capacity": 4,
    "bottles": [
      [
        "blue",
        "cyan",
        "yellow",
        "purple"
      ],
      [
        "green",
        "orange",
        "red",
        "orange"
      ],
      [
        "purple",
        "green",
        "orange",
        "pink"
      ],
      [
        "red",
        "cyan",
        "blue",
        "yellow"
      ],
      [
        "green",
        "red",
        "pink",
        "purple"
      ],
      [
        "blue",
        "red",
        "purple",
        "yellow"
      ],
      [
        "blue",
        "cyan",
        "green",
        "pink"
      ],
      [
        "yellow",
        "pink",
        "orange",
        "cyan"
      ],
      [],
      []
    ],
    "parMoves": 34,
    "rewardCoins": 500
  }
];
