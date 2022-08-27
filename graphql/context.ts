import ourDatabase, { OurDatabase } from "@/db"

export interface Context {
	ourDatabase: OurDatabase
}

export const context: Context = { ourDatabase }
