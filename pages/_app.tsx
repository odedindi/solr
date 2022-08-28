import Layout from "@/components/Layout"
import type { AppProps } from "next/app"
import Providers from "../src/providers"

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<Providers>
			<Layout>
				<Component {...pageProps} />
			</Layout>
		</Providers>
	)
}

export default MyApp
