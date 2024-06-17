import { type FC, useState } from "react"
import { Box, Center, Container, createStyles } from "@mantine/core"
import { useSolarDictionaryQuery } from "generated/graphql"
import Loader from "@/primitives/Loader"
import Scene from "./THREE/Scene"

import { Slider } from "@mantine/core"

import { Planet, Sun, CircleDashed } from "tabler-icons-react"
import dynamic from "next/dynamic"
import Checkbox from "./components/Checkbox"

const RedGiantsMark = dynamic(() => import("./components/RedGiantMark"))

const useStyles = createStyles(() => ({
	base: {
		width: "100vw",
		height: "100vh",
		overflow: "hidden",
	},

	checkBoxContainer: {
		display: "flex",
		flexDirection: "row",
		gap: "2rem",
		padding: "2rem 0 0",
	},

	sliderContainer: {
		display: "flex",
		flexDirection: "column",
		padding: "4rem 1rem 0",
		".solr-Slider-markLabel": {
			paddingTop: "0.5rem",
		},
	},
}))

const plantsScaleMarks = [
	{ value: 1, label: 1 },
	{ value: 25, label: 25 },
	{ value: 100, label: 100 },
	{ value: 500, label: 500 },
]

const SolarSystem: FC = () => {
	const { classes } = useStyles()
	const { data, loading } = useSolarDictionaryQuery()
	const solarDict = data?.solarDictionary
	const [showSun, setShowSun] = useState(true)
	const [showPlanets, setShowPlanets] = useState(true)
	const [showOrbits, setShowOrbits] = useState(true)
	const [planetsScale, setPlanetScale] = useState(100)
	const [sunScale, setSunScale] = useState(1)

	if (!solarDict || loading) return <Loader />
	return (
		<Box className={classes.base}>
			<Center>
				<Container fluid className={classes.checkBoxContainer}>
					<Checkbox
						icon={({ className }) => <Sun className={className} />}
						checked={showSun}
						onChange={() => setShowSun(!showSun)}
					/>
					<Checkbox
						icon={({ className }) => <Planet className={className} />}
						checked={showPlanets}
						onChange={() => setShowPlanets(!showPlanets)}
					/>
					<Checkbox
						icon={({ className }) => <CircleDashed className={className} />}
						checked={showOrbits}
						onChange={() => setShowOrbits(!showOrbits)}
					/>
				</Container>
			</Center>

			<Container fluid className={classes.sliderContainer}>
				<Slider
					value={sunScale}
					onChange={setSunScale}
					min={1}
					max={50}
					marks={[
						{
							value: 20,
							label: <RedGiantsMark showMark={sunScale === 20} />,
						},
					]}
					thumbSize={36}
					thumbChildren={<Sun size={22} />}
					size={"lg"}
					mb={"3rem"}
					color={"orange.7"}
					label={sunScale === 20 ? null : undefined}
				/>
				<Slider
					value={planetsScale}
					onChange={setPlanetScale}
					min={1}
					max={500}
					marks={plantsScaleMarks}
					step={5}
					thumbSize={36}
					thumbChildren={<Planet size={22} />}
					size={"lg"}
					color={"orange.7"}
				/>
			</Container>

			<Scene
				planets={solarDict}
				planetsScale={planetsScale}
				sunScale={sunScale}
				showOrbits={showOrbits}
				showPlanets={showPlanets}
				showSun={showSun}
			/>
		</Box>
	)
}

export default SolarSystem
