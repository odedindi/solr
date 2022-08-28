import * as React from "react"
import { createStyles, Container, Title, Text, Button } from "@mantine/core"

import gsap from "gsap"
import ScrollToPlugin from "gsap/dist/ScrollToPlugin"
import Link from "next/link"
import ScaleInOut from "@/GSAPAnimation/ScaleInOut"

export type HeroProps = {
	scrollTo?: gsap.TweenVars["scrollTo"]
	href?: string
}

const useStyles = createStyles((theme) => ({
	root: {
		backgroundSize: "cover",
		backgroundPosition: "center",
		backgroundImage: `linear-gradient(250deg, rgba(130, 201, 30, 0) 0%, #062343 65%), url(assets/textures/sun_detailed.jpg)`,
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
		borderRadius: 50,
	},
}))

const Hero: React.FC<HeroProps> = ({ href, scrollTo }) => {
	React.useEffect(() => {
		gsap.registerPlugin(ScrollToPlugin)
	}, [])
	const { classes } = useStyles()

	const handleGetStarted: React.MouseEventHandler<HTMLButtonElement> = (_e) => {
		gsap.to(window, {
			duration: 1.5,
			scrollTo: scrollTo,
			ease: "power2",
		})
	}

	return (
		<div className={classes.root}>
			<Container size="lg">
				<Text
					sx={{ position: "absolute", top: 10, fontWeight: "bold" }}
					pb={25}
				>
					<ScaleInOut delay={1} skipOutro={false}>
						Klassenlager 2022
					</ScaleInOut>
				</Text>
				<div className={classes.inner}>
					<div className={classes.content}>
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
						<Text className={classes.description}>
							Jan Hric & Oded Winberger
						</Text>
						{href ? (
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
						) : (
							<Button
								variant="gradient"
								gradient={{ from: "yellow", to: "red" }}
								size="xl"
								className={classes.control}
								mt={40}
								onClick={handleGetStarted}
							>
								Get started
							</Button>
						)}
					</div>
				</div>
			</Container>
		</div>
	)
}

export default Hero
