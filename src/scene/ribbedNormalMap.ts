import * as THREE from 'three';

/**
 * Procedurally generate a normal map that simulates the横肋 (transverse ribs)
 * pattern of HRB (deformed) reinforcement bars.
 *
 * Pattern: a series of slanted ridges along V (around-the-bar direction)
 * repeated along U (along-the-bar direction). Tube UVs put U along the curve
 * and V around the cross-section, so we slant ridges along V to look like ribs
 * wrapping the bar.
 */
let cached: THREE.Texture | null = null;

export function getRibbedNormalMap(): THREE.Texture {
  if (cached) return cached;

  const W = 256;
  const H = 64;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Build a height map first.
  const height = new Float32Array(W * H);
  const ribCount = 16; // number of ribs along U
  const slant = 0.25;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Slanted U coordinate
      const u = (x / W) + slant * (y / H);
      const phase = (u * ribCount) % 1;
      // Smooth ridge
      let h = Math.cos((phase - 0.5) * Math.PI * 2);
      h = Math.max(0, h); // only ridges, no valleys below 0
      // Add a longitudinal rib (one continuous ridge along U at v=0.5)
      const longRib = Math.exp(-Math.pow((y - H / 2) / (H * 0.06), 2));
      h = Math.max(h * 0.7, longRib * 0.9);
      height[y * W + x] = h;
    }
  }

  // Sobel-like gradient -> normal
  const img = ctx.createImageData(W, H);
  const get = (x: number, y: number) => height[((y + H) % H) * W + ((x + W) % W)];
  const strength = 4.0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (get(x + 1, y) - get(x - 1, y)) * strength;
      const dy = (get(x, y + 1) - get(x, y - 1)) * strength;
      const nx = -dx;
      const ny = -dy;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const i = (y * W + x) * 4;
      img.data[i] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      img.data[i + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      img.data[i + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  cached = tex;
  return tex;
}
