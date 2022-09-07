import * as React from "react"
import { Box } from "@mantine/core"
import { useSolarDictionaryQuery } from "generated/graphql"

import Loader from "@/primitives/Loader"
import HUD from "./HUD"

export type solarDictionaryProps = {}

const SolarDictionary: React.FC<solarDictionaryProps> = () => {
	const [activeEntityIndex, setActiveEntityIndex] = React.useState(0)
	const handleChangeActiveEntity = (newIndex: number) =>
		setActiveEntityIndex(newIndex)
	const { data, loading } = useSolarDictionaryQuery()
	const solarDict = data?.solarDictionary

	if (!solarDict || loading) return <Loader />

	return (
		<Box>
			<HUD
				solarDict={solarDict}
				activeEntityIndex={activeEntityIndex}
				handleChangeActiveEntity={handleChangeActiveEntity}
			/>
		</Box>
	)
}

export default SolarDictionary
