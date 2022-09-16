import * as React from "react"
import { Mesh, MeshBasicMaterial, Texture } from "three"

import { useTexture } from "@react-three/drei"
import { MathUtils } from "three"

import { a } from "@react-spring/three"

type SphereProps = {
	texturePath: string
	posX: number
	posY: number
	posZ: number
	scale: number
}

const Sphere: React.FC<SphereProps> = ({
	texturePath,
	posX,
	posY,
	posZ,
	scale,
}) => {
	const mesh = React.useRef<Mesh>(null!)
	const matRef = React.useRef<MeshBasicMaterial>(null!)

	return (
		<>
			<React.Suspense fallback={null}>
				<a.mesh
					ref={mesh}
					scale={[scale, scale, scale]}
					position={[posX, posY, posZ]}
				>
					<sphereGeometry args={[5, 64, 64]} />
					<meshBasicMaterial
						ref={matRef}
						attach="material"
						map={useTexture(texturePath)}
					/>
				</a.mesh>
			</React.Suspense>
		</>
	)
}

export default Sphere
