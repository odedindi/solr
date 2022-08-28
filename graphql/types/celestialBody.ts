import { list, nonNull, objectType, queryType } from "nexus"
import { getAllCelestialBodies } from "../services/getAllCelestialBodies"

export const CelestialBodyMass = objectType({
	name: "CelestialBodyMass",
	definition(t) {
		t.nonNull.float("massValue", {
			description:
				"multiply the mass value with the mas exponent to get the weight in tons",
		}),
			t.nonNull.float("massExponent", {
				description: "the multiplicative factor",
			})
	},
})

export const CelestialBody = objectType({
	name: "CelestialBody",
	definition(t) {
		t.nonNull.float("id"),
			t.nonNull.string("name", { description: "Body's name" }),
			t.nonNull.boolean("isPlanet"),
			t.nonNull.float("gravity", { deprecation: "m/s^2" }),
			t.nonNull.float("diameter", { description: "diameter of the body" }),
			t.nonNull.string("bodyType", { description: "the body's type" }),
			t.nullable.field("mass", { type: CelestialBodyMass })
	},
})

export const Query = queryType({
	definition(t) {
		t.field("allCelestialBodies", {
			type: nonNull(list(CelestialBody)),
			async resolve(_source, _arg, { ourDatabase }) {
				return await getAllCelestialBodies(ourDatabase)
			},
		})
	},
})
