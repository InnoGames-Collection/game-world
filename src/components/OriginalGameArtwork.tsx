import React, { useMemo } from 'react';
import { getGameArtworkUrl } from '../services/gameArtwork';
import { getCoverUrlForGame } from '../services/gameCoverMap';

interface ArtworkProps {
  gameId: string;
  imageUrl?: string;
  className?: string;
  alt?: string;
}

/**
 * OriginalGameArtwork
 * Renders high-definition 4:3 game covers (imported from innoarcade-deploy)
 * with seamless automatic fallback to procedurally generated 3D key-art.
 */
export const OriginalGameArtwork: React.FC<ArtworkProps> = ({ gameId, imageUrl, className = '', alt }) => {
  const fallbackUrl = useMemo(() => getGameArtworkUrl(gameId), [gameId]);
  const primaryCover = useMemo(() => getCoverUrlForGame(gameId, imageUrl), [gameId, imageUrl]);
  const [currentSrc, setCurrentSrc] = React.useState<string>(primaryCover || fallbackUrl);

  React.useEffect(() => {
    setCurrentSrc(primaryCover || fallbackUrl);
  }, [primaryCover, fallbackUrl]);

  const handleImageError = () => {
    if (fallbackUrl && currentSrc !== fallbackUrl) {
      setCurrentSrc(fallbackUrl);
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center select-none group ${className}`}>
      {currentSrc ? (
        <img
          src={currentSrc}
          alt={alt || `${gameId} game artwork`}
          className="w-full h-full object-cover object-center transform transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full bg-slate-900 animate-pulse" />
      )}
      {/* Subtle Specular Ambient Vignette / Edge Depth */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-60 group-hover:opacity-30 transition-opacity duration-300" />
    </div>
  );
};
