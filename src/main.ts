require("dotenv").config()
import { ApolloServer } from "apollo-server"
import schema from "./schema"
import { createContext } from "./context"

const { PORT, N_ENV } = process.env

const server = new ApolloServer({
	schema,
	context: createContext,
	playground: false,
	cors: {
		origin: [
			"http://localhost:3000",
			"http://localhost",
			"https://localhost",
			"https://sol-git.ga"
		],
		methods: ["GET", "POST"],
		credentials: true
	}
})

function main() {
	server.listen(PORT).then(({ url }) => {
		console.log(`server ready at ${url}`)
	})
}

main()

setTimeout(() => {
	if (!N_ENV) {
		server.stop()
	}
}, 5000)
