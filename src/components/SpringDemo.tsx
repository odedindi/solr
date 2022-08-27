import * as React from "react"
import { useSpring, animated, config } from "@react-spring/three"
import { Mesh } from "three"
import { Canvas, useFrame } from "@react-three/fiber"

export type SpringDemoProps = {}

const SpringDemo: React.FC<SpringDemoProps> = () => {
	return (
		<Canvas>
			<ambientLight />
			<pointLight position={[10, 10, 10]} />
			<AnimatedMesh />
		</Canvas>
	)
}

export default SpringDemo

const AnimatedMesh = () => {
	const [active, setActive] = React.useState(false)
	const { scale } = useSpring({
		scale: active ? 1.5 : 1,
		config: config.wobbly,
	})
	const meshRef = React.useRef<Mesh>(null!)

	return (
		<animated.mesh
			scale={scale}
			onClick={() => setActive(!active)}
			ref={meshRef}
		>
			<boxGeometry />
			<meshPhongMaterial color="royalblue" />
		</animated.mesh>
	)
}
