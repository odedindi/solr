import { makeSchema } from "nexus"

import * as types from "./types"
import { join } from "path"
export const schema = makeSchema({
	types,
	contextType: {
		module: join(process.cwd(), "graphql", "context.ts"),
		export: "Context",
	},
	outputs: {
		schema: join(process.cwd(), "generated", "schema.graphql"),
		typegen: join(process.cwd(), "generated/nexus-typegen-custom.d.ts"),
	},
})
