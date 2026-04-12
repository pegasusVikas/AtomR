import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import ChainReactionBoard from "#/features/chain-reaction/components/ChainReactionBoard";
import GameOverlay from "#/features/chain-reaction/components/GameOverlay";
import { PLAYER_COLORS } from "#/features/chain-reaction/constants";
import {
	ONLINE_TURN_TIME_LIMIT_MS,
	type Board,
	type PlayerId,
} from "#/features/chain-reaction/shared";
import { getRecommendedSize } from "#/features/chain-reaction/utils/recommendedSize";
import { useResolvedGamePlayback } from "#/features/chain-reaction/useResolvedGamePlayback";
import { authClient } from "#/lib/auth-client";
import { requireSessionFn } from "#/lib/session-fns";

function cloneBoard(board: Board): Board {
	return board.map((row) => row.map((cell) => ({ ...cell })));
}

export const Route = createFileRoute("/play/match/$matchId")({
	beforeLoad: async () => {
		await requireSessionFn();
	},
	component: MatchPage,
});

function MatchPage() {
	const { matchId } = Route.useParams();
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const match = useQuery(api.online.getMatch, {
		matchId: matchId as Id<"matches">,
	});
	const claimTurnTimeout = useMutation(api.online.claimTurnTimeout);
	const submitMove = useMutation(api.online.submitMove);
	const startRematch = useMutation(api.online.startRematch);
	const [rematchPending, setRematchPending] = useState(false);
	const [nowMs, setNowMs] = useState(() => Date.now());
	const containerRef = useRef<HTMLDivElement>(null);
	const timeoutClaimedForRef = useRef<string | null>(null);
	const [boardDims, setBoardDims] = useState<{ w: number; h: number } | null>(
		null,
	);
	const viewerPlayerId = useMemo(() => {
		if (!session?.user || !match) return null;
		if (match.player1?.authUserId === session.user.id) return "p1";
		if (match.player2?.authUserId === session.user.id) return "p2";
		return null;
	}, [match, session?.user]);

	const matchState = useMemo(() => {
		if (!match) return null;
		return {
			board: match.board,
			rows: match.rows,
			cols: match.cols,
			currentPlayer: match.currentPlayer,
			turnNumber: match.turnNumber,
			hasPlayed: match.hasPlayed,
			eliminated: match.eliminated,
			winner: match.winner,
			phase: match.winner ? "gameOver" : "idle",
		} as const;
	}, [match]);

	const playback = useResolvedGamePlayback(
		matchState ?? {
			board: [],
			rows: 0,
			cols: 0,
			currentPlayer: "p1",
			turnNumber: 0,
			hasPlayed: { p1: false, p2: false },
			eliminated: { p1: false, p2: false },
			winner: null,
			phase: "idle",
		},
	);
	const {
		state: playbackState,
		isAnimating,
		activeExplosionKeys,
		activeCaptureKeys,
		activeExplosions,
		playEvents,
		resetToState,
	} = playback;
	const prevServerTurnRef = useRef<number | null>(null);
	const prevServerBoardRef = useRef<Board | null>(null);
	const [optimisticPlacement, setOptimisticPlacement] = useState<{
		row: number;
		col: number;
		player: PlayerId;
		baseTurn: number;
	} | null>(null);

	useEffect(() => {
		if (!matchState || !match) return;

		const previousTurn = prevServerTurnRef.current;
		const currentTurn = match.turnNumber;

		if (previousTurn === null) {
			resetToState(matchState);
		} else if (currentTurn === previousTurn) {
			if (!isAnimating) {
				resetToState(matchState);
			}
		} else if (
			currentTurn === previousTurn + 1 &&
			match.lastMoveEvents?.length &&
			prevServerBoardRef.current
		) {
			playEvents(
				match.lastMoveEvents,
				matchState,
				cloneBoard(prevServerBoardRef.current),
			);
		} else {
			resetToState(matchState);
		}

		prevServerTurnRef.current = currentTurn;
		prevServerBoardRef.current = cloneBoard(matchState.board);
	}, [match, matchState, isAnimating, playEvents, resetToState]);

	useEffect(() => {
		if (!optimisticPlacement || !match) return;
		if (match.turnNumber !== optimisticPlacement.baseTurn) {
			setOptimisticPlacement(null);
		}
	}, [match, optimisticPlacement]);

	useEffect(() => {
		if (!match || match.winner) return;
		setNowMs(Date.now());
		const timer = window.setInterval(() => {
			setNowMs(Date.now());
		}, 250);
		return () => window.clearInterval(timer);
	}, [match]);

	const turnDeadlineAt = match
		? match.lastMoveAt + ONLINE_TURN_TIME_LIMIT_MS
		: null;
	const msRemaining = turnDeadlineAt ? Math.max(0, turnDeadlineAt - nowMs) : 0;

	useEffect(() => {
		if (!session?.user || !match || !viewerPlayerId) return;
		if (match.winner || match.phase !== "idle") return;
		if (msRemaining > 0) return;

		const claimKey = `${match._id}:${match.turnNumber}`;
		if (timeoutClaimedForRef.current === claimKey) return;
		timeoutClaimedForRef.current = claimKey;

		void claimTurnTimeout({
			matchId: match._id,
			authUserId: session.user.id,
		})
			.then((result) => {
				if (!result.timedOut) {
					timeoutClaimedForRef.current = null;
				}
			})
			.catch(() => {
				timeoutClaimedForRef.current = null;
			});
	}, [claimTurnTimeout, match, msRemaining, session?.user, viewerPlayerId]);

	useEffect(() => {
		if (!matchState) return;
		const rec = getRecommendedSize();
		if (!boardDims && rec.rows && rec.cols) {
			// no-op, just trigger initial layout after mount
		}
	}, [boardDims, matchState]);

	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container || !matchState) return;
		function measure() {
			const { width, height } = container.getBoundingClientRect();
			if (!width || !height) return;
			const aspect = matchState.cols / matchState.rows;
			let w: number;
			let h: number;
			if (width / height > aspect) {
				h = height;
				w = h * aspect;
			} else {
				w = width;
				h = w / aspect;
			}
			setBoardDims({ w, h });
		}
		measure();
		const obs = new ResizeObserver(measure);
		obs.observe(container);
		return () => obs.disconnect();
	}, [matchState]);

	if (!session?.user || !match || !matchState) {
		return (
			<main className="min-h-[100dvh] bg-[#07070b] p-8 text-white">
				Loading match…
			</main>
		);
	}

	const activeColor = matchState.winner
		? PLAYER_COLORS[matchState.winner]
		: PLAYER_COLORS[matchState.currentPlayer];
	const secondsRemaining = Math.max(0, Math.ceil(msRemaining / 1000));
	const winnerName =
		matchState.winner === "p1"
			? (match.player1?.displayName ?? "Player 1")
			: matchState.winner === "p2"
				? (match.player2?.displayName ?? "Player 2")
				: null;
	const turnStatus = matchState.winner
		? match.phase === "abandoned"
			? `${winnerName} wins on time.`
			: `${winnerName} wins.`
		: matchState.currentPlayer === viewerPlayerId
			? `Your turn · ${secondsRemaining}s left`
			: `Opponent turn · ${secondsRemaining}s left`;
	const boardStyle: React.CSSProperties = boardDims
		? { width: `${boardDims.w}px`, height: `${boardDims.h}px` }
		: { width: "100%", height: "100%" };
	const cellSize = boardDims ? boardDims.w / matchState.cols : 0;
	const displayState = (() => {
		if (!optimisticPlacement) return playbackState;
		if (playbackState.turnNumber !== optimisticPlacement.baseTurn) {
			return playbackState;
		}

		const { row, col, player } = optimisticPlacement;
		if (
			row < 0 ||
			col < 0 ||
			row >= playbackState.rows ||
			col >= playbackState.cols
		) {
			return playbackState;
		}

		const target = playbackState.board[row][col];
		if (target.owner !== null && target.owner !== player) {
			return playbackState;
		}

		const nextBoard = cloneBoard(playbackState.board);
		nextBoard[row][col] = {
			owner: player,
			count: nextBoard[row][col].count + 1,
		};
		return {
			...playbackState,
			board: nextBoard,
		};
	})();

	return (
		<main
			className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#07070b] px-3 pt-5 pb-4 text-white"
			style={{ fontFamily: "'Oxanium', 'Segoe UI', sans-serif" }}
		>
			<div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 rounded-3xl border border-white/8 bg-white/[0.03] px-5 py-4">
				<div>
					<p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
						Match
					</p>
					<h1 className="mt-2 text-xl font-semibold">
						{match.player1?.displayName} vs {match.player2?.displayName}
					</h1>
					<p className="mt-1 text-sm text-white/55">
						You are {viewerPlayerId?.toUpperCase()}. {turnStatus}
					</p>
				</div>
				<div className="text-right">
					<p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
						Turn clock
					</p>
					<p
						className={`mt-2 font-mono text-lg ${
							!matchState.winner && secondsRemaining <= 5
								? "text-[#ff847d]"
								: "text-white"
						}`}
					>
						{matchState.winner ? "--" : `${secondsRemaining}s`}
					</p>
					<p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/40">
						board {match.rows}×{match.cols}
					</p>
				</div>
			</div>

			<div
				ref={containerRef}
				className="relative flex-1 min-h-0 flex items-center justify-center"
			>
				<div style={boardStyle} className="relative">
					<ChainReactionBoard
						state={displayState}
						activeColor={activeColor}
						isAnimating={isAnimating}
						activeExplosionKeys={activeExplosionKeys}
						activeCaptureKeys={activeCaptureKeys}
						activeExplosions={activeExplosions}
						cellSize={cellSize}
						onPlay={(row, col) => {
							if (
								!viewerPlayerId ||
								viewerPlayerId !== matchState.currentPlayer ||
								isAnimating ||
								optimisticPlacement !== null
							)
								return;

							setOptimisticPlacement({
								row,
								col,
								player: viewerPlayerId,
								baseTurn: match.turnNumber,
							});

							void submitMove({
								matchId: match._id,
								authUserId: session.user.id,
								row,
								col,
							}).catch(() => {
								setOptimisticPlacement(null);
								if (matchState) {
									resetToState(matchState);
								}
							});
						}}
					/>
					<GameOverlay
						state={playbackState}
						onReset={async () => {
							if (!session?.user || !match) return;
							if (match.rematchMatchId) {
								void navigate({
									to: "/play/match/$matchId",
									params: { matchId: match.rematchMatchId },
								});
								return;
							}
							setRematchPending(true);
							try {
								const result = await startRematch({
									matchId: match._id,
									authUserId: session.user.id,
								});
								void navigate({
									to: "/play/match/$matchId",
									params: { matchId: result.matchId },
								});
							} finally {
								setRematchPending(false);
							}
						}}
						resetLabel={
							match.rematchMatchId ? "new match ready →" : "play again"
						}
						resetPending={rematchPending}
					/>
				</div>
			</div>
		</main>
	);
}
