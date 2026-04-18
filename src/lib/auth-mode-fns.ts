import { createServerFn } from "@tanstack/react-start";
import { api } from "../../convex/_generated/api";
import { fetchAuthQuery } from "#/lib/auth-server";

export type AuthModes = {
	isLocal: boolean;
	googleEnabled: boolean;
	emailPasswordEnabled: boolean;
};

export const getAuthModesFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<AuthModes> => {
		return await fetchAuthQuery(api.auth.getAuthModes, {});
	},
);
