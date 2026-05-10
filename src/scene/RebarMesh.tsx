import { useMemo } from 'react';
import * as THREE from 'three';
import { GeneratedModel, RebarBatch, RebarPath } from '../rebar/types';
import { ROLE_COLOR } from '../rebar/utils';
import { getRibbedNormalMap } from './ribbedNormalMap';

interface Props {
  model: GeneratedModel;
  clippingPlanes?: THREE.Plane[];
}

/** Tubular segments per mm of curve, capped to keep performance reasonable. */
function tubularSegmentsForCurve(curve: THREE.CatmullRomCurve3): number {
  const len = curve.getLength();
  const segs = Math.min(256, Math.max(24, Math.round(len / 30)));
  return segs;
}

export function RebarMesh({ model, clippingPlanes }: Props) {
  // Build per-batch instanced meshes
  const batchMeshes = useMemo(() => {
    return model.batches.map((b) => buildBatchMesh(b, clippingPlanes));
  }, [model, clippingPlanes]);

  const singleMeshes = useMemo(() => {
    return model.rebars.map((r) => buildSingleMesh(r, clippingPlanes));
  }, [model.rebars, clippingPlanes]);

  return (
    <group>
      {batchMeshes.map((m, i) => (
        <primitive key={`b-${i}`} object={m} />
      ))}
      {singleMeshes.map((m, i) => (
        <primitive key={`s-${i}`} object={m} />
      ))}
    </group>
  );
}

function makeMaterial(role: keyof typeof ROLE_COLOR, clippingPlanes?: THREE.Plane[], curveLengthMm = 1000) {
  // Stirrups & ties: HPB-like smooth bars, no ribs
  const useRibs = role === 'longitudinal' || role === 'distribution' || role === 'waist';
  const mat = new THREE.MeshStandardMaterial({
    color: ROLE_COLOR[role],
    metalness: 0.8,
    roughness: 0.4,
    clippingPlanes: clippingPlanes ?? [],
  });
  if (useRibs) {
    const tex = getRibbedNormalMap().clone();
    tex.needsUpdate = true;
    // Repeat texture along the bar length so ribs scale realistically
    // (one rib pattern unit ~ 50mm along bar).
    tex.repeat.set(Math.max(1, curveLengthMm / 200), 1);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    mat.normalMap = tex;
    mat.normalScale = new THREE.Vector2(0.6, 0.6);
  }
  return mat;
}

function buildBatchMesh(batch: RebarBatch, clippingPlanes?: THREE.Plane[]) {
  const segs = tubularSegmentsForCurve(batch.curve);
  const radius = batch.diameter / 2;
  const geom = new THREE.TubeGeometry(batch.curve, segs, radius, 10, !!batch.closed);
  const mat = makeMaterial(batch.role, clippingPlanes, batch.curve.getLength());
  if (batch.translations.length === 0) {
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.userData.label = batch.label;
    return mesh;
  }
  const inst = new THREE.InstancedMesh(geom, mat, batch.translations.length);
  inst.castShadow = true;
  const m = new THREE.Matrix4();
  batch.translations.forEach((t, i) => {
    m.makeTranslation(t.x, t.y, t.z);
    inst.setMatrixAt(i, m);
  });
  inst.instanceMatrix.needsUpdate = true;
  inst.userData.label = batch.label;
  return inst;
}

function buildSingleMesh(rebar: RebarPath, clippingPlanes?: THREE.Plane[]) {
  const segs = tubularSegmentsForCurve(rebar.curve);
  const radius = rebar.diameter / 2;
  const geom = new THREE.TubeGeometry(rebar.curve, segs, radius, 10, !!rebar.closed);
  const mat = makeMaterial(rebar.role, clippingPlanes, rebar.curve.getLength());
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.userData.label = rebar.label ?? rebar.id;
  return mesh;
}
