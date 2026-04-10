import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/speakers/$slug")({
	beforeLoad: () => {
		throw redirect({ to: "/play" });
	},
});
