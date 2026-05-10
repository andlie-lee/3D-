import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useParamsStore } from '../store/paramsStore';
import { generate } from '../rebar/generators';
import { Concrete } from '../scene/Concrete';
import { RebarMesh } from '../scene/RebarMesh';

const MM_TO_M = 0.001;

function ClippingSetup() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);
  return null;
}

interface SceneProps {
  exposeRenderer?: (gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => void;
}

function Scene({ exposeRenderer }: SceneProps) {
  const params = useParamsStore((s) => s.current());
  const display = useParamsStore((s) => s.display);

  const model = useMemo(() => generate(params), [params]);

  // Build clipping plane based on bounding box.
  const clippingPlanes = useMemo(() => {
    if (!display.clipEnabled) return undefined;
    const sizes = {
      x: model.concrete.sizeX,
      y: model.concrete.sizeY,
      z: model.concrete.sizeZ,
    };
    const half = sizes[display.clipAxis] / 2;
    const dist = display.clipPosition * half;
    const normal = new THREE.Vector3(
      display.clipAxis === 'x' ? 1 : 0,
      display.clipAxis === 'y' ? 1 : 0,
      display.clipAxis === 'z' ? 1 : 0,
    );
    if (display.clipFlip) normal.multiplyScalar(-1);
    // Plane in mm (geometry not yet scaled). Plane defined by normal and constant such that
    // n·p + constant = 0 cuts away points where n·p + constant < 0.
    const plane = new THREE.Plane(normal, -dist * (display.clipFlip ? -1 : 1));
    return [plane];
  }, [display, model.concrete]);

  const { gl, scene, camera } = useThree();
  useEffect(() => {
    exposeRenderer?.(gl, scene, camera);
  }, [gl, scene, camera, exposeRenderer]);

  // Render unit: keep geometry in mm but scale group down by 0.001 so that 1 unit ≈ 1m.
  return (
    <group scale={MM_TO_M}>
      <Concrete
        sizeX={model.concrete.sizeX}
        sizeY={model.concrete.sizeY}
        sizeZ={model.concrete.sizeZ}
        opacity={display.concreteOpacity}
        clippingPlanes={clippingPlanes}
      />
      {display.showRebar && <RebarMesh model={model} clippingPlanes={clippingPlanes} />}
    </group>
  );
}

interface ViewerHandle {
  current: {
    gl?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.Camera;
  };
}

interface Props {
  viewerRef?: ViewerHandle;
}

export function Viewer3D({ viewerRef }: Props) {
  const handle = useRef({}) as ViewerHandle;
  const ref = viewerRef ?? handle;
  return (
    <Canvas
      shadows
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      camera={{ position: [6, 5, 8], fov: 45, near: 0.01, far: 200 }}
    >
      <color attach="background" args={['#0f172a']} />
      <ClippingSetup />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#cfe5ff', '#1a2233', 0.7]} />
      <directionalLight
        position={[5, 10, 7]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-6, 4, -5]} intensity={0.4} />
      <Grid
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.6}
        sectionSize={2}
        sectionThickness={1.2}
        sectionColor="#475569"
        cellColor="#334155"
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid
        position={[0, -0.001, 0]}
      />
      <Scene
        exposeRenderer={(gl, scene, camera) => {
          ref.current.gl = gl;
          ref.current.scene = scene;
          ref.current.camera = camera;
        }}
      />
      <OrbitControls makeDefault enableDamping />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
    </Canvas>
  );
}

export type { ViewerHandle };
