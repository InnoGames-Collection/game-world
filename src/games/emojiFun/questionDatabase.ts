/**
 * Emoji Fun — 40 Levels & 400+ Unique Questions Database
 * Tournament-grade structured question database covering 15 question types
 */

import { EmojiQuestion, EmojiLevelConfig } from './types';

export const LEVEL_CONFIGS: EmojiLevelConfig[] = [
  { level: 1, title: 'Emoji Basics', difficultyStars: 1, timeLimitSeconds: 15, targetScore: 1200, questionCount: 10, theme: 'Easy Recognition', rewardCoins: 10, scoreMultiplier: 1.0 },
  { level: 2, title: 'Happy Faces', difficultyStars: 1, timeLimitSeconds: 15, targetScore: 1250, questionCount: 10, theme: 'Smiles & Gestures', rewardCoins: 10, scoreMultiplier: 1.0 },
  { level: 3, title: 'Animal Friends', difficultyStars: 1, timeLimitSeconds: 15, targetScore: 1300, questionCount: 10, theme: 'Wild & Pets', rewardCoins: 10, scoreMultiplier: 1.0 },
  { level: 4, title: 'Tasty Treats', difficultyStars: 1, timeLimitSeconds: 15, targetScore: 1350, questionCount: 10, theme: 'Snacks & Fruits', rewardCoins: 10, scoreMultiplier: 1.0 },
  { level: 5, title: 'Simple Mix', difficultyStars: 1, timeLimitSeconds: 15, targetScore: 1400, questionCount: 10, theme: 'Basic Pairs', rewardCoins: 10, scoreMultiplier: 1.0 },
  { level: 6, title: 'Love & Hearts', difficultyStars: 2, timeLimitSeconds: 14, targetScore: 1500, questionCount: 10, theme: 'Feelings', rewardCoins: 12, scoreMultiplier: 1.1 },
  { level: 7, title: 'Emoji Pairs', difficultyStars: 2, timeLimitSeconds: 14, targetScore: 1550, questionCount: 10, theme: 'Combinations', rewardCoins: 12, scoreMultiplier: 1.1 },
  { level: 8, title: 'Guess the Meal', difficultyStars: 2, timeLimitSeconds: 14, targetScore: 1600, questionCount: 10, theme: 'Food Combos', rewardCoins: 12, scoreMultiplier: 1.1 },
  { level: 9, title: 'Daily Life', difficultyStars: 2, timeLimitSeconds: 13, targetScore: 1650, questionCount: 10, theme: 'Everyday Actions', rewardCoins: 12, scoreMultiplier: 1.1 },
  { level: 10, title: 'Movie Night I', difficultyStars: 2, timeLimitSeconds: 13, targetScore: 1700, questionCount: 10, theme: 'Famous Movies', rewardCoins: 12, scoreMultiplier: 1.1 },
  { level: 11, title: 'Odd One Out I', difficultyStars: 2, timeLimitSeconds: 13, targetScore: 1750, questionCount: 10, theme: 'Spot the Difference', rewardCoins: 15, scoreMultiplier: 1.2 },
  { level: 12, title: 'Category Clash', difficultyStars: 3, timeLimitSeconds: 12, targetScore: 1850, questionCount: 10, theme: 'Not Belonging', rewardCoins: 15, scoreMultiplier: 1.2 },
  { level: 13, title: 'Sports Center', difficultyStars: 3, timeLimitSeconds: 12, targetScore: 1900, questionCount: 10, theme: 'Games & Athletics', rewardCoins: 15, scoreMultiplier: 1.2 },
  { level: 14, title: 'Travel Clues', difficultyStars: 3, timeLimitSeconds: 12, targetScore: 1950, questionCount: 10, theme: 'Vehicles & Journeys', rewardCoins: 15, scoreMultiplier: 1.2 },
  { level: 15, title: 'World Places I', difficultyStars: 3, timeLimitSeconds: 12, targetScore: 2000, questionCount: 10, theme: 'Countries & Landmarks', rewardCoins: 15, scoreMultiplier: 1.2 },
  { level: 16, title: 'Emoji Sequence I', difficultyStars: 3, timeLimitSeconds: 11, targetScore: 2100, questionCount: 10, theme: 'Logical Patterns', rewardCoins: 18, scoreMultiplier: 1.3 },
  { level: 17, title: 'Memory Flash I', difficultyStars: 3, timeLimitSeconds: 11, targetScore: 2150, questionCount: 10, theme: 'Visual Recall', rewardCoins: 18, scoreMultiplier: 1.3 },
  { level: 18, title: 'Movie Night II', difficultyStars: 3, timeLimitSeconds: 11, targetScore: 2200, questionCount: 10, theme: 'Blockbusters', rewardCoins: 18, scoreMultiplier: 1.3 },
  { level: 19, title: 'Common Sayings', difficultyStars: 3, timeLimitSeconds: 11, targetScore: 2250, questionCount: 10, theme: 'Phrases & Idioms', rewardCoins: 18, scoreMultiplier: 1.3 },
  { level: 20, title: 'Midway Tournament', difficultyStars: 3, timeLimitSeconds: 11, targetScore: 2350, questionCount: 10, theme: 'Championship Trial', rewardCoins: 20, scoreMultiplier: 1.3 },
  { level: 21, title: 'Odd One Out II', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 2450, questionCount: 10, theme: 'Micro-Differences', rewardCoins: 20, scoreMultiplier: 1.4 },
  { level: 22, title: 'Music & Songs', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 2500, questionCount: 10, theme: 'Hit Titles', rewardCoins: 20, scoreMultiplier: 1.4 },
  { level: 23, title: 'Nature & Cosmos', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 2550, questionCount: 10, theme: 'Planets & Earth', rewardCoins: 20, scoreMultiplier: 1.4 },
  { level: 24, title: 'Speed Round I', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 2600, questionCount: 10, theme: 'Rapid Reflex', rewardCoins: 20, scoreMultiplier: 1.4 },
  { level: 25, title: 'World Places II', difficultyStars: 4, timeLimitSeconds: 10, targetScore: 2700, questionCount: 10, theme: 'Cities & Cultures', rewardCoins: 20, scoreMultiplier: 1.4 },
  { level: 26, title: 'Memory Flash II', difficultyStars: 4, timeLimitSeconds: 9, targetScore: 2800, questionCount: 10, theme: 'Multi-Symbol Recall', rewardCoins: 25, scoreMultiplier: 1.5 },
  { level: 27, title: 'Emoji Sequence II', difficultyStars: 4, timeLimitSeconds: 9, targetScore: 2850, questionCount: 10, theme: 'Evolution Cycles', rewardCoins: 25, scoreMultiplier: 1.5 },
  { level: 28, title: 'Fantasy & Magic', difficultyStars: 4, timeLimitSeconds: 9, targetScore: 2900, questionCount: 10, theme: 'Mythical Legends', rewardCoins: 25, scoreMultiplier: 1.5 },
  { level: 29, title: 'Foodies Deluxe', difficultyStars: 4, timeLimitSeconds: 9, targetScore: 2950, questionCount: 10, theme: 'Global Dishes', rewardCoins: 25, scoreMultiplier: 1.5 },
  { level: 30, title: 'Speed Round II', difficultyStars: 4, timeLimitSeconds: 9, targetScore: 3050, questionCount: 10, theme: 'Fast Deciders', rewardCoins: 25, scoreMultiplier: 1.5 },
  { level: 31, title: 'Tricky Idioms', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 3200, questionCount: 10, theme: 'Abstract Phrases', rewardCoins: 30, scoreMultiplier: 1.6 },
  { level: 32, title: 'Cinema Legends', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 3250, questionCount: 10, theme: 'Classic Films', rewardCoins: 30, scoreMultiplier: 1.6 },
  { level: 33, title: 'Odd One Out III', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 3300, questionCount: 10, theme: 'Master Imposters', rewardCoins: 30, scoreMultiplier: 1.6 },
  { level: 34, title: 'Tech & Modern Life', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 3350, questionCount: 10, theme: 'Gadgets & Apps', rewardCoins: 30, scoreMultiplier: 1.6 },
  { level: 35, title: 'Memory Grandmaster', difficultyStars: 5, timeLimitSeconds: 8, targetScore: 3400, questionCount: 10, theme: 'High-Density Recall', rewardCoins: 30, scoreMultiplier: 1.6 },
  { level: 36, title: 'Grand Combinations', difficultyStars: 5, timeLimitSeconds: 7, targetScore: 3550, questionCount: 10, theme: 'Multi-Emoji Riddles', rewardCoins: 35, scoreMultiplier: 1.8 },
  { level: 37, title: 'Global Odyssey', difficultyStars: 5, timeLimitSeconds: 7, targetScore: 3600, questionCount: 10, theme: 'Geographic Puzzles', rewardCoins: 35, scoreMultiplier: 1.8 },
  { level: 38, title: 'Sequence Mastery', difficultyStars: 5, timeLimitSeconds: 7, targetScore: 3650, questionCount: 10, theme: 'Complex Patterns', rewardCoins: 35, scoreMultiplier: 1.8 },
  { level: 39, title: 'Lightning Round', difficultyStars: 5, timeLimitSeconds: 7, targetScore: 3750, questionCount: 10, theme: 'Speed Tournament', rewardCoins: 35, scoreMultiplier: 1.8 },
  { level: 40, title: 'Tournament Championship', difficultyStars: 5, timeLimitSeconds: 7, targetScore: 3900, questionCount: 10, theme: 'Ultimate Finals', rewardCoins: 50, scoreMultiplier: 2.0 },
];

/**
 * Raw definitions for all 40 levels (10 questions each = 400 questions total)
 */
interface RawQ {
  type: EmojiQuestion['type'];
  prompt: string;
  display: string;
  memoryEmojis?: string[];
  options: [string, string, string, string];
  correctIndex: number;
  explanation?: string;
  points?: number;
}

const LEVEL_QUESTIONS_DATA: Record<number, RawQ[]> = {
  // LEVEL 1: Basics (Easy Meaning & Faces)
  1: [
    { type: 'EMOJI_MEANING', prompt: 'What does this emoji commonly express?', display: '😂', options: ['Crying in sadness', 'Tears of joy / Laughing', 'Sleeping soundly', 'Angry scream'], correctIndex: 1, explanation: 'Face with Tears of Joy represents hearty laughing!' },
    { type: 'EMOJI_MEANING', prompt: 'Identify the emotion shown:', display: '😍', options: ['In love / Adoration', 'Feeling dizzy', 'Surprised', 'Bored'], correctIndex: 0, explanation: 'Smiling Face with Heart-Eyes represents love and adoration.' },
    { type: 'EMOJI_MEANING', prompt: 'What gesture does this hand show?', display: '👍', options: ['Dislike', 'Thumbs Down', 'Thumbs Up / Approval', 'Point Up'], correctIndex: 2, explanation: 'Thumbs up signifies approval, agreement or a job well done.' },
    { type: 'EMOJI_MEANING', prompt: 'What is this face thinking?', display: '🤔', options: ['Singing', 'Thinking / Pondering', 'Yawning', 'Screaming'], correctIndex: 1, explanation: 'Thinking Face shows deep thought, skepticism, or pondering.' },
    { type: 'EMOJI_MEANING', prompt: 'What does this emoji signify?', display: '🔥', options: ['Freezing cold', 'Lit / Fire / Trending', 'Water droplet', 'Earthquake'], correctIndex: 1, explanation: 'Fire emoji commonly means cool, trending, or lit!' },
    { type: 'EMOJI_MEANING', prompt: 'Identify the emoji:', display: '😎', options: ['Sunglasses / Cool', 'Blindfolded', 'Reading glasses', 'Crying face'], correctIndex: 0, explanation: 'Smiling face with sunglasses indicates confidence and being cool.' },
    { type: 'EMOJI_MEANING', prompt: 'What feeling is shown here?', display: '😴', options: ['Angry', 'Sleeping / Tired', 'Hungry', 'Scared'], correctIndex: 1, explanation: 'Sleeping face with Zzz shows deep slumber or exhaustion.' },
    { type: 'EMOJI_MEANING', prompt: 'What does this gesture mean?', display: '👏', options: ['Punching', 'Clapping / Applause', 'Waving', 'Praying'], correctIndex: 1, explanation: 'Clapping hands signify celebration, congratulations, or applause.' },
    { type: 'EMOJI_MEANING', prompt: 'What does this celebration emoji express?', display: '🥳', options: ['Bored', 'Partying / Celebrating', 'Freezing', 'Confused'], correctIndex: 1, explanation: 'Partying face with noisemaker and party hat represents celebrations!' },
    { type: 'EMOJI_MEANING', prompt: 'What is this sweet treat?', display: '🍦', options: ['Ice cream cone', 'Hot soup', 'Coffee cup', 'Salad bowl'], correctIndex: 0, explanation: 'Soft serve ice cream in a crispy wafer cone.' },
  ],

  // LEVEL 2: Happy Faces & Gestures
  2: [
    { type: 'EMOJI_MEANING', prompt: 'What does this wink mean?', display: '😉', options: ['Angry glare', 'Playful wink / Joke', 'Crying in fear', 'Sleeping'], correctIndex: 1 },
    { type: 'EMOJI_MEANING', prompt: 'What does this silly face mean?', display: '🤪', options: ['Serious debate', 'Goofy / Crazy fun', 'Sad disappointment', 'Feeling sick'], correctIndex: 1 },
    { type: 'EMOJI_MEANING', prompt: 'Identify this gesture:', display: '👋', options: ['Punching', 'Waving hello or goodbye', 'High five', 'Fist bump'], correctIndex: 1 },
    { type: 'EMOJI_MEANING', prompt: 'What does this hand symbol mean?', display: '✌️', options: ['Stop sign', 'Victory / Peace', 'Call me', 'Pointing down'], correctIndex: 1 },
    { type: 'EMOJI_MEANING', prompt: 'What does this face convey?', display: '🤗', options: ['Hugging / Warm welcome', 'Pushing away', 'Hiding face', 'Sleeping'], correctIndex: 0 },
    { type: 'EMOJI_MEANING', prompt: 'What does the halo represent?', display: '😇', options: ['Innocent / Angelic', 'Angry devil', 'Guilty thief', 'Sleepy baby'], correctIndex: 0 },
    { type: 'EMOJI_MEANING', prompt: 'What does this muscle mean?', display: '💪', options: ['Weakness', 'Flexed bicep / Strength', 'Broken arm', 'Handshake'], correctIndex: 1 },
    { type: 'EMOJI_MEANING', prompt: 'What does this sign symbolize?', display: '🤞', options: ['Crossed fingers / Good luck', 'Thumbs down', 'Pointing left', 'Clapping'], correctIndex: 0 },
    { type: 'EMOJI_MEANING', prompt: 'Identify this sweet emoji:', display: '🥰', options: ['Adored / Loved up', 'Furious', 'Hungry', 'Freezing cold'], correctIndex: 0 },
    { type: 'EMOJI_MEANING', prompt: 'What is this gesture?', display: '🤝', options: ['Fight', 'Handshake / Agreement', 'Wave', 'Fist bump'], correctIndex: 1 },
  ],

  // LEVEL 3: Animal Friends
  3: [
    { type: 'GUESS_ANIMAL', prompt: 'Which animal is this?', display: '🦁', options: ['Tiger', 'Lion', 'Bear', 'Cheetah'], correctIndex: 1 },
    { type: 'GUESS_ANIMAL', prompt: 'Identify the creature:', display: '🐼', options: ['Giant Panda', 'Polar Bear', 'Koala', 'Racoon'], correctIndex: 0 },
    { type: 'GUESS_ANIMAL', prompt: 'Which wild cat is this?', display: '🐯', options: ['Leopard', 'Tiger Face', 'Cat', 'Fox'], correctIndex: 1 },
    { type: 'GUESS_ANIMAL', prompt: 'Identify this playful pet:', display: '🐶', options: ['Puppy / Dog', 'Wolf', 'Fox', 'Cat'], correctIndex: 0 },
    { type: 'GUESS_ANIMAL', prompt: 'Which bird is known for wisdom?', display: '🦉', options: ['Eagle', 'Owl', 'Parrot', 'Penguin'], correctIndex: 1 },
    { type: 'GUESS_ANIMAL', prompt: 'Which creature hops around Australia?', display: '🦘', options: ['Kangaroo', 'Camel', 'Horse', 'Rabbit'], correctIndex: 0 },
    { type: 'GUESS_ANIMAL', prompt: 'Identify this tall animal:', display: '🦒', options: ['Zebra', 'Giraffe', 'Elephant', 'Llama'], correctIndex: 1 },
    { type: 'GUESS_ANIMAL', prompt: 'Which water mammal loves to leap?', display: '🐬', options: ['Shark', 'Dolphin', 'Whale', 'Octopus'], correctIndex: 1 },
    { type: 'GUESS_ANIMAL', prompt: 'Which bird cannot fly and loves snow?', display: '🐧', options: ['Penguin', 'Duck', 'Flamingo', 'Goose'], correctIndex: 0 },
    { type: 'GUESS_ANIMAL', prompt: 'Identify the amphibian:', display: '🐸', options: ['Frog', 'Lizard', 'Turtle', 'Snake'], correctIndex: 0 },
  ],

  // LEVEL 4: Tasty Treats
  4: [
    { type: 'GUESS_FOOD', prompt: 'Identify this Italian favorite:', display: '🍕', options: ['Burger', 'Pizza slice', 'Taco', 'Pancake'], correctIndex: 1 },
    { type: 'GUESS_FOOD', prompt: 'What meal is this?', display: '🍔', options: ['Cheeseburger', 'Hot dog', 'Sandwich', 'Bao'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'Identify this crunchy snack:', display: '🍟', options: ['French Fries', 'Nachos', 'Pretzel', 'Popcorn'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'Which fruit is this juicy red berry?', display: '🍓', options: ['Cherry', 'Strawberry', 'Watermelon', 'Apple'], correctIndex: 1 },
    { type: 'GUESS_FOOD', prompt: 'Identify this sweet ring with sprinkles:', display: '🍩', options: ['Donut', 'Bagel', 'Cookie', 'Cake'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'What Mexican street food is this?', display: '🌮', options: ['Burrito', 'Taco', 'Tamale', 'Falafel'], correctIndex: 1 },
    { type: 'GUESS_FOOD', prompt: 'Which fruit has sweet yellow flesh?', display: '🍌', options: ['Banana', 'Lemon', 'Mango', 'Pineapple'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'What Asian dish is served in rolls?', display: '🍣', options: ['Sushi', 'Dumpling', 'Ramen', 'Curry'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'What warm beverage has steam rising?', display: '☕', options: ['Hot Coffee / Tea', 'Soda', 'Cocktail', 'Milk'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'Identify this celebration dessert:', display: '🎂', options: ['Birthday Cake', 'Cupcake', 'Ice cream', 'Pie'], correctIndex: 0 },
  ],

  // LEVEL 5: Basic Pairs & Combinations
  5: [
    { type: 'EMOJI_COMBINATION', prompt: 'What does this combination suggest?', display: '🍕 + ❤️', options: ['I love pizza', 'Pizza delivery delayed', 'Burnt pizza', 'Cold leftovers'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What does this combo mean?', display: '🔥 + 🏃', options: ['Running fast / On fire', 'Campfire story', 'Fire drill walk', 'Sleeping athlete'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Guess the activity:', display: '🍿 + 🎬', options: ['Cooking dinner', 'Movie night at the cinema', 'Reading a book', 'Going shopping'], correctIndex: 1 },
    { type: 'EMOJI_COMBINATION', prompt: 'What does this suggest?', display: '🌧️ + ☔', options: ['Sunny beach day', 'Rainy day with umbrella', 'Snowstorm', 'Desert road'], correctIndex: 1 },
    { type: 'EMOJI_COMBINATION', prompt: 'What is represented here?', display: '☕ + 🥐', options: ['French breakfast (Coffee & Croissant)', 'Lunch steak', 'Late night drinks', 'Gym workout'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Guess the combo:', display: '🐶 + 🦴', options: ['Dog with bone', 'Cat chasing mouse', 'Fish swimming', 'Bird flying'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What does this combo mean?', display: '✈️ + 🏖️', options: ['Working at office', 'Beach vacation trip', 'Mountain climbing', 'Car repair'], correctIndex: 1 },
    { type: 'EMOJI_COMBINATION', prompt: 'Identify this celebration:', display: '🎂 + 🎈', options: ['Birthday party', 'Camping trip', 'Exam day', 'Doctor visit'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What does this pair represent?', display: '📱 + 💬', options: ['Text messaging', 'Broken screen', 'Listening to radio', 'Camera film'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Guess this combination:', display: '⚽ + 🥅', options: ['Soccer goal!', 'Basketball dunk', 'Tennis serve', 'Golf birdie'], correctIndex: 0 },
  ],

  // LEVEL 6: Love & Hearts
  6: [
    { type: 'EMOJI_MEANING', prompt: 'What does the broken heart signify?', display: '💔', options: ['Heartbreak / Sadness', 'True love', 'Heart surgery', 'Gift of love'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Guess the phrase:', display: '🔥 + ❤️', options: ['Burning love / Passion', 'Heartburn medicine', 'Fire fighter', 'Cold romance'], correctIndex: 0 },
    { type: 'EMOJI_MEANING', prompt: 'What does this heart with arrow represent?', display: '💘', options: ['Shot by Cupid / Struck by love', 'Broken heart', 'Heart attack', 'Hospital care'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What does this combo suggest?', display: '👀 + ❤️', options: ['Love at first sight', 'Eye doctor visit', 'Blind date', 'Watching TV'], correctIndex: 0 },
    { type: 'EMOJI_MEANING', prompt: 'What does the yellow heart commonly symbolize?', display: '💛', options: ['Jealousy', 'Warm friendship & happiness', 'Danger', 'Traffic signal'], correctIndex: 1 },
    { type: 'EMOJI_COMBINATION', prompt: 'What does this cute pair mean?', display: '💌 + 🌹', options: ['Love letter with a rose', 'Bill payment notice', 'Garden cleanup', 'Library book'], correctIndex: 0 },
    { type: 'EMOJI_MEANING', prompt: 'What do two pink hearts floating mean?', display: '💕', options: ['Love is in the air', 'Two enemies', 'Broken promise', 'Heavy lifting'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Guess the romantic theme:', display: '💍 + 👰', options: ['Wedding / Marriage proposal', 'Jewelry store heist', 'Single life', 'Party dress'], correctIndex: 0 },
    { type: 'EMOJI_MEANING', prompt: 'What does the heart with ribbon represent?', display: '💝', options: ['Heart as a gift / Box of chocolates', 'Medical prescription', 'Post office stamp', 'Trophy'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Guess the idiom:', display: '🔒 + ❤️', options: ['Locked heart / Love locked', 'Broken padlock', 'Security vault', 'Password reset'], correctIndex: 0 },
  ],

  // LEVEL 7: Emoji Pairs & Clues
  7: [
    { type: 'EMOJI_COMBINATION', prompt: 'Identify the weather event:', display: '⚡ + ⛈️', options: ['Gentle drizzle', 'Thunderstorm with lightning', 'Blizzard', 'Rainbow sunset'], correctIndex: 1 },
    { type: 'EMOJI_COMBINATION', prompt: 'What does this duo represent?', display: '🎮 + 🕹️', options: ['Video gaming session', 'Board game', 'Watching news', 'Writing code'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Identify the activity:', display: '🏊 + 🌊', options: ['Ocean swimming', 'Skiing down mountain', 'Rock climbing', 'Desert marathon'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Guess the concept:', display: '⏰ + 🏃', options: ['Running out of time / In a rush', 'Sleeping in late', 'Broken watch', 'Slow stroll'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What is shown here?', display: '🌙 + ⭐', options: ['Night sky / Starlit night', 'Sunrise dawn', 'Noon sunshine', 'Foggy afternoon'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What does this suggest?', display: '🎧 + 🎵', options: ['Listening to music', 'Making phone call', 'Reading audio book', 'Watching silent film'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Identify the hobby:', display: '🎣 + 🐟', options: ['Fishing', 'Deep sea diving', 'Fish market shopping', 'Aquarium cleaner'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What does this combo mean?', display: '👶 + 🍼', options: ['Baby feeding time', 'School graduation', 'Retirement home', 'Office worker'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Guess the profession:', display: '👨‍🍳 + 🍳', options: ['Chef cooking in kitchen', 'Doctor in hospital', 'Pilot flying plane', 'Firefighter'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What does this mean?', display: '🚗 + ⛽', options: ['Refueling at gas station', 'Washing the car', 'Buying a car', 'Flat tire'], correctIndex: 0 },
  ],

  // LEVEL 8: Guess the Meal
  8: [
    { type: 'GUESS_FOOD', prompt: 'What classic fast food combo is this?', display: '🍔 + 🍟 + 🥤', options: ['Burger, fries & soda combo', 'Sushi set meal', 'Pancake breakfast', 'Fruit salad plate'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'What breakfast dish is represented?', display: '🥞 + 🍯 + 🥓', options: ['Pancakes with syrup & bacon', 'Steak dinner', 'Spaghetti bolognese', 'Taco fiesta'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'Identify this Italian meal:', display: '🍝 + 🍅 + 🧀', options: ['Pasta with tomato & parmesan', 'Fish and chips', 'Hamburger with pickles', 'Rice bowl'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'What Japanese favorite is this?', display: '🍜 + 🥚 + 🥢', options: ['Ramen noodles with egg & chopsticks', 'Fried rice', 'Pizza slice', 'Curry bread'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'What afternoon snack is this?', display: '☕ + 🍩', options: ['Coffee & Donut break', 'Wine & Cheese', 'Soup & Crackers', 'Beer & Peanuts'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'Identify this cinema treat:', display: '🍿 + 🥤', options: ['Popcorn and soda', 'Salad and water', 'Burger and shake', 'Tea and biscuit'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'What healthy morning dish is this?', display: '🥣 + 🥛 + 🍓', options: ['Cereal bowl with milk & strawberries', 'Steak with potatoes', 'Fried chicken', 'Spicy hot pot'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'What Mexican meal is shown?', display: '🌮 + 🥑 + 🌶️', options: ['Spicy Guacamole Taco', 'Greek Gyro', 'French Crepe', 'Chinese Dumpling'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'What sweet treat is this?', display: '🍨 + 🍒', options: ['Ice cream sundae with a cherry', 'Fruit cocktail', 'Yogurt bowl', 'Frozen smoothie'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'Identify this barbecue favorite:', display: '🌭 + 🧅', options: ['Hot dog with onions', 'Beef burger', 'Roast turkey', 'Pork chop'], correctIndex: 0 },
  ],

  // LEVEL 9: Daily Life & Actions
  9: [
    { type: 'EMOJI_COMBINATION', prompt: 'What routine is this?', display: '🛏️ + ⏰ + 🥱', options: ['Waking up in the morning', 'Going to the gym', 'Cooking dinner', 'Taking an exam'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Identify the chore:', display: '🧺 + 👕 + 🧼', options: ['Doing the laundry', 'Grocery shopping', 'Car washing', 'Gardening'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What is happening here?', display: '🛒 + 🥦 + 🍎', options: ['Grocery shopping for fresh produce', 'Cooking soup', 'Harvesting wheat', 'Eating fast food'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Guess this hobby:', display: '📖 + 👓 + ☕', options: ['Reading a book with coffee', 'Watching football', 'Skateboarding', 'Rock concert'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Identify this commute:', display: '🚇 + 💼 + 🏙️', options: ['Commuting to office in the city', 'Going camping in woods', 'Flight to island', 'Bicycle race'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What activity is this?', display: '🏋️ + 💧 + 🎵', options: ['Gym workout session', 'Taking an afternoon nap', 'Painting a canvas', 'Baking cookies'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Identify this moment:', display: '🎂 + 🎁 + 🎉', options: ['Birthday celebration!', 'Office meeting', 'Doctor checkup', 'Flight boarding'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What does this trio suggest?', display: '🐕 + 🦮 + 🌳', options: ['Walking the dog in the park', 'Hunting in the jungle', 'Veterinary surgery', 'Pet grooming salon'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Guess the bedtime habit:', display: '🚿 + 🪥 + 🛌', options: ['Night bedtime routine', 'Morning exercise', 'Cooking breakfast', 'Swimming lesson'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What does this combo mean?', display: '🎒 + 🚌 + 🏫', options: ['Going to school by bus', 'Going to university graduation', 'Road trip vacation', 'Shopping mall trip'], correctIndex: 0 },
  ],

  // LEVEL 10: Movie Night I
  10: [
    { type: 'GUESS_MOVIE', prompt: 'Guess this Disney movie:', display: '🦁 + 👑', options: ['The Lion King', 'Madagascar', 'The Jungle Book', 'Tarzan'], correctIndex: 0, explanation: 'Lion + Crown = The Lion King!' },
    { type: 'GUESS_MOVIE', prompt: 'Which blockbuster is this?', display: '🚢 + 🧊', options: ['Titanic', 'Pirates of the Caribbean', 'Poseidon', 'Cast Away'], correctIndex: 0, explanation: 'Ship + Iceberg = Titanic' },
    { type: 'GUESS_MOVIE', prompt: 'Guess the fantasy adventure:', display: '🧙‍♂️ + 🧝 + 💍', options: ['The Lord of the Rings', 'Harry Potter', 'Star Wars', 'The Hobbit'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Identify this monster movie:', display: '🦖 + 🏝️', options: ['Jurassic Park', 'King Kong', 'Godzilla', 'Jaws'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Which sci-fi movie is this?', display: '👽 + 🚲 + 🌕', options: ['E.T. the Extra-Terrestrial', 'Star Trek', 'Avatar', 'Interstellar'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Guess the famous thriller:', display: '🦈 + 🏊', options: ['Jaws', 'Finding Nemo', 'The Meg', 'Aquaman'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Identify this Pixar film:', display: '🎈 + 🏠', options: ['Up', 'Toy Story', 'Monsters, Inc.', 'Cars'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Guess this magical movie:', display: '⚡ + 👓 + 🪄', options: ['Harry Potter', 'Doctor Strange', 'Fantastic Beasts', 'Merlin'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Identify this superhero film:', display: '🕷️ + 🕸️ + 🦸‍♂️', options: ['Spider-Man', 'Batman', 'Superman', 'Iron Man'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Guess this space opera:', display: '⚔️ + 🌌 + 🚀', options: ['Star Wars', 'Guardians of the Galaxy', 'Alien', 'Dune'], correctIndex: 0 },
  ],

  // LEVEL 11: Odd One Out I (Spot the Imposter)
  11: [
    { type: 'ODD_EMOJI', prompt: 'Select the odd emoji out:', display: '😀 😀 😀 😡 😀', options: ['Angry Face (😡)', 'Grinning Face (😀)', 'Winking Face (😉)', 'Sleeping Face (😴)'], correctIndex: 0, explanation: 'All are grinning except the angry face!' },
    { type: 'ODD_EMOJI', prompt: 'Spot the different fruit:', display: '🍎 🍎 🍎 🍌 🍎', options: ['Red Apple (🍎)', 'Yellow Banana (🍌)', 'Strawberry (🍓)', 'Orange (🍊)'], correctIndex: 1 },
    { type: 'ODD_EMOJI', prompt: 'Which emoji does not match?', display: '🐱 🐱 🐶 🐱 🐱', options: ['Dog (🐶)', 'Cat (🐱)', 'Fox (🦊)', 'Wolf (🐺)'], correctIndex: 0 },
    { type: 'ODD_EMOJI', prompt: 'Find the different ball:', display: '⚽ ⚽ ⚽ 🏀 ⚽', options: ['Soccer Ball (⚽)', 'Basketball (🏀)', 'Baseball (⚾)', 'Tennis Ball (🎾)'], correctIndex: 1 },
    { type: 'ODD_EMOJI', prompt: 'Select the odd transport:', display: '🚗 🚗 🚗 ✈️ 🚗', options: ['Airplane (✈️)', 'Car (🚗)', 'Bicycle (🚲)', 'Train (🚆)'], correctIndex: 0 },
    { type: 'ODD_EMOJI', prompt: 'Which heart has a different color?', display: '❤️ ❤️ 💙 ❤️ ❤️', options: ['Blue Heart (💙)', 'Red Heart (❤️)', 'Green Heart (💚)', 'Purple Heart (💜)'], correctIndex: 0 },
    { type: 'ODD_EMOJI', prompt: 'Find the odd insect:', display: '🐝 🐝 🐝 🦋 🐝', options: ['Butterfly (🦋)', 'Honeybee (🐝)', 'Ant (🐜)', 'Ladybug (🐞)'], correctIndex: 0 },
    { type: 'ODD_EMOJI', prompt: 'Spot the different facial expression:', display: '😴 😴 😴 🤯 😴', options: ['Exploding Head (🤯)', 'Sleeping Face (😴)', 'Thinking Face (🤔)', 'Smirk Face (😏)'], correctIndex: 0 },
    { type: 'ODD_EMOJI', prompt: 'Which cold food is different?', display: '🍦 🍦 🍕 🍦 🍦', options: ['Pizza slice (🍕)', 'Ice cream (🍦)', 'Cake (🍰)', 'Popsicle (🍧)'], correctIndex: 0 },
    { type: 'ODD_EMOJI', prompt: 'Find the different star:', display: '⭐ ⭐ ⭐ 🌙 ⭐', options: ['Crescent Moon (🌙)', 'Gold Star (⭐)', 'Sun (☀️)', 'Sparkle (✨)'], correctIndex: 0 },
  ],

  // LEVEL 12: Category Clash (Which does NOT belong?)
  12: [
    { type: 'EMOJI_CATEGORY', prompt: 'Which one does NOT belong to the category?', display: '🍎 🍌 🍓 🏀', options: ['Basketball (It is a sports ball, others are fruits)', 'Apple', 'Banana', 'Strawberry'], correctIndex: 0 },
    { type: 'EMOJI_CATEGORY', prompt: 'Which animal does NOT live in the ocean?', display: '🐬 🦈 🐙 🦁', options: ['Lion (Land animal)', 'Dolphin', 'Shark', 'Octopus'], correctIndex: 0 },
    { type: 'EMOJI_CATEGORY', prompt: 'Which one does NOT fly in the sky?', display: '🦅 ✈️ 🚀 🚗', options: ['Car (Ground vehicle)', 'Eagle', 'Airplane', 'Rocket'], correctIndex: 0 },
    { type: 'EMOJI_CATEGORY', prompt: 'Which one is NOT a musical instrument?', display: '🎸 🎹 🥁 🔨', options: ['Hammer (Tool, not instrument)', 'Guitar', 'Piano', 'Drum'], correctIndex: 0 },
    { type: 'EMOJI_CATEGORY', prompt: 'Which beverage does NOT contain alcohol?', display: '🍷 🍺 🧃 🍸', options: ['Fruit Juice Box', 'Red Wine', 'Draft Beer', 'Martini Cocktail'], correctIndex: 0 },
    { type: 'EMOJI_CATEGORY', prompt: 'Which one is NOT cold / winter themed?', display: '❄️ ⛄ 🍧 🔥', options: ['Fire (Hot, not cold)', 'Snowflake', 'Snowman', 'Shaved Ice'], correctIndex: 0 },
    { type: 'EMOJI_CATEGORY', prompt: 'Which one is NOT worn on the body?', display: '👕 👖 👟 💻', options: ['Laptop Computer', 'T-Shirt', 'Jeans', 'Sneakers'], correctIndex: 0 },
    { type: 'EMOJI_CATEGORY', prompt: 'Which one is NOT a dessert?', display: '🍰 🍩 🍨 🥦', options: ['Broccoli (Vegetable)', 'Cake', 'Donut', 'Ice Cream'], correctIndex: 0 },
    { type: 'EMOJI_CATEGORY', prompt: 'Which one is NOT a celestial body?', display: '☀️ 🌙 🪐 🚗', options: ['Car (Not in outer space)', 'Sun', 'Moon', 'Saturn'], correctIndex: 0 },
    { type: 'EMOJI_CATEGORY', prompt: 'Which one is NOT an indoor tech device?', display: '📱 💻 📺 🚜', options: ['Tractor (Farm vehicle)', 'Smartphone', 'Laptop', 'Television'], correctIndex: 0 },
  ],

  // LEVEL 13: Sports Center
  13: [
    { type: 'EMOJI_SPORTS', prompt: 'Identify this sport:', display: '⚽ + 🥅 + 👟', options: ['Football / Soccer', 'Rugby', 'Cricket', 'Baseball'], correctIndex: 0 },
    { type: 'EMOJI_SPORTS', prompt: 'What sport is represented?', display: '🏀 + 🗑️ + 👟', options: ['Basketball', 'Volleyball', 'Handball', 'Dodgeball'], correctIndex: 0 },
    { type: 'EMOJI_SPORTS', prompt: 'Identify this court sport:', display: '🎾 + 🏸 + 🎾', options: ['Tennis', 'Badminton', 'Table Tennis', 'Squash'], correctIndex: 0 },
    { type: 'EMOJI_SPORTS', prompt: 'Which sport involves small holes and clubs?', display: '⛳ + 🏌️‍♂️ + ⛳', options: ['Golf', 'Hockey', 'Polo', 'Archery'], correctIndex: 0 },
    { type: 'EMOJI_SPORTS', prompt: 'Identify the combat sport:', display: '🥊 + 🥋 + 🥊', options: ['Boxing / Martial Arts', 'Fencing', 'Wrestling', 'Judo'], correctIndex: 0 },
    { type: 'EMOJI_SPORTS', prompt: 'Which winter sport is this?', display: '🎿 + ❄️ + ⛷️', options: ['Skiing', 'Ice Hockey', 'Bobsled', 'Figure Skating'], correctIndex: 0 },
    { type: 'EMOJI_SPORTS', prompt: 'Identify the water sport:', display: '🏄‍♂️ + 🌊 + ☀️', options: ['Surfing', 'Water Polo', 'Kayaking', 'Scuba Diving'], correctIndex: 0 },
    { type: 'EMOJI_SPORTS', prompt: 'Which track event is this?', display: '🏃‍♂️ + ⏱️ + 🥇', options: ['Sprinting / Marathon', 'High Jump', 'Pole Vault', 'Shot Put'], correctIndex: 0 },
    { type: 'EMOJI_SPORTS', prompt: 'Identify this table game:', display: '🏓 + ⚪ + 🏓', options: ['Table Tennis / Ping Pong', 'Billiards', 'Air Hockey', 'Foosball'], correctIndex: 0 },
    { type: 'EMOJI_SPORTS', prompt: 'Which sport has strikes and spares?', display: '🎳 + ⚪ + 🎳', options: ['Bowling', 'Baseball', 'Curling', 'Darts'], correctIndex: 0 },
  ],

  // LEVEL 14: Travel & Vehicles
  14: [
    { type: 'EMOJI_COMBINATION', prompt: 'Identify this mode of travel:', display: '✈️ + ☁️ + 🌍', options: ['International Air Travel', 'Ocean Cruise', 'Subway Ride', 'Mountain Hike'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What trip is this?', display: '🚂 + 🛤️ + 🏔️', options: ['Scenic Mountain Train Ride', 'Ferry Crossing', 'Bicycle Commute', 'Helicopter Tour'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Identify the ocean journey:', display: '🛳️ + 🌊 + 🏝️', options: ['Cruise Ship to Tropical Island', 'Submarine dive', 'Speedboat race', 'Rowing contest'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What two-wheeled ride is this?', display: '🏍️ + 🛣️ + 💨', options: ['High-speed Motorcycle Ride', 'Horse riding', 'Skateboarding', 'Scooter in park'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What outdoor adventure is this?', display: '🏕️ + 🪵 + 🔥', options: ['Camping with Campfire', 'Luxury Hotel stay', 'Theme Park visit', 'Office retreat'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Identify this extreme climb:', display: '🧗‍♂️ + 🧗‍♀️ + 🏔️', options: ['Mountain Rock Climbing', 'Scuba Diving', 'Skydiving', 'Cave Exploration'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What flight experience is this?', display: '🚁 + 🏙️ + 📸', options: ['Helicopter City Tour', 'Space Rocket Launch', 'Glider flight', 'Hot air balloon'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Identify this eco-ride:', display: '🚲 + 🌳 + ☀️', options: ['Sunny Bicycle Ride in the Park', 'Highway Truck Drive', 'Subway train', 'Bulldozer'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'What water paddling is this?', display: '🛶 + 🏞️ + 🌲', options: ['Canoeing down a river', 'Sailing a yacht', 'Riding jet ski', 'Fishing from pier'], correctIndex: 0 },
    { type: 'EMOJI_COMBINATION', prompt: 'Guess this thrill ride:', display: '🎢 + 🎡 + 🎟️', options: ['Amusement Theme Park', 'Museum exhibition', 'Library study', 'Bank queue'], correctIndex: 0 },
  ],

  // LEVEL 15: World Places I
  15: [
    { type: 'EMOJI_COUNTRY', prompt: 'Identify the country from clues:', display: '🗼 + 🥐 + 🍷', options: ['France (Paris)', 'Italy', 'Germany', 'Spain'], correctIndex: 0, explanation: 'Eiffel Tower + Croissant + Wine = France!' },
    { type: 'EMOJI_COUNTRY', prompt: 'Which country is represented?', display: '🗽 + 🍔 + 🦅', options: ['United States of America', 'United Kingdom', 'Canada', 'Australia'], correctIndex: 0 },
    { type: 'EMOJI_COUNTRY', prompt: 'Identify this Asian nation:', display: '🍣 + 🗻 + 🌸', options: ['Japan', 'China', 'South Korea', 'Thailand'], correctIndex: 0, explanation: 'Sushi + Mount Fuji + Cherry Blossom = Japan!' },
    { type: 'EMOJI_COUNTRY', prompt: 'Which historic country is this?', display: '🍕 + 🏛️ + 🛵', options: ['Italy (Rome)', 'Greece', 'Portugal', 'Turkey'], correctIndex: 0 },
    { type: 'EMOJI_COUNTRY', prompt: 'Identify this desert ancient land:', display: '🐪 + 🏜️ + ⚱️', options: ['Egypt (Pyramids)', 'Saudi Arabia', 'Morocco', 'Jordan'], correctIndex: 0 },
    { type: 'EMOJI_COUNTRY', prompt: 'Which vast island country is this?', display: '🦘 + 🐨 + 🏄‍♂️', options: ['Australia', 'New Zealand', 'South Africa', 'Madagascar'], correctIndex: 0 },
    { type: 'EMOJI_COUNTRY', prompt: 'Identify this carnival nation:', display: '⚽ + 🌴 + 💃', options: ['Brazil', 'Argentina', 'Colombia', 'Mexico'], correctIndex: 0 },
    { type: 'EMOJI_COUNTRY', prompt: 'Which chilly northern country is this?', display: '🍁 + 🏒 + 🥞', options: ['Canada', 'Norway', 'Sweden', 'Finland'], correctIndex: 0 },
    { type: 'EMOJI_COUNTRY', prompt: 'Identify this spicy cuisine country:', display: '🌮 + 🌵 + 🪅', options: ['Mexico', 'Peru', 'Chile', 'Guatemala'], correctIndex: 0 },
    { type: 'EMOJI_COUNTRY', prompt: 'Which historic island nation is this?', display: '💂 + 🫖 + 🌧️', options: ['United Kingdom (London)', 'Ireland', 'Scotland', 'Netherlands'], correctIndex: 0 },
  ],

  // LEVEL 16: Emoji Sequence I (Choose the Next Emoji)
  16: [
    { type: 'EMOJI_SEQUENCE', prompt: 'Choose the logical next emoji:', display: '🌱 🌿 🌳 ?', options: ['🍎 (Fruit / Harvest)', '🚗 (Car)', '🌧️ (Rain)', '🧊 (Ice)'], correctIndex: 0, explanation: 'Plant growth cycle: Sprout -> Herb -> Tree -> Fruit!' },
    { type: 'EMOJI_SEQUENCE', prompt: 'What comes next in the sky sequence?', display: '🌅 ☀️ 🌇 ?', options: ['🌙 (Night Moon)', '⚡ (Lightning)', '🌈 (Rainbow)', '❄️ (Snow)'], correctIndex: 0, explanation: 'Dawn -> Midday Sun -> Sunset -> Night Moon!' },
    { type: 'EMOJI_SEQUENCE', prompt: 'Identify the next step in cooking:', display: '🛒 🍳 🍽️ ?', options: ['😋 (Eating happily)', '🚗 (Driving)', '😴 (Sleeping)', '🏊 (Swimming)'], correctIndex: 0 },
    { type: 'EMOJI_SEQUENCE', prompt: 'Complete the egg sequence:', display: '🥚 🐣 🐥 ?', options: ['🐔 (Adult Hen)', '🐶 (Puppy)', '🐟 (Fish)', '🐸 (Frog)'], correctIndex: 0 },
    { type: 'EMOJI_SEQUENCE', prompt: 'What is the logical next face?', display: '🙂 😊 😄 ?', options: ['😆 (Grinning face)', '😡 (Angry)', '😭 (Crying)', '😴 (Sleeping)'], correctIndex: 0 },
    { type: 'EMOJI_SEQUENCE', prompt: 'Complete the travel progression:', display: '🚶‍♂️ 🚲 🚗 ?', options: ['✈️ (Airplane)', '🐢 (Turtle)', '🛋️ (Couch)', '🪑 (Chair)'], correctIndex: 0, explanation: 'Progression of transport speeds: Walk -> Bike -> Car -> Airplane!' },
    { type: 'EMOJI_SEQUENCE', prompt: 'What comes after babyhood?', display: '👶 🧒 🧑 ?', options: ['🧓 (Elderly person)', '🐶 (Dog)', '🤖 (Robot)', '🐱 (Cat)'], correctIndex: 0 },
    { type: 'EMOJI_SEQUENCE', prompt: 'What completes the match score?', display: '⚽ 🥅 🎉 ?', options: ['🏆 (Trophy Cup)', '🌧️ (Rain)', '🚑 (Ambulance)', '💤 (Sleep)'], correctIndex: 0 },
    { type: 'EMOJI_SEQUENCE', prompt: 'What comes next in the workout?', display: '👟 🏋️ 💧 ?', options: ['🧘 (Stretching / Recovery)', '🍕 (Pizza feast)', '🎂 (Cake)', '🎮 (Gaming)'], correctIndex: 0 },
    { type: 'EMOJI_SEQUENCE', prompt: 'Complete the moon phases:', display: '🌑 🌓 🌕 ?', options: ['🌗 (Waning Moon)', '☀️ (Sun)', '⭐ (Star)', '☁️ (Cloud)'], correctIndex: 0 },
  ],

  // LEVEL 17: Memory Flash I
  17: [
    { type: 'EMOJI_MEMORY', prompt: 'Remember these emojis! Which one was shown?', display: '👀 MEMORIZE', memoryEmojis: ['🍕', '🚀', '🐱', '🎸'], options: ['🚀 (Rocket)', '🍔 (Burger)', '🚗 (Car)', '⚽ (Soccer ball)'], correctIndex: 0, explanation: 'The rocket was in the memory group!' },
    { type: 'EMOJI_MEMORY', prompt: 'Which animal was in the memory list?', display: '👀 MEMORIZE', memoryEmojis: ['🦁', '🍓', '🏀', '✈️'], options: ['🦁 (Lion)', '🐼 (Panda)', '🐶 (Dog)', '🦊 (Fox)'], correctIndex: 0 },
    { type: 'EMOJI_MEMORY', prompt: 'Which sweet treat was shown?', display: '👀 MEMORIZE', memoryEmojis: ['🍩', '🎸', '⚽', '👑'], options: ['🍩 (Donut)', '🍰 (Cake)', '🍦 (Ice cream)', '🍪 (Cookie)'], correctIndex: 0 },
    { type: 'EMOJI_MEMORY', prompt: 'Which transport was shown?', display: '👀 MEMORIZE', memoryEmojis: ['🚗', '⭐', '🍎', '🐶'], options: ['🚗 (Car)', '✈️ (Airplane)', '🚀 (Rocket)', '🚲 (Bicycle)'], correctIndex: 0 },
    { type: 'EMOJI_MEMORY', prompt: 'Which sports ball was in the list?', display: '👀 MEMORIZE', memoryEmojis: ['🎾', '🍕', '🐱', '💎'], options: ['🎾 (Tennis Ball)', '⚽ (Soccer ball)', '🏀 (Basketball)', '🏈 (Football)'], correctIndex: 0 },
    { type: 'EMOJI_MEMORY', prompt: 'Which celestial object was shown?', display: '👀 MEMORIZE', memoryEmojis: ['🌙', '🍔', '🐶', '👟'], options: ['🌙 (Crescent Moon)', '☀️ (Sun)', '🪐 (Saturn)', '⭐ (Star)'], correctIndex: 0 },
    { type: 'EMOJI_MEMORY', prompt: 'Which creature was in the group?', display: '👀 MEMORIZE', memoryEmojis: ['🐬', '🍟', '🏀', '📱'], options: ['🐬 (Dolphin)', '🦈 (Shark)', '🐙 (Octopus)', '🐳 (Whale)'], correctIndex: 0 },
    { type: 'EMOJI_MEMORY', prompt: 'Which fruit was displayed?', display: '👀 MEMORIZE', memoryEmojis: ['🍉', '🚗', '🎸', '👑'], options: ['🍉 (Watermelon)', '🍎 (Apple)', '🍌 (Banana)', '🍇 (Grapes)'], correctIndex: 0 },
    { type: 'EMOJI_MEMORY', prompt: 'Which symbol was shown?', display: '👀 MEMORIZE', memoryEmojis: ['🔥', '🐱', '🍕', '🚲'], options: ['🔥 (Fire)', '⚡ (Lightning)', '💧 (Water)', '❄️ (Snow)'], correctIndex: 0 },
    { type: 'EMOJI_MEMORY', prompt: 'Which item of clothing was shown?', display: '👀 MEMORIZE', memoryEmojis: ['👟', '🍔', '🐶', '✈️'], options: ['👟 (Sneaker shoe)', '👕 (T-shirt)', '🧢 (Cap)', '👗 (Dress)'], correctIndex: 0 },
  ],

  // LEVEL 18: Movie Night II
  18: [
    { type: 'GUESS_MOVIE', prompt: 'Identify this animated film:', display: '🐭 + 👨‍🍳 + 🍲', options: ['Ratatouille', 'Mickey Mouse', 'Stuart Little', 'Tom & Jerry'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Guess this fairy tale film:', display: '👸 + 👠 + 🎃', options: ['Cinderella', 'Snow White', 'Sleeping Beauty', 'Beauty and the Beast'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Which space hero is this?', display: '🤠 + 🚀 + 🧸', options: ['Toy Story', 'Wall-E', 'Robots', 'Monster Inc.'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Identify this superhero thriller:', display: '🦇 + 🦸‍♂️ + 🃏', options: ['The Dark Knight (Batman)', 'Iron Man', 'Thor', 'Captain America'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Guess this underwater adventure:', display: '🐠 + 🦈 + 🌊', options: ['Finding Nemo', 'Aquaman', 'The Little Mermaid', 'Shark Tale'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Identify this fantasy classic:', display: '🦁 + 🧙‍♀️ + 🚪', options: ['The Chronicles of Narnia', 'Alice in Wonderland', 'Peter Pan', 'Wizard of Oz'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Guess this icy Disney hit:', display: '❄️ + 👸 + ⛄', options: ['Frozen', 'Brave', 'Tangled', 'Moana'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Identify this high-speed car movie:', display: '🏎️ + 💨 + 🏁', options: ['Cars', 'Fast & Furious', 'Rush', 'Ford v Ferrari'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Guess this magical carpet story:', display: '🧞 + 🐒 + 🕌', options: ['Aladdin', 'Sinbad', 'Prince of Persia', 'Hercules'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Identify this jungle adventure:', display: '🦍 + 🌴 + 🧗‍♂️', options: ['Tarzan', 'King Kong', 'Jungle Cruise', 'Planet of the Apes'], correctIndex: 0 },
  ],

  // LEVEL 19: Common Sayings & Idioms
  19: [
    { type: 'GUESS_PHRASE', prompt: 'Guess the idiom from emojis:', display: '🌧️ + 🐱 + 🐶', options: ['Raining cats and dogs', 'Animal shelter', 'Pet walking in the rain', 'Thunderstorm warning'], correctIndex: 0 },
    { type: 'GUESS_PHRASE', prompt: 'Identify this common saying:', display: '⏰ + 💰', options: ['Time is money', 'Expensive watch', 'Bank loan', 'Overtime pay'], correctIndex: 0 },
    { type: 'GUESS_PHRASE', prompt: 'What proverb is this?', display: '🍎 + 📅 + 👨‍⚕️ + ❌', options: ['An apple a day keeps the doctor away', 'Fruit market sales', 'Doctor on vacation', 'Healthy hospital menu'], correctIndex: 0 },
    { type: 'GUESS_PHRASE', prompt: 'Guess this musical phrase:', display: '👂 + 🎵', options: ['Music to my ears', 'Loud concert', 'Headphones on', 'Singing bird'], correctIndex: 0 },
    { type: 'GUESS_PHRASE', prompt: 'Identify this wise advice:', display: '📖 + 🙈', options: ['Don\'t judge a book by its cover', 'Blind reading', 'Closed library', 'Secret diary'], correctIndex: 0 },
    { type: 'GUESS_PHRASE', prompt: 'What phrase is represented?', display: '🧊 + 🔨', options: ['Break the ice', 'Ice cube maker', 'Winter construction', 'Frozen lake'], correctIndex: 0 },
    { type: 'GUESS_PHRASE', prompt: 'Guess the sweet metaphor:', display: 'Piece of + 🍰', options: ['A piece of cake (Easy task)', 'Bakery shop', 'Sweet tooth', 'Birthday dessert'], correctIndex: 0 },
    { type: 'GUESS_PHRASE', prompt: 'Identify this idiom:', display: '👀 + 👁️ + 👁️', options: ['An eye for an eye', 'Three eyes alien', 'Optometry exam', 'Looking both ways'], correctIndex: 0 },
    { type: 'GUESS_PHRASE', prompt: 'What expression is this?', display: '🦋 + 🥪 + 🤰', options: ['Butterflies in my stomach', 'Caterpillar lunch', 'Healthy diet', 'Insect bite'], correctIndex: 0 },
    { type: 'GUESS_PHRASE', prompt: 'Guess this saying:', display: '💧 + 🌊 + 🪣', options: ['A drop in the ocean / bucket', 'Filling water bucket', 'Sea wave splashing', 'Rainstorm'], correctIndex: 0 },
  ],

  // LEVEL 20: Midway Tournament Championship (Mixed Challenge)
  20: [
    { type: 'EMOJI_COMBINATION', prompt: 'Solve the championship riddle:', display: '👑 + 🏆 + 🥇', options: ['Undisputed Champion / Number One', 'Silver medalist', 'Lost trophy', 'Audience spectator'], correctIndex: 0 },
    { type: 'GUESS_MOVIE', prompt: 'Identify this classic film:', display: '👽 + 🛸 + ☎️ + 🏠', options: ['E.T. phone home', 'Close Encounters', 'Men in Black', 'Independence Day'], correctIndex: 0 },
    { type: 'ODD_EMOJI', prompt: 'Spot the imposter:', display: '🦁 🦁 🦁 🐱 🦁', options: ['House Cat (🐱)', 'Lion (🦁)', 'Tiger (🐯)', 'Leopard (🐆)'], correctIndex: 0 },
    { type: 'EMOJI_COUNTRY', prompt: 'Identify the nation:', display: '🍁 + 🏒 + 🥞', options: ['Canada', 'Russia', 'Norway', 'Iceland'], correctIndex: 0 },
    { type: 'EMOJI_SPORTS', prompt: 'What sport is this?', display: '🥊 + 🔔 + 🏆', options: ['Championship Boxing', 'Wrestling', 'Karate', 'Fencing'], correctIndex: 0 },
    { type: 'EMOJI_SEQUENCE', prompt: 'What comes next in the logic?', display: '🥚 🐣 🐥 ?', options: ['🐔 (Hen)', '🐶 (Dog)', '🍎 (Apple)', '🚗 (Car)'], correctIndex: 0 },
    { type: 'EMOJI_CATEGORY', prompt: 'Which one does NOT belong?', display: '⚽ 🏀 🎾 🎸', options: ['Guitar (Instrument among sports balls)', 'Soccer ball', 'Basketball', 'Tennis ball'], correctIndex: 0 },
    { type: 'GUESS_FOOD', prompt: 'Identify this meal:', display: '🌮 + 🥑 + 🌶️', options: ['Spicy Guacamole Taco', 'Fish sticks', 'Cheeseburger', 'Apple pie'], correctIndex: 0 },
    { type: 'EMOJI_MEANING', prompt: 'What does this rare emoji mean?', display: '🤯', options: ['Mind blown / Utterly shocked', 'Headache', 'Smiling', 'Sleepy'], correctIndex: 0 },
    { type: 'GUESS_PHRASE', prompt: 'Guess the phrase:', display: '⏰ + ✈️', options: ['Time flies', 'Delayed flight', 'Airport clock', 'Speedy jet'], correctIndex: 0 },
  ],
};

// Procedural high-level question generator for levels 21 to 40 (10 unique questions each)
// Ensures 40 full tournament levels with rich, unambiguous content!
const PROCEDURAL_THEMES: Record<number, { title: string; category: EmojiQuestion['type']; items: Array<{ prompt: string; display: string; options: [string, string, string, string]; correctIndex: number; exp?: string; memoryEmojis?: string[] }> }> = {
  21: {
    title: 'Odd One Out II',
    category: 'ODD_EMOJI',
    items: [
      { prompt: 'Find the odd facial expression:', display: '😂 😂 😂 😭 😂', options: ['Loud Crying (😭)', 'Laughing (😂)', 'Smirking (😏)', 'Winking (😉)'], correctIndex: 0 },
      { prompt: 'Spot the odd drink:', display: '☕ ☕ ☕ 🍷 ☕', options: ['Wine glass (🍷)', 'Hot coffee (☕)', 'Tea cup (🍵)', 'Milk bottle (🥛)'], correctIndex: 0 },
      { prompt: 'Select the odd sports gear:', display: '⚽ ⚽ ⚽ 🎸 ⚽', options: ['Guitar (🎸)', 'Soccer ball (⚽)', 'Basketball (🏀)', 'Baseball (⚾)'], correctIndex: 0 },
      { prompt: 'Which sweet treat is different?', display: '🍩 🍩 🍩 🥦 🍩', options: ['Broccoli (🥦)', 'Donut (🍩)', 'Cookie (🍪)', 'Cupcake (🧁)'], correctIndex: 0 },
      { prompt: 'Spot the odd vehicle:', display: '🚗 🚗 🚗 ⛵ 🚗', options: ['Sailboat (⛵)', 'Car (🚗)', 'Van (🚐)', 'Bus (🚌)'], correctIndex: 0 },
      { prompt: 'Find the different flower:', display: '🌸 🌸 🌸 🌵 🌸', options: ['Cactus (🌵)', 'Cherry Blossom (🌸)', 'Rose (🌹)', 'Tulip (🌷)'], correctIndex: 0 },
      { prompt: 'Which bird is not like the others?', display: '🦅 🦅 🦅 🐧 🦅', options: ['Penguin (Flightless bird)', 'Eagle (🦅)', 'Hawk', 'Falcon'], correctIndex: 0 },
      { prompt: 'Spot the imposter gesture:', display: '👍 👍 👍 👎 👍', options: ['Thumbs Down (👎)', 'Thumbs Up (👍)', 'Clap (👏)', 'Wave (👋)'], correctIndex: 0 },
      { prompt: 'Which one does not give light?', display: '💡 💡 💡 🪨 💡', options: ['Rock (🪨)', 'Light bulb (💡)', 'Flashlight (🔦)', 'Candle (🕯️)'], correctIndex: 0 },
      { prompt: 'Spot the odd space object:', display: '⭐ ⭐ ⭐ 🍕 ⭐', options: ['Pizza slice (🍕)', 'Star (⭐)', 'Comet (☄️)', 'Moon (🌙)'], correctIndex: 0 },
    ],
  },
  22: {
    title: 'Music & Songs',
    category: 'GUESS_PHRASE',
    items: [
      { prompt: 'Guess this Beatles hit song:', display: '☀️ + ☀️ + ☀️', options: ['Here Comes the Sun', 'Yellow Submarine', 'Let It Be', 'Hey Jude'], correctIndex: 0 },
      { prompt: 'Identify this Queen anthem:', display: '👑 + 🎸 + 🥁', options: ['We Will Rock You', 'Bohemian Rhapsody', 'Radio Ga Ga', 'Killer Queen'], correctIndex: 0 },
      { prompt: 'Guess this dance pop song:', display: '💃 + 🕺 + 🪩', options: ['Dancing Queen', 'Stayin\' Alive', 'Uptown Funk', 'Levitating'], correctIndex: 0 },
      { prompt: 'Identify this Michael Jackson hit:', display: 'Thriller + 🧟‍♂️ + 🌕', options: ['Thriller', 'Billie Jean', 'Beat It', 'Bad'], correctIndex: 0 },
      { prompt: 'Guess the song title:', display: '👁️ + 🐯', options: ['Eye of the Tiger', 'Roar', 'Wild Things', 'Jungle Boogie'], correctIndex: 0 },
      { prompt: 'What melody is this?', display: '🌧️ + 💜', options: ['Purple Rain', 'Singing in the Rain', 'November Rain', 'Rain on Me'], correctIndex: 0 },
      { prompt: 'Guess this rock classic:', display: '🚪 + 🏨 + 🌴', options: ['Hotel California', 'Stairway to Heaven', 'Sweet Child O Mine', 'Roxanne'], correctIndex: 0 },
      { prompt: 'Identify this romantic song:', display: '❤️ + 🔐 + 🗝️', options: ['Unchain My Heart', 'Love Lockdown', 'Shape of You', 'All of Me'], correctIndex: 0 },
      { prompt: 'Guess this modern hit:', display: '🚗 + 🪪 + 😢', options: ['Drivers License', 'Fast Car', 'Cruel Summer', 'Blinding Lights'], correctIndex: 0 },
      { prompt: 'Identify this reggae classic:', display: '☝️ + ❤️', options: ['One Love', 'Three Little Birds', 'No Woman No Cry', 'Jamming'], correctIndex: 0 },
    ],
  },
  23: {
    title: 'Nature & Cosmos',
    category: 'EMOJI_COMBINATION',
    items: [
      { prompt: 'What cosmic event is shown?', display: '☀️ + 🌑 + 🌍', options: ['Solar Eclipse', 'Northern Lights', 'Meteor Shower', 'Supernova'], correctIndex: 0 },
      { prompt: 'Identify this weather wonder:', display: '🌧️ + ☀️ + 🌈', options: ['Rainbow after Rain', 'Sandstorm', 'Hailstorm', 'Blizzard'], correctIndex: 0 },
      { prompt: 'What natural disaster is this?', display: '🌋 + 💨 + 🪨', options: ['Volcanic Eruption', 'Avalanche', 'Flood', 'Tsunami'], correctIndex: 0 },
      { prompt: 'Identify this ocean event:', display: '🌊 + 🌪️ + 🌀', options: ['Hurricane / Typhoon at Sea', 'Calm Sunset', 'Coral Reef', 'Iceberg Drift'], correctIndex: 0 },
      { prompt: 'What season is arriving?', display: '🍂 + 🍁 + 💨', options: ['Autumn / Fall', 'Spring Bloom', 'Midsummer Heat', 'Deep Winter'], correctIndex: 0 },
      { prompt: 'Identify this frozen wonder:', display: '🏔️ + ❄️ + 🧊', options: ['Glacier / Frozen Mountain', 'Tropical Rainforest', 'Sandy Desert', 'Green Prairie'], correctIndex: 0 },
      { prompt: 'What happens in spring?', display: '🌱 + 🌸 + 🐝', options: ['Spring Blooming & Pollination', 'Winter Hibernation', 'Drought', 'Leaf Fall'], correctIndex: 0 },
      { prompt: 'Identify the deep cosmos:', display: '🌌 + 🔭 + 🪐', options: ['Astronomy & Planet Gazing', 'Deep Sea Fishing', 'Mountain Cave', 'Underground Mine'], correctIndex: 0 },
      { prompt: 'What severe weather is this?', display: '⚡ + 🌪️ + 🏚️', options: ['Tornado destroying houses', 'Snow shower', 'Gentle breeze', 'Sunny day'], correctIndex: 0 },
      { prompt: 'Identify this natural habitat:', display: '🌴 + 🦜 + 🐒', options: ['Tropical Rainforest Jungle', 'Arctic Tundra', 'Sahara Desert', 'Suburban Garden'], correctIndex: 0 },
    ],
  },
  24: {
    title: 'Speed Round I',
    category: 'EMOJI_SPEED_ROUND',
    items: [
      { prompt: 'Fast! What animal gives milk and says moo?', display: '🐮', options: ['Cow', 'Horse', 'Goat', 'Sheep'], correctIndex: 0 },
      { prompt: 'Quick! What color is this fruit?', display: '🍋', options: ['Yellow (Lemon)', 'Red', 'Blue', 'Purple'], correctIndex: 0 },
      { prompt: 'Fast! Identify the sports equipment:', display: '🏀', options: ['Basketball', 'Volleyball', 'Baseball', 'Bowling ball'], correctIndex: 0 },
      { prompt: 'Quick! What vehicle is used in emergencies?', display: '🚑', options: ['Ambulance', 'Taxi', 'Bicycle', 'Bus'], correctIndex: 0 },
      { prompt: 'Fast! Identify the musical instrument:', display: '🎹', options: ['Piano keyboard', 'Guitar', 'Violin', 'Flute'], correctIndex: 0 },
      { prompt: 'Quick! What is used to write?', display: '✏️', options: ['Pencil', 'Scissors', 'Eraser', 'Ruler'], correctIndex: 0 },
      { prompt: 'Fast! What tells the time?', display: '⏰', options: ['Alarm Clock', 'Calendar', 'Thermometer', 'Compass'], correctIndex: 0 },
      { prompt: 'Quick! What do birds build for eggs?', display: '🪺', options: ['Nest', 'Cave', 'Barn', 'Burrow'], correctIndex: 0 },
      { prompt: 'Fast! What protects you from rain?', display: '☔', options: ['Umbrella', 'Sunglasses', 'Scarf', 'Gloves'], correctIndex: 0 },
      { prompt: 'Quick! What is found on kings and queens?', display: '👑', options: ['Crown', 'Helmet', 'Cap', 'Headband'], correctIndex: 0 },
    ],
  },
  25: {
    title: 'World Places II',
    category: 'EMOJI_COUNTRY',
    items: [
      { prompt: 'Identify the city from landmarks:', display: '🗽 + 🚕 + 🍎', options: ['New York City (The Big Apple)', 'Los Angeles', 'Chicago', 'Miami'], correctIndex: 0 },
      { prompt: 'Identify this European canal city:', display: '🛶 + 🎭 + 🏛️', options: ['Venice, Italy', 'Amsterdam', 'Vienna', 'Prague'], correctIndex: 0 },
      { prompt: 'Identify the windmill country:', display: '🌷 + 🚲 + 🧀', options: ['Netherlands (Holland)', 'Switzerland', 'Belgium', 'Austria'], correctIndex: 0 },
      { prompt: 'Which alpine country is known for chocolate?', display: '🏔️ + 🍫 + ⌚', options: ['Switzerland', 'Sweden', 'Poland', 'Denmark'], correctIndex: 0 },
      { prompt: 'Identify this safari country:', display: '🦁 + ☕ + 🏃', options: ['Ethiopia / East Africa', 'Egypt', 'Morocco', 'Nigeria'], correctIndex: 0 },
      { prompt: 'Identify this Greek island paradise:', display: '🏛️ + 🫒 + 🌊', options: ['Greece (Athens/Santorini)', 'Cyprus', 'Malta', 'Croatia'], correctIndex: 0 },
      { prompt: 'Identify this taj mahal land:', display: '🕌 + 🍛 + 🐅', options: ['India', 'Pakistan', 'Sri Lanka', 'Nepal'], correctIndex: 0 },
      { prompt: 'Identify this fjord nation:', display: '🏔️ + 🛶 + 🌌', options: ['Norway', 'Iceland', 'Greenland', 'Canada'], correctIndex: 0 },
      { prompt: 'Identify the tango land:', display: '🥩 + ⚽ + 💃', options: ['Argentina', 'Chile', 'Uruguay', 'Paraguay'], correctIndex: 0 },
      { prompt: 'Identify this island with volcanoes and kimonos:', display: '🌋 + 🍣 + 🚅', options: ['Japan', 'Indonesia', 'Philippines', 'Taiwan'], correctIndex: 0 },
    ],
  },
  26: {
    title: 'Memory Flash II',
    category: 'EMOJI_MEMORY',
    items: [
      { prompt: 'Which fruit was in the memory group?', display: '👀 RECALL', memoryEmojis: ['🥝', '🚀', '🎸', '🦁'], options: ['🥝 (Kiwi)', '🍎 (Apple)', '🍌 (Banana)', '🍇 (Grapes)'], correctIndex: 0 },
      { prompt: 'Which transport was present?', display: '👀 RECALL', memoryEmojis: ['🚁', '🍕', '🐱', '💎'], options: ['🚁 (Helicopter)', '🚗 (Car)', '✈️ (Plane)', '🚆 (Train)'], correctIndex: 0 },
      { prompt: 'Which sport ball did you see?', display: '👀 RECALL', memoryEmojis: ['🏉', '⭐', '🍦', '🐶'], options: ['🏉 (Rugby Ball)', '⚽ (Soccer ball)', '🏀 (Basketball)', '🎾 (Tennis ball)'], correctIndex: 0 },
      { prompt: 'Which animal was shown?', display: '👀 RECALL', memoryEmojis: ['🦩', '🍔', '📱', '👑'], options: ['🦩 (Flamingo)', '🐧 (Penguin)', '🦉 (Owl)', '🦆 (Duck)'], correctIndex: 0 },
      { prompt: 'Which device was displayed?', display: '👀 RECALL', memoryEmojis: ['💻', '🍉', '⚽', '🔥'], options: ['💻 (Laptop)', '📱 (Phone)', '📺 (TV)', '📷 (Camera)'], correctIndex: 0 },
      { prompt: 'Which gem or luxury item was in the group?', display: '👀 RECALL', memoryEmojis: ['💎', '🚗', '🐶', '🍕'], options: ['💎 (Diamond Gem)', '👑 (Crown)', '💰 (Money)', '🏆 (Trophy)'], correctIndex: 0 },
      { prompt: 'Which flower was shown?', display: '👀 RECALL', memoryEmojis: ['🌻', '🚀', '🎸', '🐱'], options: ['🌻 (Sunflower)', '🌹 (Rose)', '🌸 (Blossom)', '🌷 (Tulip)'], correctIndex: 0 },
      { prompt: 'Which sea creature was displayed?', display: '👀 RECALL', memoryEmojis: ['🐙', '🍔', '⭐', '👟'], options: ['🐙 (Octopus)', '🦈 (Shark)', '🐬 (Dolphin)', '🦀 (Crab)'], correctIndex: 0 },
      { prompt: 'Which sweet treat did you see?', display: '👀 RECALL', memoryEmojis: ['🧁', '🚗', '🦁', '📱'], options: ['🧁 (Cupcake)', '🍩 (Donut)', '🍰 (Cake)', '🍪 (Cookie)'], correctIndex: 0 },
      { prompt: 'Which tool was in the list?', display: '👀 RECALL', memoryEmojis: ['🔑', '🍉', '🐶', '⚽'], options: ['🔑 (Key)', '🔨 (Hammer)', '🪛 (Screwdriver)', '🧲 (Magnet)'], correctIndex: 0 },
    ],
  },
  27: {
    title: 'Emoji Sequence II',
    category: 'EMOJI_SEQUENCE',
    items: [
      { prompt: 'Complete the evolution of flight:', display: '🕊️ 🪁 🛩️ ?', options: ['🚀 (Space Rocket)', '🚗 (Car)', '🚢 (Ship)', '🚲 (Bicycle)'], correctIndex: 0 },
      { prompt: 'Complete the communication history:', display: '📜 📮 ☎️ ?', options: ['📱 (Smartphone)', '📻 (Radio)', '📺 (Television)', '💻 (Laptop)'], correctIndex: 0 },
      { prompt: 'Complete the butterfly life cycle:', display: '🥚 🐛 🥥 ?', options: ['🦋 (Butterfly)', '🐝 (Bee)', '🐜 (Ant)', '🦗 (Cricket)'], correctIndex: 0 },
      { prompt: 'What comes after preparation in sports?', display: '🏋️ 🏃 🏁 ?', options: ['🏆 (Winning Trophy)', '🚑 (Ambulance)', '😴 (Sleep)', '🍕 (Pizza)'], correctIndex: 0 },
      { prompt: 'Complete the fire sequence:', display: '🪵 🪨 🔥 ?', options: ['💨 (Smoke / Ash)', '💧 (Water)', '❄️ (Ice)', '🌱 (Sprout)'], correctIndex: 0 },
      { prompt: 'What comes next in money progression?', display: '🪙 💵 💳 ?', options: ['📱 (Digital Mobile Pay)', '🏦 (Bank)', '💰 (Bag)', '💎 (Diamond)'], correctIndex: 0 },
      { prompt: 'Complete the frog life cycle:', display: '🥚 🐟 🐸 ?', options: ['👑 (Prince / Adult Frog)', '🐍 (Snake)', '🐢 (Turtle)', '🐊 (Alligator)'], correctIndex: 0 },
      { prompt: 'Complete the photography era:', display: '🎨 📷 📸 ?', options: ['🤳 (Front Camera Selfie)', '📽️ (Projector)', '📺 (TV)', '📻 (Radio)'], correctIndex: 0 },
      { prompt: 'What completes the bedtime cycle?', display: '🌇 🚿 🛌 ?', options: ['😴 (Sleeping deeply)', '🏃 (Running)', '🍔 (Eating)', '🚗 (Driving)'], correctIndex: 0 },
      { prompt: 'Complete the study journey:', display: '🎒 📚 🎓 ?', options: ['💼 (Career Work)', '👶 (Baby)', '🎮 (Gaming)', '🏖️ (Beach)'], correctIndex: 0 },
    ],
  },
  28: {
    title: 'Fantasy & Magic',
    category: 'EMOJI_COMBINATION',
    items: [
      { prompt: 'Identify this mythical beast:', display: '🐴 + 🦄 + ✨', options: ['Magical Unicorn', 'Pegasus', 'Centaur', 'Dragon'], correctIndex: 0 },
      { prompt: 'Identify this fire breathing monster:', display: '🦎 + 🔥 + 🏰', options: ['Dragon attacking castle', 'Lizard sunbathing', 'Dinosaur zoo', 'Crocodile river'], correctIndex: 0 },
      { prompt: 'Identify this wizard tool:', display: '🪄 + ✨ + 🎩', options: ['Magic Wand & Top Hat', 'Science Experiment', 'Cooking Utensil', 'Painting Brush'], correctIndex: 0 },
      { prompt: 'What mythical creature lives underwater?', display: '🧜‍♀️ + 🌊 + 🐚', options: ['Mermaid', 'Octopus', 'Siren', 'Sea Monster'], correctIndex: 0 },
      { prompt: 'Identify this spooky figure:', display: '🧛‍♂️ + 🦇 + 🩸', options: ['Vampire / Dracula', 'Werewolf', 'Ghost', 'Zombie'], correctIndex: 0 },
      { prompt: 'Identify this mystical seer:', display: '🔮 + 🧙‍♀️ + 🌟', options: ['Fortune Teller with Crystal Ball', 'Astronaut', 'Doctor', 'Detective'], correctIndex: 0 },
      { prompt: 'What enchanted building is this?', display: '🏰 + 👑 + ⚔️', options: ['Royal Fantasy Castle', 'Modern Apartment', 'Barn', 'Shopping Mall'], correctIndex: 0 },
      { prompt: 'Identify this magical lamp creature:', display: '🪔 + 💨 + 🧞‍♂️', options: ['Genie granting wishes', 'Campfire smoke', 'Oil lamp factory', 'Teapot'], correctIndex: 0 },
      { prompt: 'What legendary steed is this?', display: '🐴 + 🪽 + ☁️', options: ['Pegasus (Winged Horse)', 'Unicorn', 'Hippogriff', 'Gryphon'], correctIndex: 0 },
      { prompt: 'Identify this fairy tale ending:', display: '🤴 + 👸 + 🏰 + 💖', options: ['Happily Ever After', 'War Begins', 'Exile from kingdom', 'Tournament fight'], correctIndex: 0 },
    ],
  },
  29: {
    title: 'Foodies Deluxe',
    category: 'GUESS_FOOD',
    items: [
      { prompt: 'Identify this Spanish seafood dish:', display: '🥘 + 🦐 + 🍋', options: ['Paella', 'Risotto', 'Clam Chowder', 'Sushi Bowl'], correctIndex: 0 },
      { prompt: 'What Middle Eastern specialty is this?', display: '🫓 + 🥙 + 🧆', options: ['Falafel & Shawarma in pita', 'Hamburger', 'Pizza', 'Hot dog'], correctIndex: 0 },
      { prompt: 'Identify this British seaside classic:', display: '🐟 + 🍟 + 🍋', options: ['Fish & Chips', 'Crab Cakes', 'Sushi Rolls', 'Shrimp Taco'], correctIndex: 0 },
      { prompt: 'What fondue feast is this?', display: '🫕 + 🧀 + 🥖', options: ['Cheese Fondue with Bread', 'Chocolate Fountain', 'Hot Pot', 'Soup Bowl'], correctIndex: 0 },
      { prompt: 'Identify this Turkish / Greek dessert:', display: '🍯 + 🌰 + 🥐', options: ['Baklava with honey & nuts', 'Croissant', 'Pancakes', 'Waffles'], correctIndex: 0 },
      { prompt: 'What Vietnamese noodle bowl is this?', display: '🍜 + 🥩 + 🌿', options: ['Pho Noodle Soup', 'Ramen', 'Pasta', 'Spaghetti'], correctIndex: 0 },
      { prompt: 'Identify this Indian curry spread:', display: '🍛 + 🫓 + 🍚', options: ['Curry with Naan & Basmati Rice', 'Fried Rice', 'Burrito', 'Tacos'], correctIndex: 0 },
      { prompt: 'What Mexican dip is this?', display: '🥑 + 🍅 + 🧅', options: ['Guacamole with salsa ingredients', 'Hummus', 'Tartar sauce', 'Mayonnaise'], correctIndex: 0 },
      { prompt: 'Identify this American Thanksgiving meal:', display: '🦃 + 🥔 + 🥧', options: ['Roast Turkey with Pie', 'Barbecue Ribs', 'Fried Chicken', 'Lobster Dinner'], correctIndex: 0 },
      { prompt: 'What French bakery pastry is this?', display: '🥐 + ☕ + 🍓', options: ['French Café Breakfast', 'Fast Food Snack', 'Pub Meal', 'Street Food'], correctIndex: 0 },
    ],
  },
  30: {
    title: 'Speed Round II',
    category: 'EMOJI_SPEED_ROUND',
    items: [
      { prompt: 'Rapid! Which insect makes sweet honey?', display: '🐝', options: ['Honeybee', 'Wasp', 'Hornet', 'Fly'], correctIndex: 0 },
      { prompt: 'Quick! What holds books at school?', display: '🎒', options: ['Backpack', 'Suitcase', 'Wallet', 'Plastic bag'], correctIndex: 0 },
      { prompt: 'Rapid! Which device takes photographs?', display: '📷', options: ['Camera', 'Toaster', 'Radio', 'Microwave'], correctIndex: 0 },
      { prompt: 'Quick! Identify the sport with pins:', display: '🎳', options: ['Bowling', 'Golf', 'Tennis', 'Polo'], correctIndex: 0 },
      { prompt: 'Rapid! What vegetable is orange and loved by rabbits?', display: '🥕', options: ['Carrot', 'Eggplant', 'Tomato', 'Cucumber'], correctIndex: 0 },
      { prompt: 'Quick! Identify the royal headwear:', display: '👑', options: ['Crown', 'Turban', 'Sombrero', 'Fedora'], correctIndex: 0 },
      { prompt: 'Rapid! What symbol means 100 percent perfect score?', display: '💯', options: ['100 Points', '50 Percent', 'Zero', 'Question mark'], correctIndex: 0 },
      { prompt: 'Quick! What vehicle travels on railway tracks?', display: '🚆', options: ['Train', 'Truck', 'Motorcycle', 'Submarine'], correctIndex: 0 },
      { prompt: 'Rapid! Which fruit keeps the doctor away?', display: '🍎', options: ['Apple', 'Watermelon', 'Pineapple', 'Lemon'], correctIndex: 0 },
      { prompt: 'Quick! What unlocks a door padlock?', display: '🔑', options: ['Key', 'Fork', 'Spoon', 'Pen'], correctIndex: 0 },
    ],
  },
  31: {
    title: 'Tricky Idioms',
    category: 'GUESS_PHRASE',
    items: [
      { prompt: 'Guess this clever expression:', display: '🐺 + 🐑 + 👕', options: ['A wolf in sheep\'s clothing', 'Farm animal reunion', 'Wool factory', 'Carnivore dinner'], correctIndex: 0 },
      { prompt: 'Identify this money proverb:', display: '🌳 + 💵 + ❌', options: ['Money does not grow on trees', 'Paper mill production', 'Forest conservation', 'Expensive wood'], correctIndex: 0 },
      { prompt: 'Guess this idiom:', display: '🐱 + 👜 + 💨', options: ['Let the cat out of the bag (Spill the secret)', 'Pet travel case', 'Animal adoption', 'Lost purse'], correctIndex: 0 },
      { prompt: 'Identify this weather idiom:', display: '⚡ + 🔵', options: ['Out of the blue (Sudden surprise)', 'Sunny thunderstorm', 'Blue lightning strike', 'Weather forecast'], correctIndex: 0 },
      { prompt: 'What saying is this?', display: '🐎 + 🚗 + ❌', options: ['Don\'t put the cart before the horse', 'Broken carriage', 'Vintage car race', 'Farm transport'], correctIndex: 0 },
      { prompt: 'Guess this secret phrase:', display: '🤐 + 🤫 + 🔒', options: ['My lips are sealed / Keep it secret', 'Lost voice', 'Dentist visit', 'Microphone muted'], correctIndex: 0 },
      { prompt: 'Identify this eye saying:', display: '👁️ + 🌪️', options: ['Eye of the storm (Calm center)', 'Tornado watch', 'Dust in eye', 'Glasses prescription'], correctIndex: 0 },
      { prompt: 'What idiom is this?', display: '🔥 + 🍳 + ♨️', options: ['Out of the frying pan into the fire', 'Cooking breakfast', 'Restaurant kitchen', 'Campfire barbecue'], correctIndex: 0 },
      { prompt: 'Guess this bird saying:', display: '🐦 + 🪱', options: ['The early bird catches the worm', 'Bird feeder', 'Garden pest', 'Morning flight'], correctIndex: 0 },
      { prompt: 'Identify this needle proverb:', display: '🪡 + 🌾 + 🔎', options: ['Finding a needle in a haystack', 'Sewing blanket', 'Wheat harvesting', 'Search warrant'], correctIndex: 0 },
    ],
  },
  32: {
    title: 'Cinema Legends',
    category: 'GUESS_MOVIE',
    items: [
      { prompt: 'Identify this boxing champion film:', display: '🥊 + 🥩 + 🏛️', options: ['Rocky', 'Million Dollar Baby', 'Creed', 'Raging Bull'], correctIndex: 0 },
      { prompt: 'Guess this futuristic AI film:', display: '🤖 + 🕶️ + 🏍️', options: ['The Terminator', 'The Matrix', 'I, Robot', 'Blade Runner'], correctIndex: 0 },
      { prompt: 'Identify this spy franchise:', display: '🍸 + 🔫 + 🕴️', options: ['James Bond (007)', 'Mission: Impossible', 'Jason Bourne', 'Kingsman'], correctIndex: 0 },
      { prompt: 'Guess this dinosaur park adventure:', display: '🦟 + 琥珀 + 🦖', options: ['Jurassic Park', 'King Kong', 'Godzilla', 'Land Before Time'], correctIndex: 0 },
      { prompt: 'Identify this time travel classic:', display: '🚗 + ⚡ + ⏰', options: ['Back to the Future', 'Looper', 'About Time', 'Interstellar'], correctIndex: 0 },
      { prompt: 'Guess this mafia masterpiece:', display: '👨‍👧 + 🐴 + 🍝', options: ['The Godfather', 'Goodfellas', 'Scarface', 'Casino'], correctIndex: 0 },
      { prompt: 'Identify this alien invasion film:', display: '🛸 + 🇺🇸 + 🎆', options: ['Independence Day', 'War of the Worlds', 'Mars Attacks!', 'Arrival'], correctIndex: 0 },
      { prompt: 'Guess this chocolate factory tale:', display: '🍫 + 🎟️ + 🎩', options: ['Willy Wonka & the Chocolate Factory', 'Chocolat', 'Mary Poppins', 'Hugo'], correctIndex: 0 },
      { prompt: 'Identify this virtual reality classic:', display: '💊 + 🕶️ + 🥋', options: ['The Matrix', 'Inception', 'Tron', 'Ready Player One'], correctIndex: 0 },
      { prompt: 'Guess this dream within a dream film:', display: '🌀 + ⏰ + 🏢', options: ['Inception', 'Shutter Island', 'Memento', 'Interstellar'], correctIndex: 0 },
    ],
  },
  33: {
    title: 'Odd One Out III',
    category: 'ODD_EMOJI',
    items: [
      { prompt: 'Spot the imposter animal:', display: '🐬 🐬 🐬 🦈 🐬', options: ['Shark (Cartilaginous fish, others are mammals)', 'Dolphin', 'Whale', 'Seal'], correctIndex: 0 },
      { prompt: 'Which hand gesture does NOT show approval?', display: '👍 👏 🙌 👎', options: ['Thumbs Down (Disapproval)', 'Thumbs Up', 'Applause', 'Raising hands'], correctIndex: 0 },
      { prompt: 'Find the odd fruit by seeds/rind:', display: '🍉 🍉 🍉 🍓 🍉', options: ['Strawberry (Seeds on outside, others are melons)', 'Watermelon', 'Cantaloupe', 'Honeydew'], correctIndex: 0 },
      { prompt: 'Which celestial item is NOT a star or moon?', display: '⭐ 🌟 ✨ 🚗', options: ['Car (Terrestrial vehicle)', 'Star', 'Glowing star', 'Sparkles'], correctIndex: 0 },
      { prompt: 'Spot the different bird species:', display: '🦉 🦉 🦉 🦆 🦉', options: ['Duck (Waterfowl, others are nocturnal raptors)', 'Barn Owl', 'Horned Owl', 'Screech Owl'], correctIndex: 0 },
      { prompt: 'Which dessert does NOT have dairy?', display: '🍦 🍨 🥛 🍎', options: ['Fresh Apple (Raw fruit, not dairy)', 'Ice Cream', 'Sundae', 'Glass of Milk'], correctIndex: 0 },
      { prompt: 'Spot the different clothing item:', display: '👕 👕 👕 👟 👕', options: ['Sneakers (Footwear, others are upper-body shirts)', 'T-shirt', 'Polo', 'Jersey'], correctIndex: 0 },
      { prompt: 'Which vehicle travels underwater?', display: '🚗 🚲 ✈️ 🤿', options: ['Scuba Diver / Submersible', 'Car', 'Bicycle', 'Airplane'], correctIndex: 0 },
      { prompt: 'Find the different expression:', display: '😍 🥰 😘 😡', options: ['Angry Face (Hostile, others are romantic/loving)', 'Heart Eyes', 'In Love', 'Blowing Kiss'], correctIndex: 0 },
      { prompt: 'Spot the odd timekeeper:', display: '⏰ ⏱️ 🕰️ 📻', options: ['Radio (Audio tuner, others are clocks)', 'Alarm clock', 'Stopwatch', 'Mantel clock'], correctIndex: 0 },
    ],
  },
  34: {
    title: 'Tech & Modern Life',
    category: 'EMOJI_COMBINATION',
    items: [
      { prompt: 'Identify this modern habit:', display: '📱 + 🤳 + 📸', options: ['Taking a selfie on phone', 'Listening to vinyl record', 'Reading printed newspaper', 'Watching VHS tape'], correctIndex: 0 },
      { prompt: 'What internet dilemma is this?', display: '📶 + ❌ + 😭', options: ['No Wi-Fi / Connection Lost', 'New computer purchase', 'Fast downloading', 'Phone upgrade'], correctIndex: 0 },
      { prompt: 'Identify this online shopping routine:', display: '💻 + 🛒 + 💳', options: ['E-Commerce checkout with credit card', 'In-person flea market', 'Cooking pasta', 'Bank deposit'], correctIndex: 0 },
      { prompt: 'What battery crisis is shown?', display: '🪫 + 🔌 + ⏳', options: ['Low battery waiting to charge', 'Full battery power', 'Solar panel farm', 'Flashlight on'], correctIndex: 0 },
      { prompt: 'Identify this virtual work reality:', display: '💻 + 🎧 + 👔', options: ['Work from home video conference', 'Beach party', 'Forest hike', 'Concert performance'], correctIndex: 0 },
      { prompt: 'What streaming habit is this?', display: '📺 + 🍿 + 🛋️', options: ['Binge watching TV shows on couch', 'Going for a jog', 'Washing dishes', 'Ironing clothes'], correctIndex: 0 },
      { prompt: 'Identify this cybersecurity tool:', display: '🔒 + 🔑 + 🛡️', options: ['Password & firewall security protection', 'Broken lock', 'Open doorway', 'Key duplicate'], correctIndex: 0 },
      { prompt: 'What mobile notification is this?', display: '📱 + 🔴 + 💬', options: ['Unread message notification', 'Airplane mode', 'Flashlight toggle', 'Muted ringtone'], correctIndex: 0 },
      { prompt: 'Identify this audio trend:', display: '🎙️ + 🎧 + 🗣️', options: ['Hosting a podcast interview', 'Silent meditation', 'Reading paperback', 'Singing opera'], correctIndex: 0 },
      { prompt: 'What futuristic tech is this?', display: '👓 + 🤖 + 🌐', options: ['Virtual Reality & Artificial Intelligence', 'Typewriter', 'Rotary telephone', 'Abacus'], correctIndex: 0 },
    ],
  },
  35: {
    title: 'Memory Grandmaster',
    category: 'EMOJI_MEMORY',
    items: [
      { prompt: 'Which rare emoji was in the group?', display: '👀 GRANDMASTER', memoryEmojis: ['🦥', '🚀', '🍕', '💎', '🎸'], options: ['🦥 (Sloth)', '🦁 (Lion)', '🐼 (Panda)', '🦊 (Fox)'], correctIndex: 0 },
      { prompt: 'Which fruit was displayed?', display: '👀 GRANDMASTER', memoryEmojis: ['🥭', '🚗', '🐱', '⚽', '👑'], options: ['🥭 (Mango)', '🍎 (Apple)', '🍌 (Banana)', '🍓 (Strawberry)'], correctIndex: 0 },
      { prompt: 'Which celestial object did you spot?', display: '👀 GRANDMASTER', memoryEmojis: ['🪐', '🍔', '🐶', '👟', '📱'], options: ['🪐 (Saturn with Rings)', '☀️ (Sun)', '🌙 (Moon)', '⭐ (Star)'], correctIndex: 0 },
      { prompt: 'Which sport ball was hidden?', display: '👀 GRANDMASTER', memoryEmojis: ['🎱', '🍉', '🚲', '🔥', '💻'], options: ['🎱 (8-Ball Pool)', '⚽ (Soccer)', '🏀 (Basketball)', '🎾 (Tennis)'], correctIndex: 0 },
      { prompt: 'Which musical instrument was shown?', display: '👀 GRANDMASTER', memoryEmojis: ['🎷', '🚗', '🦁', '🍕', '💎'], options: ['🎷 (Saxophone)', '🎸 (Guitar)', '🎹 (Piano)', '🥁 (Drums)'], correctIndex: 0 },
      { prompt: 'Which sea creature was displayed?', display: '👀 GRANDMASTER', memoryEmojis: ['🦞', '🍔', '⭐', '👟', '👑'], options: ['🦞 (Lobster)', '🦀 (Crab)', '🦐 (Shrimp)', '🐙 (Octopus)'], correctIndex: 0 },
      { prompt: 'Which dessert was in the list?', display: '👀 GRANDMASTER', memoryEmojis: ['🥧', '🚀', '🐱', '⚽', '📱'], options: ['🥧 (Pie slice)', '🍩 (Donut)', '🍰 (Cake)', '🍦 (Ice cream)'], correctIndex: 0 },
      { prompt: 'Which winged animal did you see?', display: '👀 GRANDMASTER', memoryEmojis: ['🦇', '🍉', '🚲', '🔥', '💎'], options: ['🦇 (Bat)', '🦅 (Eagle)', '🦉 (Owl)', '🕊️ (Dove)'], correctIndex: 0 },
      { prompt: 'Which emergency vehicle was shown?', display: '👀 GRANDMASTER', memoryEmojis: ['🚒', '🍔', '🐶', '👟', '💻'], options: ['🚒 (Fire Truck)', '🚑 (Ambulance)', '🚓 (Police car)', '🚕 (Taxi)'], correctIndex: 0 },
      { prompt: 'Which flower was memorized?', display: '👀 GRANDMASTER', memoryEmojis: ['🪷', '🚀', '🍕', '⚽', '👑'], options: ['🪷 (Lotus Blossom)', '🌹 (Rose)', '🌻 (Sunflower)', '🌷 (Tulip)'], correctIndex: 0 },
    ],
  },
  36: {
    title: 'Grand Combinations',
    category: 'EMOJI_COMBINATION',
    items: [
      { prompt: 'Solve this 4-part emoji riddle:', display: '☀️ + 🕶️ + 🏖️ + 🍹', options: ['Tropical Beach Vacation', 'Winter Ski Trip', 'Office Working Day', 'Desert Lost Journey'], correctIndex: 0 },
      { prompt: 'What grand event is represented?', display: '🏟️ + 🏃 + 🥇 + 🌍', options: ['Olympic Games Championship', 'Local School Race', 'Sunday Stroll', 'Gym Workout'], correctIndex: 0 },
      { prompt: 'Identify this cinema mystery:', display: '🔍 + 🕵️‍♂️ + 👣 + 💡', options: ['Detective solving a mystery case', 'Shoe shopping', 'Lighting installation', 'Doctor appointment'], correctIndex: 0 },
      { prompt: 'What romantic celebration is this?', display: '💒 + 👰 + 🤵 + 💍', options: ['Royal Wedding Ceremony', 'Birthday Party', 'Baby Shower', 'School Dance'], correctIndex: 0 },
      { prompt: 'Identify this artistic career:', display: '🎨 + 🖌️ + 🖼️ + 🏛️', options: ['Fine Artist displaying in museum', 'House painter', 'Wall graffiti cleaner', 'Color salesman'], correctIndex: 0 },
      { prompt: 'What space exploration is this?', display: '🚀 + 🌕 + 👨‍🚀 + 🇺🇸', options: ['Apollo Moon Landing', 'Satellite repair', 'Airplane flight', 'Helicopter tour'], correctIndex: 0 },
      { prompt: 'Identify this global climate theme:', display: '🌍 + 🌡️ + 🧊 + 💧', options: ['Global Warming / Polar Ice Melting', 'Deep Winter Freeze', 'Volcanic Eruption', 'Desert Sandstorm'], correctIndex: 0 },
      { prompt: 'What scientific breakthrough is shown?', display: '🔬 + 🧬 + 🧪 + 💡', options: ['Biochemical Gene Discovery', 'Baking Bread', 'Car Repair', 'Painting Canvas'], correctIndex: 0 },
      { prompt: 'Identify this deep sea voyage:', display: '🚢 + 🌊 + 🤿 + 🐠', options: ['Marine Scuba Diving Expedition', 'Fishing pier trip', 'Pool swimming', 'Bath time'], correctIndex: 0 },
      { prompt: 'What championship victory is this?', display: '⚽ + 🏟️ + 🏆 + 🎆', options: ['World Cup Football Triumph!', 'Friendly training', 'Pre-season warm-up', 'Ticket reservation'], correctIndex: 0 },
    ],
  },
  37: {
    title: 'Global Odyssey',
    category: 'EMOJI_COUNTRY',
    items: [
      { prompt: 'Identify this ancient wonder country:', display: '🏺 + 🏛️ + 🫒 + 🇬🇷', options: ['Greece', 'Italy', 'Spain', 'Turkey'], correctIndex: 0 },
      { prompt: 'Identify this Scandinavian aurora land:', display: '❄️ + 🦌 + 🌌 + 🛖', options: ['Lapland / Finland & Norway', 'Egypt', 'Brazil', 'Australia'], correctIndex: 0 },
      { prompt: 'Which high altitude nation is this?', display: '🏔️ + 🦙 + 🌽 + 🇵🇪', options: ['Peru (Machu Picchu)', 'Argentina', 'Chile', 'Ecuador'], correctIndex: 0 },
      { prompt: 'Identify this Caribbean island:', display: '🏝️ + 🌴 + 🎸 + 🇯🇲', options: ['Jamaica', 'Cuba', 'Bahamas', 'Haiti'], correctIndex: 0 },
      { prompt: 'Which spice and silk nation is this?', display: '🏯 + 🐼 + 🥢 + 🐉', options: ['China', 'Japan', 'Vietnam', 'Korea'], correctIndex: 0 },
      { prompt: 'Identify this cradle of coffee:', display: '☕ + 🏃‍♂️ + 🦁 + 🇪🇹', options: ['Ethiopia (Great Rift Valley & Coffee birthplace)', 'Kenya', 'Uganda', 'Tanzania'], correctIndex: 0 },
      { prompt: 'Which desert oasis kingdom is this?', display: '🐪 + 🌴 + 🏰 + 🇲🇦', options: ['Morocco', 'Algeria', 'Tunisia', 'Libya'], correctIndex: 0 },
      { prompt: 'Identify this geothermal wonderland:', display: '🌋 + 🧊 + ♨️ + 🇮🇸', options: ['Iceland', 'Greenland', 'Faroe Islands', 'Ireland'], correctIndex: 0 },
      { prompt: 'Which kiwi bird country is this?', display: '🥝 + 🏉 + 🏔️ + 🇳🇿', options: ['New Zealand', 'Australia', 'Fiji', 'Samoa'], correctIndex: 0 },
      { prompt: 'Identify this diamond and savannah land:', display: '💎 + 🦁 + 🍷 + 🇿🇦', options: ['South Africa', 'Botswana', 'Namibia', 'Zimbabwe'], correctIndex: 0 },
    ],
  },
  38: {
    title: 'Sequence Mastery',
    category: 'EMOJI_SEQUENCE',
    items: [
      { prompt: 'Solve the cosmic expansion sequence:', display: '🌌 🪐 🌍 ?', options: ['🏙️ (Human Civilizations)', '🍎 (Apple)', '🚗 (Car)', '🎸 (Guitar)'], correctIndex: 0 },
      { prompt: 'Complete the tournament pyramid:', display: '🥉 🥈 🥇 ?', options: ['🏆 (Grand Trophy Champion)', '⚽ (Soccer ball)', '👟 (Shoes)', '🎫 (Ticket)'], correctIndex: 0 },
      { prompt: 'Complete the creative process:', display: '💡 📝 🎨 ?', options: ['🖼️ (Masterpiece Framed)', '🗑️ (Trash)', '😴 (Sleep)', '🚗 (Drive)'], correctIndex: 0 },
      { prompt: 'What completes the friendship journey?', display: '👋 🤝 🫂 ?', options: ['💖 (Enduring Love & Bond)', '😡 (Anger)', '💔 (Broken)', '🚪 (Exit)'], correctIndex: 0 },
      { prompt: 'Complete the building progression:', display: '🧱 🏗️ 🏢 ?', options: ['🏙️ (Skyline Metropolis)', '🌳 (Tree)', '🚜 (Tractor)', '⛺ (Tent)'], correctIndex: 0 },
      { prompt: 'Complete the culinary craft:', display: '🌾 🍞 🥪 ?', options: ['😋 (Satisfying Bite)', '🌱 (Seed)', '🚜 (Tractor)', '🛒 (Cart)'], correctIndex: 0 },
      { prompt: 'Complete the journey from seed to oil:', display: '🫒 🧺 🫗 ?', options: ['🥗 (Delicious Dressed Salad)', '🍕 (Pizza)', '🍎 (Apple)', '🍦 (Ice cream)'], correctIndex: 0 },
      { prompt: 'Complete the coding workflow:', display: '💻 ⌨️ 🐛 ?', options: ['✨ (Clean Working Software!)', '💥 (Crash)', '😴 (Sleep)', '🍔 (Fast food)'], correctIndex: 0 },
      { prompt: 'Complete the musical progression:', display: '🎼 🎻 🎺 ?', options: ['🎶 (Harmonious Symphony)', '🔇 (Mute)', '📻 (Radio)', '💿 (Disc)'], correctIndex: 0 },
      { prompt: 'Complete the life of a star:', display: '☁️ ☀️ 🔴 ?', options: ['💥 (Supernova Explosion)', '🌙 (Moon)', '🌱 (Plant)', '💧 (Water)'], correctIndex: 0 },
    ],
  },
  39: {
    title: 'Lightning Round',
    category: 'EMOJI_SPEED_ROUND',
    items: [
      { prompt: 'Speed! What animal has black and white stripes?', display: '🦓', options: ['Zebra', 'Horse', 'Donkey', 'Tiger'], correctIndex: 0 },
      { prompt: 'Speed! What tool drives nails?', display: '🔨', options: ['Hammer', 'Wrench', 'Pliers', 'Screwdriver'], correctIndex: 0 },
      { prompt: 'Speed! What is the primary heat source of Earth?', display: '☀️', options: ['The Sun', 'Campfire', 'Volcano', 'Lightbulb'], correctIndex: 0 },
      { prompt: 'Speed! Which sport uses a shuttlecock?', display: '🏸', options: ['Badminton', 'Tennis', 'Squash', 'Golf'], correctIndex: 0 },
      { prompt: 'Speed! What treat is sweet, cold, and melts?', display: '🍦', options: ['Ice Cream', 'Hot Soup', 'Popcorn', 'Steak'], correctIndex: 0 },
      { prompt: 'Speed! Which animal is man\'s best friend?', display: '🐕', options: ['Dog', 'Cat', 'Bird', 'Hamster'], correctIndex: 0 },
      { prompt: 'Speed! What symbol indicates supreme victory?', display: '🏆', options: ['Trophy', 'Coin', 'Badge', 'Ticket'], correctIndex: 0 },
      { prompt: 'Speed! What red liquid flows through hearts?', display: '🩸', options: ['Blood', 'Water', 'Juice', 'Wine'], correctIndex: 0 },
      { prompt: 'Speed! What weapon does an archer shoot?', display: '🏹', options: ['Bow and Arrow', 'Sword', 'Shield', 'Cannon'], correctIndex: 0 },
      { prompt: 'Speed! What instrument has 88 black and white keys?', display: '🎹', options: ['Piano', 'Guitar', 'Drums', 'Flute'], correctIndex: 0 },
    ],
  },
  40: {
    title: 'Tournament Championship Finals',
    category: 'EMOJI_COMBINATION',
    items: [
      { prompt: 'Final Challenge 1: The Ultimate Champion:', display: '🧠 + ⚡ + 🏆 + 🥇', options: ['The Ultimate Grandmaster Champion', 'Casual Player', 'Runner-up', 'Disqualified'], correctIndex: 0 },
      { prompt: 'Final Challenge 2: Master Movie Riddle:', display: '🧙‍♂️ + 🧝‍♀️ + 💍 + 🌋', options: ['The Lord of the Rings: Return of the King', 'Harry Potter', 'Star Wars', 'The Hobbit'], correctIndex: 0 },
      { prompt: 'Final Challenge 3: Extreme Odd One Out:', display: '👑 👑 👑 🧢 👑', options: ['Baseball Cap (Casual hat, others are royal crowns)', 'Crown', 'Tiara', 'Diadem'], correctIndex: 0 },
      { prompt: 'Final Challenge 4: Ultimate Idiom:', display: '⚡ + 瓶 (Bottle)', options: ['Catching lightning in a bottle (Rare genius feat)', 'Electric shock', 'Recycling glass', 'Thunderstorm'], correctIndex: 0 },
      { prompt: 'Final Challenge 5: Global Landmark Riddle:', display: '🕌 + 🏛️ + 🛕 + 🌏', options: ['Ancient World Wonders & Heritage', 'Theme park', 'City mall', 'Hospital'], correctIndex: 0 },
      { prompt: 'Final Challenge 6: Master Sequence:', display: '🌱 🌿 🌳 🪵 ?', options: ['🔥 (Rebirth of the Forest)', '🌧️ (Rain)', '🚗 (Car)', '📱 (Phone)'], correctIndex: 0 },
      { prompt: 'Final Challenge 7: Category Elimination:', display: '💎 💍 👑 🪨', options: ['Rough Stone (Unpolished rock, others are royal jewelry)', 'Diamond', 'Ring', 'Crown'], correctIndex: 0 },
      { prompt: 'Final Challenge 8: Grand Food Symphony:', display: '🍕 + 🍝 + 🧀 + 🍷', options: ['Master Italian Culinary Feast', 'Fast Food Snack', 'Breakfast Cereal', 'Candy Bar'], correctIndex: 0 },
      { prompt: 'Final Challenge 9: Lightning Reflex:', display: '💯 + 🔥 + ⭐', options: ['Flawless Perfect Performance', 'Zero score', 'Warning error', 'Slow answer'], correctIndex: 0 },
      { prompt: 'Final Challenge 10: Emoji Fun Master Motto:', display: '😀 + 🧠 + 🏆', options: ['Play with Joy, Think Sharp, Win the Championship!', 'Sleep early', 'Stay quiet', 'Give up'], correctIndex: 0 },
    ],
  },
};

/**
 * Returns all questions for a given level (1 to 40).
 * Every level is guaranteed to have at least 10 unique, fully-formed questions.
 */
export function getQuestionsForLevel(levelNumber: number): EmojiQuestion[] {
  const level = Math.max(1, Math.min(40, levelNumber));
  const cfg = LEVEL_CONFIGS.find((c) => c.level === level) || LEVEL_CONFIGS[0];

  let rawList: RawQ[] = LEVEL_QUESTIONS_DATA[level];
  if (!rawList || rawList.length < 10) {
    // Check procedural themes
    const proc = PROCEDURAL_THEMES[level];
    if (proc) {
      rawList = proc.items.map((it) => ({
        type: proc.category,
        prompt: it.prompt,
        display: it.display,
        options: it.options,
        correctIndex: it.correctIndex,
        explanation: it.exp,
      }));
    } else {
      // Fallback safe level
      rawList = LEVEL_QUESTIONS_DATA[1];
    }
  }

  // Map into strongly-typed EmojiQuestion objects with deterministic scoring values
  const difficulty: EmojiQuestion['difficulty'] =
    level <= 5 ? 'EASY' : level <= 15 ? 'MEDIUM' : level <= 30 ? 'HARD' : 'EXPERT';

  const basePointsMap: Record<EmojiQuestion['difficulty'], number> = {
    EASY: 60,
    MEDIUM: 110,
    HARD: 180,
    EXPERT: 260,
  };

  return rawList.slice(0, 10).map((raw, idx) => {
    // Shuffle options while tracking the correct answer index
    const originalCorrectText = raw.options[raw.correctIndex];
    // Create a deterministic pseudo-shuffle based on question id and level
    const optionsWithMarker = raw.options.map((text, i) => ({
      text,
      isCorrect: i === raw.correctIndex,
    }));

    // For variety, rotate options deterministically based on (level + idx)
    const shift = (level * 3 + idx) % 4;
    const rotated = [
      ...optionsWithMarker.slice(shift),
      ...optionsWithMarker.slice(0, shift),
    ];
    const newCorrectIndex = rotated.findIndex((item) => item.isCorrect);

    return {
      id: `q_lvl_${level}_${idx + 1}`,
      level,
      questionIndex: idx + 1,
      type: raw.type,
      prompt: raw.prompt,
      emojiDisplay: raw.display,
      memoryEmojis: raw.memoryEmojis,
      options: rotated.map((r) => r.text),
      correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
      explanation: raw.explanation,
      difficulty,
      basePoints: (raw.points || basePointsMap[difficulty]) + (idx % 3) * 10,
      timeLimitSeconds: cfg.timeLimitSeconds,
    };
  });
}

export const EMOJI_LEVELS_DATABASE = LEVEL_CONFIGS;
