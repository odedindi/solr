import * as React from "react"
import Link from "next/link"
import {
	createStyles,
	Container,
	Title,
	Text,
	Button,
	Box,
} from "@mantine/core"

import ScaleInOut from "@/GSAPAnimation/ScaleInOut"

export type HeroProps = {
	href: string
}

const useStyles = createStyles((theme) => ({
	inner: {
		display: "flex",
		justifyContent: "flex-start",
	},

	content: {
		paddingTop: theme.spacing.xl * 2,
		paddingBottom: theme.spacing.xl * 2,
	},

	title: {
		color: theme.white,
		fontFamily: `Greycliff CF, ${theme.fontFamily}`,
		fontWeight: 900,
		lineHeight: 1.05,
		maxWidth: 500,
		fontSize: 48,
	},

	description: {
		color: theme.white,
		opacity: 0.75,
		maxWidth: 500,
	},

	control: {
		paddingLeft: 50,
		paddingRight: 50,
		fontFamily: `Greycliff CF, ${theme.fontFamily}`,
		fontSize: 22,
	},
}))
export type LeftSectionProps = { href: string }

const LeftSection: React.FC<LeftSectionProps> = ({ href }) => {
	const { classes } = useStyles()

	return (
		<Container
			size="xl"
			sx={{ position: "absolute", top: 50, left: 30, zIndex: 1 }}
		>
			<Text
				sx={(theme) => ({
					fontWeight: "bold",
					color: theme.white,
				})}
				pb={25}
			>
				<ScaleInOut delay={1} skipOutro={false}>
					Klassenlager 2022
				</ScaleInOut>
			</Text>
			<Box className={classes.inner}>
				<Box className={classes.content}>
					<Title>
						<Text
							component="span"
							variant="gradient"
							gradient={{ from: "red", to: "yellow" }}
						>
							Solr
						</Text>
					</Title>
					<Title className={classes.title}>Solar System Model</Title>
					<Text className={classes.description} mt={30}>
						Made with great love and passion for the stars
					</Text>
					<Text className={classes.description}>Jan Hric & Oded Winberger</Text>

					<Link href={href}>
						<Button
							variant="gradient"
							gradient={{ from: "yellow", to: "red" }}
							size="xl"
							className={classes.control}
							mt={40}
						>
							Get started
						</Button>
					</Link>
				</Box>
			</Box>
		</Container>
	)
}
export default LeftSection
