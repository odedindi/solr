import {
	objectType,
	extendType,
	nonNull,
	list,
	stringArg,
	floatArg,
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

export const Query = extendType({
	type: "Query",
	definition(t) {
		t.field("solarDictionary", {
			type: nonNull(list(SolarDictionaryItem)),
			args: {
				id: nullable(intArg()),
				name: nullable(stringArg()),
			},
			resolve: async (_source, { id, name }, { ourDatabase }) => {
				return getAllSolarDictionaryItems(ourDatabase, { id, name })
			},
		})
	},
})
