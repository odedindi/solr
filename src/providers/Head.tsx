import Head from 'next/head'
import * as React from 'react'

export type HeadProviderProps = {}

const HeadProvider: React.FC<HeadProviderProps> = () => (
	<Head>
		<title>Solr</title>
		<meta
			name="viewport"
			content="minimum-scale=1, initial-scale=1, width=device-width"
		/>
	</Head>
)

export default HeadProvider
