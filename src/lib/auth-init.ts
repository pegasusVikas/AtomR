import { getMigrations } from "better-auth/db/migration";
import { auth } from "#/lib/auth";

let authInitPromise: Promise<void> | null = null;

const DEV_USERS = [
	{
		email: "test1@example.com",
		password: "password123",
		name: "Test User One",
	},
	{
		email: "test2@example.com",
		password: "password123",
		name: "Test User Two",
	},
];

export function ensureAuthReady() {
	if (!authInitPromise) {
		authInitPromise = (async () => {
			const { runMigrations } = await getMigrations(auth.options);
			await runMigrations();

			if (import.meta.env.DEV) {
				for (const user of DEV_USERS) {
					try {
						await auth.api.signUpEmail({ body: user });
					} catch {
						// Ignore duplicates; local seed should be idempotent.
					}
				}
			}
		})();
	}

	return authInitPromise;
}
