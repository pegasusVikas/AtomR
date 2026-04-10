import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/talks/$slug")({
	beforeLoad: () => {
		throw redirect({ to: "/play" });
	},
});
