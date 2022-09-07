import * as React from "react"

export const useWindowSize = (): { height?: number; width?: number } => {
	const [windowDimensions, setWindowDimensions] = React.useState<{
		height?: number
		width?: number
	}>({})

	React.useEffect(() => {
		function getWindowDimensions() {
			const { innerWidth: width, innerHeight: height } = window
			return { width, height }
		}
		function handleResize() {
			const { height, width } = getWindowDimensions()
			setWindowDimensions({ height, width })
		}

		window.addEventListener("resize", handleResize)
		return () => {
			window.removeEventListener("resize", handleResize)
		}
	}, [])

	return windowDimensions
}
