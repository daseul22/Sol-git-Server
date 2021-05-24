import { toApolloError } from "apollo-server-errors"
import { isNonNullType } from "graphql"
import { objectType, extendType, nonNull, intArg, stringArg, list } from "nexus"
import { jwtVerification } from "../../../lib"
// =================== Type =========================

export const Folder = objectType({
	name: "Folder",
	definition(t) {
		t.model.id()
		t.model.folderName()
		t.model.userId()
	}
})

// =================== Query =========================

export const FolderQuery = extendType({
	type: "Query",
	definition(t) {
		t.field("findManyFolder", {
			type: list("Folder"),
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id } = userInfo
				const folders = await prisma.folder.findMany({
					where: {
						userId: id
					}
				})
				return folders
			}
		})
	}
})

// =================== Muttation =========================

export const FolderMutatoin = extendType({
	type: "Mutation",
	definition(t) {
		t.field("createFolder", {
			type: "Folder",
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			args: {
				folderName: nonNull(stringArg())
			},
			resolve: async (_root, args, ctx) => {
				const { prisma, userInfo } = ctx
				const { id } = userInfo
				const { folderName } = args

				const folder = await prisma.folder.create({
					data: {
						folderName,
						userId: id
					}
				})
				console.log(folder)
				return folder
			}
		})
		t.field("updateFolder", {
			type: "Folder",
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			args: {
				folderId: nonNull(intArg()),
				folderName: nonNull(stringArg())
			},
			resolve: async (_root, args, ctx) => {
				const { prisma } = ctx
				const { folderId, folderName } = args

				const updatedFolder = await prisma.folder.update({
					where: {
						id: folderId
					},
					data: {
						folderName
					}
				})
				return updatedFolder
			}
		})
		t.field("deleteFolder", {
			type: "Folder",
			authorize: async (_root, args, ctx) => {
				const { req, prisma } = ctx
				const verify = await jwtVerification(req, prisma)
				ctx.userInfo = verify

				return true
			},
			args: {
				folderId: nonNull(intArg())
			},
			resolve: async (_root, args, ctx) => {
				const { prisma } = ctx
				const { folderId } = args
				const deletedFolder = await prisma.folder.delete({
					where: {
						id: folderId
					}
				})
				return deletedFolder
			}
		})
	}
})
