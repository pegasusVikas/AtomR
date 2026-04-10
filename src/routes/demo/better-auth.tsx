import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/demo/better-auth")({
	beforeLoad: () => {
		throw redirect({ to: "/sign-in" });
	},
});
