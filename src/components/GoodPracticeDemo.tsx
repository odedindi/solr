import * as React from "react"
import { Box } from "@mantine/core"
import { Canvas, useFrame } from "@react-three/fiber"

export type GoodPracticeDemoProps = {}

const GoodPracticeDemo: React.FC<GoodPracticeDemoProps> = () => {
	return (
		<Canvas>
			<ambientLight />
			<pointLight position={[10, 10, 10]} />
			<mesh
				visible
				userData={{ hello: "world" }}
				position={[1, 2, 3]}
				rotation={[Math.PI / 2, 0, 0]}
			>
				<sphereGeometry args={[1, 16, 16]} />
				<meshStandardMaterial color="hotpink" transparent />
			</mesh>
		</Canvas>
	)
}

export default GoodPracticeDemo
