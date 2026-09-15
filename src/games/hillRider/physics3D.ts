/**
 * Hill Climb 3D - Deterministic 3D Vehicle Physics Engine & Tournament Scoring
 * 
 * True Four-Wheel Vehicle Physics Engine:
 * - 4 independent suspension raycast contact wheels: Front-Left, Front-Right, Rear-Left, Rear-Right
 * - Full 3D terrain elevation queries for all 4 wheels with track width and wheelbase offsets
 * - Natural pitch equilibrium with opposing suspension torque balance across front and rear axles
 * - Prevents axle-only pivoting, wheel lifting, and floating
 * - Zero asphalt penetration: hard surface collision guarantees wheels ride ON the road, never below
 * - Progressive 4WD traction on all grounded wheels for smooth hill climbing and descents
 * - Natural airborne ballistic physics with controllable mid-air stunt pitch
 * - Deterministic tournament scoring adhering strictly to the 5-component formula (Max 400 PTS)
 */

import { VehiclePhysics3D, Collectible3D, CrashReason } from './types';
import { getTerrainElevation, getTerrainSlopeAt, ROAD_HALF_WIDTH } from './terrain3D';
import { WHEEL_BASE, WHEEL_RADIUS, TRACK_WIDTH } from './vehicle3D';

export const GRAVITY = 27.0; // Snappy realistic gravity (m/s^2)
export const MASS = 1.25;
export const ENGINE_MAX_TORQUE = 38.0;
export const BRAKE_FORCE = 44.0;
export const MAX_FORWARD_VELOCITY = 34.0; // ~122 km/h max speed
export const MAX_REVERSE_VELOCITY = -8.0;
export const AIR_PITCH_TORQUE = 4.2;
export const SUSPENSION_REST_OFFSET = 0.55; // local mount Y = -0.55
export const SUSPENSION_MAX_TRAVEL = 0.35;
export const SUSPENSION_STIFFNESS = 52.0; // Per-wheel stiffness (4 x 52 = 208 total)
export const SUSPENSION_DAMPING = 9.2;    // Per-wheel damping
export const ANGULAR_INERTIA = 1.55;

/**
 * Initializes physics state at the starting line on flat asphalt.
 * All 4 wheels are placed precisely on the asphalt surface in stable equilibrium.
 */
export function createInitialPhysicsState(): VehiclePhysics3D {
  const startX = 8.0;
  const startZ = 0.0; // Centered on asphalt corridor
  const groundY = getTerrainElevation(startX, startZ);
  const { slopeAngle } = getTerrainSlopeAt(startX, startZ);

  // In local vehicle space, mount is at y = -0.55, tire radius is 0.68.
  // At equilibrium resting compression (~0.14 of 0.35 travel = ~0.05m),
  // chassis is at groundY + 0.55 + 0.68 - 0.05 = groundY + 1.18.
  const initialY = groundY + 1.18;

  return {
    x: startX,
    y: initialY,
    z: startZ,
    vx: 0,
    vy: 0,
    vz: 0,
    pitch: slopeAngle,
    roll: 0,
    yaw: 0,
    angularVelPitch: 0,
    angularVelRoll: 0,
    angularVelYaw: 0,
    wheelRotation: 0,
    frontLeftGrounded: true,
    frontRightGrounded: true,
    rearLeftGrounded: true,
    rearRightGrounded: true,
    frontLeftComp: 0.14,
    frontRightComp: 0.14,
    rearLeftComp: 0.14,
    rearRightComp: 0.14,
    rearSuspensionComp: 0.14,
    frontSuspensionComp: 0.14,
    isGrounded: true,
    rearGrounded: true,
    frontGrounded: true,
    isAirborne: false,
    isOffRoad: false,
    fuel: 100,
    distance: 0,
    coinsCollected: 0,
    airTimeMs: 0,
    consecutiveAirTime: 0,
    isFlipped: false,
    flipTimer: 0,
    isCrashed: false,
    crashReason: null,

    // Deterministic scoring tracker
    driveTimeSeconds: 0,
    cleanTimeSeconds: 0,
    stableDistanceMeters: 0,
    smoothSpeedSeconds: 0,
    excessiveBrakeEvents: 0,
    successfulLandings: 0,
    cleanHillCrests: 0,
    hardLandingPenalties: 0,
    finalScore: 0,
    scoreBreakdown: {
      distanceScore: 0,
      speedControlScore: 0,
      stabilityScore: 0,
      landingScore: 0,
      survivalScore: 0,
    },
  };
}

export interface PhysicsControls {
  gas: boolean;
  brake: boolean;
}

export interface PhysicsStepResult {
  state: VehiclePhysics3D;
  collectedItems: Collectible3D[];
  landedThisFrame: boolean;
  impactSpeed: number;
}

/**
 * Step vehicle physics simulation by delta time (dt) with 4-wheel independent dynamics
 */
export function stepVehiclePhysics(
  state: VehiclePhysics3D,
  controls: PhysicsControls,
  collectibles: Collectible3D[],
  dt: number
): PhysicsStepResult {
  if (state.isCrashed) {
    // Freeze vehicle completely in crash state
    state.vx = 0;
    state.vy = 0;
    state.angularVelPitch = 0;
    return { state, collectedItems: [], landedThisFrame: false, impactSpeed: 0 };
  }

  // Bound dt for numerical stability
  const stepDt = Math.min(0.035, Math.max(0.001, dt));

  const halfWB = WHEEL_BASE / 2; // 1.25m
  const halfTW = TRACK_WIDTH / 2; // 1.10m
  const restY = -SUSPENSION_REST_OFFSET; // -0.55m

  // 1. Compute World Coordinates for all 4 Wheel Mount Anchors
  const cosP = Math.cos(state.pitch);
  const sinP = Math.sin(state.pitch);

  // Local-to-world 2D rotation for wheel anchors
  // Front Mount: local (+halfWB, restY) -> world (x + halfWB*cosP - restY*sinP, y + halfWB*sinP + restY*cosP)
  const flX = state.x + halfWB * cosP - restY * sinP;
  const flMountY = state.y + halfWB * sinP + restY * cosP;
  const flZ = -halfTW;

  const frX = flX;
  const frMountY = flMountY;
  const frZ = halfTW;

  // Rear Mount: local (-halfWB, restY) -> world (x - halfWB*cosP - restY*sinP, y - halfWB*sinP + restY*cosP)
  const rlX = state.x - halfWB * cosP - restY * sinP;
  const rlMountY = state.y - halfWB * sinP + restY * cosP;
  const rlZ = -halfTW;

  const rrX = rlX;
  const rrMountY = rlMountY;
  const rrZ = halfTW;

  // 2. Query Authoritative Terrain Elevation at each wheel position
  const flGroundY = getTerrainElevation(flX, flZ);
  const frGroundY = getTerrainElevation(frX, frZ);
  const rlGroundY = getTerrainElevation(rlX, rlZ);
  const rrGroundY = getTerrainElevation(rrX, rrZ);
  const centerGroundY = getTerrainElevation(state.x, 0);

  // 3. Compute Suspension Compression and Contact Penetration for all 4 Wheels
  // Wheel uncompressed bottom in world space = mountY - WHEEL_RADIUS
  const flUncompBottom = flMountY - WHEEL_RADIUS;
  const frUncompBottom = frMountY - WHEEL_RADIUS;
  const rlUncompBottom = rlMountY - WHEEL_RADIUS;
  const rrUncompBottom = rrMountY - WHEEL_RADIUS;

  const flDepth = flGroundY - flUncompBottom;
  const frDepth = frGroundY - frUncompBottom;
  const rlDepth = rlGroundY - rlUncompBottom;
  const rrDepth = rrGroundY - rrUncompBottom;

  const flGrounded = flDepth > -0.01;
  const frGrounded = frDepth > -0.01;
  const rlGrounded = rlDepth > -0.01;
  const rrGrounded = rrDepth > -0.01;

  const flComp = Math.min(1.0, Math.max(0, flDepth / SUSPENSION_MAX_TRAVEL));
  const frComp = Math.min(1.0, Math.max(0, frDepth / SUSPENSION_MAX_TRAVEL));
  const rlComp = Math.min(1.0, Math.max(0, rlDepth / SUSPENSION_MAX_TRAVEL));
  const rrComp = Math.min(1.0, Math.max(0, rrDepth / SUSPENSION_MAX_TRAVEL));

  const frontGrounded = flGrounded || frGrounded;
  const rearGrounded = rlGrounded || rrGrounded;
  const isGrounded = frontGrounded || rearGrounded;
  const groundedWheelsCount = (flGrounded ? 1 : 0) + (frGrounded ? 1 : 0) + (rlGrounded ? 1 : 0) + (rrGrounded ? 1 : 0);

  const wasGroundedBefore = state.isGrounded;
  let landedThisFrame = false;
  let impactSpeed = 0;
  if (!wasGroundedBefore && isGrounded) {
    landedThisFrame = true;
    impactSpeed = Math.abs(state.vy);
    state.consecutiveAirTime = 0;
  }

  // Calculate deviation from upright relative to road slope
  const { slopeAngle } = getTerrainSlopeAt(state.x, 0);
  let pitchDiff = (state.pitch - slopeAngle) % (Math.PI * 2);
  while (pitchDiff < -Math.PI) pitchDiff += Math.PI * 2;
  while (pitchDiff > Math.PI) pitchDiff -= Math.PI * 2;
  const angleFromUpright = Math.abs(pitchDiff);
  const isUpsideDown = angleFromUpright > 1.45; // > ~83 degrees from road normal

  // Immediate crash if landed on roof / upside down
  if (landedThisFrame && isUpsideDown) {
    state.isCrashed = true;
    state.isFlipped = true;
    state.crashReason = 'flipped';
    state.vx = 0;
    state.vy = 0;
    state.angularVelPitch = 0;
    updateTournamentScore(state);
    return { state, collectedItems: [], landedThisFrame: true, impactSpeed };
  }

  // 4. Calculate 4-Wheel Independent Spring & Damper Forces
  let totalForceY = -GRAVITY * MASS;
  let totalForceX = 0;
  let totalTorquePitch = 0;

  const calculateWheelForce = (
    grounded: boolean,
    depth: number,
    leverArmX: number
  ): number => {
    if (!grounded || depth <= 0) return 0;
    const springF = depth * SUSPENSION_STIFFNESS;
    // Hub vertical velocity = body vy + angularVelPitch * leverArmX
    const hubVy = state.vy + state.angularVelPitch * leverArmX;
    const damperF = -hubVy * SUSPENSION_DAMPING;
    return Math.max(0, springF + damperF);
  };

  const flForce = calculateWheelForce(flGrounded, flDepth, halfWB * cosP);
  const frForce = calculateWheelForce(frGrounded, frDepth, halfWB * cosP);
  const rlForce = calculateWheelForce(rlGrounded, rlDepth, -halfWB * cosP);
  const rrForce = calculateWheelForce(rrGrounded, rrDepth, -halfWB * cosP);

  const frontNormalForce = flForce + frForce;
  const rearNormalForce = rlForce + rrForce;
  const totalSuspensionForceY = frontNormalForce + rearNormalForce;

  // Add vertical suspension force
  totalForceY += totalSuspensionForceY;

  // Torque on Chassis from Front and Rear Axle Suspensions:
  // - Upward force at Front (+halfWB) generates positive torque -> pitches nose UP
  // - Upward force at Rear (-halfWB) generates negative torque -> pitches nose DOWN
  // This self-balances automatically to align the car pitch with the road slope!
  const frontTorque = frontNormalForce * (halfWB * cosP);
  const rearTorque = -rearNormalForce * (halfWB * cosP);
  totalTorquePitch += frontTorque + rearTorque;

  // 5. Angular Pitch Damping (Suspension + Aerodynamic)
  if (isGrounded) {
    // Solid grounded rotational damping to prevent bounce/oscillation
    totalTorquePitch -= state.angularVelPitch * (14.0 + groundedWheelsCount * 4.0);
  }

  // 6. Ground Traction, Drive Torque, and Progressive Braking
  if (isGrounded && !isUpsideDown) {
    state.isAirborne = false;
    state.consecutiveAirTime = 0;

    // Traction weight ratio based on grounded wheels
    const tractionRatio = Math.min(1.0, groundedWheelsCount / 4.0);

    // GAS (Throttle) - Accelerate with strong climbing torque
    if (controls.gas && state.fuel > 0) {
      if (state.vx < MAX_FORWARD_VELOCITY) {
        const speedRatio = Math.max(0, state.vx / MAX_FORWARD_VELOCITY);
        const torqueMult = 1.0 - Math.pow(speedRatio, 1.4) * 0.40;
        const driveForce = ENGINE_MAX_TORQUE * torqueMult * tractionRatio;

        totalForceX += driveForce * Math.cos(slopeAngle);
        totalForceY += driveForce * Math.sin(slopeAngle);

        // Realistic rear-wheel drive reaction torque (lifts nose under acceleration)
        totalTorquePitch += driveForce * 0.12;
      }
      state.fuel = Math.max(0, state.fuel - stepDt * 2.2);
    } else if (controls.brake) {
      // BRAKE - Progressive hydraulic braking
      if (state.vx > 0.2) {
        const progressiveBrake = Math.min(BRAKE_FORCE, state.vx * 22.0 + 10.0) * tractionRatio;
        totalForceX -= progressiveBrake * Math.cos(slopeAngle);
        totalForceY -= progressiveBrake * Math.sin(slopeAngle);

        // Realistic front weight transfer under heavy braking (dips nose)
        totalTorquePitch -= progressiveBrake * 0.14;
      } else if (state.vx > MAX_REVERSE_VELOCITY && state.fuel > 0) {
        // Reverse gear
        totalForceX -= ENGINE_MAX_TORQUE * 0.40 * tractionRatio * Math.cos(slopeAngle);
        state.fuel = Math.max(0, state.fuel - stepDt * 1.5);
      }
    } else {
      // Smooth natural rolling resistance on throttle release
      totalForceX -= state.vx * 2.4;
    }

    // Baseline idle fuel consumption while rolling
    if (Math.abs(state.vx) > 0.1) {
      state.fuel = Math.max(0, state.fuel - stepDt * 0.4);
    }
  } else if (isUpsideDown) {
    // Inverted on ground: Cannot drive forward
    totalForceX -= state.vx * 4.0;
  } else {
    // 7. AIRBORNE MODE: Ballistic trajectory & mid-air stunt pitch control
    state.isAirborne = true;
    state.airTimeMs += stepDt * 1000;
    state.consecutiveAirTime += stepDt;

    if (controls.gas) {
      // Holding GAS in air rotates wheels forward -> pitches NOSE UP (counter-clockwise tilt)
      totalTorquePitch += AIR_PITCH_TORQUE;
    }
    if (controls.brake) {
      // Holding BRAKE in air halts wheel spin -> pitches NOSE DOWN (clockwise tilt for landing slope match)
      totalTorquePitch -= AIR_PITCH_TORQUE;
    }

    // Smooth aerodynamic pitch damping
    totalTorquePitch -= state.angularVelPitch * 2.2;

    if (state.consecutiveAirTime > 4.5) {
      state.isCrashed = true;
      state.crashReason = 'off_road';
    }
  }

  // 8. Integrate Linear Velocities and Coordinates
  state.vx += (totalForceX / MASS) * stepDt;
  state.vy += (totalForceY / MASS) * stepDt;

  state.x += state.vx * stepDt;
  state.y += state.vy * stepDt;

  // 9. Integrate Angular Velocity and Pitch
  state.angularVelPitch += (totalTorquePitch / ANGULAR_INERTIA) * stepDt;
  state.angularVelPitch = Math.max(-5.5, Math.min(5.5, state.angularVelPitch));
  state.pitch += state.angularVelPitch * stepDt;

  // Keep roll and yaw strictly stabilized on the asphalt road center corridor
  state.roll *= 0.85;
  state.yaw *= 0.85;
  state.z = 0;

  // 10. CRITICAL HARD COLLISION CONSTRAINT: No Wheel Sinks Below Asphalt
  // Compute minimum permissible vehicle Y so that all 4 wheels remain ON the asphalt
  const maxWheelGroundY = Math.max(flGroundY, frGroundY, rlGroundY, rrGroundY);
  const minAllowedCenterY = maxWheelGroundY + WHEEL_RADIUS + SUSPENSION_REST_OFFSET - SUSPENSION_MAX_TRAVEL;

  if (state.y < minAllowedCenterY && !isUpsideDown) {
    state.y = minAllowedCenterY;
    if (state.vy < 0) {
      state.vy = 0;
    }
  }

  // 11. Safety Boundary / Off-Road Check
  if (state.y < centerGroundY - 10.0 || state.y < -30.0) {
    state.isOffRoad = true;
    state.isCrashed = true;
    state.crashReason = 'off_road';
  }

  // 12. Physical Wheel Rotation along axle
  const groundSpeed = state.vx;
  const wheelAngularDelta = (groundSpeed / WHEEL_RADIUS) * stepDt;
  state.wheelRotation += wheelAngularDelta;

  // Update physical metrics
  const prevDistance = state.distance;
  state.distance = Math.max(state.distance, Math.max(0, state.x - 8.0));
  const distanceDelta = Math.max(0, state.distance - prevDistance);

  // Update 4-wheel independent state properties
  state.frontLeftGrounded = flGrounded;
  state.frontRightGrounded = frGrounded;
  state.rearLeftGrounded = rlGrounded;
  state.rearRightGrounded = rrGrounded;
  state.frontLeftComp = flComp;
  state.frontRightComp = frComp;
  state.rearLeftComp = rlComp;
  state.rearRightComp = rrComp;

  // Combined compatibility properties
  const avgFrontComp = (flComp + frComp) / 2;
  const avgRearComp = (rlComp + rrComp) / 2;
  state.frontSuspensionComp = avgFrontComp;
  state.rearSuspensionComp = avgRearComp;
  state.isGrounded = isGrounded;
  state.frontGrounded = frontGrounded;
  state.rearGrounded = rearGrounded;

  // 13. DETERMINISTIC SCORING TRACKER (Max 400 PTS)
  state.driveTimeSeconds += stepDt;

  // A. Speed Control Metrics
  const speed = Math.abs(state.vx);
  if (speed >= 8.0 && speed <= 29.0 && !isUpsideDown) {
    state.smoothSpeedSeconds += stepDt;
  }
  if (controls.brake && speed > 22.0 && angleFromUpright > 0.35) {
    state.excessiveBrakeEvents += stepDt * 1.5;
  }

  // B. Vehicle Stability Metrics
  const isUprightAndStable = isGrounded && angleFromUpright < 0.22 && !isUpsideDown;
  if (isUprightAndStable) {
    state.stableDistanceMeters += distanceDelta;
    state.cleanTimeSeconds += stepDt;
  }

  // C. Landing & Hill Cresting Metrics
  if (landedThisFrame && !isUpsideDown) {
    if (angleFromUpright < 0.32 && impactSpeed < 4.5) {
      state.successfulLandings += 1;
    } else if (impactSpeed > 5.8 || angleFromUpright > 0.55) {
      state.hardLandingPenalties += 1;
    }
  }

  // Detect clean hill cresting (speed > 8 m/s while passing a crest)
  if (isGrounded && Math.abs(slopeAngle) < 0.05 && speed > 10.0 && angleFromUpright < 0.18) {
    state.cleanHillCrests += stepDt * 0.8;
  }

  // Calculate live score
  updateTournamentScore(state);

  // 14. Vehicle Overturn & Flip Detection
  if (isUpsideDown) {
    state.isFlipped = true;
    state.flipTimer += stepDt;
    if (state.flipTimer >= 0.35 || (isGrounded && state.flipTimer >= 0.15)) {
      state.isCrashed = true;
      state.crashReason = 'flipped';
      state.vx = 0;
      state.vy = 0;
      state.angularVelPitch = 0;
    }
  } else {
    state.isFlipped = false;
    state.flipTimer = Math.max(0, state.flipTimer - stepDt * 2);
  }

  // 15. Time Limit (120 seconds / 2 minutes) & Out of Fuel Check
  if (state.driveTimeSeconds >= 120.0) {
    state.isCrashed = true;
    state.crashReason = 'time_up';
    state.vx = 0;
  } else if (state.fuel <= 0 && Math.abs(state.vx) < 0.25 && isGrounded) {
    state.isCrashed = true;
    state.crashReason = 'out_of_fuel';
    state.vx = 0;
  }

  // 16. Collectibles Pickups (Gold Coins & Fuel Jerrycans along asphalt)
  const collectedItems: Collectible3D[] = [];
  const pickupRadius = 2.4;

  for (let i = 0; i < collectibles.length; i++) {
    const item = collectibles[i];
    if (!item.collected) {
      const dx = state.x - item.x;
      const dy = state.y - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < pickupRadius) {
        item.collected = true;
        collectedItems.push(item);

        if (item.type === 'coin') {
          state.coinsCollected += 1;
        } else if (item.type === 'fuel') {
          state.fuel = Math.min(100, state.fuel + item.value);
        }
      }
    }
  }

  return {
    state,
    collectedItems,
    landedThisFrame,
    impactSpeed,
  };
}

/**
 * Calculates competitive tournament score strictly adhering to the 5-component formula (MAX 400 PTS)
 * with Pace / Time Performance integration to prevent slow-driving exploits.
 * 
 * 1. DISTANCE PERFORMANCE (Max 120):
 *    120 * (1 - exp(-Distance / 3500)) scaled by pace efficiency.
 * 
 * 2. SPEED CONTROL (Max 70):
 *    Controlled momentum vs reckless braking/stalls, weighted by average driving pace.
 * 
 * 3. VEHICLE STABILITY (Max 90):
 *    Stable distance ratio & low pitch deviation from road normal.
 * 
 * 4. LANDING + HILL CONTROL (Max 60):
 *    Successful landings + clean hill crests - hard landings.
 * 
 * 5. SURVIVAL / CONSISTENCY (Max 60):
 *    Sustained continuous clean driving time at active pace.
 */
export function updateTournamentScore(state: VehiclePhysics3D): number {
  const driveTime = Math.max(0.5, state.driveTimeSeconds);
  const avgSpeed = state.distance / driveTime; // m/s active driving speed
  
  // Pace Efficiency Factor (1.0 for skilled pace ~15-25 m/s, dropping for crawling <5 m/s)
  const paceFactor = Math.min(1.0, Math.max(0.32, (avgSpeed - 2.5) / 12.5));

  // A. Distance Performance (0 - 120)
  const baseDistance = 120 * (1 - Math.exp(-Math.max(0, state.distance) / 3500));
  const distanceScore = Math.max(0, Math.min(120, baseDistance * (0.60 + 0.40 * paceFactor)));

  // B. Speed Control (0 - 70)
  const smoothRatio = Math.min(1.0, state.smoothSpeedSeconds / driveTime);
  const brakePenalty = Math.min(20, state.excessiveBrakeEvents * 2.5);
  const speedProgress = 1 - Math.exp(-state.smoothSpeedSeconds / 22);
  const speedControlScore = Math.max(0, Math.min(70, 70 * speedProgress * smoothRatio * paceFactor - brakePenalty));

  // C. Vehicle Stability (0 - 90)
  const dist = Math.max(1.0, state.distance);
  const stabilityRatio = Math.min(1.0, state.stableDistanceMeters / dist);
  const baseStabilityPotential = 90 * (1 - Math.exp(-dist / 1400));
  const stabilityScore = Math.max(0, Math.min(90, baseStabilityPotential * Math.pow(stabilityRatio, 1.5) * (0.75 + 0.25 * paceFactor)));

  // D. Landing + Hill Control (0 - 60)
  const landingBase = state.successfulLandings * 9.0 + state.cleanHillCrests * 5.0 - state.hardLandingPenalties * 6.0;
  const landingScore = Math.max(0, Math.min(60, landingBase));

  // E. Survival / Consistency (0 - 60)
  const cleanTime = Math.max(0, state.cleanTimeSeconds);
  const survivalScore = Math.max(0, Math.min(60, 60 * (1 - Math.exp(-cleanTime / 65)) * paceFactor));

  // Sum & Strictly Clamp to [0, 400]
  const totalScore = distanceScore + speedControlScore + stabilityScore + landingScore + survivalScore;
  const roundedFinal = Math.max(0, Math.min(400, Math.round(totalScore)));

  state.finalScore = roundedFinal;
  state.scoreBreakdown = {
    distanceScore: Math.round(distanceScore * 10) / 10,
    speedControlScore: Math.round(speedControlScore * 10) / 10,
    stabilityScore: Math.round(stabilityScore * 10) / 10,
    landingScore: Math.round(landingScore * 10) / 10,
    survivalScore: Math.round(survivalScore * 10) / 10,
  };

  return roundedFinal;
}

/**
 * Public helper to calculate tournament score from state or parameters
 */
export function calculateTournamentScore(state: VehiclePhysics3D): number {
  return updateTournamentScore(state);
}
