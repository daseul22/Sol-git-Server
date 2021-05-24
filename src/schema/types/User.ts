import {
	objectType,
	extendType,
	idArg,
	intArg,
	stringArg,
	nonNull,
	nullable,
	inputObjectType,
	arg,
	list,
	booleanArg
} from "nexus"
import { ApolloError } from "apollo-server"
import {
	tokenGenerator,
	getCookieValue,
	requestGoogleUser,
	requestGoogleUserAccount,
	jwtVerification
} from "../../../lib"
import axios from "axios"
// =================== Type =========================

export const User = objectType({
	name: "User",
	definition(t) {
		t.model.id()
		t.model.name()
		t.model.email()
		t.model.profileUrl()
		t.model.introduce()
		t.model.originJob()
		t.model.interestJob()
		t.model.work()
		t.model.company()
		t.boolean("isFollow")
		t.field("tags", {
			type: list("Tag"),
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				//const { id } = userInfo
				const { id } = _root

				const tags = await prisma.tag.findMany({
					where: {
						users: {
							some: {
								userId: id
							}
						}
					}
				})
				console.log(tags)
				return tags
			}
		})
	}
})

// =================== Query =========================

export const UserQuery = extendType({
	type: "Query",
	definition(t) {
		t.field("findOneUser", {
			type: "User",
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			args: {
				userId: intArg({ description: "찾고자하는 유저 ID 입니다" })
			},
			resolve: async (_root, args, { prisma, userInfo }) => {
				const { id } = userInfo
				let { userId }: any = args
				if (userId === undefined || userId === null) userId = id

				const follows: any = await prisma.follow.findMany({
					where: {
						userId: id
					},
					select: {
						follower: true
					}
				})
				const followIds = follows.map(({ follower }) => follower)

				let userProfile: any = await prisma.user.findUnique({
					where: { id: userId }
				})

				if (followIds.includes(userProfile?.id)) {
					userProfile.isFollow = true
				} else {
					userProfile.isFollow = false
				}

				return userProfile
			}
		})
	}
})

// =================== Muttation =========================

export const UserMutatoin = extendType({
	type: "Mutation",
	definition(t) {
		t.field("authorizeWithGoogle", {
			type: "User",
			args: {
				googleIdToken: nonNull(stringArg())
			},
			authorize: async (_root, { googleIdToken }, ctx) => {
				try {
					const { data } = await axios.get(
						`https://oauth2.googleapis.com/tokeninfo?id_token=${googleIdToken}`
					)
					ctx.userInfo = data
					return true
				} catch (e) {
					throw new ApolloError("googleIdToken 인증 실패", "404")
				}
			},
			resolve: async (_root, { googleIdToken }, { prisma, userInfo, res }) => {
				const { email, name, picture: profileUrl } = userInfo
				const userProfile = await prisma.user.findUnique({
					where: {
						email
					}
				})
				console.log(userProfile)
				if (!userProfile) {
					throw new ApolloError("등록되지 않은 유저입니다.", "202")
				}
				const token = tokenGenerator(userProfile)
				res.cookie("Bearer", token)
				return userProfile
			}
		})

		t.field("userRegister", {
			type: "User",
			args: {
				tags: nonNull(list(nonNull(intArg()))),
				googleIdToken: nonNull(stringArg()),
				originJob: nonNull(stringArg()),
				interestJob: nonNull(stringArg()),
				work: stringArg(),
				company: stringArg()
			},
			authorize: async (_root, { googleIdToken }, ctx) => {
				try {
					const { data } = await axios.get(
						`https://oauth2.googleapis.com/tokeninfo?id_token=${googleIdToken}`
					)
					ctx.userInfo = data
					return true
				} catch (e) {
					throw new ApolloError("googleIdToken 인증 실패", "404")
				}
			},
			resolve: async (_root, args, ctx) => {
				const { prisma, res, userInfo } = ctx
				const { tags, googleIdToken, ...onBoardingData } = args
				const { email, name, picture: profileUrl } = userInfo
				console.log(userInfo)
				const connectTages = tags.map(tagId => ({
					tagId
				}))
				const createdUser = await prisma.user.create({
					data: {
						email,
						name,
						profileUrl,
						...onBoardingData,
						tags: {
							createMany: {
								data: connectTages
							}
						},
						folders: {
							create: {
								folderName: "분류 안됨"
							}
						}
					}
				})

				const token = tokenGenerator(createdUser)
				res.cookie("Bearer", token)
				return createdUser
			}
		})

		t.field("updateUserProfile", {
			type: "User",
			args: {
				tags: list(nonNull(intArg())),
				name: stringArg(),
				introduce: stringArg(),
				interestJob: stringArg(),
				profileUrl: stringArg()
			},
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			resolve: async (_root, args, { prisma, userInfo }) => {
				const { id } = userInfo
				const { tags, ...inputProfile }: any = args

				const updatedProfile = await prisma.user.update({
					where: {
						id
					},
					data: inputProfile
				})
				if (tags) {
					await prisma.userOnTag.deleteMany({
						where: {
							userId: id
						}
					})
					const connectTages = tags.map(tagId => ({
						userId: id,
						tagId
					}))
					await prisma.userOnTag.createMany({
						data: connectTages
					})
				}

				return updatedProfile
			}
		})
		t.field("userSignOut", {
			type: "String",
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			resolve(_root, args, ctx) {
				ctx.res.cookie("Bearer", "")
				return "로그아웃 성공"
			}
		})
		t.field("clearUserAndFolder", {
			type: "Boolean",
			resolve: async (_root, args, ctx) => {
				const { prisma } = ctx

				const deleteUserOnTag = await prisma.userOnTag.deleteMany()
				const deleteUser = await prisma.user.deleteMany()
				const deleteFolder = await prisma.folder.deleteMany()

				console.log(deleteUser)
				console.log(deleteFolder)
				return true
			}
		})
	}
})
