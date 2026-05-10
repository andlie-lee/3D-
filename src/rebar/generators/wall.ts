import * as THREE from 'three';
import { GeneratedModel, RebarBatch, WallParams } from '../types';

/**
 * Wall reinforcement (双层双向 + 拉筋).
 * Axes: X = length, Y = height, Z = thickness.
 */
export function generateWall(p: WallParams): GeneratedModel {
  const batches: RebarBatch[] = [];
  const halfX = p.length / 2;
  const halfY = p.height / 2;
  const halfZ = p.thickness / 2;

  const layers = [
    { z: -halfZ + p.cover + p.vertical.d / 2, side: '外侧' },
    { z: halfZ - p.cover - p.vertical.d / 2, side: '内侧' },
  ];

  layers.forEach((layer, li) => {
    // Vertical bars
    const vCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, -halfY + p.cover, layer.z),
        new THREE.Vector3(0, halfY - p.cover, layer.z),
      ],
      false,
      'catmullrom',
      0.0,
    );
    const vN = Math.max(1, Math.floor((p.length - 2 * p.cover) / p.vertical.spacing) + 1);
    const vStart = -halfX + p.cover + p.vertical.d / 2;
    const vTrans: THREE.Vector3[] = [];
    for (let i = 0; i < vN; i++) vTrans.push(new THREE.Vector3(vStart + i * p.vertical.spacing, 0, 0));
    batches.push({
      key: `wall-v-${li}`,
      diameter: p.vertical.d,
      grade: p.vertical.grade,
      role: 'longitudinal',
      curve: vCurve,
      translations: vTrans,
      label: `${layer.side}竖向筋 Φ${p.vertical.d}@${p.vertical.spacing}`,
    });

    // Horizontal bars
    const hCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-halfX + p.cover, 0, layer.z),
        new THREE.Vector3(halfX - p.cover, 0, layer.z),
      ],
      false,
      'catmullrom',
      0.0,
    );
    const hN = Math.max(1, Math.floor((p.height - 2 * p.cover) / p.horizontal.spacing) + 1);
    const hStart = -halfY + p.cover + p.horizontal.d / 2;
    const hTrans: THREE.Vector3[] = [];
    for (let i = 0; i < hN; i++) hTrans.push(new THREE.Vector3(0, hStart + i * p.horizontal.spacing, 0));
    batches.push({
      key: `wall-h-${li}`,
      diameter: p.horizontal.d,
      grade: p.horizontal.grade,
      role: 'distribution',
      curve: hCurve,
      translations: hTrans,
      label: `${layer.side}水平筋 Φ${p.horizontal.d}@${p.horizontal.spacing}`,
    });
  });

  // Tie bars (穿过两层)
  const tieCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 0, -halfZ + p.cover),
      new THREE.Vector3(0, 0, halfZ - p.cover),
    ],
    false,
    'catmullrom',
    0.0,
  );
  const tNX = Math.max(1, Math.floor((p.length - 2 * p.cover) / p.tie.spacingX) + 1);
  const tNY = Math.max(1, Math.floor((p.height - 2 * p.cover) / p.tie.spacingY) + 1);
  const tStartX = -halfX + p.cover + p.tie.spacingX / 2;
  const tStartY = -halfY + p.cover + p.tie.spacingY / 2;
  const tTrans: THREE.Vector3[] = [];
  for (let i = 0; i < tNX; i++) {
    for (let j = 0; j < tNY; j++) {
      // staggered梅花布置
      const offset = j % 2 === 0 ? 0 : p.tie.spacingX / 2;
      tTrans.push(new THREE.Vector3(tStartX + i * p.tie.spacingX + offset, tStartY + j * p.tie.spacingY, 0));
    }
  }
  batches.push({
    key: `wall-tie`,
    diameter: p.tie.d,
    grade: p.tie.grade,
    role: 'tie',
    curve: tieCurve,
    translations: tTrans,
    label: `拉筋 Φ${p.tie.d}@${p.tie.spacingX}×${p.tie.spacingY} 梅花`,
  });

  return {
    concrete: { sizeX: p.length, sizeY: p.height, sizeZ: p.thickness },
    rebars: [],
    batches,
  };
}
