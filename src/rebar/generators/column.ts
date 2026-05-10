import * as THREE from 'three';
import { ColumnParams, GeneratedModel, RebarBatch, RebarPath } from '../types';
import { distributeBars } from '../utils';

/**
 * Generate column reinforcement.
 * Local axes: Y = height (column axis), X = b, Z = h.
 */
export function generateColumn(p: ColumnParams): GeneratedModel {
  const rebars: RebarPath[] = [];
  const batches: RebarBatch[] = [];

  const halfHt = p.height / 2;
  const halfB = p.b / 2;
  const halfH = p.h / 2;
  const hookLen = Math.max(10 * p.stirrup.d, 75);

  // ---------- Longitudinal bars: perimeter ring ----------
  const d = p.longBars.d;
  const inset = p.cover + p.stirrup.d + d / 2;
  const xs = distributeBars(p.longBars.perSide, halfB, p.cover + p.stirrup.d, d);
  const zs = distributeBars(p.longBars.perSide, halfH, p.cover + p.stirrup.d, d);
  // Place bars only on perimeter (skip interior of ring)
  const positions: { x: number; z: number }[] = [];
  for (let i = 0; i < xs.length; i++) {
    for (let j = 0; j < zs.length; j++) {
      const onEdge = i === 0 || i === xs.length - 1 || j === 0 || j === zs.length - 1;
      if (onEdge) positions.push({ x: xs[i], z: zs[j] });
    }
  }
  positions.forEach((pos, i) => {
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(pos.x, -halfHt + p.cover, pos.z),
        new THREE.Vector3(pos.x, 0, pos.z),
        new THREE.Vector3(pos.x, halfHt - p.cover, pos.z),
      ],
      false,
      'catmullrom',
      0.0,
    );
    rebars.push({
      id: `col-long-${i}`,
      diameter: d,
      grade: p.longBars.grade,
      role: 'longitudinal',
      curve,
      label: i === 0 ? `纵筋 ${positions.length}Φ${d}` : undefined,
    });
  });
  void inset;

  // ---------- Stirrups along height ----------
  const sw = p.b - 2 * p.cover;
  const sh = p.h - 2 * p.cover;
  const ref = buildStirrupXZ(sw, sh, hookLen);

  const ys: number[] = [];
  const startY = -halfHt + p.cover + 50;
  const endY = halfHt - p.cover - 50;
  // Bottom dense
  let y = startY;
  const denseBotEnd = Math.min(startY + p.stirrup.denseLenBottom, endY);
  while (y <= denseBotEnd) {
    ys.push(y);
    y += p.stirrup.spDense;
  }
  // Normal
  const denseTopStart = Math.max(endY - p.stirrup.denseLenTop, denseBotEnd);
  while (y < denseTopStart) {
    ys.push(y);
    y += p.stirrup.spNormal;
  }
  // Top dense
  while (y <= endY) {
    ys.push(y);
    y += p.stirrup.spDense;
  }
  batches.push({
    key: `col-stirrup-${p.stirrup.d}-${p.stirrup.grade}`,
    diameter: p.stirrup.d,
    grade: p.stirrup.grade,
    role: 'stirrup',
    curve: ref,
    translations: ys.map((yy) => new THREE.Vector3(0, yy, 0)),
    label: `柱箍筋 Φ${p.stirrup.d}@${p.stirrup.spDense}/${p.stirrup.spNormal}`,
  });

  // Composite stirrup (cross): an additional smaller stirrup rotated 90°
  if (p.stirrup.composite === 'cross') {
    const ref2 = buildStirrupXZ(sw * 0.5, sh, hookLen);
    batches.push({
      key: `col-stirrup-cross-${p.stirrup.d}-${p.stirrup.grade}`,
      diameter: p.stirrup.d,
      grade: p.stirrup.grade,
      role: 'stirrup',
      curve: ref2,
      translations: ys.map((yy) => new THREE.Vector3(0, yy, 0)),
      label: `复合箍 Φ${p.stirrup.d}`,
    });
  }

  return {
    concrete: { sizeX: p.b, sizeY: p.height, sizeZ: p.h },
    rebars,
    batches,
  };
}

function buildStirrupXZ(width: number, depth: number, hookLen: number): THREE.CatmullRomCurve3 {
  const w = width / 2;
  const d = depth / 2;
  const r = Math.min(width, depth) * 0.06;
  const pts: THREE.Vector3[] = [];
  pts.push(new THREE.Vector3(-w + r, 0, d));
  pts.push(new THREE.Vector3(w - r, 0, d));
  pts.push(new THREE.Vector3(w, 0, d - r));
  pts.push(new THREE.Vector3(w, 0, -d + r));
  pts.push(new THREE.Vector3(w - r, 0, -d));
  pts.push(new THREE.Vector3(-w + r, 0, -d));
  pts.push(new THREE.Vector3(-w, 0, -d + r));
  pts.push(new THREE.Vector3(-w, 0, d - r));
  pts.push(new THREE.Vector3(-w + r, 0, d));
  // 135° hook
  const hx = -w + r + hookLen * Math.cos(Math.PI / 4);
  const hz = d - hookLen * Math.sin(Math.PI / 4);
  pts.push(new THREE.Vector3(hx, 0, hz));
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.0);
}
