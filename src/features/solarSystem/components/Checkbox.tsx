import { type FC } from "react"
import { Checkbox as MantineCheckbox, CheckboxProps } from "@mantine/core"

const Checkbox: FC<Omit<CheckboxProps, "size" | "color">> = (props) => (
	<MantineCheckbox size={"lg"} color={"orange.7"} {...props} />
)

export default Checkbox
