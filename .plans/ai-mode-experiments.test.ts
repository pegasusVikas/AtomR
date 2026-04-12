import { describe, expect, test } from "vitest";
import {
	applyMove,
	createInitialGameState,
	getCapacity,
	isLegalMove,
} from "../src/features/chain-reaction/shared-engine";
import type { GameState, PlayerId, Position } from "../src/features/chain-reaction/shared";

type Move = Position;

type AiConfig = {
	depth: number;
	candidateLimit: number;
	mistakeProbability: number;
	softmaxTemperature: number;
};

type AgentKind = "random" | "greedy" | "minimax";

function createRng(seed: number) {
	let t = seed >>> 0;
	return () => {
		t += 0x6d2b79f5;
		let x = Math.imul(t ^ (t >>> 15), 1 | t);
		x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
		return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
	};
}

function opponentOf(player: PlayerId): PlayerId {
	return player === "p1" ? "p2" : "p1";
}

function listLegalMoves(state: GameState): Move[] {
	const moves: Move[] = [];
	for (let row = 0; row < state.rows; row += 1) {
		for (let col = 0; col < state.cols; col += 1) {
			if (isLegalMove(state, row, col)) {
				moves.push({ row, col });
			}
		}
	}
	return moves;
}

function isCorner(row: number, col: number, rows: number, cols: number) {
	return (row === 0 || row === rows - 1) && (col === 0 || col === cols - 1);
}

function isEdge(row: number, col: number, rows: number, cols: number) {
	return row === 0 || row === rows - 1 || col === 0 || col === cols - 1;
}

function evaluateState(state: GameState, perspective: PlayerId): number {
	if (state.winner === perspective) return 1_000_000;
	if (state.winner === opponentOf(perspective)) return -1_000_000;

	let total = 0;
	const opponent = opponentOf(perspective);

	for (let row = 0; row < state.rows; row += 1) {
		for (let col = 0; col < state.cols; col += 1) {
			const cell = state.board[row][col];
			if (!cell.owner || cell.count === 0) continue;

			const sign = cell.owner === perspective ? 1 : -1;
			const capacity = getCapacity(row, col, state.rows, state.cols);
			const critical = cell.count === capacity - 1;

			let positional = 0;
			if (isCorner(row, col, state.rows, state.cols)) positional = 8;
			else if (isEdge(row, col, state.rows, state.cols)) positional = 3;

			total += sign * (cell.count * 6 + positional + (critical ? 9 : 0));

			if (critical) {
				const neighbors = [
					[row - 1, col],
					[row + 1, col],
					[row, col - 1],
					[row, col + 1],
				] as const;
				for (const [nr, nc] of neighbors) {
					if (nr < 0 || nc < 0 || nr >= state.rows || nc >= state.cols) continue;
					const neighbor = state.board[nr][nc];
					if (!neighbor.owner || neighbor.count === 0) continue;
					if (neighbor.owner === opponent) {
						total += sign * -5;
					}
				}
			}
		}
	}

	return total;
}

function quickMoveScore(state: GameState, move: Move): number {
	const { row, col } = move;
	const cell = state.board[row][col];
	const capacity = getCapacity(row, col, state.rows, state.cols);
	const before = cell.count;
	const after = before + 1;
	let score = after * 2;

	if (isCorner(row, col, state.rows, state.cols)) score += 10;
	else if (isEdge(row, col, state.rows, state.cols)) score += 4;

	if (after >= capacity) score += 20;
	if (after === capacity - 1) score += 8;

	const neighbors = [
		[row - 1, col],
		[row + 1, col],
		[row, col - 1],
		[row, col + 1],
	] as const;

	for (const [nr, nc] of neighbors) {
		if (nr < 0 || nc < 0 || nr >= state.rows || nc >= state.cols) continue;
		const neighbor = state.board[nr][nc];
		if (neighbor.owner && neighbor.owner !== state.currentPlayer) {
			score += 3;
			const nCap = getCapacity(nr, nc, state.rows, state.cols);
			if (neighbor.count >= nCap - 1) score += 7;
		}
	}

	return score;
}

function boardKey(state: GameState): string {
	const parts: string[] = [state.currentPlayer, String(state.turnNumber)];
	for (let row = 0; row < state.rows; row += 1) {
		for (let col = 0; col < state.cols; col += 1) {
			const cell = state.board[row][col];
			parts.push(`${cell.owner ?? "n"}${cell.count}`);
		}
	}
	return parts.join("|");
}

function minimax(
	state: GameState,
	depth: number,
	perspective: PlayerId,
	alpha: number,
	beta: number,
	candidateLimit: number,
	cache: Map<string, { depth: number; value: number }>,
): number {
	if (depth <= 0 || state.winner) {
		return evaluateState(state, perspective);
	}

	const key = `${depth}:${boardKey(state)}`;
	const cached = cache.get(key);
	if (cached && cached.depth >= depth) return cached.value;

	const legalMoves = listLegalMoves(state);
	if (legalMoves.length === 0) {
		return evaluateState(state, perspective);
	}

	const ordered = legalMoves
		.map((move) => ({ move, score: quickMoveScore(state, move) }))
		.sort((a, b) => b.score - a.score)
		.slice(0, Math.max(1, candidateLimit))
		.map((item) => item.move);

	const maximizing = state.currentPlayer === perspective;
	let best = maximizing ? -Infinity : Infinity;

	for (const move of ordered) {
		const next = applyMove(state, move.row, move.col).state;
		const value = minimax(
			next,
			depth - 1,
			perspective,
			alpha,
			beta,
			candidateLimit,
			cache,
		);
		if (maximizing) {
			best = Math.max(best, value);
			alpha = Math.max(alpha, best);
			if (alpha >= beta) break;
		} else {
			best = Math.min(best, value);
			beta = Math.min(beta, best);
			if (alpha >= beta) break;
		}
	}

	cache.set(key, { depth, value: best });
	return best;
}

function chooseMoveWithConfig(
	state: GameState,
	config: AiConfig,
	rng: () => number,
): Move {
	const legalMoves = listLegalMoves(state);
	if (legalMoves.length === 0) {
		throw new Error("No legal moves available");
	}

	if (rng() < config.mistakeProbability) {
		return legalMoves[Math.floor(rng() * legalMoves.length)] as Move;
	}

	const orderedMoves = legalMoves
		.map((move) => ({ move, score: quickMoveScore(state, move) }))
		.sort((a, b) => b.score - a.score)
		.slice(0, Math.max(1, config.candidateLimit))
		.map((item) => item.move);

	const cache = new Map<string, { depth: number; value: number }>();
	let bestScore = -Infinity;
	const scored: Array<{ move: Move; value: number }> = [];

	for (const move of orderedMoves) {
		const next = applyMove(state, move.row, move.col).state;
		const value = minimax(
			next,
			Math.max(0, config.depth - 1),
			state.currentPlayer,
			-Infinity,
			Infinity,
			config.candidateLimit,
			cache,
		);
		scored.push({ move, value });
		if (value > bestScore) bestScore = value;
	}

	const top = scored.filter((x) => x.value >= bestScore - 6);
	if (top.length === 1 || config.softmaxTemperature <= 0.01) {
		return top[0]?.move ?? orderedMoves[0] ?? legalMoves[0];
	}

	const weights = top.map((item) =>
		Math.exp((item.value - bestScore) / config.softmaxTemperature),
	);
	const weightSum = weights.reduce((acc, w) => acc + w, 0);
	let pick = rng() * weightSum;
	for (let i = 0; i < top.length; i += 1) {
		pick -= weights[i] ?? 0;
		if (pick <= 0) return top[i]?.move ?? legalMoves[0];
	}
	return top[top.length - 1]?.move ?? legalMoves[0];
}

function chooseRandomMove(state: GameState, rng: () => number): Move {
	const legalMoves = listLegalMoves(state);
	return legalMoves[Math.floor(rng() * legalMoves.length)] as Move;
}

function chooseGreedyMove(state: GameState, rng: () => number): Move {
	const legalMoves = listLegalMoves(state);
	const scored = legalMoves
		.map((move) => ({ move, score: quickMoveScore(state, move) }))
		.sort((a, b) => b.score - a.score);
	const best = scored[0]?.score ?? 0;
	const nearBest = scored
		.filter((item) => item.score >= best - 2)
		.map((item) => item.move);
	return nearBest[Math.floor(rng() * nearBest.length)] ?? legalMoves[0];
}

function configForDifficulty(level: number): AiConfig {
	const clamped = Math.max(1, Math.min(10, level));
	const depth = clamped <= 2 ? 1 : clamped <= 5 ? 2 : clamped <= 8 ? 3 : 4;
	const candidateLimit = clamped <= 2 ? 8 : clamped <= 5 ? 12 : clamped <= 8 ? 14 : 18;
	const mistakeProbability =
		clamped <= 2
			? 0.45
			: clamped <= 4
				? 0.25
				: clamped <= 6
					? 0.12
					: clamped <= 8
						? 0.06
						: 0.02;
	const softmaxTemperature =
		clamped <= 2 ? 2.0 : clamped <= 4 ? 1.0 : clamped <= 7 ? 0.55 : 0.22;

	return {
		depth,
		candidateLimit,
		mistakeProbability,
		softmaxTemperature,
	};
}

function playMatch(
	rows: number,
	cols: number,
	p1Difficulty: number,
	p2Difficulty: number,
	seed: number,
): { winner: PlayerId | null; turns: number } {
	let state = createInitialGameState(rows, cols);
	const rng = createRng(seed);
	let guard = 0;

	while (!state.winner && guard < 260) {
		const level = state.currentPlayer === "p1" ? p1Difficulty : p2Difficulty;
		const move = chooseMoveWithConfig(state, configForDifficulty(level), rng);
		state = applyMove(state, move.row, move.col).state;
		guard += 1;
	}

	return { winner: state.winner, turns: state.turnNumber };
}

function playAgentMatch(
	rows: number,
	cols: number,
	p1: { kind: AgentKind; level?: number },
	p2: { kind: AgentKind; level?: number },
	seed: number,
): { winner: PlayerId | null; turns: number } {
	let state = createInitialGameState(rows, cols);
	const rng = createRng(seed);
	let guard = 0;

	while (!state.winner && guard < 260) {
		const side = state.currentPlayer === "p1" ? p1 : p2;
		let move: Move;
		if (side.kind === "random") {
			move = chooseRandomMove(state, rng);
		} else if (side.kind === "greedy") {
			move = chooseGreedyMove(state, rng);
		} else {
			move = chooseMoveWithConfig(state, configForDifficulty(side.level ?? 6), rng);
		}
		state = applyMove(state, move.row, move.col).state;
		guard += 1;
	}

	return { winner: state.winner, turns: state.turnNumber };
}

function createRandomState(rows: number, cols: number, seed: number): GameState {
	const rng = createRng(seed);
	let state = createInitialGameState(rows, cols);
	const plies = 10 + Math.floor(rng() * 40);

	for (let i = 0; i < plies; i += 1) {
		if (state.winner) break;
		const legal = listLegalMoves(state);
		if (legal.length === 0) break;
		const move = legal[Math.floor(rng() * legal.length)] as Move;
		state = applyMove(state, move.row, move.col).state;
	}

	if (state.winner) {
		return createInitialGameState(rows, cols);
	}

	return state;
}

function runSeries(
	rows: number,
	cols: number,
	p1Difficulty: number,
	p2Difficulty: number,
	games: number,
	seedBase: number,
) {
	let p1Wins = 0;
	let p2Wins = 0;
	let draws = 0;
	let totalTurns = 0;

	for (let i = 0; i < games; i += 1) {
		const { winner, turns } = playMatch(
			rows,
			cols,
			p1Difficulty,
			p2Difficulty,
			seedBase + i * 17,
		);
		totalTurns += turns;
		if (winner === "p1") p1Wins += 1;
		else if (winner === "p2") p2Wins += 1;
		else draws += 1;
	}

	return {
		p1Difficulty,
		p2Difficulty,
		games,
		p1Wins,
		p2Wins,
		draws,
		averageTurns: Number((totalTurns / games).toFixed(1)),
		p1WinRate: Number((p1Wins / games).toFixed(3)),
	};
}

function runAgentSeries(
	rows: number,
	cols: number,
	p1: { kind: AgentKind; level?: number },
	p2: { kind: AgentKind; level?: number },
	games: number,
	seedBase: number,
) {
	let p1Wins = 0;
	let p2Wins = 0;
	let draws = 0;
	let totalTurns = 0;

	for (let i = 0; i < games; i += 1) {
		const { winner, turns } = playAgentMatch(
			rows,
			cols,
			p1,
			p2,
			seedBase + i * 29,
		);
		totalTurns += turns;
		if (winner === "p1") p1Wins += 1;
		else if (winner === "p2") p2Wins += 1;
		else draws += 1;
	}

	return {
		p1: `${p1.kind}${p1.level ? `-${p1.level}` : ""}`,
		p2: `${p2.kind}${p2.level ? `-${p2.level}` : ""}`,
		games,
		p1Wins,
		p2Wins,
		draws,
		averageTurns: Number((totalTurns / games).toFixed(1)),
		p1WinRate: Number((p1Wins / games).toFixed(3)),
	};
}

function runBalancedAgentSeries(
	rows: number,
	cols: number,
	a: { kind: AgentKind; level?: number },
	b: { kind: AgentKind; level?: number },
	gamesPerSeat: number,
	seedBase: number,
) {
	const aAsP1 = runAgentSeries(rows, cols, a, b, gamesPerSeat, seedBase);
	const bAsP1 = runAgentSeries(rows, cols, b, a, gamesPerSeat, seedBase + 5000);

	const aWins = aAsP1.p1Wins + bAsP1.p2Wins;
	const bWins = aAsP1.p2Wins + bAsP1.p1Wins;
	const draws = aAsP1.draws + bAsP1.draws;
	const games = gamesPerSeat * 2;
	const aWinRate = Number((aWins / games).toFixed(3));

	return {
		a: `${a.kind}${a.level ? `-${a.level}` : ""}`,
		b: `${b.kind}${b.level ? `-${b.level}` : ""}`,
		games,
		aWins,
		bWins,
		draws,
		aWinRate,
		seatBiasDelta: Number(
			Math.abs(aAsP1.p1WinRate - (1 - bAsP1.p1WinRate)).toFixed(3),
		),
	};
}

describe("AI difficulty research experiments", () => {
	test("difficulty ladder sanity checks on 6x9", () => {
		const sampleA = runSeries(6, 9, 6, 1, 4, 1001);
		const sampleB = runSeries(6, 9, 8, 4, 4, 2001);
		const sampleC = runSeries(6, 9, 10, 8, 4, 3001);

		console.table([sampleA, sampleB, sampleC]);

		expect(sampleA.p1WinRate).toBeGreaterThanOrEqual(0.5);
		expect(sampleB.p1WinRate).toBeGreaterThanOrEqual(0.5);
		expect(sampleC.p1WinRate).toBeGreaterThanOrEqual(0.25);
	}, 120000);

	test("move latency grows by difficulty level", () => {
		const levels = [1, 3, 5, 7, 9, 10];
		const states = Array.from({ length: 8 }, (_, i) =>
			createRandomState(6, 9, 7000 + i * 97),
		);
		const timings: Array<{ level: number; avgMs: number }> = [];

		for (const level of levels) {
			const config = configForDifficulty(level);
			const rng = createRng(9000 + level * 13);
			const started = Date.now();
			for (const state of states) {
				void chooseMoveWithConfig(state, config, rng);
			}
			const elapsed = Date.now() - started;
			timings.push({
				level,
				avgMs: Number((elapsed / states.length).toFixed(2)),
			});
		}

		console.table(timings);

		expect(timings[0]?.avgMs ?? 0).toBeLessThanOrEqual(25);
		expect(timings[timings.length - 1]?.avgMs ?? 0).toBeGreaterThanOrEqual(
			(timings[0]?.avgMs ?? 0) * 2,
		);
	}, 120000);

	test("algorithm comparison: random vs greedy vs minimax", () => {
		const r1 = runBalancedAgentSeries(
			6,
			9,
			{ kind: "greedy" },
			{ kind: "random" },
			2,
			12001,
		);
		const r2 = runBalancedAgentSeries(
			6,
			9,
			{ kind: "minimax", level: 6 },
			{ kind: "greedy" },
			2,
			13001,
		);
		const r3 = runBalancedAgentSeries(
			6,
			9,
			{ kind: "minimax", level: 9 },
			{ kind: "minimax", level: 6 },
			2,
			14001,
		);

		console.table([r1, r2, r3]);

		expect(r1.aWinRate).toBeGreaterThan(0.5);
		expect(r2.aWinRate).toBeGreaterThan(0.5);
		expect(r3.aWinRate).toBeGreaterThanOrEqual(0.25);
	}, 120000);
});
