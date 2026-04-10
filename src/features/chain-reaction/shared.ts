export type PlayerId = "p1" | "p2";

export type Position = {
	row: number;
	col: number;
};

export type Cell = {
	owner: PlayerId | null;
	count: number;
};

export type Board = Cell[][];

export type PlayerFlags = Record<PlayerId, boolean>;

export type GamePhase = "idle" | "resolving" | "gameOver";

export type ResolutionEvent =
	| {
			type: "place";
			row: number;
			col: number;
			player: PlayerId;
	  }
	| {
			type: "explode";
			row: number;
			col: number;
			player: PlayerId;
			affected: Position[];
	  }
	| {
			type: "capture";
			row: number;
			col: number;
			player: PlayerId;
	  };

export type GameState = {
	board: Board;
	rows: number;
	cols: number;
	currentPlayer: PlayerId;
	turnNumber: number;
	hasPlayed: PlayerFlags;
	eliminated: PlayerFlags;
	winner: PlayerId | null;
	phase: GamePhase;
};

export type ApplyMoveResult = {
	state: GameState;
	events: ResolutionEvent[];
};

export const DEFAULT_ROWS = 6;
export const DEFAULT_COLS = 9;

export const PLAYER_ORDER = ["p1", "p2"] as const satisfies readonly PlayerId[];

export function createPlayerFlags(initialValue = false): PlayerFlags {
	return {
		p1: initialValue,
		p2: initialValue,
	};
}
