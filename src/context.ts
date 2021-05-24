import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({
	log: ["query"],
	rejectOnNotFound: false
})

export type Context = {
	prisma: PrismaClient
	req: any
	res: any
	userInfo?: any
}

export const createContext = ({ req, res }): Context => ({
	prisma,
	req,
	res
})
