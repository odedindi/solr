import * as React from "react"
import { Box, DefaultMantineColor } from "@mantine/core"
import { useGSAPTransition } from "@/providers/GSAPTransition"

export type LayoutProps = {
	children: React.ReactNode
	backgroundColor?: DefaultMantineColor
}

const Layout: React.FC<LayoutProps> = ({ children, backgroundColor }) => {
	const { setBackground } = useGSAPTransition()

	React.useEffect(() => {
		setBackground(backgroundColor || "dark")
	}, [backgroundColor, setBackground])

	return <Box component="main">{children}</Box>
}

export default Layout
