import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { allBodies } from "@/lib/planet-data";
import {
  getOverviewTextureUrl,
  getRingTextureUrl,
  preferredLayerUrl,
  textureConfigs,
  type TextureLayer,
} from "@/lib/texture-config";

const publicFile = (url: string) => join(process.cwd(), "public", url);

const layer = (overrides: Partial<TextureLayer>): TextureLayer => ({
  id: "surface",
  label: "Surface",
  type: "diffuse",
  url: "/a.jpg",
  defaultEnabled: true,
  defaultOpacity: 1,
  description: "",
  source: "",
  scientificNote: "",
  ...overrides,
});

describe("preferredLayerUrl", () => {
  it("prefers the WebP version", () => {
    expect(preferredLayerUrl(layer({ urlWebP: "/a.webp" }))).toBe("/a.webp");
  });

  it("falls back to the primary URL when no WebP exists", () => {
    expect(preferredLayerUrl(layer({}))).toBe("/a.jpg");
  });

  it("returns null for a missing layer", () => {
    expect(preferredLayerUrl(undefined)).toBeNull();
  });
});

describe("getOverviewTextureUrl", () => {
  it("returns a WebP texture for every body that has a texture config", () => {
    for (const body of allBodies) {
      if (!textureConfigs[body.id]) continue;
      expect(getOverviewTextureUrl(body.id), body.id).toMatch(/\.webp$/);
    }
    expect(getOverviewTextureUrl("sun")).toMatch(/\.webp$/);
  });

  it("returns null for unknown bodies", () => {
    expect(getOverviewTextureUrl("vulcan")).toBeNull();
  });
});

describe("getRingTextureUrl", () => {
  it("prefers the WebP ring texture", () => {
    expect(getRingTextureUrl("saturn")).toMatch(/\.webp$/);
  });

  it("returns null for planets without a ring texture", () => {
    expect(getRingTextureUrl("earth")).toBeNull();
  });
});

// Overview scenes load textures via Suspense, so a missing file would crash the canvas.
describe("texture files", () => {
  const urls = new Set<string>();
  for (const cfg of Object.values(textureConfigs)) {
    for (const l of cfg.layers) {
      for (const u of [l.url, l.urlWebP, l.urlHiRes, l.urlHiResWebP]) if (u) urls.add(u);
    }
    for (const u of [cfg.ringTexture, cfg.ringTextureWebP]) if (u) urls.add(u);
  }

  it.each([...urls])("%s exists in /public", (url) => {
    expect(existsSync(publicFile(url))).toBe(true);
  });
});
