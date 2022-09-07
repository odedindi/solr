import * as React from "react"
import { Box, createStyles } from "@mantine/core"

import HUDLabel from "./HUDLabel"
import type { SolarDictionaryQuery } from "generated/graphql"

import { useGetHUDLabels } from "../hooks/useGetHUDLabels"
import Scene from "../THREE/Scene"

const useStyles = createStyles((theme) => ({
	base: {
		width: "100%",
		height: "100vh",
	},
	container: {
		position: "absolute",
		top: "7.5vw",
		left: "10vw",
		fontFamily: "arial",
		width: "20%",
		display: "flex",
		flexDirection: "column",
		zIndex: 1,

		[`@media (max-width: ${theme.breakpoints.xs}px)`]: {
			top: "15vw",
		},

		[`@media (max-width: ${theme.breakpoints.sm}px)`]: {
			top: "20vw",
		},
	},

	sliderContainer: { position: "absolute", right: "10%", zIndex: 2 },
	sliderItem: {
		width: "16px",
		height: "16px",
		backgroundColor: "gray",
		marginBottom: "25px",
		borderRadius: "100%",
		cursor: "pointer",
		position: "relative",

		"&:before": {
			content: "''",
			display: "block",
			position: "absolute",
			top: "50%",
			left: "50%",
			transform: "translate(-50%, -50%)",
			borderRadius: "100%",
			border: "2px solid rgba(255, 255, 255, 0.2)",
			opacity: 0,
			transition:
				"opacity 0.2s ease-in, width 0.3s ease-in, height 0.3s ease-in",

			width: "100%",
			height: "100%",
		},
		"&.isActive": {
			backgroundColor: "white",
			"&:before": {
				opacity: 1,
				width: "250%",
				height: "250%",
			},
		},
	},
}))

export type HUDProps = {
	solarDict: SolarDictionaryQuery["solarDictionary"]
	activeEntityIndex: number
	handleChangeActiveEntity: (newIndex: number) => void
}

const HUD: React.FC<HUDProps> = ({
	solarDict,
	activeEntityIndex,
	handleChangeActiveEntity,
}) => {
	const { classes, cx } = useStyles()

	const requiredLabels = ["name"]

	const labels = useGetHUDLabels(solarDict[activeEntityIndex], requiredLabels)
	const HUDLabels = labels.map((label) =>
		Object.entries(label).map(
			([key, value], i) =>
				value && <HUDLabel key={key} label={key} text={value} small={!!i} />
		)
	)

	return (
		<Box className={classes.base}>
			{solarDict.map((entity, i) => (
				<Box key={i} hidden={i !== activeEntityIndex} sx={{ height: "100%" }}>
					<Scene baseTexture={entity.textures?.base!} />
					<Box className={classes.container}>{HUDLabels}</Box>
				</Box>
			))}
			<Box
				className={classes.sliderContainer}
				sx={{ top: `calc(50% - ${solarDict.length * 35}px)` }}
			>
				{solarDict.map((_, i) => (
					<Box
						component="div"
						className={cx(classes.sliderItem, {
							isActive: i === activeEntityIndex,
						})}
						key={i}
						onClick={() => handleChangeActiveEntity(i)}
					/>
				))}
			</Box>
		</Box>
	)
}

export default HUD
