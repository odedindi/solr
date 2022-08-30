import * as React from "react"
import { Box, List, Text, Title } from "@mantine/core"

import ourDB from "@/graphql/db"
import gql from "graphql-tag"
import {
	useAllCelestialBodiesQuery,
	useAllPlanetsQuery,
} from "generated/graphql"
import { getTypedKeys } from "@/lib/getTypedKeys"

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

const QueryAllCelestialBodies = gql`
	query AllCelestialBodies {
		allCelestialBodies {
			id
			name
		}
	}
`

const DBInfo: React.FC<DBInfoProps> = () => {
	const allCelestialBodies =
		useAllCelestialBodiesQuery()?.data?.allCelestialBodies
	const allPlanets = useAllPlanetsQuery()?.data?.allPlanets
	return (
		<Box>
			<Title>DB:</Title>
			<Text>Celestial bodies in database: {allCelestialBodies?.length}</Text>
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
