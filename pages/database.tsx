import ThreeDemo from "@/components/ThreeDemo"
import type { NextPage } from "next"
import * as React from "react"

import DBInfo from "@/components/DBInfo"

const Database: NextPage = () => {
	const ref = React.useRef<HTMLDivElement>(undefined!)
	return (
		<>
			<div style={{ height: "100vh" }}>
				<ThreeDemo />
			</div>

			<div ref={ref} style={{ height: "20vh" }}>
				<DBInfo />
			</div>
		</>
	)
}

export default Database
