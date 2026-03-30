// Suppress known deprecation warnings from third-party libraries (R3F internals)
if (typeof window !== "undefined") {
  const origWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) return;
    origWarn.apply(console, args);
  };
}
