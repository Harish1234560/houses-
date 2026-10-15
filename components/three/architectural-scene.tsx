import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, AdaptiveDpr } from '@react-three/drei';
import { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import * as THREE from 'three';

type ScrollProgress = { current: number };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function useIsDark() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme !== 'light';
}

function useBuildingColors() {
  const isDark = useIsDark();
  return useMemo(
    () => ({
      accent: isDark ? '#b8956a' : '#b8845a',
      ground: isDark ? '#1a1714' : '#b8ad99',
    }),
    [isDark]
  );
}

// Small seeded random so textures are stable between renders
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Facade textures (windows, floors, glass)                            */
/* ------------------------------------------------------------------ */

interface Palette {
  wall: string;
  glassA: string; // bottom of each window
  glassB: string; // top of each window (sky reflection)
  frame: string;
  roof: string;
  marginX: number; // wall share left/right of a window (0-0.5)
  marginY: number; // wall share above/below a window (0-0.5)
  metalness: number;
  roughness: number;
  lit: number; // chance a window is lit at night
}

function getPalettes(isDark: boolean): Record<'glass' | 'teal' | 'concrete' | 'brick', Palette> {
  return {
    glass: {
      wall: isDark ? '#2b3138' : '#75838e',
      glassA: isDark ? '#1f3a52' : '#3d6a8c',
      glassB: isDark ? '#4f7fa3' : '#8fc0e0',
      frame: isDark ? '#14181c' : '#59636d',
      roof: isDark ? '#2a2d30' : '#8d9296',
      marginX: 0.1,
      marginY: 0.16,
      metalness: 0.55,
      roughness: 0.22,
      lit: 0.38,
    },
    teal: {
      wall: isDark ? '#24302f' : '#657d78',
      glassA: isDark ? '#1c4a4a' : '#3a7370',
      glassB: isDark ? '#3f8a86' : '#8fd0cb',
      frame: isDark ? '#101817' : '#566966',
      roof: isDark ? '#262b2a' : '#8b9190',
      marginX: 0.12,
      marginY: 0.2,
      metalness: 0.5,
      roughness: 0.25,
      lit: 0.3,
    },
    concrete: {
      wall: isDark ? '#4a443b' : '#bfb6a4',
      glassA: isDark ? '#26333d' : '#4b6577',
      glassB: isDark ? '#46606f' : '#86a9bd',
      frame: isDark ? '#1d1a16' : '#8c8473',
      roof: isDark ? '#35322d' : '#a9a396',
      marginX: 0.2,
      marginY: 0.22,
      metalness: 0.1,
      roughness: 0.75,
      lit: 0.32,
    },
    brick: {
      wall: isDark ? '#5a3a2e' : '#a86145',
      glassA: isDark ? '#2a343b' : '#4a5c68',
      glassB: isDark ? '#4b5d68' : '#8fb0c2',
      frame: isDark ? '#20140f' : '#6e4535',
      roof: isDark ? '#3a2a24' : '#8f6a5a',
      marginX: 0.22,
      marginY: 0.24,
      metalness: 0.05,
      roughness: 0.85,
      lit: 0.35,
    },
  };
}

const PX_PER_UNIT = 220;
const FLOOR_H = 0.14; // world-units per storey
const BAY_W = 0.16; // world-units per window bay

function makeFacade(w: number, h: number, seed: number, p: Palette, isDark: boolean) {
  if (typeof document === 'undefined') return null;

  const cw = Math.max(32, Math.round(w * PX_PER_UNIT));
  const ch = Math.max(32, Math.round(h * PX_PER_UNIT));
  const floors = Math.max(1, Math.round(h / FLOOR_H));
  const bays = Math.max(1, Math.round(w / BAY_W));
  const cellW = cw / bays;
  const cellH = ch / floors;
  const rand = mulberry32(seed);

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = cw;
  colorCanvas.height = ch;
  const ctx = colorCanvas.getContext('2d')!;

  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = cw;
  glowCanvas.height = ch;
  const gctx = glowCanvas.getContext('2d')!;

  ctx.fillStyle = p.wall;
  ctx.fillRect(0, 0, cw, ch);
  gctx.fillStyle = '#000000';
  gctx.fillRect(0, 0, cw, ch);

  for (let f = 0; f < floors; f++) {
    const isGround = f === floors - 1;
    for (let b = 0; b < bays; b++) {
      const x = b * cellW;
      const y = f * cellH;
      const mx = cellW * p.marginX;
      const my = isGround ? cellH * 0.08 : cellH * p.marginY;
      const wx = x + mx;
      const wy = y + my;
      const ww = cellW - mx * 2;
      const wh = cellH - my * 2;

      // glass gradient (sky reflection at top)
      const g = ctx.createLinearGradient(0, wy, 0, wy + wh);
      g.addColorStop(0, p.glassB);
      g.addColorStop(1, p.glassA);
      ctx.fillStyle = g;
      ctx.fillRect(wx, wy, ww, wh);

      // random brightness variation so it is not uniform
      ctx.fillStyle = `rgba(255,255,255,${(rand() * 0.14).toFixed(3)})`;
      ctx.fillRect(wx, wy, ww, wh);

      // lit window at night
      const lit = isDark && rand() < (isGround ? 0.7 : p.lit);
      if (lit) {
        const lightness = 55 + rand() * 22;
        gctx.fillStyle = `hsl(${36 + rand() * 10}, 90%, ${lightness}%)`;
        gctx.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = 'rgba(255, 214, 140, 0.35)';
        ctx.fillRect(wx, wy, ww, wh);
      }

      // frame + center mullion
      ctx.strokeStyle = p.frame;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(wx, wy, ww, wh);
      ctx.beginPath();
      ctx.moveTo(wx + ww / 2, wy);
      ctx.lineTo(wx + ww / 2, wy + wh);
      ctx.stroke();

      // sill highlight
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fillRect(wx - 1, wy + wh, ww + 2, 2);
    }
    // floor slab line
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, f * cellH, cw, 2);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const glow = new THREE.CanvasTexture(glowCanvas);
  glow.colorSpace = THREE.SRGBColorSpace;
  glow.anisotropy = 8;

  return { map, glow };
}

/* ------------------------------------------------------------------ */
/* Tower (box with facade on 4 sides and roof material on top/bottom)  */
/* ------------------------------------------------------------------ */

function Tower({
  position,
  size,
  palette,
  seed,
  isDark,
}: {
  position: [number, number, number];
  size: [number, number, number];
  palette: Palette;
  seed: number;
  isDark: boolean;
}) {
  const [w, h, d] = size;

  const mats = useMemo(() => {
    const make = (f: ReturnType<typeof makeFacade>) =>
      new THREE.MeshStandardMaterial({
        map: f?.map,
        color: '#ffffff',
        emissive: '#ffffff',
        emissiveMap: f?.glow,
        emissiveIntensity: isDark ? 1.15 : 0,
        metalness: palette.metalness,
        roughness: palette.roughness,
      });

    const sideX = make(makeFacade(d, h, seed, palette, isDark)); // faces +x / -x
    const sideZ = make(makeFacade(w, h, seed + 101, palette, isDark)); // faces +z / -z
    const roof = new THREE.MeshStandardMaterial({
      color: palette.roof,
      roughness: 0.9,
      metalness: 0.05,
    });
    // BoxGeometry order: +x, -x, +y, -y, +z, -z
    return [sideX, sideX, roof, roof, sideZ, sideZ] as THREE.MeshStandardMaterial[];
  }, [w, h, d, seed, palette, isDark]);

  useEffect(() => {
    return () => {
      const seen = new Set<THREE.MeshStandardMaterial>();
      mats.forEach((m) => {
        if (seen.has(m)) return;
        seen.add(m);
        m.map?.dispose();
        m.emissiveMap?.dispose();
        m.dispose();
      });
    };
  }, [mats]);

  return (
    <mesh position={position} castShadow receiveShadow material={mats}>
      <boxGeometry args={size} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Roof details (parapet + AC units)                                   */
/* ------------------------------------------------------------------ */

function RoofDetails({
  x,
  z,
  y,
  w,
  d,
  seed,
  units = true,
  isDark,
}: {
  x: number;
  z: number;
  y: number; // y of the roof surface
  w: number;
  d: number;
  seed: number;
  units?: boolean;
  isDark: boolean;
}) {
  const parapetColor = isDark ? '#3a3835' : '#a39e94';
  const unitColor = isDark ? '#55585b' : '#8a8d90';

  const unitList = useMemo(() => {
    if (!units) return [];
    const r = mulberry32(seed);
    const count = 2 + Math.floor(r() * 2);
    return Array.from({ length: count }, () => ({
      ux: (r() - 0.5) * Math.max(0, w - 0.28),
      uz: (r() - 0.5) * Math.max(0, d - 0.28),
      sw: 0.09 + r() * 0.08,
      sh: 0.05 + r() * 0.05,
      sd: 0.08 + r() * 0.07,
    }));
  }, [units, seed, w, d]);

  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.0125, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.03, 0.025, d + 0.03]} />
        <meshStandardMaterial color={parapetColor} roughness={0.85} />
      </mesh>
      {unitList.map((u, i) => (
        <mesh key={i} position={[u.ux, 0.025 + u.sh / 2, u.uz]} castShadow>
          <boxGeometry args={[u.sw, u.sh, u.sd]} />
          <meshStandardMaterial color={unitColor} roughness={0.7} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Trees and lamp posts                                                */
/* ------------------------------------------------------------------ */

const GROUND_TOP = -0.46;

function Tree({ position, scale = 1, isDark }: { position: [number, number]; scale?: number; isDark: boolean }) {
  const [x, z] = position;
  return (
    <group position={[x, GROUND_TOP, z]} scale={scale}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.018, 0.12, 6]} />
        <meshStandardMaterial color={isDark ? '#3a2a1e' : '#6b4a32'} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <icosahedronGeometry args={[0.1, 1]} />
        <meshStandardMaterial color={isDark ? '#2f4a2c' : '#5f8f4a'} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0.03, 0.29, 0.01]} castShadow>
        <icosahedronGeometry args={[0.065, 1]} />
        <meshStandardMaterial color={isDark ? '#3a5a35' : '#74a65a'} roughness={0.85} flatShading />
      </mesh>
    </group>
  );
}

function LampPost({ position, isDark }: { position: [number, number]; isDark: boolean }) {
  const [x, z] = position;
  return (
    <group position={[x, GROUND_TOP, z]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.006, 0.009, 0.3, 6]} />
        <meshStandardMaterial color={isDark ? '#2a2a2a' : '#555555'} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.315, 0]}>
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshStandardMaterial
          color="#fff1d0"
          emissive="#ffd9a0"
          emissiveIntensity={isDark ? 2.8 : 0.2}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Main building massing                                               */
/* ------------------------------------------------------------------ */

function BuildingMassing({ scrollProgress, isMobile }: { scrollProgress: ScrollProgress; isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const isDark = useIsDark();
  const colors = useBuildingColors();
  const P = useMemo(() => getPalettes(isDark), [isDark]);

  useFrame(() => {
    if (!groupRef.current) return;
    const sp = scrollProgress.current;
    groupRef.current.rotation.y = sp * Math.PI * 0.8;
    groupRef.current.position.y = Math.sin(sp * Math.PI) * 0.15 - 0.1;
  });

  const accentMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colors.accent,
        metalness: 0.9,
        roughness: 0.15,
        emissive: colors.accent,
        emissiveIntensity: 0.08,
      }),
    [colors.accent]
  );

  const groundMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: colors.ground, metalness: 0.3, roughness: 0.8 }),
    [colors.ground]
  );

  const gridMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colors.accent,
        metalness: 0.7,
        roughness: 0.3,
        opacity: 0.25,
        transparent: true,
      }),
    [colors.accent]
  );

  const roadMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: isDark ? '#26262a' : '#6b6b70', roughness: 0.95 }),
    [isDark]
  );
  const laneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: isDark ? '#b9b39f' : '#f1ecda', roughness: 0.8 }),
    [isDark]
  );

  const platform = isMobile ? 3.5 : 4.5;
  const half = platform / 2;
  const roadOffset = half - 0.18;
  const roadW = 0.26;
  const roadY = -0.45;
  const laneY = -0.433;

  const dashes = [-1.5, -0.9, -0.3, 0.3, 0.9, 1.5];

  const trees: [number, number][] = isMobile
    ? [[-1.1, 1.0], [-1.2, -1.0]]
    : [[-1.2, 1.1], [-1.55, 1.5], [-1.0, -1.3], [-0.3, -1.4], [1.75, 0.9], [1.7, -0.2]];

  return (
    <group ref={groupRef}>
      {/* Base platform */}
      <mesh position={[0, -0.5, 0]} receiveShadow material={groundMat}>
        <boxGeometry args={[platform, 0.08, platform]} />
      </mesh>

      {/* Ring road (desktop only) */}
      {!isMobile && (
        <>
          {[roadOffset, -roadOffset].map((z) => (
            <mesh key={`road-x-${z}`} position={[0, roadY, z]} receiveShadow material={roadMat}>
              <boxGeometry args={[platform - 0.1, 0.03, roadW]} />
            </mesh>
          ))}
          {[roadOffset, -roadOffset].map((x) => (
            <mesh key={`road-z-${x}`} position={[x, roadY, 0]} receiveShadow material={roadMat}>
              <boxGeometry args={[roadW, 0.03, platform - 0.1 - roadW * 2]} />
            </mesh>
          ))}
          {/* lane dashes */}
          {[roadOffset, -roadOffset].flatMap((z) =>
            dashes.map((x) => (
              <mesh key={`dash-x-${z}-${x}`} position={[x, laneY, z]} material={laneMat}>
                <boxGeometry args={[0.25, 0.004, 0.015]} />
              </mesh>
            ))
          )}
          {[roadOffset, -roadOffset].flatMap((x) =>
            dashes.map((z) => (
              <mesh key={`dash-z-${x}-${z}`} position={[x, laneY, z * 0.9]} material={laneMat}>
                <boxGeometry args={[0.015, 0.004, 0.25]} />
              </mesh>
            ))
          )}
        </>
      )}

      {/* ---------------- Main tower with podium + crown ---------------- */}

      {/* Podium */}
      <Tower position={[0, -0.21, 0]} size={[1.5, 0.5, 1.5]} palette={P.concrete} seed={11} isDark={isDark} />
      <RoofDetails x={0} z={0} y={0.04} w={1.5} d={1.5} seed={3} units={false} isDark={isDark} />

      {/* Central tower (glass) */}
      <Tower position={[0, 1.0, 0]} size={[0.9, 3.0, 0.9]} palette={P.glass} seed={21} isDark={isDark} />

      {/* Bronze corner fins */}
      {[
        [0.46, 0.46],
        [-0.46, 0.46],
        [0.46, -0.46],
        [-0.46, -0.46],
      ].map(([fx, fz], i) => (
        <mesh key={`fin-${i}`} position={[fx, 1.0, fz]} material={accentMat}>
          <boxGeometry args={[0.022, 3.0, 0.022]} />
        </mesh>
      ))}

      {/* Setback slab then crown */}
      <RoofDetails x={0} z={0} y={2.5} w={0.9} d={0.9} seed={5} units={false} isDark={isDark} />
      <Tower position={[0, 2.78, 0]} size={[0.6, 0.5, 0.6]} palette={P.glass} seed={31} isDark={isDark} />
      <mesh position={[0, 3.04, 0]} castShadow material={accentMat}>
        <boxGeometry args={[0.7, 0.05, 0.7]} />
      </mesh>

      {/* Roof service box + antenna */}
      <mesh position={[-0.15, 3.15, 0.05]} castShadow material={accentMat}>
        <boxGeometry args={[0.28, 0.18, 0.28]} />
      </mesh>
      <mesh position={[0.12, 3.5, -0.1]} castShadow>
        <cylinderGeometry args={[0.008, 0.014, 0.9, 8]} />
        <meshStandardMaterial color="#9aa0a6" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0.12, 3.97, -0.1]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={isDark ? 3 : 0.6} />
      </mesh>

      {/* ---------------- Surrounding buildings ---------------- */}

      {/* Mid tower left (concrete) */}
      <Tower position={[-1.2, 0.4, -0.3]} size={[0.75, 1.8, 0.75]} palette={P.concrete} seed={41} isDark={isDark} />
      <RoofDetails x={-1.2} z={-0.3} y={1.3} w={0.75} d={0.75} seed={7} isDark={isDark} />

      {/* Mid tower right — taller (teal glass) */}
      <Tower position={[1.2, 0.7, 0.2]} size={[0.65, 2.4, 0.65]} palette={P.teal} seed={51} isDark={isDark} />
      <RoofDetails x={1.2} z={0.2} y={1.9} w={0.65} d={0.65} seed={9} isDark={isDark} />
      <mesh position={[1.53, 0.7, 0.2]} material={accentMat}>
        <boxGeometry args={[0.015, 2.4, 0.015]} />
      </mesh>

      {/* Low block front (brick) */}
      <Tower position={[0.4, -0.1, 1.3]} size={[2.0, 0.8, 0.7]} palette={P.brick} seed={61} isDark={isDark} />
      <RoofDetails x={0.4} z={1.3} y={0.3} w={2.0} d={0.7} seed={13} isDark={isDark} />

      {/* Low block right back (concrete) */}
      <Tower position={[1.0, -0.2, -1.2]} size={[0.9, 0.6, 0.9]} palette={P.concrete} seed={71} isDark={isDark} />
      <RoofDetails x={1.0} z={-1.2} y={0.1} w={0.9} d={0.9} seed={17} isDark={isDark} />

      {/* Thin accent strip on mid tower left */}
      <mesh position={[-0.83, 0.4, -0.3]} material={accentMat}>
        <boxGeometry args={[0.015, 1.8, 0.015]} />
      </mesh>

      {/* ---------------- Landscaping ---------------- */}
      {trees.map(([tx, tz], i) => (
        <Tree key={`tree-${i}`} position={[tx, tz]} scale={0.9 + (i % 3) * 0.15} isDark={isDark} />
      ))}

      {!isMobile &&
        [
          [1.85, 1.85],
          [-1.85, 1.85],
          [1.85, -1.85],
          [-1.85, -1.85],
        ].map(([lx, lz], i) => <LampPost key={`lamp-${i}`} position={[lx, lz]} isDark={isDark} />)}

      {/* Plotted land grid lines */}
      {!isMobile &&
        [-1.5, -0.5, 0.5, 1.5].map((x) => (
          <mesh key={`grid-x-${x}`} position={[x, -0.45, 0]} material={gridMat}>
            <boxGeometry args={[0.015, 0.02, 3.6]} />
          </mesh>
        ))}
      {!isMobile &&
        [-1.5, -0.5, 0.5, 1.5].map((z) => (
          <mesh key={`grid-z-${z}`} position={[0, -0.45, z]} material={gridMat}>
            <boxGeometry args={[3.6, 0.02, 0.015]} />
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

/* ------------------------------------------------------------------ */
/* Floating prism                                                      */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Cameras                                                             */
/* ------------------------------------------------------------------ */

function ScrollCamera({ scrollProgress }: { scrollProgress: ScrollProgress }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const sp = scrollProgress.current;
    const x = 4 - sp * 2 + Math.sin(sp * Math.PI) * 1.5;
    const y = 3 - sp * 1.5;
    const z = 5 - sp * 1;

    camera.position.lerp(target.set(x, y, z), 0.05);
    camera.lookAt(0, 0.8, 0);
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
    camera.lookAt(0, 0.8, 0);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

function SceneContent({ scrollProgress, isMobile }: { scrollProgress: ScrollProgress; isMobile: boolean }) {
  const isDark = useIsDark();

  return (
    <>
      <ambientLight intensity={isDark ? 0.3 : 0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={isDark ? 0.8 : 1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
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
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
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