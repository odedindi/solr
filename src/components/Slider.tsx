import * as React from "react"
import { Box } from "@mantine/core"

import * as THREE from "three"

import { ShaderMaterial, Texture } from "three"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

import gsap from "gsap"

export interface Effects {
	material: ShaderMaterial
	images: Texture[]
}

export interface Animal {
	url: string
	species: string
	age: number
	bio: string
}

export const SliderEffect = (opts: {
	parent: HTMLElement
	images: Element[]
}): Effects => {
	const vertex = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 0.7 );
      }
  `

	const fragment = `
      varying vec2 vUv;
      uniform sampler2D currentImage;
      uniform sampler2D nextImage;
      uniform float dispFactor;
      void main() {
          vec2 uv = vUv;
          vec4 _currentImage;
          vec4 _nextImage;
          float intensity = 0.6;
          vec4 orig1 = texture2D(currentImage, uv);
          vec4 orig2 = texture2D(nextImage, uv);
          
          _currentImage = texture2D(currentImage, vec2(uv.x, uv.y + dispFactor * (orig2 * intensity)));
          _nextImage = texture2D(nextImage, vec2(uv.x, uv.y + (1.0 - dispFactor) * (orig1 * intensity)));
          vec4 finalTexture = mix(_currentImage, _nextImage, dispFactor);
          gl_FragColor = finalTexture;
      }
  `

	const images = opts.images
	let image: Texture
	const sliderImages: Texture[] = []
	const canvasWidth = images[0].clientWidth
	const canvasHeight = images[0].clientHeight
	const parent = opts.parent
	const renderWidth = window.innerWidth
	const renderHeight = window.innerHeight

	const renderW: number = renderWidth > canvasWidth ? renderWidth : canvasWidth
	const renderH: number = canvasHeight

	const renderer = new THREE.WebGLRenderer({ antialias: false })

	renderer.setClearColor(0x23272a, 1.0)
	renderer.setSize(renderW, renderH)
	parent.appendChild(renderer.domElement)

	const loader = new THREE.TextureLoader()
	loader.crossOrigin = "anonymous"

	images.forEach((img: Element) => {
		image = loader.load(`${img?.getAttribute("src")}?v=${Date.now()}`)
		image.magFilter = image.minFilter = THREE.LinearFilter
		image.anisotropy = renderer.capabilities.getMaxAnisotropy()
		sliderImages.push(image)
	})

	const scene = new THREE.Scene()
	scene.background = new THREE.Color(0x23272a)
	const camera = new THREE.OrthographicCamera(
		renderWidth / -2,
		renderWidth / 2,
		renderHeight / 2,
		renderHeight / -2,
		1,
		1000
	)
	camera.position.z = 2

	const material = new THREE.ShaderMaterial({
		uniforms: {
			dispFactor: { value: 0.0 },
			currentImage: { value: sliderImages[0] },
			nextImage: { value: sliderImages[1] },
		},
		vertexShader: vertex,
		fragmentShader: fragment,
		transparent: true,
		opacity: 1.0,
	})

	const geometry = new THREE.PlaneBufferGeometry(
		parent.offsetWidth,
		parent.offsetHeight,
		1
	)
	const object = new THREE.Mesh(geometry, material)
	object.position.set(0, 0, 0)
	scene.add(object)

	const onResize = (_e: UIEvent) => renderer.setSize(renderW, renderH)

	window.addEventListener("resize", onResize)

	const animate = () => {
		requestAnimationFrame(animate)

		renderer.render(scene, camera)
	}
	animate()

	window.removeEventListener("resize", onResize)
	return {
		material,
		images: sliderImages,
	}
}

const blurInUp = keyframes`
  0%   { 
      transform: translate(0px, 25px);
      -filter: blur(10px);
      -webkit-filter: blur(10px);
  }
  25% {
      transform: translate(0px, 20px);
      
  }
  50% {
      transform: translate(0px, 15px);
      
  }
  75% {
      transform: translate(0px, 10px);
      -filter: blur(5px);
      -webkit-filter: blur(5px);
  }
  85% {
    transform: translate(0px, 5px);
    -filter: blur(3px);
    -webkit-filter: blur(3px);
  }
  100% {
    transform: translate(0px, 0px);
    -filter: blur(0px);
    -webkit-filter: blur(0px);
  }
    `

const Base = styled.div`
	width: 100vh;
	height: 100vh;

	.landing__image {
		height: 100%;
		width: 0;
		position: relative;
		z-index: -1;
		object-fit: cover;
	}

	canvas {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 2;
	}

	@media (max-width: 841px) {
		.landing__animal-1,
		.landing__animal-2 {
			display: none;
		}
	}
`

const HUDContainer = styled.div`
	position: absolute;
	top: 10vw;
	left: 15vw;
	font-family: "arial";
	width: 20%;
	display: flex;
	flex-direction: column;
	z-index: 3;

	@media (max-width: 841px) {
		top: 15vw;
	}

	@media (max-width: 515px) {
		top: 20vw;
	}
`
const LabelContainer = styled.div`
	letter-spacing: 4px;
	font-size: 12px;
	color: gray;
	display: flex;
	flex-direction: row;
	align-items: center;
`
const LabelBar = styled.span`
	margin: 0 5px 0 1px;
	width: 30px;
	height: 2.5px;
	background-color: gray;
`
const Text = styled.span`
	font-size: 30px;
	color: white;
	font-weight: bold;

	padding: 20px 0 30px;
	letter-spacing: 1px;
	opacity: 1;
	animation: ${blurInUp} 0.8s;
`
const SmallText = styled(Text)`
	font-size: 20px;
`
const Label: React.FC<{
	id: string
	label: string
	text: string | number
	small?: boolean
}> = ({ id, label, text, small }) => (
	<>
		<LabelContainer>
			<LabelBar />
			{label}
			<LabelBar />
		</LabelContainer>
		{small ? (
			<SmallText id={id}>{text}</SmallText>
		) : (
			<Text id={id}>{text}</Text>
		)}
	</>
)

type LandingProps = {
	item: number
	animals: Animal[]
}

export const Landing: React.FC<LandingProps> = ({ item, animals }) => {
	const [effects, setEffects] = React.useState<Effects>()
	const landingRef = React.useRef<HTMLDivElement>(null!)
	const imagesRef = React.useRef<HTMLImageElement[]>([])
	const imageRef = (ref: HTMLImageElement) => {
		if (!imagesRef.current.includes(ref)) imagesRef.current.push(ref)
	}
	React.useEffect(() => {
		if (landingRef.current && imagesRef.current) {
			const effects = SliderEffect({
				parent: landingRef.current,
				images: imagesRef.current,
			})
			setEffects(effects)
		}
	}, [])

	React.useEffect(() => {
		if (effects) {
			effects.material.uniforms.nextImage.value = effects.images[item]
			gsap
				.to(effects.material.uniforms.dispFactor, {
					value: 1,
					ease: "Expo.easeOut",
					onComplete: () => {
						effects.material.uniforms.currentImage.value = effects.images[item]
						effects.material.uniforms.dispFactor.value = 0.0
					},
				})
				.duration(0.5)
		}
	}, [item, effects])

	return (
		<Base ref={landingRef}>
			{animals.map((animal, index) => (
				<div
					style={{ width: "100%", height: "100%" }}
					key={index}
					hidden={index !== item}
				>
					{/* <img
						src={animal.url}
						className="landing__image"
						alt="Animal"
						ref={imageRef}
					></img> */}
					<HUDContainer>
						<Label id="title" label="SPECIES" text={animal.species} />
						<Label id="age" label="AGE" text={animal.age} small />
						<Label id="bio" label="Bio" text={animal.bio} small />
					</HUDContainer>
				</div>
			))}
		</Base>
	)
}

const SliderRoot = styled.div<{ topShift: number }>`
	position: absolute;
	right: 10%;
	z-index: 10;
	top: ${({ topShift }) => `calc(50% - ${topShift * 35}px)`};
`

const SliderItem = styled.div<{ isActive: boolean }>`
	width: 16px;
	height: 16px;
	background-color: ${({ isActive }) => (isActive ? "white" : "gray")};
	margin-bottom: 25px;
	border-radius: 100%;
	cursor: pointer;
	position: relative;

	&:before {
		content: "";
		display: block;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 100%;
		border: 2px solid rgba(255, 255, 255, 0.2);
		opacity: ${({ isActive }) => (isActive ? 1 : 0)};
		transition: opacity 0.2s ease-in, width 0.3s ease-in, height 0.3s ease-in;

		width: ${({ isActive }) => (isActive ? "250%" : "100%")};
		height: ${({ isActive }) => (isActive ? "250%" : "100%")};
	}
`

export type SliderProps = {
	size: number
	onItem: (index: number) => void
}

export const Slider: React.FC<SliderProps> = ({ size, onItem }) => {
	const [active, setActive] = React.useState<number>(0)

	return (
		<SliderRoot topShift={size}>
			{[...Array(size)].map((_, i) => (
				<SliderItem
					isActive={i === active}
					key={i}
					onClick={() => {
						setActive(i)
						onItem(i)
					}}
				/>
			))}
		</SliderRoot>
	)
}

export default Slider
