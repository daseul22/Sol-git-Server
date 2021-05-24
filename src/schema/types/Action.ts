import { ApolloError } from "apollo-server-errors"
import { isNonNullType } from "graphql"
import {
	objectType,
	extendType,
	nonNull,
	intArg,
	stringArg,
	booleanArg,
	enumType
} from "nexus"
import { jwtVerification } from "../../../lib"
// =================== Type =========================

export const Action = objectType({
	name: "Action",
	definition(t) {
		t.model.id()
		//t.model.userId()
		t.model.User()
		// t.model.Clip()
		t.model.clipId()
		t.model.isUseful()
		t.model.isSave()
		t.model.isRead()
		//t.model.readAt()
		t.model.folderId()
		//t.model.Folder()
	}
})

// =================== Query =========================

export const ActionQuery = extendType({
	type: "Query",
	definition(t) {}
})

// =================== Muttation =========================

export const ActionMutation = extendType({
	type: "Mutation",
	definition(t) {
		t.field("createAction", {
			// 피드 글 클릭하면 무조건 읽음 표시와함께 이 뮤테이션 실행 why 읽은 후에 유용해요, 저장하기 버튼 누르는 피드백 화면이 뜬다.
			type: "Action",
			description:
				"피드에서 유저가 콘텐츠를 읽으려고 눌렀을때, 유용해요, 저장버튼 눌렀을 때 사용하는 뮤테이션입니다.",
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			args: {
				actionType: nonNull(
					stringArg({
						description: "save, read, useful 중 하나를 문자열로 넘겨주세요."
					})
				),
				clipId: nonNull(intArg())
			},
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id } = userInfo
				const { clipId, actionType } = args
				let action = {}
				if (actionType === "read") action = { isRead: true }
				else if (actionType === "save") action = { isSave: true }
				else if (actionType === "useful") action = { isUseful: true }
				else throw new ApolloError("올바른 actionType을 입력해주세요.", "400")

				const createdAction = await prisma.action.create({
					data: {
						userId: id,
						clipId,
						...action
					}
				})
				return createdAction
			}
		})
		t.field("updateAction", {
			type: "Action",
			description:
				"유저가 피드, 익스텐션에서 저장, 유용하기 눌렀을때 사용하는 뮤테이션 입니다.",
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			args: {
				clipId: nonNull(intArg()),
				isUseful: nonNull(booleanArg()),
				isSave: nonNull(booleanArg()),
				folderId: intArg()
			},
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id } = userInfo
				const { clipId, ...updateData } = args
				const { isUseful, isSave, folderId } = updateData

				// if (isUseful === undefined && isSave === undefined) {
				// 	throw new ApolloError("isUseful 또는 isSave를 입력해주세요.", "404")
				// } else
				if (isSave && folderId === undefined) {
					const nullFolder = await prisma.folder.findFirst({
						where: {
							id,
							folderName: "분류 안됨"
						},
						select: {
							id
						}
					})
					updateData.folderId = nullFolder?.id
				}

				const updatedAction = await prisma.action.update({
					where: {
						ids: {
							userId: id,
							clipId
						}
					},
					data: {
						...updateData
					}
				})
				return updatedAction
			}
		})
	}
})
