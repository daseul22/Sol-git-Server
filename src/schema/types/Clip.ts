import { isNonNullType } from "graphql"
import {
	objectType,
	extendType,
	nonNull,
	intArg,
	stringArg,
	booleanArg,
	nullable,
	list
} from "nexus"
import { jwtVerification } from "../../../lib"
import { Action } from "./Action"
// =================== Type =========================

export const Clip = objectType({
	name: "Clip",
	definition(t) {
		t.model.id()
		t.model.url()
		t.model.memo()
		t.model.createdAt()
		t.field("action", {
			type: "Action",
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id: userId } = userInfo
				const { id: clipId } = _root

				const action = await prisma.action.findUnique({
					where: {
						ids: {
							userId,
							clipId
						}
					}
				})
				return action
			}
		})
	}
})

export const feed = objectType({
	name: "feed",
	definition(t) {
		t.int("id")
		t.string("url")
		t.string("memo")
		//t.string("createAt")
		t.boolean("isUseful", {
			description: "유저가 유용해요를 눌렀는지",
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id } = userInfo
				const { id: clipId }: any = _root
				const action = await prisma.action.findUnique({
					where: {
						ids: {
							userId: id,
							clipId
						}
					}
				})
				if (action?.isUseful === true) return true
				return false
			}
		})
		t.boolean("isSave", {
			description: "유저가 저장을 했는지",
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id } = userInfo
				const { id: clipId }: any = _root
				const action = await prisma.action.findUnique({
					where: {
						ids: {
							userId: id,
							clipId
						}
					}
				})
				if (action?.isSave === true) return true
				return false
			}
		})
		t.field("user", {
			type: "User",
			description: "홈피드에 해당하는 유저",
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id: userId } = userInfo
				const { id: clipId } = _root

				//클립에 대해서 action을 갖고 isPrivate이 false이면서 follower가 가장 많은 유저를 actions 먼저 저장한(읽은) 사람 순
				// 일단 임시 방편으로 먼저 글 읽은 사람을 기준으로

				const { User }: any = await prisma.action.findFirst({
					where: {
						clipId,
						isPrivate: false
					},
					orderBy: {
						readAt: "desc"
					},
					select: {
						User: true
					}
				})
				console.log(User)
				return User
			}
		})
		t.field("usefulList", {
			type: list("User"),
			description: "유용해요 누른 유저 리스트",
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id } = userInfo
				const { id: clipId } = _root

				const follows = await prisma.follow.findMany({
					where: {
						userId: id
					},
					select: {
						follower: true
					}
				})
				const followIds = follows.map(({ follower }) => follower)

				let users = await prisma.user.findMany({
					where: {
						actions: {
							some: {
								isUseful: true,
								clipId
							}
						},
						NOT: {
							id
						}
					},
					orderBy: {
						name: "asc"
					}
				})
				console.log(users)
				users = users.map(user => {
					return followIds.includes(user.id)
						? { ...user, isFollow: true }
						: { ...user, isFollow: false }
				})
				return users
			}
		})
		t.field("saveList", {
			type: list("User"),
			description: "저장한 유저 리스트",
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id } = userInfo
				const { id: clipId } = _root

				const follows = await prisma.follow.findMany({
					where: {
						userId: id
					},
					select: {
						follower: true
					}
				})
				const followIds = follows.map(({ follower }) => follower)

				let users = await prisma.user.findMany({
					where: {
						actions: {
							some: {
								isSave: true,
								clipId
							}
						},
						NOT: {
							id
						}
					},
					orderBy: {
						name: "asc"
					}
				})
				console.log(users)
				users = users.map(user => {
					return followIds.includes(user.id)
						? { ...user, isFollow: true }
						: { ...user, isFollow: false }
				})
				return users
			}
		})
	}
})

// =================== Query =========================

export const ClipQuery = extendType({
	type: "Query",
	definition(t) {
		t.field("findUserFeed", {
			type: list("feed"),
			description: "유저 개인별 피드에 해당하는 클립리스트입니다.",
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			args: {
				take: nonNull(intArg({ description: "clip을 몇개 가져올껀지 지정" })),
				folderId: nonNull(intArg())
			},
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id } = userInfo
				const { take, folderId } = args

				// 특정 유저에 folderId null인 경우를 찾아도 된다 그럼 (제목 없음) 같은 폴더가 될듯
				const clips = await prisma.clip.findMany({
					take,
					where: {
						actions: {
							some: {
								userId: id,
								isSave: true,
								folderId
							}
						}
					},
					orderBy: {
						id: "desc"
					}
				})
				console.log(clips)
				return clips
			}
		})
		t.field("userFeedPagenation", {
			type: list("feed"),
			description: "유저 개인별 피드에 해당하는 페이지네이션입니다.",
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			args: {
				take: nonNull(intArg({ description: "clip을 몇개 가져올껀지 지정" })),
				folderId: nonNull(intArg()),
				cursor: nonNull(intArg())
			},
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id } = userInfo
				const { take, folderId, cursor } = args

				const clips = await prisma.clip.findMany({
					take,
					skip: 1,
					cursor: {
						id: cursor
					},
					where: {
						actions: {
							some: {
								userId: id,
								isSave: true,
								folderId
							}
						}
					},
					orderBy: {
						id: "desc"
					}
				})
				console.log(clips)
				return clips
			}
		})

		t.field("findManyFeed", {
			type: list("feed"),
			description: "홈 피드 페이지네이션 하기 전 단계입니다.",
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			args: {
				take: nonNull(intArg({ description: "clip을 몇개 가져올껀지 지정" }))
			},
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				let { id } = userInfo
				const { take } = args

				const tags = await prisma.userOnTag.findMany({
					where: {
						userId: id
					},
					select: {
						tagId: true
					}
				})
				const tagIds: any = tags.map(({ tagId }) => tagId)

				const actions = await prisma.action.findMany({
					where: {
						userId: id,
						OR: [{ isRead: true }]
					},
					select: {
						clipId: true
					}
				})

				const uniqueClipIds: any = Array.from(
					new Set(actions.map(({ clipId }) => clipId))
				)
				const clips = await prisma.clip.findMany({
					take,
					orderBy: {
						id: "desc"
					},
					where: {
						actions: {
							some: {
								User: {
									tags: {
										some: {
											tagId: {
												in: [...tagIds]
											}
										}
									}
								},
								NOT: {
									clipId: {
										in: [...uniqueClipIds]
									}
								},
								isPrivate: false
							}
						}
					}
				})
				//console.log(clips)
				return clips
			}
		})
		t.field("feedPagenation", {
			type: list("feed"),
			description: "홈 피드 페이지네이션 입니다",
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			args: {
				take: nonNull(intArg({ description: "clip을 몇 개 가져올껀지 지정" })),
				cursor: nonNull(
					intArg({ description: "가져온 clip들의 맨 뒤에있는 클립의 ID" })
				)
			},
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				let { id } = userInfo
				const { take, cursor } = args

				const tags = await prisma.userOnTag.findMany({
					where: {
						userId: id
					},
					select: {
						tagId: true
					}
				})
				const tagIds: any = tags.map(({ tagId }) => tagId)

				const actions = await prisma.action.findMany({
					where: {
						userId: id,
						OR: [{ isRead: true }, { isSave: true }]
					},
					select: {
						clipId: true
					}
				})

				const uniqueClipIds: any = Array.from(
					new Set(actions.map(({ clipId }) => clipId))
				)
				const clips = await prisma.clip.findMany({
					take,
					skip: 1,
					cursor: {
						id: cursor
					},
					orderBy: {
						id: "desc"
					},
					where: {
						actions: {
							some: {
								User: {
									tags: {
										some: {
											tagId: {
												in: [...tagIds]
											}
										}
									}
								},
								NOT: {
									clipId: {
										in: [...uniqueClipIds]
									}
								},
								isPrivate: false
							}
						}
					}
				})
				return clips
			}
		})
	}
})

// =================== Muttation =========================

export const ClipMutatoin = extendType({
	type: "Mutation",
	definition(t) {
		t.field("createClip", {
			type: "Clip",
			description: "chrome 익스텐션으로 저장할 때 사용하는 뮤테이션입니다.",
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			args: {
				folderId: nonNull(intArg()),
				isPrivate: nonNull(booleanArg()),
				url: nonNull(stringArg()),
				memo: stringArg()
			},
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id } = userInfo
				const { folderId, isPrivate, ...clipInfo } = args

				const createdClip = await prisma.clip.create({
					//action으로 연결까지?
					data: {
						...clipInfo,
						actions: {
							create: {
								userId: id,
								folderId,
								isUseful: true,
								isSave: true,
								isRead: true,
								isPrivate
							}
						}
					}
				})

				return createdClip
			}
		})
	}
})
