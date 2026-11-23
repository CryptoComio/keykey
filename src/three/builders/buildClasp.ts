import * as THREE from 'three';
import type { KeychainMaterials } from '../materials';

export interface ClaspBuildResult {
  group: THREE.Group;
  ringCenterY: number;
  ringRadius: number;
  geometries: THREE.BufferGeometry[];
}

export function buildClasp(materials: KeychainMaterials): ClaspBuildResult {
  const group = new THREE.Group();
  group.name = 'clasp_assembly';
  const geometries: THREE.BufferGeometry[] = [];

  const track = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };

  // 1. Top U-Shackle Arch (matches the heavy carabiner loop in wildyriftian.com)
  const archPoints = [
    new THREE.Vector3(-0.27, 1.88, 0),
    new THREE.Vector3(-0.27, 2.38, 0),
    new THREE.Vector3(-0.22, 2.66, 0),
    new THREE.Vector3(0.0, 2.76, 0),
    new THREE.Vector3(0.22, 2.66, 0),
    new THREE.Vector3(0.27, 2.38, 0),
    new THREE.Vector3(0.27, 1.88, 0),
  ];
  const archCurve = new THREE.CatmullRomCurve3(archPoints, false, 'catmullrom', 0.35);
  const archGeo = track(new THREE.TubeGeometry(archCurve, 64, 0.082, 24, false));
  const archMesh = new THREE.Mesh(archGeo, materials.claspMetal);
  archMesh.castShadow = true;
  archMesh.receiveShadow = true;
  group.add(archMesh);

  // Subtle horizontal step collars where shackle meets housing
  for (const sx of [-0.27, 0.27]) {
    const collarGeo = track(new THREE.CylinderGeometry(0.105, 0.105, 0.055, 24));
    const collar = new THREE.Mesh(collarGeo, materials.claspAccent);
    collar.position.set(sx, 1.9, 0);
    collar.castShadow = true;
    group.add(collar);
  }

  // 2. Machined Rectangular Housing Block with Chamfered Bevel
  const bw = 0.72;
  const bh = 0.56;
  const br = 0.045;
  const blockShape = new THREE.Shape();
  blockShape.moveTo(-bw / 2 + br, -bh / 2);
  blockShape.lineTo(bw / 2 - br, -bh / 2);
  blockShape.quadraticCurveTo(bw / 2, -bh / 2, bw / 2, -bh / 2 + br);
  blockShape.lineTo(bw / 2, bh / 2 - br);
  blockShape.quadraticCurveTo(bw / 2, bh / 2, bw / 2 - br, bh / 2);
  blockShape.lineTo(-bw / 2 + br, bh / 2);
  blockShape.quadraticCurveTo(-bw / 2, bh / 2, -bw / 2, bh / 2 - br);
  blockShape.lineTo(-bw / 2, -bh / 2 + br);
  blockShape.quadraticCurveTo(-bw / 2, -bh / 2, -bw / 2 + br, -bh / 2);

  const blockGeo = track(
    new THREE.ExtrudeGeometry(blockShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: 4,
      curveSegments: 12,
    })
  );
  blockGeo.center();
  const blockMesh = new THREE.Mesh(blockGeo, materials.claspMetal);
  blockMesh.position.set(0, 1.6, 0);
  blockMesh.castShadow = true;
  blockMesh.receiveShadow = true;
  group.add(blockMesh);

  // Machined seam groove line across housing
  const seamGeo = track(new THREE.BoxGeometry(bw + 0.06, 0.014, 0.285));
  const seamMesh = new THREE.Mesh(seamGeo, materials.obsidianSatin);
  seamMesh.position.set(0, 1.54, 0);
  group.add(seamMesh);

  // Circular pivot pin / screw head on lower-left face (exact signature detail)
  const pinRingGeo = track(new THREE.CylinderGeometry(0.068, 0.068, 0.3, 24));
  pinRingGeo.rotateX(Math.PI / 2);
  const pinRing = new THREE.Mesh(pinRingGeo, materials.claspAccent);
  pinRing.position.set(-0.22, 1.44, 0);
  group.add(pinRing);

  const pinInnerGeo = track(new THREE.CylinderGeometry(0.036, 0.036, 0.315, 20));
  pinInnerGeo.rotateX(Math.PI / 2);
  const pinInner = new THREE.Mesh(pinInnerGeo, materials.claspMetal);
  pinInner.position.set(-0.22, 1.44, 0);
  group.add(pinInner);

  // 3. Stepped Swivel Neck Collar & Retaining Loop beneath housing (matching wildyriftian.com)
  const neckGeo = track(new THREE.BoxGeometry(0.42, 0.085, 0.2));
  const neckMesh = new THREE.Mesh(neckGeo, materials.claspAccent);
  neckMesh.position.set(0, 1.33, 0);
  neckMesh.castShadow = true;
  group.add(neckMesh);

  const swivelCollarGeo = track(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 24));
  const swivelCollar = new THREE.Mesh(swivelCollarGeo, materials.claspMetal);
  swivelCollar.position.set(0, 1.25, 0);
  group.add(swivelCollar);

  const swivelBarGeo = track(new THREE.BoxGeometry(0.18, 0.045, 0.085));
  const swivelBar = new THREE.Mesh(swivelBarGeo, materials.claspAccent);
  swivelBar.position.set(0, 1.2, 0);
  group.add(swivelBar);

  // Swivel eye sits in YZ plane; top wire enters swivel collar, bottom wire threads through split ring
  const swivelEyeGeo = track(new THREE.TorusGeometry(0.165, 0.028, 18, 44));
  swivelEyeGeo.rotateY(Math.PI / 2);
  const swivelEye = new THREE.Mesh(swivelEyeGeo, materials.claspMetal);
  swivelEye.position.set(0, 1.13, 0);
  swivelEye.castShadow = true;
  group.add(swivelEye);

  // 4. Central Realistic Double-Coil Helical Split Keyring (slender polished wire)
  const ringCenterY = 0.64;
  const ringRadius = 0.44;
  const coilPts: THREE.Vector3[] = [];
  const totalSteps = 136;
  const turns = 1.94;
  for (let i = 0; i <= totalSteps; i++) {
    const t = i / totalSteps;
    const theta = -0.25 + t * Math.PI * 2 * turns;
    // Slight helical progression in Z so the two coils nest like a real split keyring
    const zOff = (t - 0.5) * 0.054;
    const rOff = ringRadius + Math.sin(t * Math.PI) * 0.003;
    coilPts.push(
      new THREE.Vector3(
        Math.cos(theta) * rOff,
        ringCenterY + Math.sin(theta) * rOff,
        zOff
      )
    );
  }
  const coilCurve = new THREE.CatmullRomCurve3(coilPts);
  const splitRingGeo = track(new THREE.TubeGeometry(coilCurve, 136, 0.026, 18, false));
  const splitRing = new THREE.Mesh(splitRingGeo, materials.claspMetal);
  splitRing.castShadow = true;
  splitRing.receiveShadow = true;
  group.add(splitRing);

  // Polished end-caps sealing both ends of the split ring coil
  const endCapGeo = track(new THREE.SphereGeometry(0.026, 12, 10));
  for (const pt of [coilPts[0], coilPts[coilPts.length - 1]]) {
    const cap = new THREE.Mesh(endCapGeo, materials.claspAccent);
    cap.position.copy(pt);
    group.add(cap);
  }

  return {
    group,
    ringCenterY,
    ringRadius,
    geometries,
  };
}
