import * as THREE from 'three';
import { FruitType, FruitConfig } from './types';
import { textureManager } from './fruitTextures';

export const FRUIT_CONFIGS: Record<FruitType, FruitConfig> = {
  watermelon: {
    name: 'Watermelon',
    points: 1,
    radius: 1.45,
    juiceColor: '#f43f5e',
    splatColor: '#e11d48',
    crunchPitch: 1.0,
    mass: 1.4,
  },
  apple: {
    name: 'Red Apple',
    points: 1,
    radius: 1.15,
    juiceColor: '#fef08a',
    splatColor: '#84cc16',
    crunchPitch: 1.3,
    mass: 1.0,
  },
  orange: {
    name: 'Orange',
    points: 1,
    radius: 1.18,
    juiceColor: '#fb923c',
    splatColor: '#ea580c',
    crunchPitch: 1.1,
    mass: 1.05,
  },
  lemon: {
    name: 'Lemon',
    points: 1,
    radius: 1.08,
    juiceColor: '#fef08a',
    splatColor: '#eab308',
    crunchPitch: 1.25,
    mass: 0.95,
  },
  lime: {
    name: 'Lime',
    points: 1,
    radius: 0.96,
    juiceColor: '#bef264',
    splatColor: '#65a30d',
    crunchPitch: 1.35,
    mass: 0.85,
  },
  banana: {
    name: 'Banana',
    points: 2,
    radius: 1.1,
    juiceColor: '#fef9c3',
    splatColor: '#eab308',
    crunchPitch: 1.15,
    mass: 0.9,
  },
  peach: {
    name: 'Peach',
    points: 2,
    radius: 1.15,
    juiceColor: '#fdba74',
    splatColor: '#f97316',
    crunchPitch: 1.1,
    mass: 1.0,
  },
  pear: {
    name: 'Pear',
    points: 1,
    radius: 1.15,
    juiceColor: '#fef08a',
    splatColor: '#a3e635',
    crunchPitch: 1.25,
    mass: 1.0,
  },
  pineapple: {
    name: 'Pineapple',
    points: 3,
    radius: 1.45,
    juiceColor: '#fef08a',
    splatColor: '#ca8a04',
    crunchPitch: 1.05,
    mass: 1.5,
  },
  coconut: {
    name: 'Coconut',
    points: 2,
    radius: 1.28,
    juiceColor: '#f8fafc',
    splatColor: '#ffffff',
    crunchPitch: 0.85,
    mass: 1.35,
  },
  strawberry: {
    name: 'Strawberry',
    points: 1,
    radius: 0.92,
    juiceColor: '#f43f5e',
    splatColor: '#e11d48',
    crunchPitch: 1.4,
    mass: 0.75,
  },
  kiwi: {
    name: 'Kiwi',
    points: 2,
    radius: 1.02,
    juiceColor: '#a3e635',
    splatColor: '#65a30d',
    crunchPitch: 1.2,
    mass: 0.9,
  },
  mango: {
    name: 'Mango',
    points: 2,
    radius: 1.22,
    juiceColor: '#fbbf24',
    splatColor: '#f59e0b',
    crunchPitch: 1.1,
    mass: 1.1,
  },
  dragonfruit: {
    name: 'Dragon Fruit',
    points: 3,
    radius: 1.32,
    juiceColor: '#f472b6',
    splatColor: '#db2777',
    crunchPitch: 1.15,
    mass: 1.25,
  },
  pomegranate: {
    name: 'Pomegranate',
    points: 3,
    radius: 1.22,
    juiceColor: '#be123c',
    splatColor: '#881337',
    crunchPitch: 1.0,
    mass: 1.2,
  },
};

export const BUMP_SCALES: Record<FruitType, number> = {
  orange: 0.045,
  lemon: 0.040,
  lime: 0.038,
  apple: 0.018,
  watermelon: 0.016,
  peach: 0.042,
  pear: 0.026,
  banana: 0.025,
  strawberry: 0.065,
  pineapple: 0.080,
  coconut: 0.075,
  kiwi: 0.055,
  mango: 0.016,
  dragonfruit: 0.035,
  pomegranate: 0.022,
};

export const BASE_ROUGHNESS: Record<FruitType, number> = {
  apple: 0.38,
  orange: 0.54,
  lemon: 0.52,
  lime: 0.50,
  peach: 0.72,
  watermelon: 0.42,
  pear: 0.46,
  banana: 0.44,
  strawberry: 0.35,
  pineapple: 0.65,
  coconut: 0.85,
  kiwi: 0.78,
  mango: 0.40,
  dragonfruit: 0.46,
  pomegranate: 0.42,
};

/**
 * Procedurally shapes a base sphere geometry into authentic natural fruit forms
 */
function shapeGeometry(
  type: FruitType,
  r: number,
  isHalf: boolean = false,
  halfSide: 'top' | 'bottom' = 'top'
): THREE.BufferGeometry {
  const widthSegs = 32;
  const heightSegs = 24;

  let geo: THREE.SphereGeometry;
  if (isHalf) {
    if (halfSide === 'top') {
      geo = new THREE.SphereGeometry(r, widthSegs, heightSegs / 2, 0, Math.PI * 2, 0, Math.PI / 2);
    } else {
      geo = new THREE.SphereGeometry(
        r,
        widthSegs,
        heightSegs / 2,
        0,
        Math.PI * 2,
        Math.PI / 2,
        Math.PI / 2
      );
    }
  } else {
    geo = new THREE.SphereGeometry(r, widthSegs, heightSegs);
  }

  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const ny = v.y / r; // Normalized height -1 to +1
    const theta = Math.atan2(v.z, v.x);
    const radXZ = Math.sqrt(v.x * v.x + v.z * v.z);

    switch (type) {
      case 'apple': {
        // Natural apple: indented stem cavity at top, subtle shoulders, narrower base, 5 lobes
        let profile = 1.0 + 0.16 * Math.sin((ny + 0.6) * 1.7);
        if (ny < 0) {
          profile *= 1.0 + ny * 0.22; // tapers to narrower base
        }
        // 5 subtle natural lobes around equator
        const lobes = 1.0 + 0.045 * Math.cos(5 * theta);

        if (radXZ > 0.001) {
          v.x = (v.x / radXZ) * radXZ * profile * lobes;
          v.z = (v.z / radXZ) * radXZ * profile * lobes;
        }

        // Top stem indentation
        if (ny > 0.5) {
          const t = (ny - 0.5) / 0.5;
          v.y -= t * t * 0.42 * r;
        }
        // Bottom calyx indentation
        if (ny < -0.65) {
          const t = (-ny - 0.65) / 0.35;
          v.y += t * t * 0.28 * r;
        }
        break;
      }

      case 'lemon': {
        // Elongated lemon with distinct pointed ends
        v.y *= 1.34;
        if (ny > 0.55) {
          const t = (ny - 0.55) / 0.45;
          v.y += t * 0.35 * r;
          const pinch = 1.0 - t * 0.62;
          v.x *= pinch;
          v.z *= pinch;
        } else if (ny < -0.55) {
          const t = (-ny - 0.55) / 0.45;
          v.y -= t * 0.35 * r;
          const pinch = 1.0 - t * 0.62;
          v.x *= pinch;
          v.z *= pinch;
        }
        // Subtle asymmetric citrus belly
        v.x += Math.sin((ny + 1) * Math.PI * 0.5) * 0.08 * r;
        break;
      }

      case 'lime': {
        // Zesty lime: rounder than lemon, small pointed blossom nipple
        v.y *= 1.15;
        if (ny < -0.7) {
          const t = (-ny - 0.7) / 0.3;
          v.y -= t * 0.25 * r;
          v.x *= 1.0 - t * 0.5;
          v.z *= 1.0 - t * 0.5;
        }
        break;
      }

      case 'pear': {
        // Classic teardrop bell pear: narrow neck at top, bulbous bell bottom
        let profile = 1.0;
        if (ny > 0.1) {
          // Narrow tapering neck
          profile = 1.0 - (ny - 0.1) * 0.55;
        } else {
          // Bulbous bottom
          profile = 1.0 + Math.sin(-ny * Math.PI * 0.8) * 0.22;
        }
        v.x *= profile;
        v.z *= profile;
        v.y *= 1.25;

        // Top stem dimple
        if (ny > 0.85) {
          const t = (ny - 0.85) / 0.15;
          v.y -= t * 0.15 * r;
        }
        break;
      }

      case 'peach': {
        // Round peach with iconic vertical cleft/furrow along one side
        const cleftAngle = Math.abs(theta);
        const cleftDepth = Math.exp(-cleftAngle * cleftAngle * 10) * 0.12 * r;
        v.x -= Math.cos(theta) * cleftDepth;
        v.z -= Math.sin(theta) * cleftDepth;
        // Top stem dimple
        if (ny > 0.6) {
          const t = (ny - 0.6) / 0.4;
          v.y -= t * t * 0.28 * r;
        }
        break;
      }

      case 'strawberry': {
        // Heart / conical strawberry shape: wide rounded shoulders tapering to rounded tip
        let profile = 1.0;
        if (ny > 0.2) {
          profile = 1.0 + Math.sin((ny - 0.2) * Math.PI * 0.5) * 0.15; // wide shoulders
        } else {
          profile = Math.max(0.12, 1.0 + ny * 0.78); // tapers to tip
        }
        v.x *= profile;
        v.z *= profile;
        v.y *= 1.2;

        // Top calyx base depression
        if (ny > 0.7) {
          const t = (ny - 0.7) / 0.3;
          v.y -= t * 0.22 * r;
        }
        break;
      }

      case 'mango': {
        // Asymmetric kidney / teardrop mango
        v.y *= 1.35;
        // Fuller cheek on one side (+X), flatter on -X
        const cheek = v.x > 0 ? 0.35 : -0.08;
        const swell = Math.sin((ny + 1) * Math.PI * 0.5);
        v.x += cheek * swell * r;
        // Curved beak/tip at bottom
        if (ny < -0.4) {
          const t = (-ny - 0.4) / 0.6;
          v.x += t * 0.25 * r;
          v.z *= 1.0 - t * 0.35;
        }
        // Slightly flatter thickness (Z)
        v.z *= 0.82;
        break;
      }

      case 'kiwi': {
        // Oval/egg kiwi: thicker in lower half
        v.y *= 1.28;
        const eggProfile = 1.0 - ny * 0.16;
        v.x *= eggProfile;
        v.z *= eggProfile;
        break;
      }

      case 'watermelon': {
        // Oblong watermelon
        v.y *= 1.34;
        break;
      }

      case 'orange': {
        // Slightly flattened citrus sphere with subtle organic variation
        v.y *= 0.95;
        v.x *= 1.02;
        v.z *= 1.02;
        break;
      }

      case 'coconut': {
        // Fibrous, slightly elongated sphere
        v.y *= 1.18;
        break;
      }

      case 'dragonfruit': {
        // Ellipsoid dragonfruit body
        v.y *= 1.32;
        break;
      }

      case 'pomegranate': {
        // Slightly faceted hexagonal sphere
        const facet = 1.0 + 0.035 * Math.cos(6 * theta);
        v.x *= facet;
        v.z *= facet;
        v.y *= 0.98;
        break;
      }

      case 'pineapple': {
        // Pineapple barrel body: rounded cylinder with tapered top and bottom
        v.y *= 1.45;
        const barrel = 1.0 - ny * ny * 0.22;
        v.x *= barrel * 0.95;
        v.z *= barrel * 0.95;
        break;
      }

      case 'banana':
      default:
        break;
    }

    // Natural organic asymmetry & gravitational settling (believable fruit mass & natural growth variation)
    if (type !== 'banana') {
      const organicPerturb = 1.0 + 0.012 * Math.sin(ny * 4.8 + theta * 3.0) + 0.006 * Math.cos(ny * 8.2 - theta * 2.0);
      v.x *= organicPerturb;
      v.z *= organicPerturb;
      // Gentle gravitational mass distribution: fruit naturally settles slightly in lower half
      if (ny < -0.1) {
        const settle = 1.0 - ny * 0.02 * (1.0 + ny);
        v.x *= settle;
        v.z *= settle;
      }
    }

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates the whole 3D Fruit model (used when fruit is flying in one piece)
 */
export function createWholeFruitMesh(type: FruitType): THREE.Group {
  const group = new THREE.Group();
  const cfg = FRUIT_CONFIGS[type];
  const skinTex = textureManager.getSkinTexture(type);
  const bumpTex = textureManager.getBumpTexture(type);
  const roughTex = textureManager.getRoughnessTexture(type);

  const skinMat = new THREE.MeshStandardMaterial({
    map: skinTex,
    bumpMap: bumpTex,
    bumpScale: BUMP_SCALES[type],
    roughnessMap: roughTex,
    roughness: BASE_ROUGHNESS[type],
    metalness: 0.0,
  });

  switch (type) {
    case 'banana': {
      // Natural 5-faceted curved banana
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.05, -0.65, 0),
        new THREE.Vector3(-0.4, 0.25, 0),
        new THREE.Vector3(0.45, 0.52, 0),
        new THREE.Vector3(1.1, -0.15, 0),
      ]);
      // 5 radial segments for authentic longitudinal banana facets!
      const geo = new THREE.TubeGeometry(curve, 22, 0.38, 5, false);
      const mesh = new THREE.Mesh(geo, skinMat);
      mesh.castShadow = true;
      group.add(mesh);

      // Dark stalk stem at top end
      const stemGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.45, 5);
      const stemMat = new THREE.MeshStandardMaterial({ color: '#4d5c18', roughness: 0.8 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(-1.15, -0.85, 0);
      stem.rotation.z = -0.55;
      group.add(stem);

      // Dark blossom tip at bottom end
      const tipGeo = new THREE.ConeGeometry(0.16, 0.28, 5);
      const tipMat = new THREE.MeshStandardMaterial({ color: '#2d241e', roughness: 0.9 });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(1.22, -0.28, 0);
      tip.rotation.z = -1.1;
      group.add(tip);
      break;
    }

    case 'pineapple': {
      const geo = shapeGeometry('pineapple', cfg.radius);
      const mesh = new THREE.Mesh(geo, skinMat);
      mesh.castShadow = true;
      group.add(mesh);

      // Multi-tier layered crown leaves
      const leafMat = new THREE.MeshStandardMaterial({
        color: '#15803d',
        roughness: 0.5,
        side: THREE.DoubleSide,
      });

      // Tier 1: Inner upright spires
      for (let i = 0; i < 6; i++) {
        const leafGeo = new THREE.ConeGeometry(0.24, 1.4, 4);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        const a = (i / 6) * Math.PI * 2;
        leaf.position.set(Math.cos(a) * 0.25, cfg.radius * 1.55, Math.sin(a) * 0.25);
        leaf.rotation.x = Math.sin(a) * 0.22;
        leaf.rotation.z = -Math.cos(a) * 0.22;
        group.add(leaf);
      }
      // Tier 2: Outer arching leaves
      for (let i = 0; i < 8; i++) {
        const leafGeo = new THREE.ConeGeometry(0.28, 1.25, 4);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        const a = (i / 8) * Math.PI * 2 + 0.3;
        leaf.position.set(Math.cos(a) * 0.42, cfg.radius * 1.4, Math.sin(a) * 0.42);
        leaf.rotation.x = Math.sin(a) * 0.55;
        leaf.rotation.z = -Math.cos(a) * 0.55;
        group.add(leaf);
      }
      break;
    }

    case 'apple': {
      const geo = shapeGeometry('apple', cfg.radius);
      const mesh = new THREE.Mesh(geo, skinMat);
      mesh.castShadow = true;
      group.add(mesh);

      // Real wooden curved stem seated inside the top pit
      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, cfg.radius * 0.72, 0),
        new THREE.Vector3(0.04, cfg.radius * 0.98, 0.02),
        new THREE.Vector3(0.14, cfg.radius * 1.22, 0.05),
      ]);
      const stemGeo = new THREE.TubeGeometry(stemCurve, 8, 0.045, 6, false);
      const stemMat = new THREE.MeshStandardMaterial({ color: '#452b1b', roughness: 0.9 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      group.add(stem);

      // Stylized glossy leaf attached to stem
      const leafGeo = new THREE.SphereGeometry(0.25, 8, 8);
      leafGeo.scale(1.2, 0.2, 0.6);
      const leafMat = new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.4 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(0.18, cfg.radius * 1.08, 0.06);
      leaf.rotation.set(0.2, 0.4, 0.6);
      group.add(leaf);
      break;
    }

    case 'pear': {
      const geo = shapeGeometry('pear', cfg.radius);
      const mesh = new THREE.Mesh(geo, skinMat);
      mesh.castShadow = true;
      group.add(mesh);

      // Wooden stem at top
      const stemGeo = new THREE.CylinderGeometry(0.035, 0.05, 0.42, 6);
      const stemMat = new THREE.MeshStandardMaterial({ color: '#452b1b', roughness: 0.9 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(0.04, cfg.radius * 1.25, 0);
      stem.rotation.z = 0.25;
      group.add(stem);
      break;
    }

    case 'strawberry': {
      const geo = shapeGeometry('strawberry', cfg.radius);
      const mesh = new THREE.Mesh(geo, skinMat);
      mesh.castShadow = true;
      group.add(mesh);

      // Green leafy calyx spreading over top
      const calyxMat = new THREE.MeshStandardMaterial({
        color: '#16a34a',
        roughness: 0.55,
        side: THREE.DoubleSide,
      });
      for (let i = 0; i < 6; i++) {
        const leafGeo = new THREE.PlaneGeometry(0.32, 0.62);
        const leaf = new THREE.Mesh(leafGeo, calyxMat);
        const a = (i / 6) * Math.PI * 2;
        leaf.position.set(Math.cos(a) * 0.22, cfg.radius * 0.98, Math.sin(a) * 0.22);
        leaf.rotation.y = a + Math.PI / 2;
        leaf.rotation.x = 0.45;
        group.add(leaf);
      }
      // Tiny stem
      const stemGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.28, 5);
      const stemMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = cfg.radius * 1.15;
      group.add(stem);
      break;
    }

    case 'dragonfruit': {
      const geo = shapeGeometry('dragonfruit', cfg.radius);
      const mesh = new THREE.Mesh(geo, skinMat);
      mesh.castShadow = true;
      group.add(mesh);

      // Green-tipped bract scales curling out of the magenta body
      const bractMat = new THREE.MeshStandardMaterial({
        color: '#84cc16',
        roughness: 0.45,
        side: THREE.DoubleSide,
      });
      for (let row = 0; row < 3; row++) {
        const count = 5 + row;
        const yPos = (row - 1) * 0.65 * cfg.radius;
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2 + row * 0.4;
          const bractGeo = new THREE.ConeGeometry(0.18, 0.6, 4);
          const bract = new THREE.Mesh(bractGeo, bractMat);
          bract.position.set(Math.cos(a) * (cfg.radius * 0.9), yPos, Math.sin(a) * (cfg.radius * 0.9));
          bract.rotation.z = -Math.cos(a) * 0.75;
          bract.rotation.x = Math.sin(a) * 0.75;
          group.add(bract);
        }
      }
      break;
    }

    case 'pomegranate': {
      const geo = shapeGeometry('pomegranate', cfg.radius);
      const mesh = new THREE.Mesh(geo, skinMat);
      mesh.castShadow = true;
      group.add(mesh);

      // Crown-shaped calyx (coronet of 5 pointed teeth) at top pole
      const crownMat = new THREE.MeshStandardMaterial({ color: '#991b1b', roughness: 0.6 });
      for (let i = 0; i < 5; i++) {
        const toothGeo = new THREE.ConeGeometry(0.12, 0.32, 4);
        const tooth = new THREE.Mesh(toothGeo, crownMat);
        const a = (i / 5) * Math.PI * 2;
        tooth.position.set(Math.cos(a) * 0.24, cfg.radius * 0.96, Math.sin(a) * 0.24);
        tooth.rotation.x = Math.sin(a) * 0.45;
        tooth.rotation.z = -Math.cos(a) * 0.45;
        group.add(tooth);
      }
      break;
    }

    case 'orange':
    case 'lemon':
    case 'lime':
    case 'peach':
    case 'kiwi':
    case 'mango':
    case 'coconut':
    case 'watermelon':
    default: {
      const geo = shapeGeometry(type, cfg.radius);
      const mesh = new THREE.Mesh(geo, skinMat);
      mesh.castShadow = true;
      group.add(mesh);

      // Small natural stem button on orange, lemon, lime
      if (type === 'orange' || type === 'lime') {
        const buttonGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 5);
        const buttonMat = new THREE.MeshStandardMaterial({ color: '#3f6212', roughness: 0.9 });
        const button = new THREE.Mesh(buttonGeo, buttonMat);
        button.position.y = cfg.radius * 0.95;
        group.add(button);
      }
      break;
    }
  }

  return group;
}

/**
 * Creates the two sliced 3D fruit halves (Half A and Half B)
 * Each half features the exterior skin on the curved dome,
 * and the photorealistic interior cross-section canvas texture on the flat cut face!
 */
export function createFruitHalves(type: FruitType): [THREE.Group, THREE.Group] {
  const cfg = FRUIT_CONFIGS[type];
  const r = cfg.radius;

  const skinTex = textureManager.getSkinTexture(type);
  const bumpTex = textureManager.getBumpTexture(type);
  const roughTex = textureManager.getRoughnessTexture(type);
  const intTex = textureManager.getInteriorTexture(type);
  const intBumpTex = textureManager.getInteriorBumpTexture(type);

  const skinMat = new THREE.MeshStandardMaterial({
    map: skinTex,
    bumpMap: bumpTex,
    bumpScale: BUMP_SCALES[type],
    roughnessMap: roughTex,
    roughness: BASE_ROUGHNESS[type],
    metalness: 0.0,
    side: THREE.FrontSide,
  });

  const intMat = new THREE.MeshStandardMaterial({
    map: intTex,
    bumpMap: intBumpTex,
    bumpScale: 0.022,
    roughness: 0.36,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  // Half A (Top Half)
  const groupA = new THREE.Group();
  const domeGeoA = shapeGeometry(type, r, true, 'top');
  const domeMeshA = new THREE.Mesh(domeGeoA, skinMat);
  domeMeshA.castShadow = true;
  groupA.add(domeMeshA);

  // Flat Cut Cap A
  const capGeoA = new THREE.CircleGeometry(r * 1.02, 32);
  const capMeshA = new THREE.Mesh(capGeoA, intMat);
  capMeshA.rotation.x = Math.PI / 2;
  groupA.add(capMeshA);

  // Half B (Bottom Half)
  const groupB = new THREE.Group();
  const domeGeoB = shapeGeometry(type, r, true, 'bottom');
  const domeMeshB = new THREE.Mesh(domeGeoB, skinMat);
  domeMeshB.castShadow = true;
  groupB.add(domeMeshB);

  // Flat Cut Cap B
  const capGeoB = new THREE.CircleGeometry(r * 1.02, 32);
  const capMeshB = new THREE.Mesh(capGeoB, intMat);
  capMeshB.rotation.x = -Math.PI / 2;
  groupB.add(capMeshB);

  return [groupA, groupB];
}

/**
 * Creates the Cast-Iron Bomb 3D model with glowing red hazard ring,
 * rope fuse, and animated spark particle nozzle.
 */
export function createBombMesh(): { group: THREE.Group; fusePoint: THREE.Vector3 } {
  const group = new THREE.Group();
  const bombRadius = 1.35;

  // Dark cast iron metallic body
  const skinTex = textureManager.getSkinTexture('bomb');
  const bumpTex = textureManager.getBumpTexture('bomb');
  const bodyMat = new THREE.MeshStandardMaterial({
    map: skinTex,
    bumpMap: bumpTex,
    bumpScale: 0.045,
    roughness: 0.35,
    metalness: 0.75,
  });
  const bodyGeo = new THREE.SphereGeometry(bombRadius, 24, 20);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Top metallic neck collar
  const collarGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.4, 16);
  const collarMat = new THREE.MeshStandardMaterial({
    color: '#374151',
    roughness: 0.3,
    metalness: 0.85,
  });
  const collar = new THREE.Mesh(collarGeo, collarMat);
  collar.position.y = bombRadius + 0.15;
  group.add(collar);

  // Twisted rope fuse
  const fuseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, bombRadius + 0.35, 0),
    new THREE.Vector3(0.15, bombRadius + 0.65, 0.05),
    new THREE.Vector3(0.28, bombRadius + 0.95, -0.05),
  ]);
  const fuseGeo = new THREE.TubeGeometry(fuseCurve, 10, 0.07, 6, false);
  const fuseMat = new THREE.MeshStandardMaterial({
    color: '#d97706',
    roughness: 0.95,
  });
  const fuseMesh = new THREE.Mesh(fuseGeo, fuseMat);
  group.add(fuseMesh);

  // Glowing Spark Flame Mesh at fuse tip
  const sparkGeo = new THREE.SphereGeometry(0.16, 8, 8);
  const sparkMat = new THREE.MeshBasicMaterial({
    color: '#ffedd5',
  });
  const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
  sparkMesh.position.set(0.28, bombRadius + 0.95, -0.05);
  sparkMesh.name = 'fuseSpark';
  group.add(sparkMesh);

  // Red Warning Pulsing Halo
  const haloGeo = new THREE.RingGeometry(bombRadius + 0.1, bombRadius + 0.25, 32);
  const haloMat = new THREE.MeshBasicMaterial({
    color: '#ef4444',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.45,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.name = 'bombHalo';
  group.add(halo);

  const fusePoint = new THREE.Vector3(0.28, bombRadius + 0.95, -0.05);
  return { group, fusePoint };
}
