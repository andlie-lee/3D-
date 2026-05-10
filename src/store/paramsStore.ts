import { create } from 'zustand';
import {
  BeamParams,
  ColumnParams,
  ComponentParams,
  ComponentType,
  FoundationParams,
  SlabParams,
  WallParams,
} from '../rebar/types';

export const DEFAULT_BEAM: BeamParams = {
  type: 'beam',
  span: 6000,
  b: 300,
  h: 600,
  cover: 25,
  topBars: { count: 4, d: 25, grade: 'HRB400' },
  bottomBars: { count: 4, d: 22, grade: 'HRB400' },
  stirrup: { d: 10, grade: 'HRB400', legs: 2, spDense: 100, spNormal: 200, denseLen: 1500 },
  waist: { count: 2, d: 12, grade: 'HRB400' },
  anchor: { left: 'bend', right: 'bend' },
};

export const DEFAULT_COLUMN: ColumnParams = {
  type: 'column',
  height: 3600,
  b: 500,
  h: 500,
  cover: 25,
  longBars: { perSide: 4, d: 25, grade: 'HRB400' },
  stirrup: {
    d: 10,
    grade: 'HRB400',
    spDense: 100,
    spNormal: 200,
    denseLenBottom: 700,
    denseLenTop: 700,
    composite: 'cross',
  },
};

export const DEFAULT_SLAB: SlabParams = {
  type: 'slab',
  lx: 4000,
  ly: 4000,
  thickness: 120,
  cover: 15,
  bottomX: { d: 10, spacing: 150, grade: 'HRB400' },
  bottomY: { d: 10, spacing: 150, grade: 'HRB400' },
  topX: { d: 8, spacing: 200, grade: 'HRB400' },
  topY: { d: 8, spacing: 200, grade: 'HRB400' },
};

export const DEFAULT_WALL: WallParams = {
  type: 'wall',
  length: 4000,
  height: 3000,
  thickness: 200,
  cover: 20,
  vertical: { d: 12, spacing: 200, grade: 'HRB400' },
  horizontal: { d: 10, spacing: 200, grade: 'HRB400' },
  tie: { d: 6, spacingX: 600, spacingY: 600, grade: 'HPB300' },
};

export const DEFAULT_FOUNDATION: FoundationParams = {
  type: 'foundation',
  lx: 3000,
  ly: 3000,
  thickness: 500,
  cover: 40,
  bottomX: { d: 16, spacing: 150, grade: 'HRB400' },
  bottomY: { d: 16, spacing: 150, grade: 'HRB400' },
};

interface DisplayState {
  concreteOpacity: number; // 0..1
  showRebar: boolean;
  clipEnabled: boolean;
  clipAxis: 'x' | 'y' | 'z';
  clipPosition: number; // -1..1 (normalized within bbox)
  clipFlip: boolean;
}

interface ParamsState {
  componentType: ComponentType;
  beam: BeamParams;
  column: ColumnParams;
  slab: SlabParams;
  wall: WallParams;
  foundation: FoundationParams;
  display: DisplayState;
  setComponentType: (t: ComponentType) => void;
  updateBeam: (p: Partial<BeamParams>) => void;
  updateColumn: (p: Partial<ColumnParams>) => void;
  updateSlab: (p: Partial<SlabParams>) => void;
  updateWall: (p: Partial<WallParams>) => void;
  updateFoundation: (p: Partial<FoundationParams>) => void;
  updateDisplay: (p: Partial<DisplayState>) => void;
  current: () => ComponentParams;
}

export const useParamsStore = create<ParamsState>((set, get) => ({
  componentType: 'beam',
  beam: DEFAULT_BEAM,
  column: DEFAULT_COLUMN,
  slab: DEFAULT_SLAB,
  wall: DEFAULT_WALL,
  foundation: DEFAULT_FOUNDATION,
  display: {
    concreteOpacity: 0.25,
    showRebar: true,
    clipEnabled: false,
    clipAxis: 'x',
    clipPosition: 0,
    clipFlip: false,
  },
  setComponentType: (t) => set({ componentType: t }),
  updateBeam: (p) => set((s) => ({ beam: { ...s.beam, ...p } })),
  updateColumn: (p) => set((s) => ({ column: { ...s.column, ...p } })),
  updateSlab: (p) => set((s) => ({ slab: { ...s.slab, ...p } })),
  updateWall: (p) => set((s) => ({ wall: { ...s.wall, ...p } })),
  updateFoundation: (p) => set((s) => ({ foundation: { ...s.foundation, ...p } })),
  updateDisplay: (p) => set((s) => ({ display: { ...s.display, ...p } })),
  current: () => {
    const s = get();
    switch (s.componentType) {
      case 'beam':
        return s.beam;
      case 'column':
        return s.column;
      case 'slab':
        return s.slab;
      case 'wall':
        return s.wall;
      case 'foundation':
        return s.foundation;
    }
  },
}));
