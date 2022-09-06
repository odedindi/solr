import { Dpr } from "@react-three/fiber"
import * as React from "react"

export const useDevicePixelRatio = () => {
	const [dpr, setDpr] = React.useState<Dpr>(1)

	React.useEffect(() => {
		setDpr(window.devicePixelRatio)
	}, [])

	return dpr
}
