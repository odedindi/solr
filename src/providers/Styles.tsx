import * as React from "react"
import {
	MantineProvider,
	ColorSchemeProvider,
	ColorScheme,
	createEmotionCache,
} from "@mantine/core"
import { useColorScheme, useHotkeys, useLocalStorage } from "@mantine/hooks"

const solrStylesCache = createEmotionCache({ key: "solr" })

export type StylesProviderProps = { children: React.ReactNode }

const StylesProvider: React.FC<StylesProviderProps> = ({ children }) => {
	const preferredColorScheme = useColorScheme("dark")

	const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
		key: "solr-color-scheme",
		defaultValue: preferredColorScheme,
		getInitialValueInEffect: true,
	})

	const toggleColorScheme = (value?: ColorScheme) =>
		setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"))

	useHotkeys([["mod+J", () => toggleColorScheme()]])
	return (
		<ColorSchemeProvider
			colorScheme={colorScheme}
			toggleColorScheme={toggleColorScheme}
		>
			<MantineProvider
				emotionCache={solrStylesCache}
				withGlobalStyles
				withNormalizeCSS
				theme={{
					colorScheme,
				}}
			>
				{children}
			</MantineProvider>
		</ColorSchemeProvider>
	)
}

export default StylesProvider
