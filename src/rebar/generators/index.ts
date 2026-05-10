import { ComponentParams, GeneratedModel } from '../types';
import { generateBeam } from './beam';
import { generateColumn } from './column';
import { generateSlab } from './slab';
import { generateWall } from './wall';
import { generateFoundation } from './foundation';

export function generate(params: ComponentParams): GeneratedModel {
  switch (params.type) {
    case 'beam':
      return generateBeam(params);
    case 'column':
      return generateColumn(params);
    case 'slab':
      return generateSlab(params);
    case 'wall':
      return generateWall(params);
    case 'foundation':
      return generateFoundation(params);
  }
}
