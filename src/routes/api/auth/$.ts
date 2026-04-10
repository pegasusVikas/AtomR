import { createFileRoute } from "@tanstack/react-router";
import { auth } from "#/lib/auth";
import { ensureAuthReady } from "#/lib/auth-init";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				await ensureAuthReady();
				return auth.handler(request);
			},
			POST: async ({ request }) => {
				await ensureAuthReady();
				return auth.handler(request);
			},
		},
	},
});
