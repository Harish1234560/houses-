'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, AdaptiveDpr, SoftShadows } from '@react-three/drei';
import { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import * as THREE from 'three';

type ScrollProgress = { current: number };

function BuildingMassing({ scrollProgress, isMobile }: { scrollProgress: ScrollProgress; isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const buildingColors = useBuildingColors();

  useFrame((state) => {
    if (!groupRef.current) return;
    const sp = scrollProgress.current;
    // Rotate the group based on scroll progress
    groupRef.current.rotation.y = sp * Math.PI * 0.8;
    // Subtle vertical drift
    groupRef.current.position.y = Math.sin(sp * Math.PI) * 0.15 - 0.1;
  });

  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: buildingColors.accent,
    metalness: 0.9,
    roughness: 0.15,
    emissive: buildingColors.accent,
    emissiveIntensity: 0.08,
  }), [buildingColors.accent]);

  const buildingMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: buildingColors.building,
    metalness: 0.6,
    roughness: 0.3,
  }), [buildingColors.building]);

  const buildingDarkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: buildingColors.buildingDark,
    metalness: 0.5,
    roughness: 0.4,
  }), [buildingColors.buildingDark]);

  const groundMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: buildingColors.ground,
    metalness: 0.3,
    roughness: 0.8,
  }), [buildingColors.ground]);

  const gridMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: buildingColors.accent,
    metalness: 0.7,
    roughness: 0.3,
    opacity: 0.25,
    transparent: true,
  }), [buildingColors.accent]);

  return (
    <group ref={groupRef}>
      {/* Base platform */}
      <mesh position={[0, -0.5, 0]} receiveShadow material={groundMat}>
        <boxGeometry args={[isMobile ? 3.5 : 4.5, 0.08, isMobile ? 3.5 : 4.5]} />
      </mesh>

      {/* Central tower — main building */}
      <mesh position={[0, 1.0, 0]} castShadow material={buildingMat}>
        <boxGeometry args={[0.9, 3.0, 0.9]} />
      </mesh>

      {/* Tower accent edges (bronze) */}
      <mesh position={[0.47, 1.0, 0]} material={accentMat}>
        <boxGeometry args={[0.025, 3.0, 0.025]} />
      </mesh>
      <mesh position={[-0.47, 1.0, 0]} material={accentMat}>
        <boxGeometry args={[0.025, 3.0, 0.025]} />
      </mesh>
      <mesh position={[0, 1.0, 0.47]} material={accentMat}>
        <boxGeometry args={[0.025, 3.0, 0.025]} />
      </mesh>
      <mesh position={[0, 1.0, -0.47]} material={accentMat}>
        <boxGeometry args={[0.025, 3.0, 0.025]} />
      </mesh>

      {/* Roof slab on central tower */}
      <mesh position={[0, 2.55, 0]} castShadow material={accentMat}>
        <boxGeometry args={[1.1, 0.06, 1.1]} />
      </mesh>

      {/* Small accent structure on roof */}
      <mesh position={[-0.2, 2.7, 0]} castShadow material={accentMat}>
        <boxGeometry args={[0.35, 0.2, 0.35]} />
      </mesh>

      {/* Mid tower left */}
      <mesh position={[-1.2, 0.4, -0.3]} castShadow material={buildingDarkMat}>
        <boxGeometry args={[0.75, 1.8, 0.75]} />
      </mesh>

      {/* Mid tower right — taller */}
      <mesh position={[1.2, 0.7, 0.2]} castShadow material={buildingDarkMat}>
        <boxGeometry args={[0.65, 2.4, 0.65]} />
      </mesh>

      {/* Low block front */}
      <mesh position={[0.4, -0.1, 1.3]} castShadow material={buildingDarkMat}>
        <boxGeometry args={[2.0, 0.8, 0.7]} />
      </mesh>

      {/* Low block right back */}
      <mesh position={[1.0, -0.2, -1.2]} castShadow material={buildingDarkMat}>
        <boxGeometry args={[0.9, 0.6, 0.9]} />
      </mesh>

      {/* Thin accent strips on mid tower left */}
      <mesh position={[-0.83, 0.4, -0.3]} material={accentMat}>
        <boxGeometry args={[0.015, 1.8, 0.015]} />
      </mesh>

      {/* Thin accent strips on mid tower right */}
      <mesh position={[1.53, 0.7, 0.2]} material={accentMat}>
        <boxGeometry args={[0.015, 2.4, 0.015]} />
      </mesh>

      {/* Plotted land grid lines */}
      {!isMobile && [-1.5, -0.5, 0.5, 1.5].map((x) => (
        <mesh key={`grid-x-${x}`} position={[x, -0.45, 0]} material={gridMat}>
          <boxGeometry args={[0.015, 0.02, 4]} />
        </mesh>
      ))}
      {!isMobile && [-1.5, -0.5, 0.5, 1.5].map((z) => (
        <mesh key={`grid-z-${z}`} position={[0, -0.45, z]} material={gridMat}>
          <boxGeometry args={[4, 0.02, 0.015]} />
        </mesh>
      ))}

      {/* Stepped base accent ring */}
      <mesh position={[0, -0.42, 0]} material={accentMat}>
        <boxGeometry args={[isMobile ? 3.2 : 4.2, 0.03, 0.03]} />
      </mesh>
      <mesh position={[0, -0.42, 0]} material={accentMat}>
        <boxGeometry args={[0.03, 0.03, isMobile ? 3.2 : 4.2]} />
      </mesh>
    </group>
  );
}

function FloatingPrism({ scrollProgress }: { scrollProgress: ScrollProgress }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { resolvedTheme } = useTheme();
  const accentColor = resolvedTheme === 'dark' ? '#b8956a' : '#b8845a';

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const sp = scrollProgress.current;
    meshRef.current.rotation.x = t * 0.12 + sp * 0.5;
    meshRef.current.rotation.z = t * 0.08 + sp * 0.3;
    // Move prism based on scroll
    meshRef.current.position.y = 1.8 + Math.sin(t * 0.5) * 0.15 - sp * 0.5;
    meshRef.current.position.x = 2.5 - sp * 1.5;
  });

  return (
    <mesh ref={meshRef} position={[2.5, 1.8, -1]} castShadow>
      <octahedronGeometry args={[0.32, 0]} />
      <meshStandardMaterial
        color={accentColor}
        metalness={0.9}
        roughness={0.15}
        emissive={accentColor}
        emissiveIntensity={0.06}
      />
    </mesh>
  );
}

function ScrollCamera({ scrollProgress }: { scrollProgress: ScrollProgress }) {
  const { camera } = useThree();

  useFrame(() => {
    const sp = scrollProgress.current;
    // Multi-stage camera path driven by scroll progress (0 to 1)
    // Stage 1 (0-0.2): Frontal view, move closer
    // Stage 2 (0.2-0.5): Rotate to three-quarter view
    // Stage 3 (0.5-0.75): Move laterally, reveal more structures
    // Stage 4 (0.75-1.0): Wider final composition

    const x = 4 - sp * 2 + Math.sin(sp * Math.PI) * 1.5;
    const y = 3 - sp * 1.5;
    const z = 5 - sp * 1;

    camera.position.lerp(new THREE.Vector3(x, y, z), 0.05);
    camera.lookAt(0, 0.5, 0);
  });

  return null;
}

function PointerParallax({ scrollProgress }: { scrollProgress: ScrollProgress }) {
  const { camera } = useThree();
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.current = (e.clientX / window.innerWidth - 0.5) * 0.4;
      mouseY.current = (e.clientY / window.innerHeight - 0.5) * 0.2;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(() => {
    const sp = scrollProgress.current;
    const baseX = 4 - sp * 2 + Math.sin(sp * Math.PI) * 1.5;
    const baseY = 3 - sp * 1.5;
    const baseZ = 5 - sp * 1;

    camera.position.x += (baseX + mouseX.current - camera.position.x) * 0.04;
    camera.position.y += (baseY - mouseY.current - camera.position.y) * 0.04;
    camera.position.z += (baseZ - camera.position.z) * 0.04;
    camera.lookAt(0, 0.5, 0);
  });

  return null;
}

function useBuildingColors() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';

  return useMemo(() => ({
    building: isDark ? '#2a2520' : '#c8c0b0',
    buildingDark: isDark ? '#1e1b16' : '#b5ac9a',
    accent: isDark ? '#b8956a' : '#b8845a',
    ground: isDark ? '#1a1714' : '#d5cec0',
  }), [isDark]);
}

function SceneContent({ scrollProgress, isMobile }: { scrollProgress: ScrollProgress; isMobile: boolean }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';

  return (
    <>
      <ambientLight intensity={isDark ? 0.3 : 0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={isDark ? 0.8 : 1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-5, 3, -5]} intensity={isDark ? 0.3 : 0.4} color={isDark ? '#b8956a' : '#d4a865'} />

      <BuildingMassing scrollProgress={scrollProgress} isMobile={isMobile} />
      {!isMobile && <FloatingPrism scrollProgress={scrollProgress} />}

      {!isMobile && (
        <ContactShadows
          position={[0, -0.55, 0]}
          opacity={isDark ? 0.4 : 0.25}
          scale={8}
          blur={2.5}
          far={4}
          color={isDark ? '#000000' : '#8a8275'}
        />
      )}
      <Environment preset={isDark ? 'dawn' : 'sunset'} />
    </>
  );
}

export function ArchitecturalScene({ scrollProgress }: { scrollProgress?: ScrollProgress }) {
  const [isMobile, setIsMobile] = useState(false);
  const internalScroll = useRef(0);
  const sp = scrollProgress || internalScroll;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <Canvas
      shadows={!isMobile}
      dpr={[1, isMobile ? 1 : 1.5]}
      camera={{ position: [4, 3, 5], fov: isMobile ? 45 : 40 }}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
    >
      <AdaptiveDpr pixelated />
      <Suspense fallback={null}>
        <SceneContent scrollProgress={sp} isMobile={isMobile} />
        {isMobile ? (
          <ScrollCamera scrollProgress={sp} />
        ) : (
          <PointerParallax scrollProgress={sp} />
        )}
      </Suspense>
    </Canvas>
  );
}

export function ArchitecturalSceneLazy({ scrollProgress }: { scrollProgress?: ScrollProgress }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ArchitecturalScene scrollProgress={scrollProgress} />;
}
