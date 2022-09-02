import * as React from "react"
import { MantineProvider, createEmotionCache } from "@mantine/core"

const solrStylesCache = createEmotionCache({ key: "solr" })

export type StylesProviderProps = { children: React.ReactNode }

const StylesProvider: React.FC<StylesProviderProps> = ({ children }) => {
	return (
		<MantineProvider
			emotionCache={solrStylesCache}
			withGlobalStyles
			withNormalizeCSS
			theme={{
				colorScheme: "dark",
			}}
		>
			{children}
		</MantineProvider>
	)
}

export default StylesProvider
