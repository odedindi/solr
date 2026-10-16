"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  Box,
  Camera,
  GripVertical,
  Pause,
  Play,
  RotateCcw,
  SplitSquareHorizontal,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { getTextureConfig, type PlanetTextureConfig } from "@/lib/texture-config";
import { allBodies, type Planet } from "@/lib/planet-data";
import {
  defaultLayerStates,
  effectiveLayerStates,
  isLayerActive,
  mergeLayerStates,
  missingRequirements,
  type LayerStates,
} from "@/lib/layer-state";
import { PlanetBody, PlanetLights, type PlanetOrientation } from "@/components/planet/planet-body";
import { Slider } from "@/components/ui/slider";

// ---------------------------------------------------------------------------
// Per-photo calibration. Disc values are fractions of the square comparison
// frame (the photo is drawn with object-contain); orientation is the
// sub-observer longitude/latitude and on-screen roll that match the photo;
// `sun` is the direction towards the Sun in camera space (+Z = towards viewer).
// ---------------------------------------------------------------------------
interface PhotoCalibration {
  url: string;
  credit: string;
  description: string;
  disc: { cx: number; cy: number; r: number };
  orientation: PlanetOrientation;
  sun: [number, number, number];
  /** Layer overrides so the model shows what the camera actually captured. */
  layers?: Record<string, boolean>;
}

const FULL_PHASE_SUN: [number, number, number] = [0.2, 0.1, 1];

const CALIBRATION: Record<string, PhotoCalibration> = {
  mercury: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/1280px-Mercury_in_true_color.jpg",
    credit: "NASA/Johns Hopkins University APL/Carnegie Institution of Washington",
    description: "True-color image from MESSENGER spacecraft (2008)",
    disc: { cx: 0.496, cy: 0.499, r: 0.46 },
    orientation: { lon: -35, lat: 0, roll: 0 },
    sun: [0.64, 0, 0.77],
  },
  venus: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Venus_from_Mariner_10.jpg/1280px-Venus_from_Mariner_10.jpg",
    credit: "NASA/JPL-Caltech",
    description: "Enhanced color image from Mariner 10 (1974)",
    disc: { cx: 0.514, cy: 0.501, r: 0.469 },
    orientation: { lon: 0, lat: 0, roll: 0 },
    sun: [-0.53, 0, 0.85],
    layers: { clouds: true },
  },
  earth: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/1280px-The_Blue_Marble_%28remastered%29.jpg",
    credit: "NASA/Apollo 17 crew",
    description: "The Blue Marble - Apollo 17 (December 7, 1972)",
    disc: { cx: 0.5, cy: 0.497, r: 0.448 },
    orientation: { lon: 38, lat: -34, roll: 3 },
    sun: FULL_PHASE_SUN,
    layers: { nightlights: false },
  },
  mars: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png/1280px-Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png",
    credit: "NASA/JPL-Caltech/Kevin M. Gill",
    description: "Processed from Mars Reconnaissance Orbiter data",
    disc: { cx: 0.504, cy: 0.494, r: 0.419 },
    orientation: { lon: -105, lat: -6, roll: 0 },
    sun: FULL_PHASE_SUN,
  },
  jupiter: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Jupiter_New_Horizons.jpg/1280px-Jupiter_New_Horizons.jpg",
    credit: "NASA/Johns Hopkins University APL/Southwest Research Institute",
    description: "True-color image from New Horizons spacecraft (2007)",
    disc: { cx: 0.511, cy: 0.501, r: 0.485 },
    orientation: { lon: 0, lat: 0, roll: 0 },
    sun: FULL_PHASE_SUN,
    layers: { rings: false },
  },
  saturn: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/1280px-Saturn_during_Equinox.jpg",
    credit: "NASA/JPL/Space Science Institute (Cassini)",
    description: "Saturn during equinox - Cassini spacecraft (2008)",
    disc: { cx: 0.502, cy: 0.504, r: 0.186 },
    orientation: { lon: 0, lat: 0, roll: 0 },
    sun: FULL_PHASE_SUN,
    layers: { rings: true },
  },
  uranus: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Uranus_as_seen_by_NASA%27s_Voyager_2.tif/lossless-page1-1280px-Uranus_as_seen_by_NASA%27s_Voyager_2.tif.jpg",
    credit: "NASA/JPL-Caltech (Voyager 2)",
    description: "Reprocessed Voyager 2 image (1986)",
    disc: { cx: 0.482, cy: 0.492, r: 0.394 },
    orientation: { lon: 0, lat: -85, roll: 0 },
    sun: FULL_PHASE_SUN,
    layers: { rings: false },
  },
  neptune: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Neptune_Voyager2_color_calibrated.png/1280px-Neptune_Voyager2_color_calibrated.png",
    credit: "NASA/JPL (Voyager 2)",
    description: "Color-calibrated Voyager 2 image (1989)",
    disc: { cx: 0.502, cy: 0.506, r: 0.426 },
    orientation: { lon: 0, lat: 0, roll: 0 },
    sun: FULL_PHASE_SUN,
    layers: { rings: false },
  },
  pluto: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Pluto_in_True_Color_-_High-Res.jpg/1280px-Pluto_in_True_Color_-_High-Res.jpg",
    credit: "NASA/Johns Hopkins University APL/Southwest Research Institute",
    description: "True-color image from New Horizons (July 14, 2015)",
    disc: { cx: 0.506, cy: 0.499, r: 0.439 },
    orientation: { lon: 165, lat: 20, roll: 0 },
    sun: FULL_PHASE_SUN,
  },
};

const MODEL_RADIUS = 2;
const FOV = 20;
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;

/** Camera distance at which a sphere of MODEL_RADIUS fills `r` of the frame height. */
function fitDistance(r: number) {
  const halfFov = THREE.MathUtils.degToRad(FOV / 2);
  const alpha = Math.atan(2 * r * Math.tan(halfFov));
  return MODEL_RADIUS / Math.sin(alpha);
}

// ---------------------------------------------------------------------------
// Camera rig: distance from the photo's disc radius × model size, an
// off-axis projection shift to land on the photo's disc centre, and
// camera.zoom kept in lockstep with the photo's CSS zoom.
// ---------------------------------------------------------------------------
function CompareCamera({
  calibration,
  modelScale,
  zoom,
  resetToken,
}: {
  calibration: PhotoCalibration;
  modelScale: number;
  zoom: number;
  resetToken: number;
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const distance = fitDistance(calibration.disc.r * modelScale);

  // Keep the current viewing direction, only change how far away we are.
  useEffect(() => {
    const dir = camera.position.lengthSq() > 0 ? camera.position.clone().normalize() : null;
    camera.position.copy((dir ?? new THREE.Vector3(0, 0, 1)).multiplyScalar(distance));
    camera.lookAt(0, 0, 0);
    controls.current?.update();
  }, [camera, distance]);

  useEffect(() => {
    camera.position.set(0, 0, distance);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    controls.current?.update();
    // Only on explicit reset; distance changes are handled above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, resetToken]);

  useFrame(() => {
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
    const ox = (calibration.disc.cx - 0.5) * 2;
    const oy = -(calibration.disc.cy - 0.5) * 2;
    camera.projectionMatrix.elements[8] = -ox * zoom;
    camera.projectionMatrix.elements[9] = -oy * zoom;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  });

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableZoom={false}
      rotateSpeed={0.5}
      enableDamping
      dampingFactor={0.1}
    />
  );
}

function CompareScene({
  planet,
  config,
  calibration,
  layers,
  modelScale,
  zoom,
  spin,
  resetToken,
}: {
  planet: Planet;
  config: PlanetTextureConfig;
  calibration: PhotoCalibration;
  layers: LayerStates;
  modelScale: number;
  zoom: number;
  spin: boolean;
  resetToken: number;
}) {
  const sunDirection = useMemo(
    () => new THREE.Vector3(...calibration.sun).normalize(),
    [calibration],
  );
  return (
    <>
      <PlanetLights viewMode="realistic" sunDirection={sunDirection} />
      <PlanetBody
        planet={planet}
        config={config}
        layers={layers}
        viewMode="realistic"
        sunDirection={sunDirection}
        size={MODEL_RADIUS}
        orientation={calibration.orientation}
        spin={spin}
        resetToken={resetToken}
      />
      <CompareCamera
        calibration={calibration}
        modelScale={modelScale}
        zoom={zoom}
        resetToken={resetToken}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Comparison Component
// ---------------------------------------------------------------------------
export function PlanetComparison({ planetId }: { planetId: string }) {
  const calibration = CALIBRATION[planetId];
  const config = getTextureConfig(planetId);
  const planet = allBodies.find((p) => p.id === planetId);

  const photoLayers = useMemo(
    () =>
      config ? mergeLayerStates(config, defaultLayerStates(config), calibration?.layers ?? {}) : {},
    [config, calibration],
  );
  const [layerStates, setLayerStates] = useState<LayerStates>(photoLayers);
  const [sliderPos, setSliderPos] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [modelScale, setModelScale] = useState(1);
  const [spin, setSpin] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const effective = useMemo(
    () => (config ? effectiveLayerStates(config, layerStates) : {}),
    [config, layerStates],
  );

  const moveSlider = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(98, Math.max(2, x)));
  }, []);

  const onHandleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    moveSlider(e.clientX);
  };
  const onHandleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) moveSlider(e.clientX);
  };
  const onHandleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setSliderPos((p) => Math.max(2, p - 5));
    if (e.key === "ArrowRight") setSliderPos((p) => Math.min(98, p + 5));
  };

  const matchPhoto = () => {
    setLayerStates(photoLayers);
    setZoom(1);
    setModelScale(1);
    setSpin(false);
    setResetToken((t) => t + 1);
  };

  const toggleLayer = (id: string) =>
    setLayerStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id]?.enabled },
    }));

  if (!calibration || !config || !planet) {
    return (
      <div className="rounded-lg border border-border/30 bg-secondary/20 p-6 text-center">
        <p className="text-sm text-muted-foreground">No comparison data available for this body.</p>
      </div>
    );
  }

  const togglableLayers = config.layers.filter((l) => l.type !== "diffuse");
  const zoomBy = (f: number) =>
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Number((z * f).toFixed(2)))));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <SplitSquareHorizontal className="h-5 w-5 text-primary" />
        <div>
          <h3 className="font-sans text-lg font-semibold text-foreground">
            Real Photo vs 3D Model
          </h3>
          <p className="text-xs text-muted-foreground">
            Drag the divider to compare. The model is lined up with the photo; drag it to rotate,
            zoom both together, or resize the model to check the fit.
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        data-compare-root
        className="relative aspect-square w-full max-w-2xl overflow-hidden rounded-xl border border-border/50 bg-black select-none"
      >
        {/* Left: photograph, zoomed about the frame centre like the 3D camera */}
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={calibration.url}
            alt={`Photograph of ${planet.name}`}
            className="h-full w-full object-contain"
            style={{ transform: `scale(${zoom})`, transformOrigin: "50% 50%" }}
            draggable={false}
          />
        </div>

        {/* Right: 3D model, clipped to the right of the divider */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}>
          <Canvas
            camera={{
              position: [0, 0, fitDistance(calibration.disc.r)],
              fov: FOV,
              near: 0.1,
              far: 500,
            }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.1,
            }}
            dpr={[1, 1.5]}
            className="cursor-grab active:cursor-grabbing"
          >
            <CompareScene
              planet={planet}
              config={config}
              calibration={calibration}
              layers={effective}
              modelScale={modelScale}
              zoom={zoom}
              spin={spin}
              resetToken={resetToken}
            />
          </Canvas>
        </div>

        <div className="pointer-events-none absolute top-3 left-3 rounded-md border border-border/50 bg-card/90 px-2.5 py-1.5 text-[11px] font-semibold text-foreground backdrop-blur-md">
          <span className="flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5 text-accent" />
            Photograph
          </span>
        </div>
        <div className="pointer-events-none absolute top-3 right-3 rounded-md border border-border/50 bg-card/90 px-2.5 py-1.5 text-[11px] font-semibold text-foreground backdrop-blur-md">
          <span className="flex items-center gap-1.5">
            <Box className="h-3.5 w-3.5 text-primary" />
            3D Model
          </span>
        </div>

        {/* Divider: only the handle drags, so the model stays rotatable */}
        <div
          className="absolute top-0 bottom-0 z-10 w-6 -translate-x-1/2 cursor-col-resize touch-none"
          style={{ left: `${sliderPos}%` }}
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onKeyDown={onHandleKey}
          role="slider"
          tabIndex={0}
          aria-label="Comparison divider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sliderPos)}
        >
          <div className="mx-auto h-full w-0.5 bg-foreground/70" />
          <div className="absolute top-1/2 left-1/2 flex h-10 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-border/50 bg-card/95 shadow-lg backdrop-blur-md">
            <GripVertical className="h-4 w-4 text-foreground/70" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex max-w-2xl flex-col gap-3 rounded-lg border border-border/30 bg-secondary/20 p-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => zoomBy(1 / 1.25)}
              className="rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <Slider
              value={[zoom]}
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={0.05}
              onValueChange={([v]) => setZoom(v)}
              aria-label="Zoom"
              className="flex-1"
            />
            <button
              onClick={() => zoomBy(1.25)}
              className="rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <span className="w-10 text-right font-mono text-[10px] text-muted-foreground">
              {zoom.toFixed(1)}×
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Model size</span>
            <Slider
              value={[modelScale]}
              min={0.8}
              max={1.2}
              step={0.005}
              onValueChange={([v]) => setModelScale(v)}
              aria-label="Model size"
              className="flex-1"
            />
            <span className="w-10 text-right font-mono text-[10px] text-muted-foreground">
              {Math.round(modelScale * 100)}%
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {togglableLayers.map((layer) => {
            const missing = missingRequirements(config, layer, layerStates);
            const active = isLayerActive(config, layer, layerStates);
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                disabled={missing.length > 0}
                aria-pressed={active}
                title={missing.length ? `Needs ${missing.join(", ")}` : layer.description}
                className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? "border-primary/60 bg-primary/15 text-foreground"
                    : "border-border/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {layer.label}
              </button>
            );
          })}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setSpin((s) => !s)}
              className="flex items-center gap-1 rounded-md border border-border/50 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              {spin ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {spin ? "Stop" : "Spin"}
            </button>
            <button
              onClick={matchPhoto}
              className="flex items-center gap-1 rounded-md border border-border/50 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              Match photo
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl rounded-lg border border-border/30 bg-secondary/20 p-3">
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/70">Photograph:</span>{" "}
          {calibration.description}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          <span className="font-medium text-foreground/70">Credit:</span> {calibration.credit}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          <span className="font-medium text-foreground/70">3D Textures:</span> Solar System Scope
          (CC BY 4.0), based on NASA/ESA mission data
        </p>
      </div>
    </div>
  );
}
