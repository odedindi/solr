import * as React from "react"
import { Box, List, Text, Title } from "@mantine/core"
import db from "@/db/db.json"
import * as DB from "@/db/db"
export type DBInfoProps = {}

const DBInfo: React.FC<DBInfoProps> = () => {
	const bodies: DB.BodiesEntity[] = db.bodies
	const planets = db.bodies
		.filter((body) => body.isPlanet)
		.map(({ name, englishName }) => ({ name, englishName }))

	return (
		<Box>
			<Title>DB:</Title>
			<Text>bodies in database: {bodies.length}</Text>
			{planets.map(({ name, englishName }) => (
				<List withPadding key={name}>{`${name}(${englishName})`}</List>
			))}
		</Box>
	)
}

export default DBInfo
