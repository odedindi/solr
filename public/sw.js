// Service worker: persistent, offline-capable cache for planet textures.
// Strategy: stale-while-revalidate — serve from cache instantly, refresh in the background.
// Bump CACHE_VERSION to drop all previously cached textures.
const CACHE_VERSION = "v1";
const CACHE_PREFIX = "solr-textures-";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const TEXTURE_PATH = "/assets/textures/";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(TEXTURE_PATH)) return;

  event.respondWith(staleWhileRevalidate(event, request));
});

async function staleWhileRevalidate(event, request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreVary: true });

  const network = fetch(request).then(async (response) => {
    if (response.ok && response.status === 200) {
      // Quota errors are non-fatal: the texture still renders, it just isn't persisted.
      await cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  });

  if (cached) {
    event.waitUntil(network.catch(() => {}));
    return cached;
  }
  return network;
}
