import * as THREE from 'three';
import type { KeychainMaterials } from '../materials';
import type { KeyBuildResult } from './buildPrinceKey';

function createStadiumCapsuleShape(w: number, h: number): THREE.Shape {
  const hw = w / 2;
  const hh = h / 2;
  const r = Math.min(hw, hh * 0.48);
  const s = new THREE.Shape();
  s.moveTo(-hw, -hh + r);
  s.lineTo(-hw, hh - r);
  s.absarc(0, hh - r, hw, Math.PI, 0, true);
  s.lineTo(hw, -hh + r);
  s.absarc(0, -hh + r, hw, 0, -Math.PI, true);
  s.closePath();
  return s;
}

function addCapsuleCutout(shape: THREE.Shape, w: number, h: number): void {
  const hw = w / 2;
  const hh = h / 2;
  const r = Math.min(hw, hh * 0.48);
  const hole = new THREE.Path();
  hole.moveTo(-hw, -hh + r);
  hole.absarc(0, -hh + r, hw, Math.PI, 0, false);
  hole.lineTo(hw, hh - r);
  hole.absarc(0, hh - r, hw, 0, Math.PI, false);
  hole.closePath();
  shape.holes.push(hole);
}

export function buildArtCodeKey(materials: KeychainMaterials): KeyBuildResult {
  const group = new THREE.Group();
  group.name = 'key_artcode';
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
  keyBodyGroup.position.set(0, -0.18, 0);
  group.add(keyBodyGroup);

  // 2. Refined Eyelet + Compact Auctioneer's Gavel Bolster Crown
  const eyeletGeo = track(new THREE.TorusGeometry(0.06, 0.018, 18, 40));
  const eyelet = new THREE.Mesh(eyeletGeo, materials.goldPolished);
  eyelet.position.set(0, -0.3, 0);
  keyBodyGroup.add(eyelet);

  const crownBolsterGeo = track(new THREE.CylinderGeometry(0.088, 0.088, 0.25, 32));
  crownBolsterGeo.rotateZ(Math.PI / 2);
  const crownBolster = new THREE.Mesh(crownBolsterGeo, materials.obsidianLacquer);
  crownBolster.position.set(0, -0.37, 0);
  keyBodyGroup.add(crownBolster);

  const bolsterRingGeo = track(new THREE.TorusGeometry(0.09, 0.017, 16, 32));
  bolsterRingGeo.rotateY(Math.PI / 2);
  for (const dir of [-1, 1]) {
    const r = new THREE.Mesh(bolsterRingGeo, materials.goldPolished);
    r.position.set(dir * 0.125, -0.37, 0);
    keyBodyGroup.add(r);
  }

  // 3. Modernist Stadium Capsule / Pill Plaque (0.80 x 1.50 centered at y = -1.14)
  const bladeY = -1.14;
  const bladeW = 0.8;
  const bladeH = 1.5;
  const bladeDepth = 0.072;

  const coreShape = createStadiumCapsuleShape(bladeW - 0.036, bladeH - 0.036);
  const coreGeo = track(
    new THREE.ExtrudeGeometry(coreShape, {
      depth: bladeDepth,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.01,
      bevelSegments: 3,
      curveSegments: 36,
    })
  );
  coreGeo.translate(0, 0, -bladeDepth / 2);
  const coreMesh = new THREE.Mesh(coreGeo, materials.obsidianLacquer);
  coreMesh.position.set(0, bladeY, 0);
  keyBodyGroup.add(coreMesh);

  // Machined Bronze Stadium Rim Rail framing the pill silhouette
  const railShape = createStadiumCapsuleShape(bladeW, bladeH);
  addCapsuleCutout(railShape, bladeW - 0.084, bladeH - 0.084);

  const railDepth = 0.09;
  const railGeo = track(
    new THREE.ExtrudeGeometry(railShape, {
      depth: railDepth,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 2,
      curveSegments: 36,
    })
  );
  railGeo.translate(0, 0, -railDepth / 2);
  const railMesh = new THREE.Mesh(railGeo, materials.goldPolished);
  railMesh.position.set(0, bladeY, 0);
  keyBodyGroup.add(railMesh);

  // Sculpted side waist clamping lugs on outer edges (keeps center open for text)
  const lugGeo = track(new THREE.BoxGeometry(0.044, 0.14, railDepth + 0.022));
  for (const dir of [-1, 1]) {
    const lug = new THREE.Mesh(lugGeo, materials.goldSculpted);
    lug.position.set(dir * (bladeW / 2 - 0.005), bladeY, 0);
    keyBodyGroup.add(lug);
  }

  // Front & Back Exact Stadium-Clipped Engraved Artwork Faces (UVs [0..1])
  const faceW = bladeW - 0.094;
  const faceH = bladeH - 0.094;
  const faceShape = createStadiumCapsuleShape(faceW, faceH);
  const faceGeo = track(new THREE.ShapeGeometry(faceShape, 36));
  const fPos = faceGeo.attributes.position;
  const fUv = faceGeo.attributes.uv;
  for (let i = 0; i < fPos.count; i++) {
    fUv.setXY(i, (fPos.getX(i) + faceW / 2) / faceW, (fPos.getY(i) + faceH / 2) / faceH);
  }
  fUv.needsUpdate = true;

  const frontFace = new THREE.Mesh(faceGeo, materials.artCodeBarrel);
  frontFace.position.set(0, bladeY, bladeDepth / 2 + 0.015);
  keyBodyGroup.add(frontFace);

  const backFace = new THREE.Mesh(faceGeo, materials.artCodeBarrel);
  backFace.position.set(0, bladeY, -(bladeDepth / 2 + 0.015));
  backFace.rotation.y = Math.PI;
  keyBodyGroup.add(backFace);

  // 4. Compact Turned Baluster Stem & Scrolled Bit (y = -1.89 down to -2.62)
  const balusterPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.11, 0.0),
    new THREE.Vector2(0.11, -0.038),
    new THREE.Vector2(0.07, -0.085),
    new THREE.Vector2(0.1, -0.135),
    new THREE.Vector2(0.072, -0.185),
    new THREE.Vector2(0.092, -0.25),
    new THREE.Vector2(0.074, -0.29),
    new THREE.Vector2(0.0, -0.29),
  ];
  const balusterGeo = track(new THREE.LatheGeometry(balusterPoints, 32));
  const baluster = new THREE.Mesh(balusterGeo, materials.obsidianLacquer);
  baluster.position.set(0, -1.89, 0);
  keyBodyGroup.add(baluster);

  const collarPositions: Array<[number, number]> = [
    [-1.91, 0.115],
    [-2.02, 0.088],
    [-2.17, 0.092],
  ];
  for (const [cy, cr] of collarPositions) {
    const cGeo = track(new THREE.TorusGeometry(cr, 0.019, 14, 32));
    cGeo.rotateX(Math.PI / 2);
    const c = new THREE.Mesh(cGeo, materials.goldPolished);
    c.position.set(0, cy, 0);
    keyBodyGroup.add(c);
  }

  const lowerShaftGeo = track(new THREE.CylinderGeometry(0.08, 0.08, 0.42, 28));
  const lowerShaft = new THREE.Mesh(lowerShaftGeo, materials.goldPolished);
  lowerShaft.position.set(0, -2.38, 0);
  keyBodyGroup.add(lowerShaft);

  const lowerRimGeo = track(new THREE.TorusGeometry(0.094, 0.02, 14, 32));
  lowerRimGeo.rotateX(Math.PI / 2);
  const lowerRim = new THREE.Mesh(lowerRimGeo, materials.goldPolished);
  lowerRim.position.set(0, -2.53, 0);
  keyBodyGroup.add(lowerRim);

  const tipGeo = track(new THREE.SphereGeometry(0.08, 20, 16));
  tipGeo.scale(1, 1.22, 1);
  const tip = new THREE.Mesh(tipGeo, materials.goldPolished);
  tip.position.set(0, -2.6, 0);
  keyBodyGroup.add(tip);

  // 5. Compact Scrolled Symmetrical Key Bit (projecting +X)
  const bitShape = new THREE.Shape();
  bitShape.moveTo(0.06, 0.18);
  bitShape.lineTo(0.39, 0.18);
  bitShape.bezierCurveTo(0.45, 0.18, 0.46, 0.1, 0.39, 0.08);
  bitShape.lineTo(0.28, 0.08);
  bitShape.lineTo(0.28, 0.028);
  bitShape.lineTo(0.36, 0.028);
  bitShape.lineTo(0.36, -0.028);
  bitShape.lineTo(0.28, -0.028);
  bitShape.lineTo(0.28, -0.08);
  bitShape.lineTo(0.39, -0.08);
  bitShape.bezierCurveTo(0.46, -0.1, 0.45, -0.18, 0.39, -0.18);
  bitShape.lineTo(0.06, -0.18);
  bitShape.closePath();

  const topScrollHole = new THREE.Path();
  topScrollHole.moveTo(0.15, 0.125);
  topScrollHole.lineTo(0.3, 0.125);
  topScrollHole.lineTo(0.3, 0.065);
  topScrollHole.lineTo(0.15, 0.065);
  topScrollHole.closePath();
  bitShape.holes.push(topScrollHole);

  const botScrollHole = new THREE.Path();
  botScrollHole.moveTo(0.15, -0.065);
  botScrollHole.lineTo(0.3, -0.065);
  botScrollHole.lineTo(0.3, -0.125);
  botScrollHole.lineTo(0.15, -0.125);
  botScrollHole.closePath();
  bitShape.holes.push(botScrollHole);

  const bitGeo = track(
    new THREE.ExtrudeGeometry(bitShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.008,
      bevelSegments: 3,
      curveSegments: 16,
    })
  );
  bitGeo.translate(0, 0, -0.025);
  const bitMesh = new THREE.Mesh(bitGeo, materials.goldPolished);
  bitMesh.position.set(0, -2.35, 0);
  keyBodyGroup.add(bitMesh);

  // Invisible raycast collision proxy
  const proxyGeo = track(new THREE.BoxGeometry(0.96, 2.9, 0.36));
  const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitProxy = new THREE.Mesh(proxyGeo, proxyMat);
  hitProxy.position.set(0.04, -1.45, 0);
  hitProxy.userData.keyId = 'artcode';
  group.add(hitProxy);

  return { group, hitProxy, geometries };
}
