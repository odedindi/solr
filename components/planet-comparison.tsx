"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { getTextureConfig } from "@/lib/texture-config";
import { planets } from "@/lib/planet-data";
import { SplitSquareHorizontal, GripVertical, Camera, Box } from "lucide-react";
import {
  AtmosphereVertexShader,
  AtmosphereFragmentShader,
} from "@/lib/shaders";

// Reuse the texture loading hook
function useLoadTexture(url: string | undefined | null, srgb = true) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const loadedUrlRef = useRef<string | null | undefined>(null);

  if (url !== loadedUrlRef.current) {
    loadedUrlRef.current = url;
    if (!url) {
      setTex(null);
    } else {
      const loader = new THREE.TextureLoader();
      loader.crossOrigin = "anonymous";
      loader.load(
        url,
        (t) => {
          if (srgb) t.colorSpace = THREE.SRGBColorSpace;
          setTex(t);
        },
        undefined,
        () => setTex(null),
      );
    }
  }

  return tex;
}

/**
 * NASA/JPL real photograph URLs for each planet (public domain).
 */
const realPhotoUrls: Record<
  string,
  { url: string; credit: string; description: string }
> = {
  mercury: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/1024px-Mercury_in_true_color.jpg",
    credit:
      "NASA/Johns Hopkins University APL/Carnegie Institution of Washington",
    description: "True-color image from MESSENGER spacecraft (2008)",
  },
  venus: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Venus_from_Mariner_10.jpg/1024px-Venus_from_Mariner_10.jpg",
    credit: "NASA/JPL-Caltech",
    description: "Enhanced color image from Mariner 10 (1974)",
  },
  earth: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/1024px-The_Blue_Marble_%28remastered%29.jpg",
    credit: "NASA/Apollo 17 crew",
    description: "The Blue Marble - Apollo 17 (December 7, 1972)",
  },
  mars: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png/1024px-Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png",
    credit: "NASA/JPL-Caltech/Kevin M. Gill",
    description: "Processed from Mars Reconnaissance Orbiter data",
  },
  jupiter: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Jupiter_New_Horizons.jpg/1024px-Jupiter_New_Horizons.jpg",
    credit: "NASA/Johns Hopkins University APL/Southwest Research Institute",
    description: "True-color image from New Horizons spacecraft (2007)",
  },
  saturn: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/1280px-Saturn_during_Equinox.jpg",
    credit: "NASA/JPL/Space Science Institute (Cassini)",
    description: "Saturn during equinox - Cassini spacecraft (2008)",
  },
  uranus: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Uranus_as_seen_by_NASA%27s_Voyager_2_%28reprocessed%29_-_JPEG_converted.jpg/1024px-Uranus_as_seen_by_NASA%27s_Voyager_2_%28reprocessed%29_-_JPEG_converted.jpg",
    credit: "NASA/JPL-Caltech (Voyager 2)",
    description: "Reprocessed Voyager 2 image (1986)",
  },
  neptune: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Neptune_Voyager2_color_calibrated.png/1024px-Neptune_Voyager2_color_calibrated.png",
    credit: "NASA/JPL (Voyager 2)",
    description: "Color-calibrated Voyager 2 image (1989)",
  },
  pluto: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Pluto_in_True_Color_-_High-Res.jpg/1024px-Pluto_in_True_Color_-_High-Res.jpg",
    credit: "NASA/Johns Hopkins University APL/Southwest Research Institute",
    description: "True-color image from New Horizons (July 14, 2015)",
  },
};

// ---------------------------------------------------------------------------
// Minimal 3D planet for the comparison right side
// ---------------------------------------------------------------------------
function ComparisonPlanet({ planetId }: { planetId: string }) {
  const config = getTextureConfig(planetId);
  const planet = planets.find((p) => p.id === planetId);
  const meshRef = useRef<THREE.Mesh>(null);
  const sunDir = useMemo(() => new THREE.Vector3(1, 0.3, 0.5).normalize(), []);

  const diffuseLayer = config?.layers.find(
    (l) =>
      l.type === "diffuse" ||
      l.id === "surface" ||
      (l.id === "clouds" && config.planetId === "venus"),
  );
  const diffuseTex = useLoadTexture(diffuseLayer?.url ?? null);
  const cloudLayer = config?.layers.find((l) => l.type === "clouds");
  const cloudTex = useLoadTexture(cloudLayer?.url ?? null);

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.003;
  });

  const size = 2;
  const atmoColor = config
    ? new THREE.Color(config.atmosphereColor)
    : new THREE.Color("#000");

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[sunDir.x * 20, sunDir.y * 20, sunDir.z * 20]}
        intensity={2}
        color="#fff5e0"
      />
      <group>
        <mesh ref={meshRef}>
          <sphereGeometry args={[size, 64, 64]} />
          {diffuseTex ? (
            <meshStandardMaterial
              map={diffuseTex}
              roughness={config?.surfaceRoughness ?? 0.8}
              metalness={config?.surfaceMetalness ?? 0.05}
            />
          ) : (
            <meshStandardMaterial
              color={planet?.color || "#888"}
              roughness={0.6}
            />
          )}
        </mesh>
        {/* Cloud layer */}
        {cloudTex && (
          <mesh rotation={[0, 0.5, 0]}>
            <sphereGeometry args={[size * 1.01, 64, 64]} />
            <meshStandardMaterial
              map={cloudTex}
              transparent
              opacity={0.7}
              depthWrite={false}
            />
          </mesh>
        )}
        {/* Atmosphere */}
        {config?.hasAtmosphere && (
          <mesh
            scale={[
              1 + (config.atmosphereThickness || 0.04),
              1 + (config.atmosphereThickness || 0.04),
              1 + (config.atmosphereThickness || 0.04),
            ]}
          >
            <sphereGeometry args={[size * 1.015, 64, 64]} />
            <shaderMaterial
              vertexShader={AtmosphereVertexShader}
              fragmentShader={AtmosphereFragmentShader}
              uniforms={{
                uColor: { value: atmoColor },
                uIntensity: { value: (config.atmosphereIntensity || 0.5) * 2 },
                uSunDirection: { value: sunDir.clone() },
                uFalloff: { value: config.atmosphereFalloff ?? 3.0 },
                uDensity: { value: config.atmosphereDensity ?? 0.5 },
              }}
              transparent
              depthWrite={false}
              side={THREE.BackSide}
            />
          </mesh>
        )}
        {/* Ring system */}
        {config?.hasRings && (
          <mesh rotation={[Math.PI / 2.5, 0, 0]}>
            <ringGeometry
              args={[
                size * (config.ringInnerRadius || 1.3),
                size * (config.ringOuterRadius || 2.2),
                128,
              ]}
            />
            <meshStandardMaterial
              color="#d4c090"
              side={THREE.DoubleSide}
              transparent
              opacity={config.ringOpacity || 0.5}
            />
          </mesh>
        )}
      </group>
      {/* Stars */}
      <CompStars />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

function CompStars({ count = 500 }: { count?: number }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 30 + Math.random() * 50;
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
        opacity={0.5}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Main Comparison Component
// ---------------------------------------------------------------------------
export function PlanetComparison({ planetId }: { planetId: string }) {
  const photo = realPhotoUrls[planetId];
  const config = getTextureConfig(planetId);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setSliderPos(Math.min(95, Math.max(5, x)));
    },
    [isDragging],
  );

  const handlePointerDown = useCallback(() => setIsDragging(true), []);
  const handlePointerUp = useCallback(() => setIsDragging(false), []);

  if (!photo) {
    return (
      <div className="rounded-lg border border-border/30 bg-secondary/20 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No comparison data available for this body.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <SplitSquareHorizontal className="h-5 w-5 text-primary" />
        <div>
          <h3 className="font-sans text-lg font-semibold text-foreground">
            Real Photo vs 3D Model
          </h3>
          <p className="text-xs text-muted-foreground">
            Drag the slider to compare the real NASA photograph with the
            interactive 3D textured model.
          </p>
        </div>
      </div>

      {/* Comparison container */}
      <div
        ref={containerRef}
        className="relative aspect-square w-full max-w-2xl cursor-col-resize overflow-hidden rounded-xl border border-border/50 bg-background select-none"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Left side: Real NASA photograph */}
        <div className="absolute inset-0 bg-background">
          <img
            src={photo.url}
            alt={`Real photograph of ${planetId}`}
            className="h-full w-full object-contain"
            crossOrigin="anonymous"
            draggable={false}
          />
          {/* Label */}
          <div className="absolute top-3 left-3 rounded-md bg-card/90 px-2.5 py-1.5 text-[11px] font-semibold text-foreground backdrop-blur-md border border-border/50">
            <span className="flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-accent" />
              NASA Photograph
            </span>
          </div>
        </div>

        {/* Right side: 3D rendered model (clipped) */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 0 0 ${sliderPos}%)`,
          }}
        >
          <Canvas
            camera={{ position: [4, 2, 5], fov: 45 }}
            gl={{ antialias: true }}
            style={{ pointerEvents: "none" }}
            dpr={[1, 1.5]}
          >
            <ComparisonPlanet planetId={planetId} />
          </Canvas>
          {/* Label */}
          <div className="absolute top-3 right-3 rounded-md bg-card/90 px-2.5 py-1.5 text-[11px] font-semibold text-foreground backdrop-blur-md border border-border/50">
            <span className="flex items-center gap-1.5">
              <Box className="h-3.5 w-3.5 text-primary" />
              3D Textured Model
            </span>
          </div>
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 z-10 w-1 cursor-col-resize"
          style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
        >
          <div className="h-full w-0.5 bg-foreground/70" />
          <div className="absolute top-1/2 left-1/2 flex h-10 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-border/50 bg-card/95 backdrop-blur-md shadow-lg">
            <GripVertical className="h-4 w-4 text-foreground/70" />
          </div>
        </div>

        {/* Percentage indicators */}
        <div className="absolute bottom-3 left-3 rounded bg-card/80 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground backdrop-blur-sm">
          Photo {Math.round(sliderPos)}%
        </div>
        <div className="absolute bottom-3 right-3 rounded bg-card/80 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground backdrop-blur-sm">
          3D Model {Math.round(100 - sliderPos)}%
        </div>
      </div>

      {/* Credits */}
      <div className="max-w-2xl rounded-lg border border-border/30 bg-secondary/20 p-3">
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/70">Photograph:</span>{" "}
          {photo.description}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          <span className="font-medium text-foreground/70">Credit:</span>{" "}
          {photo.credit}
        </p>
        {config && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            <span className="font-medium text-foreground/70">3D Textures:</span>{" "}
            Solar System Scope (CC BY 4.0), based on NASA/ESA mission data
          </p>
        )}
      </div>
    </div>
  );
}
