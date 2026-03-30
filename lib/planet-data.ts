export interface Moon {
  name: string
  diameter: number // km
  orbitalPeriod: number // days
  distanceFromPlanet: number // km
  description: string
}

export interface Planet {
  id: string
  name: string
  type: "terrestrial" | "gas-giant" | "ice-giant" | "dwarf"
  diameter: number // km
  mass: string // relative to Earth
  gravity: number // m/s²
  distanceFromSun: number // million km (average)
  orbitalPeriod: number // Earth days
  rotationPeriod: number // Earth hours
  axialTilt: number // degrees
  meanTemp: number // °C
  atmosphere: string[]
  moons: Moon[]
  rings: boolean
  color: string // hex for 3D rendering
  emissive?: string
  description: string
  funFact: string
  discoveredBy?: string
  discoveryYear?: number
  missions: string[]
  composition: string
  magneticField: string
  orbitEccentricity: number
  escapeVelocity: number // km/s
  surfaceArea: string // million km²
}

export const planets: Planet[] = [
  {
    id: "mercury",
    name: "Mercury",
    type: "terrestrial",
    diameter: 4879,
    mass: "0.055",
    gravity: 3.7,
    distanceFromSun: 57.9,
    orbitalPeriod: 88,
    rotationPeriod: 1407.6,
    axialTilt: 0.034,
    meanTemp: 167,
    atmosphere: ["Oxygen", "Sodium", "Hydrogen", "Helium", "Potassium"],
    moons: [],
    rings: false,
    color: "#8c7e6d",
    description:
      "Mercury is the smallest planet in our solar system and the closest to the Sun. Its surface is heavily cratered and resembles Earth's Moon. Despite being closest to the Sun, it is not the hottest planet.",
    funFact:
      "A day on Mercury (sunrise to sunrise) lasts 176 Earth days, while its year is only 88 Earth days.",
    missions: ["MESSENGER", "BepiColombo", "Mariner 10"],
    composition: "Iron core (75% of radius), silicate mantle and crust",
    magneticField: "Weak (1% of Earth's strength)",
    orbitEccentricity: 0.2056,
    escapeVelocity: 4.3,
    surfaceArea: "74.8",
  },
  {
    id: "venus",
    name: "Venus",
    type: "terrestrial",
    diameter: 12104,
    mass: "0.815",
    gravity: 8.87,
    distanceFromSun: 108.2,
    orbitalPeriod: 224.7,
    rotationPeriod: -5832.5,
    axialTilt: 177.4,
    meanTemp: 464,
    atmosphere: ["Carbon Dioxide (96.5%)", "Nitrogen (3.5%)", "Sulfur Dioxide"],
    moons: [],
    rings: false,
    color: "#e6c87a",
    description:
      "Venus is the second planet from the Sun and the hottest planet in our solar system. Often called Earth's twin due to similar size, it has a toxic atmosphere with crushing pressure and extreme greenhouse effect.",
    funFact:
      "Venus rotates backwards (retrograde) compared to most planets, so the Sun rises in the west and sets in the east.",
    missions: ["Venera Program", "Magellan", "Akatsuki", "VERITAS"],
    composition: "Iron core, rocky mantle, basaltic crust",
    magneticField: "No intrinsic magnetic field",
    orbitEccentricity: 0.0068,
    escapeVelocity: 10.36,
    surfaceArea: "460.2",
  },
  {
    id: "earth",
    name: "Earth",
    type: "terrestrial",
    diameter: 12756,
    mass: "1.0",
    gravity: 9.81,
    distanceFromSun: 149.6,
    orbitalPeriod: 365.25,
    rotationPeriod: 23.93,
    axialTilt: 23.44,
    meanTemp: 15,
    atmosphere: ["Nitrogen (78%)", "Oxygen (21%)", "Argon (0.9%)", "CO2 (0.04%)"],
    moons: [
      {
        name: "Moon",
        diameter: 3475,
        orbitalPeriod: 27.3,
        distanceFromPlanet: 384400,
        description:
          "Earth's only natural satellite, the fifth largest moon in the solar system.",
      },
    ],
    rings: false,
    color: "#4a90d9",
    description:
      "Earth is the third planet from the Sun and the only known planet to harbor life. It has liquid water on its surface, a protective magnetic field, and a breathable atmosphere.",
    funFact:
      "Earth is the densest planet in our solar system at 5.51 g/cm³.",
    missions: ["ISS", "Countless Earth observation satellites"],
    composition: "Iron-nickel core, silicate mantle, thin crust",
    magneticField: "Strong dipole field, protects from solar wind",
    orbitEccentricity: 0.0167,
    escapeVelocity: 11.19,
    surfaceArea: "510.1",
  },
  {
    id: "mars",
    name: "Mars",
    type: "terrestrial",
    diameter: 6792,
    mass: "0.107",
    gravity: 3.72,
    distanceFromSun: 227.9,
    orbitalPeriod: 687,
    rotationPeriod: 24.62,
    axialTilt: 25.19,
    meanTemp: -65,
    atmosphere: ["Carbon Dioxide (95.3%)", "Nitrogen (2.7%)", "Argon (1.6%)"],
    moons: [
      {
        name: "Phobos",
        diameter: 22.4,
        orbitalPeriod: 0.319,
        distanceFromPlanet: 9376,
        description:
          "The larger and closer of Mars's two moons, slowly spiraling inward.",
      },
      {
        name: "Deimos",
        diameter: 12.4,
        orbitalPeriod: 1.263,
        distanceFromPlanet: 23463,
        description:
          "The smaller and outer moon of Mars, named after the Greek god of dread.",
      },
    ],
    rings: false,
    color: "#c1440e",
    description:
      "Mars is the fourth planet from the Sun, often called the Red Planet due to iron oxide on its surface. It hosts the tallest volcano and largest canyon in the solar system.",
    funFact:
      "Olympus Mons on Mars is the tallest known volcano in the solar system at 21.9 km (72,000 ft).",
    missions: [
      "Curiosity",
      "Perseverance",
      "InSight",
      "Mars Reconnaissance Orbiter",
      "Ingenuity Helicopter",
    ],
    composition: "Iron sulfide core, silicate mantle, basaltic crust",
    magneticField: "No global field, remnant crustal magnetism",
    orbitEccentricity: 0.0934,
    escapeVelocity: 5.03,
    surfaceArea: "144.8",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    type: "gas-giant",
    diameter: 142984,
    mass: "317.8",
    gravity: 24.79,
    distanceFromSun: 778.5,
    orbitalPeriod: 4331,
    rotationPeriod: 9.93,
    axialTilt: 3.13,
    meanTemp: -110,
    atmosphere: [
      "Hydrogen (89.8%)",
      "Helium (10.2%)",
      "Methane",
      "Ammonia",
      "Water Vapor",
    ],
    moons: [
      {
        name: "Io",
        diameter: 3643,
        orbitalPeriod: 1.769,
        distanceFromPlanet: 421700,
        description:
          "The most volcanically active body in the solar system.",
      },
      {
        name: "Europa",
        diameter: 3122,
        orbitalPeriod: 3.551,
        distanceFromPlanet: 671034,
        description:
          "Suspected to harbor a subsurface ocean beneath its icy crust.",
      },
      {
        name: "Ganymede",
        diameter: 5268,
        orbitalPeriod: 7.155,
        distanceFromPlanet: 1070412,
        description: "The largest moon in the solar system, larger than Mercury.",
      },
      {
        name: "Callisto",
        diameter: 4821,
        orbitalPeriod: 16.689,
        distanceFromPlanet: 1882709,
        description:
          "The most heavily cratered object in the solar system.",
      },
    ],
    rings: true,
    color: "#c88b3a",
    description:
      "Jupiter is the largest planet in our solar system, a gas giant with a mass more than twice that of all other planets combined. Its Great Red Spot is a storm that has raged for over 350 years.",
    funFact:
      "Jupiter's Great Red Spot is a storm larger than Earth that has been observed for over 350 years.",
    missions: ["Juno", "Galileo", "Voyager 1 & 2", "Europa Clipper"],
    composition: "Hydrogen and helium gas, possible rocky core",
    magneticField: "Strongest in the solar system (20,000x Earth's)",
    orbitEccentricity: 0.0489,
    escapeVelocity: 59.5,
    surfaceArea: "61,418",
  },
  {
    id: "saturn",
    name: "Saturn",
    type: "gas-giant",
    diameter: 120536,
    mass: "95.2",
    gravity: 10.44,
    distanceFromSun: 1432,
    orbitalPeriod: 10747,
    rotationPeriod: 10.66,
    axialTilt: 26.73,
    meanTemp: -140,
    atmosphere: [
      "Hydrogen (96.3%)",
      "Helium (3.25%)",
      "Methane",
      "Ammonia",
    ],
    moons: [
      {
        name: "Titan",
        diameter: 5150,
        orbitalPeriod: 15.945,
        distanceFromPlanet: 1221870,
        description:
          "The only moon with a dense atmosphere and surface lakes of liquid methane.",
      },
      {
        name: "Enceladus",
        diameter: 504,
        orbitalPeriod: 1.37,
        distanceFromPlanet: 238042,
        description:
          "Has geysers spraying water ice, hinting at a subsurface ocean.",
      },
      {
        name: "Mimas",
        diameter: 396,
        orbitalPeriod: 0.942,
        distanceFromPlanet: 185539,
        description:
          "Known for its massive Herschel Crater, resembling the Death Star.",
      },
      {
        name: "Rhea",
        diameter: 1528,
        orbitalPeriod: 4.518,
        distanceFromPlanet: 527108,
        description:
          "Saturn's second-largest moon, composed mostly of water ice.",
      },
    ],
    rings: true,
    color: "#e8d5a3",
    description:
      "Saturn is the sixth planet from the Sun, famous for its spectacular ring system made of ice and rock. It is the least dense planet and could theoretically float in water.",
    funFact:
      "Saturn's density is so low (0.687 g/cm³) that it would float if placed in a large enough body of water.",
    missions: ["Cassini-Huygens", "Voyager 1 & 2", "Pioneer 11", "Dragonfly"],
    composition: "Hydrogen and helium, possible rocky core",
    magneticField: "578 times stronger than Earth's",
    orbitEccentricity: 0.0565,
    escapeVelocity: 35.5,
    surfaceArea: "42,612",
  },
  {
    id: "uranus",
    name: "Uranus",
    type: "ice-giant",
    diameter: 51118,
    mass: "14.5",
    gravity: 8.87,
    distanceFromSun: 2867,
    orbitalPeriod: 30589,
    rotationPeriod: -17.24,
    axialTilt: 97.77,
    meanTemp: -195,
    atmosphere: [
      "Hydrogen (82.5%)",
      "Helium (15.2%)",
      "Methane (2.3%)",
    ],
    moons: [
      {
        name: "Miranda",
        diameter: 472,
        orbitalPeriod: 1.413,
        distanceFromPlanet: 129900,
        description:
          "One of the most geologically diverse bodies, with canyons 12 times deeper than the Grand Canyon.",
      },
      {
        name: "Ariel",
        diameter: 1158,
        orbitalPeriod: 2.52,
        distanceFromPlanet: 190900,
        description: "The brightest and possibly youngest surface of Uranus's moons.",
      },
      {
        name: "Titania",
        diameter: 1578,
        orbitalPeriod: 8.706,
        distanceFromPlanet: 436300,
        description: "The largest moon of Uranus and eighth-largest in the solar system.",
      },
    ],
    rings: true,
    color: "#7ec8c8",
    description:
      "Uranus is the seventh planet from the Sun and the first discovered with a telescope. It rotates on its side with an axial tilt of nearly 98 degrees, likely from an ancient collision.",
    funFact:
      "Uranus rotates on its side, with an axial tilt of 97.77 degrees, likely from an ancient collision with an Earth-sized object.",
    discoveredBy: "William Herschel",
    discoveryYear: 1781,
    missions: ["Voyager 2", "Uranus Orbiter and Probe (proposed)"],
    composition: "Water, methane, and ammonia ices over a small rocky core",
    magneticField: "Tilted 59 degrees from rotational axis",
    orbitEccentricity: 0.0457,
    escapeVelocity: 21.3,
    surfaceArea: "8,083",
  },
  {
    id: "neptune",
    name: "Neptune",
    type: "ice-giant",
    diameter: 49528,
    mass: "17.1",
    gravity: 11.15,
    distanceFromSun: 4515,
    orbitalPeriod: 59800,
    rotationPeriod: 16.11,
    axialTilt: 28.32,
    meanTemp: -200,
    atmosphere: [
      "Hydrogen (80%)",
      "Helium (19%)",
      "Methane (1.5%)",
    ],
    moons: [
      {
        name: "Triton",
        diameter: 2707,
        orbitalPeriod: -5.877,
        distanceFromPlanet: 354759,
        description:
          "Largest moon of Neptune, orbits retrograde, likely a captured Kuiper Belt object. Has nitrogen geysers.",
      },
    ],
    rings: true,
    color: "#3f54ba",
    description:
      "Neptune is the eighth and most distant planet in our solar system. It has the strongest winds of any planet, reaching speeds of 2,100 km/h. Its deep blue color comes from methane in its atmosphere.",
    funFact:
      "Neptune's winds are the fastest in the solar system, reaching 2,100 km/h (1,300 mph).",
    discoveredBy: "Johann Galle (based on predictions by Adams and Le Verrier)",
    discoveryYear: 1846,
    missions: ["Voyager 2"],
    composition: "Water, methane, and ammonia ices over a rocky core",
    magneticField: "27 times stronger than Earth's, tilted 47 degrees",
    orbitEccentricity: 0.0113,
    escapeVelocity: 23.5,
    surfaceArea: "7,618",
  },
]

export const dwarfPlanets: Planet[] = [
  {
    id: "pluto",
    name: "Pluto",
    type: "dwarf",
    diameter: 2377,
    mass: "0.0022",
    gravity: 0.62,
    distanceFromSun: 5906,
    orbitalPeriod: 90560,
    rotationPeriod: -153.3,
    axialTilt: 122.53,
    meanTemp: -230,
    atmosphere: ["Nitrogen", "Methane", "Carbon Monoxide"],
    moons: [
      {
        name: "Charon",
        diameter: 1212,
        orbitalPeriod: 6.387,
        distanceFromPlanet: 19591,
        description:
          "Pluto's largest moon, so large relative to Pluto that they are considered a binary system.",
      },
    ],
    rings: false,
    color: "#c4a882",
    description:
      "Pluto was reclassified as a dwarf planet in 2006 by the IAU. NASA's New Horizons revealed it to be a geologically complex world with a heart-shaped nitrogen glacier called Tombaugh Regio.",
    funFact:
      "Pluto's heart-shaped glacier, Tombaugh Regio, is composed of nitrogen ice and is about the size of Texas.",
    discoveredBy: "Clyde Tombaugh",
    discoveryYear: 1930,
    missions: ["New Horizons"],
    composition: "Rock and ice (water, nitrogen, methane)",
    magneticField: "Unknown, likely very weak or none",
    orbitEccentricity: 0.2488,
    escapeVelocity: 1.21,
    surfaceArea: "17.7",
  },
]

export const allBodies = [...planets, ...dwarfPlanets]

// Orbital parameters for 3D rendering (scaled for visualization)
export const orbitalParams = {
  mercury: { radius: 3.5, speed: 4.15, size: 0.15, inclination: 7 },
  venus: { radius: 5, speed: 1.62, size: 0.35, inclination: 3.4 },
  earth: { radius: 6.5, speed: 1.0, size: 0.37, inclination: 0 },
  mars: { radius: 8, speed: 0.53, size: 0.2, inclination: 1.85 },
  jupiter: { radius: 12, speed: 0.084, size: 1.2, inclination: 1.3 },
  saturn: { radius: 16, speed: 0.034, size: 1.0, inclination: 2.49 },
  uranus: { radius: 20, speed: 0.012, size: 0.6, inclination: 0.77 },
  neptune: { radius: 24, speed: 0.006, size: 0.55, inclination: 1.77 },
  pluto: { radius: 27, speed: 0.004, size: 0.08, inclination: 17.16 },
} as const

// Travel speed data for distance calculator
export const travelSpeeds = {
  walking: { name: "Walking", speed: 5, unit: "km/h" },
  car: { name: "Car", speed: 120, unit: "km/h" },
  plane: { name: "Commercial Plane", speed: 900, unit: "km/h" },
  bullet: { name: "Bullet", speed: 1200, unit: "km/h" },
  rocket: { name: "Rocket (Apollo)", speed: 40000, unit: "km/h" },
  newHorizons: { name: "New Horizons", speed: 58536, unit: "km/h" },
  light: { name: "Speed of Light", speed: 1079252849, unit: "km/h" },
} as const

export const historicalSpacecraft = [
  {
    name: "Voyager 1",
    launchDate: "September 5, 1977",
    currentDistance: 24.4, // billion km (approx)
    speed: 61200, // km/h
    status: "Active - Interstellar space",
    description:
      "The most distant human-made object, now in interstellar space. Carries the Golden Record.",
  },
  {
    name: "Voyager 2",
    launchDate: "August 20, 1977",
    currentDistance: 20.3,
    speed: 55400,
    status: "Active - Interstellar space",
    description:
      "The only spacecraft to visit all four giant planets. Entered interstellar space in 2018.",
  },
  {
    name: "New Horizons",
    launchDate: "January 19, 2006",
    currentDistance: 8.2,
    speed: 58536,
    status: "Active - Kuiper Belt",
    description:
      "First spacecraft to fly by Pluto (2015) and Kuiper Belt object Arrokoth (2019).",
  },
  {
    name: "Pioneer 10",
    launchDate: "March 2, 1972",
    currentDistance: 19.4,
    speed: 44000,
    status: "Signal lost (2003)",
    description:
      "First spacecraft to cross the asteroid belt and fly by Jupiter.",
  },
  {
    name: "Pioneer 11",
    launchDate: "April 5, 1973",
    currentDistance: 16.5,
    speed: 40000,
    status: "Signal lost (1995)",
    description:
      "First spacecraft to study Saturn and its rings at close range.",
  },
]

export function formatNumber(num: number): string {
  if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + "B"
  if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + "M"
  if (Math.abs(num) >= 1e3) return num.toLocaleString()
  return num.toString()
}

export function formatTravelTime(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} minutes`
  if (hours < 24) return `${hours.toFixed(1)} hours`
  const days = hours / 24
  if (days < 365) return `${days.toFixed(1)} days`
  const years = days / 365.25
  if (years < 1000) return `${years.toFixed(1)} years`
  if (years < 1e6) return `${(years / 1000).toFixed(1)} thousand years`
  if (years < 1e9) return `${(years / 1e6).toFixed(1)} million years`
  return `${(years / 1e9).toFixed(1)} billion years`
}
