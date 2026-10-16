"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Planet } from "@/lib/planet-data";
import type { PlanetTextureConfig } from "@/lib/texture-config";
import {
  activeLayer,
  VIEW_MODE_PROFILES,
  type LayerStates,
  type ViewMode,
  type ViewModeProfile,
} from "@/lib/layer-state";
import {
  AtmosphereFragmentShader,
  AtmosphereHazeFragmentShader,
  AtmosphereHazeVertexShader,
  AtmosphereVertexShader,
  NightLightsFragmentShader,
  NightLightsVertexShader,
} from "@/lib/shaders";
import { useProgressiveTexture } from "./use-planet-texture";

const DEG = Math.PI / 180;

/** Polar / equatorial radius ratio for visibly oblate bodies. */
const POLAR_RATIO: Record<string, number> = {
  jupiter: 0.935,
  saturn: 0.902,
  uranus: 0.977,
  neptune: 0.983,
};

/** Base bump strength for three.js' derivative-based bump mapping. */
const BASE_BUMP_SCALE = 1.2;
/** Clouds drift slightly faster than the surface so the motion reads as weather. */
const CLOUD_DRIFT = 1.12;

/** Globe orientation in degrees: sub-observer longitude/latitude and on-screen roll. */
export interface PlanetOrientation {
  lon: number;
  lat: number;
  roll: number;
}

/** Axial tilt folded into 0-90° plus spin direction (retrograde rotators spin backwards). */
export function tiltAndSpin(planet: Planet): { tilt: number; direction: 1 | -1 } {
  const t = planet.axialTilt ?? 0;
  return t > 90 ? { tilt: 180 - t, direction: -1 } : { tilt: t, direction: 1 };
}

// ---------------------------------------------------------------------------
// Color grading (enhanced mode): saturation/contrast applied after the map
// is sampled, like NASA's enhanced-color imagery.
// ---------------------------------------------------------------------------
type GradeUniforms = { uSaturation: { value: number }; uContrast: { value: number } };

function useColorGrade(profile: ViewModeProfile) {
  const uniforms = useMemo<GradeUniforms>(
    () => ({ uSaturation: { value: 1 }, uContrast: { value: 1 } }),
    [],
  );
  uniforms.uSaturation.value = profile.saturation;
  uniforms.uContrast.value = profile.contrast;

  const onBeforeCompile = useMemo(
    () => (shader: THREE.WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uSaturation = uniforms.uSaturation;
      shader.uniforms.uContrast = uniforms.uContrast;
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "void main() {",
          "uniform float uSaturation;\nuniform float uContrast;\nvoid main() {",
        )
        .replace(
          "#include <map_fragment>",
          `#include <map_fragment>
          {
            float luma = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
            diffuseColor.rgb = mix(vec3(luma), diffuseColor.rgb, uSaturation);
            diffuseColor.rgb = max((diffuseColor.rgb - 0.18) * uContrast + 0.18, 0.0);
          }`,
        );
    },
    [uniforms],
  );
  return onBeforeCompile;
}

// ---------------------------------------------------------------------------
// Surface
// ---------------------------------------------------------------------------
function Surface({
  config,
  layers,
  profile,
  size,
  fallbackColor,
}: {
  config: PlanetTextureConfig;
  layers: LayerStates;
  profile: ViewModeProfile;
  size: number;
  fallbackColor: string;
}) {
  const diffuse = activeLayer(config, layers, "diffuse");
  const bump = activeLayer(config, layers, "bump");
  const specular = activeLayer(config, layers, "specular");

  const map = useProgressiveTexture(diffuse?.layer);
  const bumpMap = useProgressiveTexture(bump?.layer, { srgb: false });
  const specularMap = useProgressiveTexture(specular?.layer, { srgb: false });
  const onBeforeCompile = useColorGrade(profile);

  const useBump = !!(bump && bumpMap);
  const useSpecular = !!(specular && specularMap);
  const glint = useSpecular ? specular!.opacity : 0;
  const specularColor = useMemo(
    () => new THREE.Color(0.026, 0.03, 0.036).multiplyScalar(glint),
    [glint],
  );

  return (
    <mesh>
      <sphereGeometry args={[size, 128, 64]} />
      <meshPhongMaterial
        // Shader defines depend on which maps exist; recreate instead of patching.
        key={`${!!map}-${useBump}-${useSpecular}`}
        color={map ? "#ffffff" : fallbackColor}
        map={map}
        bumpMap={useBump ? bumpMap : null}
        bumpScale={useBump ? bump!.opacity * BASE_BUMP_SCALE * profile.reliefScale : 0}
        specularMap={useSpecular ? specularMap : null}
        specular={useSpecular ? specularColor : new THREE.Color(0x000000)}
        shininess={useSpecular ? 55 : 4}
        onBeforeCompile={onBeforeCompile}
        customProgramCacheKey={() => "planet-surface-graded"}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Clouds: separate sphere slightly above the surface
// ---------------------------------------------------------------------------
function Clouds({
  config,
  layers,
  profile,
  size,
}: {
  config: PlanetTextureConfig;
  layers: LayerStates;
  profile: ViewModeProfile;
  size: number;
}) {
  const clouds = activeLayer(config, layers, "clouds");
  const tex = useProgressiveTexture(clouds?.layer, { srgb: !!clouds?.layer.opaque });
  const onBeforeCompile = useColorGrade(profile);
  if (!clouds || !tex) return null;
  const opaque = !!clouds.layer.opaque;

  return (
    <mesh renderOrder={1}>
      <sphereGeometry args={[size * 1.008, 128, 64]} />
      {opaque ? (
        <meshPhongMaterial
          key="opaque"
          map={tex}
          transparent={clouds.opacity < 1}
          opacity={clouds.opacity}
          depthWrite={clouds.opacity >= 1}
          specular="#000000"
          shininess={2}
          onBeforeCompile={onBeforeCompile}
          customProgramCacheKey={() => "planet-clouds-graded"}
        />
      ) : (
        // White-on-black cloud maps: brightness drives transparency.
        <meshPhongMaterial
          key="alpha"
          color="#ffffff"
          alphaMap={tex}
          transparent
          opacity={clouds.opacity}
          depthWrite={false}
          specular="#000000"
          shininess={2}
        />
      )}
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Night lights: emissive map visible only on the dark side
// ---------------------------------------------------------------------------
function NightLights({
  config,
  layers,
  profile,
  size,
  sunDirection,
}: {
  config: PlanetTextureConfig;
  layers: LayerStates;
  profile: ViewModeProfile;
  size: number;
  sunDirection: THREE.Vector3;
}) {
  const lights = activeLayer(config, layers, "emissive");
  const tex = useProgressiveTexture(lights?.layer);
  const uniforms = useMemo(
    () => ({
      uNightMap: { value: null as THREE.Texture | null },
      uIntensity: { value: 0 },
      uSunDirection: { value: new THREE.Vector3() },
    }),
    [],
  );
  uniforms.uNightMap.value = tex;
  uniforms.uIntensity.value = (lights?.opacity ?? 0) * profile.nightLights;

  useFrame(() => {
    uniforms.uSunDirection.value.copy(sunDirection);
  });

  if (!lights || !tex) return null;
  return (
    <mesh>
      <sphereGeometry args={[size * 1.002, 128, 64]} />
      <shaderMaterial
        vertexShader={NightLightsVertexShader}
        fragmentShader={NightLightsFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Atmosphere: limb glow on a back-facing shell
// ---------------------------------------------------------------------------
const scratchScale = new THREE.Vector3();

function Atmosphere({
  config,
  layers,
  profile,
  size,
  sunDirection,
}: {
  config: PlanetTextureConfig;
  layers: LayerStates;
  profile: ViewModeProfile;
  size: number;
  sunDirection: THREE.Vector3;
}) {
  const atmo = activeLayer(config, layers, "atmosphere");
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(config.atmosphereColor) },
      uIntensity: { value: 0 },
      uSunDirection: { value: new THREE.Vector3() },
      uFalloff: { value: config.atmosphereFalloff ?? 2.2 },
      uCenter: { value: new THREE.Vector3() },
      uPlanetRadius: { value: 1 },
      uShellRadius: { value: 1 },
    }),
    [config],
  );
  const hazeUniforms = useMemo(
    () => ({
      uColor: uniforms.uColor,
      uIntensity: { value: 0 },
      uSunDirection: uniforms.uSunDirection,
    }),
    [uniforms],
  );
  const meshRef = useRef<THREE.Mesh>(null);
  const shellRadius =
    size * (1 + Math.max(0.015, config.atmosphereThickness) * profile.atmosphereThickness);
  uniforms.uIntensity.value = (atmo?.opacity ?? 0) * profile.atmosphere;
  hazeUniforms.uIntensity.value = uniforms.uIntensity.value * 0.9;

  useFrame(() => {
    uniforms.uSunDirection.value.copy(sunDirection);
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.getWorldPosition(uniforms.uCenter.value);
    const scale = mesh.getWorldScale(scratchScale).x;
    uniforms.uPlanetRadius.value = size * scale;
    uniforms.uShellRadius.value = shellRadius * scale;
  });

  if (!config.hasAtmosphere || !atmo) return null;

  return (
    <>
      <mesh ref={meshRef} renderOrder={2}>
        <sphereGeometry args={[shellRadius, 96, 48]} />
        <shaderMaterial
          vertexShader={AtmosphereVertexShader}
          fragmentShader={AtmosphereFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh renderOrder={3}>
        <sphereGeometry args={[size * 1.012, 96, 48]} />
        <shaderMaterial
          vertexShader={AtmosphereHazeVertexShader}
          fragmentShader={AtmosphereHazeFragmentShader}
          uniforms={hazeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

// ---------------------------------------------------------------------------
// Rings: textured (Saturn) or procedural bands, in the equatorial plane
// ---------------------------------------------------------------------------
function useBandTexture(
  bands: [number, number, number][] | undefined,
  inner: number,
  outer: number,
) {
  return useMemo(() => {
    if (!bands?.length) return null;
    const width = 1024;
    const data = new Uint8Array(width * 4);
    for (let i = 0; i < width; i++) {
      const r = inner + ((i + 0.5) / width) * (outer - inner);
      let a = 0;
      for (const [b0, b1, alpha] of bands) {
        // Widen hairline rings to at least one texel so they stay visible.
        const half = Math.max((b1 - b0) / 2, (outer - inner) / width);
        const mid = (b0 + b1) / 2;
        if (Math.abs(r - mid) <= half) a = Math.max(a, alpha);
      }
      data.set([255, 255, 255, Math.round(a * 255)], i * 4);
    }
    const tex = new THREE.DataTexture(data, width, 1, THREE.RGBAFormat);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [bands, inner, outer]);
}

function Rings({
  config,
  layers,
  size,
}: {
  config: PlanetTextureConfig;
  layers: LayerStates;
  size: number;
}) {
  const rings = activeLayer(config, layers, "rings");
  const inner = config.ringInnerRadius ?? 1.3;
  const outer = config.ringOuterRadius ?? 2.2;
  const imageTex = useProgressiveTexture(
    rings && config.ringTexture
      ? { url: config.ringTexture, urlWebP: config.ringTextureWebP }
      : null,
  );
  const bandTex = useBandTexture(config.ringBands, inner, outer);
  const tex = imageTex ?? bandTex;

  // Radial UVs so the 1D ring texture runs from the inner to the outer edge.
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(inner * size, outer * size, 256, 1);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      uv.setXY(i, (v.length() / size - inner) / (outer - inner), 0.5);
    }
    uv.needsUpdate = true;
    return geo;
  }, [inner, outer, size]);

  if (!config.hasRings || !rings || !tex) return null;
  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <meshLambertMaterial
        map={tex}
        color={config.ringColor ?? "#cccccc"}
        side={THREE.DoubleSide}
        transparent
        opacity={rings.opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// PlanetBody: the complete layered globe
// ---------------------------------------------------------------------------
export interface PlanetBodyProps {
  planet: Planet;
  config: PlanetTextureConfig;
  /** Effective layer states (dependencies already applied). */
  layers: LayerStates;
  viewMode: ViewMode;
  /** World-space unit vector pointing towards the Sun. */
  sunDirection: THREE.Vector3;
  /** Equatorial radius in scene units. */
  size?: number;
  /** Explicit orientation (e.g. to match a photo). Defaults to the planet's axial tilt. */
  orientation?: PlanetOrientation;
  spin?: boolean;
  /** Spin speed in radians per second. */
  spinSpeed?: number;
  /** Changing this value resets the accumulated spin to the base orientation. */
  resetToken?: number;
}

export function PlanetBody({
  planet,
  config,
  layers,
  viewMode,
  sunDirection,
  size = 2,
  orientation,
  spin = true,
  spinSpeed = 0.12,
  resetToken = 0,
}: PlanetBodyProps) {
  const profile = VIEW_MODE_PROFILES[viewMode];
  const { tilt, direction } = tiltAndSpin(planet);
  const o = orientation ?? { lon: 0, lat: 0, roll: tilt };
  const lonOffset = (-90 - o.lon) * DEG;
  const polar = POLAR_RATIO[planet.id] ?? 1;

  const surfaceRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Group>(null);
  const angle = useRef(0);
  const lastReset = useRef(resetToken);

  useFrame((_, dt) => {
    if (lastReset.current !== resetToken) {
      lastReset.current = resetToken;
      angle.current = 0;
    }
    if (spin) angle.current += Math.min(dt, 0.1) * spinSpeed * direction;
    if (surfaceRef.current) surfaceRef.current.rotation.y = lonOffset + angle.current;
    if (cloudsRef.current) cloudsRef.current.rotation.y = lonOffset + angle.current * CLOUD_DRIFT;
  });

  const fallbackColor = config.baseColor ?? planet.color;

  return (
    <group rotation={[0, 0, o.roll * DEG]}>
      <group rotation={[o.lat * DEG, 0, 0]}>
        <group scale={[1, polar, 1]}>
          <group ref={surfaceRef} rotation={[0, lonOffset, 0]}>
            <Surface
              config={config}
              layers={layers}
              profile={profile}
              size={size}
              fallbackColor={fallbackColor}
            />
            <NightLights
              config={config}
              layers={layers}
              profile={profile}
              size={size}
              sunDirection={sunDirection}
            />
          </group>
          <group ref={cloudsRef} rotation={[0, lonOffset, 0]}>
            <Clouds config={config} layers={layers} profile={profile} size={size} />
          </group>
          <Atmosphere
            config={config}
            layers={layers}
            profile={profile}
            size={size}
            sunDirection={sunDirection}
          />
        </group>
        <Rings config={config} layers={layers} size={size} />
      </group>
    </group>
  );
}

/** Sun + fill lights matching a view mode. `sunDirection` points towards the Sun. */
export function PlanetLights({
  viewMode,
  sunDirection,
}: {
  viewMode: ViewMode;
  sunDirection: THREE.Vector3;
}) {
  const profile = VIEW_MODE_PROFILES[viewMode];
  const position = useMemo(
    () => sunDirection.clone().multiplyScalar(50).toArray() as [number, number, number],
    [sunDirection],
  );
  return (
    <>
      <ambientLight intensity={profile.ambient} />
      {profile.fill > 0 && <hemisphereLight args={["#9ab4dc", "#2a2a3a", profile.fill]} />}
      <directionalLight position={position} intensity={profile.sun} color="#fff5e8" />
    </>
  );
}
