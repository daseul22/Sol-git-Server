import { isNonNullType } from "graphql"
import {
	objectType,
	extendType,
	nonNull,
	intArg,
	stringArg,
	list,
	arg,
	inputObjectType,
	interfaceType
} from "nexus"

// =================== Type =========================

export const Tag = objectType({
	name: "Tag",
	definition(t) {
		t.model.id()
		t.model.tag()
		t.model.kind()
	}
})
// =================== Query =========================

export const TagQuery = extendType({
	type: "Query",
	definition(t) {
		type k = {
			kind: String | null | undefined
		}

		t.field("findManyTag", {
			type: list("Tag"),
			args: {
				kind: stringArg()
			},
			resolve: async (_root, args, ctx) => {
				const { prisma } = ctx
				const kind: k | {} = args
				const tags = await prisma.tag.findMany({
					where: kind
				})
				console.log(tags)
				return tags
			}
		})
	}
})

// =================== Muttation =========================

export const TagsInput = inputObjectType({
	name: "TagInput",
	definition(t) {
		t.nonNull.string("tag")
		t.nonNull.string("kind")
	}
})

export const TagMutatoin = extendType({
	type: "Mutation",
	definition(t) {
		t.field("createTags", {
			type: "String",
			args: {
				tags: nonNull(
					list(
						nonNull(
							arg({
								type: "TagInput",
								description: "태그를 생성하기 위한 배열"
							})
						)
					)
				)
			},
			resolve: async (_root, { tags }, { prisma }) => {
				const tag = await prisma.tag.createMany({
					data: tags
				})
				return "태그 등록 성공"
			}
		})
	}
})

// =================== Query =========================

// export const TagQuery = extendType({
// 	type: "Query",
// 	definition(t) {
// 		t.list.field("findManyPost", {
// 			type: "Post",
// 			args: {
// 				userId: nonNull(intArg())
// 			},
// 			authorize: async (root, args, ctx) => {
// 				await ctx.auth(ctx)
// 				return true
// 			},
// 			resolve: async (root, { userId }, ctx) => {
// 				let post = await ctx.prisma.post.findMany({
// 					where: {
// 						userId
// 					}
// 				})
// 				return post
// 			}
// 		})
// 	}
// })

// =================== Muttation =========================

// export const TagMutatoin = extendType({
// 	type: "Mutation",
// 	definition(t) {}
// })
