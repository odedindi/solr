import * as React from "react"
import { Box, createStyles } from "@mantine/core"
import HUDLabel, { HUDLabelProps } from "./HUDLabel"

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
		zIndex: 3,

		[`@media (max-width: ${theme.breakpoints.xs}px)`]: {
			top: "15vw",
		},

		[`@media (max-width: ${theme.breakpoints.sm}px)`]: {
			top: "20vw",
		},
	},
}))

export type HUDProps = {
	children: React.ReactNode
	labels: { [key: string]: string | number | null | undefined | Object }[]
}

const HUD: React.FC<HUDProps> = ({ children, labels }) => {
	const { classes } = useStyles()
	return (
		<Box className={classes.base}>
			{children}
			<Box className={classes.container}>
				{labels.map((label) =>
					Object.entries(label).map(([key, value], i) =>
						typeof value === "object" ? null : (
							<HUDLabel key={key} label={key} text={value} small={!!i} />
						)
					)
				)}
			</Box>
		</Box>
	)
}

export default HUD
