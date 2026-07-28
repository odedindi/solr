"use client";

import { Suspense, useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Line,
  Detailed,
  AdaptiveDpr,
  PerformanceMonitor,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import {
  planets,
  dwarfPlanets,
  orbitalParams,
  type Planet,
} from "@/lib/planet-data";
import { textureConfigs } from "@/lib/texture-config";
import { useRouter } from "next/navigation";
import { useTimeStore } from "@/lib/time-store";

// ---------------------------------------------------------------------------
// Preload inner planet textures for instant display on scene mount
// ---------------------------------------------------------------------------
const INNER_PLANET_IDS = ["mercury", "venus", "earth", "mars"] as const;
for (const id of INNER_PLANET_IDS) {
  const cfg = textureConfigs[id];
  const layer = cfg?.layers.find(
    (l) => l.type === "diffuse" && (l.id === "surface" || l.id === "clouds"),
  );
  if (layer?.url) useTexture.preload(layer.url);
}
const _sunLayer = textureConfigs.sun?.layers.find((l) => l.id === "surface");
if (_sunLayer?.url) useTexture.preload(_sunLayer.url);

// ---------------------------------------------------------------------------
// Frame-level time ticker — advances the zustand time store each frame
// ---------------------------------------------------------------------------
function TimeTicker() {
  useFrame((_, delta) => {
    useTimeStore.getState().tick(delta);
  });
  return null;
}

// ---------------------------------------------------------------------------
// Texture-loading planet sphere for the overview scene (smaller, simpler)
// ---------------------------------------------------------------------------
function ColorFallbackLOD({ color, size }: { color: string; size: number }) {
  return (
    <Detailed distances={[0, 20, 50]}>
      <mesh>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.0} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.0} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.0} />
      </mesh>
    </Detailed>
  );
}

function TexturedLOD({ size, url }: { size: number; url: string }) {
  const texture = useTexture(url);
  return (
    <Detailed distances={[0, 20, 50]}>
      <mesh>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0.0} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0.0} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0.0} />
      </mesh>
    </Detailed>
  );
}

function TexturedMiniPlanet({
  color,
  size,
  planetId,
}: {
  color: string;
  size: number;
  planetId: string;
}) {
  const config = textureConfigs[planetId];
  const diffuse = config?.layers.find(
    (l) => l.type === "diffuse" && (l.id === "surface" || l.id === "clouds"),
  );

  if (!diffuse?.url) {
    return <ColorFallbackLOD color={color} size={size} />;
  }

  return (
    <Suspense fallback={<ColorFallbackLOD color={color} size={size} />}>
      <TexturedLOD size={size} url={diffuse.url} />
    </Suspense>
  );
}

// ---------------------------------------------------------------------------
// Sun with texture
// ---------------------------------------------------------------------------
function SunBody() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(
    textureConfigs["sun"]?.layers.find((l) => l.id === "surface")?.url ?? "",
  );

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = useTimeStore.getState().elapsedTime * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          emissive="#ffffff"
          emissiveMap={texture}
          emissiveIntensity={1.2}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.18, 32, 32]} />
        <meshBasicMaterial
          color="#ffb347"
          transparent
          opacity={0.22}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.6, 32, 32]} />
        <meshBasicMaterial
          color="#ff8c00"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#fff2d6" intensity={4} distance={0} decay={0} />
      <pointLight color="#ffd27a" intensity={2} distance={150} decay={1.2} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Orbit Line
// ---------------------------------------------------------------------------
function OrbitLine({
  radius,
  inclination = 0,
  visible = true,
}: {
  radius: number;
  inclination?: number;
  visible?: boolean;
}) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 256; i++) {
      const angle = (i / 256) * Math.PI * 2;
      pts.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return pts;
  }, [radius]);

  if (!visible) return null;

  return (
    <group rotation={[0, 0, (inclination * Math.PI) / 180]}>
      <Line
        points={points}
        color="#1e3a5f"
        transparent
        opacity={0.35}
        lineWidth={1}
      />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Mini atmosphere for overview planets
// ---------------------------------------------------------------------------
function MiniAtmosphere({
  size,
  planetId,
}: {
  size: number;
  planetId: string;
}) {
  const config = textureConfigs[planetId];
  if (!config?.hasAtmosphere) return null;

  const color = new THREE.Color(config.atmosphereColor);

  return (
    <mesh>
      <sphereGeometry args={[size * 1.08, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={config.atmosphereIntensity * 0.4}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function MiniRingFallback({
  config,
  planetId,
  size,
}: {
  config: (typeof textureConfigs)[string];
  planetId: string;
  size: number;
}) {
  const inner = size * (config.ringInnerRadius || 1.3);
  const outer = size * (config.ringOuterRadius || 2.2);
  const opacity = config.ringOpacity || 0.5;

  let rotation: [number, number, number] = [Math.PI / 2.5, 0, 0];
  if (planetId === "uranus") rotation = [0.1, 0, Math.PI / 2];
  else if (planetId === "jupiter" || planetId === "neptune")
    rotation = [Math.PI / 2, 0, 0];

  const ringColors: Record<string, string> = {
    saturn: "#d4c090",
    uranus: "#a0c8c8",
    jupiter: "#8b7355",
    neptune: "#4a5a8a",
  };

  return (
    <mesh rotation={rotation}>
      <ringGeometry args={[inner, outer, 128]} />
      <meshStandardMaterial
        color={ringColors[planetId] || "#cccccc"}
        side={THREE.DoubleSide}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

function MiniRingTextured({
  config,
  planetId,
  size,
  url,
}: {
  config: (typeof textureConfigs)[string];
  planetId: string;
  size: number;
  url: string;
}) {
  const ringTex = useTexture(url);

  const inner = size * (config.ringInnerRadius || 1.3);
  const outer = size * (config.ringOuterRadius || 2.2);
  const opacity = config.ringOpacity || 0.5;

  let rotation: [number, number, number] = [Math.PI / 2.5, 0, 0];
  if (planetId === "uranus") rotation = [0.1, 0, Math.PI / 2];
  else if (planetId === "jupiter" || planetId === "neptune")
    rotation = [Math.PI / 2, 0, 0];

  const ringColors: Record<string, string> = {
    saturn: "#d4c090",
    uranus: "#a0c8c8",
    jupiter: "#8b7355",
    neptune: "#4a5a8a",
  };

  return (
    <mesh rotation={rotation}>
      <ringGeometry args={[inner, outer, 128]} />
      <meshStandardMaterial
        map={ringTex}
        color={ringColors[planetId] || "#cccccc"}
        side={THREE.DoubleSide}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

function MiniRing({ planetId, size }: { planetId: string; size: number }) {
  const config = textureConfigs[planetId];
  if (!config?.hasRings) return null;

  if (!config.ringTexture) {
    return <MiniRingFallback config={config} planetId={planetId} size={size} />;
  }

  return (
    <Suspense fallback={<MiniRingFallback config={config} planetId={planetId} size={size} />}>
      <MiniRingTextured
        config={config}
        planetId={planetId}
        size={size}
        url={config.ringTexture}
      />
    </Suspense>
  );
}

// ---------------------------------------------------------------------------
// Planet Body in orbital scene
// ---------------------------------------------------------------------------
function PlanetBody({
  planet,
  params,
  showOrbits,
  showLabels,
  onSelect,
  isSelected,
  onPositionUpdate,
}: {
  planet: Planet;
  params: { radius: number; speed: number; size: number; inclination: number };
  showOrbits: boolean;
  showLabels: boolean;
  onSelect: (planet: Planet) => void;
  isSelected: boolean;
  onPositionUpdate?: (id: string, pos: THREE.Vector3) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  useFrame(() => {
    if (groupRef.current) {
      const t = useTimeStore.getState().elapsedTime * params.speed * 0.3;
      groupRef.current.position.x = Math.cos(t) * params.radius;
      groupRef.current.position.z = Math.sin(t) * params.radius;

      if (isSelected && onPositionUpdate) {
        onPositionUpdate(planet.id, groupRef.current.position);
      }
    }
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <>
      <OrbitLine
        radius={params.radius}
        inclination={params.inclination}
        visible={showOrbits}
      />
      <group ref={groupRef}>
        <group ref={planetMeshRef}>
          <TexturedMiniPlanet
            color={planet.color}
            size={params.size}
            planetId={planet.id}
          />
          <MiniAtmosphere size={params.size} planetId={planet.id} />
        </group>

        {textureConfigs[planet.id]?.hasRings && (
          <MiniRing planetId={planet.id} size={params.size} />
        )}

        {/* Click handler - invisible sphere slightly larger */}
        <mesh
          visible={false}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(planet);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            router.push(`/planets/${planet.id}`);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
        >
          <sphereGeometry args={[params.size * 1.5, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Hover/selection glow */}
        {(hovered || isSelected) && (
          <mesh>
            <sphereGeometry args={[params.size * 1.15, 32, 32]} />
            <meshBasicMaterial
              color={planet.color}
              transparent
              opacity={0.2}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Label */}
        {(showLabels || hovered || isSelected) && (
          <Html
            position={[0, params.size + 0.5, 0]}
            center
            distanceFactor={15}
            style={{ pointerEvents: "none" }}
          >
            <div className="whitespace-nowrap rounded-md bg-card/90 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm border border-border/50">
              {planet.name}
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

// ---------------------------------------------------------------------------
// Asteroid Belt
// ---------------------------------------------------------------------------
function AsteroidBelt() {
  const count = 800;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useMemo(() => {
    if (!meshRef.current) return;
    const temp = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const r = 9.5 + Math.random() * 1.5;
      const y = (Math.random() - 0.5) * 0.5;
      temp.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
      temp.scale.setScalar(0.01 + Math.random() * 0.03);
      temp.updateMatrix();
      meshRef.current.setMatrixAt(i, temp.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial color="#555555" roughness={0.9} />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// Scene Stars
// ---------------------------------------------------------------------------
function SceneStars({ count = 4000 }: { count?: number }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 120;
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
        size={0.08}
        sizeAttenuation
        color="#a8c4e0"
        transparent
        opacity={0.8}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Camera Controller
// ---------------------------------------------------------------------------
function CameraController({
  target,
  cameraPosition,
}: {
  target: THREE.Vector3 | null;
  cameraPosition: THREE.Vector3 | null;
}) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (controlsRef.current) {
      if (target) {
        controlsRef.current.target.lerp(target, 0.03);
      }
      if (cameraPosition) {
        camera.position.lerp(cameraPosition, 0.03);
      }
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableZoom
      maxDistance={80}
      minDistance={3}
      zoomSpeed={0.5}
    />
  );
}

// ---------------------------------------------------------------------------
// Inner Scene
// ---------------------------------------------------------------------------
function SolarSystemInner({
  showOrbits,
  showLabels,
  selectedPlanet,
  onSelectPlanet,
}: {
  showOrbits: boolean;
  showLabels: boolean;
  selectedPlanet: Planet | null;
  onSelectPlanet: (planet: Planet) => void;
}) {
  const planetPositions = useRef<Record<string, THREE.Vector3>>({});

  const handlePositionUpdate = useCallback((id: string, pos: THREE.Vector3) => {
    if (!planetPositions.current[id]) {
      planetPositions.current[id] = new THREE.Vector3();
    }
    planetPositions.current[id].copy(pos);
  }, []);

  const cameraTarget = useMemo(() => {
    if (!selectedPlanet) return null;
    return (
      planetPositions.current[selectedPlanet.id] ?? new THREE.Vector3(0, 0, 0)
    );
  }, [selectedPlanet]);

  const cameraPosition = useMemo(() => {
    if (!selectedPlanet) return null;
    const params =
      orbitalParams[selectedPlanet.id as keyof typeof orbitalParams];
    if (!params) return null;
    const offset = params.size * 4 + 3;
    const pos = planetPositions.current[selectedPlanet.id];
    if (pos) {
      return new THREE.Vector3(
        pos.x + offset * 0.5,
        offset * 0.6,
        pos.z + offset * 0.5,
      );
    }
    return new THREE.Vector3(offset, offset * 0.6, offset);
  }, [selectedPlanet]);

  const allPlanets = [...planets, ...dwarfPlanets];

  return (
    <>
      <PerformanceMonitor />
      <AdaptiveDpr pixelated />
      <TimeTicker />
      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#7ea8d6", "#1a1a2a", 0.35]} />
      <SunBody />
      <AsteroidBelt />
      {allPlanets.map((planet) => {
        const params = orbitalParams[planet.id as keyof typeof orbitalParams];
        if (!params) return null;
        return (
          <PlanetBody
            key={planet.id}
            planet={planet}
            params={params}
            showOrbits={showOrbits}
            showLabels={showLabels}
            onSelect={onSelectPlanet}
            isSelected={selectedPlanet?.id === planet.id}
            onPositionUpdate={handlePositionUpdate}
          />
        );
      })}
      <SceneStars />
      <CameraController target={cameraTarget} cameraPosition={cameraPosition} />
      <EffectComposer enableNormalPass={false}>
        <Bloom
          luminanceThreshold={0.9}
          luminanceSmoothing={0.4}
          intensity={0.6}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------
export function SolarSystemScene({
  showOrbits,
  showLabels,
  selectedPlanet,
  onSelectPlanet,
}: {
  showOrbits: boolean;
  showLabels: boolean;
  selectedPlanet: Planet | null;
  onSelectPlanet: (planet: Planet) => void;
}) {
  return (
    <Canvas
      camera={{ position: [15, 12, 25], fov: 50 }}
      gl={{ antialias: true }}
      className="!absolute inset-0"
      dpr={[1, 1.5]}
    >
      <SolarSystemInner
        showOrbits={showOrbits}
        showLabels={showLabels}
        selectedPlanet={selectedPlanet}
        onSelectPlanet={onSelectPlanet}
      />
    </Canvas>
  );
}
