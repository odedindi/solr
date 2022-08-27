import { MicroRequest } from "apollo-server-micro/dist/types"
import { ServerResponse } from "http"

import { server } from "@/graphql/apolloServer"

const allowCors = (fn: any) => async (req: any, res: any) => {
	res.setHeader("Access-Control-Allow-Credentials", true)
	res.setHeader(
		"Access-Control-Allow-Origin",
		"https://studio.apollographql.com"
	)

	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET,OPTIONS,PATCH,DELETE,POST,PUT"
	)
	res.setHeader("Access-Control-Allow-Headers", "*")
	if (req.method === "OPTIONS") {
		res.status(200).end()
		return
	}
	return await fn(req, res)
}

const startServer = server.start()

async function handler(req: MicroRequest, res: ServerResponse) {
	await startServer
	await server.createHandler({
		path: "/api/graphql",
	})(req, res)
}
export const config = {
	api: {
		bodyParser: false,
	},
}
export default allowCors(handler)
