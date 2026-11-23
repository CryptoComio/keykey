import * as THREE from 'three';
import type { ProceduralTextureSet } from './textures';
import type { ClaspFinish } from '../data/keysCatalog';

export interface KeychainMaterials {
  goldPolished: THREE.MeshPhysicalMaterial;
  goldSculpted: THREE.MeshPhysicalMaterial;
  goldMatteAccent: THREE.MeshStandardMaterial;
  obsidianLacquer: THREE.MeshPhysicalMaterial;
  obsidianSatin: THREE.MeshPhysicalMaterial;
  claspMetal: THREE.MeshPhysicalMaterial;
  claspAccent: THREE.MeshPhysicalMaterial;
  silverGrommet: THREE.MeshPhysicalMaterial;
  princePlaque: THREE.MeshPhysicalMaterial;
  artCodeBarrel: THREE.MeshPhysicalMaterial;
  iconCover: THREE.MeshPhysicalMaterial;
  setClaspFinish: (finish: ClaspFinish) => void;
  dispose: () => void;
}

export function createKeychainMaterials(
  textures: ProceduralTextureSet
): KeychainMaterials {
  // Satin-brushed burnished bronze-gold ("oro bronzato spento")
  const goldPolished = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xfff7e8),
    map: textures.goldBronzeColor,
    metalness: 0.94,
    roughness: 1.0,
    roughnessMap: textures.goldBrushedRoughness,
    normalMap: textures.goldBrushedNormal,
    normalScale: new THREE.Vector2(0.32, 0.32),
    clearcoat: 0.14,
    clearcoatRoughness: 0.2,
    anisotropy: 0.72,
    envMapIntensity: 1.56,
  });

  // Lost-wax cast & burnished antiqued bronze patina for bezels, collars & scrolled key bits
  const goldSculpted = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xf7ecd8),
    map: textures.baroqueBronzeColor,
    metalness: 0.9,
    roughness: 1.0,
    roughnessMap: textures.baroqueRoughness,
    normalMap: textures.baroqueNormal,
    normalScale: new THREE.Vector2(0.44, 0.44),
    clearcoat: 0.08,
    clearcoatRoughness: 0.34,
    anisotropy: 0.38,
    envMapIntensity: 1.5,
  });

  const goldMatteAccent = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xeddcc0),
    map: textures.baroqueBronzeColor,
    metalness: 0.88,
    roughness: 0.46,
    roughnessMap: textures.baroqueRoughness,
    normalMap: textures.baroqueNormal,
    normalScale: new THREE.Vector2(0.3, 0.3),
    envMapIntensity: 1.38,
  });

  const obsidianLacquer = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x06070a),
    metalness: 0.08,
    roughness: 0.06,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    ior: 1.62,
    reflectivity: 0.92,
    envMapIntensity: 1.42,
  });

  const obsidianSatin = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x111216),
    metalness: 0.12,
    roughness: 1.0,
    roughnessMap: textures.obsidianSatinRoughness,
    normalMap: textures.obsidianSatinNormal,
    normalScale: new THREE.Vector2(0.26, 0.26),
    clearcoat: 0.22,
    clearcoatRoughness: 0.28,
    envMapIntensity: 1.08,
  });

  const claspMetal = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xe5e9f0),
    map: textures.chromeBrushedColor,
    metalness: 0.98,
    roughness: 1.0,
    roughnessMap: textures.chromeBrushedRoughness,
    normalMap: textures.chromeBrushedNormal,
    normalScale: new THREE.Vector2(0.22, 0.22),
    clearcoat: 0.28,
    clearcoatRoughness: 0.1,
    anisotropy: 0.82,
    envMapIntensity: 1.52,
  });

  const claspAccent = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xb8c0cc),
    map: textures.chromeBrushedColor,
    metalness: 0.95,
    roughness: 1.0,
    roughnessMap: textures.chromeBrushedRoughness,
    normalMap: textures.chromeBrushedNormal,
    normalScale: new THREE.Vector2(0.28, 0.28),
    envMapIntensity: 1.34,
  });

  const silverGrommet = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xd2d7e0),
    map: textures.chromeBrushedColor,
    metalness: 0.96,
    roughness: 0.22,
    normalMap: textures.chromeBrushedNormal,
    normalScale: new THREE.Vector2(0.16, 0.16),
    envMapIntensity: 1.38,
  });

  const princePlaque = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff),
    map: textures.princeColor,
    normalMap: textures.princeNormal,
    normalScale: new THREE.Vector2(0.72, 0.72),
    roughnessMap: textures.princeRoughness,
    roughness: 1.0,
    metalnessMap: textures.princeMetalness,
    metalness: 0.96,
    emissive: new THREE.Color(0xedd39b),
    emissiveMap: textures.princeMetalness,
    emissiveIntensity: 0.24,
    clearcoat: 0.45,
    clearcoatRoughness: 0.09,
    envMapIntensity: 1.48,
  });

  const artCodeBarrel = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff),
    map: textures.artCodeColor,
    normalMap: textures.artCodeNormal,
    normalScale: new THREE.Vector2(0.58, 0.58),
    roughnessMap: textures.artCodeRoughness,
    roughness: 1.0,
    metalnessMap: textures.artCodeMetalness,
    metalness: 0.96,
    emissive: new THREE.Color(0xedd39b),
    emissiveMap: textures.artCodeMetalness,
    emissiveIntensity: 0.24,
    clearcoat: 0.14,
    clearcoatRoughness: 0.22,
    envMapIntensity: 1.38,
  });

  const iconCover = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff),
    map: textures.iconColor,
    normalMap: textures.iconNormal,
    normalScale: new THREE.Vector2(0.56, 0.56),
    roughnessMap: textures.iconRoughness,
    roughness: 1.0,
    metalnessMap: textures.iconMetalness,
    metalness: 0.94,
    emissive: new THREE.Color(0xedd39b),
    emissiveMap: textures.iconMetalness,
    emissiveIntensity: 0.25,
    clearcoat: 0.05,
    clearcoatRoughness: 0.45,
    envMapIntensity: 1.38,
  });

  const allMaterials = [
    goldPolished,
    goldSculpted,
    goldMatteAccent,
    obsidianLacquer,
    obsidianSatin,
    claspMetal,
    claspAccent,
    silverGrommet,
    princePlaque,
    artCodeBarrel,
    iconCover,
  ];

  function setClaspFinish(finish: ClaspFinish): void {
    if (finish === 'chrome') {
      claspMetal.color.setHex(0xe5e9f0);
      claspMetal.map = textures.chromeBrushedColor;
      claspMetal.roughnessMap = textures.chromeBrushedRoughness;
      claspMetal.normalMap = textures.chromeBrushedNormal;
      claspMetal.normalScale.set(0.22, 0.22);
      claspMetal.metalness = 0.98;
      claspMetal.roughness = 1.0;
      claspMetal.clearcoat = 0.28;
      claspMetal.clearcoatRoughness = 0.1;
      claspMetal.anisotropy = 0.82;
      claspMetal.envMapIntensity = 1.52;

      claspAccent.color.setHex(0xb8c0cc);
      claspAccent.map = textures.chromeBrushedColor;
      claspAccent.roughnessMap = textures.chromeBrushedRoughness;
      claspAccent.normalMap = textures.chromeBrushedNormal;
      claspAccent.normalScale.set(0.28, 0.28);
      claspAccent.metalness = 0.95;
      claspAccent.roughness = 1.0;
      claspAccent.envMapIntensity = 1.34;
    } else {
      claspMetal.color.setHex(0xfff7e8);
      claspMetal.map = textures.goldBronzeColor;
      claspMetal.roughnessMap = textures.goldBrushedRoughness;
      claspMetal.normalMap = textures.goldBrushedNormal;
      claspMetal.normalScale.set(0.32, 0.32);
      claspMetal.metalness = 0.94;
      claspMetal.roughness = 1.0;
      claspMetal.clearcoat = 0.14;
      claspMetal.clearcoatRoughness = 0.2;
      claspMetal.anisotropy = 0.72;
      claspMetal.envMapIntensity = 1.56;

      claspAccent.color.setHex(0xf7ecd8);
      claspAccent.map = textures.baroqueBronzeColor;
      claspAccent.roughnessMap = textures.baroqueRoughness;
      claspAccent.normalMap = textures.baroqueNormal;
      claspAccent.normalScale.set(0.44, 0.44);
      claspAccent.metalness = 0.9;
      claspAccent.roughness = 1.0;
      claspAccent.clearcoat = 0.08;
      claspAccent.clearcoatRoughness = 0.34;
      claspAccent.envMapIntensity = 1.5;
    }
    claspMetal.needsUpdate = true;
    claspAccent.needsUpdate = true;
  }

  return {
    goldPolished,
    goldSculpted,
    goldMatteAccent,
    obsidianLacquer,
    obsidianSatin,
    claspMetal,
    claspAccent,
    silverGrommet,
    princePlaque,
    artCodeBarrel,
    iconCover,
    setClaspFinish,
    dispose: () => {
      for (const m of allMaterials) {
        m.dispose();
      }
    },
  };
}
