import * as THREE from 'three';
import type { KeychainMaterials } from '../materials';

export interface KeyBuildResult {
  group: THREE.Group;
  hitProxy: THREE.Mesh;
  geometries: THREE.BufferGeometry[];
}

function createCircleContour(path: THREE.Path | THREE.Shape, diameter: number, clockwise = false): void {
  path.absarc(0, 0, diameter / 2, 0, Math.PI * 2, clockwise);
}

export function buildPrinceKey(materials: KeychainMaterials): KeyBuildResult {
  const group = new THREE.Group();
  group.name = 'key_prince';
  const geometries: THREE.BufferGeometry[] = [];
  const track = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };

  // 1. Lengthened Oval Jump Ring interlocking around main split ring at local y=0
  const jumpRingGeo = track(new THREE.TorusGeometry(0.145, 0.0155, 22, 52));
  jumpRingGeo.rotateY(Math.PI / 2);
  const jumpRing = new THREE.Mesh(jumpRingGeo, materials.goldPolished);
  jumpRing.position.set(0, -0.215, 0);
  jumpRing.scale.set(1, 1.88, 0.94);
  group.add(jumpRing);

  const keyBodyGroup = new THREE.Group();
  keyBodyGroup.position.set(0, -0.18, 0);
  group.add(keyBodyGroup);

  // 2. Crown Eyelet & Turned Pedestal Collar
  const eyeletGeo = track(new THREE.TorusGeometry(0.062, 0.019, 18, 40));
  const eyelet = new THREE.Mesh(eyeletGeo, materials.goldPolished);
  eyelet.position.set(0, -0.31, 0);
  keyBodyGroup.add(eyelet);

  const crownPedestalGeo = track(new THREE.CylinderGeometry(0.09, 0.145, 0.075, 28));
  const crownPedestal = new THREE.Mesh(crownPedestalGeo, materials.goldSculpted);
  crownPedestal.position.set(0, -0.375, 0);
  keyBodyGroup.add(crownPedestal);

  // 3. Grand Circular Gallery Seal Medallion (1:1 Circle, outerD = 1.12 — makes plaque & text dominant)
  const frameY = -0.94;
  const outerD = 1.12;
  const innerD = 0.94;

  const frameShape = new THREE.Shape();
  createCircleContour(frameShape, outerD, false);
  const frameHole = new THREE.Path();
  createCircleContour(frameHole, innerD, true);
  frameShape.holes.push(frameHole);

  const frameDepth = 0.072;
  const frameGeo = track(
    new THREE.ExtrudeGeometry(frameShape, {
      depth: frameDepth,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.016,
      bevelSegments: 4,
      curveSegments: 52,
    })
  );
  frameGeo.translate(0, 0, -frameDepth / 2);
  const frameMesh = new THREE.Mesh(frameGeo, materials.goldSculpted);
  frameMesh.position.set(0, frameY, 0);
  keyBodyGroup.add(frameMesh);

  // Stepped inner polished bronze cameo coin bezel
  const filletShape = new THREE.Shape();
  createCircleContour(filletShape, innerD + 0.036, false);
  const filletHole = new THREE.Path();
  createCircleContour(filletHole, innerD - 0.022, true);
  filletShape.holes.push(filletHole);

  const filletDepth = 0.09;
  const filletGeo = track(
    new THREE.ExtrudeGeometry(filletShape, {
      depth: filletDepth,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 2,
      curveSegments: 52,
    })
  );
  filletGeo.translate(0, 0, -filletDepth / 2);
  const filletMesh = new THREE.Mesh(filletGeo, materials.goldPolished);
  filletMesh.position.set(0, frameY, 0);
  keyBodyGroup.add(filletMesh);

  // Delicate bronze pearl studs along the circular bezel (12, 3, 6, 9 o'clock)
  const pearlGeo = track(new THREE.SphereGeometry(0.026, 14, 12));
  const midR = (outerD + innerD) / 4;
  for (const angle of [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]) {
    const px = Math.cos(angle) * midR;
    const py = frameY + Math.sin(angle) * midR;
    for (const pz of [0.052, -0.052]) {
      const pearl = new THREE.Mesh(pearlGeo, materials.goldPolished);
      pearl.position.set(px, py, pz);
      keyBodyGroup.add(pearl);
    }
  }

  // Turned bronze base collar transitioning smoothly from circle bottom (-1.50) to spiral shaft
  const baseCollarGeo = track(new THREE.CylinderGeometry(0.125, 0.096, 0.075, 28));
  const baseCollar = new THREE.Mesh(baseCollarGeo, materials.goldPolished);
  baseCollar.position.set(0, frameY - outerD / 2 - 0.02, 0);
  keyBodyGroup.add(baseCollar);

  // 4. Glossy Obsidian Enamel Circular Core + [0..1]-UV Cameo Artwork Faces
  const coreShape = new THREE.Shape();
  createCircleContour(coreShape, innerD - 0.004, false);
  const coreDepth = 0.07;
  const plaqueCoreGeo = track(
    new THREE.ExtrudeGeometry(coreShape, {
      depth: coreDepth,
      bevelEnabled: false,
      curveSegments: 52,
    })
  );
  plaqueCoreGeo.translate(0, 0, -coreDepth / 2);
  const plaqueCore = new THREE.Mesh(plaqueCoreGeo, materials.obsidianLacquer);
  plaqueCore.position.set(0, frameY, 0);
  keyBodyGroup.add(plaqueCore);

  const faceShape = new THREE.Shape();
  const faceD = innerD - 0.024;
  createCircleContour(faceShape, faceD, false);
  const plaqueFaceGeo = track(new THREE.ShapeGeometry(faceShape, 52));
  const fPos = plaqueFaceGeo.attributes.position;
  const fUv = plaqueFaceGeo.attributes.uv;
  for (let i = 0; i < fPos.count; i++) {
    fUv.setXY(i, (fPos.getX(i) + faceD / 2) / faceD, (fPos.getY(i) + faceD / 2) / faceD);
  }
  fUv.needsUpdate = true;

  const frontFace = new THREE.Mesh(plaqueFaceGeo, materials.princePlaque);
  frontFace.position.set(0, frameY, 0.04);
  keyBodyGroup.add(frontFace);

  const backFace = new THREE.Mesh(plaqueFaceGeo, materials.princePlaque);
  backFace.position.set(0, frameY, -0.04);
  backFace.rotation.y = Math.PI;
  keyBodyGroup.add(backFace);

  // 5. Compact Spiral-Fluted Key Shaft (y = -1.55 down to -2.50, keeping medallion star of silhouette)
  const topCollarPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.096, 0.0),
    new THREE.Vector2(0.096, 0.032),
    new THREE.Vector2(0.068, 0.062),
    new THREE.Vector2(0.104, 0.095),
    new THREE.Vector2(0.082, 0.13),
    new THREE.Vector2(0.0, 0.13),
  ];
  const topCollarGeo = track(new THREE.LatheGeometry(topCollarPoints, 28));
  const topCollar = new THREE.Mesh(topCollarGeo, materials.goldPolished);
  topCollar.position.set(0, -1.67, 0);
  keyBodyGroup.add(topCollar);

  const shaftCoreGeo = track(new THREE.CylinderGeometry(0.075, 0.075, 0.8, 28));
  const shaftCore = new THREE.Mesh(shaftCoreGeo, materials.obsidianLacquer);
  shaftCore.position.set(0, -2.06, 0);
  keyBodyGroup.add(shaftCore);

  const helixHeight = 0.39;
  const helixR = 0.078;
  for (let strand = 0; strand < 5; strand++) {
    const startAngle = (strand / 5) * Math.PI * 2;
    const pts: THREE.Vector3[] = [];
    const steps = 16;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const angle = startAngle + t * Math.PI * 1.4;
      pts.push(
        new THREE.Vector3(
          Math.cos(angle) * helixR,
          -1.66 - t * helixHeight,
          Math.sin(angle) * helixR
        )
      );
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const helixGeo = track(new THREE.TubeGeometry(curve, 18, 0.012, 10, false));
    const helixMesh = new THREE.Mesh(helixGeo, materials.goldPolished);
    keyBodyGroup.add(helixMesh);
  }

  const ringCollarGeo = track(new THREE.TorusGeometry(0.088, 0.02, 16, 32));
  ringCollarGeo.rotateX(Math.PI / 2);
  for (const cy of [-2.06, -2.41]) {
    const c = new THREE.Mesh(ringCollarGeo, materials.goldPolished);
    c.position.set(0, cy, 0);
    keyBodyGroup.add(c);
  }

  const finialGeo = track(new THREE.SphereGeometry(0.08, 24, 18));
  finialGeo.scale(1, 1.25, 1);
  const finial = new THREE.Mesh(finialGeo, materials.obsidianLacquer);
  finial.position.set(0, -2.5, 0);
  keyBodyGroup.add(finial);

  // 6. Compact Pierced Baroque Key Bit (projecting +X)
  const bitShape = new THREE.Shape();
  bitShape.moveTo(0.06, 0.16);
  bitShape.lineTo(0.37, 0.16);
  bitShape.lineTo(0.37, 0.072);
  bitShape.lineTo(0.24, 0.072);
  bitShape.lineTo(0.24, 0.024);
  bitShape.lineTo(0.33, 0.024);
  bitShape.lineTo(0.33, -0.024);
  bitShape.lineTo(0.24, -0.024);
  bitShape.lineTo(0.24, -0.072);
  bitShape.lineTo(0.37, -0.072);
  bitShape.lineTo(0.37, -0.16);
  bitShape.lineTo(0.06, -0.16);
  bitShape.closePath();

  const bitHole = new THREE.Path();
  bitHole.moveTo(0.14, 0.085);
  bitHole.lineTo(0.14, -0.085);
  bitHole.lineTo(0.2, -0.085);
  bitHole.lineTo(0.2, 0.085);
  bitHole.closePath();
  bitShape.holes.push(bitHole);

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
  const bitMesh = new THREE.Mesh(bitGeo, materials.goldSculpted);
  bitMesh.position.set(0, -2.23, 0);
  keyBodyGroup.add(bitMesh);

  // Invisible raycast collision proxy
  const proxyGeo = track(new THREE.BoxGeometry(1.2, 2.84, 0.36));
  const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitProxy = new THREE.Mesh(proxyGeo, proxyMat);
  hitProxy.position.set(0.02, -1.43, 0);
  hitProxy.userData.keyId = 'prince';
  group.add(hitProxy);

  return { group, hitProxy, geometries };
}
