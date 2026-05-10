import * as THREE from 'three';

export type Grade = 'HPB300' | 'HRB400' | 'HRB500';
export type RebarRole =
  | 'longitudinal'
  | 'stirrup'
  | 'distribution'
  | 'erection'
  | 'tie'
  | 'waist';

export interface RebarPath {
  id: string;
  diameter: number; // mm
  grade: Grade;
  curve: THREE.CatmullRomCurve3;
  role: RebarRole;
  /** Set true for closed loops (stirrups). */
  closed?: boolean;
  /** Optional label, shown in materials table. */
  label?: string;
}

export interface RebarBatch {
  /** Unique key combining role + diameter + grade + path-shape. */
  key: string;
  diameter: number;
  grade: Grade;
  role: RebarRole;
  /** Reference single curve (positions of instances are translations of this). */
  curve: THREE.CatmullRomCurve3;
  closed?: boolean;
  /** Per-instance translations. If empty -> render once at origin. */
  translations: THREE.Vector3[];
  label?: string;
}

export type ComponentType = 'beam' | 'column' | 'slab' | 'wall' | 'foundation';

export interface BarSet {
  count: number;
  d: number; // diameter mm
  grade: Grade;
}

export interface BeamParams {
  type: 'beam';
  span: number; // mm
  b: number;
  h: number;
  cover: number;
  topBars: BarSet;
  bottomBars: BarSet;
  stirrup: {
    d: number;
    grade: Grade;
    legs: 2 | 4;
    spDense: number;
    spNormal: number;
    denseLen: number; // length of dense zone at each end
  };
  waist?: { count: number; d: number; grade: Grade };
  anchor: { left: 'straight' | 'bend'; right: 'straight' | 'bend' };
}

export interface ColumnParams {
  type: 'column';
  height: number;
  b: number;
  h: number;
  cover: number;
  longBars: { perSide: number; d: number; grade: Grade }; // each side count (excluding corners shared)
  stirrup: {
    d: number;
    grade: Grade;
    spDense: number;
    spNormal: number;
    denseLenBottom: number;
    denseLenTop: number;
    composite: 'simple' | 'cross' | 'rhombus';
  };
}

export interface SlabParams {
  type: 'slab';
  lx: number; // span x
  ly: number; // span y
  thickness: number;
  cover: number;
  bottomX: { d: number; spacing: number; grade: Grade };
  bottomY: { d: number; spacing: number; grade: Grade };
  topX: { d: number; spacing: number; grade: Grade };
  topY: { d: number; spacing: number; grade: Grade };
}

export interface WallParams {
  type: 'wall';
  length: number;
  height: number;
  thickness: number;
  cover: number;
  vertical: { d: number; spacing: number; grade: Grade };
  horizontal: { d: number; spacing: number; grade: Grade };
  tie: { d: number; spacingX: number; spacingY: number; grade: Grade };
}

export interface FoundationParams {
  type: 'foundation';
  lx: number;
  ly: number;
  thickness: number;
  cover: number;
  bottomX: { d: number; spacing: number; grade: Grade };
  bottomY: { d: number; spacing: number; grade: Grade };
}

export type ComponentParams =
  | BeamParams
  | ColumnParams
  | SlabParams
  | WallParams
  | FoundationParams;

export interface GeneratedModel {
  /** Concrete bounding box dimensions in mm; centered at origin. */
  concrete: { sizeX: number; sizeY: number; sizeZ: number };
  rebars: RebarPath[];
  batches: RebarBatch[];
}
