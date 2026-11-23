import * as THREE from 'three';
import type { KeychainMaterials } from '../materials';
import type { KeyBuildResult } from './buildPrinceKey';

export function buildIconKey(materials: KeychainMaterials): KeyBuildResult {
  const group = new THREE.Group();
  group.name = 'key_icon';
  const geometries: THREE.BufferGeometry[] = [];
  const track = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };

  // 1. Lengthened Oval Jump Ring interlocking around main split ring
  const jumpRingGeo = track(new THREE.TorusGeometry(0.145, 0.0155, 22, 52));
  jumpRingGeo.rotateY(Math.PI / 2);
  const jumpRing = new THREE.Mesh(jumpRingGeo, materials.goldPolished);
  jumpRing.position.set(0, -0.215, 0);
  jumpRing.scale.set(1, 1.88, 0.94);
  group.add(jumpRing);

  const keyBodyGroup = new THREE.Group();
  keyBodyGroup.position.set(0, -0.21, 0);
  group.add(keyBodyGroup);

  // 2. Wide Sharp-Cornered Architectural Hardcover Editorial Folio (0.86 x 1.40)
  // Unmistakably rectilinear book geometry contrasting against Prince Circle & Art Code Pill
  const w = 0.86;
  const h = 1.4;
  const r = 0.018;
  const tabW = 0.21;
  const tabH = 0.11;
  const bodyCenterY = -1.01;

  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-w / 2 + r, -h / 2);
  bodyShape.lineTo(w / 2 - r, -h / 2);
  bodyShape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  bodyShape.lineTo(w / 2, h / 2 - r);
  bodyShape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  bodyShape.lineTo(tabW / 2 + 0.04, h / 2);
  bodyShape.quadraticCurveTo(tabW / 2, h / 2, tabW / 2 - 0.012, h / 2 + tabH * 0.5);
  bodyShape.absarc(0, h / 2 + tabH * 0.55, tabW / 2 - 0.012, 0, Math.PI, false);
  bodyShape.quadraticCurveTo(-tabW / 2, h / 2, -tabW / 2 - 0.04, h / 2);
  bodyShape.lineTo(-w / 2 + r, h / 2);
  bodyShape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  bodyShape.lineTo(-w / 2, -h / 2 + r);
  bodyShape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

  const tabHole = new THREE.Path();
  tabHole.absarc(0, h / 2 + tabH * 0.55, 0.05, 0, Math.PI * 2, true);
  bodyShape.holes.push(tabHole);

  const coverDepth = 0.074;
  const bodyGeo = track(
    new THREE.ExtrudeGeometry(bodyShape, {
      depth: coverDepth,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.01,
      bevelSegments: 3,
      curveSegments: 16,
    })
  );
  bodyGeo.translate(0, bodyCenterY, -coverDepth / 2);
  const bodyMesh = new THREE.Mesh(bodyGeo, materials.obsidianSatin);
  keyBodyGroup.add(bodyMesh);

  // Outer Bronze Trim Frame
  const rimInnerShape = new THREE.Shape();
  const rw = w - 0.036;
  const rh = h - 0.036;
  rimInnerShape.moveTo(-w / 2 - 0.008, -h / 2 - 0.008);
  rimInnerShape.lineTo(w / 2 + 0.008, -h / 2 - 0.008);
  rimInnerShape.lineTo(w / 2 + 0.008, h / 2 + 0.008);
  rimInnerShape.lineTo(tabW / 2 + 0.044, h / 2 + 0.008);
  rimInnerShape.absarc(0, h / 2 + tabH * 0.55, tabW / 2 + 0.005, 0, Math.PI, false);
  rimInnerShape.lineTo(-tabW / 2 - 0.044, h / 2 + 0.008);
  rimInnerShape.lineTo(-w / 2 - 0.008, h / 2 + 0.008);
  rimInnerShape.closePath();

  const rimCutout = new THREE.Path();
  rimCutout.moveTo(-rw / 2, -rh / 2);
  rimCutout.lineTo(-rw / 2, rh / 2);
  rimCutout.lineTo(-tabW / 2 + 0.015, rh / 2);
  rimCutout.absarc(0, h / 2 + tabH * 0.55, tabW / 2 - 0.017, Math.PI, 0, true);
  rimCutout.lineTo(tabW / 2 - 0.015, rh / 2);
  rimCutout.lineTo(rw / 2, rh / 2);
  rimCutout.lineTo(rw / 2, -rh / 2);
  rimCutout.closePath();
  rimInnerShape.holes.push(rimCutout);

  const rimGeo = track(
    new THREE.ExtrudeGeometry(rimInnerShape, {
      depth: coverDepth + 0.026,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 2,
      curveSegments: 16,
    })
  );
  rimGeo.translate(0, bodyCenterY, -(coverDepth + 0.026) / 2);
  const rimMesh = new THREE.Mesh(rimGeo, materials.goldPolished);
  keyBodyGroup.add(rimMesh);

  // Reinforced Eyelet Grommet
  const grommetGeo = track(new THREE.TorusGeometry(0.054, 0.014, 16, 32));
  const grommetFront = new THREE.Mesh(grommetGeo, materials.silverGrommet);
  grommetFront.position.set(0, bodyCenterY + h / 2 + tabH * 0.55, coverDepth / 2 + 0.01);
  keyBodyGroup.add(grommetFront);

  const grommetBack = new THREE.Mesh(grommetGeo, materials.silverGrommet);
  grommetBack.position.set(0, bodyCenterY + h / 2 + tabH * 0.55, -(coverDepth / 2 + 0.01));
  keyBodyGroup.add(grommetBack);

  // Front & Back Folio Cover Planes
  const coverPlaneGeo = track(new THREE.PlaneGeometry(w - 0.044, h - 0.044));
  const frontCover = new THREE.Mesh(coverPlaneGeo, materials.iconCover);
  frontCover.position.set(0, bodyCenterY, coverDepth / 2 + 0.016);
  keyBodyGroup.add(frontCover);

  const backCover = new THREE.Mesh(coverPlaneGeo, materials.iconCover);
  backCover.position.set(0, bodyCenterY, -(coverDepth / 2 + 0.016));
  backCover.rotation.y = Math.PI;
  keyBodyGroup.add(backCover);

  // Compact 3D Sculpted Bauhaus Relief Emblem seated neatly in lower zone (y = bodyCenterY - 0.39)
  const reliefGroup = new THREE.Group();
  reliefGroup.position.set(0.015, bodyCenterY - 0.39, coverDepth / 2 + 0.02);
  const s = 0.25;
  const half = s / 2;
  const barT = 0.011;
  const barD = 0.014;

  const hBarGeo = track(new THREE.BoxGeometry(s + barT, barT, barD));
  const vBarGeo = track(new THREE.BoxGeometry(barT, s + barT, barD));

  for (const offset of [-half, half]) {
    const hBar = new THREE.Mesh(hBarGeo, materials.goldPolished);
    hBar.position.y = offset;
    reliefGroup.add(hBar);

    const vBar = new THREE.Mesh(vBarGeo, materials.goldPolished);
    vBar.position.x = offset;
    reliefGroup.add(vBar);
  }

  const midVert = new THREE.Mesh(vBarGeo, materials.goldPolished);
  midVert.position.x = 0.005;
  reliefGroup.add(midVert);

  const midHoriz = new THREE.Mesh(hBarGeo, materials.goldPolished);
  midHoriz.position.y = 0.014;
  reliefGroup.add(midHoriz);

  const lowerLeftVertGeo = track(new THREE.BoxGeometry(barT, half + 0.014, barD));
  const lowerLeftVert = new THREE.Mesh(lowerLeftVertGeo, materials.goldPolished);
  lowerLeftVert.position.set(-half * 0.48, -half / 2 + 0.007, 0);
  reliefGroup.add(lowerLeftVert);

  const lowerRightHorizGeo = track(new THREE.BoxGeometry(half - 0.005, barT, barD));
  const lowerRightHoriz = new THREE.Mesh(lowerRightHorizGeo, materials.goldPolished);
  lowerRightHoriz.position.set(half / 2 + 0.003, -0.05, 0);
  reliefGroup.add(lowerRightHoriz);

  const diagLen = Math.hypot(half, half - 0.014);
  const diagGeo = track(new THREE.BoxGeometry(diagLen, barT * 0.9, barD));
  const diagMesh = new THREE.Mesh(diagGeo, materials.goldPolished);
  diagMesh.position.set(-half / 2, 0.07, 0);
  diagMesh.rotation.z = Math.atan2(half - 0.014, half);
  reliefGroup.add(diagMesh);

  const xLen = Math.hypot(half - 0.005, half - 0.05);
  const xGeo = track(new THREE.BoxGeometry(xLen, barT * 0.85, barD));
  const x1 = new THREE.Mesh(xGeo, materials.goldPolished);
  x1.position.set(half / 2 + 0.003, -0.088, 0);
  x1.rotation.z = 0.62;
  reliefGroup.add(x1);
  const x2 = new THREE.Mesh(xGeo, materials.goldPolished);
  x2.position.set(half / 2 + 0.003, -0.088, 0);
  x2.rotation.z = -0.62;
  reliefGroup.add(x2);

  const bossGeo = track(new THREE.CylinderGeometry(0.034, 0.034, barD, 28));
  bossGeo.rotateX(Math.PI / 2);
  const bossMesh = new THREE.Mesh(bossGeo, materials.goldPolished);
  bossMesh.position.set(0.068, 0.072, 0);
  reliefGroup.add(bossMesh);

  const wedgeGeo = track(
    new THREE.CylinderGeometry(0.056, 0.056, barD, 24, 1, false, Math.PI, Math.PI / 2)
  );
  wedgeGeo.rotateX(Math.PI / 2);
  const wedgeMesh = new THREE.Mesh(wedgeGeo, materials.goldSculpted);
  wedgeMesh.position.set(0.005, 0.014, 0);
  reliefGroup.add(wedgeMesh);

  keyBodyGroup.add(reliefGroup);

  // Triangular Bronze Corner Protectors + Silver Rivets on outer hardcover corners
  const cornerShape = new THREE.Shape();
  cornerShape.moveTo(0, 0);
  cornerShape.lineTo(-0.135, 0);
  cornerShape.lineTo(0, -0.135);
  cornerShape.closePath();
  const cornerGeo = track(
    new THREE.ExtrudeGeometry(cornerShape, {
      depth: coverDepth + 0.038,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 2,
    })
  );
  cornerGeo.translate(0, 0, -(coverDepth + 0.038) / 2);

  const rivetGeo = track(new THREE.SphereGeometry(0.011, 12, 10));

  const topCorner = new THREE.Mesh(cornerGeo, materials.goldPolished);
  topCorner.position.set(w / 2 + 0.008, bodyCenterY + h / 2 + 0.008, 0);
  keyBodyGroup.add(topCorner);

  const botCorner = new THREE.Mesh(cornerGeo, materials.goldPolished);
  botCorner.position.set(w / 2 + 0.008, bodyCenterY - h / 2 - 0.008, 0);
  botCorner.rotation.z = -Math.PI / 2;
  keyBodyGroup.add(botCorner);

  for (const [rx, ry] of [
    [w / 2 - 0.03, bodyCenterY + h / 2 - 0.03],
    [w / 2 - 0.03, bodyCenterY - h / 2 + 0.03],
  ]) {
    const rivet = new THREE.Mesh(rivetGeo, materials.silverGrommet);
    rivet.position.set(rx, ry, coverDepth / 2 + 0.024);
    keyBodyGroup.add(rivet);
  }

  // 3. Compact Fluted Classical Shaft (y = -1.72 down to -2.55)
  const topNeckGeo = track(new THREE.CylinderGeometry(0.09, 0.08, 0.09, 24));
  const topNeck = new THREE.Mesh(topNeckGeo, materials.goldPolished);
  topNeck.position.set(0, -1.74, 0);
  keyBodyGroup.add(topNeck);

  const fluteCoreGeo = track(new THREE.CylinderGeometry(0.075, 0.075, 0.32, 24));
  const fluteCore = new THREE.Mesh(fluteCoreGeo, materials.obsidianSatin);
  fluteCore.position.set(0, -1.94, 0);
  keyBodyGroup.add(fluteCore);

  const ribGeo = track(new THREE.CylinderGeometry(0.014, 0.014, 0.3, 10));
  for (let rIdx = 0; rIdx < 8; rIdx++) {
    const angle = (rIdx / 8) * Math.PI * 2;
    const rib = new THREE.Mesh(ribGeo, materials.goldPolished);
    rib.position.set(Math.cos(angle) * 0.08, -1.94, Math.sin(angle) * 0.08);
    keyBodyGroup.add(rib);
  }

  const midRingGeo = track(new THREE.TorusGeometry(0.092, 0.02, 14, 32));
  midRingGeo.rotateX(Math.PI / 2);
  for (const ry of [-1.78, -2.11, -2.2]) {
    const ring = new THREE.Mesh(midRingGeo, materials.goldPolished);
    ring.position.set(0, ry, 0);
    keyBodyGroup.add(ring);
  }

  const blackBeadGeo = track(new THREE.TorusGeometry(0.089, 0.018, 14, 28));
  blackBeadGeo.rotateX(Math.PI / 2);
  const blackBead = new THREE.Mesh(blackBeadGeo, materials.obsidianLacquer);
  blackBead.position.set(0, -2.155, 0);
  keyBodyGroup.add(blackBead);

  const lowerGoldGeo = track(new THREE.CylinderGeometry(0.078, 0.078, 0.34, 28));
  const lowerGold = new THREE.Mesh(lowerGoldGeo, materials.goldPolished);
  lowerGold.position.set(0, -2.37, 0);
  keyBodyGroup.add(lowerGold);

  const tipGeo = track(new THREE.SphereGeometry(0.078, 20, 16));
  tipGeo.scale(1, 1.25, 1);
  const tip = new THREE.Mesh(tipGeo, materials.goldPolished);
  tip.position.set(0, -2.55, 0);
  keyBodyGroup.add(tip);

  // 4. Compact Stepped Architectural Comb Key Bit (projecting +X)
  const bitShape = new THREE.Shape();
  bitShape.moveTo(0.06, 0.16);
  bitShape.lineTo(0.37, 0.16);
  bitShape.lineTo(0.37, 0.085);
  bitShape.lineTo(0.24, 0.085);
  bitShape.lineTo(0.24, 0.032);
  bitShape.lineTo(0.37, 0.032);
  bitShape.lineTo(0.37, -0.032);
  bitShape.lineTo(0.24, -0.032);
  bitShape.lineTo(0.24, -0.085);
  bitShape.lineTo(0.37, -0.085);
  bitShape.lineTo(0.37, -0.16);
  bitShape.lineTo(0.06, -0.16);
  bitShape.closePath();

  const bitGeo = track(
    new THREE.ExtrudeGeometry(bitShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.008,
      bevelSegments: 3,
    })
  );
  bitGeo.translate(0, 0, -0.025);
  const bitMesh = new THREE.Mesh(bitGeo, materials.goldPolished);
  bitMesh.position.set(0, -2.34, 0);
  keyBodyGroup.add(bitMesh);

  // Invisible raycast collision proxy
  const proxyGeo = track(new THREE.BoxGeometry(1.06, 2.88, 0.36));
  const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitProxy = new THREE.Mesh(proxyGeo, proxyMat);
  hitProxy.position.set(0.04, -1.44, 0);
  hitProxy.userData.keyId = 'icon';
  group.add(hitProxy);

  return { group, hitProxy, geometries };
}
