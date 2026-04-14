import { PLAYER_COLORS, PLAYER_NAMES } from "../constants";
import { countPlayerCells, countPlayerOrbsInState } from "../selectors";
import { formatBoardCoordinate } from "../shared";
import type { GameState, LastMove, PlayerId } from "../types";

type GameHudProps = {
	state: GameState;
	lastMove: LastMove | null;
	onReset: () => void;
	onSettingsOpen: () => void;
};

function PlayerChip({
	playerId,
	state,
	align,
}: {
	playerId: PlayerId;
	state: GameState;
	align: "left" | "right";
}) {
	const isActive = state.currentPlayer === playerId && state.winner === null;
	const isEliminated = state.eliminated[playerId];
	const color = PLAYER_COLORS[playerId];
	const orbs = countPlayerOrbsInState(state, playerId);
	const cells = countPlayerCells(state, playerId);
	const isRight = align === "right";

	return (
		<div
			className={`flex flex-col gap-1 transition-opacity duration-500 ${isEliminated ? "opacity-20" : ""} ${isRight ? "items-end" : "items-start"}`}
		>
			{/* Name row with active dot */}
			<div
				className={`flex items-center gap-1.5 ${isRight ? "flex-row-reverse" : ""}`}
			>
				<span
					className="h-1.5 w-1.5 rounded-full transition-all duration-700"
					style={{
						backgroundColor: isActive ? color : "rgba(255,255,255,0.1)",
						boxShadow: isActive
							? `0 0 6px ${color}, 0 0 12px ${color}88`
							: "none",
					}}
				/>
				<span
					className="text-[10px] font-semibold uppercase tracking-[0.25em]"
					style={{
						fontFamily: "'Oxanium', sans-serif",
						color: isActive ? color : "rgba(255,255,255,0.28)",
						transition: "color 0.6s ease",
					}}
				>
					{PLAYER_NAMES[playerId]}
				</span>
			</div>

			{/* Stats row */}
			<div
				className={`flex items-baseline gap-2 ${isRight ? "flex-row-reverse" : ""}`}
			>
				<span
					className="text-3xl font-bold leading-none"
					style={{
						fontFamily: "'JetBrains Mono', monospace",
						color: isActive
							? "rgba(255,255,255,0.92)"
							: "rgba(255,255,255,0.18)",
						transition: "color 0.6s ease",
					}}
				>
					{orbs}
				</span>
				<span
					className="text-[9px] uppercase tracking-widest"
					style={{
						fontFamily: "'Oxanium', sans-serif",
						color: "rgba(255,255,255,0.18)",
					}}
				>
					orbs
				</span>
				<span
					className="text-[9px] uppercase tracking-widest"
					style={{
						fontFamily: "'JetBrains Mono', monospace",
						color: "rgba(255,255,255,0.14)",
					}}
				>
					{cells}c
				</span>
			</div>
		</div>
	);
}

export default function GameHud({
	state,
	lastMove,
	onReset,
	onSettingsOpen,
}: GameHudProps) {
	const isResolving = state.phase === "resolving";

	const centerLabel = isResolving ? "···" : state.winner ? "WIN" : "VS";

	const centerColor = isResolving
		? "rgba(255,255,255,0.4)"
		: state.winner
			? PLAYER_COLORS[state.winner]
			: "rgba(255,255,255,0.1)";
	const lastMoveLabel = lastMove
		? `${PLAYER_NAMES[lastMove.player]} ${formatBoardCoordinate(lastMove.row, lastMove.col)}`
		: "No moves yet";

	return (
		<div className="flex items-center gap-2">
			{/* Player 1 */}
			<div className="flex-1">
				<PlayerChip playerId="p1" state={state} align="left" />
			</div>

			{/* Center — status + game title + reset */}
			<div className="flex shrink-0 flex-col items-center gap-1">
				<button
					type="button"
					onClick={onReset}
					className="px-2 py-0.5 text-[9px] uppercase tracking-[0.35em] transition-opacity duration-150 hover:opacity-60 active:scale-95"
					style={{
						fontFamily: "'Oxanium', sans-serif",
						color: "rgba(255,255,255,0.2)",
					}}
				>
					reset
				</button>
				<span
					className="text-xl font-extrabold leading-none tracking-tight transition-colors duration-700"
					style={{
						fontFamily: "'Oxanium', sans-serif",
						color: centerColor,
						minWidth: "2.5rem",
						textAlign: "center",
					}}
				>
					{centerLabel}
				</span>
				<span
					className="text-[8px] uppercase tracking-[0.4em]"
					style={{
						fontFamily: "'Oxanium', sans-serif",
						color: "rgba(255,255,255,0.1)",
					}}
				>
					chain
				</span>
				<span
					className="text-[8px] uppercase tracking-[0.18em]"
					style={{
						fontFamily: "'JetBrains Mono', monospace",
						color: "rgba(255,255,255,0.26)",
					}}
				>
					{lastMoveLabel}
				</span>
				<button
					type="button"
					onClick={onSettingsOpen}
					className="px-2 py-0.5 text-[8px] uppercase tracking-[0.35em] transition-opacity duration-150 hover:opacity-60 active:scale-95"
					style={{
						fontFamily: "'Oxanium', sans-serif",
						color: "rgba(255,255,255,0.15)",
					}}
				>
					board
				</button>
			</div>

			{/* Player 2 */}
			<div className="flex flex-1 justify-end">
				<PlayerChip playerId="p2" state={state} align="right" />
			</div>
		</div>
	);
}
