import { isNonNullType } from "graphql"
import { objectType, extendType, nonNull, intArg, stringArg } from "nexus"

// =================== Type =========================

export const __ = objectType({
	name: "__",
	definition(t) {
		//t.model.id()
	}
})

// =================== Query =========================

export const __Query = extendType({
	type: "Query",
	definition(t) {}
})

// =================== Muttation =========================

export const __Mutatoin = extendType({
	type: "Mutation",
	definition(t) {}
})
