import * as React from "react";
import gsap from "gsap"

import { Box } from "@mantine/core";
import type {  BoxProps } from "@mantine/core";
import { PolymorphicComponentProps } from "@mantine/utils"

export type {{name}}Props<C = "div"> = PolymorphicComponentProps<
	C,
	BoxProps
> & {
  	children: React.ReactNode
}

const {{name}}: React.FC<{{name}}Props> = ({children, component, ...props}) => {

  return (
  <Box {...props}>
    {children}
  </Box>
);}


export default {{name}}
