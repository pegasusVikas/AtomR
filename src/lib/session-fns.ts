import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth";
import { ensureAuthReady } from "#/lib/auth-init";

export const getSessionFn = createServerFn({ method: "GET" }).handler(
	async () => {
		await ensureAuthReady();
		return auth.api.getSession({ headers: getRequestHeaders() });
	},
);

export const requireSessionFn = createServerFn({ method: "GET" }).handler(
	async () => {
		await ensureAuthReady();
		const session = await auth.api.getSession({ headers: getRequestHeaders() });
		if (!session?.user) {
			throw redirect({ to: "/sign-in" });
		}
		return session;
	},
);
