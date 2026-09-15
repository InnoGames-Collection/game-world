/**
 * Emoji Fun — Floating Background Emojis Component
 * Creates the playful pastel pink-to-blue atmosphere with floating, rotating emojis
 */

import React, { useMemo } from 'react';
import { ALL_EMOJIS } from '../emojiPool';

interface FloatingEmoji {
  id: number;
  emoji: string;
  top: number;
  left: number;
  size: number;
  opacity: number;
  rotation: number;
  duration: number;
  delay: number;
}

export const BackgroundEmojis: React.FC = () => {
  const emojis = useMemo(() => {
    // Generate 24 distributed background emojis
    const list: FloatingEmoji[] = [];
    const pool = [...ALL_EMOJIS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 24; i++) {
      list.push({
        id: i,
        emoji: pool[i % pool.length],
        top: Math.round(Math.random() * 92),
        left: Math.round(Math.random() * 92),
        size: Math.round(24 + Math.random() * 32),
        opacity: Math.round((0.15 + Math.random() * 0.22) * 100) / 100,
        rotation: Math.round((Math.random() - 0.5) * 45),
        duration: Math.round((5 + Math.random() * 6) * 10) / 10,
        delay: Math.round(Math.random() * 4 * 10) / 10,
      });
    }
    return list;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {emojis.map((item) => (
        <span
          key={item.id}
          className="absolute transition-transform will-change-transform animate-pulse"
          style={{
            top: `${item.top}%`,
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            opacity: item.opacity,
            transform: `rotate(${item.rotation}deg)`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.06))',
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
};
