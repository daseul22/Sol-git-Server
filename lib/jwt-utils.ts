require("dotenv").config()
import { ApolloError } from "apollo-server-errors"
import jwt, {
	JsonWebTokenError,
	VerifyErrors,
	TokenExpiredError
} from "jsonwebtoken"

const { getCookieValue } = require("./cookie-utils")

const { JWT_SCRET = "dev" } = process.env

type VerifyValue = {
	id: number
}

export const tokenGenerator = user => {
	const { id, email } = user
	const token = jwt.sign({ id, email }, JWT_SCRET, {
		expiresIn: "24h"
	})
	return token
}
export const jwtVerification = (req, prisma) => {
	const { cookie } = req.headers
	let token = getCookieValue(cookie, "Bearer")

	if (!token) {
		throw new ApolloError("로그인이 필요합니다.")
	} else {
		try {
			const verify = jwt.verify(token, JWT_SCRET)
			return verify
		} catch (e) {
			throw new ApolloError(e)
		}
	}
}
