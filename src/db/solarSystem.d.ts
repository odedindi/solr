export interface SolarSystem {
	oort_cloud: OortCloud
	kuiperBelt: KuiperBeltOrAsteroidBelt
	parent: Parent
	planets?: PlanetsEntity[] | null
	dwarfPlanets?: DwarfPlanetsEntity[] | null
	asteroidBelt: KuiperBeltOrAsteroidBelt
}
export interface OortCloud {
	diameter: number
	radius: number
}
export interface KuiperBeltOrAsteroidBelt {
	count: number
	distanceFromParent: DistanceFromParentOrSurfaceTemps
	textures: Textures
}
export interface DistanceFromParentOrSurfaceTemps {
	min: number
	max: number
}

export interface Textures {
	base: string
	Topo?: string | null
	specular?: string | null
	clouds?: string | null
}
export interface Parent {
	id: string
	name: string
	diameter: number
	mass: number
	gravity: number
	density: number
	rotationPeriod: number
	distanceFromParent?: null
	orbitalPeriod?: null
	orbitalVelocity?: null
	orbitalInclination?: null
	axialTilt?: null
	meanTemperature: string
	solarConstant: number
	composition: Composition
	textures: Textures
}
export interface Composition {
	majorElements?: MajorElementsEntity[] | null
}
export interface MajorElementsEntity {
	abbr: string
	element: string
	percentageOfComposition: number
}
export interface PlanetsEntity {
	id: number
	name: string
	diameter: number
	mass: number
	gravity: number
	density: number
	rotationPeriod: number
	lengthOfDay: number
	distanceFromParent: number
	orbitalPeriod: number
	orbitalVelocity: number
	orbitalInclination: number
	axialTilt: number
	orbitPositionOffset: number
	meanTemperature: number
	surfaceTemps: SurfaceTemps
	rings: boolean | Rings
	satellites?: (SatellitesEntity | null)[] | null
	textures: Textures
	satellites_mech?: SatellitesMechEntity[] | null
}
export interface SurfaceTemps {
	min?: number | null
	mean: number
	max?: number | null
}
export interface Rings {
	innerRadius: number
	outerRadius: number
	textures: Textures1
}
export interface Textures1 {
	base: string
	colorMap: string
}
export interface SatellitesEntity {
	id: string
	name: string
	diameter: number
	mass: number | string | null
	distanceFromParent: number
	orbitalPeriod: number | string | number | string | number | string
	orbitalInclination: number
	gravity?: number | null
	surfaceTemps: SurfaceTemps1
	textures: Textures
}
export interface SurfaceTemps1 {
	min?: number | null
	mean?: number | null
	max?: number | null
}

export interface SatellitesMechEntity {
	ISS: ISS
}
export interface ISS {
	distanceFromParent: number
}
export interface DwarfPlanetsEntity {
	id: number
	name: string
	mass: string
	diameter: number
	density: number
	gravity?: number | null
	rotationPeriod: number
	lengthOfDay: number
	distanceFromParent: number
	orbitalPeriod: number
	orbitalVelocity: number
	orbitalInclination: number
	axialTilt?: number | null
	surfaceTemps: SurfaceTemps2
	rings: boolean
	satellites?: (SatellitesEntity1 | null)[] | null
	textures: Textures
	meanTemperature?: null
}
export interface SurfaceTemps2 {
	min?: number | null
	mean: number
	max: number
}
export interface SatellitesEntity1 {
	id: number
	name: string
	distanceFromParent: number
	orbitalPeriod: number
	orbitalInclination: number
	diameter: number
	mass: string
	gravity: number
	surfaceTemps: SurfaceTemps3
	textures: Textures
}
export interface SurfaceTemps3 {
	min: number
	mean: number
	max: number
}
