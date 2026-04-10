import {
	DEFAULT_COLS,
	DEFAULT_ROWS,
	PLAYER_ORDER,
	createPlayerFlags,
	type PlayerId,
} from "./shared";

export { DEFAULT_COLS, DEFAULT_ROWS, PLAYER_ORDER, createPlayerFlags };

export const PLAYER_COLORS: Record<PlayerId, string> = {
	p1: "oklch(0.72 0.19 23)",
	p2: "oklch(0.78 0.16 210)",
};

export const PLAYER_NAMES: Record<PlayerId, string> = {
	p1: "Player 1",
	p2: "Player 2",
};
