import * as React from "react"
import {
	MantineProvider,
	createEmotionCache,
	useMantineTheme,
} from "@mantine/core"
import { ThemeProvider } from "@emotion/react"

const solrStylesCache = createEmotionCache({ key: "solr" })

export type StylesProviderProps = { children: React.ReactNode }

const EmotionStylesProvider: React.FC<StylesProviderProps> = ({ children }) => {
	const theme = useMantineTheme()
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

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
			<EmotionStylesProvider>{children}</EmotionStylesProvider>
		</MantineProvider>
	)
}

export default StylesProvider
