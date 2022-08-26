import * as React from "react"
import { createStyles, Container, Title, Text, Button } from "@mantine/core"

import gsap from "gsap"
import ScrollToPlugin from "gsap/dist/ScrollToPlugin"

const useStyles = createStyles((theme) => ({
	root: {
		backgroundSize: "cover",
		backgroundPosition: "center",
		backgroundImage:
			"linear-gradient(250deg, rgba(130, 201, 30, 0) 0%, #062343 90%), url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80)",
		paddingTop: theme.spacing.xl * 15,
		paddingBottom: theme.spacing.xl * 5,
		height: "100vh",
	},

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

export default function Hero() {
	React.useEffect(() => {
		gsap.registerPlugin(ScrollToPlugin)
	}, [])
	const { classes } = useStyles()
	return (
		<div className={classes.root}>
			<Container size="lg">
				<div className={classes.inner}>
					<div className={classes.content}>
						<Title className={classes.title} pb={25}>
							Klassenlager 2022{" "}
						</Title>
						<Title>
							<Text
								component="span"
								variant="gradient"
								gradient={{ from: "pink", to: "yellow" }}
							>
								Solr
							</Text>
						</Title>
						<Title className={classes.title}>Solar System Model</Title>
						<Text className={classes.description} mt={30}>
							Made with great love and passion for the stars
						</Text>
						<Text className={classes.description}>
							Jan Hric & Oded Winberger
						</Text>
						<Button
							variant="gradient"
							gradient={{ from: "pink", to: "yellow" }}
							size="xl"
							className={classes.control}
							mt={40}
							onClick={() => {
								gsap.to(window, {
									duration: 2,
									scrollTo: "#green",
									ease: "power3",
								})
							}}
						>
							Get started
						</Button>
					</div>
				</div>
			</Container>
		</div>
	)
}
