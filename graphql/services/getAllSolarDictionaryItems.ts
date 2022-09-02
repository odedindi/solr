import { getTypedKeys } from "../../lib/getTypedKeys"
import { NexusGenObjects } from "generated/nexus-typegen-custom"
import { OurDatabase } from "../db"

const demoEntity: NexusGenObjects["SolarDictionaryItem"] = {
	id: 0,
	name: "demo",
	diameter: 1,
	mass: {
		massValue: 1,
		massExponent: 1,
	},

	discoveredBy: "",
	discoveryDate: "",
	alternativeName: "",
	gravity: 1,
	density: 1,
	avgTemp: "1 K",
	composition: {},
	textures: {
		base: "/assets/textures/earth_4k.jpg",
	},
	orbitalPeriod: 1,
	orbitalVelocity: 1,
	orbitalInclination: 1,
	orbitPositionOffset: 1,
	axialTilt: 1,
}
const demoEntityKeys = getTypedKeys(demoEntity)

export const getAllSolarDictionaryItems = (
	{ suns, planets }: OurDatabase,
	{ id, name }: { id?: number | null; name?: string | null } = {}
): NexusGenObjects["SolarDictionaryItem"][] => {
	const getSolarDictItemValues = (
		entities: typeof suns | typeof planets
	): NexusGenObjects["SolarDictionaryItem"][] => {
		const result = entities.map((entity) => {
			const keys = getTypedKeys(entity)
			const solarDictItem = keys.reduce<NexusGenObjects["SolarDictionaryItem"]>(
				(item, key) => {
					return demoEntityKeys.includes(key as any)
						? { ...item, [key]: entity[key] }
						: item
				},
				{} as NexusGenObjects["SolarDictionaryItem"]
			)
			return solarDictItem
		})
		return result
	}

	if (id && name) {
		const itemById =
			id === 0
				? getSolarDictItemValues(suns)
				: getSolarDictItemValues(planets.filter((p) => p.id === id))

		const regex = new RegExp(name, "i")
		const itemByName = /sun/i.test(name)
			? getSolarDictItemValues(suns)
			: getSolarDictItemValues(planets.filter((p) => regex.test(p.name)))
		return [...itemById, ...itemByName]
	}

	if (id) {
		if (id === 0) return getSolarDictItemValues(suns)
		return getSolarDictItemValues(planets.filter((p) => p.id === id))
	}
	if (name) {
		if (/sun/i.test(name)) return getSolarDictItemValues(suns)
		const regex = new RegExp(name, "i")
		return getSolarDictItemValues(planets.filter((p) => regex.test(p.name)))
	}
	return [...getSolarDictItemValues(suns), ...getSolarDictItemValues(planets)]
}
