import * as THREE from 'three';
import { Grade, RebarRole } from './types';

/** Anchorage length laE (mm) — simplified table for C30 concrete, common grades. */
export const LAE_TABLE: Record<Grade, number> = {
  HPB300: 35,
  HRB400: 40,
  HRB500: 48,
};

/** Compute simplified anchorage length in mm for given diameter. */
export function laE(grade: Grade, d: number): number {
  return LAE_TABLE[grade] * d;
}

export const ROLE_COLOR: Record<RebarRole, number> = {
  longitudinal: 0xff5a3c, // 红
  stirrup: 0x3aa3ff, // 蓝
  distribution: 0x9aa0a6, // 灰
  erection: 0xffd166, // 黄
  tie: 0xa78bfa, // 紫
  waist: 0x06d6a0, // 绿
};

/**
 * Build a rectangular stirrup curve in the local XY plane (Z = const).
 * Origin at rectangle center. Returns CatmullRomCurve3 (closed=true).
 * width = X-extent, height = Y-extent (center-to-center of bar centerline).
 * Corners receive small fillets for visual quality.
 */
export function buildStirrupCurve(
  width: number,
  height: number,
  z: number,
  hookLen: number = 0,
): THREE.CatmullRomCurve3 {
  const w = width / 2;
  const h = height / 2;
  // Corner fillet radius
  const r = Math.min(width, height) * 0.06;
  const seg = (a: number, b: number, t: number) => a + (b - a) * t;

  const pts: THREE.Vector3[] = [];
  // top edge (left -> right) with fillet at corners
  pts.push(new THREE.Vector3(-w + r, h, z));
  pts.push(new THREE.Vector3(w - r, h, z));
  pts.push(new THREE.Vector3(w, h - r, z));
  // right edge
  pts.push(new THREE.Vector3(w, -h + r, z));
  pts.push(new THREE.Vector3(w - r, -h, z));
  // bottom edge
  pts.push(new THREE.Vector3(-w + r, -h, z));
  pts.push(new THREE.Vector3(-w, -h + r, z));
  // left edge
  pts.push(new THREE.Vector3(-w, h - r, z));
  pts.push(new THREE.Vector3(-w + r, h, z));

  // 135° hook: extend from start corner inward-down at 45°
  if (hookLen > 0) {
    const hx = -w + r + hookLen * Math.cos(Math.PI / 4);
    const hy = h - hookLen * Math.sin(Math.PI / 4);
    pts.push(new THREE.Vector3(hx, hy, z));
  }

  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.0);
  return curve;
}

/**
 * Build a longitudinal bar curve with optional 90°-bend hooks (anchorage) at ends.
 * Bar runs along X axis from x0 to x1 at height y, depth z.
 * bendDown: if true, end hooks bend toward -Y (used for top bars), else +Y.
 */
export function buildLongitudinalCurve(
  x0: number,
  x1: number,
  y: number,
  z: number,
  leftBend: 'straight' | 'bend',
  rightBend: 'straight' | 'bend',
  bendLen: number,
  bendDown: boolean,
): THREE.CatmullRomCurve3 {
  const dy = bendDown ? -bendLen : bendLen;
  const pts: THREE.Vector3[] = [];
  if (leftBend === 'bend') {
    pts.push(new THREE.Vector3(x0, y + dy, z));
    pts.push(new THREE.Vector3(x0, y, z));
  } else {
    pts.push(new THREE.Vector3(x0, y, z));
  }
  // mid points to ensure straight middle
  pts.push(new THREE.Vector3((x0 + x1) / 2, y, z));
  if (rightBend === 'bend') {
    pts.push(new THREE.Vector3(x1, y, z));
    pts.push(new THREE.Vector3(x1, y + dy, z));
  } else {
    pts.push(new THREE.Vector3(x1, y, z));
  }
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.0);
}

/** Get total length of a curve in mm. */
export function curveLength(curve: THREE.CatmullRomCurve3): number {
  return curve.getLength();
}

/** Distribute n bars uniformly along an axis from -half+cover+d/2 to +half-cover-d/2. */
export function distributeBars(n: number, half: number, cover: number, d: number): number[] {
  if (n <= 0) return [];
  const min = -half + cover + d / 2;
  const max = half - cover - d / 2;
  if (n === 1) return [(min + max) / 2];
  const step = (max - min) / (n - 1);
  return Array.from({ length: n }, (_, i) => min + i * step);
}

/**
 * Distribute stirrups along a beam's X axis with dense zones at each end.
 * Returns array of x-positions for stirrup placement.
 */
export function distributeStirrups(
  span: number,
  cover: number,
  spDense: number,
  spNormal: number,
  denseLen: number,
): number[] {
  const positions: number[] = [];
  const start = -span / 2 + cover + 25; // first stirrup ~50mm from end
  const end = span / 2 - cover - 25;

  // Dense zone at left
  let x = start;
  const denseLeftEnd = Math.min(start + denseLen, end);
  while (x <= denseLeftEnd) {
    positions.push(x);
    x += spDense;
  }
  // Normal zone
  const denseRightStart = Math.max(end - denseLen, denseLeftEnd);
  while (x < denseRightStart) {
    positions.push(x);
    x += spNormal;
  }
  // Dense zone at right
  while (x <= end) {
    positions.push(x);
    x += spDense;
  }
  return positions;
}
