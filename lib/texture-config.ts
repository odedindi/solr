/**
 * Planetary Texture Configuration
 *
 * Texture sources:
 * - Local high-resolution textures from Solar System Scope (CC-BY 4.0) and NASA public domain
 * - 8K resolution where available, with 2K/4K fallbacks for performance
 * - All textures served locally from /public/assets/textures/
 *
 * Attribution: Solar System Scope (solarsystemscope.com) - CC BY 4.0
 * NASA imagery is public domain.
 */

// Base path for all local textures (relative to /public)
const T = "/assets/textures";

export interface TextureLayer {
  id: string;
  label: string;
  type:
    | "diffuse"
    | "normal"
    | "specular"
    | "bump"
    | "emissive"
    | "clouds"
    | "atmosphere"
    | "overlay"
    | "surface-alt";
  /** Primary texture URL (JPG/PNG) */
  url: string;
  /** WebP version of the primary texture (loaded first for better compression) */
  urlWebP?: string;
  /** Hi-res texture URL */
  urlHiRes?: string;
  /** WebP version of the hi-res texture */
  urlHiResWebP?: string;
  defaultEnabled: boolean;
  defaultOpacity: number;
  description: string;
  source: string;
  scientificNote: string;
}

export interface PlanetTextureConfig {
  planetId: string;
  layers: TextureLayer[];
  hasAtmosphere: boolean;
  atmosphereColor: string;
  atmosphereIntensity: number;
  atmosphereThickness: number;
  atmosphereFalloff?: number;
  atmosphereDensity?: number;
  hasRings: boolean;
  ringTexture?: string;
  ringTextureWebP?: string;
  ringAlphaTexture?: string;
  ringAlphaTextureWebP?: string;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  ringOpacity?: number;
  baseColor?: string;
  specialFeatures?: string[];
  surfaceRoughness?: number;
  surfaceMetalness?: number;
}

// Earth - full multi-layer showcase with best available textures
const earthLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Surface Texture",
    type: "diffuse",
    url: `${T}/earth/earth_daymap_2k.jpg`,
    urlWebP: `${T}/earth/earth_daymap_2k.webp`,
    urlHiRes: `${T}/earth/earth_daymap_8k.jpg`,
    urlHiResWebP: `${T}/earth/earth_daymap_8k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "Composite satellite imagery showing continents, oceans, and vegetation patterns.",
    source:
      "NASA Visible Earth / Blue Marble Next Generation / Solar System Scope",
    scientificNote:
      "Assembled from multiple passes of the Terra and Aqua satellites using MODIS instrument data.",
  },
  {
    id: "normal",
    label: "Surface Relief",
    type: "normal",
    url: `${T}/earth/earth_topo_4k.jpg`,
    urlWebP: `${T}/earth/earth_topo_4k.webp`,
    urlHiRes: `${T}/earth/earth_topo_10k.jpg`,
    urlHiResWebP: `${T}/earth/earth_topo_10k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "Normal map creating the illusion of surface elevation - mountains, valleys, and ocean floor topography.",
    source: "USGS / NASA SRTM elevation data",
    scientificNote:
      "Derived from Shuttle Radar Topography Mission data at 30m resolution.",
  },
  {
    id: "specular",
    label: "Ocean Specular",
    type: "specular",
    url: `${T}/earth/earth_ocean_reflectance_4k.jpg`,
    urlWebP: `${T}/earth/earth_ocean_reflectance_4k.webp`,
    urlHiRes: `${T}/earth/earth_ocean_reflectance_10k.jpg`,
    urlHiResWebP: `${T}/earth/earth_ocean_reflectance_10k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "Controls reflectivity - oceans appear shiny while land remains matte.",
    source: "NASA / NOAA ocean mask data",
    scientificNote:
      "Defines the Fresnel reflection coefficient for realistic water surfaces.",
  },
  {
    id: "clouds",
    label: "Cloud Layer",
    type: "clouds",
    url: `${T}/earth/earth_clouds_2k.jpg`,
    urlWebP: `${T}/earth/earth_clouds_2k.webp`,
    urlHiRes: `${T}/earth/earth_clouds_8k.jpg`,
    urlHiResWebP: `${T}/earth/earth_clouds_8k.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.8,
    description:
      "Global cloud coverage composite, rendered on a separate sphere slightly larger than the surface.",
    source: "NASA Aqua/MODIS daily cloud composites / Solar System Scope",
    scientificNote:
      "Cloud patterns change daily; this is a representative composite. Clouds rotate independently.",
  },
  {
    id: "nightlights",
    label: "City Lights",
    type: "emissive",
    url: `${T}/earth/earth_nightmap_2k.jpg`,
    urlWebP: `${T}/earth/earth_nightmap_2k.webp`,
    urlHiRes: `${T}/earth/earth_nightmap_8k.jpg`,
    urlHiResWebP: `${T}/earth/earth_nightmap_8k.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.6,
    description:
      "City lights visible on Earth's night side - emissive map showing human settlement patterns.",
    source:
      "NASA Earth Observatory / VIIRS instrument on Suomi NPP / Solar System Scope",
    scientificNote:
      "Captured by the Visible Infrared Imaging Radiometer Suite, revealing global patterns of energy use.",
  },
  {
    id: "atmosphere",
    label: "Atmosphere",
    type: "atmosphere",
    url: "",
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "Volumetric atmospheric glow simulating Rayleigh scattering - the blue halo visible from space.",
    source: "Procedural shader (physically-based Rayleigh model)",
    scientificNote:
      "Rayleigh scattering causes shorter blue wavelengths to scatter more, creating the characteristic blue limb.",
  },
];

// Mars layers
const marsLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Surface Texture",
    type: "diffuse",
    url: `${T}/mars/mars_2k.jpg`,
    urlWebP: `${T}/mars/mars_2k.webp`,
    urlHiRes: `${T}/mars/mars_8k.jpg`,
    urlHiResWebP: `${T}/mars/mars_8k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "Mars surface showing iron oxide (rust) terrain, polar ice caps, and major geological features.",
    source:
      "NASA/JPL Mars Reconnaissance Orbiter, Viking program / Solar System Scope",
    scientificNote:
      "The red color comes from iron(III) oxide (Fe2O3) dust covering the surface.",
  },
  {
    id: "bump",
    label: "Surface Topography",
    type: "bump",
    url: `${T}/mars/mars_topo.jpg`,
    urlWebP: `${T}/mars/mars_topo.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.8,
    description:
      "Topographic map showing Olympus Mons, Valles Marineris, and other major surface features.",
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
    description:
      "Thin atmospheric haze - Mars has ~1% of Earth's atmospheric pressure.",
    source: "Procedural shader",
    scientificNote:
      "Mars's thin CO2 atmosphere creates a subtle pinkish-orange haze from suspended dust particles.",
  },
];

// Venus layers
const venusLayers: TextureLayer[] = [
  {
    id: "clouds",
    label: "Cloud Layer (Visible)",
    type: "diffuse",
    url: `${T}/venus/venus_atmosphere_4k.jpg`,
    urlWebP: `${T}/venus/venus_atmosphere_4k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "What we see from space - thick sulfuric acid cloud layer completely obscuring the surface.",
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
    description:
      "Extremely thick atmosphere - surface pressure is 92x Earth's.",
    source: "Procedural shader",
    scientificNote:
      "Venus has the densest atmosphere of any terrestrial planet, creating a runaway greenhouse effect.",
  },
];

// Mercury layers
const mercuryLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Surface Texture",
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
    id: "bump",
    label: "Surface Topography",
    type: "bump",
    url: `${T}/mercury/mercury_topo.jpg`,
    urlWebP: `${T}/mercury/mercury_topo.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.6,
    description:
      "Topographic relief showing crater depths and highland elevations.",
    source: "NASA/MESSENGER laser altimeter",
    scientificNote:
      "Mercury's largest impact basin, Caloris, is 1,550 km in diameter.",
  },
];

// Jupiter layers
const jupiterLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Cloud Bands",
    type: "diffuse",
    url: `${T}/jupiter/jupiter_2k.jpg`,
    urlWebP: `${T}/jupiter/jupiter_2k.webp`,
    urlHiRes: `${T}/jupiter/jupiter_8k.jpg`,
    urlHiResWebP: `${T}/jupiter/jupiter_8k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "Multiple cloud band layers at different atmospheric heights, including the Great Red Spot.",
    source: "NASA/JPL Juno, Cassini, Voyager missions / Solar System Scope",
    scientificNote:
      "Jupiter's bands are alternating zones (light, high-pressure) and belts (dark, low-pressure) of ammonia clouds.",
  },
  {
    id: "atmosphere",
    label: "Atmospheric Glow",
    type: "atmosphere",
    url: "",
    defaultEnabled: true,
    defaultOpacity: 0.4,
    description: "Subtle atmospheric limb darkening and glow.",
    source: "Procedural shader",
    scientificNote:
      "Jupiter has no solid surface - it transitions gradually from gaseous atmosphere to liquid metallic hydrogen.",
  },
];

// Saturn layers
const saturnLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Cloud Bands",
    type: "diffuse",
    url: `${T}/saturn/saturn_2k_sss.jpg`,
    urlWebP: `${T}/saturn/saturn_2k_sss.webp`,
    urlHiRes: `${T}/saturn/saturn_8k.jpg`,
    urlHiResWebP: `${T}/saturn/saturn_8k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "Banded cloud patterns similar to Jupiter but more muted in color.",
    source: "NASA/JPL Cassini-Huygens mission / Solar System Scope",
    scientificNote:
      "Saturn's cloud bands are less vivid than Jupiter's due to a thicker high-altitude ammonia crystal haze.",
  },
  {
    id: "atmosphere",
    label: "Atmospheric Glow",
    type: "atmosphere",
    url: "",
    defaultEnabled: true,
    defaultOpacity: 0.3,
    description: "Subtle atmospheric haze.",
    source: "Procedural shader",
    scientificNote:
      "Saturn is the least dense planet - it could theoretically float in water.",
  },
];

// Uranus layers
const uranusLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Cloud Layer",
    type: "diffuse",
    url: `${T}/uranus/uranus_2k.jpg`,
    urlWebP: `${T}/uranus/uranus_2k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "Featureless blue-green appearance from methane absorption in the upper atmosphere.",
    source: "NASA/JPL Voyager 2 / Solar System Scope",
    scientificNote:
      "Methane in Uranus's atmosphere absorbs red wavelengths, giving it a blue-green color.",
  },
  {
    id: "atmosphere",
    label: "Atmosphere",
    type: "atmosphere",
    url: "",
    defaultEnabled: true,
    defaultOpacity: 0.5,
    description: "Ice giant atmosphere with methane haze.",
    source: "Procedural shader",
    scientificNote:
      "Uranus rotates on its side (97.8 degree tilt), likely from an ancient collision.",
  },
];

// Neptune layers
const neptuneLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Cloud Layer",
    type: "diffuse",
    url: `${T}/neptune/neptune_2k.jpg`,
    urlWebP: `${T}/neptune/neptune_2k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "Deep blue atmosphere with dynamic storm systems and cloud features.",
    source: "NASA/JPL Voyager 2 / Solar System Scope",
    scientificNote:
      "Neptune's vivid blue color is from methane, but an unknown compound contributes to its deeper blue vs Uranus.",
  },
  {
    id: "atmosphere",
    label: "Atmosphere",
    type: "atmosphere",
    url: "",
    defaultEnabled: true,
    defaultOpacity: 0.5,
    description:
      "Dynamic atmosphere with the fastest winds in the solar system.",
    source: "Procedural shader",
    scientificNote:
      "Winds on Neptune reach 2,100 km/h - the fastest of any planet in the solar system.",
  },
];

// Moon (for Earth's moon detail)
const moonLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Surface Texture",
    type: "diffuse",
    url: `${T}/moon/moon_2k.jpg`,
    urlWebP: `${T}/moon/moon_2k.webp`,
    urlHiRes: `${T}/moon/moon_8k.jpg`,
    urlHiResWebP: `${T}/moon/moon_8k.webp`,
    defaultEnabled: true,
    defaultOpacity: 1.0,
    description:
      "Lunar surface showing maria (dark basaltic plains) and highland terrain.",
    source: "NASA/LRO (Lunar Reconnaissance Orbiter) / Solar System Scope",
    scientificNote:
      "The dark maria were formed by ancient volcanic eruptions 3-3.5 billion years ago.",
  },
  {
    id: "bump",
    label: "Surface Topography",
    type: "bump",
    url: `${T}/moon/moon_topo_4k.jpg`,
    urlWebP: `${T}/moon/moon_topo_4k.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.6,
    description:
      "Topographic map showing crater depths and highland elevations on the lunar surface.",
    source: "NASA/LRO laser altimeter (LOLA)",
    scientificNote:
      "The deepest lunar crater (South Pole-Aitken basin) is about 8.2 km deep and 2,500 km in diameter.",
  },
];

// Pluto
const plutoLayers: TextureLayer[] = [
  {
    id: "surface",
    label: "Surface Texture",
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
    id: "bump",
    label: "Surface Topography",
    type: "bump",
    url: `${T}/pluto/pluto_topo_2k.jpg`,
    urlWebP: `${T}/pluto/pluto_topo_2k.webp`,
    defaultEnabled: true,
    defaultOpacity: 0.6,
    description:
      "Topographic relief showing nitrogen ice plains and mountainous regions.",
    source: "NASA/New Horizons stereo imagery",
    scientificNote:
      "Pluto has mountains up to 3,500 meters tall, made of water ice that is rock-hard at -230 degrees C.",
  },
];

// Sun texture
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
    description:
      "The Sun's photosphere showing sunspot activity and granulation.",
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
    specialFeatures: [
      "multi-layer",
      "cloud-rotation",
      "night-lights",
      "day-night-cycle",
    ],
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
    ringTexture: `${T}/jupiter/rings/rings_color_map.png`,
    ringTextureWebP: `${T}/jupiter/rings/rings_color_map.webp`,
    ringInnerRadius: 1.05,
    ringOuterRadius: 1.15,
    ringOpacity: 0.1,
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
    ringTexture: `${T}/saturn/rings/saturn_rings_color_map.png`,
    ringTextureWebP: `${T}/saturn/rings/saturn_rings_color_map.webp`,
    ringAlphaTexture: `${T}/saturn/rings/saturn_ring_alpha_8k.png`,
    ringAlphaTextureWebP: `${T}/saturn/rings/saturn_ring_alpha_8k.webp`,
    ringInnerRadius: 1.3,
    ringOuterRadius: 2.3,
    ringOpacity: 0.7,
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
    ringInnerRadius: 1.5,
    ringOuterRadius: 1.8,
    ringOpacity: 0.2,
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
    ringInnerRadius: 1.1,
    ringOuterRadius: 1.3,
    ringOpacity: 0.05,
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
