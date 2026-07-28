"use client";

import { Suspense, useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { planets, dwarfPlanets, zoomConfig, type Planet, type Moon } from "@/lib/planet-data";
import {
  getTextureConfig,
  textureConfigs,
  type PlanetTextureConfig,
} from "@/lib/texture-config";
import { Info, Layers, ChevronDown, ChevronUp } from "lucide-react";
import {
  AtmosphereVertexShader,
  AtmosphereFragmentShader,
  NightLightsVertexShader,
  NightLightsFragmentShader,
} from "@/lib/shaders";

const ALL_BODIES = [...planets, ...dwarfPlanets];
for (const body of ALL_BODIES) {
  const cfg = textureConfigs[body.id];
  const diffuse = cfg?.layers.find(
    (l) => l.type === "diffuse" && (l.id === "surface" || l.id === "clouds"),
  );
  if (diffuse?.url) useTexture.preload(diffuse.url);
}

// ---------------------------------------------------------------------------
// Texture hook: loads a texture from URL, handles errors gracefully
// ---------------------------------------------------------------------------
function useLoadTexture(
  url: string | undefined | null,
  srgb = true,
  fallbackUrl?: string | string[] | null,
  webpUrl?: string | null,
) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) {
      setTex(null);
      return;
    }
    if (url.endsWith(".tif") || url.endsWith(".tiff")) {
      setTex(null);
      return;
    }
    let disposed = false;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";

    const apply = (t: THREE.Texture) => {
      if (disposed) return;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      setTex(t);
    };

    const explicitFallbacks = Array.isArray(fallbackUrl)
      ? fallbackUrl.filter(Boolean) as string[]
      : fallbackUrl
      ? [fallbackUrl]
      : [];
    const fallbacks = [webpUrl, ...explicitFallbacks].filter(Boolean) as string[];

    let idx = 0;
    const tryLoad = (candidate: string) => {
      loader.load(candidate, apply, undefined, () => {
        if (disposed) return;
        idx += 1;
        if (idx - 1 < fallbacks.length) {
          tryLoad(fallbacks[idx - 1]);
        } else {
          setTex(null);
        }
      });
    };

    tryLoad(url);

    return () => {
      disposed = true;
      setTex(null);
    };
  }, [url, srgb, fallbackUrl, webpUrl]);

  return tex;
}

// ---------------------------------------------------------------------------
// Enhanced mode multipliers
// ---------------------------------------------------------------------------
function getEnhancedMultipliers(mode: "realistic" | "enhanced") {
  if (mode === "enhanced") {
    return {
      bumpScale: 4.0,
      atmosphereIntensity: 2.0,
      nightLightIntensity: 2.5,
      cloudOpacity: 1.3,
      rotationSpeed: 2.0,
    };
  }
  return {
    bumpScale: 1.0,
    atmosphereIntensity: 1.0,
    nightLightIntensity: 1.0,
    cloudOpacity: 1.0,
    rotationSpeed: 1.0,
  };
}

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
// Textured Planet Surface
// ---------------------------------------------------------------------------
function TexturedPlanetSurface({
  planet,
  config,
  layerStates,
  size,
  viewMode,
}: {
  planet: Planet;
  config: PlanetTextureConfig;
  layerStates: Record<string, { enabled: boolean; opacity: number }>;
  size: number;
  viewMode: "realistic" | "enhanced";
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const multi = getEnhancedMultipliers(viewMode);

  const diffuseLayer = config.layers.find(
    (l) => l.type === "diffuse" && l.id === "surface",
  );
  const surfaceAltLayer = config.layers.find((l) => l.type === "surface-alt")
  const specularLayer = config.layers.find((l) => l.type === "specular");
  const bumpLayer = config.layers.find((l) => l.type === "bump");
  const normalLayer = config.layers.find((l) => l.type === "normal");

  const showAlt =
    surfaceAltLayer &&
    layerStates[surfaceAltLayer.id]?.enabled &&
    !layerStates[diffuseLayer?.id || "surface"]?.enabled;

  const isVenusClouds =
    config.planetId === "venus" && diffuseLayer?.id === "clouds";
  const activeUrl = showAlt
    ? surfaceAltLayer!.url
    : diffuseLayer?.urlHiRes || diffuseLayer?.url || "";

  const surfaceEnabled = diffuseLayer
    ? (layerStates[diffuseLayer.id]?.enabled ?? true)
    : true;
  const specularEnabled = specularLayer
    ? (layerStates[specularLayer.id]?.enabled ?? true)
    : false;
  const bumpEnabled = bumpLayer
    ? (layerStates[bumpLayer.id]?.enabled ?? true)
    : false;
  const normalEnabled = normalLayer
    ? (layerStates[normalLayer.id]?.enabled ?? true)
    : false;

  const diffuseTex = useLoadTexture(
    surfaceEnabled || isVenusClouds ? activeUrl : null,
    true,
    diffuseLayer?.url && diffuseLayer.urlHiRes
      ? diffuseLayer.url
      : undefined,
    showAlt ? surfaceAltLayer?.urlWebP : (diffuseLayer?.urlHiResWebP || diffuseLayer?.urlWebP),
  );
  const specularTex = useLoadTexture(
    specularEnabled ? specularLayer?.urlHiRes || specularLayer?.url : null,
    false,
    undefined,
    specularLayer?.urlHiResWebP || specularLayer?.urlWebP,
  );
  const bumpTex = useLoadTexture(
    bumpEnabled ? bumpLayer?.url : null,
    true,
    undefined,
    bumpLayer?.urlWebP,
  );
  const normalTex = useLoadTexture(
    normalEnabled ? normalLayer?.urlHiRes || normalLayer?.url : null,
    false,
    undefined,
    normalLayer?.urlHiResWebP || normalLayer?.urlWebP,
  );

  const bumpOpacity = bumpLayer
    ? (layerStates[bumpLayer.id]?.opacity ?? 0.8)
    : 0;
  const normalOpacity = normalLayer
    ? (layerStates[normalLayer.id]?.opacity ?? 1.0)
    : 0;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002 * multi.rotationSpeed;
    }
  });

  const useBump = bumpEnabled && bumpTex;
  const useNormal = normalEnabled && normalTex;
  const useSpecular = specularEnabled && specularTex;
  const needsStandardMat = useBump || useNormal || useSpecular;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 64, 64]} />
      {diffuseTex ? (
        needsStandardMat ? (
          <meshStandardMaterial
            map={diffuseTex}
            bumpMap={useBump ? bumpTex : useNormal ? normalTex : undefined}
            bumpScale={useBump ? bumpOpacity * 0.5 : useNormal ? normalOpacity * 0.3 : 0}
            metalnessMap={useSpecular ? specularTex : undefined}
            metalness={useSpecular ? 0.8 : 0.05}
            roughness={useSpecular ? 0.4 : 0.7}
          />
        ) : (
          <meshBasicMaterial map={diffuseTex} />
        )
      ) : (
        <meshStandardMaterial
          color={planet.color}
          roughness={0.6}
          metalness={0.1}
        />
      )}
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Cloud Layer - separate sphere slightly larger than surface
// ---------------------------------------------------------------------------
function CloudLayer({
  size,
  config,
  layerStates,
  viewMode,
}: {
  size: number;
  config: PlanetTextureConfig;
  layerStates: Record<string, { enabled: boolean; opacity: number }>;
  viewMode: "realistic" | "enhanced";
}) {
  const cloudLayer = config.layers.find((l) => l.type === "clouds");
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const multi = getEnhancedMultipliers(viewMode);

  const isEnabled = cloudLayer
    ? (layerStates[cloudLayer.id]?.enabled ?? true)
    : false;
  const texture = useLoadTexture(
    isEnabled ? cloudLayer?.urlHiRes || cloudLayer?.url : null,
    true,
    undefined,
    cloudLayer?.urlHiResWebP || cloudLayer?.urlWebP,
  );

  const opacity = Math.min(
    1,
    (layerStates[cloudLayer?.id || ""]?.opacity ?? 0.8) * multi.cloudOpacity,
  );

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003 * multi.rotationSpeed;
    }
  });

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.opacity = opacity;
    }
  }, [opacity]);

  if (!cloudLayer || !isEnabled || !texture) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size * 1.01, 64, 64]} />
      <meshStandardMaterial
        ref={materialRef}
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Night Lights (Emissive) Layer - visible only on dark side
// ---------------------------------------------------------------------------
function NightLightsLayer({
  size,
  config,
  layerStates,
  sunDirection,
  viewMode,
}: {
  size: number;
  config: PlanetTextureConfig;
  layerStates: Record<string, { enabled: boolean; opacity: number }>;
  sunDirection: THREE.Vector3;
  viewMode: "realistic" | "enhanced";
}) {
  const emissiveLayer = config.layers.find((l) => l.type === "emissive");
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const multi = getEnhancedMultipliers(viewMode);

  const isEnabled = emissiveLayer
    ? (layerStates[emissiveLayer.id]?.enabled ?? true)
    : false;
  const texture = useLoadTexture(
    isEnabled ? emissiveLayer?.urlHiRes || emissiveLayer?.url : null,
  );

  const intensity =
    (layerStates[emissiveLayer?.id || ""]?.opacity ?? 0.6) *
    multi.nightLightIntensity;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002 * multi.rotationSpeed;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uSunDirection.value.copy(sunDirection);
      materialRef.current.uniforms.uIntensity.value = intensity;
    }
  });

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uIntensity.value = intensity;
    }
  }, [intensity]);

  if (!emissiveLayer || !isEnabled || !texture) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size * 1.002, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={NightLightsVertexShader}
        fragmentShader={NightLightsFragmentShader}
        uniforms={{
          uNightMap: { value: texture },
          uIntensity: { value: intensity },
          uSunDirection: { value: sunDirection.clone() },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Atmosphere Glow
// ---------------------------------------------------------------------------
function AtmosphereGlow({
  size,
  config,
  layerStates,
  sunDirection,
  viewMode,
}: {
  size: number;
  config: PlanetTextureConfig;
  layerStates: Record<string, { enabled: boolean; opacity: number }>;
  sunDirection: THREE.Vector3;
  viewMode: "realistic" | "enhanced";
}) {
  const atmosphereLayer = config.layers.find((l) => l.type === "atmosphere");
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const multi = getEnhancedMultipliers(viewMode);

  const isEnabled = atmosphereLayer
    ? (layerStates[atmosphereLayer.id]?.enabled ?? true)
    : config.hasAtmosphere;

  const baseOpacity = atmosphereLayer
    ? (layerStates[atmosphereLayer.id]?.opacity ?? config.atmosphereIntensity)
    : config.atmosphereIntensity;

  const finalIntensity = baseOpacity * multi.atmosphereIntensity * 1.4;

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uSunDirection.value.copy(sunDirection);
      materialRef.current.uniforms.uIntensity.value = finalIntensity;
    }
  });

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uIntensity.value = finalIntensity;
    }
  }, [finalIntensity]);

  if (!config.hasAtmosphere || !isEnabled) return null;

  const color = new THREE.Color(config.atmosphereColor);
  // Single source of truth for shell radius — no double scaling.
  const shellRadius =
    size *
    (1 +
      Math.max(0.015, config.atmosphereThickness) *
        (viewMode === "enhanced" ? 2.2 : 1.4));

  return (
    <mesh>
      <sphereGeometry args={[shellRadius, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={AtmosphereVertexShader}
        fragmentShader={AtmosphereFragmentShader}
        uniforms={{
          uColor: { value: color },
          uIntensity: { value: finalIntensity },
          uSunDirection: { value: sunDirection.clone() },
          uFalloff: { value: config.atmosphereFalloff ?? 3.0 },
          uDensity: { value: config.atmosphereDensity ?? 0.5 },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Ring System (Saturn, Uranus, Jupiter, Neptune)
// ---------------------------------------------------------------------------
function RingSystem({
  config,
  size,
  planetId,
}: {
  config: PlanetTextureConfig;
  size: number;
  planetId: string;
}) {
  const ringTexture = useLoadTexture(
    config.hasRings ? config.ringTexture : null,
    true,
    undefined,
    config.hasRings ? config.ringTextureWebP : null,
  );
  const ringAlpha = useLoadTexture(
    config.hasRings ? config.ringAlphaTexture ?? null : null,
    false,
    undefined,
    config.hasRings ? config.ringAlphaTextureWebP : null,
  );

  const inner = size * (config.ringInnerRadius || 1.3);
  const outer = size * (config.ringOuterRadius || 2.2);
  const opacity = config.ringOpacity || 0.5;

  // Custom ring geometry with radial UVs so the texture is sampled across
  // the ring band (default RingGeometry uses sector UVs which look wrong).
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(inner, outer, 256, 1);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      const r = v3.length();
      const u = (r - inner) / (outer - inner);
      uv.setXY(i, u, 0.5);
    }
    uv.needsUpdate = true;
    return geo;
  }, [inner, outer]);

  if (!config.hasRings) return null;

  let rotation: [number, number, number] = [Math.PI / 2.5, 0, 0];
  if (planetId === "uranus") rotation = [0.1, 0, Math.PI / 2];
  else if (planetId === "jupiter" || planetId === "neptune")
    rotation = [Math.PI / 2, 0, 0];

  const ringColors: Record<string, string> = {
    saturn: "#ffffff",
    uranus: "#a0c8c8",
    jupiter: "#8b7355",
    neptune: "#4a5a8a",
  };

  return (
    <mesh rotation={rotation} geometry={geometry}>
      <meshBasicMaterial
        map={ringTexture}
        alphaMap={ringAlpha ?? undefined}
        color={ringColors[planetId] || "#cccccc"}
        side={THREE.DoubleSide}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Moon Orbits
// ---------------------------------------------------------------------------
function MoonOrbit({
  moon,
  index,
  showMoonOrbits,
  planetId,
  planetDiameter,
}: {
  moon: Moon;
  index: number;
  showMoonOrbits: boolean;
  planetId: string;
  planetDiameter: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const radius = (moon.distanceFromPlanet / planetDiameter) * 0.3;
  const speed = 0.5 / (index + 1);

  const orbitPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return pts;
  }, [radius]);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime * speed;
      groupRef.current.position.x = Math.cos(t) * radius;
      groupRef.current.position.z = Math.sin(t) * radius;
    }
  });

  const moonSize = Math.min(0.3, Math.max(0.1, moon.diameter / 5000));

  return (
    <>
      {showMoonOrbits && (
        <Line
          points={orbitPoints}
          color="#1e3a5f"
          transparent
          opacity={0.3}
          lineWidth={1}
        />
      )}
      <group ref={groupRef}>
        <MoonBody
          size={moonSize}
          moonName={moon.name}
          parentPlanetId={planetId}
        />
      </group>
    </>
  );
}

// Start with any auto-indexed satellite textures, then overlay curated entries.
interface SatelliteEntry {
  jpg: string;
  webp: string;
}
const _AUTO_SATELLITE_INDEX: Record<string, SatelliteEntry> =
  (typeof satelliteIndex === 'object' && satelliteIndex) || {};

const MOON_TEXTURE_ENTRIES: Record<string, SatelliteEntry> = {
  moon: { jpg: "/assets/textures/earth/satellites/moon_4k.jpg", webp: "/assets/textures/earth/satellites/moon_4k.webp" },
  phobos: { jpg: "/assets/textures/mars/satellites/phobos.jpg", webp: "/assets/textures/mars/satellites/phobos.webp" },
  io: { jpg: "/assets/textures/jupiter/satellites/io.jpg", webp: "/assets/textures/jupiter/satellites/io.webp" },
  europa: { jpg: "/assets/textures/jupiter/satellites/europa.jpg", webp: "/assets/textures/jupiter/satellites/europa.webp" },
  ganymede: { jpg: "/assets/textures/jupiter/satellites/ganymede.jpg", webp: "/assets/textures/jupiter/satellites/ganymede.webp" },
  dione: { jpg: "/assets/textures/saturn/satellites/dione.jpg", webp: "/assets/textures/saturn/satellites/dione.webp" },
  enceladus: { jpg: "/assets/textures/saturn/satellites/enceladus.jpg", webp: "/assets/textures/saturn/satellites/enceladus.webp" },
  iapetus: { jpg: "/assets/textures/saturn/satellites/iapetus.jpg", webp: "/assets/textures/saturn/satellites/iapetus.webp" },
  rhea: { jpg: "/assets/textures/saturn/satellites/rhea.jpg", webp: "/assets/textures/saturn/satellites/rhea.webp" },
  tethys: { jpg: "/assets/textures/saturn/satellites/tethys.jpg", webp: "/assets/textures/saturn/satellites/tethys.webp" },
  callisto: { jpg: "/assets/textures/jupiter/satellites/callisto.jpg", webp: "/assets/textures/jupiter/satellites/callisto.webp" },
  mimas: { jpg: "/assets/textures/saturn/satellites/mimas.jpg", webp: "/assets/textures/saturn/satellites/mimas.webp" },
  titania: { jpg: "/assets/textures/uranus/satellites/titania.jpg", webp: "/assets/textures/uranus/satellites/titania.webp" },
  ariel: { jpg: "/assets/textures/uranus/satellites/ariel.jpg", webp: "/assets/textures/uranus/satellites/ariel.webp" },
  miranda: { jpg: "/assets/textures/uranus/satellites/miranda.jpg", webp: "/assets/textures/uranus/satellites/miranda.webp" },
  titan: { jpg: "/assets/textures/saturn/satellites/titan.jpg", webp: "/assets/textures/saturn/satellites/titan.webp" },
  triton: { jpg: "/assets/textures/neptune/satellites/triton.jpg", webp: "/assets/textures/neptune/satellites/triton.webp" },
  charon: { jpg: "/assets/textures/pluto/satellites/charon.jpg", webp: "/assets/textures/pluto/satellites/charon.webp" },
};

import satelliteIndex from '@/lib/satellite-index.json';
import { Slider } from "./ui/slider";

function MoonBody({
  size,
  moonName,
  parentPlanetId,
}: {
  size: number;
  moonName: string;
  parentPlanetId?: string;
}) {
  const key = moonName.toLowerCase();
  const curated = MOON_TEXTURE_ENTRIES[key];
  const { urlCandidate, fallbacks, webpCandidate } = useMemo(() => {
    const list: string[] = [];
    let webp: string | null = null;

    if (curated) {
      list.push(curated.jpg);
      webp = curated.webp;
    }

    const satelliteIndexMap = satelliteIndex as Record<string, SatelliteEntry>;
    const indexed = satelliteIndexMap[key];
    if (indexed) {
      list.push(indexed.jpg);
      if (!webp) webp = indexed.webp;
    }

    if (parentPlanetId) {
      const base = moonName
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      const folder = `/assets/textures/${parentPlanetId}/satellites`;
      list.push(`${folder}/${base}.jpg`);
      list.push(`${folder}/${base}_4k.jpg`);
      list.push(`${folder}/${base}_2k.jpg`);
      list.push(`${folder}/${base}.png`);
    }

    list.push('/assets/textures/asteroids/asteroid.jpg');
    return { urlCandidate: list[0] ?? null, fallbacks: list.slice(1), webpCandidate: webp };
  }, [curated, parentPlanetId, moonName, key]);

  const tex = useLoadTexture(urlCandidate, true, fallbacks, webpCandidate);
  return (
    <mesh>
      <sphereGeometry args={[size, 32, 32]} />
      {tex ? (
        <meshBasicMaterial map={tex} />
      ) : (
        <meshStandardMaterial color="#aaaaaa" roughness={0.8} />
      )}
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Glowing Sun (visible when zoomed out from a planet)
// ---------------------------------------------------------------------------
function DetailSun({ sunDistance }: { sunDistance: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={[-sunDistance, 0, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#ffd27a"
          emissive="#ffffff"
          emissiveIntensity={2}
        />
      </mesh>
      <pointLight color="#fff2d6" intensity={3} distance={0} decay={0} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Other Planets as textured spheres at compressed relative distances
// ---------------------------------------------------------------------------
function TexturedDot({
  url,
  color,
  size,
  position,
}: {
  url: string;
  color: string;
  size: number;
  position: [number, number, number];
}) {
  const texture = useTexture(url);
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

function PlanetDot({
  planet,
  position,
}: {
  planet: Planet;
  position: [number, number, number];
}) {
  const config = textureConfigs[planet.id];
  const diffuse = config?.layers.find(
    (l) => l.type === "diffuse" && (l.id === "surface" || l.id === "clouds"),
  );
  const size = 0.08 + (planet.diameter / 142984) * 0.3;

  if (!diffuse?.url) {
    return (
      <mesh position={position}>
        <sphereGeometry args={[size, 12, 12]} />
        <meshStandardMaterial color={planet.color} />
      </mesh>
    );
  }

  return (
    <Suspense
      fallback={
        <mesh position={position}>
          <sphereGeometry args={[size, 12, 12]} />
          <meshStandardMaterial color={planet.color} />
        </mesh>
      }
    >
      <TexturedDot
        url={diffuse.url}
        color={planet.color}
        size={size}
        position={position}
      />
    </Suspense>
  );
}

function OtherPlanets({ currentPlanet }: { currentPlanet: Planet }) {
  const currentDist = compressedDistance(currentPlanet.distanceFromSun);

  return (
    <>
      {ALL_BODIES.filter((p) => p.id !== currentPlanet.id).map((p) => {
        const otherDist = compressedDistance(p.distanceFromSun);
        const offset = otherDist - currentDist;
        return (
          <PlanetDot
            key={p.id}
            planet={p}
            position={[offset, 0, 0]}
          />
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Detail Stars Background
// ---------------------------------------------------------------------------
function DetailStars({ count = 2000 }: { count?: number }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 30 + Math.random() * 70;
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
        color="#a8c4e0"
        transparent
        opacity={0.6}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Sunlight
// ---------------------------------------------------------------------------
function SunLight({ direction }: { direction: THREE.Vector3 }) {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    if (dirLightRef.current) {
      dirLightRef.current.position.set(
        direction.x * 20,
        direction.y * 20,
        direction.z * 20,
      );
    }
  });
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#9ab4dc", "#1a1a2a", 0.35]} />
      <directionalLight ref={dirLightRef} intensity={2.2} color="#fff5e0" />
    </>
  );
}

// ---------------------------------------------------------------------------
// Full Planet Scene (inside Canvas)
// ---------------------------------------------------------------------------
function PlanetScene({
  planet,
  config,
  layerStates,
  showMoonOrbits,
  viewMode,
}: {
  planet: Planet;
  config: PlanetTextureConfig;
  layerStates: Record<string, { enabled: boolean; opacity: number }>;
  showMoonOrbits: boolean;
  viewMode: "realistic" | "enhanced";
}) {
  const size = 2;
  const zoom = zoomConfig[planet.id] ?? { minDistance: 3.5, maxDistance: 180, cameraOffset: [5, 3, 7] as [number, number, number] };
  const sunDistance = compressedDistance(planet.distanceFromSun);
  const sunDirection = useMemo(
    () => new THREE.Vector3(1, 0.3, 0.5).normalize(),
    [],
  );

  return (
    <>
      <SunLight direction={sunDirection} />
      <DetailSun sunDistance={sunDistance} />
      <OtherPlanets currentPlanet={planet} />
      <group>
        <TexturedPlanetSurface
          planet={planet}
          config={config}
          layerStates={layerStates}
          size={size}
          viewMode={viewMode}
        />
        <CloudLayer
          size={size}
          config={config}
          layerStates={layerStates}
          viewMode={viewMode}
        />
        <NightLightsLayer
          size={size}
          config={config}
          layerStates={layerStates}
          sunDirection={sunDirection}
          viewMode={viewMode}
        />
        <AtmosphereGlow
          size={size}
          config={config}
          layerStates={layerStates}
          sunDirection={sunDirection}
          viewMode={viewMode}
        />
        <RingSystem config={config} size={size} planetId={planet.id} />
      </group>
      {planet.moons.map((moon, i) => (
        <MoonOrbit
          key={moon.name}
          moon={moon}
          index={i}
          showMoonOrbits={showMoonOrbits}
          planetId={planet.id}
          planetDiameter={planet.diameter}
        />
      ))}
      <DetailStars />
      <OrbitControls
        enableZoom
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={zoom.minDistance}
        maxDistance={zoom.maxDistance}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Layer Control Panel UI
// ---------------------------------------------------------------------------
const LAYER_PANEL_EXPANDED_KEY = "Solr:layer-panel-expanded";
function LayerControlPanel({
  planetId,
  config,
  layerStates,
  onToggleLayer,
  onChangeOpacity,
  viewMode,
  onViewModeChange,
}: {
  planetId: string;
  config: PlanetTextureConfig;
  layerStates: Record<string, { enabled: boolean; opacity: number }>;
  onToggleLayer: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
  viewMode: "realistic" | "enhanced";
  onViewModeChange: (mode: "realistic" | "enhanced") => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // Sync expanded state from localStorage after hydration to avoid mismatch
  useEffect(() => {
    const stored = localStorage.getItem(`${LAYER_PANEL_EXPANDED_KEY}:${planetId}`);
    if (stored === 'true') setExpanded(true);
  }, [planetId]);

  useEffect(() => {
    localStorage.setItem(`${LAYER_PANEL_EXPANDED_KEY}:${planetId}`, String(expanded));
  }, [expanded, planetId]);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <div className="absolute top-4 right-4 z-10 w-72">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-t-lg border border-border/50 bg-card/90 px-3 py-2 text-xs font-semibold text-foreground backdrop-blur-md"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5" />
          Layer Controls
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {expanded && (
        <div className="rounded-b-lg border border-t-0 border-border/50 bg-card/90 p-3 backdrop-blur-md max-h-[60vh] overflow-y-auto">
          {/* View Mode Toggle */}
          <div className="mb-3 pb-3 border-b border-border/30">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              View Mode
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => onViewModeChange("realistic")}
                className={`flex-1 rounded px-2 py-1.5 text-[10px] font-medium transition-all duration-200 ${
                  viewMode === "realistic"
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                Realistic
              </button>
              <button
                onClick={() => onViewModeChange("enhanced")}
                className={`flex-1 rounded px-2 py-1.5 text-[10px] font-medium transition-all duration-200 ${
                  viewMode === "enhanced"
                    ? "bg-accent text-accent-foreground shadow-sm shadow-accent/30"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                Enhanced
              </button>
            </div>
            <p className="mt-1.5 text-[9px] text-muted-foreground italic">
              {viewMode === "enhanced"
                ? "Exaggerated terrain, brighter atmosphere and city lights for educational viewing."
                : "Scientifically accurate rendering with realistic proportions."}
            </p>
          </div>

          {/* Layers */}
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Layers
          </p>
          <div className="flex flex-col gap-2.5">
            {config.layers.map((layer) => {
              const state = layerStates[layer.id] || {
                enabled: layer.defaultEnabled,
                opacity: layer.defaultOpacity,
              };
              const showSlider =
                state.enabled &&
                (layer.type === "clouds" ||
                  layer.type === "atmosphere" ||
                  layer.type === "emissive" ||
                  layer.type === "bump");

              return (
                <div key={layer.id} className="relative">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleLayer(layer.id)}
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-200 ${
                        state.enabled
                          ? "border-primary bg-primary/20"
                          : "border-border/50 bg-secondary/50 hover:border-border"
                      }`}
                      aria-label={`Toggle ${layer.label}`}
                      title={layer.description}
                    >
                      {state.enabled && (
                        <div className="h-2 w-2 rounded-sm bg-primary" />
                      )}
                    </button>
                    <span
                      onClick={() => onToggleLayer(layer.id)}
                      className={`flex-1 cursor-default hover:font-semibold text-[11px] transition-colors duration-200 ${
                        state.enabled
                          ? "text-foreground"
                          : "text-muted-foreground line-through"
                      }`}
                      title={layer.description}
                    >
                      {layer.label}
                    </span>
                    <button
                      onClick={() =>
                        setActiveTooltip(
                          activeTooltip === layer.id ? null : layer.id,
                        )
                      }
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={`Info about ${layer.label}`}
                      title={`${layer.scientificNote}\n\n Source: ${layer.source}`}
                    >
                      <Info className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Opacity/intensity slider */}
                  {showSlider && (
                    <div className="mt-1.5 ml-6 flex items-center gap-2">
                      <div className="relative flex-1">
                        <Slider
                          name={`layer-${layer.id}-slider-${layer.id}`}
                          min={0}
                          max={100}
                          step={1}
                          value={[Math.round(state.opacity * 100)]}
                          onValueChange={(values) =>
                            onChangeOpacity(
                              layer.id,
                              (values[0]) / 100,
                            )
                          }
                          title={`${layer.label}: ${Math.round(state.opacity * 100)}%`}
                        />
                      </div>
                      <span title={`${layer.label}: ${Math.round(state.opacity * 100)}%`} className="w-8 text-right font-mono text-[9px] text-muted-foreground">
                        {Math.round(state.opacity * 100)}%
                      </span>
                    </div>
                  )}

                  {/* Info tooltip */}
                  {activeTooltip === layer.id && (
                    <div className="mt-1.5 ml-6 rounded-md border border-primary/20 bg-muted/80 p-2.5 text-[10px] leading-relaxed text-muted-foreground backdrop-blur-sm animate-in fade-in-0 slide-in-from-top-1 duration-200">
                      <p className="mb-1.5">{layer.description}</p>
                      <p className="text-[9px]">
                        <span className="font-medium text-foreground/70">
                          Source:
                        </span>{" "}
                        {layer.source}
                      </p>
                      <p className="mt-1 text-[9px] italic">
                        {layer.scientificNote}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active layers summary */}
          <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between">
            <p className="text-[8px] text-muted-foreground">
              Textures: Solar System Scope (CC BY 4.0), NASA/JPL, ESA
            </p>
            <p className="text-[8px] text-primary font-mono">
              {Object.values(layerStates).filter((s) => s.enabled).length}/
              {config.layers.length} active
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Export: Planet3D Component
// ---------------------------------------------------------------------------
const LAYER_PREFS_STORAGE_KEY = "Solr:planet-layer-prefs:v1";

type LayerPrefs = {
  viewMode: "realistic" | "enhanced";
  layers: Record<string, { enabled: boolean; opacity: number }>;
};

function loadLayerPrefs(planetId: string): LayerPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(
      `${LAYER_PREFS_STORAGE_KEY}:${planetId}`,
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LayerPrefs>;
    if (!parsed || typeof parsed !== "object") return null;
    const viewMode =
      parsed.viewMode === "enhanced" ? "enhanced" : "realistic";
    const layers =
      parsed.layers && typeof parsed.layers === "object" ? parsed.layers : {};
    return { viewMode, layers };
  } catch {
    return null;
  }
}

export function Planet3D({
  planet,
  showMoonOrbits = true,
}: {
  planet: Planet;
  showMoonOrbits?: boolean;
}) {
  const config = getTextureConfig(planet.id);
  const [viewMode, setViewMode] = useState<"realistic" | "enhanced">(
    "realistic",
  );

  // Initialize layer states from config
  const [layerStates, setLayerStates] = useState<
    Record<string, { enabled: boolean; opacity: number }>
  >(() => {
    if (!config) return {};
    const states: Record<string, { enabled: boolean; opacity: number }> = {};
    config.layers.forEach((layer) => {
      states[layer.id] = {
        enabled: layer.defaultEnabled,
        opacity: layer.defaultOpacity,
      };
    });
    return states;
  });

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const prefs = loadLayerPrefs(planet.id);
    if (!prefs) return;
    setViewMode(prefs.viewMode);
    if (config) {
      setLayerStates((prev) => {
        const next = { ...prev };
        config.layers.forEach((layer) => {
          const saved = prefs.layers[layer.id];
          if (
            saved &&
            typeof saved.enabled === "boolean" &&
            typeof saved.opacity === "number"
          ) {
            next[layer.id] = {
              enabled: saved.enabled,
              opacity: Math.min(1, Math.max(0, saved.opacity)),
            };
          }
        });
        return next;
      });
    }
  }, [planet.id]);

  const persistPrefs = useCallback(
    (
      nextViewMode: "realistic" | "enhanced",
      nextLayers: Record<string, { enabled: boolean; opacity: number }>,
    ) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(
          `${LAYER_PREFS_STORAGE_KEY}:${planet.id}`,
          JSON.stringify({ viewMode: nextViewMode, layers: nextLayers }),
        );
      } catch {
        // localStorage unavailable / quota — silently ignore
      }
    },
    [planet.id],
  );

  const handleViewModeChange = useCallback(
    (mode: "realistic" | "enhanced") => {
      setViewMode(mode);
      persistPrefs(mode, layerStates);
    },
    [layerStates, persistPrefs],
  );

  const handleToggleLayer = useCallback(
    (id: string) => {
      setLayerStates((prev) => {
        const next = {
          ...prev,
          [id]: {
            ...prev[id],
            enabled: !prev[id]?.enabled,
          },
        };
        persistPrefs(viewMode, next);
        return next;
      });
    },
    [viewMode, persistPrefs],
  );

  const handleChangeOpacity = useCallback(
    (id: string, opacity: number) => {
      setLayerStates((prev) => {
        const next = {
          ...prev,
          [id]: {
            ...prev[id],
            opacity,
          },
        };
        persistPrefs(viewMode, next);
        return next;
      });
    },
    [viewMode, persistPrefs],
  );

  const effectiveConfig: PlanetTextureConfig = config || {
    planetId: planet.id,
    layers: [],
    hasAtmosphere: false,
    atmosphereColor: "#000000",
    atmosphereIntensity: 0,
    atmosphereThickness: 0,
    hasRings: planet.rings,
  };

  const zoom = zoomConfig[planet.id] ?? { minDistance: 3.5, maxDistance: 180, cameraOffset: [5, 3, 7] as [number, number, number] };

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: zoom.cameraOffset, fov: 45 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        dpr={[1, 1.5]}
      >
        <PlanetScene
          planet={planet}
          config={effectiveConfig}
          layerStates={layerStates}
          showMoonOrbits={showMoonOrbits}
          viewMode={viewMode}
        />
      </Canvas>

      {/* Layer Control Panel overlay */}
      {config && config.layers.length > 0 && (
        <LayerControlPanel
          planetId={planet.id}
          config={effectiveConfig}
          layerStates={layerStates}
          onToggleLayer={handleToggleLayer}
          onChangeOpacity={handleChangeOpacity}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
      )}
    </div>
  );
}
