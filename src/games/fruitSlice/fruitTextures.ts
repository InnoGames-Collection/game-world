import * as THREE from 'three';
import { FruitType } from './types';

/**
 * Procedural Canvas Texture Generator for Fruit Slice
 * Generates photorealistic exterior skins and cross-sectional cut face textures.
 */
class FruitTextureManager {
  private skinTextures: Map<FruitType | 'bomb' | 'woodWall', THREE.CanvasTexture> = new Map();
  private bumpTextures: Map<FruitType | 'bomb', THREE.CanvasTexture> = new Map();
  private roughnessTextures: Map<FruitType | 'bomb', THREE.CanvasTexture> = new Map();
  private interiorTextures: Map<FruitType, THREE.CanvasTexture> = new Map();
  private interiorBumpTextures: Map<FruitType, THREE.CanvasTexture> = new Map();

  /**
   * Generates or retrieves the high-resolution wood wall background texture
   */
  public getWoodWallTexture(): THREE.CanvasTexture {
    const cached = this.skinTextures.get('woodWall');
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Rich dark cedar / walnut base
    ctx.fillStyle = '#26150b';
    ctx.fillRect(0, 0, 1024, 1024);

    // Draw vertical wooden planks
    const plankCount = 6;
    const plankWidth = 1024 / plankCount;

    for (let p = 0; p < plankCount; p++) {
      const px = p * plankWidth;
      // Slight plank color variation
      const baseL = 16 + (p % 3) * 3 + Math.sin(p * 2.5) * 2;
      ctx.fillStyle = `hsl(25, 45%, ${baseL}%)`;
      ctx.fillRect(px + 2, 0, plankWidth - 4, 1024);

      // Wood grain lines
      ctx.strokeStyle = `rgba(0, 0, 0, 0.18)`;
      ctx.lineWidth = 1.5;
      for (let g = 0; g < 40; g++) {
        const gx = px + 6 + Math.random() * (plankWidth - 12);
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        const curve = (Math.random() - 0.5) * 16;
        ctx.bezierCurveTo(gx + curve, 300, gx - curve, 700, gx, 1024);
        ctx.stroke();
      }

      // Knot holes
      if (p % 2 === 1) {
        const ky = 200 + p * 180;
        const kx = px + plankWidth * 0.5;
        const knotGrad = ctx.createRadialGradient(kx, ky, 2, kx, ky, 24);
        knotGrad.addColorStop(0, '#100804');
        knotGrad.addColorStop(0.5, '#221107');
        knotGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = knotGrad;
        ctx.beginPath();
        ctx.ellipse(kx, ky, 18, 30, 0.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Plank dark shadow seams
      ctx.fillStyle = '#0f0703';
      ctx.fillRect(px, 0, 3, 1024);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(px + 3, 0, 1.5, 1024);

      // Iron nail rivets top and bottom
      [60, 960].forEach((ny) => {
        const nx = px + plankWidth * 0.5;
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(nx, ny, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(nx - 1.5, ny - 1.5, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Authentic Katana Slash Cuts in the wood
    const cuts = [
      { x1: 180, y1: 150, x2: 420, y2: 380 },
      { x1: 650, y1: 220, x2: 890, y2: 440 },
      { x1: 120, y1: 720, x2: 380, y2: 910 },
      { x1: 580, y1: 600, x2: 860, y2: 780 },
      { x1: 350, y1: 450, x2: 680, y2: 520 },
    ];

    cuts.forEach(({ x1, y1, x2, y2 }) => {
      // Deep cut shadow
      ctx.strokeStyle = '#050201';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Sharp splintered highlight edge
      ctx.strokeStyle = 'rgba(220, 180, 140, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x1 + 1, y1 - 1);
      ctx.lineTo(x2 + 1, y2 - 1);
      ctx.stroke();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.skinTextures.set('woodWall', texture);
    return texture;
  }

  /**
   * Exterior Skin Texture for Whole Fruit & Exterior of Halves
   * Renders authentic fresh fruit skin with realistic pores, lenticels,
   * subtle mottling, natural wax bloom, and cellular depth.
   */
  public getSkinTexture(fruitType: FruitType | 'bomb'): THREE.CanvasTexture {
    const cached = this.skinTextures.get(fruitType);
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    switch (fruitType) {
      case 'watermelon': {
        // Emerald green base with organic cellular mottling
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, 0, 512, 512);

        // Subtle lighter pale green bloom in the valleys
        ctx.fillStyle = 'rgba(110, 200, 110, 0.16)';
        for (let i = 0; i < 60; i++) {
          ctx.beginPath();
          ctx.ellipse(Math.random() * 512, Math.random() * 512, 40 + Math.random() * 30, 20 + Math.random() * 15, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Dark forest green jagged wavy stripes with organic feathered margins
        ctx.fillStyle = '#0c420c';
        for (let s = 0; s < 8; s++) {
          const sx = s * 64;
          ctx.beginPath();
          ctx.moveTo(sx + 10, 0);
          for (let y = 0; y <= 512; y += 16) {
            const jag = Math.sin(y * 0.05 + s) * 16 + Math.cos(y * 0.12) * 6 + (Math.random() - 0.5) * 4;
            ctx.lineTo(sx + 28 + jag, y);
          }
          for (let y = 512; y >= 0; y -= 16) {
            const jag = Math.sin(y * 0.05 + s) * 16 + Math.cos(y * 0.12) * 6 + (Math.random() - 0.5) * 4;
            ctx.lineTo(sx + 10 + jag, y);
          }
          ctx.closePath();
          ctx.fill();

          // Delicate marbled veinlets branching out from the stripes
          ctx.strokeStyle = 'rgba(12, 66, 12, 0.45)';
          ctx.lineWidth = 1.2;
          for (let v = 0; v < 14; v++) {
            const vy = v * 36 + Math.random() * 10;
            const branchDir = v % 2 === 0 ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(sx + 18, vy);
            ctx.quadraticCurveTo(
              sx + 18 + branchDir * 14,
              vy + 8,
              sx + 18 + branchDir * 24,
              vy + (Math.random() - 0.5) * 12
            );
            ctx.stroke();
          }
        }

        // Fine waxy cuticle micro-grain
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        for (let i = 0; i < 500; i++) {
          ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
        }
        break;
      }

      case 'apple': {
        // Vibrant fresh apple gradient: golden-amber base into rich crimson & deep ruby
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#8cb811');
        grad.addColorStop(0.12, '#eab308');
        grad.addColorStop(0.25, '#dc2626');
        grad.addColorStop(0.70, '#b91c1c');
        grad.addColorStop(1, '#881313');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Natural vertical striations: multi-toned fiber streaks running along the apple
        for (let i = 0; i < 140; i++) {
          const x = Math.random() * 512;
          const isHighlight = Math.random() > 0.65;
          ctx.strokeStyle = isHighlight
            ? 'rgba(254, 240, 138, 0.18)'
            : 'rgba(153, 27, 27, 0.35)';
          ctx.lineWidth = Math.random() * 2.0 + 0.8;
          ctx.beginPath();
          ctx.moveTo(x, 20);
          ctx.bezierCurveTo(
            x + (Math.random() - 0.5) * 8,
            180,
            x + (Math.random() - 0.5) * 12,
            360,
            x + (Math.random() - 0.5) * 16,
            500
          );
          ctx.stroke();
        }

        // Authentic lenticels: tiny pale yellow-cream breathing dots
        ctx.fillStyle = 'rgba(254, 249, 195, 0.65)';
        for (let i = 0; i < 380; i++) {
          const lx = Math.random() * 512;
          const ly = 60 + Math.random() * 410;
          const lr = Math.random() * 0.9 + 0.5;
          ctx.beginPath();
          ctx.arc(lx, ly, lr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Faint waxy bloom overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 40; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 512, 15 + Math.random() * 25, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'orange': {
        // Base vibrant citrus orange
        ctx.fillStyle = '#ff7a00';
        ctx.fillRect(0, 0, 512, 512);

        // Subtle organic tone mottling (warm gold and deep orange undertones)
        for (let i = 0; i < 50; i++) {
          const rx = Math.random() * 512;
          const ry = Math.random() * 512;
          const rad = 25 + Math.random() * 40;
          const mGrad = ctx.createRadialGradient(rx, ry, 2, rx, ry, rad);
          mGrad.addColorStop(0, Math.random() > 0.5 ? 'rgba(255, 145, 0, 0.25)' : 'rgba(235, 95, 0, 0.22)');
          mGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = mGrad;
          ctx.beginPath();
          ctx.arc(rx, ry, rad, 0, Math.PI * 2);
          ctx.fill();
        }

        // Foveolae: realistic citrus oil gland pores (dense stippling with tiny shadow & highlight rim)
        for (let i = 0; i < 850; i++) {
          const px = Math.random() * 512;
          const py = Math.random() * 512;
          const r = Math.random() * 1.2 + 0.8;

          // Pore pit shadow
          ctx.fillStyle = 'rgba(195, 75, 0, 0.65)';
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();

          // Subtle raised pore rim highlight
          ctx.fillStyle = 'rgba(255, 185, 90, 0.45)';
          ctx.beginPath();
          ctx.arc(px - 0.5, py - 0.5, r * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'lemon': {
        // Bright sunny yellow citrus base
        ctx.fillStyle = '#ffdf00';
        ctx.fillRect(0, 0, 512, 512);

        // Pale creamy highlights and subtle greenish-yellow polar tones
        for (let i = 0; i < 45; i++) {
          const rx = Math.random() * 512;
          const ry = Math.random() * 512;
          const rad = 30 + Math.random() * 50;
          const mGrad = ctx.createRadialGradient(rx, ry, 2, rx, ry, rad);
          mGrad.addColorStop(0, 'rgba(255, 248, 160, 0.28)');
          mGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = mGrad;
          ctx.beginPath();
          ctx.arc(rx, ry, rad, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fine citrus oil gland pores
        for (let i = 0; i < 750; i++) {
          const px = Math.random() * 512;
          const py = Math.random() * 512;
          const r = Math.random() * 1.1 + 0.7;
          ctx.fillStyle = 'rgba(200, 165, 0, 0.6)';
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255, 255, 200, 0.4)';
          ctx.beginPath();
          ctx.arc(px - 0.4, py - 0.4, r * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'lime': {
        // Radiant zesty green
        ctx.fillStyle = '#65a30d';
        ctx.fillRect(0, 0, 512, 512);

        // Deep olive-green and chartreuse undertones
        for (let i = 0; i < 40; i++) {
          const rx = Math.random() * 512;
          const ry = Math.random() * 512;
          const rad = 25 + Math.random() * 45;
          const mGrad = ctx.createRadialGradient(rx, ry, 2, rx, ry, rad);
          mGrad.addColorStop(0, 'rgba(132, 204, 22, 0.25)');
          mGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = mGrad;
          ctx.beginPath();
          ctx.arc(rx, ry, rad, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fine tight citrus pores
        for (let i = 0; i < 750; i++) {
          const px = Math.random() * 512;
          const py = Math.random() * 512;
          const r = Math.random() * 1.0 + 0.6;
          ctx.fillStyle = 'rgba(55, 90, 10, 0.65)';
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(190, 242, 100, 0.4)';
          ctx.beginPath();
          ctx.arc(px - 0.4, py - 0.4, r * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'banana': {
        // Ripening banana gradient with subtle green tips
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#558b2f');
        grad.addColorStop(0.12, '#fbc02d');
        grad.addColorStop(0.88, '#fbc02d');
        grad.addColorStop(0.96, '#8d6e63');
        grad.addColorStop(1, '#4e342e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Longitudinal peel fibers & subtle facet shading
        [85, 170, 255, 340, 425].forEach((x) => {
          ctx.strokeStyle = 'rgba(196, 144, 0, 0.35)';
          ctx.lineWidth = 3.0;
          ctx.beginPath();
          ctx.moveTo(x, 15);
          ctx.lineTo(x, 495);
          ctx.stroke();

          // Subtle green-yellow facet edge highlight
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + 2, 20);
          ctx.lineTo(x + 2, 490);
          ctx.stroke();
        });

        // Fine longitudinal fibrous grain
        ctx.strokeStyle = 'rgba(217, 160, 10, 0.15)';
        ctx.lineWidth = 1.0;
        for (let i = 0; i < 80; i++) {
          const gx = Math.random() * 512;
          ctx.beginPath();
          ctx.moveTo(gx, 40);
          ctx.lineTo(gx + (Math.random() - 0.5) * 4, 470);
          ctx.stroke();
        }

        // Tiny natural brown sugar freckles (micro-ripening spots)
        ctx.fillStyle = 'rgba(93, 64, 55, 0.55)';
        for (let i = 0; i < 70; i++) {
          const sx = Math.random() * 512;
          const sy = 80 + Math.random() * 350;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.random() * 1.5 + 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'peach': {
        // Velvety sunset peach gradient
        const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 280);
        grad.addColorStop(0, '#ff9a56');
        grad.addColorStop(0.55, '#f85f56');
        grad.addColorStop(0.85, '#c02737');
        grad.addColorStop(1, '#881337');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Golden apricot warm cheek blush
        const cheek = ctx.createRadialGradient(180, 200, 10, 180, 200, 140);
        cheek.addColorStop(0, 'rgba(254, 215, 170, 0.35)');
        cheek.addColorStop(1, 'transparent');
        ctx.fillStyle = cheek;
        ctx.beginPath();
        ctx.arc(180, 200, 140, 0, Math.PI * 2);
        ctx.fill();

        // Dense micro-fuzz speckles giving velvety texture
        ctx.fillStyle = 'rgba(255, 237, 213, 0.22)';
        for (let i = 0; i < 950; i++) {
          const fx = Math.random() * 512;
          const fy = Math.random() * 512;
          ctx.fillRect(fx, fy, 1.2, 1.2);
        }
        ctx.fillStyle = 'rgba(153, 27, 27, 0.2)';
        for (let i = 0; i < 600; i++) {
          const fx = Math.random() * 512;
          const fy = Math.random() * 512;
          ctx.fillRect(fx, fy, 1.2, 1.2);
        }
        break;
      }

      case 'pear': {
        // Pale speckled chartreuse green base
        ctx.fillStyle = '#a3c442';
        ctx.fillRect(0, 0, 512, 512);

        // Subtle sunny amber cheek
        const cheek = ctx.createRadialGradient(320, 280, 15, 320, 280, 160);
        cheek.addColorStop(0, 'rgba(234, 179, 8, 0.25)');
        cheek.addColorStop(1, 'transparent');
        ctx.fillStyle = cheek;
        ctx.beginPath();
        ctx.arc(320, 280, 160, 0, Math.PI * 2);
        ctx.fill();

        // Authentic russet freckles (fine golden-brown lenticels)
        for (let i = 0; i < 650; i++) {
          const px = Math.random() * 512;
          const py = Math.random() * 512;
          const r = Math.random() * 1.4 + 0.6;
          ctx.fillStyle = Math.random() > 0.4
            ? 'rgba(107, 142, 35, 0.6)'
            : 'rgba(140, 100, 40, 0.55)';
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'pineapple': {
        // Golden brown base
        ctx.fillStyle = '#996515';
        ctx.fillRect(0, 0, 512, 512);

        // Rhombic diamond scale armor grid
        const step = 44;
        for (let y = -step; y < 512 + step; y += step) {
          for (let x = -step; x < 512 + step; x += step) {
            const cx = x + (Math.floor(y / step) % 2 === 0 ? step * 0.5 : 0);
            const cy = y;

            // Draw diamond scale eye
            ctx.beginPath();
            ctx.moveTo(cx, cy - step * 0.48);
            ctx.lineTo(cx + step * 0.48, cy);
            ctx.lineTo(cx, cy + step * 0.48);
            ctx.lineTo(cx - step * 0.48, cy);
            ctx.closePath();

            // Diamond scale gradient with amber center and golden border
            const dGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, step * 0.45);
            dGrad.addColorStop(0, '#5a3808');
            dGrad.addColorStop(0.35, '#c2851a');
            dGrad.addColorStop(0.85, '#eab308');
            dGrad.addColorStop(1, '#78460d');
            ctx.fillStyle = dGrad;
            ctx.fill();

            // Scale seam shadow
            ctx.strokeStyle = '#3d2204';
            ctx.lineWidth = 2.0;
            ctx.stroke();

            // Scale center woody bract prickle
            ctx.fillStyle = '#2e1803';
            ctx.beginPath();
            ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      case 'coconut': {
        // Deep fibrous dark brown husk
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(0, 0, 512, 512);

        // Multi-layered coarse coconut hair strands
        const strandColors = ['#5d4037', '#6d4c41', '#4e342e', '#27140e', '#795548'];
        for (let i = 0; i < 900; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const len = 20 + Math.random() * 45;
          const angle = (Math.random() - 0.5) * 0.45 + Math.PI * 0.5; // predominantly vertical fibers
          ctx.strokeStyle = strandColors[i % strandColors.length];
          ctx.lineWidth = Math.random() * 1.6 + 0.6;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
          ctx.stroke();
        }
        break;
      }

      case 'strawberry': {
        // Deep succulent red base
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(0, 0, 512, 512);

        // Raised succulent pulp cushions (brighter ruby highlights between seed pockets)
        const rowSpacing = 36;
        const colSpacing = 36;
        for (let r = 16; r < 512; r += rowSpacing) {
          const offset = (Math.floor(r / rowSpacing) % 2) * (colSpacing * 0.5);
          for (let c = 16; c < 512; c += colSpacing) {
            const scx = c + offset;
            const scy = r;

            // Pulp cushion highlight around seed
            const pGrad = ctx.createRadialGradient(scx, scy, 5, scx, scy, 16);
            pGrad.addColorStop(0, '#be123c'); // darker pocket depression
            pGrad.addColorStop(0.65, '#f43f5e'); // raised juicy rim
            pGrad.addColorStop(1, '#e11d48');
            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.arc(scx, scy, 16, 0, Math.PI * 2);
            ctx.fill();

            // Seed pocket indentation (deep maroon shadow)
            ctx.fillStyle = '#881337';
            ctx.beginPath();
            ctx.ellipse(scx, scy, 3.2, 5.2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Realistic golden achene seed nestled inside
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.ellipse(scx - 0.5, scy - 0.5, 2.2, 3.8, -0.1, 0, Math.PI * 2);
            ctx.fill();

            // Seed specular glint
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(scx - 1.0, scy - 1.5, 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      case 'kiwi': {
        // Earthy brown base skin
        ctx.fillStyle = '#5c4033';
        ctx.fillRect(0, 0, 512, 512);

        // Multi-directional fuzzy brown hair fibers
        const hairColors = ['#4a3328', '#6e4f3f', '#3b281f', '#7d5c4b'];
        for (let i = 0; i < 1100; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          ctx.strokeStyle = hairColors[i % hairColors.length];
          ctx.lineWidth = Math.random() * 1.2 + 0.6;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (Math.random() - 0.5) * 14, y + (Math.random() - 0.5) * 14);
          ctx.stroke();
        }
        break;
      }

      case 'mango': {
        // Sunset tropical gradient: Ruby-Crimson into Vibrant Orange & Golden Honey
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, '#dc2626');
        grad.addColorStop(0.35, '#ea580c');
        grad.addColorStop(0.70, '#f59e0b');
        grad.addColorStop(1, '#eab308');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Subtle blush mottling and fine lenticel micro-pores
        ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
        for (let i = 0; i < 450; i++) {
          const mx = Math.random() * 512;
          const my = Math.random() * 512;
          ctx.beginPath();
          ctx.arc(mx, my, Math.random() * 1.0 + 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Translucent waxy cuticle bloom
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 35; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 512, 20 + Math.random() * 30, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'dragonfruit': {
        // Vibrant magenta-pink skin base
        ctx.fillStyle = '#db2777';
        ctx.fillRect(0, 0, 512, 512);

        // Subtle leathery skin grain
        for (let i = 0; i < 400; i++) {
          ctx.fillStyle = 'rgba(190, 24, 93, 0.35)';
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 2.5 + 1.0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Green-tipped triangular bract scale bases
        for (let i = 0; i < 22; i++) {
          const bx = Math.random() * 440 + 30;
          const by = Math.random() * 440 + 30;
          ctx.fillStyle = '#84cc16';
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + 26, by - 24);
          ctx.lineTo(bx + 52, by);
          ctx.closePath();
          ctx.fill();

          // Scale dark magenta crevice
          ctx.strokeStyle = '#9d174d';
          ctx.lineWidth = 2.0;
          ctx.stroke();
        }
        break;
      }

      case 'pomegranate': {
        // Deep burgundy leathery rind
        ctx.fillStyle = '#881337';
        ctx.fillRect(0, 0, 512, 512);

        // Sun-blushed crimson and tawny patches
        for (let i = 0; i < 35; i++) {
          const rx = Math.random() * 512;
          const ry = Math.random() * 512;
          const rad = 30 + Math.random() * 50;
          const pGrad = ctx.createRadialGradient(rx, ry, 5, rx, ry, rad);
          pGrad.addColorStop(0, Math.random() > 0.5 ? 'rgba(225, 29, 72, 0.3)' : 'rgba(120, 53, 15, 0.25)');
          pGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(rx, ry, rad, 0, Math.PI * 2);
          ctx.fill();
        }

        // Taut leathery micro-speckles
        ctx.fillStyle = 'rgba(76, 5, 25, 0.55)';
        for (let i = 0; i < 450; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 1.5 + 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'bomb': {
        // Cast-iron metallic texture with warning skull/hazard badge
        const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 260);
        grad.addColorStop(0, '#374151');
        grad.addColorStop(0.7, '#1f2937');
        grad.addColorStop(1, '#111827');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Heavy cast-iron pitted forge texture
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        for (let i = 0; i < 500; i++) {
          ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
        }

        // Warning Hazard Belt
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, 220, 512, 72);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DANGER', 256, 256);
        break;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.skinTextures.set(fruitType, texture);
    return texture;
  }

  /**
   * Procedural Grayscale Bump Texture for Natural Fruit Skin Relief
   * 128 = neutral flat, >128 = raised relief, <128 = indented pores / pits
   */
  public getBumpTexture(fruitType: FruitType | 'bomb'): THREE.CanvasTexture {
    const cached = this.bumpTextures.get(fruitType);
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Baseline neutral gray (128)
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    switch (fruitType) {
      case 'orange':
      case 'lemon':
      case 'lime': {
        // Foveolae: micro-pebbled citrus peel with indented oil gland pits and raised rims
        const poreCount = fruitType === 'orange' ? 1200 : 900;
        const poreSize = fruitType === 'orange' ? 1.6 : 1.3;

        for (let i = 0; i < poreCount; i++) {
          const px = Math.random() * 512;
          const py = Math.random() * 512;

          // Raised cellular mound around pore
          ctx.fillStyle = '#9c9c9c';
          ctx.beginPath();
          ctx.arc(px, py, poreSize * 1.8, 0, Math.PI * 2);
          ctx.fill();

          // Indented pore pit
          ctx.fillStyle = '#484848';
          ctx.beginPath();
          ctx.arc(px, py, poreSize * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'apple': {
        // Fine lenticel micro-pores & subtle vertical cutaneous grooves
        for (let i = 0; i < 90; i++) {
          const x = Math.random() * 512;
          ctx.strokeStyle = Math.random() > 0.5 ? '#8c8c8c' : '#747474';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x, 20);
          ctx.lineTo(x + (Math.random() - 0.5) * 8, 490);
          ctx.stroke();
        }

        // Indented lenticels
        for (let i = 0; i < 450; i++) {
          const lx = Math.random() * 512;
          const ly = Math.random() * 512;
          ctx.fillStyle = '#5c5c5c';
          ctx.beginPath();
          ctx.arc(lx, ly, Math.random() * 1.0 + 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'watermelon': {
        // Subtle undulating longitudinal rind ridges
        for (let s = 0; s < 8; s++) {
          const sx = s * 64 + 18;
          ctx.fillStyle = '#727272'; // stripe trough
          ctx.fillRect(sx, 0, 26, 512);
          ctx.fillStyle = '#8e8e8e'; // ridge crest
          ctx.fillRect(sx + 26, 0, 38, 512);
        }
        // Micro-cellular waxy skin noise
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let i = 0; i < 400; i++) {
          ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
        }
        break;
      }

      case 'peach': {
        // Velvety peach fuzz: high-density microscopic stippling
        for (let i = 0; i < 1600; i++) {
          const fx = Math.random() * 512;
          const fy = Math.random() * 512;
          ctx.fillStyle = Math.random() > 0.5 ? '#969696' : '#686868';
          ctx.fillRect(fx, fy, 1.5, 1.5);
        }
        break;
      }

      case 'strawberry': {
        // Deep seed pocket depressions with raised succulent cushions between seeds
        const spacing = 36;
        for (let r = 16; r < 512; r += spacing) {
          const offset = (Math.floor(r / spacing) % 2) * (spacing * 0.5);
          for (let c = 16; c < 512; c += spacing) {
            const scx = c + offset;
            const scy = r;

            // Raised succulent cushion rim
            ctx.fillStyle = '#a6a6a6';
            ctx.beginPath();
            ctx.arc(scx, scy, 16, 0, Math.PI * 2);
            ctx.fill();

            // Deep seed cavity depression
            ctx.fillStyle = '#3a3a3a';
            ctx.beginPath();
            ctx.ellipse(scx, scy, 4.0, 6.0, 0, 0, Math.PI * 2);
            ctx.fill();

            // Protruding seed bump
            ctx.fillStyle = '#7a7a7a';
            ctx.beginPath();
            ctx.ellipse(scx, scy, 2.5, 4.0, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      case 'pear': {
        // Russet speckle micro-relief and natural pores
        for (let i = 0; i < 800; i++) {
          const px = Math.random() * 512;
          const py = Math.random() * 512;
          ctx.fillStyle = Math.random() > 0.5 ? '#969696' : '#646464';
          ctx.beginPath();
          ctx.arc(px, py, Math.random() * 1.5 + 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'banana': {
        // Longitudinal facet ridges and fibrous peel striations
        [85, 170, 255, 340, 425].forEach((x) => {
          ctx.fillStyle = '#666666'; // groove
          ctx.fillRect(x - 4, 0, 8, 512);
          ctx.fillStyle = '#9e9e9e'; // ridge
          ctx.fillRect(x + 4, 0, 8, 512);
        });
        // Fine fibers
        for (let i = 0; i < 90; i++) {
          const gx = Math.random() * 512;
          ctx.fillStyle = Math.random() > 0.5 ? '#8a8a8a' : '#757575';
          ctx.fillRect(gx, 0, 1.2, 512);
        }
        break;
      }

      case 'pineapple': {
        // Diamond scale eye armor relief: deep grooves & raised scale centers
        const step = 44;
        for (let y = -step; y < 512 + step; y += step) {
          for (let x = -step; x < 512 + step; x += step) {
            const cx = x + (Math.floor(y / step) % 2 === 0 ? step * 0.5 : 0);
            const cy = y;

            // Raised scale armor plate
            ctx.fillStyle = '#b0b0b0';
            ctx.beginPath();
            ctx.moveTo(cx, cy - step * 0.46);
            ctx.lineTo(cx + step * 0.46, cy);
            ctx.lineTo(cx, cy + step * 0.46);
            ctx.lineTo(cx - step * 0.46, cy);
            ctx.closePath();
            ctx.fill();

            // Center bract depression
            ctx.fillStyle = '#404040';
            ctx.beginPath();
            ctx.arc(cx, cy, 5.0, 0, Math.PI * 2);
            ctx.fill();

            // Scale seam groove
            ctx.strokeStyle = '#222222';
            ctx.lineWidth = 2.5;
            ctx.stroke();
          }
        }
        break;
      }

      case 'coconut': {
        // Coarse longitudinal fibrous husk grooves
        for (let i = 0; i < 950; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const len = 25 + Math.random() * 40;
          ctx.strokeStyle = Math.random() > 0.4 ? '#a0a0a0' : '#525252';
          ctx.lineWidth = Math.random() * 2.2 + 0.8;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (Math.random() - 0.5) * 6, y + len);
          ctx.stroke();
        }
        break;
      }

      case 'kiwi': {
        // Bristly kiwi hair follicle bumps
        for (let i = 0; i < 1300; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          ctx.strokeStyle = Math.random() > 0.5 ? '#9e9e9e' : '#555555';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (Math.random() - 0.5) * 12, y + (Math.random() - 0.5) * 12);
          ctx.stroke();
        }
        break;
      }

      case 'mango': {
        // Ultra-smooth waxy cuticle with fine micro-lenticels
        for (let i = 0; i < 500; i++) {
          const mx = Math.random() * 512;
          const my = Math.random() * 512;
          ctx.fillStyle = '#6e6e6e';
          ctx.beginPath();
          ctx.arc(mx, my, Math.random() * 1.0 + 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'dragonfruit': {
        // Leathery skin texture with subtle scale ridges
        for (let i = 0; i < 24; i++) {
          const bx = Math.random() * 450 + 30;
          const by = Math.random() * 450 + 30;
          ctx.fillStyle = '#9e9e9e';
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + 26, by - 24);
          ctx.lineTo(bx + 52, by);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#555555';
          ctx.lineWidth = 2.0;
          ctx.stroke();
        }
        break;
      }

      case 'pomegranate': {
        // Taut leathery rind with subtle natural planar facets and micro-pits
        for (let i = 0; i < 500; i++) {
          const px = Math.random() * 512;
          const py = Math.random() * 512;
          ctx.fillStyle = Math.random() > 0.5 ? '#8e8e8e' : '#686868';
          ctx.beginPath();
          ctx.arc(px, py, Math.random() * 1.2 + 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'bomb': {
        // Cast-iron pitted forge texture
        for (let i = 0; i < 900; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          ctx.fillStyle = Math.random() > 0.5 ? '#999999' : '#444444';
          ctx.fillRect(x, y, 2.5, 2.5);
        }
        break;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.bumpTextures.set(fruitType, texture);
    return texture;
  }

  /**
   * Procedural Grayscale Roughness Map for Organic Micro-Variation
   * Brighter = rougher/more diffuse; Darker = smoother/more satin sheen
   */
  public getRoughnessTexture(fruitType: FruitType | 'bomb'): THREE.CanvasTexture {
    const cached = this.roughnessTextures.get(fruitType);
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Baseline roughness ~128
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    switch (fruitType) {
      case 'orange':
      case 'lemon':
      case 'lime': {
        // Oil glands are slightly rougher inside the pits
        for (let i = 0; i < 800; i++) {
          const px = Math.random() * 512;
          const py = Math.random() * 512;
          ctx.fillStyle = '#b0b0b0'; // matte pit
          ctx.beginPath();
          ctx.arc(px, py, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'apple': {
        // Lenticels are matte dots amidst waxy sheen
        ctx.fillStyle = '#656565';
        ctx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 400; i++) {
          ctx.fillStyle = '#a8a8a8';
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 512, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'strawberry': {
        // Juicy pulp cushions have glossier sheen (#606060), seed pits are matte (#b8b8b8)
        ctx.fillStyle = '#606060';
        ctx.fillRect(0, 0, 512, 512);
        const spacing = 36;
        for (let r = 16; r < 512; r += spacing) {
          const offset = (Math.floor(r / spacing) % 2) * (spacing * 0.5);
          for (let c = 16; c < 512; c += spacing) {
            ctx.fillStyle = '#b8b8b8';
            ctx.beginPath();
            ctx.arc(c + offset, r, 5.0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      case 'peach': {
        // Uniform velvety fuzz scattering
        ctx.fillStyle = '#c4c4c4';
        ctx.fillRect(0, 0, 512, 512);
        break;
      }

      case 'coconut':
      case 'kiwi': {
        // Very matte fibrous skin
        ctx.fillStyle = '#d8d8d8';
        ctx.fillRect(0, 0, 512, 512);
        break;
      }

      default: {
        // Gentle organic micro-noise
        for (let i = 0; i < 400; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? '#8e8e8e' : '#727272';
          ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
        }
        break;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.roughnessTextures.set(fruitType, texture);
    return texture;
  }

  /**
   * Internal Cut Face Bump Texture: Gives moist, glistening pulp & recessed seeds
   */
  public getInteriorBumpTexture(fruitType: FruitType): THREE.CanvasTexture {
    const cached = this.interiorBumpTextures.get(fruitType);
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    const cx = 256;
    const cy = 256;

    switch (fruitType) {
      case 'watermelon': {
        // Raised crisp rind & recessed seed sockets
        ctx.strokeStyle = '#9c9c9c';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(cx, cy, 230, 0, Math.PI * 2);
        ctx.stroke();

        // Juicy cellular pulp texture
        for (let i = 0; i < 600; i++) {
          const r = Math.random() * 210;
          const th = Math.random() * Math.PI * 2;
          ctx.fillStyle = Math.random() > 0.5 ? '#8d8d8d' : '#737373';
          ctx.fillRect(cx + Math.cos(th) * r, cy + Math.sin(th) * r, 2, 2);
        }

        // Recessed seeds
        const seedCount = 14;
        for (let i = 0; i < seedCount; i++) {
          const angle = (i / seedCount) * Math.PI * 2;
          const dist = 140 + (i % 2) * 25;
          ctx.fillStyle = '#444444';
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 7, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'orange':
      case 'lemon':
      case 'lime': {
        // Raised segment membranes & juicy pulp vesicles
        const segCount = fruitType === 'orange' ? 10 : 8;
        for (let i = 0; i < segCount; i++) {
          const a = (i / segCount) * Math.PI * 2;
          ctx.strokeStyle = '#a4a4a4';
          ctx.lineWidth = 3.0;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * 230, cy + Math.sin(a) * 230);
          ctx.stroke();
        }
        // Micro-vesicles (juice sacs)
        for (let i = 0; i < 500; i++) {
          const r = 25 + Math.random() * 190;
          const th = Math.random() * Math.PI * 2;
          ctx.fillStyle = Math.random() > 0.5 ? '#8f8f8f' : '#727272';
          ctx.beginPath();
          ctx.arc(cx + Math.cos(th) * r, cy + Math.sin(th) * r, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      default: {
        // Natural juicy cellular grain
        for (let i = 0; i < 600; i++) {
          const r = Math.random() * 220;
          const th = Math.random() * Math.PI * 2;
          ctx.fillStyle = Math.random() > 0.5 ? '#8c8c8c' : '#747474';
          ctx.fillRect(cx + Math.cos(th) * r, cy + Math.sin(th) * r, 2, 2);
        }
        break;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.interiorBumpTextures.set(fruitType, texture);
    return texture;
  }

  /**
   * Internal Cut Face Texture (Revealed upon slicing!)
   */
  public getInteriorTexture(fruitType: FruitType): THREE.CanvasTexture {
    const cached = this.interiorTextures.get(fruitType);
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const cx = 256;
    const cy = 256;

    switch (fruitType) {
      case 'watermelon': {
        // 1. Dark Green Rind Border
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        // 2. Crisp White Pith Ring
        ctx.fillStyle = '#ecfccb';
        ctx.beginPath();
        ctx.arc(cx, cy, 236, 0, Math.PI * 2);
        ctx.fill();

        // 3. Deep Juicy Crimson Flesh
        const fleshGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 220);
        fleshGrad.addColorStop(0, '#f43f5e');
        fleshGrad.addColorStop(0.8, '#e11d48');
        fleshGrad.addColorStop(1, '#be123c');
        ctx.fillStyle = fleshGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 218, 0, Math.PI * 2);
        ctx.fill();

        // 4. Black Watermelon Seeds arranged in radiating ring
        ctx.fillStyle = '#09090b';
        const seedCount = 14;
        for (let i = 0; i < seedCount; i++) {
          const angle = (i / seedCount) * Math.PI * 2;
          const dist = 140 + (i % 2) * 25;
          const sx = cx + Math.cos(angle) * dist;
          const sy = cy + Math.sin(angle) * dist;

          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(angle + Math.PI / 2);
          ctx.beginPath();
          ctx.ellipse(0, 0, 5, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          // Seed white reflection
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.arc(-1.5, -2, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        break;
      }

      case 'apple': {
        // Red Skin Rim
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        // Off-white juicy cream flesh
        ctx.fillStyle = '#fef9c3';
        ctx.beginPath();
        ctx.arc(cx, cy, 240, 0, Math.PI * 2);
        ctx.fill();

        // Star core
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * 35, cy + Math.sin(a) * 35, 18, a - 0.8, a + 0.8);
          ctx.stroke();

          // Dark brown pip
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * 35, cy + Math.sin(a) * 35, 3.5, 6, a, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'orange': {
        // Orange Peel Rim
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        // White Pith Ring
        ctx.fillStyle = '#ffedd5';
        ctx.beginPath();
        ctx.arc(cx, cy, 238, 0, Math.PI * 2);
        ctx.fill();

        // Radiating translucent citrus segments
        const segCount = 10;
        for (let i = 0; i < segCount; i++) {
          const a1 = (i / segCount) * Math.PI * 2 + 0.05;
          const a2 = ((i + 1) / segCount) * Math.PI * 2 - 0.05;

          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, 224, a1, a2);
          ctx.closePath();
          ctx.fill();
        }

        // White Center Core
        ctx.fillStyle = '#ffedd5';
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'lemon': {
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef9c3';
        ctx.beginPath();
        ctx.arc(cx, cy, 238, 0, Math.PI * 2);
        ctx.fill();

        const segCount = 8;
        for (let i = 0; i < segCount; i++) {
          const a1 = (i / segCount) * Math.PI * 2 + 0.06;
          const a2 = ((i + 1) / segCount) * Math.PI * 2 - 0.06;

          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, 224, a1, a2);
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = '#fef9c3';
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'lime': {
        ctx.fillStyle = '#4d7c0f';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ecfccb';
        ctx.beginPath();
        ctx.arc(cx, cy, 238, 0, Math.PI * 2);
        ctx.fill();

        const segCount = 8;
        for (let i = 0; i < segCount; i++) {
          const a1 = (i / segCount) * Math.PI * 2 + 0.06;
          const a2 = ((i + 1) / segCount) * Math.PI * 2 - 0.06;

          ctx.fillStyle = '#84cc16';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, 224, a1, a2);
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = '#ecfccb';
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'coconut': {
        // Brown Husk Outer Ring
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        // Snow-White Thick Coconut Meat
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(cx, cy, 230, 0, Math.PI * 2);
        ctx.fill();

        // Hollow Deep Dark Center Cavity
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(cx, cy, 140, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'kiwi': {
        // Fuzzy Brown Skin Rim
        ctx.fillStyle = '#5c4033';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        // Radiant Emerald Green Flesh
        ctx.fillStyle = '#65a30d';
        ctx.beginPath();
        ctx.arc(cx, cy, 240, 0, Math.PI * 2);
        ctx.fill();

        // Central Pale Cream Star Oval
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 45, 60, 0, 0, Math.PI * 2);
        ctx.fill();

        // Radiating Pale Rays & Tiny Black Seeds
        ctx.strokeStyle = '#a3e635';
        ctx.lineWidth = 1.8;
        const seedCount = 28;
        for (let i = 0; i < seedCount; i++) {
          const a = (i / seedCount) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * 55, cy + Math.sin(a) * 65);
          ctx.lineTo(cx + Math.cos(a) * 160, cy + Math.sin(a) * 160);
          ctx.stroke();

          // Black seed dot
          ctx.fillStyle = '#09090b';
          const r = 90 + (i % 3) * 16;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'dragonfruit': {
        // Magenta Skin Rim
        ctx.fillStyle = '#db2777';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        // Pure Snow-White Juicy Flesh
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(cx, cy, 236, 0, Math.PI * 2);
        ctx.fill();

        // Densely speckled with tiny black poppy seeds
        ctx.fillStyle = '#0f172a';
        for (let i = 0; i < 220; i++) {
          const r = Math.sqrt(Math.random()) * 215;
          const theta = Math.random() * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(theta) * r, cy + Math.sin(theta) * r, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'banana': {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef9c3';
        ctx.beginPath();
        ctx.arc(cx, cy, 235, 0, Math.PI * 2);
        ctx.fill();

        // 3-Part Central Star
        ctx.fillStyle = '#713f12';
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'peach': {
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        const grad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 235);
        grad.addColorStop(0, '#f97316');
        grad.addColorStop(0.7, '#fb923c');
        grad.addColorStop(1, '#fdba74');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, 235, 0, Math.PI * 2);
        ctx.fill();

        // Pit cavity
        ctx.fillStyle = '#7c2d12';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 32, 48, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'pineapple': {
        ctx.fillStyle = '#854d0e';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(cx, cy, 235, 0, Math.PI * 2);
        ctx.fill();

        // Fibrous spokes & central core
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * 45, cy + Math.sin(a) * 45);
          ctx.lineTo(cx + Math.cos(a) * 220, cy + Math.sin(a) * 220);
          ctx.stroke();
        }

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(cx, cy, 45, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'strawberry': {
        ctx.fillStyle = '#be123c';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(cx, cy, 238, 0, Math.PI * 2);
        ctx.fill();

        // Pale central star & capillary rays
        ctx.fillStyle = '#ffe4e6';
        ctx.beginPath();
        ctx.arc(cx, cy, 35, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fecdd3';
        ctx.lineWidth = 2;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * 190, cy + Math.sin(a) * 190);
          ctx.stroke();
        }
        break;
      }

      case 'mango': {
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(cx, cy, 238, 0, Math.PI * 2);
        ctx.fill();

        // Mango flat fibrous pit profile
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 25, 75, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'pomegranate': {
        ctx.fillStyle = '#881337';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef2f2';
        ctx.beginPath();
        ctx.arc(cx, cy, 235, 0, Math.PI * 2);
        ctx.fill();

        // Ruby gem seed clusters in compartments
        ctx.fillStyle = '#9f1239';
        for (let i = 0; i < 90; i++) {
          const r = 40 + Math.sqrt(Math.random()) * 170;
          const th = Math.random() * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(th) * r, cy + Math.sin(th) * r, 7, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'pear': {
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(cx, cy, 250, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fefce8';
        ctx.beginPath();
        ctx.arc(cx, cy, 238, 0, Math.PI * 2);
        ctx.fill();

        // Core & pips
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy, 4, 8, -0.2, 0, Math.PI * 2);
        ctx.ellipse(cx + 10, cy, 4, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.interiorTextures.set(fruitType, texture);
    return texture;
  }
}

export const textureManager = new FruitTextureManager();
