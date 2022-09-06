import dynamic from "next/dynamic"
import * as React from "react"

import { Stats } from "@react-three/drei"
import { Canvas, Dpr } from "@react-three/fiber"
import { Effects } from "../THREE/Effects"
import { useDevicePixelRatio } from "@/hooks/useDevicePixelRatio"

const Sphere = dynamic(() => import("../THREE/Sun"), { ssr: false })

export const Scene: React.FC = () => {
	const dpr = useDevicePixelRatio()
	return (
		<Canvas dpr={dpr} gl={{ antialias: false }}>
			<Sphere />
			<Effects />
			{process.env.NODE_ENV === "development" && <Stats />}
		</Canvas>
	)
}

export default Scene
