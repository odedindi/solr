import { useProgress, useTexture } from "@react-three/drei";

/**
 * Preload textures so they are tracked by the loading screen.
 *
 * drei's `useProgress` store attaches its handlers to THREE.DefaultLoadingManager when it is
 * first created; touching it here guarantees that happens before any preload starts.
 */
export function preloadTextures(urls: Array<string | null | undefined>) {
  useProgress.getState();
  for (const url of urls) {
    if (url) useTexture.preload(url);
  }
}
