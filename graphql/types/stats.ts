import { objectType } from "nexus"

export const Mass = objectType({
	name: "Mass",
	definition(t) {
		t.nonNull.float("massValue")
		t.nonNull.float("massExponent")
	},
})
export const Vol = objectType({
	name: "Mass",
	definition(t) {
		t.nonNull.float("volValue")
		t.nonNull.float("volExponent")
	},
})

export const MajorElementsEntity = objectType({
	name: "MajorElementsEntity",
	definition(t) {
		t.nonNull.string("abbr")
		t.nonNull.string("element")
		t.nonNull.float("percentageOfComposition")
	},
})
export const Composition = objectType({
	name: "Composition",
	definition(t) {
		t.nullable.list.field("majorElements", { type: MajorElementsEntity })
	},
})

export const Texture = objectType({
	name: "Texture",
	definition(t) {
		t.nonNull.string("base")
		t.nullable.string("topo")
		t.nullable.string("specular")
		t.nullable.string("clouds")
	},
})
