import * as React from "react"
import { Box, List, Text, Title } from "@mantine/core"

import ourDB from "@/db"
import gql from "graphql-tag"
import { useAllPlanetsQuery } from "generated/graphql"

export type DBInfoProps = {}

const QueryAllPlanets = gql`
	query AllPlanets {
		allPlanets {
			id
			name
			diameter
			lengthOfDay
		}
	}
`

const DBInfo: React.FC<DBInfoProps> = () => {
	const celestialBodies = Object.keys(ourDB.celestialBodies)
	const bodies: number = celestialBodies.reduce(
		(acc, body) =>
			acc +
			ourDB.celestialBodies[body as keyof typeof ourDB.celestialBodies].length,
		0
	)

	const allPlanets = useAllPlanetsQuery()?.data?.allPlanets
	return (
		<Box>
			<Title>DB:</Title>
			<Text>bodies in database: {bodies}</Text>
			<Text>
				Known planets in our solar system:
				{allPlanets?.map(({ id, name }) => (
					<List withPadding key={name}>{`${id}: ${name}`}</List>
				))}
			</Text>
		</Box>
	)
}

export default DBInfo
