import dynamic from "next/dynamic"
import * as React from "react"

import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"

import { useIsMobile } from "@/hooks/useIsMobile"

const Sphere = dynamic(() => import("./Sphere"), { ssr: false })

type SceneProps = {
	baseTexture: string
}

export const Scene: React.FC<SceneProps> = ({ baseTexture }) => {
	const isMobile = useIsMobile()
	return (
		<Canvas dpr={isMobile ? 1 : 2} gl={{ antialias: false }}>
			<Sphere texturePath={baseTexture} />
			<OrbitControls
				autoRotate
				autoRotateSpeed={2}
				enablePan={false}
				enableZoom={true}
			/>
		</Canvas>
	)
}

export default Scene
