# GameON Tele - Game Banner Specifications

## Standard Card Banner (4:3 Ratio - Recommended & Implemented)
- **Aspect Ratio**: 4:3 (Width:Height)
- **Resolution**: **600 × 450 px** (or **800 × 600 px** for ultra-high density Retina displays)
- **Format**: `.webp` (recommended for low latency) or `.png` / `.jpg`
- **Max File Size**: `< 80 KB`
- **Location**: Place banners in `public/images/banners/[game-id].webp`
- **Safe Zone**: Keep primary characters, mascots, and logos in the center 70% of the image to ensure no clipping from rounded card corners.

## Wide Hero Banner (Home Featured Carousel)
- **Aspect Ratio**: 16:9 or 21:9
- **Resolution**: **1280 × 720 px** (or **1920 × 1080 px**)
- **Format**: `.webp` or `.jpg`
- **Max File Size**: `< 150 KB`
- **Location**: Place hero banners in `public/images/banners/[game-id]-hero.webp`

## Square Thumbnail Icon
- **Aspect Ratio**: 1:1
- **Resolution**: **256 × 256 px** (or **512 × 512 px**)
- **Location**: `public/images/thumbnails/[game-id].webp`

## How to Configure in Game Catalog
In `src/services/gameCatalog.ts`, specify the path for the game:
```ts
{
  gameId: 'candy-blast',
  gameName: 'Candy Blast Mania',
  banner: '/images/banners/candy-blast.webp',
  thumbnail: '/images/thumbnails/candy-blast.webp',
  ...
}
```
*Note: If a banner image is omitted or fails to load, the system automatically falls back to procedural 3D key-art generation.*
