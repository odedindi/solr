import * as THREE from "three";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The module keeps a texture cache, so each test gets a fresh copy.
async function freshModule() {
  vi.resetModules();
  return import("./use-planet-texture");
}

let loadAsync: ReturnType<typeof spyOnLoadAsync>;
const spyOnLoadAsync = () => vi.spyOn(THREE.TextureLoader.prototype, "loadAsync");
const managers: Array<THREE.LoadingManager | undefined> = [];

beforeEach(() => {
  managers.length = 0;
  loadAsync = spyOnLoadAsync().mockImplementation(async function (
    this: THREE.TextureLoader,
    url: string,
  ) {
    managers.push(this.manager);
    if (url.includes("broken")) throw new Error(`404 ${url}`);
    const tex = new THREE.Texture<HTMLImageElement>();
    tex.name = url;
    return tex;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("loadTexture", () => {
  it("uses the first candidate that loads", async () => {
    const { loadTexture } = await freshModule();
    const tex = await loadTexture(["/a.webp", "/a.jpg"], true);
    expect(tex?.name).toBe("/a.webp");
    expect(loadAsync).toHaveBeenCalledTimes(1);
  });

  it("falls back to the next candidate when one fails", async () => {
    const { loadTexture } = await freshModule();
    const tex = await loadTexture(["/broken.webp", "/a.jpg"], true);
    expect(tex?.name).toBe("/a.jpg");
    expect(loadAsync.mock.calls.map((c) => c[0])).toEqual(["/broken.webp", "/a.jpg"]);
  });

  it("resolves to null when every candidate fails", async () => {
    const { loadTexture } = await freshModule();
    expect(await loadTexture(["/broken.webp", "/broken.jpg"], true)).toBeNull();
  });

  it("deduplicates requests for the same candidates and colour space", async () => {
    const { loadTexture } = await freshModule();
    const [a, b] = await Promise.all([
      loadTexture(["/a.webp"], true),
      loadTexture(["/a.webp"], true),
    ]);
    expect(a).toBe(b);
    expect(loadAsync).toHaveBeenCalledTimes(1);
  });

  it("caches colour and data textures separately", async () => {
    const { loadTexture } = await freshModule();
    const color = await loadTexture(["/a.webp"], true);
    const data = await loadTexture(["/a.webp"], false);
    expect(color).not.toBe(data);
    expect(color?.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(data?.colorSpace).not.toBe(THREE.SRGBColorSpace);
  });

  it("tracks foreground loads on the default manager (drives the loading screen)", async () => {
    const { loadTexture } = await freshModule();
    await loadTexture(["/a.webp"], true);
    expect(managers[0]).toBe(THREE.DefaultLoadingManager);
  });

  it("keeps background (hi-res) loads off the default manager", async () => {
    const { loadTexture } = await freshModule();
    await loadTexture(["/a_8k.webp"], true, { background: true });
    expect(managers[0]).toBeInstanceOf(THREE.LoadingManager);
    expect(managers[0]).not.toBe(THREE.DefaultLoadingManager);
  });
});

describe("allowHiRes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const stubPointer = (coarse: boolean) =>
    vi.stubGlobal("window", { matchMedia: () => ({ matches: coarse }) });

  it("allows hi-res maps on fine-pointer devices", async () => {
    stubPointer(false);
    const { allowHiRes } = await freshModule();
    expect(allowHiRes()).toBe(true);
  });

  it("skips hi-res maps on touch devices", async () => {
    stubPointer(true);
    const { allowHiRes } = await freshModule();
    expect(allowHiRes()).toBe(false);
  });

  it("is disabled during server rendering", async () => {
    const { allowHiRes } = await freshModule();
    expect(allowHiRes()).toBe(false);
  });
});
