import {
	type ApplyMoveResult,
	type Board,
	type Cell,
	createPlayerFlags,
	DEFAULT_COLS,
	DEFAULT_ROWS,
	type GameState,
	PLAYER_ORDER,
	type PlayerFlags,
	type PlayerId,
	type Position,
	type ResolutionEvent,
} from "./shared";

function getPositionKey(row: number, col: number): string {
	return `${row}:${col}`;
}

function createCell(): Cell {
	return {
		owner: null,
		count: 0,
	};
}

function cloneBoard(board: Board): Board {
	return board.map((row) => row.map((cell) => ({ ...cell })));
}

function isInBounds(
	row: number,
	col: number,
	rows: number,
	cols: number,
): boolean {
	return row >= 0 && row < rows && col >= 0 && col < cols;
}

export function createInitialBoard(
	rows = DEFAULT_ROWS,
	cols = DEFAULT_COLS,
): Board {
	return Array.from({ length: rows }, () =>
		Array.from({ length: cols }, () => createCell()),
	);
}

export function createInitialGameState(
	rows = DEFAULT_ROWS,
	cols = DEFAULT_COLS,
): GameState {
	return {
		board: createInitialBoard(rows, cols),
		rows,
		cols,
		currentPlayer: "p1",
		turnNumber: 0,
		hasPlayed: createPlayerFlags(false),
		eliminated: createPlayerFlags(false),
		winner: null,
		phase: "idle",
	};
}

export function getCapacity(
	row: number,
	col: number,
	rows: number,
	cols: number,
): number {
	if (!isInBounds(row, col, rows, cols)) {
		throw new Error("Cell is out of bounds");
	}

	let capacity = 4;
	if (row === 0 || row === rows - 1) capacity -= 1;
	if (col === 0 || col === cols - 1) capacity -= 1;
	return capacity;
}

function getNeighbors(
	row: number,
	col: number,
	rows: number,
	cols: number,
): Position[] {
	const neighbors: Position[] = [];
	const directions = [
		{ row: -1, col: 0 },
		{ row: 0, col: 1 },
		{ row: 1, col: 0 },
		{ row: 0, col: -1 },
	];

	for (const direction of directions) {
		const nextRow = row + direction.row;
		const nextCol = col + direction.col;
		if (isInBounds(nextRow, nextCol, rows, cols)) {
			neighbors.push({ row: nextRow, col: nextCol });
		}
	}

	return neighbors;
}

export function countPlayerOrbs(board: Board, playerId: PlayerId): number {
	return board.reduce((total, row) => {
		return (
			total +
			row.reduce((rowTotal, cell) => {
				if (cell.owner !== playerId) return rowTotal;
				return rowTotal + cell.count;
			}, 0)
		);
	}, 0);
}

export function allPlayersHavePlayed(
	state: Pick<GameState, "hasPlayed">,
): boolean {
	return PLAYER_ORDER.every((playerId) => state.hasPlayed[playerId]);
}

export function recomputeEliminations(
	state: Pick<GameState, "board" | "hasPlayed">,
): PlayerFlags {
	if (!allPlayersHavePlayed(state)) {
		return createPlayerFlags(false);
	}

	return {
		p1: countPlayerOrbs(state.board, "p1") === 0,
		p2: countPlayerOrbs(state.board, "p2") === 0,
	};
}

export function recomputeWinner(
	state: Pick<GameState, "board" | "eliminated" | "hasPlayed">,
): PlayerId | null {
	if (!allPlayersHavePlayed(state)) {
		return null;
	}

	const activePlayers = PLAYER_ORDER.filter((playerId) => {
		return (
			!state.eliminated[playerId] && countPlayerOrbs(state.board, playerId) > 0
		);
	});

	return activePlayers.length === 1 ? activePlayers[0] : null;
}

export function getNextPlayer(
	state: Pick<GameState, "currentPlayer" | "eliminated">,
): PlayerId {
	const currentIndex = PLAYER_ORDER.indexOf(state.currentPlayer);

	for (let offset = 1; offset <= PLAYER_ORDER.length; offset += 1) {
		const nextPlayer =
			PLAYER_ORDER[(currentIndex + offset) % PLAYER_ORDER.length];
		if (!state.eliminated[nextPlayer]) {
			return nextPlayer;
		}
	}

	return state.currentPlayer;
}

export function isLegalMove(
	state: Pick<GameState, "board" | "rows" | "cols" | "currentPlayer" | "phase">,
	row: number,
	col: number,
): boolean {
	if (state.phase === "gameOver") return false;
	if (!isInBounds(row, col, state.rows, state.cols)) return false;
	const cell = state.board[row][col];
	return cell.owner === null || cell.owner === state.currentPlayer;
}

function resolveBoard(
	board: Board,
	rows: number,
	cols: number,
	currentPlayer: PlayerId,
	hasPlayed: PlayerFlags,
	queue: Position[],
	events: ResolutionEvent[],
): boolean {
	const queued = new Set(
		queue.map((position) => getPositionKey(position.row, position.col)),
	);
	let queueIndex = 0;
	const opponentPlayer: PlayerId = currentPlayer === "p1" ? "p2" : "p1";

	function enqueue(row: number, col: number) {
		const key = getPositionKey(row, col);
		if (queued.has(key)) return;
		queued.add(key);
		queue.push({ row, col });
	}

	function hasWinnerDuringResolution() {
		if (!allPlayersHavePlayed({ hasPlayed })) return false;
		return countPlayerOrbs(board, opponentPlayer) === 0;
	}

	while (queueIndex < queue.length) {
		const current = queue[queueIndex];
		queueIndex += 1;
		queued.delete(getPositionKey(current.row, current.col));
		if (!current) continue;

		const cell = board[current.row][current.col];
		const capacity = getCapacity(current.row, current.col, rows, cols);
		if (cell.count < capacity) continue;

		events.push({
			type: "explode",
			row: current.row,
			col: current.col,
			player: currentPlayer,
			affected: getNeighbors(current.row, current.col, rows, cols),
		});

		cell.count -= capacity;
		cell.owner = cell.count === 0 ? null : currentPlayer;

		for (const neighbor of getNeighbors(current.row, current.col, rows, cols)) {
			const neighborCell = board[neighbor.row][neighbor.col];
			if (neighborCell.owner !== null && neighborCell.owner !== currentPlayer) {
				events.push({
					type: "capture",
					row: neighbor.row,
					col: neighbor.col,
					player: currentPlayer,
				});
			}

			neighborCell.owner = currentPlayer;
			neighborCell.count += 1;

			if (
				neighborCell.count >=
				getCapacity(neighbor.row, neighbor.col, rows, cols)
			) {
				enqueue(neighbor.row, neighbor.col);
			}
		}

		if (cell.count >= capacity) {
			enqueue(current.row, current.col);
		}

		if (hasWinnerDuringResolution()) {
			return true;
		}
	}

	return false;
}

export function applyMove(
	state: GameState,
	row: number,
	col: number,
): ApplyMoveResult {
	if (!isLegalMove(state, row, col)) {
		throw new Error("Illegal move");
	}

	const board = cloneBoard(state.board);
	const events: ResolutionEvent[] = [];
	const targetCell = board[row][col];

	targetCell.owner = state.currentPlayer;
	targetCell.count += 1;

	events.push({
		type: "place",
		row,
		col,
		player: state.currentPlayer,
	});

	const queue: Position[] = [];
	const hasPlayed: PlayerFlags = {
		...state.hasPlayed,
		[state.currentPlayer]: true,
	};

	if (targetCell.count >= getCapacity(row, col, state.rows, state.cols)) {
		queue.push({ row, col });
	}

	const endedByElimination = resolveBoard(
		board,
		state.rows,
		state.cols,
		state.currentPlayer,
		hasPlayed,
		queue,
		events,
	);

	const eliminated = recomputeEliminations({ board, hasPlayed });
	const winner = recomputeWinner({ board, eliminated, hasPlayed });
	const resolvedWinner = endedByElimination ? state.currentPlayer : winner;

	const nextState: GameState = {
		...state,
		board,
		turnNumber: state.turnNumber + 1,
		hasPlayed,
		eliminated,
		winner: resolvedWinner,
		currentPlayer: resolvedWinner
			? state.currentPlayer
			: getNextPlayer({ currentPlayer: state.currentPlayer, eliminated }),
		phase: resolvedWinner ? "gameOver" : "idle",
	};

	return {
		state: nextState,
		events,
	};
}
