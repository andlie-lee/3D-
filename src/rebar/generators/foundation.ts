import * as THREE from 'three';
import { FoundationParams, GeneratedModel, RebarBatch } from '../types';

/**
 * Foundation slab (筏板/独立基础底板) — only bottom-layer双向钢筋示意.
 */
export function generateFoundation(p: FoundationParams): GeneratedModel {
  const batches: RebarBatch[] = [];
  const halfX = p.lx / 2;
  const halfY = p.thickness / 2;
  const halfZ = p.ly / 2;
  const hook = 10 * Math.max(p.bottomX.d, p.bottomY.d);

  // X-direction bars (bottom)
  const yBotX = -halfY + p.cover + p.bottomX.d / 2;
  const xCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-halfX + p.cover, yBotX + hook, 0),
      new THREE.Vector3(-halfX + p.cover, yBotX, 0),
      new THREE.Vector3(halfX - p.cover, yBotX, 0),
      new THREE.Vector3(halfX - p.cover, yBotX + hook, 0),
    ],
    false,
    'catmullrom',
    0.0,
  );
  const nX = Math.max(1, Math.floor((p.ly - 2 * p.cover) / p.bottomX.spacing) + 1);
  const startZ = -halfZ + p.cover + p.bottomX.d / 2;
  const xTrans: THREE.Vector3[] = [];
  for (let i = 0; i < nX; i++) xTrans.push(new THREE.Vector3(0, 0, startZ + i * p.bottomX.spacing));
  batches.push({
    key: 'fnd-x',
    diameter: p.bottomX.d,
    grade: p.bottomX.grade,
    role: 'longitudinal',
    curve: xCurve,
    translations: xTrans,
    label: `底筋X向 Φ${p.bottomX.d}@${p.bottomX.spacing}`,
  });

  const yBotZ = yBotX + p.bottomX.d / 2 + p.bottomY.d / 2;
  const zCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, yBotZ + hook, -halfZ + p.cover),
      new THREE.Vector3(0, yBotZ, -halfZ + p.cover),
      new THREE.Vector3(0, yBotZ, halfZ - p.cover),
      new THREE.Vector3(0, yBotZ + hook, halfZ - p.cover),
    ],
    false,
    'catmullrom',
    0.0,
  );
  const nZ = Math.max(1, Math.floor((p.lx - 2 * p.cover) / p.bottomY.spacing) + 1);
  const startX = -halfX + p.cover + p.bottomY.d / 2;
  const zTrans: THREE.Vector3[] = [];
  for (let i = 0; i < nZ; i++) zTrans.push(new THREE.Vector3(startX + i * p.bottomY.spacing, 0, 0));
  batches.push({
    key: 'fnd-z',
    diameter: p.bottomY.d,
    grade: p.bottomY.grade,
    role: 'distribution',
    curve: zCurve,
    translations: zTrans,
    label: `底筋Y向 Φ${p.bottomY.d}@${p.bottomY.spacing}`,
  });

  return {
    concrete: { sizeX: p.lx, sizeY: p.thickness, sizeZ: p.ly },
    rebars: [],
    batches,
  };
}
