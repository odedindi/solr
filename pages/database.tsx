import ThreeDemo from "@/components/ThreeDemo"
import type { NextPage } from "next"
import * as React from "react"

import DBInfo from "@/components/DBInfo"

import FadeInOutUp from "@/GSAPAnimation/FadeInOutUp"

const Database: NextPage = () => {
	const ref = React.useRef<HTMLDivElement>(undefined!)
	return (
		<>
			<FadeInOutUp>
				<div style={{ height: "100vh" }}>
					<ThreeDemo />
				</div>

				<div ref={ref} style={{ height: "20vh" }}>
					<DBInfo />
				</div>
			</FadeInOutUp>
		</>
	)
}

export default Database
