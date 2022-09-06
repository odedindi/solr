import type { NextPage } from "next"

import Layout from "@/components/Layout"
import Hero from "@/features/hero/components"

const Home: NextPage = () => {
	return (
		<Layout>
			<Hero href="/solar_dictionary/0" />
		</Layout>
	)
}

export default Home
