import { FC } from "react"
import { Anchor, Text } from "@mantine/core"
import { InfoCircle } from "tabler-icons-react"

const RedGiantsMark: FC<{ showMark?: boolean }> = ({ showMark }) => (
	<Text sx={{ textAlign: "center" }}>
		Red Giant
		<br />
		{showMark ? (
			<Anchor
				href="https://bigthink.com/starts-with-a-bang/big-sun-grow/"
				target="_blank"
				rel="noopener noreferrer"
				color="orange"
				sx={{
					position: "relative",
					top: "-5.5rem",
				}}
			>
				<InfoCircle size={24} />
			</Anchor>
		) : null}
	</Text>
)

export default RedGiantsMark
