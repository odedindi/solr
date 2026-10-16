import { describe, expect, it } from "vitest";
import {
  activeLayer,
  defaultLayerStates,
  effectiveLayerStates,
  isLayerActive,
  mergeLayerStates,
  missingRequirements,
  VIEW_MODE_DESCRIPTIONS,
  VIEW_MODE_PROFILES,
  type LayerStates,
} from "@/lib/layer-state";
import { textureConfigs, type PlanetTextureConfig, type TextureLayer } from "@/lib/texture-config";

const layer = (overrides: Partial<TextureLayer> & Pick<TextureLayer, "id">): TextureLayer => ({
  label: overrides.id,
  type: "diffuse",
  url: `/${overrides.id}.jpg`,
  defaultEnabled: true,
  defaultOpacity: 1,
  description: "",
  source: "",
  scientificNote: "",
  ...overrides,
});

// surface <- relief <- detail (a requirement chain), plus an independent cloud layer.
const config: PlanetTextureConfig = {
  planetId: "test",
  layers: [
    layer({ id: "surface" }),
    layer({ id: "relief", type: "bump", requires: ["surface"] }),
    layer({ id: "detail", type: "specular", requires: ["relief"], defaultOpacity: 0.5 }),
    layer({ id: "clouds", type: "clouds", defaultEnabled: false, defaultOpacity: 0.8 }),
  ],
  hasAtmosphere: false,
  atmosphereColor: "#000000",
  atmosphereIntensity: 0,
  atmosphereThickness: 0,
  hasRings: false,
};
const byId = (id: string) => config.layers.find((l) => l.id === id)!;
const defaults = defaultLayerStates(config);
const withState = (id: string, enabled: boolean): LayerStates => ({
  ...defaults,
  [id]: { ...defaults[id], enabled },
});

describe("defaultLayerStates", () => {
  it("uses each layer's default enabled flag and opacity", () => {
    expect(defaults).toEqual({
      surface: { enabled: true, opacity: 1 },
      relief: { enabled: true, opacity: 1 },
      detail: { enabled: true, opacity: 0.5 },
      clouds: { enabled: false, opacity: 0.8 },
    });
  });

  it("returns an empty object without a config", () => {
    expect(defaultLayerStates(null)).toEqual({});
  });
});

describe("layer requirements", () => {
  it("treats a layer as active when it and its requirements are enabled", () => {
    expect(isLayerActive(config, byId("detail"), defaults)).toBe(true);
    expect(missingRequirements(config, byId("detail"), defaults)).toEqual([]);
  });

  it("deactivates dependants when a requirement is switched off", () => {
    const states = withState("surface", false);
    expect(missingRequirements(config, byId("relief"), states)).toEqual(["surface"]);
    expect(isLayerActive(config, byId("relief"), states)).toBe(false);
  });

  it("follows requirement chains transitively", () => {
    const states = withState("surface", false);
    // detail only lists relief, which is itself blocked by surface.
    expect(missingRequirements(config, byId("detail"), states)).toEqual(["relief"]);
    expect(isLayerActive(config, byId("detail"), states)).toBe(false);
  });

  it("ignores requirements that reference unknown layers", () => {
    const orphan = layer({ id: "orphan", requires: ["does-not-exist"] });
    expect(missingRequirements(config, orphan, defaults)).toEqual([]);
  });

  it("falls back to layer defaults for layers missing from the state map", () => {
    expect(isLayerActive(config, byId("relief"), {})).toBe(true);
    expect(isLayerActive(config, byId("clouds"), {})).toBe(false);
  });
});

describe("effectiveLayerStates", () => {
  it("disables blocked layers but keeps their stored opacity", () => {
    const effective = effectiveLayerStates(config, withState("surface", false));
    expect(effective.relief).toEqual({ enabled: false, opacity: 1 });
    expect(effective.detail).toEqual({ enabled: false, opacity: 0.5 });
    expect(effective.clouds).toEqual({ enabled: false, opacity: 0.8 });
  });

  it("does not change the user's toggles (re-enabling a requirement restores dependants)", () => {
    const states = withState("surface", false);
    effectiveLayerStates(config, states);
    expect(states.relief.enabled).toBe(true);
    expect(effectiveLayerStates(config, withState("surface", true)).relief.enabled).toBe(true);
  });
});

describe("activeLayer", () => {
  it("returns the layer of a type with its opacity when enabled", () => {
    expect(activeLayer(config, defaults, "specular")).toEqual({
      layer: byId("detail"),
      opacity: 0.5,
    });
  });

  it("returns null when the layer is disabled or the type is absent", () => {
    expect(activeLayer(config, defaults, "clouds")).toBeNull();
    expect(activeLayer(config, defaults, "emissive")).toBeNull();
  });
});

describe("mergeLayerStates", () => {
  it("returns the base states when there is nothing to merge", () => {
    expect(mergeLayerStates(config, defaults, undefined)).toBe(defaults);
    expect(mergeLayerStates(null, defaults, { surface: false })).toBe(defaults);
  });

  it("accepts a boolean shorthand for the enabled flag", () => {
    const merged = mergeLayerStates(config, defaults, { clouds: true, surface: false });
    expect(merged.clouds).toEqual({ enabled: true, opacity: 0.8 });
    expect(merged.surface).toEqual({ enabled: false, opacity: 1 });
  });

  it("clamps opacity to [0, 1]", () => {
    const merged = mergeLayerStates(config, defaults, {
      surface: { opacity: 2 },
      clouds: { opacity: -1 },
    });
    expect(merged.surface.opacity).toBe(1);
    expect(merged.clouds.opacity).toBe(0);
  });

  it("ignores invalid values and unknown layer ids", () => {
    const merged = mergeLayerStates(config, defaults, {
      surface: { opacity: Number.NaN, enabled: "yes" as unknown as boolean },
      detail: { opacity: Number.POSITIVE_INFINITY },
      ghost: { enabled: true },
    });
    expect(merged.surface).toEqual(defaults.surface);
    expect(merged.detail).toEqual(defaults.detail);
    expect(merged).not.toHaveProperty("ghost");
  });

  it("does not mutate the base states", () => {
    const base = defaultLayerStates(config);
    mergeLayerStates(config, base, { surface: false });
    expect(base.surface.enabled).toBe(true);
  });
});

describe("view modes", () => {
  it("defines a profile and description for every mode", () => {
    expect(Object.keys(VIEW_MODE_PROFILES).sort()).toEqual(["enhanced", "realistic"]);
    expect(Object.keys(VIEW_MODE_DESCRIPTIONS).sort()).toEqual(["enhanced", "realistic"]);
  });

  it("keeps realistic mode physically neutral", () => {
    const r = VIEW_MODE_PROFILES.realistic;
    expect(r).toMatchObject({ fill: 0, reliefScale: 1, saturation: 1, contrast: 1 });
  });

  it("makes enhanced mode exaggerate relief and light the night side", () => {
    const { realistic, enhanced } = VIEW_MODE_PROFILES;
    expect(enhanced.reliefScale).toBeGreaterThan(realistic.reliefScale);
    expect(enhanced.fill).toBeGreaterThan(realistic.fill);
    expect(enhanced.ambient).toBeGreaterThan(realistic.ambient);
  });
});

describe("real planet configs", () => {
  it("turning off Earth's surface disables relief and glint only", () => {
    const earth = textureConfigs.earth;
    const states = mergeLayerStates(earth, defaultLayerStates(earth), { surface: false });
    const effective = effectiveLayerStates(earth, states);
    expect(effective.relief.enabled).toBe(false);
    expect(effective.glint.enabled).toBe(false);
    expect(effective.clouds.enabled).toBe(true);
    expect(effective.nightlights.enabled).toBe(true);
  });
});
