"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  planets,
  dwarfPlanets,
  orbitalParams,
  type Planet,
} from "@/lib/planet-data";
import { textureConfigs } from "@/lib/texture-config";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Texture-loading planet sphere for the overview scene (smaller, simpler)
// ---------------------------------------------------------------------------
function TexturedMiniPlanet({
  color,
  size,
  planetId,
}: {
  color: string;
  size: number;
  planetId: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const config = textureConfigs[planetId];
    if (!config) return;
    const diffuse = config.layers.find(
      (l) => l.type === "diffuse" && (l.id === "surface" || l.id === "clouds"),
    );
    if (!diffuse?.url) return;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    loader.load(
      diffuse.url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      () => {}, // silently fallback
    );
    return () => {
      if (texture) texture.dispose();
    };
  }, [planetId]);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 32, 32]} />
      {texture ? (
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.05} />
      ) : (
        <meshStandardMaterial color={color} roughness={0.6} />
      )}
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Sun with texture
// ---------------------------------------------------------------------------
function SunBody() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const config = textureConfigs["sun"];
    if (!config) return;
    const diffuse = config.layers.find((l) => l.id === "surface");
    if (!diffuse?.url) return;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    loader.load(diffuse.url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
    return () => {
      if (texture) texture.dispose();
    };
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 48, 48]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            emissive="#ff8c00"
            emissiveIntensity={2}
            emissiveMap={texture}
          />
        ) : (
          <meshStandardMaterial
            color="#ffd700"
            emissive="#ff8c00"
            emissiveIntensity={3}
          />
        )}
      </mesh>
      <pointLight color="#ffd700" intensity={300} distance={200} />
      <pointLight color="#fff5e6" intensity={100} distance={80} />
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
        opacity={config.atmosphereIntensity * 0.15}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Planet Body in orbital scene
// ---------------------------------------------------------------------------
function PlanetBody({
  planet,
  params,
  speedMultiplier,
  showOrbits,
  showLabels,
  onSelect,
  isSelected,
}: {
  planet: Planet;
  params: { radius: number; speed: number; size: number; inclination: number };
  speedMultiplier: number;
  showOrbits: boolean;
  showLabels: boolean;
  onSelect: (planet: Planet) => void;
  isSelected: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime * params.speed * speedMultiplier * 0.3;
      groupRef.current.position.x = Math.cos(t) * params.radius;
      groupRef.current.position.z = Math.sin(t) * params.radius;
    }
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += 0.01;
    }
  });

  const _config = textureConfigs[planet.id];

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

        {/* Ring for Saturn */}
        {planet.id === "saturn" && (
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <ringGeometry args={[params.size * 1.4, params.size * 2.2, 64]} />
            <meshStandardMaterial
              color="#d4c090"
              side={THREE.DoubleSide}
              transparent
              opacity={0.5}
            />
          </mesh>
        )}
        {/* Ring for Uranus */}
        {planet.id === "uranus" && (
          <mesh rotation={[0.1, 0, Math.PI / 2]}>
            <ringGeometry args={[params.size * 1.5, params.size * 1.8, 64]} />
            <meshStandardMaterial
              color="#a0c8c8"
              side={THREE.DoubleSide}
              transparent
              opacity={0.3}
            />
          </mesh>
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
function CameraController({ target }: { target: THREE.Vector3 | null }) {
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (target && controlsRef.current) {
      controlsRef.current.target.lerp(target, 0.03);
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
  speedMultiplier,
  selectedPlanet,
  onSelectPlanet,
}: {
  showOrbits: boolean;
  showLabels: boolean;
  speedMultiplier: number;
  selectedPlanet: Planet | null;
  onSelectPlanet: (planet: Planet) => void;
}) {
  const cameraTarget = useMemo(() => {
    if (!selectedPlanet) return null;
    return new THREE.Vector3(0, 0, 0);
  }, [selectedPlanet]);

  const allPlanets = [...planets, ...dwarfPlanets];

  return (
    <>
      <ambientLight intensity={0.08} />
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
            speedMultiplier={speedMultiplier}
            showOrbits={showOrbits}
            showLabels={showLabels}
            onSelect={onSelectPlanet}
            isSelected={selectedPlanet?.id === planet.id}
          />
        );
      })}
      <SceneStars />
      <CameraController target={cameraTarget} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------
export function SolarSystemScene({
  showOrbits,
  showLabels,
  speedMultiplier,
  selectedPlanet,
  onSelectPlanet,
}: {
  showOrbits: boolean;
  showLabels: boolean;
  speedMultiplier: number;
  selectedPlanet: Planet | null;
  onSelectPlanet: (planet: Planet) => void;
}) {
  return (
    <Canvas
      camera={{ position: [15, 12, 25], fov: 50 }}
      gl={{ antialias: true }}
      className="!absolute inset-0"
    >
      <SolarSystemInner
        showOrbits={showOrbits}
        showLabels={showLabels}
        speedMultiplier={speedMultiplier}
        selectedPlanet={selectedPlanet}
        onSelectPlanet={onSelectPlanet}
      />
    </Canvas>
  );
}
