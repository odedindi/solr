import * as React from "react"
import {
	Container,
	Center,
	DefaultMantineColor,
	Loader as MantineLoader,
} from "@mantine/core"

export type LoaderProps = {
	color?: DefaultMantineColor
}

const Loader: React.FC<LoaderProps> = ({ color }) => {
	return (
		<Container fluid>
			<Center sx={{ height: "100vh" }}>
				<MantineLoader color={color ?? "orange"} variant="bars" />
			</Center>
		</Container>
	)
}

export default Loader
