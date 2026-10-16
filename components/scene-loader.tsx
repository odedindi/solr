"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { cn } from "@/lib/utils";

const SETTLE_DELAY_MS = 350;
const MAX_BLOCKING_MS = 20_000;
const FADE_MS = 500;

/**
 * Progress UI for texture loading, driven by THREE.DefaultLoadingManager.
 *
 * Shows a blocking overlay for the first load of the scene, then only a small
 * indicator for later loads (e.g. toggling layers). Must be rendered outside the <Canvas>.
 */
export function SceneLoader({
  variant = "overlay",
  className,
}: {
  /** "overlay" covers the scene on first load; "inline" never blocks the view. */
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const { active, progress, loaded, total } = useProgress();
  const [initialDone, setInitialDone] = useState(false);

  useEffect(() => {
    if (initialDone || active) return;
    const t = setTimeout(() => setInitialDone(true), SETTLE_DELAY_MS);
    return () => clearTimeout(t);
  }, [active, initialDone]);

  useEffect(() => {
    const t = setTimeout(() => setInitialDone(true), MAX_BLOCKING_MS);
    return () => clearTimeout(t);
  }, []);

  const pct = Math.round(progress);
  const blocking = variant === "overlay" && !initialDone;
  const showIndicator = !blocking && active;
  const [overlayMounted, setOverlayMounted] = useState(variant === "overlay");
  // The server-rendered button would ignore clicks until hydration; only show it once it works.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (blocking || !overlayMounted) return;
    const t = setTimeout(() => setOverlayMounted(false), FADE_MS);
    return () => clearTimeout(t);
  }, [blocking, overlayMounted]);

  return (
    <>
      {overlayMounted && (
        <div
          role="status"
          aria-live="polite"
          aria-hidden={!blocking}
          className={cn(
            "absolute inset-0 z-30 flex items-center justify-center bg-background/90 backdrop-blur-sm transition-opacity duration-500",
            blocking ? "opacity-100" : "pointer-events-none opacity-0",
            className,
          )}
        >
          <div className="flex w-64 flex-col items-center gap-3 text-center">
            <p className="font-sans text-sm font-medium text-foreground">
              Loading the solar system…
            </p>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-label="Texture loading progress"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {loaded > 0 ? `${loaded} / ${total} textures · ${pct}%` : "Fetching textures…"}
            </p>
            {blocking && hydrated && (
              <button
                type="button"
                onClick={() => setInitialDone(true)}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Skip and continue loading in the background
              </button>
            )}
          </div>
        </div>
      )}

      {showIndicator && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "pointer-events-none absolute bottom-16 left-4 z-20 flex items-center gap-2 rounded-full border border-border/30 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm",
            variant === "overlay" ? "" : className,
          )}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Loading textures · {pct}%
        </div>
      )}
    </>
  );
}
