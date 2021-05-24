import { isNonNullType } from "graphql"
import { objectType, extendType, nonNull, intArg, stringArg, list } from "nexus"

import { jwtVerification } from "../../../lib"
// =================== Type =========================

export const Follow = objectType({
	name: "Follow",
	definition(t) {
		t.model.id()
		t.model.follower()
		t.model.userId()
	}
})

// =================== Query =========================

export const FollowQuery = extendType({
	type: "Query",
	definition(t) {
		t.field("findManyFollow", {
			type: list("Follow"),
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id } = userInfo

				const follows = await prisma.follow.findMany({
					where: {
						id
					}
				})
				return follows
			}
		})
	}
})

// =================== Muttation =========================

export const FollowMutatoin = extendType({
	type: "Mutation",
	definition(t) {
		t.field("createFollow", {
			type: "Follow",
			args: {
				followerId: nonNull(intArg())
			},
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id } = userInfo
				const { followerId } = args

				const createdFollow = await prisma.follow.create({
					data: {
						userId: id,
						follower: followerId
					}
				})
				console.log(createdFollow)
				return createdFollow
			}
		})
		t.field("deleteFollow", {
			type: "Follow",
			args: {
				followId: nonNull(intArg())
			},
			description: "followerId가 아니라 followId입니다!",
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			resolve: async (_root, args, ctx) => {
				const { prisma } = ctx
				const { followId } = args

				const deletedFollow = await prisma.follow.delete({
					where: {
						id: followId
					}
				})

				return deletedFollow
			}
		})
	}
})
