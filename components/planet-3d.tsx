"use client";

import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import type { Planet, Moon } from "@/lib/planet-data";
import {
  getTextureConfig,
  type PlanetTextureConfig,
} from "@/lib/texture-config";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Info, Layers, ChevronDown, ChevronUp } from "lucide-react";
import {
  AtmosphereVertexShader,
  AtmosphereFragmentShader,
  NightLightsVertexShader,
  NightLightsFragmentShader,
} from "@/lib/shaders";

// Enable shared texture cache
THREE.Cache.enabled = true;

// ---------------------------------------------------------------------------
// Texture hook: loads a texture from URL, handles errors gracefully
// ---------------------------------------------------------------------------
function useLoadTexture(url: string | undefined | null, srgb = true) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) {
      setTex(null);
      return;
    }
    // Guard: skip .tif files that Three.js cannot decode
    if (url.endsWith(".tif") || url.endsWith(".tiff")) {
      setTex(null);
      return;
    }
    let disposed = false;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    loader.load(
      url,
      (t) => {
        if (disposed) {
          t.dispose();
          return;
        }
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        setTex(t);
      },
      undefined,
      () => {
        if (!disposed) setTex(null);
      },
    );
    return () => {
      disposed = true;
      setTex((prev) => {
        prev?.dispose();
        return null;
      });
    };
  }, [url, srgb]);

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
  const surfaceAltLayer = config.layers.find((l) => l.type === "surface-alt");
  const bumpLayer = config.layers.find((l) => l.type === "bump");
  const normalLayer = config.layers.find((l) => l.type === "normal");
  const specularLayer = config.layers.find((l) => l.type === "specular");

  // Venus cloud-penetration toggle: if surface-alt is enabled and main diffuse disabled
  const showAlt =
    surfaceAltLayer &&
    layerStates[surfaceAltLayer.id]?.enabled &&
    !layerStates[diffuseLayer?.id || "surface"]?.enabled;

  // For Venus: the main "diffuse" is actually clouds, the surface-alt is radar surface
  const isVenusClouds =
    config.planetId === "venus" && diffuseLayer?.id === "clouds";
  const activeUrl = showAlt
    ? surfaceAltLayer!.url
    : diffuseLayer?.urlHiRes || diffuseLayer?.url || "";

  const surfaceEnabled = diffuseLayer
    ? (layerStates[diffuseLayer.id]?.enabled ?? true)
    : true;
  const bumpEnabled = bumpLayer
    ? (layerStates[bumpLayer.id]?.enabled ?? true)
    : false;
  const normalEnabled = normalLayer
    ? (layerStates[normalLayer.id]?.enabled ?? true)
    : false;
  const specularEnabled = specularLayer
    ? (layerStates[specularLayer.id]?.enabled ?? true)
    : false;

  const diffuseTex = useLoadTexture(
    surfaceEnabled || isVenusClouds ? activeUrl : null,
  );
  const bumpTex = useLoadTexture(
    bumpEnabled ? bumpLayer?.urlHiRes || bumpLayer?.url : null,
    false,
  );
  const normalTex = useLoadTexture(
    normalEnabled ? normalLayer?.urlHiRes || normalLayer?.url : null,
    false,
  );
  const _specularTex = useLoadTexture(
    specularEnabled ? specularLayer?.urlHiRes || specularLayer?.url : null,
    false,
  );

  const bumpOpacity = bumpLayer
    ? (layerStates[bumpLayer.id]?.opacity ?? 0.5)
    : 0.5;
  const normalOpacity = normalLayer
    ? (layerStates[normalLayer.id]?.opacity ?? 1.0)
    : 1.0;

  const normalScale = useMemo(
    () =>
      new THREE.Vector2(
        normalOpacity * multi.bumpScale,
        normalOpacity * multi.bumpScale,
      ),
    [normalOpacity, multi.bumpScale],
  );

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002 * multi.rotationSpeed;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 64, 64]} />
      {diffuseTex ? (
        <meshStandardMaterial
          map={diffuseTex}
          bumpMap={bumpTex}
          bumpScale={bumpOpacity * 0.05 * multi.bumpScale}
          normalMap={normalTex}
          normalScale={normalTex ? normalScale : undefined}
          roughness={config.surfaceRoughness ?? 0.8}
          metalness={config.surfaceMetalness ?? 0.05}
        />
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
  const multi = getEnhancedMultipliers(viewMode);

  const isEnabled = cloudLayer
    ? (layerStates[cloudLayer.id]?.enabled ?? true)
    : false;
  const texture = useLoadTexture(
    isEnabled ? cloudLayer?.urlHiRes || cloudLayer?.url : null,
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

  if (!cloudLayer || !isEnabled || !texture) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size * 1.01, 64, 64]} />
      <meshStandardMaterial
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

  // Update uniforms reactively every frame
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002 * multi.rotationSpeed;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uSunDirection.value.copy(sunDirection);
      materialRef.current.uniforms.uIntensity.value = intensity;
    }
  });

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

  const finalIntensity = baseOpacity * multi.atmosphereIntensity * 3;

  // Update uniforms reactively every frame
  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uSunDirection.value.copy(sunDirection);
      materialRef.current.uniforms.uIntensity.value = finalIntensity;
    }
  });

  if (!config.hasAtmosphere || !isEnabled) return null;

  const color = new THREE.Color(config.atmosphereColor);
  const scale =
    1 + config.atmosphereThickness * (viewMode === "enhanced" ? 3.0 : 1.5);

  return (
    <mesh scale={[scale, scale, scale]}>
      <sphereGeometry args={[size * 1.015, 64, 64]} />
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
  );

  if (!config.hasRings) return null;

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
        map={ringTexture}
        color={ringColors[planetId] || "#cccccc"}
        side={THREE.DoubleSide}
        transparent
        opacity={opacity}
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
}: {
  moon: Moon;
  index: number;
  showMoonOrbits: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const radius = 3 + index * 1.2;
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
        <mesh>
          <sphereGeometry args={[moonSize, 16, 16]} />
          <meshStandardMaterial color="#aaaaaa" roughness={0.8} />
        </mesh>
      </group>
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
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[direction.x * 20, direction.y * 20, direction.z * 20]}
        intensity={2}
        color="#fff5e0"
      />
      <pointLight
        position={[direction.x * -15, direction.y * -5, direction.z * -15]}
        intensity={0.15}
        color="#3b82f6"
      />
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
  const sunDirection = useMemo(
    () => new THREE.Vector3(1, 0.3, 0.5).normalize(),
    [],
  );

  return (
    <>
      <SunLight direction={sunDirection} />
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
        />
      ))}
      <DetailStars />
      <OrbitControls
        enableZoom
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
      />
      <EffectComposer enableNormalPass={false}>
        <Bloom
          luminanceThreshold={0.8}
          luminanceSmoothing={0.3}
          intensity={0.5}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

// ---------------------------------------------------------------------------
// Layer Control Panel UI
// ---------------------------------------------------------------------------
function LayerControlPanel({
  config,
  layerStates,
  onToggleLayer,
  onChangeOpacity,
  viewMode,
  onViewModeChange,
}: {
  config: PlanetTextureConfig;
  layerStates: Record<string, { enabled: boolean; opacity: number }>;
  onToggleLayer: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
  viewMode: "realistic" | "enhanced";
  onViewModeChange: (mode: "realistic" | "enhanced") => void;
}) {
  const [expanded, setExpanded] = useState(true);
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
                    >
                      {state.enabled && (
                        <div className="h-2 w-2 rounded-sm bg-primary" />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-[11px] transition-colors duration-200 ${
                        state.enabled
                          ? "text-foreground"
                          : "text-muted-foreground line-through"
                      }`}
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
                    >
                      <Info className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Opacity/intensity slider */}
                  {showSlider && (
                    <div className="mt-1.5 ml-6 flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(state.opacity * 100)}
                          onChange={(e) =>
                            onChangeOpacity(
                              layer.id,
                              parseInt(e.target.value) / 100,
                            )
                          }
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border/50 accent-primary [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none"
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-[9px] text-muted-foreground">
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

  const handleToggleLayer = useCallback((id: string) => {
    setLayerStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        enabled: !prev[id]?.enabled,
      },
    }));
  }, []);

  const handleChangeOpacity = useCallback((id: string, opacity: number) => {
    setLayerStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        opacity,
      },
    }));
  }, []);

  const effectiveConfig: PlanetTextureConfig = config || {
    planetId: planet.id,
    layers: [],
    hasAtmosphere: false,
    atmosphereColor: "#000000",
    atmosphereIntensity: 0,
    atmosphereThickness: 0,
    hasRings: planet.rings,
  };

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [5, 3, 7], fov: 45 }}
        gl={{ antialias: true }}
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
          config={effectiveConfig}
          layerStates={layerStates}
          onToggleLayer={handleToggleLayer}
          onChangeOpacity={handleChangeOpacity}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}
    </div>
  );
}
