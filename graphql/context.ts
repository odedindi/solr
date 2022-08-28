import ourDatabase, { OurDatabase } from "@/graphql/db"

export interface Context {
	ourDatabase: OurDatabase
}

export const context: Context = { ourDatabase }
