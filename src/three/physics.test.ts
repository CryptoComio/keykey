import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyImpulseToKeychain,
  computeMinKeyClearance,
  createInitialPhysicsState,
  getCameraTargetPose,
  getRingAttachmentPoint,
  stepKeychainPhysics,
} from './physics';

test('initial physics state places keys left-center-right with matching non-crossing ring signs', () => {
  const state = createInitialPhysicsState();
  assert.ok(state.keys.prince.swingZ < -0.1);
  assert.ok(state.keys.prince.ringAngle < -0.1);
  assert.ok(Math.abs(state.keys.artcode.swingZ) < 0.05);
  assert.equal(state.keys.artcode.ringAngle, 0);
  assert.ok(state.keys.icon.swingZ > 0.1);
  assert.ok(state.keys.icon.ringAngle > 0.1);
});

test('ring attachment points always remain strictly on the central keyring perimeter at z=0', () => {
  const ringCenterY = 0.64;
  const ringRadius = 0.44;
  const state = createInitialPhysicsState();

  for (const angle of [
    state.keys.prince.ringAngle,
    state.keys.artcode.ringAngle,
    state.keys.icon.ringAngle,
  ]) {
    const pt = getRingAttachmentPoint(angle, ringCenterY, ringRadius);
    assert.equal(pt.z, 0);
    const dist = Math.hypot(pt.x, pt.y - ringCenterY);
    assert.ok(Math.abs(dist - ringRadius) < 1e-6);
  }
});

test('hovering or touching a key triggers balanced Foto-2 radial fan-out with clear X separation on ring', () => {
  const state = createInitialPhysicsState();
  for (let i = 0; i < 140; i++) {
    stepKeychainPhysics(state, {
      dt: 0.016,
      autoSway: false,
      spread: 0.2,
      hoveredKey: 'artcode',
      focusedKey: null,
      pointerNdcX: 0,
      pointerNdcY: 0,
      isDragging: false,
    });
  }
  assert.ok(state.keys.prince.swingZ < -0.85 && state.keys.prince.swingZ > -1.15);
  assert.ok(state.keys.prince.ringAngle < -1.0 && state.keys.prince.ringAngle > -1.28);
  assert.ok(state.keys.icon.swingZ > 0.85 && state.keys.icon.swingZ < 1.15);
  assert.ok(state.keys.icon.ringAngle > 1.0 && state.keys.icon.ringAngle < 1.28);
});

test('impulse imparts velocity and spring-damper settles smoothly', () => {
  const state = createInitialPhysicsState();
  applyImpulseToKeychain(state, 2.0, -1.0, 'artcode');

  assert.ok(state.keys.artcode.swingVelZ > 0);
  assert.ok(state.rigSwingVelZ > 0);

  for (let i = 0; i < 200; i++) {
    stepKeychainPhysics(state, {
      dt: 0.016,
      autoSway: false,
      spread: 0.2,
      hoveredKey: null,
      focusedKey: null,
      pointerNdcX: 0,
      pointerNdcY: 0,
      isDragging: false,
    });
  }

  assert.ok(Math.abs(state.rigSwingZ) < 0.02);
  assert.ok(Math.abs(state.rigSwingVelZ) < 0.05);
  assert.ok(Math.abs(state.keys.artcode.swingVelZ) < 0.05);
});

test('3D multi-sphere collision prevents keys from passing through each other and transfers momentum', () => {
  const state = createInitialPhysicsState();
  // Place Prince and Art Code aligned in Z right near contact and drive Prince hard rightward (+X)
  state.keys.prince.pitchX = 0;
  state.keys.artcode.pitchX = 0;
  state.keys.prince.swingZ = -0.34;
  state.keys.artcode.swingZ = 0.02;
  state.keys.artcode.swingVelZ = 0;
  applyImpulseToKeychain(state, 4.0, 0, 'prince');

  let minClearance = Infinity;
  for (let i = 0; i < 10; i++) {
    stepKeychainPhysics(state, {
      dt: 0.016,
      autoSway: false,
      spread: 0.2,
      hoveredKey: null,
      focusedKey: null,
      pointerNdcX: 0,
      pointerNdcY: 0,
      isDragging: false,
    });
    minClearance = Math.min(minClearance, computeMinKeyClearance(state));
  }

  // Prince must push Art Code rightward/outward without crossing past Art Code's center
  assert.ok(state.keys.artcode.swingVelZ > 0.08 || state.keys.artcode.swingZ > 0.08);
  assert.ok(state.keys.prince.swingZ < state.keys.artcode.swingZ);
  // Rigid-body projection keeps sphere interpenetration minimal (never deep clipping)
  assert.ok(minClearance > -0.15, `expected bounded clearance, got ${minClearance}`);
});

test('all three keys remain non-penetrating when settled at rest (Foto 1)', () => {
  const state = createInitialPhysicsState();
  for (let i = 0; i < 160; i++) {
    stepKeychainPhysics(state, {
      dt: 0.016,
      autoSway: false,
      spread: 0.2,
      hoveredKey: null,
      focusedKey: null,
      pointerNdcX: 0,
      pointerNdcY: 0,
      isDragging: false,
    });
  }
  const clearance = computeMinKeyClearance(state);
  assert.ok(clearance >= -0.03, `keys should rest cleanly without clipping, clearance=${clearance}`);
});

test('focusing a key aligns it toward center and brings camera closer', () => {
  const state = createInitialPhysicsState();
  for (let i = 0; i < 120; i++) {
    stepKeychainPhysics(state, {
      dt: 0.016,
      autoSway: true,
      spread: 0.2,
      hoveredKey: null,
      focusedKey: 'prince',
      pointerNdcX: 0.5,
      pointerNdcY: -0.5,
      isDragging: false,
    });
  }

  assert.ok(Math.abs(state.keys.prince.swingZ) < 0.03);
  assert.ok(Math.abs(state.keys.prince.twistY) < 0.03);
  assert.ok(state.keys.prince.hoverLift > 0.25);

  const overviewCam = getCameraTargetPose(null, 16 / 9);
  const focusCam = getCameraTargetPose('prince', 16 / 9);
  assert.ok(focusCam.posZ < overviewCam.posZ);
});

test('narrow mobile aspect ratio pulls camera back to keep keychain framed', () => {
  const desktopCam = getCameraTargetPose(null, 1440 / 900);
  const mobileCam = getCameraTargetPose(null, 390 / 844);
  assert.ok(mobileCam.posZ > desktopCam.posZ);
});
