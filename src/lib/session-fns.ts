import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getToken } from "#/lib/auth-server";

export const getSessionFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const token = await getToken();
		if (!token) return null;
		return { user: { id: "authenticated" } };
	},
);

export const requireSessionFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const token = await getToken();
		if (!token) {
			throw redirect({ to: "/sign-in" });
		}
		return { user: { id: "authenticated" } };
	},
);
