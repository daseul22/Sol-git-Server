export const getCookieValue = (cookie, name) => {
	let match = cookie?.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")

	return match ? match[2] : ""
}
