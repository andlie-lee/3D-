import * as THREE from 'three';
import { GeneratedModel, RebarBatch, SlabParams } from '../types';

/**
 * Slab reinforcement.
 * Axes: X = lx, Y = thickness, Z = ly.
 */
export function generateSlab(p: SlabParams): GeneratedModel {
  const batches: RebarBatch[] = [];

  const halfX = p.lx / 2;
  const halfY = p.thickness / 2;
  const halfZ = p.ly / 2;

  const buildLayer = (
    direction: 'x' | 'z',
    diam: number,
    spacing: number,
    yPos: number,
    label: string,
    role: 'longitudinal' | 'distribution',
  ) => {
    // Bar runs along `direction`
    const hook = 5 * diam;
    let curve: THREE.CatmullRomCurve3;
    if (direction === 'x') {
      curve = new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(-halfX + p.cover, yPos + (yPos > 0 ? -hook : hook), 0),
          new THREE.Vector3(-halfX + p.cover, yPos, 0),
          new THREE.Vector3(halfX - p.cover, yPos, 0),
          new THREE.Vector3(halfX - p.cover, yPos + (yPos > 0 ? -hook : hook), 0),
        ],
        false,
        'catmullrom',
        0.0,
      );
      // Distribute along Z
      const usable = p.ly - 2 * p.cover - diam;
      const n = Math.max(1, Math.floor(usable / spacing) + 1);
      const startZ = -halfZ + p.cover + diam / 2;
      const translations: THREE.Vector3[] = [];
      for (let i = 0; i < n; i++) translations.push(new THREE.Vector3(0, 0, startZ + i * spacing));
      batches.push({
        key: `slab-${role}-x-${diam}-${yPos.toFixed(1)}`,
        diameter: diam,
        grade: 'HRB400',
        role,
        curve,
        translations,
        label: `${label} Φ${diam}@${spacing}`,
      });
    } else {
      curve = new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0, yPos + (yPos > 0 ? -hook : hook), -halfZ + p.cover),
          new THREE.Vector3(0, yPos, -halfZ + p.cover),
          new THREE.Vector3(0, yPos, halfZ - p.cover),
          new THREE.Vector3(0, yPos + (yPos > 0 ? -hook : hook), halfZ - p.cover),
        ],
        false,
        'catmullrom',
        0.0,
      );
      const usable = p.lx - 2 * p.cover - diam;
      const n = Math.max(1, Math.floor(usable / spacing) + 1);
      const startX = -halfX + p.cover + diam / 2;
      const translations: THREE.Vector3[] = [];
      for (let i = 0; i < n; i++) translations.push(new THREE.Vector3(startX + i * spacing, 0, 0));
      batches.push({
        key: `slab-${role}-z-${diam}-${yPos.toFixed(1)}`,
        diameter: diam,
        grade: 'HRB400',
        role,
        curve,
        translations,
        label: `${label} Φ${diam}@${spacing}`,
      });
    }
  };

  // Bottom layers (X-bar lower than Z-bar to stack correctly)
  const yBotX = -halfY + p.cover + p.bottomX.d / 2;
  const yBotZ = yBotX + p.bottomX.d / 2 + p.bottomY.d / 2;
  buildLayer('x', p.bottomX.d, p.bottomX.spacing, yBotX, '底筋X向', 'longitudinal');
  buildLayer('z', p.bottomY.d, p.bottomY.spacing, yBotZ, '底筋Y向', 'distribution');
  // Top layers
  const yTopZ = halfY - p.cover - p.topY.d / 2;
  const yTopX = yTopZ - p.topY.d / 2 - p.topX.d / 2;
  buildLayer('x', p.topX.d, p.topX.spacing, yTopX, '面筋X向', 'longitudinal');
  buildLayer('z', p.topY.d, p.topY.spacing, yTopZ, '面筋Y向', 'distribution');

  return {
    concrete: { sizeX: p.lx, sizeY: p.thickness, sizeZ: p.ly },
    rebars: [],
    batches,
  };
}
