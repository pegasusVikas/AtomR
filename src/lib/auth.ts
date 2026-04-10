import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { authDb } from "#/lib/auth-db";

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
	database: authDb,
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,
	trustedOrigins: isProd
		? [process.env.BETTER_AUTH_URL as string]
		: [
				"http://localhost:3000",
				"http://localhost:3001",
				"http://127.0.0.1:3000",
				"http://127.0.0.1:3001",
			],
	emailAndPassword: {
		enabled: !isProd,
	},
	socialProviders: isProd
		? {
				google: {
					clientId: process.env.GOOGLE_CLIENT_ID as string,
					clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
				},
			}
		: undefined,
	plugins: [tanstackStartCookies()],
});
