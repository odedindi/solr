import { getTypedKeys } from "../../src/lib/getTypedKeys"
import { SolarDictionaryItem as SolarDictionaryItemType } from "generated/graphql"
import {
	objectType,
	extendType,
	nonNull,
	list,
	stringArg,
	intArg,
	nullable,
} from "nexus"
import { getAllSolarDictionaryItems } from "../services/getAllSolarDictionaryItems"
import { Mass, Textures, Composition } from "./stats"

export const SolarDictionaryItem = objectType({
	name: "SolarDictionaryItem",
	definition(t) {
		t.nonNull.int("id")
		t.nonNull.string("name")
		t.nonNull.float("diameter")
		t.nullable.float("lengthOfDay")
		t.nullable.float("dimension")
		t.nullable.field("mass", { type: Mass })
		t.nullable.float("gravity")
		t.nullable.float("density")
		t.nullable.string("avgTemp")
		t.nullable.field("composition", { type: Composition })
		t.nullable.field("textures", { type: Textures })
		t.nullable.float("orbitalPeriod")
		t.nullable.float("orbitalVelocity")
		t.nullable.float("orbitalInclination")
		t.nullable.float("orbitPositionOffset")
		t.nullable.float("axialTilt")
		t.nullable.string("discoveredBy")
		t.nullable.string("discoveryDate")
		t.nullable.string("alternativeName")
	},
})
const demoEntity: SolarDictionaryItemType = {
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

export const Query = extendType({
	type: "Query",
	definition(t) {
		t.field("solarDictionary", {
			type: nonNull(list(nonNull(SolarDictionaryItem))),
			args: {
				ids: nullable(list(nonNull(intArg()))),
				names: nullable(list(nonNull(stringArg()))),
			},
			resolve: async (_source, { ids, names }, { ourDatabase }) => {
				return getAllSolarDictionaryItems(
					ourDatabase,
					{ ids, names },
					demoEntityKeys
				)
			},
		})
	},
})
