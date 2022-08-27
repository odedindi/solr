import ThreeDemo from "@/components/ThreeDemo"
import type { NextPage } from "next"
import * as React from "react"
import * as Three from "three"
import Hero from "@/components/Hero"

import ourDB from "@/db/ourDB.json"
import DBInfo from "@/components/DBInfo"
import dynamic from "next/dynamic"

// import SpringDemo from "@/components/SpringDemo"
const SpringDemo = dynamic(() => import("@/components/SpringDemo"), {
	ssr: false,
})

const Home: NextPage = () => {
	const ref = React.useRef<HTMLDivElement>(undefined!)
	// console.log(ourDB.celestialBodies)
	return (
		<>
			<Hero scrollTo={"#db"} />
			<div ref={ref} style={{ height: "100vh" }}>
				<ThreeDemo />
			</div>
			<div style={{ height: "100vh" }}>
				<SpringDemo />
			</div>

			<div style={{ height: "20vh" }}>
				<DBInfo />
			</div>
		</>
	)
}

export default Home
