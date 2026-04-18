import { createFileRoute } from "@tanstack/react-router";
import TrainingPlayScreen from "#/features/chain-reaction/components/TrainingPlayScreen";

export const Route = createFileRoute("/play/training")({
	component: TrainingPlayRoute,
});

function TrainingPlayRoute() {
	return <TrainingPlayScreen />;
}
