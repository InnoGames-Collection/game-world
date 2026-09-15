/**
 * Hill Climb 3D - High-Precision 3D Rally Off-Road Buggy & SUV Model
 * 
 * 3D Mesh Hierarchy:
 * - Root Vehicle Group
 *   - Chassis & Bodywork:
 *     - Lower chassis tub & skid plate
 *     - Sculpted rally body panels (metallic royal blue + lime accents)
 *     - Hood air scoop & roof ventilation intake
 *     - Tinted windshield & side windows
 *     - Heavy-duty roll cage structure
 *     - Cockpit interior (bucket seat, steering wheel, dashboard)
 *     - Heavy-duty front bull-bar bumper with skid plate
 *     - Rear rally spoiler & dual chrome exhaust pipes
 *     - High-intensity LED headlights & red taillights
 *     - Real-time contact shadow plane
 *   - 4 Dynamic Suspension Struts (coiled springs + damper shafts)
 *   - 4 Independent 3D Wheels (knobby tires, tread lugs, alloy rims, center caps)
 */

import * as THREE from 'three';

export const CHASSIS_LENGTH = 3.6;
export const CHASSIS_WIDTH = 2.1;
export const CHASSIS_HEIGHT = 1.4;
export const WHEEL_RADIUS = 0.68;
export const WHEEL_WIDTH = 0.48;
export const WHEEL_BASE = 2.5; // Distance between front & rear axles
export const TRACK_WIDTH = 2.2; // Distance between left & right wheels

export interface VehicleMeshRig {
  rootGroup: THREE.Group;
  chassisGroup: THREE.Group;
  wheels: {
    rearLeft: THREE.Group;
    rearRight: THREE.Group;
    frontLeft: THREE.Group;
    frontRight: THREE.Group;
  };
  suspensionCoils: {
    rearLeft: THREE.Mesh;
    rearRight: THREE.Mesh;
    frontLeft: THREE.Mesh;
    frontRight: THREE.Mesh;
  };
  suspensionShafts: {
    rearLeft: THREE.Mesh;
    rearRight: THREE.Mesh;
    frontLeft: THREE.Mesh;
    frontRight: THREE.Mesh;
  };
  headlights: THREE.Mesh[];
  exhaustPipes: THREE.Mesh[];
  shadowMesh: THREE.Mesh;
}

/**
 * Creates the high-detail 3D Rally Off-Road Vehicle Rig
 */
export function createVehicle3D(): VehicleMeshRig {
  const rootGroup = new THREE.Group();
  const chassisGroup = new THREE.Group();
  rootGroup.add(chassisGroup);

  // High-Quality Metallic & Matte Automotive Materials
  const metallicBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1688C9, // TelePlus Royal Sky Blue
    metalness: 0.8,
    roughness: 0.2,
  });

  const vibrantLimeMat = new THREE.MeshStandardMaterial({
    color: 0x8BCB3D, // TelePlus Vibrant Lime
    metalness: 0.65,
    roughness: 0.25,
  });

  const carbonChassisMat = new THREE.MeshStandardMaterial({
    color: 0x1c2028,
    metalness: 0.5,
    roughness: 0.7,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.95,
    roughness: 0.12,
  });

  const rollCageMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.25,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  });

  const tireRubberMat = new THREE.MeshStandardMaterial({
    color: 0x14181f,
    roughness: 0.92,
    metalness: 0.08,
  });

  const springCoilMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red Racing Springs
    metalness: 0.75,
    roughness: 0.25,
  });

  const headlightEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1.2,
  });

  const taillightEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0xff2222,
    emissive: 0xff1111,
    emissiveIntensity: 1.0,
  });

  // ==========================================
  // 1. SCULPTED CHASSIS & BODYWORK
  // ==========================================
  // Lower Tub Chassis
  const lowerTubGeo = new THREE.BoxGeometry(CHASSIS_LENGTH, 0.42, CHASSIS_WIDTH - 0.35);
  const lowerTubMesh = new THREE.Mesh(lowerTubGeo, carbonChassisMat);
  lowerTubMesh.position.set(0, 0.22, 0);
  lowerTubMesh.castShadow = true;
  chassisGroup.add(lowerTubMesh);

  // Main Slanted Hood
  const hoodGeo = new THREE.BoxGeometry(1.4, 0.38, CHASSIS_WIDTH - 0.45);
  const hoodMesh = new THREE.Mesh(hoodGeo, metallicBlueMat);
  hoodMesh.position.set(1.0, 0.52, 0);
  hoodMesh.rotation.z = -0.1;
  hoodMesh.castShadow = true;
  chassisGroup.add(hoodMesh);

  // Hood Power Bulge / Air Scoop
  const scoopGeo = new THREE.BoxGeometry(0.7, 0.12, 0.65);
  const scoopMesh = new THREE.Mesh(scoopGeo, vibrantLimeMat);
  scoopMesh.position.set(1.0, 0.74, 0);
  scoopMesh.rotation.z = -0.1;
  scoopMesh.castShadow = true;
  chassisGroup.add(scoopMesh);

  // Rear Engine Deck
  const rearDeckGeo = new THREE.BoxGeometry(1.1, 0.45, CHASSIS_WIDTH - 0.45);
  const rearDeckMesh = new THREE.Mesh(rearDeckGeo, metallicBlueMat);
  rearDeckMesh.position.set(-1.15, 0.58, 0);
  rearDeckMesh.castShadow = true;
  chassisGroup.add(rearDeckMesh);

  // Rear Rally Wing Spoiler
  const wingGeo = new THREE.BoxGeometry(0.5, 0.08, CHASSIS_WIDTH - 0.1);
  const wingMesh = new THREE.Mesh(wingGeo, vibrantLimeMat);
  wingMesh.position.set(-1.6, 1.25, 0);
  wingMesh.rotation.z = 0.15;
  wingMesh.castShadow = true;
  chassisGroup.add(wingMesh);

  // Spoiler Struts
  const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6);
  [-0.6, 0.6].forEach((zOffset) => {
    const s = new THREE.Mesh(strutGeo, rollCageMat);
    s.position.set(-1.55, 1.0, zOffset);
    s.rotation.z = -0.2;
    chassisGroup.add(s);
  });

  // Front Bull-Bar Bumper & Skid Plate
  const bumperBarGeo = new THREE.CylinderGeometry(0.07, 0.07, CHASSIS_WIDTH - 0.2, 8);
  bumperBarGeo.rotateX(Math.PI / 2);
  const bumperBar = new THREE.Mesh(bumperBarGeo, chromeMat);
  bumperBar.position.set(CHASSIS_LENGTH / 2 + 0.18, 0.32, 0);
  bumperBar.castShadow = true;
  chassisGroup.add(bumperBar);

  const skidPlateGeo = new THREE.BoxGeometry(0.6, 0.08, CHASSIS_WIDTH - 0.6);
  const skidPlate = new THREE.Mesh(skidPlateGeo, chromeMat);
  skidPlate.position.set(CHASSIS_LENGTH / 2 + 0.05, 0.15, 0);
  skidPlate.rotation.z = 0.5;
  chassisGroup.add(skidPlate);

  // ==========================================
  // 2. CABIN, ROLL CAGE & WINDSHIELD
  // ==========================================
  // Slanted Windshield
  const windshieldGeo = new THREE.BoxGeometry(0.8, 0.65, CHASSIS_WIDTH - 0.55);
  const windshield = new THREE.Mesh(windshieldGeo, glassMat);
  windshield.position.set(0.18, 0.95, 0);
  windshield.rotation.z = -0.55;
  windshield.castShadow = true;
  chassisGroup.add(windshield);

  // Cabin Roof
  const roofGeo = new THREE.BoxGeometry(1.0, 0.1, CHASSIS_WIDTH - 0.55);
  const roofMesh = new THREE.Mesh(roofGeo, metallicBlueMat);
  roofMesh.position.set(-0.35, 1.25, 0);
  roofMesh.castShadow = true;
  chassisGroup.add(roofMesh);

  // Roof Air Intake
  const roofIntakeGeo = new THREE.BoxGeometry(0.45, 0.12, 0.5);
  const roofIntake = new THREE.Mesh(roofIntakeGeo, vibrantLimeMat);
  roofIntake.position.set(-0.25, 1.34, 0);
  chassisGroup.add(roofIntake);

  // Tubular Roll Cage Structure
  const cageBarGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.1, 6);
  [-0.75, 0.75].forEach((zOffset) => {
    // Front A-Pillar Bar
    const aPillar = new THREE.Mesh(cageBarGeo, rollCageMat);
    aPillar.position.set(0.15, 0.9, zOffset);
    aPillar.rotation.z = -0.55;
    chassisGroup.add(aPillar);

    // Rear B-Pillar Bar
    const bPillar = new THREE.Mesh(cageBarGeo, rollCageMat);
    bPillar.position.set(-0.85, 0.9, zOffset);
    bPillar.rotation.z = 0.35;
    chassisGroup.add(bPillar);
  });

  // Cockpit Bucket Seat & Steering Wheel
  const seatGeo = new THREE.BoxGeometry(0.5, 0.65, 0.5);
  const seatMesh = new THREE.Mesh(seatGeo, rollCageMat);
  seatMesh.position.set(-0.25, 0.65, 0);
  chassisGroup.add(seatMesh);

  const wheelGeo = new THREE.TorusGeometry(0.14, 0.03, 6, 12);
  const steeringWheel = new THREE.Mesh(wheelGeo, vibrantLimeMat);
  steeringWheel.position.set(0.2, 0.82, 0);
  steeringWheel.rotation.y = Math.PI / 2;
  steeringWheel.rotation.z = -0.3;
  chassisGroup.add(steeringWheel);

  // ==========================================
  // 3. LIGHTS & DUAL EXHAUST
  // ==========================================
  const headlights: THREE.Mesh[] = [];
  const headlightGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
  headlightGeo.rotateZ(Math.PI / 2);

  [-0.65, 0.65].forEach((zOffset) => {
    const hl = new THREE.Mesh(headlightGeo, headlightEmissiveMat);
    hl.position.set(CHASSIS_LENGTH / 2 - 0.05, 0.48, zOffset);
    chassisGroup.add(hl);
    headlights.push(hl);
  });

  // Rear LED Taillights
  const taillightGeo = new THREE.BoxGeometry(0.08, 0.12, 0.3);
  [-0.7, 0.7].forEach((zOffset) => {
    const tl = new THREE.Mesh(taillightGeo, taillightEmissiveMat);
    tl.position.set(-CHASSIS_LENGTH / 2 + 0.05, 0.55, zOffset);
    chassisGroup.add(tl);
  });

  // Dual Chrome Exhaust Pipes
  const exhaustPipes: THREE.Mesh[] = [];
  const exhaustGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8);
  exhaustGeo.rotateZ(Math.PI / 2);

  [-0.3, 0.3].forEach((zOffset) => {
    const pipe = new THREE.Mesh(exhaustGeo, chromeMat);
    pipe.position.set(-CHASSIS_LENGTH / 2 - 0.12, 0.25, zOffset);
    chassisGroup.add(pipe);
    exhaustPipes.push(pipe);
  });

  // ==========================================
  // 4. SUSPENSION STRUTS (4 DYNAMIC COILS)
  // ==========================================
  const suspensionCoils = {
    rearLeft: createSpringMesh(springCoilMat),
    rearRight: createSpringMesh(springCoilMat),
    frontLeft: createSpringMesh(springCoilMat),
    frontRight: createSpringMesh(springCoilMat),
  };

  const suspensionShafts = {
    rearLeft: createShaftMesh(chromeMat),
    rearRight: createShaftMesh(chromeMat),
    frontLeft: createShaftMesh(chromeMat),
    frontRight: createShaftMesh(chromeMat),
  };

  const halfWB = WHEEL_BASE / 2;
  const halfTW = TRACK_WIDTH / 2;

  // Mount suspension to chassis
  suspensionCoils.rearLeft.position.set(-halfWB, -0.15, -halfTW);
  suspensionCoils.rearRight.position.set(-halfWB, -0.15, halfTW);
  suspensionCoils.frontLeft.position.set(halfWB, -0.15, -halfTW);
  suspensionCoils.frontRight.position.set(halfWB, -0.15, halfTW);

  chassisGroup.add(suspensionCoils.rearLeft);
  chassisGroup.add(suspensionCoils.rearRight);
  chassisGroup.add(suspensionCoils.frontLeft);
  chassisGroup.add(suspensionCoils.frontRight);

  suspensionShafts.rearLeft.position.set(-halfWB, -0.15, -halfTW);
  suspensionShafts.rearRight.position.set(-halfWB, -0.15, halfTW);
  suspensionShafts.frontLeft.position.set(halfWB, -0.15, -halfTW);
  suspensionShafts.frontRight.position.set(halfWB, -0.15, halfTW);

  chassisGroup.add(suspensionShafts.rearLeft);
  chassisGroup.add(suspensionShafts.rearRight);
  chassisGroup.add(suspensionShafts.frontLeft);
  chassisGroup.add(suspensionShafts.frontRight);

  // ==========================================
  // 5. 4 INDEPENDENT OFF-ROAD WHEELS
  // ==========================================
  const wheels = {
    rearLeft: createOffRoadWheel(tireRubberMat, chromeMat, vibrantLimeMat),
    rearRight: createOffRoadWheel(tireRubberMat, chromeMat, vibrantLimeMat),
    frontLeft: createOffRoadWheel(tireRubberMat, chromeMat, vibrantLimeMat),
    frontRight: createOffRoadWheel(tireRubberMat, chromeMat, vibrantLimeMat),
  };

  // Attach wheel groups directly to root so they stay physically positioned
  rootGroup.add(wheels.rearLeft);
  rootGroup.add(wheels.rearRight);
  rootGroup.add(wheels.frontLeft);
  rootGroup.add(wheels.frontRight);

  // ==========================================
  // 6. REALISTIC SOFT GROUND CONTACT SHADOW
  // ==========================================
  const shadowGeo = new THREE.PlaneGeometry(CHASSIS_LENGTH + 0.8, TRACK_WIDTH + 0.6);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  if (sCtx) {
    const sGrad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
    sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    sGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);
  }
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.05;
  rootGroup.add(shadowMesh);

  return {
    rootGroup,
    chassisGroup,
    wheels,
    suspensionCoils,
    suspensionShafts,
    headlights,
    exhaustPipes,
    shadowMesh,
  };
}

/**
 * Creates 3D Knobby Off-Road Wheel with rim, center cap, and tire lugs
 */
function createOffRoadWheel(
  tireMat: THREE.Material,
  rimMat: THREE.Material,
  accentMat: THREE.Material
): THREE.Group {
  const wheelGroup = new THREE.Group();

  // Main Tire Cylinder (oriented along Z-axis)
  const tireGeo = new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 16);
  tireGeo.rotateX(Math.PI / 2);
  const tireMesh = new THREE.Mesh(tireGeo, tireMat);
  tireMesh.castShadow = true;
  wheelGroup.add(tireMesh);

  // Knobby Tire Tread Lugs
  const lugGeo = new THREE.BoxGeometry(0.18, 0.1, WHEEL_WIDTH - 0.04);
  const numLugs = 10;
  for (let i = 0; i < numLugs; i++) {
    const angle = (i / numLugs) * Math.PI * 2;
    const lug = new THREE.Mesh(lugGeo, tireMat);
    lug.position.set(
      Math.cos(angle) * (WHEEL_RADIUS + 0.02),
      Math.sin(angle) * (WHEEL_RADIUS + 0.02),
      0
    );
    lug.rotation.z = angle;
    lug.castShadow = true;
    wheelGroup.add(lug);
  }

  // Alloy Rim
  const rimGeo = new THREE.CylinderGeometry(0.42, 0.42, WHEEL_WIDTH + 0.02, 12);
  rimGeo.rotateX(Math.PI / 2);
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.castShadow = true;
  wheelGroup.add(rimMesh);

  // Center Hub Cap (Vibrant Lime Accent)
  const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, WHEEL_WIDTH + 0.06, 8);
  hubGeo.rotateX(Math.PI / 2);
  const hubMesh = new THREE.Mesh(hubGeo, accentMat);
  wheelGroup.add(hubMesh);

  return wheelGroup;
}

/**
 * Creates 3D Suspension Spring Coil Mesh
 */
function createSpringMesh(mat: THREE.Material): THREE.Mesh {
  const springGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 8);
  const springMesh = new THREE.Mesh(springGeo, mat);
  springMesh.castShadow = true;
  return springMesh;
}

/**
 * Creates 3D Damper Shaft Mesh
 */
function createShaftMesh(mat: THREE.Material): THREE.Mesh {
  const shaftGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.85, 6);
  const shaftMesh = new THREE.Mesh(shaftGeo, mat);
  return shaftMesh;
}

/**
 * Updates 3D Vehicle Transformations, Wheel Rotation, and Dynamic Suspension Travel
 */
export function updateVehicleMeshTransform(
  rig: VehicleMeshRig,
  x: number,
  y: number,
  z: number,
  pitch: number,
  roll: number,
  yaw: number,
  wheelRotation: number,
  rearComp: number,
  frontComp: number,
  flComp?: number,
  frComp?: number,
  rlComp?: number,
  rrComp?: number
) {
  // 1. Position and Orient Root Group
  rig.rootGroup.position.set(x, y, z);
  rig.rootGroup.rotation.set(roll, yaw, pitch);

  // 4-Wheel individual compressions with fallbacks
  const cFL = flComp !== undefined ? flComp : frontComp;
  const cFR = frComp !== undefined ? frComp : frontComp;
  const cRL = rlComp !== undefined ? rlComp : rearComp;
  const cRR = rrComp !== undefined ? rrComp : rearComp;

  // 2. Adjust Suspension Travel Scale on Individual Coils
  rig.suspensionCoils.rearLeft.scale.y = Math.max(0.30, 1.0 - cRL * 0.55);
  rig.suspensionCoils.rearRight.scale.y = Math.max(0.30, 1.0 - cRR * 0.55);
  rig.suspensionCoils.frontLeft.scale.y = Math.max(0.30, 1.0 - cFL * 0.55);
  rig.suspensionCoils.frontRight.scale.y = Math.max(0.30, 1.0 - cFR * 0.55);

  // 3. Update Wheel Physical Offsets Relative to Chassis
  const halfWB = WHEEL_BASE / 2;
  const halfTW = TRACK_WIDTH / 2;
  const restY = -0.55;

  const rlY = restY + cRL * 0.35;
  const rrY = restY + cRR * 0.35;
  const flY = restY + cFL * 0.35;
  const frY = restY + cFR * 0.35;

  // Rear Wheels
  rig.wheels.rearLeft.position.set(-halfWB, rlY, -halfTW);
  rig.wheels.rearRight.position.set(-halfWB, rrY, halfTW);

  // Front Wheels
  rig.wheels.frontLeft.position.set(halfWB, flY, -halfTW);
  rig.wheels.frontRight.position.set(halfWB, frY, halfTW);

  // 4. Spin Wheels around Axle (Z-axis rotation)
  rig.wheels.rearLeft.rotation.z = wheelRotation;
  rig.wheels.rearRight.rotation.z = wheelRotation;
  rig.wheels.frontLeft.rotation.z = wheelRotation;
  rig.wheels.frontRight.rotation.z = wheelRotation;

  // 5. Shadow contact follows ground elevation beneath vehicle
  rig.shadowMesh.position.y = -0.58;
}
