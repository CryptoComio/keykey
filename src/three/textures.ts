import * as THREE from 'three';

export interface ProceduralTextureSet {
  princeColor: THREE.CanvasTexture;
  princeNormal: THREE.DataTexture;
  princeRoughness: THREE.CanvasTexture;
  princeMetalness: THREE.CanvasTexture;
  artCodeColor: THREE.CanvasTexture;
  artCodeNormal: THREE.DataTexture;
  artCodeRoughness: THREE.CanvasTexture;
  artCodeMetalness: THREE.CanvasTexture;
  iconColor: THREE.CanvasTexture;
  iconNormal: THREE.DataTexture;
  iconRoughness: THREE.CanvasTexture;
  iconMetalness: THREE.CanvasTexture;
  goldBronzeColor: THREE.CanvasTexture;
  goldBrushedNormal: THREE.DataTexture;
  goldBrushedRoughness: THREE.CanvasTexture;
  baroqueBronzeColor: THREE.CanvasTexture;
  baroqueNormal: THREE.DataTexture;
  baroqueRoughness: THREE.CanvasTexture;
  chromeBrushedColor: THREE.CanvasTexture;
  chromeBrushedNormal: THREE.DataTexture;
  chromeBrushedRoughness: THREE.CanvasTexture;
  obsidianSatinNormal: THREE.DataTexture;
  obsidianSatinRoughness: THREE.CanvasTexture;
  dispose: () => void;
}

function hash2d(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash2d(ix, iy);
  const b = hash2d(ix + 1, iy);
  const c = hash2d(ix, iy + 1);
  const d = hash2d(ix + 1, iy + 1);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, octaves = 4): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amp * smoothNoise(x * freq, y * freq);
    freq *= 2.02;
    amp *= 0.5;
  }
  return value;
}

/**
 * Tileable periodic noise over integer lattice periods [periodX, periodY].
 * Eliminates cylindrical & wraparound UV seams completely.
 */
function smoothNoisePeriodic(x: number, y: number, periodX: number, periodY: number): number {
  const ix0 = ((Math.floor(x) % periodX) + periodX) % periodX;
  const iy0 = ((Math.floor(y) % periodY) + periodY) % periodY;
  const ix1 = (ix0 + 1) % periodX;
  const iy1 = (iy0 + 1) % periodY;
  const fx = x - Math.floor(x);
  const fy = y - Math.floor(y);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash2d(ix0, iy0);
  const b = hash2d(ix1, iy0);
  const c = hash2d(ix0, iy1);
  const d = hash2d(ix1, iy1);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbmPeriodic(
  u: number,
  v: number,
  basePeriodX: number,
  basePeriodY: number,
  octaves = 4
): number {
  let value = 0;
  let amp = 0.5;
  let mult = 1;
  let weightSum = 0;
  for (let i = 0; i < octaves; i++) {
    const px = basePeriodX * mult;
    const py = basePeriodY * mult;
    value += amp * smoothNoisePeriodic(u * px, v * py, px, py);
    weightSum += amp;
    mult *= 2;
    amp *= 0.5;
  }
  return value / weightSum;
}

/**
 * Converts a grayscale height canvas into a tangent-space RGB normal map DataTexture.
 */
function heightCanvasToNormalTexture(
  canvas: HTMLCanvasElement,
  strength: number,
  maxAnisotropy: number,
  repeatX = 1,
  repeatY = 1
): THREE.DataTexture {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d')!;
  const src = ctx.getImageData(0, 0, w, h).data;
  const out = new Uint8Array(w * h * 4);
  const repeat = repeatX !== 1 || repeatY !== 1;

  const sample = (x: number, y: number): number => {
    const cx = repeat ? ((x % w) + w) % w : Math.max(0, Math.min(w - 1, x));
    const cy = repeat ? ((y % h) + h) % h : Math.max(0, Math.min(h - 1, y));
    return src[(cy * w + cx) * 4] / 255;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tl = sample(x - 1, y - 1);
      const t = sample(x, y - 1);
      const tr = sample(x + 1, y - 1);
      const l = sample(x - 1, y);
      const r = sample(x + 1, y);
      const bl = sample(x - 1, y + 1);
      const b = sample(x, y + 1);
      const br = sample(x + 1, y + 1);

      const dX = (tr + 2 * r + br - (tl + 2 * l + bl)) * strength;
      const dY = (bl + 2 * b + br - (tl + 2 * t + tr)) * strength;
      const nz = 1.0;
      const len = Math.hypot(dX, dY, nz) || 1;

      const outY = h - 1 - y;
      const idx = (outY * w + x) * 4;
      out[idx] = Math.round(((-dX / len) * 0.5 + 0.5) * 255);
      out[idx + 1] = Math.round(((dY / len) * 0.5 + 0.5) * 255);
      out[idx + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
      out[idx + 3] = 255;
    }
  }

  const tex = new THREE.DataTexture(out, w, h, THREE.RGBAFormat);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = maxAnisotropy;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.needsUpdate = true;
  return tex;
}

function drawFlourish(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scaleX: number,
  scaleY: number,
  strokeStyle: string | CanvasGradient,
  fillStyle: string | CanvasGradient
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scaleX, scaleY);

  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.bezierCurveTo(10, -16, 10, -4, 0, 6);
  ctx.bezierCurveTo(-10, -4, -10, -16, 0, -28);
  ctx.fill();

  ctx.strokeStyle = strokeStyle;
  ctx.lineCap = 'round';
  for (const dir of [-1, 1]) {
    ctx.save();
    ctx.scale(dir, 1);

    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.bezierCurveTo(28, -22, 62, -18, 76, 4);
    ctx.bezierCurveTo(84, 16, 70, 26, 58, 18);
    ctx.bezierCurveTo(49, 12, 54, 1, 63, 4);
    ctx.stroke();

    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(14, 6);
    ctx.bezierCurveTo(45, 22, 95, 16, 128, -4);
    ctx.bezierCurveTo(142, -12, 152, -2, 144, 8);
    ctx.stroke();

    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(78, 8);
    ctx.bezierCurveTo(105, 20, 140, 14, 164, 2);
    ctx.stroke();

    ctx.restore();
  }
  ctx.restore();
}

function createBurnishedBronzePattern(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): CanvasGradient {
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  grad.addColorStop(0.0, '#dcc18a');
  grad.addColorStop(0.25, '#bfa065');
  grad.addColorStop(0.5, '#ead19c');
  grad.addColorStop(0.75, '#b89759');
  grad.addColorStop(1.0, '#dec38c');
  return grad;
}

function createEngravedFoilPattern(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): CanvasGradient {
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  grad.addColorStop(0.0, '#f4dfb1');
  grad.addColorStop(0.28, '#e8cd93');
  grad.addColorStop(0.5, '#fff6da');
  grad.addColorStop(0.75, '#e2c384');
  grad.addColorStop(1.0, '#f5e1b4');
  return grad;
}

function drawFittedEngravedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  weight: number,
  sizePx: number,
  family: string,
  strokeWeight = 0
): void {
  let size = sizePx;
  ctx.font = `${weight} ${size}px ${family}`;
  const measured = ctx.measureText(text).width;
  if (measured > maxWidth && measured > 0) {
    size = Math.floor(size * (maxWidth / measured));
    ctx.font = `${weight} ${size}px ${family}`;
  }
  ctx.fillText(text, x, y);
  if (strokeWeight > 0) {
    ctx.save();
    ctx.lineWidth = strokeWeight;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ctx.fillStyle;
    ctx.strokeText(text, x, y);
    ctx.restore();
  }
}

function configureTexture(
  canvas: HTMLCanvasElement,
  isColor: boolean,
  maxAnisotropy: number,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = maxAnisotropy;
  if (repeatX !== 1 || repeatY !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.needsUpdate = true;
  return tex;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d', { willReadFrequently: true })!];
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  // 1. PRINCE ART GALLERY Circular Seal Medallion Plaque (1024x1024) — Guilloché Enamel + Bold Foil
  const pW = 1024;
  const pH = 1024;
  const [pColorCanvas, pCtx] = makeCanvas(pW, pH);
  const [pHeightCanvas, pHeightCtx] = makeCanvas(pW, pH);
  const [pRoughCanvas, pRoughCtx] = makeCanvas(pW, pH);
  const [pMetalCanvas, pMetalCtx] = makeCanvas(pW, pH);

  const pColorImg = pCtx.createImageData(pW, pH);
  const pHeightImg = pHeightCtx.createImageData(pW, pH);
  const pRoughImg = pRoughCtx.createImageData(pW, pH);

  // Baked deep obsidian kiln-enamel over delicate circular guilloché lathe-turning shimmer
  for (let y = 0; y < pH; y++) {
    const ny = (y - pH / 2) / (pH * 0.5);
    for (let x = 0; x < pW; x++) {
      const nx = (x - pW / 2) / (pW * 0.5);
      const radial = Math.hypot(nx, ny);
      const theta = Math.atan2(ny, nx);
      const guilloche =
        Math.sin(radial * 32 + Math.sin(theta * 12) * 1.1) * 0.5 + 0.5;
      const glaze = fbm(x * 0.012, y * 0.012, 3);
      const vignette = Math.max(0, 1 - radial * 0.72);

      const cLum = Math.round(5 + vignette * 6 + guilloche * 1.2 + glaze * 2.2);
      const hVal = Math.round(48 + guilloche * 4.5 + glaze * 5.5);
      const rVal = Math.round(16 + (1 - guilloche) * 5 + glaze * 8);

      const idx = (y * pW + x) * 4;
      pColorImg.data[idx] = cLum;
      pColorImg.data[idx + 1] = cLum + 1;
      pColorImg.data[idx + 2] = cLum + 3;
      pColorImg.data[idx + 3] = 255;

      pHeightImg.data[idx] = pHeightImg.data[idx + 1] = pHeightImg.data[idx + 2] = hVal;
      pHeightImg.data[idx + 3] = 255;

      pRoughImg.data[idx] = pRoughImg.data[idx + 1] = pRoughImg.data[idx + 2] = rVal;
      pRoughImg.data[idx + 3] = 255;
    }
  }
  pCtx.putImageData(pColorImg, 0, 0);
  pHeightCtx.putImageData(pHeightImg, 0, 0);
  pRoughCtx.putImageData(pRoughImg, 0, 0);

  pMetalCtx.fillStyle = '#040404';
  pMetalCtx.fillRect(0, 0, pW, pH);

  const pBronze = createBurnishedBronzePattern(pCtx, 100, 100, pW - 100, pH - 100);

  const traceCircleInset = (ctx: CanvasRenderingContext2D, inset: number) => {
    ctx.beginPath();
    ctx.arc(pW / 2, pH / 2, pW / 2 - inset, 0, Math.PI * 2);
  };

  for (const [ctx, stroke, lw] of [
    [pCtx, pBronze, 7],
    [pHeightCtx, '#ffffff', 7],
    [pRoughCtx, '#424242', 7],
    [pMetalCtx, '#f2f2f2', 7],
  ] as const) {
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    traceCircleInset(ctx, 42);
    ctx.stroke();
    ctx.lineWidth = 2.8;
    traceCircleInset(ctx, 64);
    ctx.stroke();
    ctx.restore();
  }

  drawFlourish(pCtx, pW / 2, 138, 0.6, 0.6, pBronze, pBronze);
  drawFlourish(pCtx, pW / 2, pH - 138, 0.6, -0.6, pBronze, pBronze);
  drawFlourish(pHeightCtx, pW / 2, 138, 0.6, 0.6, '#ffffff', '#ffffff');
  drawFlourish(pHeightCtx, pW / 2, pH - 138, 0.6, -0.6, '#ffffff', '#ffffff');
  drawFlourish(pRoughCtx, pW / 2, 138, 0.6, 0.6, '#444444', '#444444');
  drawFlourish(pRoughCtx, pW / 2, pH - 138, 0.6, -0.6, '#444444', '#444444');
  drawFlourish(pMetalCtx, pW / 2, 138, 0.6, 0.6, '#f2f2f2', '#f2f2f2');
  drawFlourish(pMetalCtx, pW / 2, pH - 138, 0.6, -0.6, '#f2f2f2', '#f2f2f2');

  const drawPrinceText = (
    ctx: CanvasRenderingContext2D,
    fill: string | CanvasGradient,
    cavityShadow = false
  ) => {
    ctx.save();
    if (cavityShadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.92)';
      ctx.shadowBlur = 9;
      ctx.shadowOffsetY = 2;
    }
    ctx.fillStyle = fill;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '600 32px "DM Sans", sans-serif';
    ctx.fillText('01', pW / 2, 86);
    ctx.font = '600 24px "DM Sans", sans-serif';
    ctx.fillText('N° 01', pW / 2, pH - 86);

    // Huge bold transversal typography inside 1024x1024 circular cameo with crisp border margin
    ctx.save();
    ctx.translate(pW * 0.495, pH * 0.50);
    ctx.rotate(-Math.PI / 2);
    drawFittedEngravedText(
      ctx,
      'PRINCE',
      0,
      -58,
      690,
      700,
      178,
      '"Cormorant Garamond", Georgia, serif',
      1.2
    );
    drawFittedEngravedText(
      ctx,
      'ART GALLERY',
      0,
      64,
      690,
      800,
      110,
      '"DM Sans", sans-serif',
      2.2
    );
    ctx.restore();

    ctx.restore();
  };
  const pFoil = createEngravedFoilPattern(pCtx, 120, 160, pW - 120, pH - 160);
  drawPrinceText(pCtx, pFoil, true);
  drawPrinceText(pHeightCtx, '#ffffff');
  drawPrinceText(pRoughCtx, '#2a2a2a');
  drawPrinceText(pMetalCtx, '#f6f6f6');

  // 2. ART CODE Stadium Capsule Blade (720x1440) — Satin Obsidian Slate + Bold Transversal Foil
  const aW = 720;
  const aH = 1440;
  const [aColorCanvas, aCtx] = makeCanvas(aW, aH);
  const [aHeightCanvas, aHeightCtx] = makeCanvas(aW, aH);
  const [aRoughCanvas, aRoughCtx] = makeCanvas(aW, aH);
  const [aMetalCanvas, aMetalCtx] = makeCanvas(aW, aH);

  const aColorImg = aCtx.createImageData(aW, aH);
  const aHeightImg = aHeightCtx.createImageData(aW, aH);
  const aRoughImg = aRoughCtx.createImageData(aW, aH);

  for (let y = 0; y < aH; y++) {
    const vNorm = y / aH;
    const bandBrush = smoothNoise(0.5, y * 0.14) - 0.5;
    for (let x = 0; x < aW; x++) {
      const fineBrush = smoothNoise(x * 0.025, y * 0.18) - 0.5;
      const slate = fbm(x * 0.014, y * 0.014, 3);
      const gradientTone = (1 - vNorm * 0.55) * 7;

      const cLum = Math.max(
        5,
        Math.min(22, Math.round(8 + gradientTone + slate * 4 + (fineBrush + bandBrush) * 2.2))
      );
      const hVal = Math.max(
        34,
        Math.min(62, Math.round(46 + fineBrush * 7 + bandBrush * 5 + slate * 7))
      );
      const rVal = Math.max(
        34,
        Math.min(74, Math.round(46 + (1 - slate) * 18 + Math.abs(fineBrush) * 8))
      );

      const idx = (y * aW + x) * 4;
      aColorImg.data[idx] = cLum;
      aColorImg.data[idx + 1] = cLum + 1;
      aColorImg.data[idx + 2] = cLum + 3;
      aColorImg.data[idx + 3] = 255;

      aHeightImg.data[idx] = aHeightImg.data[idx + 1] = aHeightImg.data[idx + 2] = hVal;
      aHeightImg.data[idx + 3] = 255;

      aRoughImg.data[idx] = aRoughImg.data[idx + 1] = aRoughImg.data[idx + 2] = rVal;
      aRoughImg.data[idx + 3] = 255;
    }
  }
  aCtx.putImageData(aColorImg, 0, 0);
  aHeightCtx.putImageData(aHeightImg, 0, 0);
  aRoughCtx.putImageData(aRoughImg, 0, 0);

  aMetalCtx.fillStyle = '#080808';
  aMetalCtx.fillRect(0, 0, aW, aH);

  const traceCapsuleInset = (ctx: CanvasRenderingContext2D, inset: number) => {
    const x0 = inset;
    const x1 = aW - inset;
    const rad = (x1 - x0) / 2;
    const topCy = inset + rad;
    const botCy = aH - inset - rad;
    ctx.beginPath();
    ctx.arc(aW / 2, topCy, rad, Math.PI, 0, false);
    ctx.lineTo(x1, botCy);
    ctx.arc(aW / 2, botCy, rad, 0, Math.PI, false);
    ctx.closePath();
  };

  const drawArtCodeDetails = (
    ctx: CanvasRenderingContext2D,
    fill: string | CanvasGradient,
    cavityShadow = false
  ) => {
    ctx.save();
    ctx.strokeStyle = fill;
    ctx.fillStyle = fill;

    ctx.lineWidth = 4;
    traceCapsuleInset(ctx, 36);
    ctx.stroke();
    ctx.lineWidth = 2;
    traceCapsuleInset(ctx, 56);
    ctx.stroke();

    // Precision drafting ticks along straight capsule flanks
    ctx.lineWidth = 2.2;
    for (let ry = 420; ry <= aH - 420; ry += 40) {
      const len = ry % 160 === 0 ? 22 : 11;
      ctx.beginPath();
      ctx.moveTo(aW - 56 - len, ry);
      ctx.lineTo(aW - 56, ry);
      ctx.stroke();
    }

    const cx = aW / 2;
    const cy = 152;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.moveTo(cx - 35, cy);
    ctx.lineTo(cx + 35, cy);
    ctx.moveTo(cx, cy - 35);
    ctx.lineTo(cx, cy + 35);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 40px "DM Sans", sans-serif';
    ctx.fillText('02', cx, 220);

    if (cavityShadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.92)';
      ctx.shadowBlur = 9;
      ctx.shadowOffsetY = 2;
    }
    ctx.save();
    ctx.translate(aW * 0.5, aH * 0.55);
    ctx.rotate(-Math.PI / 2);
    drawFittedEngravedText(
      ctx,
      'ART CODE',
      0,
      -68,
      890,
      700,
      186,
      '"Cormorant Garamond", Georgia, serif',
      1.2
    );
    drawFittedEngravedText(
      ctx,
      "CASA D'ASTE",
      0,
      72,
      860,
      800,
      116,
      '"DM Sans", sans-serif',
      2.2
    );
    ctx.restore();

    ctx.restore();
  };
  const aFoil = createEngravedFoilPattern(aCtx, 70, 180, aW - 70, aH - 180);
  drawArtCodeDetails(aCtx, aFoil, true);
  drawArtCodeDetails(aHeightCtx, '#ffffff');
  drawArtCodeDetails(aRoughCtx, '#2a2a2a');
  drawArtCodeDetails(aMetalCtx, '#f6f6f6');

  // 3. ICON ART MAGAZINE Broad Hardcover Folio Cover (860x1420) — Woven Linen + Enlarged Title
  const iW = 860;
  const iH = 1420;
  const [iColorCanvas, iCtx] = makeCanvas(iW, iH);
  const [iHeightCanvas, iHeightCtx] = makeCanvas(iW, iH);
  const [iRoughCanvas, iRoughCtx] = makeCanvas(iW, iH);
  const [iMetalCanvas, iMetalCtx] = makeCanvas(iW, iH);

  const iColorImg = iCtx.createImageData(iW, iH);
  const iHeightImg = iHeightCtx.createImageData(iW, iH);
  const iRoughImg = iRoughCtx.createImageData(iW, iH);

  // Smooth organic textile linen bookcloth (continuous slub warp/weft with zero moiré diagonal bands)
  for (let y = 0; y < iH; y++) {
    const weftSlub = smoothNoise(0.25, y * 0.18);
    const weftWave = Math.sin(y * 0.52) * 0.5 + 0.5;
    for (let x = 0; x < iW; x++) {
      const warpSlub = smoothNoise(x * 0.18, 0.25);
      const warpWave = Math.sin(x * 0.52) * 0.5 + 0.5;
      const cross = smoothNoise(x * 0.08, y * 0.08);
      const weave = warpSlub * 0.32 + weftSlub * 0.32 + (warpWave * 0.18 + weftWave * 0.18) * 0.55 + cross * 0.18;
      const mottle = fbm(x * 0.011, y * 0.011, 3);

      const baseLum = Math.max(10, Math.min(28, Math.round(13 + weave * 7 + mottle * 6)));
      const hVal = Math.max(32, Math.min(64, Math.round(38 + weave * 14 + mottle * 8)));
      // Matte textile bookcloth roughness (~0.64..0.86)
      const rVal = Math.max(158, Math.min(224, Math.round(168 + (1 - weave) * 34 + mottle * 18)));

      const idx = (y * iW + x) * 4;
      iColorImg.data[idx] = baseLum;
      iColorImg.data[idx + 1] = baseLum + 1;
      iColorImg.data[idx + 2] = baseLum + 3;
      iColorImg.data[idx + 3] = 255;

      iHeightImg.data[idx] = iHeightImg.data[idx + 1] = iHeightImg.data[idx + 2] = hVal;
      iHeightImg.data[idx + 3] = 255;

      iRoughImg.data[idx] = iRoughImg.data[idx + 1] = iRoughImg.data[idx + 2] = rVal;
      iRoughImg.data[idx + 3] = 255;
    }
  }
  iCtx.putImageData(iColorImg, 0, 0);
  iHeightCtx.putImageData(iHeightImg, 0, 0);
  iRoughCtx.putImageData(iRoughImg, 0, 0);

  iMetalCtx.fillStyle = '#000000';
  iMetalCtx.fillRect(0, 0, iW, iH);

  // Subtle debossed spine hinge crease
  const spineGrad = iCtx.createLinearGradient(31, 0, 81, 0);
  spineGrad.addColorStop(0, 'rgba(255,255,255,0.0)');
  spineGrad.addColorStop(0.45, 'rgba(255,255,255,0.07)');
  spineGrad.addColorStop(1, 'rgba(0,0,0,0.66)');
  iCtx.fillStyle = spineGrad;
  iCtx.fillRect(31, 31, 50, iH - 62);

  iHeightCtx.fillStyle = '#121212';
  iHeightCtx.fillRect(50, 31, 9, iH - 62);

  const iBronze = createBurnishedBronzePattern(iCtx, 44, 65, iW - 44, iH - 65);

  iCtx.strokeStyle = iBronze;
  iCtx.lineWidth = 6.5;
  iCtx.strokeRect(22, 22, iW - 44, iH - 44);
  iHeightCtx.strokeStyle = '#f2f2f2';
  iHeightCtx.lineWidth = 6.5;
  iHeightCtx.strokeRect(22, 22, iW - 44, iH - 44);
  iRoughCtx.strokeStyle = '#383838';
  iRoughCtx.lineWidth = 6.5;
  iRoughCtx.strokeRect(22, 22, iW - 44, iH - 44);
  iMetalCtx.strokeStyle = '#f2f2f2';
  iMetalCtx.lineWidth = 6.5;
  iMetalCtx.strokeRect(22, 22, iW - 44, iH - 44);

  const drawIconCoverText = (
    ctx: CanvasRenderingContext2D,
    fill: string | CanvasGradient,
    cavityShadow = false
  ) => {
    ctx.save();
    if (cavityShadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
    }
    ctx.fillStyle = fill;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '600 38px "DM Sans", sans-serif';
    ctx.fillText('03', iW * 0.54, 68);

    ctx.save();
    ctx.translate(iW * 0.52, 504);
    ctx.rotate(-Math.PI / 2);
    drawFittedEngravedText(
      ctx,
      'IconArt',
      0,
      -68,
      780,
      700,
      202,
      '"Cormorant Garamond", Georgia, serif',
      1.2
    );
    drawFittedEngravedText(
      ctx,
      'MAGAZINE',
      0,
      72,
      750,
      800,
      122,
      '"DM Sans", sans-serif',
      2.2
    );
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.font = '600 28px "DM Sans", sans-serif';
    ctx.fillText('SPECIAL ISSUE', 96, iH - 76);
    ctx.globalAlpha = 0.85;
    ctx.fillRect(96, iH - 50, 210, 2.8);
    ctx.globalAlpha = 1;

    ctx.textAlign = 'right';
    ctx.font = '700 44px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('N°01', iW - 96, iH - 70);
    ctx.restore();
  };
  const iFoil = createEngravedFoilPattern(iCtx, 65, 88, iW - 65, iH - 88);
  drawIconCoverText(iCtx, iFoil, true);
  drawIconCoverText(iHeightCtx, '#ffffff');
  drawIconCoverText(iRoughCtx, '#2a2a2a');
  drawIconCoverText(iMetalCtx, '#f6f6f6');

  // Smooth satin enamel recess directly underneath the 3D Bauhaus bronze relief (UV-matched to coverPlane 0.816 x 1.356)
  const gx = 291;
  const gy = 964;
  const gw = 311;
  const gh = 309;
  iCtx.fillStyle = '#07080b';
  iCtx.fillRect(gx, gy, gw, gh);
  iHeightCtx.fillStyle = '#282828';
  iHeightCtx.fillRect(gx, gy, gw, gh);
  iRoughCtx.fillStyle = '#222222';
  iRoughCtx.fillRect(gx, gy, gw, gh);

  // 4. Seamless Tileable Brushed Satin Bronze-Gold Map (512x512, repeat 3x3)
  const bSize = 512;
  const [bColorCanvas, bColorCtx] = makeCanvas(bSize, bSize);
  const [bHeightCanvas, bHeightCtx] = makeCanvas(bSize, bSize);
  const [bRoughCanvas, bRoughCtx] = makeCanvas(bSize, bSize);

  const bColorImg = bColorCtx.createImageData(bSize, bSize);
  const bHeightImg = bHeightCtx.createImageData(bSize, bSize);
  const bRoughImg = bRoughCtx.createImageData(bSize, bSize);

  for (let y = 0; y < bSize; y++) {
    const v = y / bSize;
    for (let x = 0; x < bSize; x++) {
      const u = x / bSize;
      // Seamless stretched horizontal anisotropic hairlines + subtle warm alloy variation
      const brushFine = fbmPeriodic(u, v, 4, 96, 3) - 0.5;
      const brushMicro = smoothNoisePeriodic(u * 12, v * 192, 12, 192) - 0.5;
      const patina = fbmPeriodic(u, v, 4, 4, 4) - 0.5;
      const lum = 0.5 + brushFine * 0.24 + brushMicro * 0.14 + patina * 0.24;

      // Rich burnished bronze-gold (#9c7b42 -> #dfc082)
      const r = Math.max(95, Math.min(230, Math.round(146 + lum * 72)));
      const g = Math.max(72, Math.min(198, Math.round(114 + lum * 62)));
      const b = Math.max(36, Math.min(126, Math.round(58 + lum * 40)));

      const hVal = Math.max(30, Math.min(225, Math.round(128 + brushFine * 75 + brushMicro * 45 + patina * 18)));
      // Satin brushed roughness ~0.16..0.34 for lively specular roll-off
      const rVal = Math.max(40, Math.min(92, Math.round(56 + (1 - lum) * 32)));

      const idx = (y * bSize + x) * 4;
      bColorImg.data[idx] = r;
      bColorImg.data[idx + 1] = g;
      bColorImg.data[idx + 2] = b;
      bColorImg.data[idx + 3] = 255;

      bHeightImg.data[idx] = bHeightImg.data[idx + 1] = bHeightImg.data[idx + 2] = hVal;
      bHeightImg.data[idx + 3] = 255;

      bRoughImg.data[idx] = bRoughImg.data[idx + 1] = bRoughImg.data[idx + 2] = rVal;
      bRoughImg.data[idx + 3] = 255;
    }
  }
  bColorCtx.putImageData(bColorImg, 0, 0);
  bHeightCtx.putImageData(bHeightImg, 0, 0);
  bRoughCtx.putImageData(bRoughImg, 0, 0);

  // 5. Seamless Tileable Lost-Wax Cast Antiqued Bronze Map (512x512, repeat 2.5x2.5)
  const barSize = 512;
  const [barColorCanvas, barColorCtx] = makeCanvas(barSize, barSize);
  const [barHeightCanvas, barHeightCtx] = makeCanvas(barSize, barSize);
  const [barRoughCanvas, barRoughCtx] = makeCanvas(barSize, barSize);

  const barColorImg = barColorCtx.createImageData(barSize, barSize);
  const barHeightImg = barHeightCtx.createImageData(barSize, barSize);
  const barRoughImg = barRoughCtx.createImageData(barSize, barSize);

  for (let y = 0; y < barSize; y++) {
    const v = y / barSize;
    for (let x = 0; x < barSize; x++) {
      const u = x / barSize;
      const macro = fbmPeriodic(u, v, 6, 6, 4);
      const stipple = fbmPeriodic(u, v, 32, 32, 3);
      const cast = macro * 0.58 + stipple * 0.42;

      // Burnished antique bronze ridges vs warm oxidized patina crevices
      const r = Math.max(76, Math.min(214, Math.round(108 + cast * 96)));
      const g = Math.max(56, Math.min(178, Math.round(80 + cast * 78)));
      const b = Math.max(28, Math.min(108, Math.round(40 + cast * 48)));

      const hVal = Math.max(16, Math.min(240, Math.round(54 + cast * 165)));
      const rVal = Math.max(56, Math.min(138, Math.round(126 - cast * 64)));

      const idx = (y * barSize + x) * 4;
      barColorImg.data[idx] = r;
      barColorImg.data[idx + 1] = g;
      barColorImg.data[idx + 2] = b;
      barColorImg.data[idx + 3] = 255;

      barHeightImg.data[idx] = barHeightImg.data[idx + 1] = barHeightImg.data[idx + 2] = hVal;
      barHeightImg.data[idx + 3] = 255;

      barRoughImg.data[idx] = barRoughImg.data[idx + 1] = barRoughImg.data[idx + 2] = rVal;
      barRoughImg.data[idx + 3] = 255;
    }
  }
  barColorCtx.putImageData(barColorImg, 0, 0);
  barHeightCtx.putImageData(barHeightImg, 0, 0);
  barRoughCtx.putImageData(barRoughImg, 0, 0);

  // 6. Seamless Tileable Brushed Surgical Steel / Chrome Clasp Map (512x512, repeat 3x3)
  const cSize = 512;
  const [cColorCanvas, cColorCtx] = makeCanvas(cSize, cSize);
  const [cHeightCanvas, cHeightCtx] = makeCanvas(cSize, cSize);
  const [cRoughCanvas, cRoughCtx] = makeCanvas(cSize, cSize);
  const cColorImg = cColorCtx.createImageData(cSize, cSize);
  const cHeightImg = cHeightCtx.createImageData(cSize, cSize);
  const cRoughImg = cRoughCtx.createImageData(cSize, cSize);

  for (let y = 0; y < cSize; y++) {
    const v = y / cSize;
    for (let x = 0; x < cSize; x++) {
      const u = x / cSize;
      const brush = fbmPeriodic(u, v, 4, 112, 3) - 0.5;
      const mottle = fbmPeriodic(u, v, 5, 5, 3) - 0.5;
      const val = Math.max(185, Math.min(246, Math.round(218 + brush * 26 + mottle * 16)));
      const hVal = Math.max(40, Math.min(220, Math.round(128 + brush * 90 + mottle * 20)));
      const rv = Math.max(32, Math.min(78, Math.round(48 - brush * 22 - mottle * 14)));

      const idx = (y * cSize + x) * 4;
      cColorImg.data[idx] = val;
      cColorImg.data[idx + 1] = Math.min(255, val + 2);
      cColorImg.data[idx + 2] = Math.min(255, val + 5);
      cColorImg.data[idx + 3] = 255;

      cHeightImg.data[idx] = cHeightImg.data[idx + 1] = cHeightImg.data[idx + 2] = hVal;
      cHeightImg.data[idx + 3] = 255;

      cRoughImg.data[idx] = cRoughImg.data[idx + 1] = cRoughImg.data[idx + 2] = rv;
      cRoughImg.data[idx + 3] = 255;
    }
  }
  cColorCtx.putImageData(cColorImg, 0, 0);
  cHeightCtx.putImageData(cHeightImg, 0, 0);
  cRoughCtx.putImageData(cRoughImg, 0, 0);

  // 7. Seamless Micro-Beadblasted Onyx / Satin Obsidian Map (256x256, repeat 3x3)
  const oSize = 256;
  const [oHeightCanvas, oHeightCtx] = makeCanvas(oSize, oSize);
  const [oRoughCanvas, oRoughCtx] = makeCanvas(oSize, oSize);
  const oHeightImg = oHeightCtx.createImageData(oSize, oSize);
  const oRoughImg = oRoughCtx.createImageData(oSize, oSize);

  for (let y = 0; y < oSize; y++) {
    const v = y / oSize;
    for (let x = 0; x < oSize; x++) {
      const u = x / oSize;
      const grain = fbmPeriodic(u, v, 32, 32, 3);
      const hVal = Math.round(70 + grain * 110);
      const rVal = Math.round(88 + (1 - grain) * 48); // ~0.34..0.53 satin mineral sheen
      const idx = (y * oSize + x) * 4;
      oHeightImg.data[idx] = oHeightImg.data[idx + 1] = oHeightImg.data[idx + 2] = hVal;
      oHeightImg.data[idx + 3] = 255;
      oRoughImg.data[idx] = oRoughImg.data[idx + 1] = oRoughImg.data[idx + 2] = rVal;
      oRoughImg.data[idx + 3] = 255;
    }
  }
  oHeightCtx.putImageData(oHeightImg, 0, 0);
  oRoughCtx.putImageData(oRoughImg, 0, 0);

  const princeColor = configureTexture(pColorCanvas, true, maxAnisotropy);
  const princeNormal = heightCanvasToNormalTexture(pHeightCanvas, 2.75, maxAnisotropy);
  const princeRoughness = configureTexture(pRoughCanvas, false, maxAnisotropy);
  const princeMetalness = configureTexture(pMetalCanvas, false, maxAnisotropy);

  const artCodeColor = configureTexture(aColorCanvas, true, maxAnisotropy);
  const artCodeNormal = heightCanvasToNormalTexture(aHeightCanvas, 2.5, maxAnisotropy);
  const artCodeRoughness = configureTexture(aRoughCanvas, false, maxAnisotropy);
  const artCodeMetalness = configureTexture(aMetalCanvas, false, maxAnisotropy);

  const iconColor = configureTexture(iColorCanvas, true, maxAnisotropy);
  const iconNormal = heightCanvasToNormalTexture(iHeightCanvas, 2.45, maxAnisotropy);
  const iconRoughness = configureTexture(iRoughCanvas, false, maxAnisotropy);
  const iconMetalness = configureTexture(iMetalCanvas, false, maxAnisotropy);

  const goldBronzeColor = configureTexture(bColorCanvas, true, maxAnisotropy, 3, 3);
  const goldBrushedNormal = heightCanvasToNormalTexture(bHeightCanvas, 1.7, maxAnisotropy, 3, 3);
  const goldBrushedRoughness = configureTexture(bRoughCanvas, false, maxAnisotropy, 3, 3);

  const baroqueBronzeColor = configureTexture(barColorCanvas, true, maxAnisotropy, 2.5, 2.5);
  const baroqueNormal = heightCanvasToNormalTexture(barHeightCanvas, 2.45, maxAnisotropy, 2.5, 2.5);
  const baroqueRoughness = configureTexture(barRoughCanvas, false, maxAnisotropy, 2.5, 2.5);

  const chromeBrushedColor = configureTexture(cColorCanvas, true, maxAnisotropy, 3, 3);
  const chromeBrushedNormal = heightCanvasToNormalTexture(cHeightCanvas, 1.5, maxAnisotropy, 3, 3);
  const chromeBrushedRoughness = configureTexture(cRoughCanvas, false, maxAnisotropy, 3, 3);

  const obsidianSatinNormal = heightCanvasToNormalTexture(oHeightCanvas, 1.4, maxAnisotropy, 3, 3);
  const obsidianSatinRoughness = configureTexture(oRoughCanvas, false, maxAnisotropy, 3, 3);

  return {
    princeColor,
    princeNormal,
    princeRoughness,
    princeMetalness,
    artCodeColor,
    artCodeNormal,
    artCodeRoughness,
    artCodeMetalness,
    iconColor,
    iconNormal,
    iconRoughness,
    iconMetalness,
    goldBronzeColor,
    goldBrushedNormal,
    goldBrushedRoughness,
    baroqueBronzeColor,
    baroqueNormal,
    baroqueRoughness,
    chromeBrushedColor,
    chromeBrushedNormal,
    chromeBrushedRoughness,
    obsidianSatinNormal,
    obsidianSatinRoughness,
    dispose: () => {
      princeColor.dispose();
      princeNormal.dispose();
      princeRoughness.dispose();
      princeMetalness.dispose();
      artCodeColor.dispose();
      artCodeNormal.dispose();
      artCodeRoughness.dispose();
      artCodeMetalness.dispose();
      iconColor.dispose();
      iconNormal.dispose();
      iconRoughness.dispose();
      iconMetalness.dispose();
      goldBronzeColor.dispose();
      goldBrushedNormal.dispose();
      goldBrushedRoughness.dispose();
      baroqueBronzeColor.dispose();
      baroqueNormal.dispose();
      baroqueRoughness.dispose();
      chromeBrushedColor.dispose();
      chromeBrushedNormal.dispose();
      chromeBrushedRoughness.dispose();
      obsidianSatinNormal.dispose();
      obsidianSatinRoughness.dispose();
    },
  };
}
