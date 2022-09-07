import Head from "next/head"
import * as React from "react"

export type HeadProviderProps = {}

const HeadProvider: React.FC<HeadProviderProps> = () => (
	<Head>
		<link rel="icon" href="/favicon.ico" type="image/svg+xml" />
		<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
		<link rel="manifest" href="/manifest.json" />
		<link rel="shortcut icon" href="/favicon.ico" />

		<meta name="application-name" content="Solr - Our Solar System" />
		<meta
			name="description"
			content="dictionary and model of our solar system"
		/>
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="default" />
		<meta name="apple-mobile-web-app-title" content="PWA App" />
		<meta name="mobile-web-app-capable" content="yes" />

		<title>Solr</title>
		<meta
			name="viewport"
			content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
		/>
	</Head>
)

export default HeadProvider
