/**
 * EMOJI IQ — Comprehensive Emoji Library & Categories
 * Provides hundreds of distinct emoji assets with visual metadata and count variants.
 */

export interface EmojiAsset {
  char: string;
  name: string;
  category: 'FOOD' | 'SPORTS' | 'ANIMALS' | 'OBJECTS' | 'FACES' | 'SYMBOLS';
  multiChar?: string; // variant with multiple items (e.g. 🍌🍌, 🍎🍎, 🍇🍇)
  subVariantChar?: string; // variant with visual difference (e.g. single item, missing feature, accessory)
}

export const EMOJI_FOOD: EmojiAsset[] = [
  { char: '🍎', name: 'Red Apple', category: 'FOOD', multiChar: '🍎🍎', subVariantChar: '🍏' },
  { char: '🍌', name: 'Banana', category: 'FOOD', multiChar: '🍌🍌🍌', subVariantChar: '🍌' },
  { char: '🍉', name: 'Watermelon', category: 'FOOD', multiChar: '🍉🍉', subVariantChar: '🍉' },
  { char: '🍓', name: 'Strawberry', category: 'FOOD', multiChar: '🍓🍓', subVariantChar: '🍓' },
  { char: '🍒', name: 'Cherries', category: 'FOOD', multiChar: '🍒🍒', subVariantChar: '🍒' },
  { char: '🍋', name: 'Lemon', category: 'FOOD', multiChar: '🍋🍋', subVariantChar: '🍋' },
  { char: '🥝', name: 'Kiwi', category: 'FOOD', multiChar: '🥝🥝', subVariantChar: '🥝' },
  { char: '🍇', name: 'Grapes', category: 'FOOD', multiChar: '🍇🍇', subVariantChar: '🍇' },
  { char: '🍕', name: 'Pizza Slice', category: 'FOOD', multiChar: '🍕🍕', subVariantChar: '🍕' },
  { char: '🍔', name: 'Burger', category: 'FOOD', multiChar: '🍔🍔', subVariantChar: '🍔' },
  { char: '🍟', name: 'French Fries', category: 'FOOD', multiChar: '🍟🍟', subVariantChar: '🍟' },
  { char: '🌭', name: 'Hot Dog', category: 'FOOD', multiChar: '🌭🌭', subVariantChar: '🌭' },
  { char: '🌮', name: 'Taco', category: 'FOOD', multiChar: '🌮🌮', subVariantChar: '🌮' },
  { char: '🍩', name: 'Donut', category: 'FOOD', multiChar: '🍩🍩', subVariantChar: '🍩' },
  { char: '🍪', name: 'Cookie', category: 'FOOD', multiChar: '🍪🍪', subVariantChar: '🍪' },
  { char: '🎂', name: 'Birthday Cake', category: 'FOOD', multiChar: '🎂🎂', subVariantChar: '🍰' },
  { char: '🍰', name: 'Shortcake', category: 'FOOD', multiChar: '🍰🍰', subVariantChar: '🍰' },
  { char: '🍫', name: 'Chocolate Bar', category: 'FOOD', multiChar: '🍫🍫', subVariantChar: '🍫' },
  { char: '🍭', name: 'Lollipop', category: 'FOOD', multiChar: '🍭🍭', subVariantChar: '🍭' },
  { char: '🍿', name: 'Popcorn', category: 'FOOD', multiChar: '🍿🍿', subVariantChar: '🍿' },
  { char: '🧁', name: 'Cupcake', category: 'FOOD', multiChar: '🧁🧁', subVariantChar: '🧁' },
];

export const EMOJI_SPORTS: EmojiAsset[] = [
  { char: '⚽', name: 'Soccer Ball', category: 'SPORTS', multiChar: '⚽⚽', subVariantChar: '⚽' },
  { char: '🏀', name: 'Basketball', category: 'SPORTS', multiChar: '🏀🏀', subVariantChar: '🏀' },
  { char: '🏈', name: 'Football', category: 'SPORTS', multiChar: '🏈🏈', subVariantChar: '🏈' },
  { char: '⚾', name: 'Baseball', category: 'SPORTS', multiChar: '⚾⚾', subVariantChar: '⚾' },
  { char: '🎾', name: 'Tennis', category: 'SPORTS', multiChar: '🎾🎾', subVariantChar: '🎾' },
  { char: '🏐', name: 'Volleyball', category: 'SPORTS', multiChar: '🏐🏐', subVariantChar: '🏐' },
  { char: '🏆', name: 'Trophy', category: 'SPORTS', multiChar: '🏆🏆', subVariantChar: '🥇' },
  { char: '🥇', name: 'Gold Medal', category: 'SPORTS', multiChar: '🥇🥇', subVariantChar: '🥈' },
  { char: '🥈', name: 'Silver Medal', category: 'SPORTS', multiChar: '🥈🥈', subVariantChar: '🥉' },
];

export const EMOJI_ANIMALS: EmojiAsset[] = [
  { char: '🐶', name: 'Dog', category: 'ANIMALS', multiChar: '🐶🐶', subVariantChar: '🐕' },
  { char: '🐱', name: 'Cat', category: 'ANIMALS', multiChar: '🐱🐱', subVariantChar: '🐈' },
  { char: '🐭', name: 'Mouse', category: 'ANIMALS', multiChar: '🐭🐭', subVariantChar: '🐁' },
  { char: '🐹', name: 'Hamster', category: 'ANIMALS', multiChar: '🐹🐹', subVariantChar: '🐹' },
  { char: '🐰', name: 'Rabbit', category: 'ANIMALS', multiChar: '🐰🐰', subVariantChar: '🐇' },
  { char: '🦊', name: 'Fox', category: 'ANIMALS', multiChar: '🦊🦊', subVariantChar: '🦊' },
  { char: '🐻', name: 'Bear', category: 'ANIMALS', multiChar: '🐻🐻', subVariantChar: '🐻' },
  { char: '🐼', name: 'Panda', category: 'ANIMALS', multiChar: '🐼🐼', subVariantChar: '🐼' },
  { char: '🐨', name: 'Koala', category: 'ANIMALS', multiChar: '🐨🐨', subVariantChar: '🐨' },
  { char: '🐯', name: 'Tiger', category: 'ANIMALS', multiChar: '🐯🐯', subVariantChar: '🐅' },
  { char: '🦁', name: 'Lion', category: 'ANIMALS', multiChar: '🦁🦁', subVariantChar: '🦁' },
  { char: '🐮', name: 'Cow', category: 'ANIMALS', multiChar: '🐮🐮', subVariantChar: '🐄' },
  { char: '🐷', name: 'Pig', category: 'ANIMALS', multiChar: '🐷🐷', subVariantChar: '🐖' },
  { char: '🐸', name: 'Frog', category: 'ANIMALS', multiChar: '🐸🐸', subVariantChar: '🐸' },
  { char: '🐵', name: 'Monkey', category: 'ANIMALS', multiChar: '🐵🐵', subVariantChar: '🐒' },
  { char: '🐔', name: 'Chicken', category: 'ANIMALS', multiChar: '🐔🐔', subVariantChar: '🐓' },
  { char: '🐧', name: 'Penguin', category: 'ANIMALS', multiChar: '🐧🐧', subVariantChar: '🐧' },
  { char: '🐦', name: 'Bird', category: 'ANIMALS', multiChar: '🐦🐦', subVariantChar: '🕊️' },
  { char: '🦄', name: 'Unicorn', category: 'ANIMALS', multiChar: '🦄🦄', subVariantChar: '🦄' },
  { char: '🐝', name: 'Bee', category: 'ANIMALS', multiChar: '🐝🐝', subVariantChar: '🐝' },
];

export const EMOJI_OBJECTS: EmojiAsset[] = [
  { char: '🚗', name: 'Red Car', category: 'OBJECTS', multiChar: '🚗🚗', subVariantChar: '🏎️' },
  { char: '🚕', name: 'Taxi', category: 'OBJECTS', multiChar: '🚕🚕', subVariantChar: '🚕' },
  { char: '🚌', name: 'Bus', category: 'OBJECTS', multiChar: '🚌🚌', subVariantChar: '🚌' },
  { char: '🚓', name: 'Police Car', category: 'OBJECTS', multiChar: '🚓🚓', subVariantChar: '🚓' },
  { char: '✈️', name: 'Airplane', category: 'OBJECTS', multiChar: '✈️✈️', subVariantChar: '🛩️' },
  { char: '🚀', name: 'Rocket', category: 'OBJECTS', multiChar: '🚀🚀', subVariantChar: '🛸' },
  { char: '🚲', name: 'Bicycle', category: 'OBJECTS', multiChar: '🚲🚲', subVariantChar: '🛴' },
  { char: '⌚', name: 'Watch', category: 'OBJECTS', multiChar: '⌚⌚', subVariantChar: '⏰' },
  { char: '📱', name: 'Smartphone', category: 'OBJECTS', multiChar: '📱📱', subVariantChar: '📲' },
  { char: '💻', name: 'Laptop', category: 'OBJECTS', multiChar: '💻💻', subVariantChar: '🖥️' },
  { char: '🎸', name: 'Guitar', category: 'OBJECTS', multiChar: '🎸🎸', subVariantChar: '🎻' },
  { char: '🎧', name: 'Headphones', category: 'OBJECTS', multiChar: '🎧🎧', subVariantChar: '🎙️' },
  { char: '📷', name: 'Camera', category: 'OBJECTS', multiChar: '📷📷', subVariantChar: '📸' },
  { char: '🔑', name: 'Key', category: 'OBJECTS', multiChar: '🔑🔑', subVariantChar: '🗝️' },
  { char: '👟', name: 'Sneaker', category: 'OBJECTS', multiChar: '👟👟', subVariantChar: '👟' },
];

export const EMOJI_FACES: EmojiAsset[] = [
  { char: '😀', name: 'Grinning', category: 'FACES', multiChar: '😀😀', subVariantChar: '🙂' },
  { char: '😃', name: 'Smiley', category: 'FACES', multiChar: '😃😃', subVariantChar: '😄' },
  { char: '😄', name: 'Smile', category: 'FACES', multiChar: '😄😄', subVariantChar: '😊' },
  { char: '😁', name: 'Beaming', category: 'FACES', multiChar: '😁😁', subVariantChar: '😆' },
  { char: '😆', name: 'Laughing', category: 'FACES', multiChar: '😆😆', subVariantChar: '🤣' },
  { char: '😂', name: 'Joy', category: 'FACES', multiChar: '😂😂', subVariantChar: '😭' },
  { char: '🤣', name: 'ROFL', category: 'FACES', multiChar: '🤣🤣', subVariantChar: '😂' },
  { char: '😊', name: 'Blushing', category: 'FACES', multiChar: '😊😊', subVariantChar: '☺️' },
  { char: '😍', name: 'Heart Eyes', category: 'FACES', multiChar: '😍😍', subVariantChar: '🥰' },
  { char: '🥰', name: 'Smiling Hearts', category: 'FACES', multiChar: '🥰🥰', subVariantChar: '😍' },
  { char: '😎', name: 'Cool Glasses', category: 'FACES', multiChar: '😎😎', subVariantChar: '🤓' },
  { char: '🤩', name: 'Star Struck', category: 'FACES', multiChar: '🤩🤩', subVariantChar: '✨' },
  { char: '🥳', name: 'Party Face', category: 'FACES', multiChar: '🥳🥳', subVariantChar: '🎉' },
  { char: '🤔', name: 'Thinking', category: 'FACES', multiChar: '🤔🤔', subVariantChar: '🧐' },
  { char: '😱', name: 'Scream', category: 'FACES', multiChar: '😱😱', subVariantChar: '😨' },
  { char: '😭', name: 'Sobbing', category: 'FACES', multiChar: '😭😭', subVariantChar: '😢' },
  { char: '😡', name: 'Pouting', category: 'FACES', multiChar: '😡😡', subVariantChar: '🤬' },
  { char: '🤯', name: 'Mind Blown', category: 'FACES', multiChar: '🤯🤯', subVariantChar: '💥' },
  { char: '😴', name: 'Sleeping', category: 'FACES', multiChar: '😴😴', subVariantChar: '🥱' },
  { char: '👿', name: 'Imp Devil', category: 'FACES', multiChar: '👿👿', subVariantChar: '😈' },
  { char: '🤢', name: 'Nauseated', category: 'FACES', multiChar: '🤢🤢', subVariantChar: '🤮' },
  { char: '😬', name: 'Grimace', category: 'FACES', multiChar: '😬😬', subVariantChar: '😐' },
];

export const EMOJI_SYMBOLS: EmojiAsset[] = [
  { char: '❤️', name: 'Red Heart', category: 'SYMBOLS', multiChar: '❤️❤️', subVariantChar: '💔' },
  { char: '🧡', name: 'Orange Heart', category: 'SYMBOLS', multiChar: '🧡🧡', subVariantChar: '💛' },
  { char: '💛', name: 'Yellow Heart', category: 'SYMBOLS', multiChar: '💛💛', subVariantChar: '💚' },
  { char: '💚', name: 'Green Heart', category: 'SYMBOLS', multiChar: '💚💚', subVariantChar: '💙' },
  { char: '💙', name: 'Blue Heart', category: 'SYMBOLS', multiChar: '💙💙', subVariantChar: '💜' },
  { char: '💜', name: 'Purple Heart', category: 'SYMBOLS', multiChar: '💜💜', subVariantChar: '🖤' },
  { char: '🖤', name: 'Black Heart', category: 'SYMBOLS', multiChar: '🖤🖤', subVariantChar: '🤍' },
  { char: '🤍', name: 'White Heart', category: 'SYMBOLS', multiChar: '🤍🤍', subVariantChar: '❤️' },
  { char: '⭐', name: 'Star', category: 'SYMBOLS', multiChar: '⭐⭐', subVariantChar: '🌟' },
  { char: '🌟', name: 'Glowing Star', category: 'SYMBOLS', multiChar: '🌟🌟', subVariantChar: '⭐' },
  { char: '🔥', name: 'Fire', category: 'SYMBOLS', multiChar: '🔥🔥', subVariantChar: '⚡' },
  { char: '💎', name: 'Diamond', category: 'SYMBOLS', multiChar: '💎💎', subVariantChar: '💍' },
  { char: '🎯', name: 'Bullseye', category: 'SYMBOLS', multiChar: '🎯🎯', subVariantChar: '🏹' },
];

export const ALL_EMOJIS = [
  ...EMOJI_FOOD,
  ...EMOJI_SPORTS,
  ...EMOJI_ANIMALS,
  ...EMOJI_OBJECTS,
  ...EMOJI_FACES,
  ...EMOJI_SYMBOLS,
];
