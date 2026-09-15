import React, { useMemo } from 'react';
import { getGameArtworkUrl } from '../services/gameArtwork';

interface ArtworkProps {
  gameId: string;
  className?: string;
  alt?: string;
}

/**
 * OriginalGameArtwork
 * Renders high-definition 3D game posters and banners for GameON Tele.
 * Ensures:
 * - Real 3D depth, cinematic lighting, and realistic materials
 * - Safe central composition visible across mobile and desktop
 * - Zero non-gaming icons, emojis, or text badges
 * - Subtle hover zoom & specular depth
 */
export const OriginalGameArtwork: React.FC<ArtworkProps> = ({ gameId, className = '', alt }) => {
  const artworkUrl = useMemo(() => getGameArtworkUrl(gameId), [gameId]);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center select-none group ${className}`}>
      {artworkUrl ? (
        <img
          src={artworkUrl}
          alt={alt || `${gameId} game artwork`}
          className="w-full h-full object-cover object-center transform transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full h-full bg-slate-900 animate-pulse" />
      )}
      {/* Subtle Specular Ambient Vignette / Edge Depth */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-60 group-hover:opacity-30 transition-opacity duration-300" />
    </div>
  );
};
