import { OurDatabase } from "@/graphql/db"
import {
	objectType,
	extendType,
	nonNull,
	list,
	stringArg,
	floatArg,
	intArg,
} from "nexus"

export const Planet = objectType({
	name: "Planet",
	definition(t) {
		t.nonNull.float("id", {
			description: "the order of the planet from the sun",
		}),
			t.nonNull.string("name", { description: "planet's name" }),
			t.nonNull.float("diameter", { description: "diameter of the planet" }),
			t.nonNull.float("lengthOfDay", {
				description: "length of planet's day in earth hours",
			})
	},
})

export const Query = extendType({
	type: "Query",
	definition(t) {
		t.field("allPlanets", {
			type: nonNull(list(nonNull(Planet))),
			description: "get all planets",
			async resolve(_source, _arg, { ourDatabase }) {
				const allPlanets = ourDatabase.planets
				return allPlanets
			},
		})
		t.field("planet", {
			type: nonNull(list(Planet)),
			description: "get planet by id",
			args: {
				id: nonNull(intArg()),
			},
			async resolve(_source, { id }, { ourDatabase }) {
				const allPlanets = ourDatabase.planets
				return allPlanets.filter((planet) => planet.id === id)
			},
		})
	},
})
