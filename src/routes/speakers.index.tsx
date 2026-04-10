import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/speakers/")({
	beforeLoad: () => {
		throw redirect({ to: "/play" });
	},
});
