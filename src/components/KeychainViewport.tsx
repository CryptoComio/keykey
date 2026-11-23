import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import type { ClaspFinish, KeyId, LightingPreset } from '../data/keysCatalog';
import { KEYS_CATALOG } from '../data/keysCatalog';
import { createProceduralTextures } from '../three/textures';
import { createKeychainMaterials } from '../three/materials';
import { createJewelryStudioEnv } from '../three/studioEnv';
import { buildClasp } from '../three/builders/buildClasp';
import { buildPrinceKey } from '../three/builders/buildPrinceKey';
import { buildArtCodeKey } from '../three/builders/buildArtCodeKey';
import { buildIconKey } from '../three/builders/buildIconKey';
import {
  applyImpulseToKeychain,
  createInitialPhysicsState,
  dampValue,
  getCameraTargetPose,
  getRingAttachmentPoint,
  stepKeychainPhysics,
} from '../three/physics';

export interface KeychainViewportProps {
  focusedKey: KeyId | null;
  hoveredKey: KeyId | null;
  claspFinish: ClaspFinish;
  lightingPreset: LightingPreset;
  spread: number;
  autoSway: boolean;
  resetCounter: number;
  onSelectKey: (keyId: KeyId | null) => void;
  onHoverKey: (keyId: KeyId | null) => void;
}

const _raycaster = new THREE.Raycaster();
const _pointerNdc = new THREE.Vector2();
const _lookTarget = new THREE.Vector3(0, -0.55, 0);

function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function KeychainViewport(props: KeychainViewportProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const [webglError, setWebglError] = useState(false);
  const [ready, setReady] = useState(false);

  // Refs for reactive material/lighting/reset updates without recreating the WebGLRenderer
  const materialsRef = useRef<ReturnType<typeof createKeychainMaterials> | null>(null);
  const lightsRef = useRef<{
    keyLight: THREE.DirectionalLight;
    rimLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
    hemiLight: THREE.HemisphereLight;
    rectLights: THREE.RectAreaLight[];
  } | null>(null);
  const physicsRef = useRef(createInitialPhysicsState());
  const inspectSpinRef = useRef(0);

  useEffect(() => {
    materialsRef.current?.setClaspFinish(props.claspFinish);
  }, [props.claspFinish]);

  useEffect(() => {
    const lights = lightsRef.current;
    if (!lights) return;
    if (props.lightingPreset === 'atelier') {
      lights.keyLight.color.setHex(0xfff4df);
      lights.keyLight.intensity = 3.75;
      lights.fillLight.color.setHex(0xd6e4ff);
      lights.fillLight.intensity = 1.32;
      lights.rimLight.color.setHex(0xffe1a6);
      lights.rimLight.intensity = 3.1;
      lights.hemiLight.intensity = 0.82;
      for (const rl of lights.rectLights) rl.intensity = 2.0;
    } else {
      lights.keyLight.color.setHex(0xffe3b0);
      lights.keyLight.intensity = 4.05;
      lights.fillLight.color.setHex(0x88a4de);
      lights.fillLight.intensity = 0.78;
      lights.rimLight.color.setHex(0xfff1c9);
      lights.rimLight.intensity = 3.65;
      lights.hemiLight.intensity = 0.48;
      for (const rl of lights.rectLights) rl.intensity = 1.5;
    }
  }, [props.lightingPreset]);

  useEffect(() => {
    if (props.resetCounter > 0) {
      physicsRef.current = createInitialPhysicsState();
      inspectSpinRef.current = 0;
      applyImpulseToKeychain(physicsRef.current, 0.35, 0.08, null);
    }
  }, [props.resetCounter]);

  useEffect(() => {
    inspectSpinRef.current = 0;
  }, [props.focusedKey]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0x000000, 1);

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.setAttribute('data-testid', 'keychain-canvas');
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.016);

    // High-contrast Jewelry Studio Environment Reflection
    const envTexture = createJewelryStudioEnv(renderer);
    scene.environment = envTexture;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 60);
    const initialCam = getCameraTargetPose(propsRef.current.focusedKey, width / height);
    camera.position.set(initialCam.posX, initialCam.posY, initialCam.posZ);
    _lookTarget.set(initialCam.lookX, initialCam.lookY, initialCam.lookZ);
    camera.lookAt(_lookTarget);

    // Three-Point Studio Lighting + Bottom Bounce + Area Softboxes (bright jewel definition + inter-key shadows)
    const hemiLight = new THREE.HemisphereLight(0xdde8ff, 0x3a2d1e, 0.82);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4df, 3.75);
    keyLight.position.set(-2.0, 5.4, 6.4);
    keyLight.target.position.set(0, -1.1, 0);
    scene.add(keyLight.target);
    keyLight.castShadow = true;
    const shadowRes = isSoftwareGl ? 1024 : 2048;
    keyLight.shadow.mapSize.set(shadowRes, shadowRes);
    keyLight.shadow.camera.near = 1.5;
    keyLight.shadow.camera.far = 14.0;
    keyLight.shadow.camera.left = -2.8;
    keyLight.shadow.camera.right = 2.8;
    keyLight.shadow.camera.top = 3.2;
    keyLight.shadow.camera.bottom = -3.6;
    keyLight.shadow.bias = -0.00025;
    keyLight.shadow.normalBias = 0.01;
    keyLight.shadow.radius = 2.0;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd6e4ff, 1.32);
    fillLight.position.set(4.8, 2.2, 5.4);
    scene.add(fillLight);

    const bounceLight = new THREE.DirectionalLight(0xffebd0, 0.78);
    bounceLight.position.set(0.6, -3.6, 5.6);
    scene.add(bounceLight);

    const rimLight = new THREE.DirectionalLight(0xffe1a6, 3.1);
    rimLight.position.set(-2.5, 4.0, -6.5);
    scene.add(rimLight);

    const rectLights: THREE.RectAreaLight[] = [];
    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const leftSoftbox = new THREE.RectAreaLight(0xfff4e0, 2.0, 4.5, 7.0);
      leftSoftbox.position.set(-4.8, 0.2, 4.2);
      leftSoftbox.lookAt(0, -0.6, 0);
      scene.add(leftSoftbox);
      rectLights.push(leftSoftbox);

      const rightSoftbox = new THREE.RectAreaLight(0xdbe8ff, 2.0, 4.0, 7.0);
      rightSoftbox.position.set(5.2, -0.4, 3.6);
      rightSoftbox.lookAt(0, -0.6, 0);
      scene.add(rightSoftbox);
      rectLights.push(rightSoftbox);
    }

    lightsRef.current = {
      keyLight,
      rimLight,
      fillLight,
      hemiLight,
      rectLights,
    };

    // Procedural Textures & PBR Materials
    const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    const textures = createProceduralTextures(maxAnisotropy);
    const materials = createKeychainMaterials(textures);
    materials.setClaspFinish(propsRef.current.claspFinish);
    materialsRef.current = materials;

    // Master Keychain Rig (pivots near top shackle mount)
    const masterAnchor = new THREE.Group();
    masterAnchor.position.set(0, 2.3, 0);
    scene.add(masterAnchor);

    const rigPivot = new THREE.Group();
    rigPivot.position.set(0, -2.3, 0);
    masterAnchor.add(rigPivot);

    const clasp = buildClasp(materials);
    clasp.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    rigPivot.add(clasp.group);

    // Build all 3 custom sculpted keys and attach to the central split keyring
    const prince = buildPrinceKey(materials);
    const artcode = buildArtCodeKey(materials);
    const icon = buildIconKey(materials);

    const keyEntries: Record<
      KeyId,
      { pivot: THREE.Group; group: THREE.Group; basePos: THREE.Vector3 }
    > = {} as Record<
      KeyId,
      { pivot: THREE.Group; group: THREE.Group; basePos: THREE.Vector3 }
    >;

    const builders: Record<KeyId, typeof prince> = {
      prince,
      artcode,
      icon,
    };

    const hitProxies: THREE.Mesh[] = [];

    for (const meta of KEYS_CATALOG) {
      const built = builders[meta.id];
      built.group.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj !== built.hitProxy) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });
      const pivot = new THREE.Group();
      const pt = getRingAttachmentPoint(
        meta.ringAttachAngle,
        clasp.ringCenterY,
        clasp.ringRadius
      );
      const basePos = new THREE.Vector3(pt.x, pt.y, 0);

      pivot.position.copy(basePos);
      pivot.add(built.group);
      rigPivot.add(pivot);

      hitProxies.push(built.hitProxy);
      keyEntries[meta.id] = { pivot, group: built.group, basePos };
    }

    // Apply initial preset lighting if non-default
    if (propsRef.current.lightingPreset === 'noir') {
      keyLight.intensity = 3.45;
      fillLight.intensity = 0.24;
      rimLight.intensity = 3.2;
      hemiLight.intensity = 0.18;
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    setReady(true);

    // Interaction state (zero allocations inside RAF)
    let pointerNdcX = 0;
    let pointerNdcY = 0;
    let isDragging = false;
    let dragTargetKey: KeyId | null = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let prevMoveX = 0;
    let prevMoveY = 0;
    let hasMoveOrigin = false;
    let dragDistance = 0;
    let lastRaycastTime = 0;

    const updatePointerCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointerNdcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdcY = -((clientY - rect.top) / rect.height) * 2 + 1;
      _pointerNdc.set(pointerNdcX, pointerNdcY);
    };

    const pickKeyUnderPointer = (): KeyId | null => {
      _raycaster.setFromCamera(_pointerNdc, camera);
      const hits = _raycaster.intersectObjects(hitProxies, false);
      if (hits.length === 0) return null;
      return (hits[0].object.userData.keyId as KeyId) ?? null;
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      dragDistance = 0;
      updatePointerCoords(e.clientX, e.clientY);
      dragTargetKey = pickKeyUnderPointer();
      if (dragTargetKey && !propsRef.current.focusedKey && dragTargetKey !== propsRef.current.hoveredKey) {
        const radialKick = dragTargetKey === 'prince' ? -0.52 : dragTargetKey === 'icon' ? 0.52 : 0.1;
        applyImpulseToKeychain(physicsRef.current, radialKick, 0.08, dragTargetKey);
        propsRef.current.onHoverKey(dragTargetKey);
      }
      canvas.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      updatePointerCoords(e.clientX, e.clientY);

      if (isDragging) {
        const dx = e.clientX - prevPointerX;
        const dy = e.clientY - prevPointerY;
        dragDistance += Math.hypot(dx, dy);
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;

        if (propsRef.current.focusedKey) {
          inspectSpinRef.current += dx * 0.012;
        } else {
          if (!dragTargetKey) {
            physicsRef.current.targetYawY += dx * 0.008;
          }
          // Dragging an individual key swings that key directly so it collides with neighbors
          applyImpulseToKeychain(
            physicsRef.current,
            dx * 0.055,
            dy * 0.04,
            dragTargetKey
          );
        }
        return;
      }

      const mdx = hasMoveOrigin ? e.clientX - prevMoveX : 0;
      const mdy = hasMoveOrigin ? e.clientY - prevMoveY : 0;
      prevMoveX = e.clientX;
      prevMoveY = e.clientY;
      hasMoveOrigin = true;

      const now = performance.now();
      if (now - lastRaycastTime < 24) return;
      lastRaycastTime = now;

      const hitKey = pickKeyUnderPointer();
      if (hitKey !== propsRef.current.hoveredKey) {
        if (hitKey) {
          const radialKick = hitKey === 'prince' ? -0.52 : hitKey === 'icon' ? 0.52 : 0.1;
          applyImpulseToKeychain(physicsRef.current, radialKick, 0.08, hitKey);
        }
        propsRef.current.onHoverKey(hitKey);
      } else if (hitKey && !propsRef.current.focusedKey && (Math.abs(mdx) > 1 || Math.abs(mdy) > 1)) {
        // Tactile cursor swipe force onto the touched key so brushing across keys knocks them physically
        applyImpulseToKeychain(
          physicsRef.current,
          mdx * 0.022,
          mdy * 0.014,
          hitKey
        );
      }
      canvas.style.cursor = hitKey ? 'pointer' : 'grab';
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      dragTargetKey = null;
      canvas.releasePointerCapture?.(e.pointerId);
      updatePointerCoords(e.clientX, e.clientY);

      const travel = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
      if (travel < 7 && dragDistance < 10) {
        const hitKey = pickKeyUnderPointer();
        if (hitKey) {
          propsRef.current.onSelectKey(hitKey);
          applyImpulseToKeychain(physicsRef.current, 0.35, -0.1, hitKey);
        } else if (propsRef.current.focusedKey) {
          propsRef.current.onSelectKey(null);
        }
      }
    };

    const onPointerLeave = () => {
      isDragging = false;
      dragTargetKey = null;
      hasMoveOrigin = false;
      pointerNdcX = 0;
      pointerNdcY = 0;
      if (propsRef.current.hoveredKey !== null) {
        propsRef.current.onHoverKey(null);
      }
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };

    const onContextRestored = () => {
      setWebglError(false);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    // Subtle initial welcome swing
    applyImpulseToKeychain(physicsRef.current, 0.25, 0.04, null);

    const tick = () => {
      if (disposed) return;

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const cur = propsRef.current;
      const phys = physicsRef.current;

      stepKeychainPhysics(phys, {
        dt,
        autoSway: cur.autoSway,
        spread: cur.spread,
        hoveredKey: cur.hoveredKey,
        focusedKey: cur.focusedKey,
        pointerNdcX,
        pointerNdcY,
        isDragging,
        ringCenterY: clasp.ringCenterY,
        ringRadius: clasp.ringRadius,
      });

      // Apply rig transforms
      masterAnchor.rotation.z = phys.rigSwingZ;
      masterAnchor.rotation.x = phys.rigPitchX;
      masterAnchor.rotation.y = phys.rigYawY;

      // Apply individual key transforms & focus dimming/lift
      for (const meta of KEYS_CATALOG) {
        const entry = keyEntries[meta.id];
        const kState = phys.keys[meta.id];
        const isFocused = cur.focusedKey === meta.id;
        const anyFocused = cur.focusedKey !== null;

        entry.pivot.rotation.z = kState.swingZ;
        entry.pivot.rotation.x = kState.pitchX;
        entry.pivot.rotation.y =
          kState.twistY + (isFocused ? inspectSpinRef.current : 0);

        const ringPt = getRingAttachmentPoint(
          kState.ringAngle,
          clasp.ringCenterY,
          clasp.ringRadius
        );
        if (anyFocused) {
          const targetX = isFocused ? 0 : ringPt.x;
          const targetY = isFocused ? 0.24 : ringPt.y;
          const targetZ = isFocused ? 0.52 : -1.4;
          entry.pivot.position.x = dampValue(entry.pivot.position.x, targetX, 9, dt);
          entry.pivot.position.y = dampValue(entry.pivot.position.y, targetY, 9, dt);
          entry.pivot.position.z = dampValue(entry.pivot.position.z, targetZ, 9, dt);
        } else {
          // Exact 1:1 sync with physics ring attachment in overview so jump rings & 3D collisions align cleanly
          entry.pivot.position.x = ringPt.x;
          entry.pivot.position.y = ringPt.y;
          entry.pivot.position.z = dampValue(entry.pivot.position.z, 0, 14, dt);
        }

        const targetScale = anyFocused && !isFocused ? 0.58 : 1.0;
        const nextScale = dampValue(entry.pivot.scale.x, targetScale, 8, dt);
        entry.pivot.scale.setScalar(nextScale);
      }

      // Smooth camera framing transition
      const camTarget = getCameraTargetPose(cur.focusedKey, camera.aspect);
      camera.position.x = dampValue(camera.position.x, camTarget.posX, 6.5, dt);
      camera.position.y = dampValue(camera.position.y, camTarget.posY, 6.5, dt);
      camera.position.z = dampValue(camera.position.z, camTarget.posZ, 6.5, dt);

      _lookTarget.x = dampValue(_lookTarget.x, camTarget.lookX, 6.5, dt);
      _lookTarget.y = dampValue(_lookTarget.y, camTarget.lookY, 6.5, dt);
      _lookTarget.z = dampValue(_lookTarget.z, camTarget.lookZ, 6.5, dt);
      camera.lookAt(_lookTarget);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      renderer.render(scene, camera);
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);

      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      for (const g of clasp.geometries) g.dispose();
      for (const g of prince.geometries) g.dispose();
      for (const g of artcode.geometries) g.dispose();
      for (const g of icon.geometries) g.dispose();
      (prince.hitProxy.material as THREE.Material).dispose();
      (artcode.hitProxy.material as THREE.Material).dispose();
      (icon.hitProxy.material as THREE.Material).dispose();

      materials.dispose();
      textures.dispose();
      envTexture.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  if (webglError) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-black px-6 text-center"
        data-testid="webgl-fallback"
      >
        <div className="max-w-md border border-white/15 bg-neutral-950 p-8">
          <p className="font-mono text-xs tracking-widest text-amber-400">
            3D RENDERER UNAVAILABLE
          </p>
          <h2 className="mt-3 font-serif text-3xl text-neutral-100">
            Atelier Keychain Archive
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            WebGL hardware acceleration is disabled in this browser context. Enable WebGL to
            interact with the sculpted 3D keys.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {KEYS_CATALOG.map((item) => (
              <div key={item.id} className="border border-white/10 p-3 text-left">
                <span className="font-mono text-[11px] text-amber-400">
                  {item.indexLabel}
                </span>
                <p className="mt-1 font-serif text-base text-neutral-100">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 h-full w-full select-none touch-none"
      data-testid="keychain-viewport"
      data-webgl-ready={ready ? 'true' : 'false'}
      data-focused-key={props.focusedKey ?? 'none'}
      data-hovered-key={props.hoveredKey ?? 'none'}
    />
  );
}
