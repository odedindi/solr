"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Line,
  AdaptiveDpr,
  PerformanceMonitor,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { textureConfigs } from "@/lib/texture-config";

const SUN_URL =
  textureConfigs["sun"]?.layers.find((l) => l.id === "surface")?.url ?? "";
if (SUN_URL) useTexture.preload(SUN_URL);

const INNER_IDS = ["mercury", "venus", "earth", "mars"] as const;
for (const id of INNER_IDS) {
  const cfg = textureConfigs[id];
  const layer = cfg?.layers.find(
    (l) => l.type === "diffuse" && (l.id === "surface" || l.id === "clouds"),
  );
  if (layer?.url) useTexture.preload(layer.url);
}

// ---------------------------------------------------------------------------
// Textured Sun
// ---------------------------------------------------------------------------
function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(SUN_URL);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          emissive="#ffffff"
          emissiveMap={texture}
          emissiveIntensity={1.2}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial
          color="#ffb347"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#fff2d6" intensity={3} distance={0} decay={0} />
      <pointLight color="#ffd27a" intensity={1.5} distance={80} decay={1.2} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Orbit Path
// ---------------------------------------------------------------------------
function OrbitPath({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return pts;
  }, [radius]);

  return (
    <Line
      points={points}
      color="#1a2d4a"
      transparent
      opacity={0.4}
      lineWidth={1}
    />
  );
}

// ---------------------------------------------------------------------------
// Textured Hero Planet
// ---------------------------------------------------------------------------
function HeroPlanet({
  radius,
  speed,
  size,
  color,
  planetId,
  hasRing,
}: {
  radius: number;
  speed: number;
  size: number;
  color: string;
  planetId: string;
  hasRing?: boolean;
}) {
  const config = textureConfigs[planetId];
  const diffuse = config?.layers.find(
    (l) => l.type === "diffuse" && (l.id === "surface" || l.id === "clouds"),
  );

  return (
    <>
      <OrbitPath radius={radius} />
      {diffuse?.url ? (
        <Suspense fallback={<HeroPlanetFallback radius={radius} speed={speed} size={size} color={color} planetId={planetId} hasRing={hasRing} />}>
          <HeroPlanetTextured radius={radius} speed={speed} size={size} planetId={planetId} url={diffuse.url} hasRing={hasRing} />
        </Suspense>
      ) : (
        <HeroPlanetFallback radius={radius} speed={speed} size={size} color={color} planetId={planetId} hasRing={hasRing} />
      )}
    </>
  );
}

function HeroPlanetFallback({
  radius,
  speed,
  size,
  color,
  planetId,
  hasRing,
}: {
  radius: number;
  speed: number;
  size: number;
  color: string;
  planetId: string;
  hasRing?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime * speed;
      groupRef.current.position.x = Math.cos(t) * radius;
      groupRef.current.position.z = Math.sin(t) * radius;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const cfg = textureConfigs[planetId];

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {cfg?.hasAtmosphere && (
        <mesh>
          <sphereGeometry args={[size * 1.1, 24, 24]} />
          <meshBasicMaterial
            color={cfg.atmosphereColor || "#000"}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      {hasRing && (
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[size * 1.4, size * 2, 32]} />
          <meshStandardMaterial
            color="#c8b080"
            side={THREE.DoubleSide}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

function HeroPlanetTextured({
  radius,
  speed,
  size,
  planetId,
  url,
  hasRing,
}: {
  radius: number;
  speed: number;
  size: number;
  planetId: string;
  url: string;
  hasRing?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(url);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime * speed;
      groupRef.current.position.x = Math.cos(t) * radius;
      groupRef.current.position.z = Math.sin(t) * radius;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const cfg = textureConfigs[planetId];

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>
      {cfg?.hasAtmosphere && (
        <mesh>
          <sphereGeometry args={[size * 1.1, 24, 24]} />
          <meshBasicMaterial
            color={cfg.atmosphereColor || "#000"}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      {hasRing && (
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[size * 1.4, size * 2, 32]} />
          <meshStandardMaterial
            color="#c8b080"
            side={THREE.DoubleSide}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Stars
// ---------------------------------------------------------------------------
function HeroStars({ count = 2000 }: { count?: number }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        sizeAttenuation
        color="#c8d8f0"
        transparent
        opacity={0.7}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
function Scene() {
  return (
    <>
      <PerformanceMonitor />
      <AdaptiveDpr pixelated />
      <ambientLight intensity={0.95} />
      <hemisphereLight args={["#7ea8d6", "#1a1a2a", 0.4]} />
      <Sun />
      <HeroPlanet
        radius={3}
        speed={0.8}
        size={0.12}
        color="#8c7e6d"
        planetId="mercury"
      />
      <HeroPlanet
        radius={4.2}
        speed={0.6}
        size={0.25}
        color="#e6c87a"
        planetId="venus"
      />
      <HeroPlanet
        radius={5.5}
        speed={0.45}
        size={0.27}
        color="#4a90d9"
        planetId="earth"
      />
      <HeroPlanet
        radius={7}
        speed={0.35}
        size={0.17}
        color="#c1440e"
        planetId="mars"
      />
      <HeroPlanet
        radius={10}
        speed={0.2}
        size={0.7}
        color="#c88b3a"
        planetId="jupiter"
      />
      <HeroPlanet
        radius={13.5}
        speed={0.12}
        size={0.6}
        color="#e8d5a3"
        planetId="saturn"
        hasRing
      />
      <HeroPlanet
        radius={17}
        speed={0.07}
        size={0.4}
        color="#7ec8c8"
        planetId="uranus"
      />
      <HeroPlanet
        radius={20}
        speed={0.04}
        size={0.38}
        color="#3f54ba"
        planetId="neptune"
      />
      <HeroStars />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 4}
      />
      <EffectComposer enableNormalPass={false}>
        <Bloom
          luminanceThreshold={0.9}
          luminanceSmoothing={0.4}
          intensity={0.5}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [12, 10, 18], fov: 50 }}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
