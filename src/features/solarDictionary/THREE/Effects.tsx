import * as React from "react"

import {
	EffectComposer,
	DepthOfField,
	Noise,
	Glitch,
} from "@react-three/postprocessing"
import { GlitchMode } from "postprocessing"

import { BlendFunction } from "postprocessing"

import * as THREE from "three"

import CircleLens from "./effects/CircleLens"
import { useWindowSize } from "@/hooks/useWindowSize"

export const Effects: React.FC = () => {
	const { height } = useWindowSize()

	return (
		<EffectComposer multisampling={0}>
			<DepthOfField
				focusDistance={0.31}
				focalLength={0.05}
				bokehScale={1.1}
				height={height}
				blendFunction={BlendFunction.AVERAGE}
				blur={1}
			/>

			<Glitch
				delay={new THREE.Vector2(5.5, 2.5)}
				duration={new THREE.Vector2(0.1, 0.5)}
				strength={new THREE.Vector2(0.01, 0.02)}
				mode={GlitchMode.SPORADIC}
				active
				ratio={0.1}
			/>

			<Noise opacity={0.425} />
			<CircleLens fragments={7} />
		</EffectComposer>
	)
}

export default Effects
