import { __Directive } from "graphql"
import {
	makeSchema,
	fieldAuthorizePlugin,
	fieldAuthorizePluginCore
} from "nexus"
import { nexusPrisma } from "nexus-plugin-prisma"
import * as path from "path"
import * as types from "./types"

export default makeSchema({
	types,
	plugins: [
		nexusPrisma({
			//experimentalCRUD: true
		}),
		fieldAuthorizePlugin()
	],
	outputs: {
		typegen: path.join(
			__dirname,
			//"../generated/nexus.ts"
			"../../node_modules/@types/nexus-typegen/index.d.ts"
		),
		schema: path.join(__dirname, "../generated/schema.graphql")
		//schema: path.join(__dirname, "../../node_modules/@types/schema.graphql")
	},
	contextType: {
		module: require.resolve("../context"),
		export: "Context"
	},
	sourceTypes: {
		modules: [
			{
				module: require.resolve(".prisma/client/index.d.ts"),
				alias: "prisma"
			}
		]
	}
})
