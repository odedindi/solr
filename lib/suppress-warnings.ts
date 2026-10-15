// Suppress known deprecation warnings and network errors from third-party libraries.
// In development, keep all errors visible for debugging. In production, suppress
// 404s from missing textures (satellite fallback chain attempts multiple paths).
if (typeof window !== "undefined") {
  const isDev = process.env.NODE_ENV === "development";

  // Suppress THREE.Clock deprecation warnings in all environments
  const origWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) return;
    origWarn.apply(console, args);
  };

  // In production, suppress 404 network errors from texture loading fallback chain
  if (!isDev) {
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === "string" ? args[0] : "";
      if (msg.includes("404") || msg.includes("Failed to load resource")) return;
      origError.apply(console, args);
    };
  }
}
