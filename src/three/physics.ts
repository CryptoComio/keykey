import { KEYS_CATALOG, type KeyId } from '../data/keysCatalog';

export interface KeyPhysicsState {
  id: KeyId;
  swingZ: number;
  swingVelZ: number;
  pitchX: number;
  pitchVelX: number;
  twistY: number;
  twistVelY: number;
  ringAngle: number;
  hoverLift: number;
}

export interface KeychainPhysicsState {
  rigSwingZ: number;
  rigSwingVelZ: number;
  rigPitchX: number;
  rigPitchVelX: number;
  rigYawY: number;
  rigYawVelY: number;
  targetYawY: number;
  elapsed: number;
  keys: Record<KeyId, KeyPhysicsState>;
}

export interface PhysicsStepInput {
  dt: number;
  autoSway: boolean;
  spread: number; // 0..1
  hoveredKey: KeyId | null;
  focusedKey: KeyId | null;
  pointerNdcX: number; // -1..1
  pointerNdcY: number; // -1..1
  isDragging: boolean;
  ringCenterY?: number;
  ringRadius?: number;
}

export interface CameraTargetPose {
  posX: number;
  posY: number;
  posZ: number;
  lookX: number;
  lookY: number;
  lookZ: number;
}

export interface KeySphereProbe {
  lx: number;
  ly: number;
  lz: number;
  r: number;
}

// Accurate 3D multi-sphere collision volumes matching Circular Medallion, Stadium Capsule, and Hardcover Folio (with -0.18 jump-ring drop)
export const KEY_COLLISION_SPHERES: Record<KeyId, KeySphereProbe[]> = {
  prince: [
    // Eyelet & crown pedestal
    { lx: 0, ly: -0.49, lz: 0, r: 0.075 },
    // Grand circular seal medallion (outerD=1.12 centered at y=-1.12)
    { lx: 0, ly: -0.62, lz: 0, r: 0.07 },
    { lx: -0.34, ly: -0.77, lz: 0, r: 0.068 },
    { lx: 0.34, ly: -0.77, lz: 0, r: 0.068 },
    { lx: -0.48, ly: -1.12, lz: 0, r: 0.072 },
    { lx: 0, ly: -1.12, lz: 0, r: 0.076 },
    { lx: 0.48, ly: -1.12, lz: 0, r: 0.072 },
    { lx: -0.34, ly: -1.47, lz: 0, r: 0.068 },
    { lx: 0.34, ly: -1.47, lz: 0, r: 0.068 },
    { lx: 0, ly: -1.62, lz: 0, r: 0.072 },
    // Compact spiral-fluted shaft & pierced bit
    { lx: 0, ly: -1.96, lz: 0, r: 0.088 },
    { lx: 0, ly: -2.32, lz: 0, r: 0.085 },
    { lx: 0, ly: -2.62, lz: 0, r: 0.085 },
    { lx: 0.22, ly: -2.41, lz: 0, r: 0.125 },
  ],
  artcode: [
    // Eyelet & compact gavel bolster crown
    { lx: 0, ly: -0.48, lz: 0, r: 0.072 },
    { lx: -0.11, ly: -0.55, lz: 0, r: 0.088 },
    { lx: 0.11, ly: -0.55, lz: 0, r: 0.088 },
    // Stadium capsule pill tag (w=0.80, h=1.50 centered at y=-1.32)
    { lx: 0, ly: -0.69, lz: 0, r: 0.068 },
    { lx: -0.28, ly: -0.84, lz: 0, r: 0.066 },
    { lx: 0.28, ly: -0.84, lz: 0, r: 0.066 },
    { lx: -0.33, ly: -1.32, lz: 0, r: 0.072 },
    { lx: 0, ly: -1.32, lz: 0, r: 0.074 },
    { lx: 0.33, ly: -1.32, lz: 0, r: 0.072 },
    { lx: -0.28, ly: -1.8, lz: 0, r: 0.066 },
    { lx: 0.28, ly: -1.8, lz: 0, r: 0.066 },
    { lx: 0, ly: -1.95, lz: 0, r: 0.068 },
    // Compact baluster stem & scrolled bit
    { lx: 0, ly: -2.22, lz: 0, r: 0.095 },
    { lx: 0, ly: -2.53, lz: 0, r: 0.088 },
    { lx: 0, ly: -2.74, lz: 0, r: 0.085 },
    { lx: 0.25, ly: -2.53, lz: 0, r: 0.135 },
  ],
  icon: [
    // Eyelet & broad hardcover editorial folio (w=0.86, h=1.40 centered at y=-1.22)
    { lx: 0, ly: -0.51, lz: 0, r: 0.075 },
    { lx: -0.34, ly: -0.64, lz: 0, r: 0.066 },
    { lx: 0, ly: -0.64, lz: 0, r: 0.068 },
    { lx: 0.34, ly: -0.64, lz: 0, r: 0.066 },
    { lx: -0.35, ly: -1.22, lz: 0, r: 0.068 },
    { lx: 0, ly: -1.22, lz: 0, r: 0.072 },
    { lx: 0.35, ly: -1.22, lz: 0, r: 0.068 },
    { lx: -0.34, ly: -1.81, lz: 0, r: 0.066 },
    { lx: 0, ly: -1.81, lz: 0, r: 0.068 },
    { lx: 0.34, ly: -1.81, lz: 0, r: 0.066 },
    // Compact fluted shaft & comb bit
    { lx: 0, ly: -2.13, lz: 0, r: 0.09 },
    { lx: 0, ly: -2.45, lz: 0, r: 0.085 },
    { lx: 0, ly: -2.69, lz: 0, r: 0.085 },
    { lx: 0.22, ly: -2.55, lz: 0, r: 0.125 },
  ],
};

// Mass scaling reflects real solid-metal weight: Art Code gavel heaviest, Prince medium, Icon slightly lighter
const KEY_MASS: Record<KeyId, number> = {
  prince: 1.15,
  artcode: 1.45,
  icon: 1.05,
};

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function dampValue(
  current: number,
  target: number,
  lambda: number,
  dt: number
): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function getRingAttachmentPoint(
  ringAngle: number,
  ringCenterY: number,
  ringRadius: number
): { x: number; y: number; z: number } {
  return {
    x: Math.sin(ringAngle) * ringRadius,
    y: ringCenterY - Math.cos(ringAngle) * ringRadius,
    z: 0,
  };
}

/**
 * Matches Three.js default 'XYZ' Euler order (M = Rx * Ry * Rz) applied to any 3D local offset.
 */
export function transformLocalPointWorld(
  k: KeyPhysicsState,
  lx: number,
  ly: number,
  lz: number,
  ringCenterY = 0.64,
  ringRadius = 0.44
): { x: number; y: number; z: number; rx: number; ry: number; rz: number } {
  const anchor = getRingAttachmentPoint(k.ringAngle, ringCenterY, ringRadius);

  const cosZ = Math.cos(k.swingZ);
  const sinZ = Math.sin(k.swingZ);
  const x1 = lx * cosZ - ly * sinZ;
  const y1 = lx * sinZ + ly * cosZ;
  const z1 = lz;

  const cosY = Math.cos(k.twistY);
  const sinY = Math.sin(k.twistY);
  const x2 = x1 * cosY + z1 * sinY;
  const y2 = y1;
  const z2 = -x1 * sinY + z1 * cosY;

  const cosX = Math.cos(k.pitchX);
  const sinX = Math.sin(k.pitchX);
  const rx = x2;
  const ry = y2 * cosX - z2 * sinX;
  const rz = y2 * sinX + z2 * cosX;

  return {
    x: anchor.x + rx,
    y: anchor.y + ry,
    z: anchor.z + rz,
    rx,
    ry,
    rz,
  };
}

export function transformKeyNodeWorld(
  k: KeyPhysicsState,
  localY: number,
  ringCenterY = 0.64,
  ringRadius = 0.44
): { x: number; y: number; z: number } {
  const res = transformLocalPointWorld(k, 0, localY, 0, ringCenterY, ringRadius);
  return { x: res.x, y: res.y, z: res.z };
}

export function getRestPitchX(id: KeyId): number {
  // Negative pitchX swings key bottom toward +Z (front): stepped cascade like wildyriftian.com
  // Prince sits cleanly front-left (-0.18), Art Code mid-center (0.0), IconArt back-right (+0.18)
  return id === 'prince' ? -0.18 : id === 'artcode' ? 0.0 : 0.18;
}

export function createInitialPhysicsState(): KeychainPhysicsState {
  const keys = {} as Record<KeyId, KeyPhysicsState>;
  for (const item of KEYS_CATALOG) {
    keys[item.id] = {
      id: item.id,
      swingZ: item.restAngleZ,
      swingVelZ: 0,
      pitchX: getRestPitchX(item.id),
      pitchVelX: 0,
      twistY: item.restTwistY,
      twistVelY: 0,
      ringAngle: item.ringAttachAngle,
      hoverLift: 0,
    };
  }
  return {
    rigSwingZ: 0,
    rigSwingVelZ: 0,
    rigPitchX: 0,
    rigPitchVelX: 0,
    rigYawY: 0,
    rigYawVelY: 0,
    targetYawY: 0,
    elapsed: 0,
    keys,
  };
}

export function applyImpulseToKeychain(
  state: KeychainPhysicsState,
  impulseX: number,
  impulseY: number,
  targetKey: KeyId | null = null
): void {
  const clampedX = clamp(impulseX, -4.5, 4.5);
  const clampedY = clamp(impulseY, -4.5, 4.5);

  if (targetKey) {
    const k = state.keys[targetKey];
    const invMass = 1 / KEY_MASS[targetKey];
    k.swingVelZ += clampedX * 1.65 * invMass;
    k.twistVelY += clampedX * 2.2 * invMass;
    k.pitchVelX += clampedY * 1.15 * invMass;
    state.rigSwingVelZ += clampedX * 0.18;
    state.rigPitchVelX += clampedY * 0.14;
    return;
  }

  state.rigSwingVelZ += clampedX * 0.42;
  state.rigPitchVelX += clampedY * 0.32;

  for (const item of KEYS_CATALOG) {
    const k = state.keys[item.id];
    const invMass = 1 / KEY_MASS[item.id];
    k.swingVelZ += clampedX * 0.85 * invMass;
    k.twistVelY += clampedX * 1.2 * invMass;
    k.pitchVelX += clampedY * 0.65 * invMass;
  }
}

/**
 * Computes minimum pairwise sphere surface clearance across all 3 keys (negative = overlap).
 */
export function computeMinKeyClearance(
  state: KeychainPhysicsState,
  ringCenterY = 0.64,
  ringRadius = 0.44
): number {
  const ids: KeyId[] = ['prince', 'artcode', 'icon'];
  let minClearance = Infinity;

  for (let a = 0; a < ids.length; a++) {
    for (let b = a + 1; b < ids.length; b++) {
      const probesA = KEY_COLLISION_SPHERES[ids[a]];
      const probesB = KEY_COLLISION_SPHERES[ids[b]];
      const keyA = state.keys[ids[a]];
      const keyB = state.keys[ids[b]];

      for (const pA of probesA) {
        const wA = transformLocalPointWorld(
          keyA,
          pA.lx,
          pA.ly,
          pA.lz,
          ringCenterY,
          ringRadius
        );
        for (const pB of probesB) {
          const wB = transformLocalPointWorld(
            keyB,
            pB.lx,
            pB.ly,
            pB.lz,
            ringCenterY,
            ringRadius
          );
          const dist = Math.hypot(wB.x - wA.x, wB.y - wA.y, wB.z - wA.z);
          const clearance = dist - (pA.r + pB.r);
          if (clearance < minClearance) {
            minClearance = clearance;
          }
        }
      }
    }
  }
  return minClearance;
}

/**
 * Exact 3D Jacobian rigid-body contact solver across multi-sphere key silhouettes.
 * Prevents keys from passing through each other during swing, drag, hover, or rest.
 */
function resolveKeyToKeyCollisions(
  state: KeychainPhysicsState,
  ringCenterY: number,
  ringRadius: number
): void {
  const ids: KeyId[] = ['prince', 'artcode', 'icon'];
  const restitution = 0.36;
  const iterations = 2;

  for (let iter = 0; iter < iterations; iter++) {
    for (let a = 0; a < ids.length; a++) {
      for (let b = a + 1; b < ids.length; b++) {
        const idA = ids[a];
        const idB = ids[b];
        const keyA = state.keys[idA];
        const keyB = state.keys[idB];
        const probesA = KEY_COLLISION_SPHERES[idA];
        const probesB = KEY_COLLISION_SPHERES[idB];

        const invMassA = 1 / KEY_MASS[idA];
        const invMassB = 1 / KEY_MASS[idB];

        const wZa = invMassA * 1.15;
        const wXa = invMassA * 1.45;
        const wYa = invMassA * 0.75;
        const wRa = invMassA * 0.28;

        const wZb = invMassB * 1.15;
        const wXb = invMassB * 1.45;
        const wYb = invMassB * 0.75;
        const wRb = invMassB * 0.28;

        const ringTanAx = ringRadius * Math.cos(keyA.ringAngle);
        const ringTanAy = ringRadius * Math.sin(keyA.ringAngle);
        const ringTanBx = ringRadius * Math.cos(keyB.ringAngle);
        const ringTanBy = ringRadius * Math.sin(keyB.ringAngle);

        for (const pA of probesA) {
          const wA = transformLocalPointWorld(
            keyA,
            pA.lx,
            pA.ly,
            pA.lz,
            ringCenterY,
            ringRadius
          );
          for (const pB of probesB) {
            const wB = transformLocalPointWorld(
              keyB,
              pB.lx,
              pB.ly,
              pB.lz,
              ringCenterY,
              ringRadius
            );

            const dx = wB.x - wA.x;
            const dy = wB.y - wA.y;
            const dz = wB.z - wA.z;
            const distSq = dx * dx + dy * dy + dz * dz;
            const minDist = pA.r + pB.r;

            if (distSq >= minDist * minDist) continue;

            const dist = Math.sqrt(distSq);
            const pen = minDist - dist;

            let nx = 0;
            let ny = 0;
            let nz = 0;
            if (dist > 1e-5) {
              nx = dx / dist;
              ny = dy / dist;
              nz = dz / dist;
            } else {
              const sx = idA === 'prince' ? -0.8 : 0.8;
              const sz = 0.6;
              const len = Math.hypot(sx, sz);
              nx = sx / len;
              nz = sz / len;
            }

            // Generalized rotational Jacobians at contact lever vectors wA.r and wB.r
            const jzA = -wA.ry * nx + wA.rx * ny;
            const jxA = -wA.rz * ny + wA.ry * nz;
            const jyA = wA.rz * nx - wA.rx * nz;
            const jrA = ringTanAx * nx + ringTanAy * ny;

            const jzB = -wB.ry * nx + wB.rx * ny;
            const jxB = -wB.rz * ny + wB.ry * nz;
            const jyB = wB.rz * nx - wB.rx * nz;
            const jrB = ringTanBx * nx + ringTanBy * ny;

            const effInvA =
              wZa * jzA * jzA + wXa * jxA * jxA + wYa * jyA * jyA + wRa * jrA * jrA;
            const effInvB =
              wZb * jzB * jzB + wXb * jxB * jxB + wYb * jyB * jyB + wRb * jrB * jrB;
            const denom = effInvA + effInvB + 1e-4;

            // Strict positional projection prevents interpenetration
            const posCorr = (Math.max(0, pen - 0.001) * 0.86) / denom;
            keyA.swingZ = clamp(keyA.swingZ - posCorr * wZa * jzA, -1.35, 1.35);
            keyA.pitchX = clamp(keyA.pitchX - posCorr * wXa * jxA, -0.95, 0.95);
            keyA.twistY = clamp(keyA.twistY - posCorr * wYa * jyA, -1.25, 1.25);
            keyA.ringAngle = clamp(keyA.ringAngle - posCorr * wRa * jrA, -1.28, 1.28);

            keyB.swingZ = clamp(keyB.swingZ + posCorr * wZb * jzB, -1.35, 1.35);
            keyB.pitchX = clamp(keyB.pitchX + posCorr * wXb * jxB, -0.95, 0.95);
            keyB.twistY = clamp(keyB.twistY + posCorr * wYb * jyB, -1.25, 1.25);
            keyB.ringAngle = clamp(keyB.ringAngle + posCorr * wRb * jrB, -1.28, 1.28);

            // Apply metallic impact impulse only on first solver iteration
            if (iter === 0) {
              const vAn =
                keyA.swingVelZ * jzA + keyA.pitchVelX * jxA + keyA.twistVelY * jyA;
              const vBn =
                keyB.swingVelZ * jzB + keyB.pitchVelX * jxB + keyB.twistVelY * jyB;
              const relVelN = vBn - vAn;

              if (relVelN < 0) {
                const velDenom =
                  wZa * jzA * jzA +
                  wXa * jxA * jxA +
                  wYa * jyA * jyA +
                  wZb * jzB * jzB +
                  wXb * jxB * jxB +
                  wYb * jyB * jyB +
                  1e-4;
                const jImp = (-(1 + restitution) * relVelN) / velDenom;

                keyA.swingVelZ -= jImp * wZa * jzA;
                keyA.pitchVelX -= jImp * wXa * jxA;
                keyA.twistVelY -= jImp * wYa * jyA;

                keyB.swingVelZ += jImp * wZb * jzB;
                keyB.pitchVelX += jImp * wXb * jxB;
                keyB.twistVelY += jImp * wYb * jyB;
              }
            }
          }
        }
      }
    }
  }
}

export function stepKeychainPhysics(
  state: KeychainPhysicsState,
  input: PhysicsStepInput
): void {
  const totalDt = clamp(input.dt, 0.001, 0.05);
  const spread = clamp(input.spread, 0, 1.5);
  const ringCenterY = input.ringCenterY ?? 0.64;
  const ringRadius = input.ringRadius ?? 0.44;
  state.elapsed += totalDt;

  const substeps = 6;
  const dt = totalDt / substeps;
  const anyHovered = input.hoveredKey !== null && input.focusedKey === null;

  for (let step = 0; step < substeps; step++) {
    const ambientSwayZ = input.autoSway
      ? Math.sin(state.elapsed * 0.85) * 0.022 +
        Math.sin(state.elapsed * 1.45) * 0.008
      : 0;
    const ambientPitchX = input.autoSway
      ? Math.cos(state.elapsed * 0.7) * 0.014
      : 0;

    const pointerInfluenceZ =
      !input.focusedKey && !input.isDragging ? -input.pointerNdcX * 0.06 : 0;
    const pointerInfluenceX =
      !input.focusedKey && !input.isDragging ? input.pointerNdcY * 0.045 : 0;

    const targetRigZ = ambientSwayZ + pointerInfluenceZ;
    const targetRigX = ambientPitchX + pointerInfluenceX;

    const rigStiffness = 28;
    const rigDamping = 4.2;
    const rigAccelZ =
      (targetRigZ - state.rigSwingZ) * rigStiffness - state.rigSwingVelZ * rigDamping;
    const rigAccelX =
      (targetRigX - state.rigPitchX) * rigStiffness - state.rigPitchVelX * rigDamping;

    state.rigSwingVelZ += rigAccelZ * dt;
    state.rigSwingZ = clamp(state.rigSwingZ + state.rigSwingVelZ * dt, -0.65, 0.65);

    state.rigPitchVelX += rigAccelX * dt;
    state.rigPitchX = clamp(state.rigPitchX + state.rigPitchVelX * dt, -0.55, 0.55);

    if (!input.isDragging && step === 0) {
      const yawTarget = input.focusedKey
        ? 0
        : input.pointerNdcX * 0.12 +
          (input.autoSway ? Math.sin(state.elapsed * 0.52) * 0.07 : 0);
      state.targetYawY = yawTarget;
    }
    state.rigYawY = dampValue(state.rigYawY, state.targetYawY, 6.0, dt);

    for (let i = 0; i < KEYS_CATALOG.length; i++) {
      const meta = KEYS_CATALOG[i];
      const k = state.keys[meta.id];
      const isHovered = input.hoveredKey === meta.id;
      const isFocused = input.focusedKey === meta.id;
      const invMass = 1 / KEY_MASS[meta.id];

      const spreadFactor = 0.72 + spread * 1.4;
      const ringSpreadFactor = 0.76 + spread * 1.2;

      let targetRingAngle = isFocused ? 0 : meta.ringAttachAngle * ringSpreadFactor;
      let targetSwingZ = meta.restAngleZ * spreadFactor;
      let targetTwistY = meta.restTwistY * Math.max(0.25, 1.0 - spread * 0.65);
      let targetPitchX = getRestPitchX(meta.id);

      if (anyHovered && !isFocused) {
        // Balanced radial fan-out along the main split ring upon hover/touch
        if (input.hoveredKey === 'prince') {
          if (meta.id === 'prince') {
            targetSwingZ = -0.98;
            targetRingAngle = -1.14;
            targetTwistY = 0.0;
            targetPitchX = -0.14;
          } else if (meta.id === 'artcode') {
            targetSwingZ = 0.04;
            targetRingAngle = 0.06;
            targetTwistY = -0.02;
            targetPitchX = 0.0;
          } else {
            targetSwingZ = 1.0;
            targetRingAngle = 1.16;
            targetTwistY = 0.0;
            targetPitchX = 0.12;
          }
        } else if (input.hoveredKey === 'icon') {
          if (meta.id === 'icon') {
            targetSwingZ = 1.0;
            targetRingAngle = 1.16;
            targetTwistY = 0.0;
            targetPitchX = -0.12;
          } else if (meta.id === 'artcode') {
            targetSwingZ = -0.04;
            targetRingAngle = -0.06;
            targetTwistY = 0.02;
            targetPitchX = 0.0;
          } else {
            targetSwingZ = -0.98;
            targetRingAngle = -1.14;
            targetTwistY = 0.0;
            targetPitchX = 0.1;
          }
        } else if (input.hoveredKey === 'artcode') {
          if (meta.id === 'artcode') {
            targetSwingZ = 0.0;
            targetRingAngle = 0.0;
            targetTwistY = 0.0;
            targetPitchX = -0.12;
          } else if (meta.id === 'prince') {
            targetSwingZ = -0.98;
            targetRingAngle = -1.14;
            targetTwistY = 0.02;
            targetPitchX = 0.04;
          } else {
            targetSwingZ = 1.0;
            targetRingAngle = 1.16;
            targetTwistY = -0.02;
            targetPitchX = 0.08;
          }
        }
      }

      if (input.autoSway && !isFocused) {
        targetSwingZ += Math.sin(state.elapsed * 1.15 + i * 1.7) * 0.018;
        targetTwistY += Math.cos(state.elapsed * 0.9 + i * 2.1) * 0.024;
        targetPitchX += Math.sin(state.elapsed * 0.8 + i * 1.3) * 0.012;
      }

      if (isFocused) {
        targetSwingZ = 0;
        targetTwistY = 0;
        targetPitchX = 0;
      }

      const couplingZ = -rigAccelZ * 0.014 * invMass;
      const couplingX = -rigAccelX * 0.012 * invMass;

      const keyStiffness = (isFocused ? 46 : anyHovered ? 38 : 26) * invMass;
      const keyDamping = isFocused ? 8.5 : anyHovered ? 4.6 : 3.4;

      const accelZ =
        (targetSwingZ - k.swingZ) * keyStiffness - k.swingVelZ * keyDamping + couplingZ;
      const accelX =
        (targetPitchX - k.pitchX) * keyStiffness - k.pitchVelX * keyDamping + couplingX;
      const accelY =
        (targetTwistY - k.twistY) * (keyStiffness * 0.78) -
        k.twistVelY * (keyDamping * 0.85);

      k.swingVelZ += accelZ * dt;
      k.swingZ = clamp(k.swingZ + k.swingVelZ * dt, -1.35, 1.35);

      k.pitchVelX += accelX * dt;
      k.pitchX = clamp(k.pitchX + k.pitchVelX * dt, -0.95, 0.95);

      k.twistVelY += accelY * dt;
      k.twistY = clamp(k.twistY + k.twistVelY * dt, -1.25, 1.25);

      const dynamicRingAngle = isFocused
        ? 0
        : clamp(targetRingAngle + (k.swingZ - targetSwingZ) * 0.42, -1.28, 1.28);
      k.ringAngle = dampValue(k.ringAngle, dynamicRingAngle, anyHovered ? 12.0 : 8.5, dt);

      const targetLift = isFocused ? 0.35 : isHovered ? 0.18 : 0;
      k.hoverLift = dampValue(k.hoverLift, targetLift, 9.0, dt);
    }

    // Solve solid-body 3D multi-sphere collisions so keys never clip or pass through
    if (!input.focusedKey) {
      resolveKeyToKeyCollisions(state, ringCenterY, ringRadius);
    }
  }
}

export function getCameraTargetPose(
  focusedKey: KeyId | null,
  aspectRatio: number
): CameraTargetPose {
  const narrowFactor = aspectRatio < 0.7 ? 1.44 : aspectRatio < 1.0 ? 1.2 : 1.0;

  if (!focusedKey) {
    const mobileLift = aspectRatio < 0.7 ? -0.14 : 0;
    return {
      posX: 0,
      posY: -0.04 + mobileLift,
      posZ: 11.45 * narrowFactor,
      lookX: 0,
      lookY: -0.16 + mobileLift,
      lookZ: 0,
    };
  }

  const panelOffset = aspectRatio >= 1.1 ? 0.96 : 0;
  return {
    posX: panelOffset,
    posY: -1.2,
    posZ: 6.2 * narrowFactor,
    lookX: panelOffset * 0.78,
    lookY: -1.28,
    lookZ: 0.22,
  };
}
