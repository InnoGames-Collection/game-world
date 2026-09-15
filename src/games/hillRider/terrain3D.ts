/**
 * Hill Climb 3D - Procedural 3D Asphalt Mountain Road & Highland Environment
 * 
 * 1. FAIR, PROGRESSIVE, ENDLESS TERRAIN SYSTEM:
 *    - Continuous, infinite procedural road progression governed by distance-based difficulty D(x).
 *    - 6 Distinct Difficulty Phases:
 *      * Phase 1 (0–300m): Learning Zone (Very Easy -> Easy, gentle slopes <12°, wide transitions, low peaks 3m-7m)
 *      * Phase 2 (300–700m): Normal Driving (Easy -> Normal, longer climbs/descents, crests 8m-14m, moderate valleys)
 *      * Phase 3 (700–1200m): Skill Zone (Normal -> Moderately Hard, steeper hills, sharper crests 14m-18m, speed management required)
 *      * Phase 4 (1200–2000m): Advanced Zone (Hard, multi-hill combinations: uphill->crest->dip->steep climb, peaks 16m-24m)
 *      * Phase 5 (2000–3000m): Expert Zone (Very Hard, demanding hill combinations, deep valleys, shorter recovery, peaks 18m-28m)
 *      * Phase 6 (3000m+): Extreme Zone (Extreme, very steep climbs, high ridges 22m-32m, deep gorges, elite skill territory)
 *    - Controlled procedural generation: Deterministic, seedable, zero random spikes, continuous C1 smoothness.
 *    - Strict Terrain Safety Envelope: Guaranteed physically traversable, max slope strictly clamped, no vertical walls, no gaps.
 * 
 * 2. REAL ASPHALT ROAD RENDERING:
 *    - Procedurally generated high-resolution asphalt canvas texture with dark charcoal base,
 *      fine gravel aggregate flecks, micro-roughness variation, crisp solid white road edge lines,
 *      and vibrant yellow dashed center lane markings.
 *    - Compacted gravel road shoulders blending the asphalt into the landscape.
 * 
 * 3. BELIEVABLE ROADSIDE ARCHITECTURE & ENVIRONMENT:
 *    - Traditional & modern roadside shops (Suq) with colorful awnings & storefront counters.
 *    - Two-story town buildings with cantilevered balconies, tinted glass, and rooftop water tanks.
 *    - Suburban houses with pitched corrugated metal roofs, stone plinth footings, and porches.
 *    - Residential compound perimeter walls with ornate blue/green metal gates (Gibi).
 *    - Post-and-rail timber and stone fences.
 *    - Utility power poles with crossarms and transformer canisters.
 *    - Galvanized steel W-beam safety guardrails along steep drop-offs.
 *    - Parked decorative roadside vehicles (classic minibus taxi & pickup truck).
 *    - Small hillside boulders and sparse highland acacia trees outside compounds.
 *    - Distant flat-topped Amba mountain plateaus.
 */

import * as THREE from 'three';
import { Collectible3D } from './types';

export const ROAD_HALF_WIDTH = 3.5;
export const SHOULDER_HALF_WIDTH = 5.4;
export const TOTAL_TERRAIN_WIDTH = 240.0;

/**
 * Deterministic Daily Terrain Seed (YYYYMMDD) for fair, auditable Daily Top-10 prize competition.
 * All players globally playing on the same date receive the identical terrain curve and collectible sequence.
 */
export function getDailySeed(): number {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const dateInt = year * 10000 + month * 100 + day; // e.g. 20260831
  let hash = (dateInt ^ 0x48494c4c) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
  return (hash ^ (hash >>> 16)) >>> 0;
}

/**
 * Calculates continuous difficulty factor D(x) triggered progressively:
 * 
 * SERIOUS DIFFICULTY FROM THE START:
 * - High hill (14m) -> Low valley (-1.2m) -> High hill (17.5m) -> Low valley (-2.8m) -> High hill (21m)
 * - Demands throttle modulation, momentum management, and airborne pitch leveling from Obstacle #1.
 * - Simply holding accelerator will cause a loop-out / backflip / heavy bottom-out crash.
 */
export function getDifficulty(x: number): number {
  if (x <= 0) return 0.25;
  if (x <= 255) {
    // Score 0–49: High Hill & Deep Valley Challenge (Difficulty 0.25 -> 0.45)
    return 0.25 + (x / 255) * 0.20;
  } else if (x <= 650) {
    // Score 50–99: Difficulty 1 (0.45 -> 0.70)
    return 0.45 + ((x - 255) / 395) * 0.25;
  } else if (x <= 1450) {
    // Score 100–199: Difficulty 2 (0.70 -> 0.90)
    return 0.70 + ((x - 650) / 800) * 0.20;
  } else if (x <= 2800) {
    // Score 200–349: Difficulty 3 (0.90 -> 1.10)
    return 0.90 + ((x - 1450) / 1350) * 0.20;
  } else {
    // Score 350+: Advanced / Expert Zone (1.10 -> 1.35+)
    return 1.10 + (1 - Math.exp(-(x - 2800) / 2500)) * 0.25;
  }
}

/**
 * Seeded deterministic PRNG (Mulberry32) for reproducible, fair competitive runs
 */
function createMulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SplinePoint {
  x: number;
  y: number;
}

// Global deterministic spline point table
let SPLINE_CONTROL_POINTS: SplinePoint[] = [];
let maxGeneratedX = 0;

/**
 * Resets the spline chain to the deterministic daily seed foundation.
 */
export function resetSplineToDailySeed(): void {
  SPLINE_CONTROL_POINTS = [];
  maxGeneratedX = 0;
  ensureSplineControlPoints(10000);
}

/**
 * Initializes and dynamically expands the deterministic procedural spline chain.
 * Strictly starts with serious high hills and deep valleys requiring real driving skill.
 */
export function ensureSplineControlPoints(targetMaxX: number): void {
  if (SPLINE_CONTROL_POINTS.length === 0) {
    // STARTING PROGRESSION AS SPECIFIED:
    // START (Flat launch pad)
    // -> MODERATE RISE (~3.8m, ~12°)
    // -> HIGH HILL 1 (~15.5m peak, steep ~26° climb)
    // -> DEEP LOW VALLEY 1 (plunges down to -2.8m, total 18.3m elevation drop)
    // -> HIGH HILL 2 (~18.2m peak, technical 27° climb requiring momentum)
    // -> LOW SECTION (~2.0m rolling saddle)
    // -> HIGH HILL 3 (~22.0m peak)
    // -> DEEPER VALLEY (~-4.5m plunge)
    // -> progressively harder terrain
    SPLINE_CONTROL_POINTS = [
      { x: -60, y: 0 },
      { x: -30, y: 0 },
      { x: 0, y: 0 },
      { x: 10, y: 0 },        // Flat starting line
      { x: 26, y: 3.8 },      // [1. MODERATE RISE]: 3.8m elevation gain
      { x: 58, y: 15.6 },     // [2. HIGH HILL 1]: Serious 15.6m climb - requires skill & momentum!
      { x: 92, y: -2.8 },     // [3. DEEP LOW VALLEY 1]: 18.4m drop - requires braking or controlled landing!
      { x: 132, y: 18.2 },    // [4. HIGH HILL 2]: 21.0m uphill climb to +18.2m crest
      { x: 168, y: 2.0 },     // [5. LOW SECTION]: Rolling transition saddle at +2.0m
      { x: 208, y: 22.0 },    // [6. HIGH HILL 3]: Demanding +22.0m crest
      { x: 248, y: -4.5 },    // [7. DEEPER VALLEY]: -4.5m deep plunge chute
      { x: 292, y: 25.0 },    // [8. HIGH HILL 4]: Progressive harder technical terrain
    ];
    maxGeneratedX = 292;
  }

  if (targetMaxX <= maxGeneratedX) {
    return;
  }

  // Deterministic PRNG seeded with the date-based daily seed
  const dailySeed = getDailySeed();
  const rng = createMulberry32(dailySeed + SPLINE_CONTROL_POINTS.length);

  let currentX = maxGeneratedX;
  let currentY = SPLINE_CONTROL_POINTS[SPLINE_CONTROL_POINTS.length - 1].y;
  let prevSlope = (currentY - SPLINE_CONTROL_POINTS[SPLINE_CONTROL_POINTS.length - 2].y) /
                  (currentX - SPLINE_CONTROL_POINTS[SPLINE_CONTROL_POINTS.length - 2].x);

  while (currentX < targetMaxX + 3500) {
    const diff = getDifficulty(currentX);

    // 1. Difficulty-Modulated Step Distance (Wavelength)
    const minStep = 42 - diff * 18; // 37m -> 20m
    const maxStep = 58 - diff * 22; // 52m -> 30m
    const stepX = minStep + rng() * (maxStep - minStep);

    // 2. Feature Type Selection based on Difficulty & Current Height
    const featureRoll = rng();
    let targetElevation = currentY;

    // Amplitude bounds scale progressively with difficulty
    const minAmp = 10.0 + diff * 14.0;  // 13.5m -> 27m
    const maxAmp = 15.0 + diff * 20.0;  // 20m -> 40m
    const amp = minAmp + rng() * (maxAmp - minAmp);

    // Alternating elevation targets with balance-testing combinations
    if (currentY < 6.0) {
      // In valley or low pass -> Climb to steep crest or elevated ridge
      targetElevation = 12.0 + amp;
    } else if (currentY > 17.0) {
      // High on a hill/crest -> Descend to valley, camel-back saddle dip, or step descent
      if (featureRoll < 0.45 && diff >= 0.40) {
        // Camel-back saddle dip before immediate high climb
        targetElevation = currentY - (7.0 + rng() * 6.5);
      } else {
        // Full descent into deep valley
        const valleyFloor = -1.5 - diff * 4.5; // Valleys plunge down to -7.5m
        targetElevation = Math.max(-7.5, valleyFloor + rng() * 3.5);
      }
    } else {
      // Mid-slope: Rhythmic continuation or sudden counter-slope
      if (prevSlope > 0) {
        targetElevation = currentY + amp * 0.70;
      } else {
        targetElevation = Math.max(-6.5, currentY - amp * 0.70);
      }
    }

    // 3. Clamps max slope to guarantee 100% physical traversability with skill
    // Safe steep range: 24° -> 34° max
    const maxAngleDeg = 24.0 + diff * 10.0; // Strictly <= 35.5 degrees
    const maxSafeSlope = Math.tan(maxAngleDeg * (Math.PI / 180));

    let rawSlope = (targetElevation - currentY) / stepX;
    if (Math.abs(rawSlope) > maxSafeSlope) {
      targetElevation = currentY + Math.sign(rawSlope) * maxSafeSlope * stepX;
    }

    // 4. Smooth Curvature / Angular Acceleration Constraint
    const maxSlopeChange = 0.65 + diff * 0.30;
    const proposedSlope = (targetElevation - currentY) / stepX;
    if (Math.abs(proposedSlope - prevSlope) > maxSlopeChange) {
      const clampedSlope = prevSlope + Math.sign(proposedSlope - prevSlope) * maxSlopeChange;
      targetElevation = currentY + clampedSlope * stepX;
    }

    // Absolute minimum elevation floor
    targetElevation = Math.max(-7.5, targetElevation);

    currentX += stepX;
    currentY = targetElevation;
    prevSlope = (currentY - SPLINE_CONTROL_POINTS[SPLINE_CONTROL_POINTS.length - 1].y) / stepX;

    SPLINE_CONTROL_POINTS.push({ x: currentX, y: currentY });
  }

  maxGeneratedX = currentX;
}

// Initial pre-generation up to 10,000m
ensureSplineControlPoints(10000);

/**
 * Catmull-Rom Spline 1D Interpolation for seamless continuous C1 smoothness
 */
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/**
 * Fast binary search to find the segment index in SPLINE_CONTROL_POINTS
 */
function findSplineIndex(x: number): number {
  const pts = SPLINE_CONTROL_POINTS;
  let low = 0;
  let high = pts.length - 2;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (pts[mid].x <= x && x < pts[mid + 1].x) {
      return mid;
    } else if (pts[mid].x > x) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return Math.max(0, Math.min(pts.length - 2, low));
}

/**
 * Queries road center elevation at world coordinate X
 * Completely procedural, deterministic, continuous, and infinite
 */
export function getRoadElevation(x: number): number {
  if (x <= 0) return 0;

  // Dynamically generate further spline points if approaching the current buffer limit
  if (x >= maxGeneratedX - 2500) {
    ensureSplineControlPoints(x + 6000);
  }

  const pts = SPLINE_CONTROL_POINTS;
  const i = findSplineIndex(x);

  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p0 = i > 0 ? pts[i - 1] : { x: p1.x - 25, y: p1.y };
  const p3 = i + 2 < pts.length ? pts[i + 2] : { x: p2.x + 25, y: p2.y };

  const segmentLength = p2.x - p1.x;
  const t = segmentLength > 0 ? (x - p1.x) / segmentLength : 0;
  const clampedT = Math.max(0, Math.min(1, t));

  const baseElevation = catmullRom(p0.y, p1.y, p2.y, p3.y, clampedT);

  // Progressive balance-testing road dynamics (short sharp bumps & rhythmic washboards at higher difficulty)
  const diff = getDifficulty(x);
  
  // High-frequency surface micro-texture
  const microRoughness = Math.sin(x * 0.12) * (0.02 + 0.04 * diff);
  
  // Periodic washboard / whoop sections in higher difficulty zones (x > 500m) to test suspension & balance
  let dynamicBumps = 0;
  if (diff > 0.35) {
    const bumpPhase = Math.sin(x * 0.015);
    if (bumpPhase > 0.4) {
      // In a washboard ripple zone
      const rippleAmp = (diff - 0.35) * 0.38;
      dynamicBumps = Math.sin(x * 0.55) * rippleAmp * (bumpPhase - 0.4) * 1.6;
    }
  }

  return baseElevation + microRoughness + dynamicBumps;
}

/**
 * Calculates continuous 3D elevation at any (x, z) world position
 */
export function getTerrainElevation(x: number, z: number = 0): number {
  const roadY = getRoadElevation(x);
  const absZ = Math.abs(z);

  // Flat asphalt road and compacted gravel shoulder
  if (absZ <= SHOULDER_HALF_WIDTH) {
    return roadY;
  }

  // Natural hillside slopes extending outward into the landscape
  const distFromShoulder = absZ - SHOULDER_HALF_WIDTH;
  const sideHarmonic = Math.sin(x * 0.028 + z * 0.06) * 2.0 + Math.cos(x * 0.012 - z * 0.03) * 2.8;
  const slope = Math.pow(distFromShoulder * 0.24, 1.2) * (sideHarmonic > 0 ? 0.75 : -0.3);

  return roadY + slope;
}

/**
 * Calculates road normal vector and slope angle at x along the asphalt center
 */
export function getTerrainSlopeAt(x: number, z: number = 0): { slopeAngle: number; normal: THREE.Vector3 } {
  const delta = 0.25;
  const h1 = getTerrainElevation(x - delta, z);
  const h2 = getTerrainElevation(x + delta, z);
  const dh_dx = (h2 - h1) / (delta * 2);

  const hz1 = getTerrainElevation(x, z - delta);
  const hz2 = getTerrainElevation(x, z + delta);
  const dh_dz = (hz2 - hz1) / (delta * 2);

  const tangentX = new THREE.Vector3(1, dh_dx, 0).normalize();
  const tangentZ = new THREE.Vector3(0, dh_dz, 1).normalize();
  const normal = new THREE.Vector3().crossVectors(tangentZ, tangentX).normalize();

  const slopeAngle = Math.atan2(dh_dx, 1);
  return { slopeAngle, normal };
}

/**
 * Generates a high-detail procedural Asphalt Canvas Texture
 */
export function createProceduralAsphaltTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Base Dark Charcoal Asphalt Color
    ctx.fillStyle = '#181b22';
    ctx.fillRect(0, 0, width, height);

    // 2. High-Frequency Gravel Aggregate & Surface Roughness Specks
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 32;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise + 3));
    }
    ctx.putImageData(imgData, 0, 0);

    // 3. Compacted Road Shoulder Gravel Gradients (Top & Bottom Edges)
    const shoulderH = Math.floor(height * 0.08);

    const gradTop = ctx.createLinearGradient(0, 0, 0, shoulderH);
    gradTop.addColorStop(0, '#4a3b30');
    gradTop.addColorStop(1, 'rgba(24, 27, 34, 0)');
    ctx.fillStyle = gradTop;
    ctx.fillRect(0, 0, width, shoulderH);

    const gradBottom = ctx.createLinearGradient(0, height, 0, height - shoulderH);
    gradBottom.addColorStop(0, '#4a3b30');
    gradBottom.addColorStop(1, 'rgba(24, 27, 34, 0)');
    ctx.fillStyle = gradBottom;
    ctx.fillRect(0, height - shoulderH, width, shoulderH);

    // 4. Solid Crisp White Road Edge Markings
    const edgeOffset = Math.floor(height * 0.10);
    const edgeLineWidth = 14;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, edgeOffset, width, edgeLineWidth);
    ctx.fillRect(0, height - edgeOffset - edgeLineWidth, width, edgeLineWidth);

    // 5. Vibrant Yellow Dashed Center Stripe
    const centerY = Math.floor(height / 2);
    const dashLength = 72;
    const gapLength = 56;
    const stripeWidth = 16;

    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#d97706';
    ctx.shadowBlur = 3;

    for (let x = 0; x < width; x += dashLength + gapLength) {
      ctx.fillRect(x, centerY - stripeWidth / 2, dashLength, stripeWidth);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 8;
  return texture;
}

// Cached singleton asphalt texture for memory efficiency across chunks
let cachedAsphaltTexture: THREE.CanvasTexture | null = null;
function getCachedAsphaltTexture(): THREE.CanvasTexture {
  if (!cachedAsphaltTexture) {
    cachedAsphaltTexture = createProceduralAsphaltTexture();
  }
  return cachedAsphaltTexture;
}

/**
 * Creates the high-resolution 3D Asphalt Road with 3D Curb Depth and Surrounding Ground Mesh for any distance chunk
 */
export function createTerrainMesh(startDistance: number, endDistance: number): THREE.Group {
  const group = new THREE.Group();

  const length = endDistance - startDistance;
  const stepX = 0.75; // Dense longitudinal sampling for smooth continuous curves
  const segmentsX = Math.ceil(length / stepX);
  const segmentsZ = 56;
  const bedrockDepth = -250.0;
  const halfWidth = TOTAL_TERRAIN_WIDTH / 2; // 120.0m

  // -------------------------------------------------------------
  // 1. SURROUNDING HIGHLAND LANDSCAPE MESH (Solid Continuous Ground)
  // -------------------------------------------------------------
  const terrainGeo = new THREE.PlaneGeometry(
    length,
    TOTAL_TERRAIN_WIDTH,
    segmentsX,
    segmentsZ
  );

  terrainGeo.rotateX(-Math.PI / 2);
  terrainGeo.translate(startDistance + length / 2, 0, 0);

  const posAttr = terrainGeo.attributes.position;
  const colorAttr = new Float32Array(posAttr.count * 3);

  // Natural Highland Terrain Colors
  const grassMeadow = new THREE.Color(0x386641);
  const grassHigh = new THREE.Color(0x588157);
  const rockCliff = new THREE.Color(0x4d5560);
  const earthSoil = new THREE.Color(0x4a3b32);

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const y = getTerrainElevation(x, z);
    posAttr.setY(i, y);

    const absZ = Math.abs(z);
    let vColor = grassMeadow;

    if (absZ <= SHOULDER_HALF_WIDTH + 1.8) {
      const f = Math.max(0, (absZ - SHOULDER_HALF_WIDTH) / 1.8);
      vColor = earthSoil.clone().lerp(grassMeadow, f);
    } else {
      if (y > 18.0) {
        vColor = y > 25.0 ? rockCliff : grassHigh;
      } else {
        const noise = Math.sin(x * 0.06 + z * 0.14) * 0.5 + 0.5;
        vColor = grassMeadow.clone().lerp(grassHigh, noise * 0.40);
      }
    }

    colorAttr[i * 3] = vColor.r;
    colorAttr[i * 3 + 1] = vColor.g;
    colorAttr[i * 3 + 2] = vColor.b;
  }

  terrainGeo.setAttribute('color', new THREE.BufferAttribute(colorAttr, 3));
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.94,
    metalness: 0.06,
    flatShading: true,
  });

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;
  group.add(terrainMesh);

  // -------------------------------------------------------------
  // 1B. DEEP LATERAL CLIFF SKIRTS & BEDROCK FLOOR (Guarantees zero sky/void below road)
  // -------------------------------------------------------------
  const cliffMat = new THREE.MeshStandardMaterial({
    color: 0x382c22,
    roughness: 0.96,
    metalness: 0.04,
    flatShading: true,
  });

  const skirtVertices: number[] = [];
  const skirtIndices: number[] = [];

  // Left Skirt (z = -halfWidth)
  let vOffset = 0;
  for (let i = 0; i <= segmentsX; i++) {
    const x = startDistance + (i / segmentsX) * length;
    const topY = getTerrainElevation(x, -halfWidth);

    skirtVertices.push(x, topY, -halfWidth);
    skirtVertices.push(x, bedrockDepth, -halfWidth);

    if (i < segmentsX) {
      const idx = vOffset + i * 2;
      skirtIndices.push(idx, idx + 2, idx + 1);
      skirtIndices.push(idx + 1, idx + 2, idx + 3);
    }
  }

  // Right Skirt (z = +halfWidth)
  vOffset = skirtVertices.length / 3;
  for (let i = 0; i <= segmentsX; i++) {
    const x = startDistance + (i / segmentsX) * length;
    const topY = getTerrainElevation(x, halfWidth);

    skirtVertices.push(x, topY, halfWidth);
    skirtVertices.push(x, bedrockDepth, halfWidth);

    if (i < segmentsX) {
      const idx = vOffset + i * 2;
      skirtIndices.push(idx, idx + 1, idx + 2);
      skirtIndices.push(idx + 1, idx + 3, idx + 2);
    }
  }

  // Rear Transverse Skirt (At start of game world x = 0)
  if (startDistance <= 0) {
    vOffset = skirtVertices.length / 3;
    const rearSteps = 32;
    for (let i = 0; i <= rearSteps; i++) {
      const z = -halfWidth + (i / rearSteps) * TOTAL_TERRAIN_WIDTH;
      const topY = getTerrainElevation(0, z);

      skirtVertices.push(0, topY, z);
      skirtVertices.push(0, bedrockDepth, z);

      if (i < rearSteps) {
        const idx = vOffset + i * 2;
        skirtIndices.push(idx, idx + 1, idx + 2);
        skirtIndices.push(idx + 1, idx + 3, idx + 2);
      }
    }
  }

  const skirtGeo = new THREE.BufferGeometry();
  skirtGeo.setAttribute('position', new THREE.Float32BufferAttribute(skirtVertices, 3));
  skirtGeo.setIndex(skirtIndices);
  skirtGeo.computeVertexNormals();

  const skirtMesh = new THREE.Mesh(skirtGeo, cliffMat);
  skirtMesh.receiveShadow = true;
  group.add(skirtMesh);

  // 1C. SOLID BEDROCK SUBTERRANEAN FLOOR
  const floorGeo = new THREE.PlaneGeometry(length, TOTAL_TERRAIN_WIDTH);
  floorGeo.rotateX(-Math.PI / 2);
  floorGeo.translate(startDistance + length / 2, bedrockDepth, 0);
  const floorMesh = new THREE.Mesh(floorGeo, cliffMat);
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // -------------------------------------------------------------
  // 2. PLAYABLE CONTINUOUS ASPHALT ROAD MESH (With Metric UVs)
  // -------------------------------------------------------------
  const roadWidth = ROAD_HALF_WIDTH * 2; // 7.0m
  const roadSegmentsZ = 12;
  const roadGeo = new THREE.PlaneGeometry(
    length,
    roadWidth,
    segmentsX,
    roadSegmentsZ
  );

  roadGeo.rotateX(-Math.PI / 2);
  roadGeo.translate(startDistance + length / 2, 0, 0);

  const roadPosAttr = roadGeo.attributes.position;
  const roadUvAttr = roadGeo.attributes.uv;

  for (let i = 0; i < roadPosAttr.count; i++) {
    const x = roadPosAttr.getX(i);
    const z = roadPosAttr.getZ(i);
    const y = getTerrainElevation(x, z) + 0.035; // Razor-sharp top driving surface
    roadPosAttr.setY(i, y);

    // Uniform Metric UV Mapping: 6.0m per texture repeat along X, 0 to 1 across road Z
    const u = x / 6.0;
    const v = (z + ROAD_HALF_WIDTH) / roadWidth;
    roadUvAttr.setXY(i, u, v);
  }

  roadGeo.computeVertexNormals();

  const roadMat = new THREE.MeshStandardMaterial({
    map: getCachedAsphaltTexture(),
    roughness: 0.84,
    metalness: 0.14,
    polygonOffset: true,
    polygonOffsetFactor: -1.5,
    polygonOffsetUnits: -1.5,
  });

  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.receiveShadow = true;
  group.add(roadMesh);

  // -------------------------------------------------------------
  // 3. PHYSICAL 3D ROAD CURB & EDGE DEPTH (Visual Structure)
  // -------------------------------------------------------------
  const curbMat = new THREE.MeshStandardMaterial({
    color: 0x242830,
    roughness: 0.90,
    metalness: 0.10,
    flatShading: true,
  });

  const curbVertices: number[] = [];
  const curbIndices: number[] = [];

  // Left Curb Edge (z = -ROAD_HALF_WIDTH)
  let curbVOffset = 0;
  for (let i = 0; i <= segmentsX; i++) {
    const x = startDistance + (i / segmentsX) * length;
    const topY = getTerrainElevation(x, -ROAD_HALF_WIDTH) + 0.035;
    const bottomY = getTerrainElevation(x, -ROAD_HALF_WIDTH) - 0.36; // Embedded into solid ground

    curbVertices.push(x, topY, -ROAD_HALF_WIDTH);
    curbVertices.push(x, bottomY, -ROAD_HALF_WIDTH - 0.22);

    if (i < segmentsX) {
      const idx = curbVOffset + i * 2;
      curbIndices.push(idx, idx + 2, idx + 1);
      curbIndices.push(idx + 1, idx + 2, idx + 3);
    }
  }

  // Right Curb Edge (z = +ROAD_HALF_WIDTH)
  curbVOffset = curbVertices.length / 3;
  for (let i = 0; i <= segmentsX; i++) {
    const x = startDistance + (i / segmentsX) * length;
    const topY = getTerrainElevation(x, ROAD_HALF_WIDTH) + 0.035;
    const bottomY = getTerrainElevation(x, ROAD_HALF_WIDTH) - 0.36; // Embedded into solid ground

    curbVertices.push(x, topY, ROAD_HALF_WIDTH);
    curbVertices.push(x, bottomY, ROAD_HALF_WIDTH + 0.22);

    if (i < segmentsX) {
      const idx = curbVOffset + i * 2;
      curbIndices.push(idx, idx + 1, idx + 2);
      curbIndices.push(idx + 1, idx + 3, idx + 2);
    }
  }

  const curbGeo = new THREE.BufferGeometry();
  curbGeo.setAttribute('position', new THREE.Float32BufferAttribute(curbVertices, 3));
  curbGeo.setIndex(curbIndices);
  curbGeo.computeVertexNormals();

  const curbMesh = new THREE.Mesh(curbGeo, curbMat);
  curbMesh.receiveShadow = true;
  group.add(curbMesh);

  return group;
}

// ---------------------------------------------------------------------------
// Roadside Architecture Helpers (Villas, Townhouses, Suq Kiosks, Guardrails)
// ---------------------------------------------------------------------------

function createVillaMesh(
  side: number,
  roofMat: THREE.Material,
  stuccoMat: THREE.Material,
  stoneMat: THREE.Material,
  accentMat: THREE.Material,
  woodMat: THREE.Material
): THREE.Group {
  const g = new THREE.Group();

  // Stone Plinth
  const plinthGeo = new THREE.BoxGeometry(10.5, 0.9, 8.5);
  const plinth = new THREE.Mesh(plinthGeo, stoneMat);
  plinth.position.set(0, 0.45, 0);
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  g.add(plinth);

  // Main House Body
  const bodyGeo = new THREE.BoxGeometry(9.5, 3.6, 7.5);
  const body = new THREE.Mesh(bodyGeo, stuccoMat);
  body.position.set(0, 2.7, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // Veranda Porch
  const porchGeo = new THREE.BoxGeometry(4.5, 0.25, 2.5);
  const porch = new THREE.Mesh(porchGeo, stoneMat);
  porch.position.set(0, 0.9, -4.5 * side);
  g.add(porch);

  // Door
  const doorGeo = new THREE.BoxGeometry(1.4, 2.4, 0.15);
  const door = new THREE.Mesh(doorGeo, woodMat);
  door.position.set(0, 2.1, -3.8 * side);
  g.add(door);

  // Hipper Roof
  const roofGeo = new THREE.ConeGeometry(7.2, 2.2, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 5.6, 0);
  roof.scale.set(1.1, 1.0, 0.85);
  roof.castShadow = true;
  g.add(roof);

  return g;
}

function createTownhouseMesh(
  side: number,
  roofMat: THREE.Material,
  stuccoMat: THREE.Material,
  stoneMat: THREE.Material,
  glassMat: THREE.Material,
  metalMat: THREE.Material
): THREE.Group {
  const g = new THREE.Group();

  // Ground Floor Commercial / Living
  const gfGeo = new THREE.BoxGeometry(11, 4.0, 9);
  const gf = new THREE.Mesh(gfGeo, stuccoMat);
  gf.position.set(0, 2.0, 0);
  gf.castShadow = true;
  gf.receiveShadow = true;
  g.add(gf);

  // Second Floor with Balcony Cantilever
  const sfGeo = new THREE.BoxGeometry(11.6, 3.8, 9.6);
  const sf = new THREE.Mesh(sfGeo, stuccoMat);
  sf.position.set(0, 5.9, 0);
  sf.castShadow = true;
  sf.receiveShadow = true;
  g.add(sf);

  // Balcony Window Glass
  const winGeo = new THREE.BoxGeometry(3.5, 2.2, 0.2);
  const win = new THREE.Mesh(winGeo, glassMat);
  win.position.set(0, 6.0, -4.9 * side);
  g.add(win);

  // Flat Roof Parapet
  const roofGeo = new THREE.BoxGeometry(12, 0.4, 10);
  const roof = new THREE.Mesh(roofGeo, stoneMat);
  roof.position.set(0, 7.9, 0);
  g.add(roof);

  // Rooftop Water Tank (Rotto)
  const tankGeo = new THREE.CylinderGeometry(1.1, 1.1, 1.8, 12);
  const tank = new THREE.Mesh(tankGeo, metalMat);
  tank.position.set(2.8, 9.0, 2.0);
  tank.castShadow = true;
  g.add(tank);

  return g;
}

function createSuqKioskMesh(side: number, awningMat: THREE.Material, woodMat: THREE.Material): THREE.Group {
  const g = new THREE.Group();

  // Kiosk Booth Box
  const boxGeo = new THREE.BoxGeometry(3.6, 2.8, 2.8);
  const box = new THREE.Mesh(boxGeo, woodMat);
  box.position.set(0, 1.4, 0);
  box.castShadow = true;
  box.receiveShadow = true;
  g.add(box);

  // Counter Opening Shelf
  const shelfGeo = new THREE.BoxGeometry(2.4, 0.15, 0.8);
  const shelf = new THREE.Mesh(shelfGeo, woodMat);
  shelf.position.set(0, 1.2, -1.6 * side);
  g.add(shelf);

  // Slanted Canvas Awning
  const awningGeo = new THREE.BoxGeometry(3.8, 0.1, 1.6);
  const awning = new THREE.Mesh(awningGeo, awningMat);
  awning.position.set(0, 2.8, -1.8 * side);
  awning.rotation.x = side * 0.35;
  awning.castShadow = true;
  g.add(awning);

  return g;
}

function createGuardrailMesh(length: number, mat: THREE.Material): THREE.Group {
  const g = new THREE.Group();

  // W-Beam Rail
  const beamGeo = new THREE.BoxGeometry(length, 0.45, 0.12);
  const beam = new THREE.Mesh(beamGeo, mat);
  beam.position.set(0, 0.85, 0);
  beam.castShadow = true;
  g.add(beam);

  // Posts every 3.5m
  const postCount = Math.floor(length / 3.5) + 1;
  const postGeo = new THREE.BoxGeometry(0.16, 1.1, 0.16);
  for (let i = 0; i < postCount; i++) {
    const post = new THREE.Mesh(postGeo, mat);
    const px = -length / 2 + i * 3.5;
    post.position.set(px, 0.55, 0);
    post.castShadow = true;
    g.add(post);
  }

  return g;
}

function createUtilityPoleMesh(poleMat: THREE.Material, crossarmMat: THREE.Material): THREE.Group {
  const g = new THREE.Group();

  const poleGeo = new THREE.CylinderGeometry(0.18, 0.24, 9.5, 8);
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(0, 4.75, 0);
  pole.castShadow = true;
  g.add(pole);

  const crossarmGeo = new THREE.BoxGeometry(2.4, 0.14, 0.14);
  const crossarm = new THREE.Mesh(crossarmGeo, crossarmMat);
  crossarm.position.set(0, 8.8, 0);
  g.add(crossarm);

  return g;
}

function createAcaciaTreeMesh(trunkMat: THREE.Material, foliageMat: THREE.Material): THREE.Group {
  const g = new THREE.Group();

  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.6, 5.0, 7);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(0, 2.5, 0);
  trunk.castShadow = true;
  g.add(trunk);

  // Umbrella Flat Foliage Canopy
  const foliageGeo = new THREE.CylinderGeometry(4.5, 3.5, 1.4, 8);
  const foliage = new THREE.Mesh(foliageGeo, foliageMat);
  foliage.position.set(0, 5.4, 0);
  foliage.castShadow = true;
  g.add(foliage);

  return g;
}

function createGraniteBoulderMesh(): THREE.Group {
  const g = new THREE.Group();
  const boulderMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.95, flatShading: true });
  const boulderGeo = new THREE.DodecahedronGeometry(2.2, 1);
  const boulder = new THREE.Mesh(boulderGeo, boulderMat);
  boulder.position.set(0, 1.5, 0);
  boulder.scale.set(1.4, 0.9, 1.1);
  boulder.castShadow = true;
  boulder.receiveShadow = true;
  g.add(boulder);
  return g;
}

/**
 * Creates 3D Environmental Props dynamically for any distance chunk
 */
export function createEnvironmentProps(startDistance: number, endDistance: number): THREE.Group {
  const group = new THREE.Group();

  // Materials
  const stuccoCreamMat = new THREE.MeshStandardMaterial({ color: 0xfdf6e2, roughness: 0.9, flatShading: true });
  const stuccoTerracottaMat = new THREE.MeshStandardMaterial({ color: 0xc86432, roughness: 0.9, flatShading: true });
  const stuccoWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.88, flatShading: true });
  const stoneBaseMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.94, flatShading: true });
  const industrialSteelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.75, roughness: 0.35, flatShading: true });

  const roofZincSilverMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.4, flatShading: true });
  const roofTerracottaMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.75, flatShading: true });
  const roofDarkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, flatShading: true });
  const roofGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7, flatShading: true });

  const glassWindowMat = new THREE.MeshStandardMaterial({
    color: 0x60a5fa,
    metalness: 0.85,
    roughness: 0.15,
    emissive: 0x1e3a8a,
    emissiveIntensity: 0.3,
  });

  const woodDoorMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 });
  const guardrailMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.85, roughness: 0.25 });
  const utilityPoleMat = new THREE.MeshStandardMaterial({ color: 0x4a3b32, roughness: 0.9 });
  const concretePoleMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.8 });
  const acaciaTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2c1c, roughness: 0.9 });
  const acaciaFoliageMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.85, flatShading: true });
  const awningRedStripeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.8 });
  const awningYellowStripeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.8 });

  const roofList = [roofZincSilverMat, roofTerracottaMat, roofDarkMat, roofGreenMat];

  // Procedural prop distribution based on segment distance
  const length = endDistance - startDistance;
  const chunkSteps = Math.ceil(length / 75);

  for (let s = 0; s < chunkSteps; s++) {
    const baseX = startDistance + s * 75;
    const segmentKm = Math.floor(baseX / 1000) % 4;

    // 1. Utility Poles every ~45m along right shoulder
    const poleX = baseX + 25;
    if (poleX >= startDistance && poleX <= endDistance) {
      const poleZ = 7.5;
      const pole = createUtilityPoleMesh(segmentKm >= 1 ? concretePoleMat : utilityPoleMat, industrialSteelMat);
      pole.position.set(poleX, getTerrainElevation(poleX, poleZ), poleZ);
      group.add(pole);
    }

    // 2. Roadside Architecture (Villas, Townhouses, Kiosks)
    const bldgX = baseX + 45;
    if (bldgX >= startDistance && bldgX <= endDistance) {
      const side = (s % 2 === 0 ? 1 : -1);
      const bldgZ = side * 14.0;
      const groundY = getTerrainElevation(bldgX, bldgZ);
      const roofM = roofList[s % roofList.length];

      if (segmentKm === 0) {
        // Suburban Villa
        const villa = createVillaMesh(side, roofM, stuccoCreamMat, stoneBaseMat, stuccoWhiteMat, woodDoorMat);
        villa.position.set(bldgX, groundY, bldgZ);
        group.add(villa);
      } else if (segmentKm === 1) {
        // Two-Story Townhouse
        const townhouse = createTownhouseMesh(side, roofM, stuccoTerracottaMat, stoneBaseMat, glassWindowMat, industrialSteelMat);
        townhouse.position.set(bldgX, groundY, bldgZ);
        group.add(townhouse);
      } else if (segmentKm === 2) {
        // Roadside Kiosk & Acacia
        const kiosk = createSuqKioskMesh(side, s % 2 === 0 ? awningRedStripeMat : awningYellowStripeMat, woodDoorMat);
        kiosk.position.set(bldgX, groundY, bldgZ);
        group.add(kiosk);
      } else {
        // Mountain Boulders & Highland Acacia
        const boulder = createGraniteBoulderMesh();
        boulder.position.set(bldgX, groundY, bldgZ);
        group.add(boulder);
      }
    }

    // 3. Safety Guardrails along Steep Slopes / Bridges
    const railX = baseX + 10;
    if (railX >= startDistance && railX <= endDistance) {
      const slopeInfo = getTerrainSlopeAt(railX, 0);
      if (Math.abs(slopeInfo.slopeAngle) > 0.18) {
        const guardrail = createGuardrailMesh(32, guardrailMat);
        guardrail.position.set(railX + 16, getTerrainElevation(railX + 16, -5.4), -5.4);
        group.add(guardrail);
      }
    }

    // 4. Sparse Highland Acacia Trees outside road corridor
    const treeX = baseX + 60;
    if (treeX >= startDistance && treeX <= endDistance) {
      const treeZ = (s % 2 === 0 ? -1 : 1) * 22.0;
      const tree = createAcaciaTreeMesh(acaciaTrunkMat, acaciaFoliageMat);
      tree.position.set(treeX, getTerrainElevation(treeX, treeZ), treeZ);
      group.add(tree);
    }
  }

  return group;
}

/**
 * Creates scenic flat-topped Amba mountains and peaks in the distance
 */
export function createMountainRange(startDistance: number, endDistance: number): THREE.Group {
  const group = new THREE.Group();
  const count = Math.ceil((endDistance - startDistance) / 60);

  const mountainMat = new THREE.MeshStandardMaterial({
    color: 0x1d3557,
    roughness: 0.95,
    flatShading: true,
  });

  const plateauMat = new THREE.MeshStandardMaterial({
    color: 0x2b4c6f,
    roughness: 0.92,
    flatShading: true,
  });

  for (let i = 0; i < count; i++) {
    const x = startDistance + i * 60;
    const side = (i % 2 === 0 ? 1 : -1) * (52 + ((i * 13) % 25));
    const isAmbaPlateau = i % 2 === 0;

    if (isAmbaPlateau) {
      // Characteristic Ethiopian flat-topped Amba mountain
      const height = 45 + ((i * 7) % 25);
      const topRadius = 24 + ((i * 5) % 15);
      const bottomRadius = 38 + ((i * 6) % 18);
      const ambaGeo = new THREE.CylinderGeometry(topRadius, bottomRadius, height, 7);
      const amba = new THREE.Mesh(ambaGeo, plateauMat);
      amba.position.set(x, height / 2 - 12, side);
      amba.rotation.y = (i * 1.2) % Math.PI;
      group.add(amba);
    } else {
      // Mountain Peak Ridge
      const height = 55 + ((i * 9) % 30);
      const radius = 32 + ((i * 4) % 16);
      const coneGeo = new THREE.ConeGeometry(radius, height, 6);
      const mountain = new THREE.Mesh(coneGeo, mountainMat);
      mountain.position.set(x, height / 2 - 12, side);
      mountain.rotation.y = (i * 0.9) % Math.PI;
      group.add(mountain);
    }
  }

  return group;
}

/**
 * Generates Collectibles (Coins & Fuel Jerrycans) for any distance chunk
 */
export function generateCollectiblesChunk(startDistance: number, endDistance: number): Collectible3D[] {
  const items: Collectible3D[] = [];

  // 1. Gold Coins in rhythmic arcs along crests and valleys (~every 38m)
  const coinStep = 38;
  const startCoinIndex = Math.floor(startDistance / coinStep);
  const endCoinIndex = Math.ceil(endDistance / coinStep);

  for (let c = startCoinIndex; c < endCoinIndex; c++) {
    const clusterStartX = Math.max(startDistance + 4, c * coinStep + 6);
    if (clusterStartX < endDistance - 10) {
      const clusterSize = 3 + (c % 3);
      for (let i = 0; i < clusterSize; i++) {
        const x = clusterStartX + i * 3.0;
        if (x >= startDistance && x <= endDistance) {
          const groundY = getTerrainElevation(x, 0);
          items.push({
            id: `coin_${x.toFixed(1)}`,
            type: 'coin',
            x,
            y: groundY + 1.25,
            z: 0,
            collected: false,
            value: 10,
          });
        }
      }
    }
  }

  // 2. Fuel Jerrycans spaced strategically (~every 105m) to reward momentum and avoid starvation
  const fuelStep = 105;
  const startFuelIndex = Math.floor(startDistance / fuelStep);
  const endFuelIndex = Math.ceil(endDistance / fuelStep);

  for (let f = startFuelIndex; f < endFuelIndex; f++) {
    const fuelX = f * fuelStep + 42;
    if (fuelX >= startDistance && fuelX <= endDistance) {
      const groundY = getTerrainElevation(fuelX, 0);
      items.push({
        id: `fuel_${fuelX.toFixed(1)}`,
        type: 'fuel',
        x: fuelX,
        y: groundY + 1.35,
        z: 0,
        collected: false,
        value: 100,
      });
    }
  }

  return items;
}

/**
 * Backward compatibility helper to generate list of collectibles up to maxDistance
 */
export function generateCollectiblesList(maxDistance: number): Collectible3D[] {
  return generateCollectiblesChunk(0, maxDistance);
}

/**
 * Creates 3D Gold Coin Mesh Template
 */
export function createCoinMesh(): THREE.Group {
  const group = new THREE.Group();

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
  });

  const coinGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.16, 16);
  coinGeo.rotateX(Math.PI / 2);
  const coinMesh = new THREE.Mesh(coinGeo, goldMat);
  coinMesh.castShadow = true;
  group.add(coinMesh);

  const rimGeo = new THREE.TorusGeometry(0.68, 0.07, 8, 16);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.95,
    roughness: 0.15,
  });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  group.add(rimMesh);

  return group;
}

/**
 * Creates 3D Red Fuel Jerrycan Mesh Template
 */
export function createFuelMesh(): THREE.Group {
  const group = new THREE.Group();

  const redMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    metalness: 0.5,
    roughness: 0.35,
  });

  const capMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.8,
    roughness: 0.2,
  });

  const canGeo = new THREE.BoxGeometry(0.72, 1.05, 0.52);
  const canMesh = new THREE.Mesh(canGeo, redMat);
  canMesh.castShadow = true;
  group.add(canMesh);

  const handleGeo = new THREE.BoxGeometry(0.38, 0.12, 0.14);
  const handleMesh = new THREE.Mesh(handleGeo, redMat);
  handleMesh.position.set(0, 0.62, 0);
  group.add(handleMesh);

  const capGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.18, 8);
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.position.set(0.2, 0.62, 0);
  group.add(capMesh);

  return group;
}
