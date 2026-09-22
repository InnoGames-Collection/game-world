# GameON Tele - Complete Banner & Cover Sizing Guidelines

This document outlines the standard image dimensions, aspect ratios, safe zones, and file recommendations for GoPlay / GameON Tele across mobile phones and web browsers.

---

## 1. Top Hero Banners (Home & Tournament Pages)

Both the **Home Page** (`FeaturedHeroCarousel`) and the **Tournament Page** (`TournamentPage`) use a responsive hero banner container that adapts seamlessly between 360px mobile screens and wide desktop displays (`max-w-5xl` / 1024px).

### Recommended Standard Sizing

| Page | Primary Aspect Ratio | Master Resolution (@2x Retina) | Display Height (Mobile) | Display Height (Desktop) | Format & Target Weight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Home Featured Carousel** | **2:1** (or 16:9) | **1280 × 640 px** *(or 1280 × 720 px)* | `224 px` (`h-56`) | `288 px` (`md:h-72`) | **WebP** / Progressive JPG (`< 120 KB`) |
| **Tournament Page Hero** | **2:1** (or 2.4:1) | **1280 × 640 px** *(or 1200 × 500 px)* | `200 – 220 px` | `260 – 300 px` | **WebP** / Progressive JPG (`< 120 KB`) |

### Safe Zone & Focal Area Rules
* **Horizontal Safe Zone (Center 65%)**: Keep main game logos, characters, and focal points within the horizontal range of **X: 210px to X: 1070px**. When displayed on narrow mobile screens (360px–390px), the outer 15–20% on the left and right may be trimmed by CSS `object-fit: cover`.
* **Vertical Safe Zone (Top & Center 70%)**: 
  * The bottom 30% of both hero banners features semi-transparent gradient overlays containing titles, countdown timers, prize pool badges, and "Play Now" action buttons.
  * **Do not place faces, small readable text, or vital graphics in the bottom 30%** of the banner image.
* **Aspect Ratio Recommendation**: **2:1 (1280 × 640 px)** is the optimal single standard for both pages:
  * On mobile phones, it keeps the hero compact (~180px–220px) so games are immediately visible without excessive scrolling.
  * On web/desktop, it scales smoothly into a widescreen cinematic header.

---

## 2. 2-Column Game Cards (Home, Games Catalog, and Tournament Games)

All game cards on **Home**, **Games Catalog**, and **Active Tournament Games** follow the **InnoArcade 2-column mobile vertical grid** specification.

| Card Asset | Aspect Ratio | Master Resolution | Mobile Card Width | Format & Max Weight |
| :--- | :--- | :--- | :--- | :--- |
| **Standard Game Cover** | **4:3** | **600 × 450 px** *(or 800 × 600 px)* | `~160 – 180 px` | **WebP** (`< 80 KB`) |
| **Square App Icon / Thumbnail** | **1:1** | **256 × 256 px** *(or 512 × 512 px)* | `48 × 48 px` | **WebP** / PNG (`< 35 KB`) |

### Card Banner Placement
* **Catalog & Tournament Covers**: Place 4:3 WebP covers in `public/covers/[game_id].webp` (e.g. `/covers/candy_blast.webp`, `/covers/color_switch.webp`).
* **Safe Zone for 4:3 Covers**: Keep key art centered in the middle 75%. The top 24px is overlaid with the status badge (e.g. `🎮 FREE` / `🏆 TOURNAMENT`) and the `?` rules button.

---

## 3. Directory Structure
```text
public/
├── brand/
│   ├── goplay-banner.png       (1024 × 682 px - Default hero background)
│   ├── ad-banner-1.png         (1024 × 372 px - Ultra-wide promo banner)
│   └── goplay-logo.png
├── covers/
│   ├── candy_blast.webp        (800 × 600 px / 4:3)
│   ├── helix_jump.webp         (800 × 600 px / 4:3)
│   ├── water_sort.webp         (800 × 600 px / 4:3)
│   └── ... (50+ covers)
└── images/
    ├── banners/                (Custom hero banners: 1280 × 640 px)
    └── thumbnails/             (1:1 square thumbnails: 256 × 256 px)
```
