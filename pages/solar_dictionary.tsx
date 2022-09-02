import type { NextPage } from "next"
import * as React from "react"

import Hero from "@/components/Hero"

import Layout from "@/components/Layout"
import FadeInOutUp from "@/GSAPAnimation/FadeInOutUp"
import HUD from "@/components/HUD"
import type { HUDLabelProps } from "@/components/HUDLabel"

const Home: NextPage = () => {
	const labels: { [key: string]: string }[] = [
		{
			Name: "Sun",
		},
	]

	return (
		<Layout>
			<FadeInOutUp>
				<HUD labels={labels}>bob</HUD>
			</FadeInOutUp>
		</Layout>
	)
}

export default Home
