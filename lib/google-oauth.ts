require("dotenv").config()
import axios from "axios"
import { ApolloError } from "apollo-server"

const {
	GOOGLE_OAUTH_CLIENT_ID,
	GOOGLE_OAUTH_CLIENT_SECRET,
	N_ENV
} = process.env

type GoogleToken = {
	access_token: string
	expires_in: number
	refresh_token: string
	scope: string
	token_type: string
	id_token: string
}

export const requestGoogleToken = async (credential): Promise<GoogleToken> => {
	try {
		const { data: tokenInfo } = await axios.post<GoogleToken>(
			"https://oauth2.googleapis.com/token",
			{
				code: credential,
				client_id: GOOGLE_OAUTH_CLIENT_ID,
				client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
				redirect_uri:
					N_ENV === "dev" ? "http://localhost:3000" : "https://sol-git.ga",
				grant_type: "authorization_code"
			}
		)

		return tokenInfo
	} catch (err) {
		throw new ApolloError(`${err} /* token error`, "404")
	}
}
type GoogleUser = {
	family_name: string
	name: string
	picture: string
	local: string
	email: string
	given_name: string
	id: number
	verified_email: string
}

export const requestGoogleUserAccount = async token => {
	try {
		let userInfo: GoogleUser = await axios.get(
			"https://www.googleapis.com/oauth2/v2/userinfo",
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		)

		return userInfo
	} catch (err) {
		throw new ApolloError(`${err} : /* get googleuser err`)
	}
}

export const requestGoogleUser = async credential => {
	const { access_token } = await requestGoogleToken(credential)

	const googleUser = await requestGoogleUserAccount(access_token)
	return { googleUser, access_token }
}
