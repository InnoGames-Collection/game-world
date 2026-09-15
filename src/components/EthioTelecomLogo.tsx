import React from 'react';

interface EthioTelecomLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EthioTelecomLogo: React.FC<EthioTelecomLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  // Balanced emblem height: sm=28, md=34, lg=40
  const height = size === 'sm' ? 28 : size === 'lg' ? 40 : 34;

  return (
    <div className={`flex items-center gap-2.5 select-none shrink-0 ${className}`}>
      {/* 
        Official Ethio Telecom Stylized 'e' Emblem
        Features the 4 Authentic Colors:
        1. #0E9A47 - Dark/Emerald Green (Top-Left Outer Crescent)
        2. #7DBD24 - Bright Lime Green (Main Upper 'e' Body & Head)
        3. #0084CE - Bright Ocean/Azure Blue (Bottom-Left Swoosh Wave)
        4. #FFFFFF - Pure White (Separating Arcs & Inner 'e' Loop/Eye)
      */}
      <svg
        height={height}
        viewBox="0 0 112 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 aspect-[1.16/1] drop-shadow-xs"
        aria-label="Ethio Telecom Official Logo"
      >
        {/* 1. DARK EMERALD GREEN TOP-LEFT OUTER RIM */}
        <path
          d="M 13 63 C 5 44 13 20 33 9 C 52 -1 73 1 89 10 C 90.5 11 90.5 13 89 13.8 C 87.5 14.5 85 13.5 78 10 C 63 3.5 45 4.5 30 14 C 15 24 8 44 14 64 C 14.5 65.5 13.5 66.5 12 66 C 10.5 65.5 11.5 64 13 63 Z"
          fill="#0E9A47"
        />

        {/* 2. BRIGHT LIME GREEN UPPER 'e' HEAD & DOME */}
        <path
          d="M 23 48 C 24 30 38 17 56 16 C 76 15 94 25 99 42 C 103 55 95 69 81 75 C 68 81 52 80 40 73 C 54 71 67 65 74 55 C 80 46 79 36 71 29 C 62 21 48 22 37 30 C 27 38 22 50 23 48 Z"
          fill="#7DBD24"
        />
        <path
          d="M 24 45 C 25 28 39 16 57 15 C 77 14 95 24 99 40 C 102 54 94 67 80 73 C 67 79 51 78 39 71 C 56 69 70 61 76 48 C 78 43 76 37 70 33 C 64 27 52 27 41 33 C 31 40 25 53 24 45 Z"
          fill="#7DBD24"
        />

        {/* 3. INNER CARVED WHITE 'e' CONTOUR & CROSSBAR OPENING */}
        <path
          d="M 23 47 C 23 46 24 45 26 45 L 72 45 C 74 45 75 43.5 74 41.5 C 71 34 63 29 53 29 C 44 29 37 33 34 38 C 33 39.5 31 40 30 39 C 29 38 29 36.5 30 35 C 34 28 43 23 54 23 C 67 23 77 30 81 41 C 82.5 45 81 49 76 52 C 70 56 60 58 50 57 C 39 56 30 51 24 48 C 23 47.5 23 47 23 47 Z"
          fill="#FFFFFF"
        />

        {/* 4. BRIGHT AZURE BLUE LOWER-LEFT CRESCENT WAVE */}
        <path
          d="M 12 59 C 10 74 19 88 34 94 C 50 100 68 96 79 85 C 81 83 79 81 77 82 C 66 89 51 92 38 87 C 26 82 17 70 19 57 C 19.5 54.5 17 54 15.5 55.5 C 13.5 57 12.5 58.5 12 59 Z"
          fill="#0084CE"
        />
        <path
          d="M 14 61 C 13 72 21 84 34 89 C 47 94 63 91 74 82 C 60 87 45 84 34 76 C 25 69 21 59 21 49 C 21 47.5 19 47 18 48 C 15 52 14 56 14 61 Z"
          fill="#0084CE"
        />
      </svg>

      {/* Official Ethio Telecom Wordmark & Amharic Script */}
      <div className="flex flex-col justify-center leading-none select-none">
        <div className="flex items-baseline">
          <span className="font-black text-[#111111] text-[15px] sm:text-[16.5px] tracking-tight font-sans">
            ethio telecom
          </span>
          <span className="text-[8px] font-black text-[#111111] ml-0.5 relative -top-1">
            ™
          </span>
        </div>
        <span className="text-[9.5px] sm:text-[10.5px] font-bold text-[#111111] tracking-tight mt-0.5 font-sans">
          ኢትዮ ቴሌኮም
        </span>
      </div>
    </div>
  );
};

