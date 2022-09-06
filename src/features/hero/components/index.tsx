import dynamic from "next/dynamic"
import * as React from "react"
import { createStyles, Box } from "@mantine/core"

import LeftSection from "./LeftSection"
import Scene from "../THREE/Scene"

export type HeroProps = {
	href: string
}

const useStyles = createStyles((theme) => ({
	root: {
		paddingTop: theme.spacing.xl * 15,
		paddingBottom: theme.spacing.xl * 5,
		height: "100vh",
	},
}))

const Hero: React.FC<HeroProps> = ({ href }) => {
	const { classes } = useStyles()
	return (
		<Box className={classes.root}>
			<LeftSection href={href} />
			<Scene />
		</Box>
	)
}

export default Hero
