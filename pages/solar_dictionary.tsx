import type { NextPage } from "next"
import * as React from "react"

import Hero from "@/components/Hero"

import Layout from "@/components/Layout"
import FadeInOutUp from "@/GSAPAnimation/FadeInOutUp"
import HUD from "@/components/HUD"
import type { HUDLabelProps } from "@/components/HUDLabel"
import gql from "graphql-tag"
import { useSolarDictionaryQuery } from "generated/graphql"

const QuerySolarDictionary = gql`
	query SolarDictionary($id: Int, $name: String) {
		solarDictionary(id: $id, name: $name) {
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
	const labels: { [key: string]: string }[] = [
		{
			Name: "Sun",
		},
	]
	const solarDic = useSolarDictionaryQuery({ variables: { id: 1 } })?.data
		?.solarDictionary

	return (
		<Layout>
			<FadeInOutUp>
				<HUD labels={solarDic as any ?? []}>bob</HUD>
			</FadeInOutUp>
		</Layout>
	)
}

export default Home
