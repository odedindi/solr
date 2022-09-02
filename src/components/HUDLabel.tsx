import * as React from "react"
import { Box, createStyles, keyframes, Text } from "@mantine/core"

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

const useStyles = createStyles(() => ({
	labelContainer: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		letterSpacing: "4px",
		fontSize: "12px",
		color: "gray",
		textTransform: "uppercase",
	},
	littleBar: {
		margin: "0 5px 0 1px",
		width: "30px",
		height: "2.5px",
		backgroundColor: "gray",
	},

	text: {
		fontSize: "30px",
		color: "white",
		fontWeight: "bold",
		padding: "20px 0 30px",
		letterSpacing: "1px",
		opacity: "1",
		animation: `${blurInUp} 0.8s`,
	},
	smallText: {
		fontSize: "20px",
	},
}))
export type HUDLabelProps = {
	label?: string | number | null
	text?: string | number | null
	small?: boolean
}

const HUDLabel: React.FC<HUDLabelProps> = ({ label, text, small }) => {
	const { classes, cx } = useStyles()
	if (!label && !text) return null
	return (
		<Box>
			<Box className={classes.labelContainer}>
				<Box className={classes.littleBar} />
				{label}
				<Box className={classes.littleBar} />
			</Box>

			<Text className={cx(classes.text, { [classes.smallText]: !!small })}>
				{text}
			</Text>
		</Box>
	)
}

export default HUDLabel
