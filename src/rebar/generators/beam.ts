import * as THREE from 'three';
import {
  BeamParams,
  GeneratedModel,
  RebarBatch,
  RebarPath,
} from '../types';
import {
  buildLongitudinalCurve,
  buildStirrupCurve,
  distributeBars,
  distributeStirrups,
  laE,
} from '../utils';

/**
 * Generate beam reinforcement.
 * Local axes: X = span (length), Y = height, Z = width (b).
 * Concrete centered at origin.
 */
export function generateBeam(p: BeamParams): GeneratedModel {
  const rebars: RebarPath[] = [];
  const batches: RebarBatch[] = [];

  const halfH = p.h / 2;
  const halfB = p.b / 2;
  const stirrupHookLen = Math.max(10 * p.stirrup.d, 75);

  // ---------- Stirrups (instanced along X) ----------
  const stirrupW = p.b - 2 * p.cover; // along Z
  const stirrupH = p.h - 2 * p.cover; // along Y
  // Build a stirrup curve in YZ plane (X = 0). Our helper builds in XY plane;
  // we'll instead build directly in YZ.
  const stirrupRefCurve = buildStirrupYZ(stirrupW, stirrupH, stirrupHookLen);
  const stirrupX = distributeStirrups(
    p.span,
    p.cover,
    p.stirrup.spDense,
    p.stirrup.spNormal,
    p.stirrup.denseLen,
  );
  batches.push({
    key: `stirrup-${p.stirrup.d}-${p.stirrup.grade}`,
    diameter: p.stirrup.d,
    grade: p.stirrup.grade,
    role: 'stirrup',
    curve: stirrupRefCurve,
    closed: false,
    translations: stirrupX.map((x) => new THREE.Vector3(x, 0, 0)),
    label: `箍筋 ${p.stirrup.legs}肢 Φ${p.stirrup.d}@${p.stirrup.spDense}/${p.stirrup.spNormal}`,
  });

  // 4-leg stirrup: add an inner small stirrup
  if (p.stirrup.legs === 4) {
    const innerW = stirrupW * 0.5;
    const innerCurve = buildStirrupYZ(innerW, stirrupH, stirrupHookLen);
    batches.push({
      key: `stirrup-inner-${p.stirrup.d}-${p.stirrup.grade}`,
      diameter: p.stirrup.d,
      grade: p.stirrup.grade,
      role: 'stirrup',
      curve: innerCurve,
      translations: stirrupX.map((x) => new THREE.Vector3(x, 0, 0)),
      label: `内箍 Φ${p.stirrup.d}`,
    });
  }

  // ---------- Top longitudinal bars ----------
  const topD = p.topBars.d;
  const topY = halfH - p.cover - p.stirrup.d - topD / 2;
  const topZs = distributeBars(p.topBars.count, halfB, p.cover + p.stirrup.d, topD);
  const bendLen = 15 * topD; // 弯锚 15d
  const xL = -p.span / 2 + p.cover;
  const xR = p.span / 2 - p.cover;
  topZs.forEach((z, i) => {
    const curve = buildLongitudinalCurve(
      xL,
      xR,
      topY,
      z,
      p.anchor.left,
      p.anchor.right,
      bendLen,
      true, // top bars bend down
    );
    rebars.push({
      id: `top-${i}`,
      diameter: topD,
      grade: p.topBars.grade,
      role: 'longitudinal',
      curve,
      label: i === 0 ? `上部纵筋 ${p.topBars.count}Φ${topD}` : undefined,
    });
  });

  // ---------- Bottom longitudinal bars ----------
  const botD = p.bottomBars.d;
  const botY = -halfH + p.cover + p.stirrup.d + botD / 2;
  const botZs = distributeBars(p.bottomBars.count, halfB, p.cover + p.stirrup.d, botD);
  botZs.forEach((z, i) => {
    const curve = buildLongitudinalCurve(
      xL,
      xR,
      botY,
      z,
      p.anchor.left,
      p.anchor.right,
      bendLen,
      false, // bottom bars bend up
    );
    rebars.push({
      id: `bot-${i}`,
      diameter: botD,
      grade: p.bottomBars.grade,
      role: 'longitudinal',
      curve,
      label: i === 0 ? `下部纵筋 ${p.bottomBars.count}Φ${botD}` : undefined,
    });
  });

  // ---------- Waist bars (optional) ----------
  if (p.waist && p.waist.count > 0) {
    const wD = p.waist.d;
    const innerH = stirrupH - topD - botD - 2 * wD;
    const ys = distributeBars(p.waist.count, innerH / 2, 0, wD).map(
      (v) => v + (topY + botY) / 2,
    );
    const wZs = [-halfB + p.cover + p.stirrup.d + wD / 2, halfB - p.cover - p.stirrup.d - wD / 2];
    ys.forEach((y, i) => {
      wZs.forEach((z, j) => {
        const curve = buildLongitudinalCurve(xL, xR, y, z, 'straight', 'straight', 0, false);
        rebars.push({
          id: `waist-${i}-${j}`,
          diameter: wD,
          grade: p.waist!.grade,
          role: 'waist',
          curve,
          label: i === 0 && j === 0 ? `腰筋 ${p.waist!.count * 2}Φ${wD}` : undefined,
        });
      });
    });
  }

  // suppress unused warning
  void laE;

  return {
    concrete: { sizeX: p.span, sizeY: p.h, sizeZ: p.b },
    rebars,
    batches,
  };
}

/** Build a stirrup curve in the YZ plane (X = 0). Width along Z, Height along Y. */
function buildStirrupYZ(width: number, height: number, hookLen: number): THREE.CatmullRomCurve3 {
  const w = width / 2;
  const h = height / 2;
  const r = Math.min(width, height) * 0.06;
  const pts: THREE.Vector3[] = [];
  pts.push(new THREE.Vector3(0, h, -w + r));
  pts.push(new THREE.Vector3(0, h, w - r));
  pts.push(new THREE.Vector3(0, h - r, w));
  pts.push(new THREE.Vector3(0, -h + r, w));
  pts.push(new THREE.Vector3(0, -h, w - r));
  pts.push(new THREE.Vector3(0, -h, -w + r));
  pts.push(new THREE.Vector3(0, -h + r, -w));
  pts.push(new THREE.Vector3(0, h - r, -w));
  pts.push(new THREE.Vector3(0, h, -w + r));
  // 135° hook
  const hz = -w + r + hookLen * Math.cos(Math.PI / 4);
  const hy = h - hookLen * Math.sin(Math.PI / 4);
  pts.push(new THREE.Vector3(0, hy, hz));
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.0);
}
