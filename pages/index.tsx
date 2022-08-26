import type { NextPage } from "next"
import Hero from "../src/components/Hero"

const Home: NextPage = () => {
	return (
		<>
			<Hero />
			<div id="red" style={{ height: "100vh", backgroundColor: "red" }}></div>
			<div
				id="green"
				style={{ height: "100vh", backgroundColor: "green" }}
			></div>
			<div id="blue" style={{ height: "100vh", backgroundColor: "blue" }}></div>
		</>
	)
}

export default Home
