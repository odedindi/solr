"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

export interface TextureSource {
  url?: string;
  urlWebP?: string;
  urlHiRes?: string;
  urlHiResWebP?: string;
}

const pending = new Map<string, Promise<THREE.Texture | null>>();
const resolved = new Map<string, THREE.Texture>();
/**
 * Hi-res upgrades load through their own manager so they don't hold the loading
 * screen (driven by THREE.DefaultLoadingManager) while multi-MB maps download.
 */
const backgroundManager = new THREE.LoadingManager();

function candidatesFor(webp: string | undefined, fallback: string | undefined): string[] {
  return [webp, fallback].filter((u): u is string => !!u && !/\.tiff?$/i.test(u));
}

function cacheKey(candidates: string[], srgb: boolean) {
  return `${srgb ? "srgb" : "linear"}|${candidates.join("|")}`;
}

/**
 * Loads the first candidate URL that succeeds (WebP first, then JPG/PNG).
 * Textures are cached per (candidates, color space) so toggling layers or
 * remounting a canvas never re-downloads or flashes an untextured sphere.
 */
export function loadTexture(
  candidates: string[],
  srgb: boolean,
  { background = false }: { background?: boolean } = {},
): Promise<THREE.Texture | null> {
  const key = cacheKey(candidates, srgb);
  const existing = pending.get(key);
  if (existing) return existing;

  const loader = new THREE.TextureLoader(background ? backgroundManager : undefined);
  loader.setCrossOrigin("anonymous");
  const promise = (async () => {
    for (const url of candidates) {
      try {
        const tex = await loader.loadAsync(url);
        if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        resolved.set(key, tex);
        return tex;
      } catch {
        // try the next candidate
      }
    }
    return null;
  })();
  pending.set(key, promise);
  return promise;
}

let hiResAllowed: boolean | null = null;
/** Skip multi-megabyte hi-res maps on touch devices (typically mobile GPUs / metered data). */
export function allowHiRes(): boolean {
  if (hiResAllowed === null) {
    hiResAllowed =
      typeof window !== "undefined" && !window.matchMedia?.("(pointer: coarse)").matches;
  }
  return hiResAllowed;
}

type State = { key: string; tex: THREE.Texture | null; high: boolean };

/**
 * Progressive texture: shows the low-res map as soon as it is available and
 * swaps in the hi-res one once downloaded. Returns null while nothing is ready.
 */
export function useProgressiveTexture(
  source: TextureSource | null | undefined,
  { srgb = true, hiRes = true }: { srgb?: boolean; hiRes?: boolean } = {},
): THREE.Texture | null {
  const low = source ? candidatesFor(source.urlWebP, source.url) : [];
  const high =
    source && hiRes && allowHiRes() ? candidatesFor(source.urlHiResWebP, source.urlHiRes) : [];
  const lowKey = low.length ? cacheKey(low, srgb) : "";
  const highKey = high.length ? cacheKey(high, srgb) : "";
  const sourceKey = `${lowKey}#${highKey}`;

  const cachedHigh = highKey ? resolved.get(highKey) : undefined;
  const cached = cachedHigh ?? (lowKey ? resolved.get(lowKey) : undefined) ?? null;
  const [state, setState] = useState<State>({ key: sourceKey, tex: cached, high: !!cachedHigh });

  useEffect(() => {
    if (!lowKey && !highKey) return;
    let cancelled = false;
    const show = (tex: THREE.Texture | null, isHigh: boolean) => {
      if (cancelled || !tex) return;
      setState((prev) =>
        !isHigh && prev.key === sourceKey && prev.high
          ? prev
          : { key: sourceKey, tex, high: isHigh },
      );
    };
    const loadHigh = () => {
      if (high.length) {
        void loadTexture(high, srgb, { background: low.length > 0 }).then((t) => show(t, true));
      }
    };
    if (low.length) {
      void loadTexture(low, srgb).then((t) => {
        show(t, false);
        loadHigh();
      });
    } else {
      loadHigh();
    }
    return () => {
      cancelled = true;
    };
    // The key strings fully describe low/high/srgb.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey]);

  if (!lowKey && !highKey) return null;
  return state.key === sourceKey && state.tex ? state.tex : cached;
}

/** Loads the first available URL from an ordered candidate list (cached, no progressive step). */
export function useTextureCandidates(candidates: string[], srgb = true): THREE.Texture | null {
  const key = candidates.length ? cacheKey(candidates, srgb) : "";
  const [state, setState] = useState<{ key: string; tex: THREE.Texture | null }>({
    key,
    tex: resolved.get(key) ?? null,
  });
  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    void loadTexture(candidates, srgb).then((tex) => {
      if (!cancelled) setState({ key, tex });
    });
    return () => {
      cancelled = true;
    };
    // `key` encodes candidates and color space.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  if (!key) return null;
  return state.key === key ? state.tex : (resolved.get(key) ?? null);
}
