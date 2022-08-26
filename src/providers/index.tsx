import * as React from "react"
import HeadProvider from "./Head"
import StylesProvider from "./Styles"

export type ProvidersProps = { children: React.ReactNode }

const Providers: React.FC<ProvidersProps> = ({ children }) => {
	return (
		<>
			<HeadProvider />
			<StylesProvider>{children}</StylesProvider>
		</>
	)
}

export default Providers
