import { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  opacity: number;
  clippingPlanes?: THREE.Plane[];
}

export function Concrete({ sizeX, sizeY, sizeZ, opacity, clippingPlanes }: Props) {
  // Geometry uses meters: convert mm -> m by scaling at parent level (we keep mm here, parent applies scale).
  const geom = useMemo(() => new THREE.BoxGeometry(sizeX, sizeY, sizeZ), [sizeX, sizeY, sizeZ]);
  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: 0xc8cdd4,
      metalness: 0.0,
      roughness: 0.9,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: opacity > 0.85,
      clippingPlanes: clippingPlanes ?? [],
      clipShadows: true,
    });
    return m;
  }, [opacity, clippingPlanes]);

  return <mesh geometry={geom} material={material} castShadow receiveShadow />;
}
