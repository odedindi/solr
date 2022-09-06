import * as React from "react"
import { Box, createStyles, DefaultMantineColor } from "@mantine/core"
import { useGSAPTransition } from "@/providers/GSAPTransition"
import FadeInOutUp from "@/GSAPAnimation/FadeInOutUp"

export type LayoutProps = {
	children: React.ReactNode
	backgroundColor?: DefaultMantineColor
}

const useStyles = createStyles(() => ({
	main: {
		minWidth: "768px",
	},
}))

const Layout: React.FC<LayoutProps> = ({ children, backgroundColor }) => {
	const [didMount, setDidMount] = React.useState<boolean>(false)
	React.useEffect(() => {
		setDidMount(true)
	}, [])

	const { setBackground } = useGSAPTransition()
	React.useEffect(() => {
		setBackground(backgroundColor || "dark")
	}, [backgroundColor, setBackground])

	const { classes } = useStyles()
	const emptyBox = <Box component="main">{null}</Box>
	return didMount ? (
		<FadeInOutUp>
			<Box component="main" className={classes.main}>
				{children}
			</Box>
		</FadeInOutUp>
	) : (
		emptyBox
	)
}

export default Layout
