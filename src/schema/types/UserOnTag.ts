import { isNonNullType } from "graphql"
import { objectType, extendType, nonNull, intArg, stringArg } from "nexus"

// =================== Type =========================

export const UserOnTag = objectType({
	name: "UserOnTag",
	definition(t) {
		t.model.id()
		t.model.tagId()
		t.model.Tag()
		t.model.userId()
		t.model.User()
	}
})

// =================== Query =========================

export const UserOnTagQuery = extendType({
	type: "Query",
	definition(t) {}
})

// =================== Muttation =========================

export const UserOnTagMutatoin = extendType({
	type: "Mutation",
	definition(t) {}
})
