import type { NextPage } from "next"
import * as React from "react"

import Layout from "@/components/Layout"
import FadeInOutUp from "@/GSAPAnimation/FadeInOutUp"
// import HUD from "@/components/HUD"
import type { HUDLabelProps } from "@/components/HUDLabel"
import gql from "graphql-tag"
import { SolarDictionaryItem, useSolarDictionaryQuery } from "generated/graphql"
import { ParsedUrlQuery } from "querystring"
import { useRouter } from "next/router"
import Loader from "@/primitives/Loader"
import { getTypedKeys } from "@/lib/getTypedKeys"
import Slider from "@/components/Slider"
import HUD from "@/features/HUD/components"
import Scene from "@/features/hero/THREE/Scene"

interface QueryParams extends ParsedUrlQuery {
	id: string
}

const QuerySolarDictionary = gql`
	query SolarDictionary($ids: [Int!], $names: [String!]) {
		solarDictionary(ids: $ids, names: $names) {
			id
			name
			diameter
			lengthOfDay
			dimension
			mass {
				massValue
				massExponent
			}
			gravity
			density
			avgTemp
			composition {
				majorElements {
					abbr
					element
					percentageOfComposition
				}
			}
			textures {
				base
				topo
				specular
				clouds
			}
			orbitalPeriod
			orbitalVelocity
			orbitalInclination
			orbitPositionOffset
			axialTilt
			discoveredBy
			discoveryDate
			alternativeName
		}
	}
`

const Home: NextPage = () => {
	const { query, basePath, ...router } = useRouter()
	const { id } = query as QueryParams

	const { data, loading } = useSolarDictionaryQuery()
	const solarDict = data?.solarDictionary

	const getLabels = React.useCallback((entity: SolarDictionaryItem) => {
		const requiredLabels = ["name"]
		const labels = getTypedKeys(entity)
			.filter((key) => requiredLabels.includes(key.toLowerCase()))
			.map(
				(key) =>
					({ [key]: entity[key] } as {
						[key: string]: string | number
					})
			)
		return labels
	}, [])

	if (!solarDict || loading) return <Loader />

	return (
		<Layout>
			<HUD labels={getLabels(solarDict[Number(id)])} solarDict={solarDict}>
				<Scene />
			</HUD>
		</Layout>
	)
}

export default Home
