import * as THREE from 'three';

/**
 * Generates a high-contrast photographic jewelry studio environment map using
 * dark negative-fill walls paired with crisp feathered softboxes passed into PMREMGenerator.
 * Creates authentic metallic light-to-shadow roll-off along bevels, flutes,
 * coiled jump rings, and engraved gold foil without harsh CG artifacts.
 */
export function createJewelryStudioEnv(renderer: THREE.WebGLRenderer): THREE.Texture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep velvety studio cyclorama with negative-fill contrast so bronze & steel gleams cleanly
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0.0, '#464a54');
  bg.addColorStop(0.24, '#25272e');
  bg.addColorStop(0.52, '#131418');
  bg.addColorStop(0.78, '#1e1a14');
  bg.addColorStop(1.0, '#120f0b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const drawSoftbox = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    innerRgba: string,
    midRgba: string
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, ry / rx);
    const grad = ctx.createRadialGradient(0, 0, rx * 0.06, 0, 0, rx);
    grad.addColorStop(0, innerRgba);
    grad.addColorStop(0.42, midRgba);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Sculpted dark negative-fill pillars create distinct metallic reflections along curved bezels
  const drawNegativeCard = (x: number, y: number, cardW: number, cardH: number) => {
    const grad = ctx.createLinearGradient(x, y, x + cardW, y);
    grad.addColorStop(0, 'rgba(8,8,10,0)');
    grad.addColorStop(0.25, 'rgba(8,8,10,0.78)');
    grad.addColorStop(0.75, 'rgba(8,8,10,0.78)');
    grad.addColorStop(1, 'rgba(8,8,10,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, cardW, cardH);
  };

  ctx.globalCompositeOperation = 'lighter';

  // Crisp overhead studio softbox ceiling canopy
  drawSoftbox(w * 0.5, h * 0.12, 340, 96, 'rgba(255, 250, 238, 1.0)', 'rgba(232, 222, 202, 0.52)');
  drawSoftbox(w * 0.16, h * 0.15, 230, 82, 'rgba(255, 248, 230, 0.88)', 'rgba(218, 210, 196, 0.34)');
  drawSoftbox(w * 0.84, h * 0.15, 230, 82, 'rgba(240, 245, 255, 0.85)', 'rgba(205, 215, 232, 0.34)');

  // High-contrast Left & Right vertical strip softboxes (warm champagne left, cool pearl right)
  drawSoftbox(w * 0.33, h * 0.44, 130, 210, 'rgba(255, 245, 220, 1.0)', 'rgba(235, 206, 158, 0.50)');
  drawSoftbox(w * 0.67, h * 0.45, 130, 210, 'rgba(234, 242, 255, 0.96)', 'rgba(180, 200, 228, 0.44)');

  // Focused frontal oblique reflectors (+Z hemisphere) for cameo & key blade enamel speculars
  drawSoftbox(w * 0.23, h * 0.42, 160, 145, 'rgba(248, 244, 234, 0.86)', 'rgba(176, 178, 184, 0.30)');
  drawSoftbox(w * 0.77, h * 0.42, 160, 145, 'rgba(238, 244, 252, 0.82)', 'rgba(168, 178, 192, 0.28)');

  // Warm gold rim kickers & lower warm champagne bounce
  drawSoftbox(w * 0.04, h * 0.48, 140, 175, 'rgba(255, 220, 155, 0.88)', 'rgba(198, 154, 90, 0.32)');
  drawSoftbox(w * 0.96, h * 0.48, 140, 175, 'rgba(214, 228, 248, 0.82)', 'rgba(144, 164, 196, 0.28)');
  drawSoftbox(w * 0.5, h * 0.86, 400, 88, 'rgba(195, 156, 98, 0.58)', 'rgba(118, 86, 48, 0.22)');

  ctx.globalCompositeOperation = 'source-over';

  // Crisp negative-fill studio flags between strip lights for dramatic dark-to-gold edge contrast
  drawNegativeCard(w * 0.43, h * 0.24, w * 0.14, h * 0.52);
  drawNegativeCard(w * 0.12, h * 0.26, w * 0.08, h * 0.46);
  drawNegativeCard(w * 0.80, h * 0.26, w * 0.08, h * 0.46);

  const equirect = new THREE.CanvasTexture(canvas);
  equirect.mapping = THREE.EquirectangularReflectionMapping;
  equirect.colorSpace = THREE.SRGBColorSpace;
  equirect.needsUpdate = true;

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const target = pmrem.fromEquirectangular(equirect);

  equirect.dispose();
  pmrem.dispose();

  return target.texture;
}
