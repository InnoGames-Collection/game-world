import { TeamInfo } from './types';

export const TEAMS: Record<string, TeamInfo> = {
  ethiopia: {
    id: 'ethiopia',
    name: 'Ethiopia',
    code: 'ETH',
    flagEmoji: '🇪🇹',
    primaryColor: '#078930',
    secondaryColor: '#FCDD09',
    accentColor: '#DA121A',
    flagType: 'ETH',
    ballTheme: {
      baseColor: '#FFFFFF',
      patternColor1: '#078930', // Ethiopian Forest Green
      patternColor2: '#DA121A', // Imperial Red
      starOrEmblemColor: '#FCDD09', // National Gold Star
      seamColor: '#0F3818',
      patternType: 'ethiopia',
    },
  },
  brazil: {
    id: 'brazil',
    name: 'Brazil',
    code: 'BRA',
    flagEmoji: '🇧🇷',
    primaryColor: '#009C3B',
    secondaryColor: '#FFDF00',
    accentColor: '#002776',
    flagType: 'BRA',
    ballTheme: {
      baseColor: '#FFDF00', // Canary Yellow base
      patternColor1: '#009C3B', // Brazilian Green
      patternColor2: '#002776', // Deep Blue
      starOrEmblemColor: '#FFFFFF',
      seamColor: '#005820',
      patternType: 'brazil',
    },
  },
  argentina: {
    id: 'argentina',
    name: 'Argentina',
    code: 'ARG',
    flagEmoji: '🇦🇷',
    primaryColor: '#74ACDF',
    secondaryColor: '#FFFFFF',
    accentColor: '#F6B40E',
    flagType: 'ARG',
    ballTheme: {
      baseColor: '#FFFFFF',
      patternColor1: '#74ACDF', // Sky Blue
      patternColor2: '#2B6CB0',
      starOrEmblemColor: '#F6B40E', // Sun of May
      seamColor: '#4A7CA8',
      patternType: 'argentina',
    },
  },
  france: {
    id: 'france',
    name: 'France',
    code: 'FRA',
    flagEmoji: '🇫🇷',
    primaryColor: '#002654',
    secondaryColor: '#FFFFFF',
    accentColor: '#ED2939',
    flagType: 'FRA',
    ballTheme: {
      baseColor: '#FFFFFF',
      patternColor1: '#002654', // Royal Navy Blue
      patternColor2: '#ED2939', // French Red
      seamColor: '#1A2A44',
      patternType: 'stripes',
    },
  },
  germany: {
    id: 'germany',
    name: 'Germany',
    code: 'GER',
    flagEmoji: '🇩🇪',
    primaryColor: '#000000',
    secondaryColor: '#DD0000',
    accentColor: '#FFCE00',
    flagType: 'GER',
    ballTheme: {
      baseColor: '#FFFFFF',
      patternColor1: '#1A1A1A', // German Black
      patternColor2: '#DD0000', // German Red
      starOrEmblemColor: '#FFCE00', // Gold
      seamColor: '#2C2C2C',
      patternType: 'stripes',
    },
  },
  spain: {
    id: 'spain',
    name: 'Spain',
    code: 'ESP',
    flagEmoji: '🇪🇸',
    primaryColor: '#AA151B',
    secondaryColor: '#F1BF00',
    accentColor: '#AA151B',
    flagType: 'ESP',
    ballTheme: {
      baseColor: '#AA151B', // Spanish Crimson
      patternColor1: '#F1BF00', // Spanish Gold
      patternColor2: '#FFFFFF',
      seamColor: '#6B0B10',
      patternType: 'classic',
    },
  },
  england: {
    id: 'england',
    name: 'England',
    code: 'ENG',
    flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    primaryColor: '#CE1124',
    secondaryColor: '#FFFFFF',
    accentColor: '#001E62',
    flagType: 'ENG',
    ballTheme: {
      baseColor: '#FFFFFF',
      patternColor1: '#CE1124', // St. George Crimson Cross
      patternColor2: '#001E62', // Navy
      seamColor: '#8C0816',
      patternType: 'cross',
    },
  },
  portugal: {
    id: 'portugal',
    name: 'Portugal',
    code: 'POR',
    flagEmoji: '🇵🇹',
    primaryColor: '#006600',
    secondaryColor: '#FF0000',
    accentColor: '#FFDF00',
    flagType: 'POR',
    ballTheme: {
      baseColor: '#FF0000',
      patternColor1: '#006600', // Portuguese Green
      patternColor2: '#FFDF00', // Armillary sphere gold
      seamColor: '#880000',
      patternType: 'classic',
    },
  },
  italy: {
    id: 'italy',
    name: 'Italy',
    code: 'ITA',
    flagEmoji: '🇮🇹',
    primaryColor: '#0064AA',
    secondaryColor: '#FFFFFF',
    accentColor: '#008C45',
    flagType: 'ITA',
    ballTheme: {
      baseColor: '#0064AA', // Azzurro Blue
      patternColor1: '#FFFFFF',
      patternColor2: '#008C45', // Tricolore Green
      starOrEmblemColor: '#CD212A',
      seamColor: '#003E6B',
      patternType: 'classic',
    },
  },
  netherlands: {
    id: 'netherlands',
    name: 'Netherlands',
    code: 'NED',
    flagEmoji: '🇳🇱',
    primaryColor: '#FF4F00',
    secondaryColor: '#FFFFFF',
    accentColor: '#21468B',
    flagType: 'NED',
    ballTheme: {
      baseColor: '#FF4F00', // Radiant Oranje
      patternColor1: '#FFFFFF',
      patternColor2: '#21468B', // Royal Navy Blue
      seamColor: '#B33600',
      patternType: 'classic',
    },
  },
  japan: {
    id: 'japan',
    name: 'Japan',
    code: 'JPN',
    flagEmoji: '🇯🇵',
    primaryColor: '#002B7F',
    secondaryColor: '#FFFFFF',
    accentColor: '#BC002D',
    flagType: 'JPN',
    ballTheme: {
      baseColor: '#FFFFFF',
      patternColor1: '#002B7F', // Samurai Blue
      patternColor2: '#BC002D', // Crimson Sun
      starOrEmblemColor: '#BC002D',
      seamColor: '#001A4D',
      patternType: 'sun',
    },
  },
  morocco: {
    id: 'morocco',
    name: 'Morocco',
    code: 'MAR',
    flagEmoji: '🇲🇦',
    primaryColor: '#C1272D',
    secondaryColor: '#006233',
    accentColor: '#F5C518',
    flagType: 'MAR',
    ballTheme: {
      baseColor: '#C1272D', // Moroccan Crimson
      patternColor1: '#006233', // Emerald Pentagram Star
      patternColor2: '#FFFFFF',
      starOrEmblemColor: '#006233',
      seamColor: '#7A1318',
      patternType: 'stars',
    },
  },
  south_africa: {
    id: 'south_africa',
    name: 'South Africa',
    code: 'RSA',
    flagEmoji: '🇿🇦',
    primaryColor: '#007749',
    secondaryColor: '#FFB612',
    accentColor: '#001489',
    flagType: 'RSA',
    ballTheme: {
      baseColor: '#007749',
      patternColor1: '#FFB612', // Gold
      patternColor2: '#001489', // Blue
      seamColor: '#00472C',
      patternType: 'stripes',
    },
  },
};

export const TEAMS_LIST = Object.values(TEAMS);

/**
 * Draws an authentic, crisp vector representation of a national flag clipped inside a circle
 */
export function drawFlagInsideCircle(
  ctx: CanvasRenderingContext2D,
  flagType: TeamInfo['flagType'],
  cx: number,
  cy: number,
  r: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  const left = cx - r;
  const top = cy - r;
  const size = r * 2;

  switch (flagType) {
    case 'BRA': {
      // Brazil: Green base, Yellow rhombus, Blue globe with stars arc
      ctx.fillStyle = '#009C3B';
      ctx.fillRect(left, top, size, size);

      ctx.fillStyle = '#FFDF00';
      ctx.beginPath();
      ctx.moveTo(cx, top + r * 0.25);
      ctx.lineTo(left + size * 0.9, cy);
      ctx.lineTo(cx, top + size * 0.88);
      ctx.lineTo(left + size * 0.1, cy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#002776';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.44, 0, Math.PI * 2);
      ctx.fill();

      // White celestial band
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = r * 0.09;
      ctx.beginPath();
      ctx.arc(cx + r * 0.1, cy + r * 0.2, r * 0.42, Math.PI * 1.05, Math.PI * 1.55);
      ctx.stroke();
      break;
    }

    case 'ETH': {
      // Ethiopia: Green, Yellow, Red tricolor with Blue disc & radiant Gold pentagram star
      const hThird = size / 3;
      ctx.fillStyle = '#078930';
      ctx.fillRect(left, top, size, hThird);
      ctx.fillStyle = '#FCDD09';
      ctx.fillRect(left, top + hThird, size, hThird);
      ctx.fillStyle = '#DA121A';
      ctx.fillRect(left, top + hThird * 2, size, hThird);

      // Central Blue Disc
      ctx.fillStyle = '#0F47AF';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.46, 0, Math.PI * 2);
      ctx.fill();

      // Radiant Gold Pentagram Star with Rays
      ctx.strokeStyle = '#FCDD09';
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      ctx.fillStyle = '#FCDD09';

      const starR = r * 0.35;
      const innerR = starR * 0.42;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? starR : innerR;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'ARG': {
      // Argentina: Light Blue, White, Light Blue horizontal stripes with Sun of May
      const hThird = size / 3;
      ctx.fillStyle = '#74ACDF';
      ctx.fillRect(left, top, size, hThird);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(left, top + hThird, size, hThird);
      ctx.fillStyle = '#74ACDF';
      ctx.fillRect(left, top + hThird * 2, size, hThird);

      // Golden Sun of May
      ctx.fillStyle = '#F6B40E';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // Rays
      ctx.strokeStyle = '#853407';
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * 0.22, cy + Math.sin(a) * r * 0.22);
        ctx.lineTo(cx + Math.cos(a) * r * 0.34, cy + Math.sin(a) * r * 0.34);
        ctx.stroke();
      }
      break;
    }

    case 'FRA': {
      // France: Blue, White, Red vertical tricolor
      const wThird = size / 3;
      ctx.fillStyle = '#002654';
      ctx.fillRect(left, top, wThird, size);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(left + wThird, top, wThird, size);
      ctx.fillStyle = '#ED2939';
      ctx.fillRect(left + wThird * 2, top, wThird, size);
      break;
    }

    case 'GER': {
      // Germany: Black, Red, Gold horizontal tricolor
      const hThird = size / 3;
      ctx.fillStyle = '#000000';
      ctx.fillRect(left, top, size, hThird);
      ctx.fillStyle = '#DD0000';
      ctx.fillRect(left, top + hThird, size, hThird);
      ctx.fillStyle = '#FFCE00';
      ctx.fillRect(left, top + hThird * 2, size, hThird);
      break;
    }

    case 'ESP': {
      // Spain: Red, Yellow (double height), Red
      ctx.fillStyle = '#AA151B';
      ctx.fillRect(left, top, size, size);
      ctx.fillStyle = '#F1BF00';
      ctx.fillRect(left, top + size * 0.25, size, size * 0.5);
      // Subtle royal crest mark
      ctx.fillStyle = '#AA151B';
      ctx.beginPath();
      ctx.arc(cx - r * 0.28, cy, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'ENG': {
      // England: White background with Red St George's Cross
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(left, top, size, size);
      ctx.fillStyle = '#CE1124';
      const armW = size * 0.22;
      ctx.fillRect(left, cy - armW * 0.5, size, armW);
      ctx.fillRect(cx - armW * 0.5, top, armW, size);
      break;
    }

    case 'POR': {
      // Portugal: Green 40%, Red 60% with yellow armillary sphere
      const greenW = size * 0.4;
      ctx.fillStyle = '#006600';
      ctx.fillRect(left, top, greenW, size);
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(left + greenW, top, size - greenW, size);

      ctx.fillStyle = '#FFDF00';
      ctx.beginPath();
      ctx.arc(left + greenW, cy, r * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(left + greenW, cy, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'ITA': {
      // Italy: Green, White, Red vertical tricolor
      const wThird = size / 3;
      ctx.fillStyle = '#008C45';
      ctx.fillRect(left, top, wThird, size);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(left + wThird, top, wThird, size);
      ctx.fillStyle = '#CD212A';
      ctx.fillRect(left + wThird * 2, top, wThird, size);
      break;
    }

    case 'NED': {
      // Netherlands: Red, White, Blue horizontal tricolor
      const hThird = size / 3;
      ctx.fillStyle = '#AE1C28';
      ctx.fillRect(left, top, size, hThird);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(left, top + hThird, size, hThird);
      ctx.fillStyle = '#21468B';
      ctx.fillRect(left, top + hThird * 2, size, hThird);
      break;
    }

    case 'JPN': {
      // Japan: White background with Red Hinomaru Sun
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(left, top, size, size);
      ctx.fillStyle = '#BC002D';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'MAR': {
      // Morocco: Red field with Green Pentagram Star
      ctx.fillStyle = '#C1272D';
      ctx.fillRect(left, top, size, size);

      ctx.strokeStyle = '#006233';
      ctx.lineWidth = Math.max(2, r * 0.1);
      const starR = r * 0.48;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        // Draw standard 5-pointed star lines
        const step = (i * 2) % 5;
        const angle = (step * 2 * Math.PI) / 5 - Math.PI / 2;
        const px = cx + Math.cos(angle) * starR;
        const py = cy + Math.sin(angle) * starR;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'RSA':
    default: {
      // South Africa: Green Y shape with red top, blue bottom, black triangle, gold & white borders
      ctx.fillStyle = '#007749';
      ctx.fillRect(left, top, size, size);

      // Top Red
      ctx.fillStyle = '#E03C31';
      ctx.beginPath();
      ctx.moveTo(left + size * 0.35, top);
      ctx.lineTo(left + size, top);
      ctx.lineTo(left + size, top + size * 0.35);
      ctx.closePath();
      ctx.fill();

      // Bottom Blue
      ctx.fillStyle = '#001489';
      ctx.beginPath();
      ctx.moveTo(left + size * 0.35, top + size);
      ctx.lineTo(left + size, top + size);
      ctx.lineTo(left + size, top + size * 0.65);
      ctx.closePath();
      ctx.fill();

      // Black triangle hoist
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(left + size * 0.3, cy);
      ctx.lineTo(left, top + size);
      ctx.closePath();
      ctx.fill();

      // Gold border
      ctx.strokeStyle = '#FFB612';
      ctx.lineWidth = r * 0.1;
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(left + size * 0.3, cy);
      ctx.lineTo(left, top + size);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}
