"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { dwarfPlanets, planets, zoomConfig, type Moon, type Planet } from "@/lib/planet-data";
import {
  getAppearanceLayer,
  getTextureConfig,
  type PlanetTextureConfig,
} from "@/lib/texture-config";
import {
  defaultLayerStates,
  effectiveLayerStates,
  mergeLayerStates,
  type LayerStates,
  type ViewMode,
} from "@/lib/layer-state";
import satelliteIndex from "@/lib/satellite-index.json";
import { PlanetBody, PlanetLights } from "./planet/planet-body";
import { LayerControlPanel } from "./planet/layer-panel";
import { useProgressiveTexture, useTextureCandidates } from "./planet/use-planet-texture";

const ALL_BODIES = [...planets, ...dwarfPlanets];

/** The Sun sits on the -X axis; every planet in the detail scene is lit from there. */
const SUN_DIRECTION = new THREE.Vector3(-1, 0, 0);

const DEFAULT_ZOOM = {
  minDistance: 3.5,
  maxDistance: 180,
  cameraOffset: [-5, 2.5, 7] as [number, number, number],
};

// ---------------------------------------------------------------------------
// Distance scale: sqrt compresses real distances while preserving the feeling
// that outer planets are dramatically farther than inner ones.
// Base unit: Mercury's orbit (57.9M km) = 18 scene units.
// ---------------------------------------------------------------------------
const DISTANCE_BASE = 57.9;
const DISTANCE_SCALE = 18;

function compressedDistance(distanceFromSun: number): number {
  return Math.sqrt(distanceFromSun / DISTANCE_BASE) * DISTANCE_SCALE;
}

// ---------------------------------------------------------------------------
// Moons
// ---------------------------------------------------------------------------
type SatelliteEntry = { jpg: string; webp: string };

const SAT = "/assets/textures";
/** Curated satellite textures; take precedence over the auto-generated index. */
const MOON_TEXTURES: Record<string, SatelliteEntry> = {
  moon: {
    jpg: `${SAT}/earth/satellites/moon_4k.jpg`,
    webp: `${SAT}/earth/satellites/moon_4k.webp`,
  },
};
const SATELLITE_INDEX = satelliteIndex as Record<string, SatelliteEntry>;
const MOON_FALLBACK = [`${SAT}/asteroids/asteroid.webp`, `${SAT}/asteroids/asteroid.jpg`];

function MoonBody({ size, moonName }: { size: number; moonName: string }) {
  const key = moonName.toLowerCase();
  const candidates = useMemo(() => {
    const list: string[] = [];
    for (const entry of [MOON_TEXTURES[key], SATELLITE_INDEX[key]]) {
      if (entry) list.push(entry.webp, entry.jpg);
    }
    return [...list.filter(Boolean), ...MOON_FALLBACK];
  }, [key]);
  const tex = useTextureCandidates(candidates);

  return (
    <mesh>
      <sphereGeometry args={[size, 32, 32]} />
      <meshPhongMaterial
        key={tex ? "tex" : "plain"}
        map={tex}
        color={tex ? "#ffffff" : "#aaaaaa"}
        specular="#000000"
        shininess={2}
      />
    </mesh>
  );
}

function MoonOrbit({
  moon,
  index,
  showOrbit,
  planetDiameter,
}: {
  moon: Moon;
  index: number;
  showOrbit: boolean;
  planetDiameter: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const radius = (moon.distanceFromPlanet / planetDiameter) * 0.3;
  const speed = 0.5 / (index + 1);

  const orbitPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    }
    return pts;
  }, [radius]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * speed;
    groupRef.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
  });

  const moonSize = Math.min(0.3, Math.max(0.1, moon.diameter / 5000));
  return (
    <>
      {showOrbit && (
        <Line points={orbitPoints} color="#1e3a5f" transparent opacity={0.3} lineWidth={1} />
      )}
      <group ref={groupRef}>
        <MoonBody size={moonSize} moonName={moon.name} />
      </group>
    </>
  );
}

// ---------------------------------------------------------------------------
// Context: distant Sun and the other planets along the Sun line
// ---------------------------------------------------------------------------
function DetailSun({ distance }: { distance: number }) {
  const position = useMemo(
    () => SUN_DIRECTION.clone().multiplyScalar(distance).toArray() as [number, number, number],
    [distance],
  );
  return (
    <mesh position={position}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshBasicMaterial color="#fff1c4" toneMapped={false} />
    </mesh>
  );
}

function PlanetDot({ planet, position }: { planet: Planet; position: [number, number, number] }) {
  const tex = useProgressiveTexture(getAppearanceLayer(planet.id), { hiRes: false });
  const size = 0.08 + (planet.diameter / 142984) * 0.3;
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshPhongMaterial
        key={tex ? "tex" : "plain"}
        map={tex}
        color={tex ? "#ffffff" : planet.color}
        specular="#000000"
        shininess={2}
      />
    </mesh>
  );
}

function OtherPlanets({ current }: { current: Planet }) {
  const currentDist = compressedDistance(current.distanceFromSun);
  return (
    <>
      {ALL_BODIES.filter((p) => p.id !== current.id).map((p) => (
        <PlanetDot
          key={p.id}
          planet={p}
          position={[compressedDistance(p.distanceFromSun) - currentDist, 0, 0]}
        />
      ))}
    </>
  );
}

function DetailStars({ count = 2000 }: { count?: number }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 250 + Math.random() * 100;
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
      <pointsMaterial size={1} sizeAttenuation={false} color="#a8c4e0" transparent opacity={0.6} />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
function PlanetScene({
  planet,
  config,
  layers,
  showMoonOrbits,
  viewMode,
}: {
  planet: Planet;
  config: PlanetTextureConfig;
  layers: LayerStates;
  showMoonOrbits: boolean;
  viewMode: ViewMode;
}) {
  const zoom = zoomConfig[planet.id] ?? DEFAULT_ZOOM;
  return (
    <>
      <PlanetLights viewMode={viewMode} sunDirection={SUN_DIRECTION} />
      <DetailSun distance={compressedDistance(planet.distanceFromSun)} />
      <OtherPlanets current={planet} />
      <PlanetBody
        planet={planet}
        config={config}
        layers={layers}
        viewMode={viewMode}
        sunDirection={SUN_DIRECTION}
      />
      {planet.moons.map((moon, i) => (
        <MoonOrbit
          key={moon.name}
          moon={moon}
          index={i}
          showOrbit={showMoonOrbits}
          planetDiameter={planet.diameter}
        />
      ))}
      <DetailStars />
      <OrbitControls
        enablePan={false}
        minDistance={zoom.minDistance}
        maxDistance={zoom.maxDistance}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Persisted per-planet preferences
// ---------------------------------------------------------------------------
const PREFS_KEY = "Solr:planet-layer-prefs:v2";

type LayerPrefs = { viewMode: ViewMode; layers: LayerStates };

function loadPrefs(planetId: string): Partial<LayerPrefs> | null {
  try {
    const raw = window.localStorage.getItem(`${PREFS_KEY}:${planetId}`);
    const parsed = raw ? (JSON.parse(raw) as Partial<LayerPrefs>) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function savePrefs(planetId: string, prefs: LayerPrefs | null) {
  try {
    const key = `${PREFS_KEY}:${planetId}`;
    if (prefs) window.localStorage.setItem(key, JSON.stringify(prefs));
    else window.localStorage.removeItem(key);
  } catch {
    // storage unavailable or full
  }
}

function sameStates(a: LayerStates, b: LayerStates) {
  const ids = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const id of ids) {
    if (a[id]?.enabled !== b[id]?.enabled) return false;
    if (Math.abs((a[id]?.opacity ?? 0) - (b[id]?.opacity ?? 0)) > 0.001) return false;
  }
  return true;
}

const EMPTY_CONFIG = (planet: Planet): PlanetTextureConfig => ({
  planetId: planet.id,
  layers: [],
  hasAtmosphere: false,
  atmosphereColor: "#000000",
  atmosphereIntensity: 0,
  atmosphereThickness: 0,
  hasRings: false,
});

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function Planet3D({
  planet,
  showMoonOrbits = true,
}: {
  planet: Planet;
  showMoonOrbits?: boolean;
}) {
  const textureConfig = getTextureConfig(planet.id);
  const config = textureConfig ?? EMPTY_CONFIG(planet);
  const defaults = useMemo(() => defaultLayerStates(textureConfig), [textureConfig]);

  const [viewMode, setViewMode] = useState<ViewMode>("realistic");
  const [layerStates, setLayerStates] = useState<LayerStates>(defaults);
  const hydrated = useRef(false);

  // Restore saved preferences after mount (avoids an SSR mismatch).
  useEffect(() => {
    const prefs = loadPrefs(planet.id);
    if (prefs) {
      setViewMode(prefs.viewMode === "enhanced" ? "enhanced" : "realistic");
      setLayerStates(mergeLayerStates(textureConfig, defaults, prefs.layers));
    }
    hydrated.current = true;
  }, [planet.id, textureConfig, defaults]);

  const isDefault = viewMode === "realistic" && sameStates(layerStates, defaults);

  useEffect(() => {
    if (!hydrated.current) return;
    savePrefs(planet.id, isDefault ? null : { viewMode, layers: layerStates });
  }, [planet.id, viewMode, layerStates, isDefault]);

  const handleToggleLayer = useCallback((id: string) => {
    setLayerStates((prev) => ({ ...prev, [id]: { ...prev[id], enabled: !prev[id]?.enabled } }));
  }, []);

  const handleChangeOpacity = useCallback((id: string, opacity: number) => {
    setLayerStates((prev) => ({ ...prev, [id]: { ...prev[id], opacity } }));
  }, []);

  const handleReset = useCallback(() => {
    setViewMode("realistic");
    setLayerStates(defaults);
  }, [defaults]);

  const effective = useMemo(() => effectiveLayerStates(config, layerStates), [config, layerStates]);
  const zoom = zoomConfig[planet.id] ?? DEFAULT_ZOOM;

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: zoom.cameraOffset, fov: 45, near: 0.1, far: 2000 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        dpr={[1, 1.5]}
      >
        <PlanetScene
          planet={planet}
          config={config}
          layers={effective}
          showMoonOrbits={showMoonOrbits}
          viewMode={viewMode}
        />
      </Canvas>

      {config.layers.length > 0 && (
        <LayerControlPanel
          config={config}
          layerStates={layerStates}
          onToggleLayer={handleToggleLayer}
          onChangeOpacity={handleChangeOpacity}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onReset={handleReset}
          isDefault={isDefault}
        />
      )}
    </div>
  );
}
