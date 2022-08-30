import * as React from "react"
import { Box, DefaultMantineColor } from "@mantine/core"
import { useGSAPTransition } from "@/providers/GSAPTransition"

export type LayoutProps = {
	children: React.ReactNode
	backgroundColor?: DefaultMantineColor
}

const Layout: React.FC<LayoutProps> = ({ children, backgroundColor }) => {
	const [didMount, setDidMount] = React.useState<boolean>(false)
	React.useEffect(() => {
		setDidMount(true)
	}, [])

	const { setBackground } = useGSAPTransition()
	React.useEffect(() => {
		setBackground(backgroundColor || "dark")
	}, [backgroundColor, setBackground])

	const emptyBox = <Box component="main">{null}</Box>
	return didMount ? <Box component="main">{children}</Box> : emptyBox
}

export default Layout
