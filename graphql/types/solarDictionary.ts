import {
	objectType,
	extendType,
	nonNull,
	list,
	stringArg,
	floatArg,
	intArg,
} from "nexus"

export const SolarDictionaryItem = objectType({
	name: "SolarDictionaryItem",
	definition(t) {
		t.nonNull.float("id")
		t.nonNull.string("name")
		t.nonNull.float("diameter")
		t.nullable.float("lengthOfDay")
		t.nullable.float("dimension")
		t.nullable.float("mass")
		t.nullable.float("gravity")
		t.nullable.string("avgTemp")
		t.nullable.float("composition")
		t.nullable.float("texture")
		t.nullable.float("")
	},
})
