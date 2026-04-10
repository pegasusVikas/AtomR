import { createFileRoute } from "@tanstack/react-router";
import LocalPlayScreen from "#/features/chain-reaction/components/LocalPlayScreen";

export const Route = createFileRoute("/play/local")({
	component: LocalPlayRoute,
});

function LocalPlayRoute() {
	return <LocalPlayScreen />;
}
