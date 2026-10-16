/**
 * Planetary Texture Configuration
 *
 * Texture sources:
 * - Local high-resolution textures from Solar System Scope (CC-BY 4.0) and NASA public domain
 * - Low-res (2K) textures load first; the hi-res variant replaces it once downloaded
 * - All textures served locally from /public/assets/textures/ (WebP first, JPG/PNG fallback)
 *
 * Attribution: Solar System Scope (solarsystemscope.com) - CC BY 4.0
 * NASA imagery is public domain.
 */

// Base path for all local textures (relative to /public)
const T = "/assets/textures";

export type TextureLayerType =
  /** Base color map of the visible surface / cloud tops */
  | "diffuse"
  /** Grayscale height map used as a bump map (requires a diffuse surface) */
  | "bump"
  /** Grayscale mask of shiny areas (e.g. oceans) that reflect a sun glint */
  | "specular"
  /** Light emitted on the night side (city lights) */
  | "emissive"
  /** Separate cloud sphere above the surface */
  | "clouds"
  /** Procedural atmospheric limb glow */
  | "atmosphere"
  /** Ring system */
  | "rings";

export interface TextureLayer {
  id: string;
  label: string;
  type: TextureLayerType;
  /** Primary (low-res) texture URL (JPG/PNG). Empty for procedural layers. */
  url: string;
  /** WebP version of the primary texture (loaded first for better compression) */
  urlWebP?: string;
  /** Hi-res texture URL, swapped in after the primary texture is shown */
  urlHiRes?: string;
  /** WebP version of the hi-res texture */
  urlHiResWebP?: string;
  defaultEnabled: boolean;
  /** Default strength (0-1): opacity for overlays, intensity for effects */
  defaultOpacity: number;
  /** Ids of layers that must be enabled for this layer to have any effect */
  requires?: string[];
  /**
   * Clouds only: render the texture as an opaque color map (Venus) instead of
   * using its brightness as transparency (Earth's white-on-black cloud map).
   */
  opaque?: boolean;
  description: string;
  source: string;
  scientificNote: string;
}

export interface PlanetTextureConfig {
  planetId: string;
  layers: TextureLayer[];
  /** Layer whose texture best represents the body as seen from space (thumbnails, mini scenes) */
  appearanceLayerId?: string;
  hasAtmosphere: boolean;
  atmosphereColor: string;
  atmosphereIntensity: number;
  atmosphereThickness: number;
  atmosphereFalloff?: number;
  atmosphereDensity?: number;
  hasRings: boolean;
  /** Radial ring texture (u = inner→outer edge). May contain its own alpha. */
  ringTexture?: string;
  ringTextureWebP?: string;
  /** Procedural ring bands [inner, outer, alpha] in planet radii, used when no texture is set */
  ringBands?: [number, number, number][];
  ringColor?: string;
  /** Ring inner/outer radius in planet radii */
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  ringOpacity?: number;
  baseColor?: string;
  specialFeatures?: string[];
  surfaceRoughness?: number;
  surfaceMetalness?: number;
}

const ATMOSPHERE_SOURCE = "Procedural shader (Fresnel limb glow, sun-weighted)";

// Earth - full multi-layer showcase
const earthLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Surface Imagery",
    type: "diffuse",
    url: `${T}/earth/earth_daymap_2k.jpg`,
    urlWebP: `${T}/earth/earth_daymap_2k.webp`,
    urlHiRes: `${T}/earth/earth_daymap_8k.jpg`,
    urlHiResWebP: `${T}/earth/earth_daymap_8k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description: "Cloud-free satellite imagery of continents, oceans, ice and vegetation.",
    source: "NASA Visible Earth / Blue Marble Next Generation / Solar System Scope",
    scientificNote:
      "Assembled from multiple passes of the Terra and Aqua satellites using MODIS instrument data.",
  },
  {
    id: "relief",
    label: "Terrain Relief",
    type: "bump",
    url: `${T}/earth/earth_topo_4k.jpg`,
    urlWebP: `${T}/earth/earth_topo_4k.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.7,
    requires: ["surface"],
    description:
      "Elevation map that shades mountains and valleys so the terrain looks three-dimensional in sunlight.",
    source: "USGS / NASA SRTM elevation data",
    scientificNote: "Derived from Shuttle Radar Topography Mission data at 30m resolution.",
  },
  {
    id: "glint",
    label: "Ocean Sun Glint",
    type: "specular",
    url: `${T}/earth/earth_ocean_reflectance_4k.jpg`,
    urlWebP: `${T}/earth/earth_ocean_reflectance_4k.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.6,
    requires: ["surface"],
    description:
      "Water mask that makes oceans reflect a bright highlight of the Sun while land stays matte.",
    source: "NASA / NOAA ocean mask data",
    scientificNote:
      "Sun glint is the mirror-like reflection of sunlight off calm water, seen by satellites near the sub-solar point.",
  },
  {
    id: "clouds",
    label: "Clouds",
    type: "clouds",
    url: `${T}/earth/earth_clouds_2k.jpg`,
    urlWebP: `${T}/earth/earth_clouds_2k.webp`,
    urlHiRes: `${T}/earth/earth_clouds_4k.jpg`,
    urlHiResWebP: `${T}/earth/earth_clouds_4k.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.85,
    description:
      "Global cloud coverage composite, rendered on a separate sphere slightly above the surface.",
    source: "NASA Aqua/MODIS daily cloud composites / Solar System Scope",
    scientificNote:
      "Cloud patterns change daily; this is a representative composite. Clouds drift independently of the surface.",
  },
  {
    id: "nightlights",
    label: "City Lights",
    type: "emissive",
    url: `${T}/earth/earth_nightmap_2k.jpg`,
    urlWebP: `${T}/earth/earth_nightmap_2k.webp`,
    urlHiRes: `${T}/earth/earth_night_4k.jpg`,
    urlHiResWebP: `${T}/earth/earth_night_4k.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.7,
    description: "City lights glowing on the night side, revealing human settlement patterns.",
    source: "NASA Earth Observatory / VIIRS instrument on Suomi NPP / Solar System Scope",
    scientificNote:
      "Captured by the Visible Infrared Imaging Radiometer Suite, revealing global patterns of energy use.",
  },
  {
    id: "atmosphere",
    label: "Atmosphere",
    type: "atmosphere",
    url: "",
    defaultEnabled: true,
    defaultOpacity: 0.8,
    description: "Blue halo along the planet's edge caused by sunlight scattering in the air.",
    source: ATMOSPHERE_SOURCE,
    scientificNote:
      "Rayleigh scattering causes shorter blue wavelengths to scatter more, creating the characteristic blue limb.",
  },
];

const marsLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Surface Imagery",
    type: "diffuse",
    url: `${T}/mars/mars_2k.jpg`,
    urlWebP: `${T}/mars/mars_2k.webp`,
    urlHiRes: `${T}/mars/mars_8k.jpg`,
    urlHiResWebP: `${T}/mars/mars_8k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "Mars surface showing iron oxide (rust) terrain, polar ice caps, and major geological features.",
    source: "NASA/JPL Mars Reconnaissance Orbiter, Viking program / Solar System Scope",
    scientificNote: "The red color comes from iron(III) oxide (Fe2O3) dust covering the surface.",
  },
  {
    id: "relief",
    label: "Terrain Relief",
    type: "bump",
    url: `${T}/mars/mars_topo.jpg`,
    urlWebP: `${T}/mars/mars_topo.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.8,
    requires: ["surface"],
    description: "Elevation shading for Olympus Mons, Valles Marineris and the cratered highlands.",
    source: "NASA/MOLA (Mars Orbiter Laser Altimeter)",
    scientificNote:
      "Mars has the tallest volcano (Olympus Mons, 21.9 km) and longest canyon (Valles Marineris, 4000 km) in the solar system.",
  },
  {
    id: "atmosphere",
    label: "Atmospheric Haze",
    type: "atmosphere",
    url: "",
    defaultEnabled: true,
    defaultOpacity: 0.6,
    description: "Thin dusty haze along the limb - Mars has ~1% of Earth's surface pressure.",
    source: ATMOSPHERE_SOURCE,
    scientificNote:
      "Mars's thin CO2 atmosphere creates a subtle pinkish-orange haze from suspended dust particles.",
  },
];

// Venus: opaque clouds on top of a radar-derived surface you can reveal
const venusLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Radar Surface",
    type: "diffuse",
    url: `${T}/venus/venus.jpg`,
    urlWebP: `${T}/venus/venus.webp`,
    urlHiRes: `${T}/venus/venus_surface_8k.jpg`,
    urlHiResWebP: `${T}/venus/venus_surface_8k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "The surface hidden beneath the clouds, mapped by radar. Turn off the clouds to see it.",
    source: "NASA/JPL Magellan radar mapping / Solar System Scope",
    scientificNote:
      "Magellan mapped 98% of the surface with synthetic aperture radar (1990-1994); colors are an artistic rendition.",
  },
  {
    id: "relief",
    label: "Terrain Relief",
    type: "bump",
    url: `${T}/venus/venus_topo.jpg`,
    urlWebP: `${T}/venus/venus_topo.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.7,
    requires: ["surface"],
    description: "Radar altimetry shading of volcanoes, highlands and plains.",
    source: "NASA/JPL Magellan radar altimeter",
    scientificNote: "Maxwell Montes, Venus's highest mountain, rises about 11 km above the mean.",
  },
  {
    id: "clouds",
    label: "Cloud Deck",
    type: "clouds",
    url: `${T}/venus/venus_atmosphere_4k.jpg`,
    urlWebP: `${T}/venus/venus_atmosphere_4k.webp`,
    opaque: true,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "What we actually see from space - a thick sulfuric acid cloud deck hiding the surface.",
    source: "NASA/Mariner 10, Pioneer Venus, Akatsuki / Solar System Scope",
    scientificNote:
      "Venus's clouds are 75-96% sulfuric acid, reflecting ~75% of sunlight (highest albedo of any planet).",
  },
  {
    id: "atmosphere",
    label: "Atmosphere",
    type: "atmosphere",
    url: "",
    defaultEnabled: true,
    defaultOpacity: 0.8,
    description: "Extremely thick atmosphere - surface pressure is 92x Earth's.",
    source: ATMOSPHERE_SOURCE,
    scientificNote:
      "Venus has the densest atmosphere of any terrestrial planet, creating a runaway greenhouse effect.",
  },
];

const mercuryLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Surface Imagery",
    type: "diffuse",
    url: `${T}/mercury/mercury_2k.jpg`,
    urlWebP: `${T}/mercury/mercury_2k.webp`,
    urlHiRes: `${T}/mercury/mercury_8k.jpg`,
    urlHiResWebP: `${T}/mercury/mercury_8k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description: "Heavily cratered surface resembling Earth's Moon.",
    source: "NASA/MESSENGER mission / Solar System Scope",
    scientificNote:
      "MESSENGER mapped 100% of Mercury's surface, revealing a world shaped by ancient impacts and volcanism.",
  },
  {
    id: "relief",
    label: "Terrain Relief",
    type: "bump",
    url: `${T}/mercury/mercury_topo.jpg`,
    urlWebP: `${T}/mercury/mercury_topo.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.6,
    requires: ["surface"],
    description: "Elevation shading of crater rims, basins and scarps.",
    source: "NASA/MESSENGER laser altimeter",
    scientificNote: "Mercury's largest impact basin, Caloris, is 1,550 km in diameter.",
  },
];

function gasGiantLayers(opts: {
  planet: string;
  label: string;
  hiRes?: boolean;
  description: string;
  source: string;
  scientificNote: string;
  atmosphere: { opacity: number; description: string; scientificNote: string };
  rings?: { opacity: number; enabled?: boolean; description: string; scientificNote: string };
}): TextureLayer[] {
  const { planet } = opts;
  const layers: TextureLayer[] = [
    {
      id: "surface",
      label: opts.label,
      type: "diffuse",
      url: `${T}/${planet}/${planet}_2k.jpg`,
      urlWebP: `${T}/${planet}/${planet}_2k.webp`,
      ...(opts.hiRes
        ? {
            urlHiRes: `${T}/${planet}/${planet}_8k.jpg`,
            urlHiResWebP: `${T}/${planet}/${planet}_8k.webp`,
          }
        : {}),
      defaultEnabled: true,
      defaultOpacity: 1.0,
      description: opts.description,
      source: opts.source,
      scientificNote: opts.scientificNote,
    },
    {
      id: "atmosphere",
      label: "Atmospheric Glow",
      type: "atmosphere",
      url: "",
      defaultEnabled: true,
      defaultOpacity: opts.atmosphere.opacity,
      description: opts.atmosphere.description,
      source: ATMOSPHERE_SOURCE,
      scientificNote: opts.atmosphere.scientificNote,
    },
  ];
  if (opts.rings) {
    layers.push({
      id: "rings",
      label: "Rings",
      type: "rings",
      url: "",
      defaultEnabled: opts.rings.enabled ?? true,
      defaultOpacity: opts.rings.opacity,
      description: opts.rings.description,
      source: "NASA/JPL ring radii; Solar System Scope ring texture (Saturn)",
      scientificNote: opts.rings.scientificNote,
    });
  }
  return layers;
}

const jupiterLayers = gasGiantLayers({
  planet: "jupiter",
  label: "Cloud Bands",
  hiRes: true,
  description:
    "Alternating cloud belts and zones at different atmospheric heights, including the Great Red Spot.",
  source: "NASA/JPL Juno, Cassini, Voyager missions / Solar System Scope",
  scientificNote:
    "Jupiter's bands are alternating zones (light, high-pressure) and belts (dark, low-pressure) of ammonia clouds.",
  atmosphere: {
    opacity: 0.4,
    description: "Subtle haze along the limb.",
    scientificNote:
      "Jupiter has no solid surface - it transitions gradually from gaseous atmosphere to liquid metallic hydrogen.",
  },
  rings: {
    opacity: 0.35,
    // Too faint to see in ordinary images; off by default, available to explore.
    enabled: false,
    description: "Faint dusty rings: the halo and the narrow main ring.",
    scientificNote:
      "Jupiter's rings were discovered by Voyager 1 in 1979; they are made of dust knocked off small inner moons.",
  },
});

const saturnLayers = gasGiantLayers({
  planet: "saturn",
  label: "Cloud Bands",
  hiRes: true,
  description: "Banded cloud patterns similar to Jupiter but more muted in color.",
  source: "NASA/JPL Cassini-Huygens mission / Solar System Scope",
  scientificNote:
    "Saturn's cloud bands are less vivid than Jupiter's due to a thicker high-altitude ammonia crystal haze.",
  atmosphere: {
    opacity: 0.3,
    description: "Subtle atmospheric haze.",
    scientificNote: "Saturn is the least dense planet - it could theoretically float in water.",
  },
  rings: {
    opacity: 1.0,
    description: "The C, B and A rings with the Cassini Division, at their true relative radii.",
    scientificNote:
      "The main rings span ~280,000 km yet are mostly only about 10 m thick, made of water-ice particles.",
  },
});

const uranusLayers = gasGiantLayers({
  planet: "uranus",
  label: "Cloud Tops",
  description: "Nearly featureless blue-green haze from methane absorption.",
  source: "NASA/JPL Voyager 2 / Solar System Scope",
  scientificNote:
    "Methane in Uranus's atmosphere absorbs red wavelengths, giving it a blue-green color.",
  atmosphere: {
    opacity: 0.5,
    description: "Ice giant atmosphere with methane haze.",
    scientificNote:
      "Uranus rotates on its side (97.8 degree tilt), likely from an ancient collision.",
  },
  rings: {
    opacity: 0.6,
    // Too faint to see in ordinary images; off by default, available to explore.
    enabled: false,
    description: "Thin, dark, narrow rings - the epsilon ring is the brightest.",
    scientificNote:
      "Uranus's rings were discovered in 1977 by watching a star blink as it passed behind them.",
  },
});

const neptuneLayers = gasGiantLayers({
  planet: "neptune",
  label: "Cloud Tops",
  description: "Deep blue atmosphere with dynamic storm systems and cloud features.",
  source: "NASA/JPL Voyager 2 / Solar System Scope",
  scientificNote:
    "Neptune's vivid blue color is from methane, but an unknown compound contributes to its deeper blue vs Uranus.",
  atmosphere: {
    opacity: 0.5,
    description: "Dynamic atmosphere with the fastest winds in the solar system.",
    scientificNote:
      "Winds on Neptune reach 2,100 km/h - the fastest of any planet in the solar system.",
  },
  rings: {
    opacity: 0.5,
    // Too faint to see in ordinary images; off by default, available to explore.
    enabled: false,
    description: "Faint, narrow dusty rings: Galle, Le Verrier and Adams.",
    scientificNote:
      "The Adams ring contains bright clumpy 'arcs' named Liberté, Égalité and Fraternité.",
  },
});

const moonLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Surface Imagery",
    type: "diffuse",
    url: `${T}/moon/moon_2k.jpg`,
    urlWebP: `${T}/moon/moon_2k.webp`,
    urlHiRes: `${T}/moon/moon_8k.jpg`,
    urlHiResWebP: `${T}/moon/moon_8k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description: "Lunar surface showing maria (dark basaltic plains) and highland terrain.",
    source: "NASA/LRO (Lunar Reconnaissance Orbiter) / Solar System Scope",
    scientificNote:
      "The dark maria were formed by ancient volcanic eruptions 3-3.5 billion years ago.",
  },
  {
    id: "relief",
    label: "Terrain Relief",
    type: "bump",
    url: `${T}/moon/moon_topo_4k.jpg`,
    urlWebP: `${T}/moon/moon_topo_4k.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.6,
    requires: ["surface"],
    description: "Elevation shading of crater rims and highlands.",
    source: "NASA/LRO laser altimeter (LOLA)",
    scientificNote:
      "The deepest lunar crater (South Pole-Aitken basin) is about 8.2 km deep and 2,500 km in diameter.",
  },
];

const plutoLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Surface Imagery",
    type: "diffuse",
    url: `${T}/pluto/pluto_2k.jpg`,
    urlWebP: `${T}/pluto/pluto_2k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "Pluto's surface showing Tombaugh Regio (the heart-shaped glacier) and varied terrain.",
    source: "NASA/New Horizons",
    scientificNote:
      "New Horizons revealed Pluto's surprising geological complexity during its 2015 flyby.",
  },
  {
    id: "relief",
    label: "Terrain Relief",
    type: "bump",
    url: `${T}/pluto/pluto_topo_2k.jpg`,
    urlWebP: `${T}/pluto/pluto_topo_2k.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.6,
    requires: ["surface"],
    description: "Elevation shading of nitrogen ice plains and water-ice mountains.",
    source: "NASA/New Horizons stereo imagery",
    scientificNote:
      "Pluto has mountains up to 3,500 meters tall, made of water ice that is rock-hard at -230 degrees C.",
  },
];

const sunLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Photosphere",
    type: "diffuse",
    url: `${T}/sun/sun_2k.jpg`,
    urlWebP: `${T}/sun/sun_2k.webp`,
    urlHiRes: `${T}/sun/sun_8k.jpg`,
    urlHiResWebP: `${T}/sun/sun_8k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description: "The Sun's photosphere showing sunspot activity and granulation.",
    source: "NASA/SDO (Solar Dynamics Observatory) / Solar System Scope",
    scientificNote:
      "The photosphere is ~5,500 degrees C; sunspots are cooler regions (~3,500 degrees C) caused by magnetic activity.",
  },
];

export const textureConfigs: Record<string, PlanetTextureConfig> = {
  sun: {
    planetId: "sun",
    layers: sunLayers,
    hasAtmosphere: false,
    atmosphereColor: "#ff8c00",
    atmosphereIntensity: 0,
    atmosphereThickness: 0,
    hasRings: false,
    baseColor: "#ffaa00",
  },
  mercury: {
    planetId: "mercury",
    layers: mercuryLayers,
    hasAtmosphere: false,
    atmosphereColor: "#000000",
    atmosphereIntensity: 0,
    atmosphereThickness: 0,
    hasRings: false,
    baseColor: "#8c7853",
    surfaceRoughness: 0.9,
    surfaceMetalness: 0.05,
  },
  venus: {
    planetId: "venus",
    layers: venusLayers,
    appearanceLayerId: "clouds",
    hasAtmosphere: true,
    atmosphereColor: "#e6c87a",
    atmosphereIntensity: 0.6,
    atmosphereThickness: 0.08,
    atmosphereFalloff: 2.5,
    atmosphereDensity: 0.8,
    hasRings: false,
    baseColor: "#c4a35a",
    specialFeatures: ["cloud-penetration-toggle"],
    surfaceRoughness: 0.5,
    surfaceMetalness: 0.02,
  },
  earth: {
    planetId: "earth",
    layers: earthLayers,
    hasAtmosphere: true,
    atmosphereColor: "#6ba4ff",
    atmosphereIntensity: 0.8,
    atmosphereThickness: 0.05,
    atmosphereFalloff: 3.0,
    atmosphereDensity: 0.6,
    hasRings: false,
    baseColor: "#1a4d2e",
    specialFeatures: ["multi-layer", "cloud-rotation", "night-lights", "day-night-cycle"],
    surfaceRoughness: 0.7,
    surfaceMetalness: 0.05,
  },
  mars: {
    planetId: "mars",
    layers: marsLayers,
    hasAtmosphere: true,
    atmosphereColor: "#d4875e",
    atmosphereIntensity: 0.3,
    atmosphereThickness: 0.03,
    atmosphereFalloff: 4.0,
    atmosphereDensity: 0.3,
    hasRings: false,
    baseColor: "#c1440e",
    specialFeatures: ["dust-storms"],
    surfaceRoughness: 0.85,
    surfaceMetalness: 0.03,
  },
  jupiter: {
    planetId: "jupiter",
    layers: jupiterLayers,
    hasAtmosphere: true,
    atmosphereColor: "#c8a060",
    atmosphereIntensity: 0.3,
    atmosphereThickness: 0.04,
    atmosphereFalloff: 2.0,
    atmosphereDensity: 0.7,
    hasRings: true,
    // Halo ring 1.29-1.72 Rj, main ring 1.72-1.81 Rj
    ringBands: [
      [1.29, 1.72, 0.12],
      [1.72, 1.81, 0.6],
    ],
    ringColor: "#8b7355",
    ringInnerRadius: 1.29,
    ringOuterRadius: 1.81,
    ringOpacity: 0.35,
    baseColor: "#c9b896",
    surfaceRoughness: 0.95,
    surfaceMetalness: 0.01,
  },
  saturn: {
    planetId: "saturn",
    layers: saturnLayers,
    hasAtmosphere: true,
    atmosphereColor: "#e8d5a3",
    atmosphereIntensity: 0.3,
    atmosphereThickness: 0.04,
    atmosphereFalloff: 2.5,
    atmosphereDensity: 0.5,
    hasRings: true,
    // RGBA texture spanning the D ring inner edge to just past the A ring.
    ringTexture: `${T}/saturn/rings/saturn_ring_alpha_8k.png`,
    ringTextureWebP: `${T}/saturn/rings/saturn_ring_alpha_8k.webp`,
    ringColor: "#ffffff",
    ringInnerRadius: 1.11,
    ringOuterRadius: 2.33,
    ringOpacity: 1.0,
    baseColor: "#d4b483",
    surfaceRoughness: 0.95,
    surfaceMetalness: 0.01,
  },
  uranus: {
    planetId: "uranus",
    layers: uranusLayers,
    hasAtmosphere: true,
    atmosphereColor: "#7ec8c8",
    atmosphereIntensity: 0.4,
    atmosphereThickness: 0.04,
    atmosphereFalloff: 3.0,
    atmosphereDensity: 0.4,
    hasRings: true,
    // Rings 6/5/4, alpha, beta, eta, gamma, delta, epsilon (Ru = 25,559 km)
    ringBands: [
      [1.637, 1.642, 0.5],
      [1.652, 1.657, 0.5],
      [1.666, 1.671, 0.5],
      [1.75, 1.757, 0.6],
      [1.786, 1.793, 0.6],
      [1.845, 1.849, 0.4],
      [1.861, 1.865, 0.6],
      [1.909, 1.914, 0.6],
      [1.993, 2.008, 1.0],
    ],
    ringColor: "#8d949a",
    ringInnerRadius: 1.6,
    ringOuterRadius: 2.02,
    ringOpacity: 0.6,
    baseColor: "#7ec8c8",
    surfaceRoughness: 0.6,
    surfaceMetalness: 0.02,
  },
  neptune: {
    planetId: "neptune",
    layers: neptuneLayers,
    hasAtmosphere: true,
    atmosphereColor: "#3f54ba",
    atmosphereIntensity: 0.4,
    atmosphereThickness: 0.04,
    atmosphereFalloff: 2.5,
    atmosphereDensity: 0.6,
    hasRings: true,
    // Galle, Le Verrier, Lassell (faint sheet), Adams (Rn = 24,764 km)
    ringBands: [
      [1.67, 1.71, 0.35],
      [2.145, 2.15, 0.8],
      [2.15, 2.31, 0.12],
      [2.538, 2.545, 0.9],
    ],
    ringColor: "#9aa4b8",
    ringInnerRadius: 1.65,
    ringOuterRadius: 2.56,
    ringOpacity: 0.5,
    baseColor: "#3f54ba",
    surfaceRoughness: 0.6,
    surfaceMetalness: 0.02,
  },
  pluto: {
    planetId: "pluto",
    layers: plutoLayers,
    hasAtmosphere: false,
    atmosphereColor: "#c4a882",
    atmosphereIntensity: 0.1,
    atmosphereThickness: 0.02,
    hasRings: false,
    baseColor: "#c4a882",
    surfaceRoughness: 0.9,
    surfaceMetalness: 0.02,
  },
  moon: {
    planetId: "moon",
    layers: moonLayers,
    hasAtmosphere: false,
    atmosphereColor: "#000000",
    atmosphereIntensity: 0,
    atmosphereThickness: 0,
    hasRings: false,
    baseColor: "#888888",
    surfaceRoughness: 0.95,
    surfaceMetalness: 0.02,
  },
};

export function getTextureConfig(planetId: string): PlanetTextureConfig | null {
  return textureConfigs[planetId] || null;
}

/** The layer whose texture shows the body as it looks from space (used for thumbnails/mini scenes). */
export function getAppearanceLayer(planetId: string): TextureLayer | undefined {
  const cfg = textureConfigs[planetId];
  if (!cfg) return undefined;
  const id = cfg.appearanceLayerId ?? "surface";
  return cfg.layers.find((l) => l.id === id) ?? cfg.layers.find((l) => l.type === "diffuse");
}

/** Base-resolution URL for a layer, preferring the (much smaller) WebP version. */
export function preferredLayerUrl(layer: TextureLayer | undefined | null): string | null {
  return layer?.urlWebP || layer?.url || null;
}

/** Base-resolution appearance map used for overview scenes and thumbnails. */
export function getOverviewTextureUrl(planetId: string): string | null {
  return preferredLayerUrl(getAppearanceLayer(planetId));
}

export function getRingTextureUrl(planetId: string): string | null {
  const cfg = textureConfigs[planetId];
  return cfg?.ringTextureWebP || cfg?.ringTexture || null;
}
