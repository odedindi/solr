import * as React from "react"

import { Canvas, useFrame } from "@react-three/fiber"
import { PerspectiveCamera } from "@react-three/drei"
import { Mesh, MeshStandardMaterial, SphereBufferGeometry } from "three"

export type ThreeDemoProps = {}

const ThreeDemo: React.FC<ThreeDemoProps> = () => {
	return (
		<Canvas>
			<ambientLight />
			<pointLight position={[10, 10, 10]} />
			<Sphere />
		</Canvas>
	)
}

export default ThreeDemo

function Sphere() {
	const meshRef = React.useRef<Mesh>(undefined!)
	//
	const geom = React.useMemo(() => new SphereBufferGeometry(), [])
	const mat = React.useMemo(
		() => new MeshStandardMaterial({ color: "blue" }),
		[]
	)

	useFrame((state, delta) => {
		if (!meshRef.current) return

		meshRef.current.rotation.x += delta
		meshRef.current.rotation.y += 0.01
	})

	return (
		<mesh ref={meshRef} geometry={geom} material={mat}>
			<PerspectiveCamera />
			{/* <sphereGeometry /> */}
			{/* <meshStandardMaterial color="blue" /> */}
		</mesh>
	)
}
