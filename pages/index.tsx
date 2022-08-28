import type { NextPage } from "next"
import * as React from "react"

import Hero from "@/components/Hero"

import Layout from "@/components/Layout"
import FadeInOutUp from "@/GSAPAnimation/FadeInOutUp"

const Home: NextPage = () => {
	return (
		<Layout>
			<FadeInOutUp>
				<Hero href="/database" />
			</FadeInOutUp>
		</Layout>
	)
}

export default Home
