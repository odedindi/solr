import * as React from "react"
import ApolloClientProvider from "./Apollo"
import GSAPTransitionProvider from "./GSAPTransition"
import HeadProvider from "./Head"
import LayoutProvider from "./Layout"
import StylesProvider from "./Styles"

export type ProvidersProps = { children: React.ReactNode }

const Providers: React.FC<ProvidersProps> = ({ children }) => {
	return (
		<>
			<ApolloClientProvider>
				<HeadProvider />
				<StylesProvider>
					<GSAPTransitionProvider>
						<LayoutProvider>{children}</LayoutProvider>
					</GSAPTransitionProvider>
				</StylesProvider>
			</ApolloClientProvider>
		</>
	)
}

export default Providers
