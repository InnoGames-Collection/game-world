import React from 'react';

interface GoPlayLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark'; // 'light' = black "PLAY" (default), 'dark' = white "PLAY" for dark headers
}

export const GoPlayLogo: React.FC<GoPlayLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
}) => {
  // Balanced emblem height: xs=20, sm=26, md=32, lg=42, xl=54
  const height = 
    size === 'xs' ? 20 :
    size === 'sm' ? 26 : 
    size === 'lg' ? 42 : 
    size === 'xl' ? 54 : 
    32;

  const playColor = variant === 'dark' ? '#FFFFFF' : '#000000';

  return (
    <div className={`inline-flex items-center select-none shrink-0 ${className}`}>
      <svg
        height={height}
        viewBox="0 0 280 92"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 aspect-[280/92] drop-shadow-xs"
        aria-label="GoPlay Official Logo"
      >
        {/* G GLYPH */}
        <rect x="8" y="10" width="62" height="72" rx="16" fill="#82C341"/>
        {/* G Inner Notch Cutout: Branching Left from vertical slit */}
        <path d="M 45 38 L 24 38 L 24 43.5 L 40.5 43.5 L 40.5 64 L 46 64 L 46 38 Z" fill="#FFFFFF"/>

        {/* O GLYPH */}
        <rect x="78" y="10" width="62" height="72" rx="16" fill="#82C341"/>
        {/* O Inner Vertical Slit */}
        <rect x="106" y="38" width="5.5" height="26" rx="1" fill="#FFFFFF"/>

        {/* GAME CONTROLLER ICON (Top Right) */}
        <rect x="156" y="10" width="112" height="40" rx="9" stroke="#82C341" strokeWidth="5" fill="none"/>
        {/* D-Pad Plus (+) */}
        <path d="M 183 23 L 187 23 L 187 28 L 192 28 L 192 32 L 187 32 L 187 37 L 183 37 L 183 32 L 178 32 L 178 28 L 183 28 Z" fill="#82C341"/>
        {/* Diamond Buttons (A, B, X, Y dots) */}
        <circle cx="236" cy="23" r="3.2" fill="#82C341"/>
        <circle cx="236" cy="37" r="3.2" fill="#82C341"/>
        <circle cx="229" cy="30" r="3.2" fill="#82C341"/>
        <circle cx="243" cy="30" r="3.2" fill="#82C341"/>

        {/* PLAY TEXT (Bottom Right) */}
        {/* P */}
        <path d="M 157 56 L 173 56 C 178 56 181 58 181 63 C 181 67.5 178 70 173 70 L 165.5 70 L 165.5 84 L 157 84 Z M 165.5 62 L 171.5 62 C 173 62 174 62.5 174 63.5 C 174 64.5 173 65 171.5 65 L 165.5 65 Z" fill={playColor}/>
        {/* L */}
        <path d="M 185 56 L 193.5 56 L 193.5 77 L 206 77 L 206 84 L 185 84 Z" fill={playColor}/>
        {/* A */}
        <path d="M 216 56 L 225 56 L 233 84 L 224.5 84 L 223 78.5 L 217.5 78.5 L 216 84 L 208 84 Z M 218.5 73.5 L 222 73.5 L 220.2 65 Z" fill={playColor}/>
        {/* Y */}
        <path d="M 235 56 L 243.5 56 L 248.5 67 L 253.5 56 L 262 56 L 253 73 L 253 84 L 244.5 84 L 244.5 73 Z" fill={playColor}/>
      </svg>
    </div>
  );
};
