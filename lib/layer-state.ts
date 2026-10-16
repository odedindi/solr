import type { PlanetTextureConfig, TextureLayer, TextureLayerType } from "@/lib/texture-config";

export type ViewMode = "realistic" | "enhanced";
export type LayerState = { enabled: boolean; opacity: number };
export type LayerStates = Record<string, LayerState>;

/**
 * Rendering profile per view mode. "Realistic" aims at what a camera in space
 * would record; "enhanced" trades accuracy for legibility (like NASA's
 * enhanced-color imagery): the night side gets fill light, relief is
 * exaggerated, colors are stretched and glows are stronger.
 */
export interface ViewModeProfile {
  ambient: number;
  fill: number;
  sun: number;
  reliefScale: number;
  saturation: number;
  contrast: number;
  atmosphere: number;
  atmosphereThickness: number;
  nightLights: number;
}

export const VIEW_MODE_PROFILES: Record<ViewMode, ViewModeProfile> = {
  realistic: {
    ambient: 0.025,
    fill: 0,
    sun: 2.6,
    reliefScale: 1,
    saturation: 1,
    contrast: 1,
    atmosphere: 1,
    atmosphereThickness: 2,
    nightLights: 1,
  },
  enhanced: {
    ambient: 0.3,
    fill: 0.45,
    sun: 2.4,
    reliefScale: 4,
    saturation: 1.55,
    contrast: 1.25,
    atmosphere: 1.8,
    atmosphereThickness: 3,
    nightLights: 2,
  },
};

export const VIEW_MODE_DESCRIPTIONS: Record<ViewMode, string> = {
  realistic: "True colors and lighting: the night side is dark and relief is to scale.",
  enhanced:
    "Educational exaggeration: lit night side, 4× terrain relief, stretched colors and stronger glows.",
};

export function defaultLayerStates(config: PlanetTextureConfig | null): LayerStates {
  const states: LayerStates = {};
  config?.layers.forEach((l) => {
    states[l.id] = { enabled: l.defaultEnabled, opacity: l.defaultOpacity };
  });
  return states;
}

function stateOf(layer: TextureLayer, states: LayerStates): LayerState {
  return states[layer.id] ?? { enabled: layer.defaultEnabled, opacity: layer.defaultOpacity };
}

/** Ids of required layers that are currently switched off (empty when the layer can render). */
export function missingRequirements(
  config: PlanetTextureConfig,
  layer: TextureLayer,
  states: LayerStates,
): string[] {
  return (layer.requires ?? []).filter((id) => {
    const dep = config.layers.find((l) => l.id === id);
    return dep ? !isLayerActive(config, dep, states) : false;
  });
}

/** A layer is active when it is enabled and all of its requirements are active. */
export function isLayerActive(
  config: PlanetTextureConfig,
  layer: TextureLayer,
  states: LayerStates,
): boolean {
  return stateOf(layer, states).enabled && missingRequirements(config, layer, states).length === 0;
}

/** Layer states with dependency rules applied - what actually gets rendered. */
export function effectiveLayerStates(
  config: PlanetTextureConfig,
  states: LayerStates,
): LayerStates {
  const out: LayerStates = {};
  config.layers.forEach((l) => {
    const s = stateOf(l, states);
    out[l.id] = { enabled: isLayerActive(config, l, states), opacity: s.opacity };
  });
  return out;
}

/** Find the (single) layer of a type together with its effective state. */
export function activeLayer(
  config: PlanetTextureConfig,
  states: LayerStates,
  type: TextureLayerType,
): { layer: TextureLayer; opacity: number } | null {
  const layer = config.layers.find((l) => l.type === type);
  if (!layer) return null;
  const s = states[layer.id];
  if (!s?.enabled) return null;
  return { layer, opacity: s.opacity };
}

/** Merge persisted/preset values over defaults, ignoring unknown ids and bad values. */
export function mergeLayerStates(
  config: PlanetTextureConfig | null,
  base: LayerStates,
  overrides: Record<string, Partial<LayerState> | boolean> | undefined,
): LayerStates {
  if (!config || !overrides) return base;
  const next = { ...base };
  config.layers.forEach((l) => {
    const o = overrides[l.id];
    if (o === undefined) return;
    const cur = next[l.id] ?? { enabled: l.defaultEnabled, opacity: l.defaultOpacity };
    if (typeof o === "boolean") {
      next[l.id] = { ...cur, enabled: o };
      return;
    }
    next[l.id] = {
      enabled: typeof o.enabled === "boolean" ? o.enabled : cur.enabled,
      opacity:
        typeof o.opacity === "number" && Number.isFinite(o.opacity)
          ? Math.min(1, Math.max(0, o.opacity))
          : cur.opacity,
    };
  });
  return next;
}
