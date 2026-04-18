import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Flag, Home } from "lucide-react";
import {
	useEffect,
	useEffectEvent,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import ChainReactionBoard from "#/features/chain-reaction/components/ChainReactionBoard";
import GameOverlay from "#/features/chain-reaction/components/GameOverlay";
import { PLAYER_COLORS } from "#/features/chain-reaction/constants";
import {
	type Board,
	type LastMove,
	ONLINE_TURN_TIME_LIMIT_MS,
	ONLINE_VIEWER_HEARTBEAT_MS,
	type PlayerId,
} from "#/features/chain-reaction/shared";
import { useResolvedGamePlayback } from "#/features/chain-reaction/useResolvedGamePlayback";
import { getRecommendedSize } from "#/features/chain-reaction/utils/recommendedSize";
import { authClient } from "#/lib/auth-client";
import { requireSessionFn } from "#/lib/session-fns";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

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
	const syncViewer = useMutation(api.online.syncViewer);
	const claimTurnTimeout = useMutation(api.online.claimTurnTimeout);
	const submitMove = useMutation(api.online.submitMove);
	const startRematch = useMutation(api.online.startRematch);
	const resignMatch = useMutation(api.online.resignMatch);
	const [rematchPending, setRematchPending] = useState(false);
	const [resignPending, setResignPending] = useState(false);
	const [nowMs, setNowMs] = useState(() => Date.now());
	const containerRef = useRef<HTMLDivElement>(null);
	const timeoutClaimedForRef = useRef<string | null>(null);
	const [boardDims, setBoardDims] = useState<{ w: number; h: number } | null>(
		null,
	);
	const user = session?.user ?? null;
	const viewerPlayerId = useMemo(() => {
		if (!session?.user || !match) return null;
		if (match.player1?.authUserId === session.user.id) return "p1";
		if (match.player2?.authUserId === session.user.id) return "p2";
		return null;
	}, [match, session?.user]);
	const displayName = user?.name || user?.email || "Player";

	const heartbeatViewer = useEffectEvent(async () => {
		if (!user) return;
		await syncViewer({
			authUserId: user.id,
			displayName,
			email: user.email,
		});
	});

	useEffect(() => {
		if (!user) return;
		let cancelled = false;
		async function heartbeat() {
			if (cancelled) return;
			try {
				await heartbeatViewer();
			} catch {
				// Match should continue even if presence heartbeat fails.
			}
		}

		void heartbeat();
		const timer = window.setInterval(() => {
			void heartbeat();
		}, ONLINE_VIEWER_HEARTBEAT_MS);
		return () => {
			cancelled = true;
			window.clearInterval(timer);
		};
	}, [user]);

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
		turnNumber: number;
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
	const lastMove = useMemo<LastMove | null>(() => {
		if (optimisticPlacement) {
			return optimisticPlacement;
		}
		const placeEvent = match?.lastMoveEvents?.find(
			(event) => event.type === "place",
		);
		if (!placeEvent || !match) return null;
		return {
			row: placeEvent.row,
			col: placeEvent.col,
			player: placeEvent.player,
			turnNumber: match.turnNumber,
		};
	}, [match, optimisticPlacement]);

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

	if (!user || !match || !matchState) {
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
	const viewerName =
		viewerPlayerId === "p1"
			? (match.player1?.displayName ?? "You")
			: viewerPlayerId === "p2"
				? (match.player2?.displayName ?? "You")
				: "You";
	const opponentName =
		viewerPlayerId === "p1"
			? (match.player2?.displayName ?? "Opponent")
			: viewerPlayerId === "p2"
				? (match.player1?.displayName ?? "Opponent")
				: "Opponent";
	const winnerName =
		matchState.winner === "p1"
			? (match.player1?.displayName ?? "Player 1")
			: matchState.winner === "p2"
				? (match.player2?.displayName ?? "Player 2")
				: null;
	const turnStatus = matchState.winner
		? `${winnerName} wins`
		: matchState.currentPlayer === viewerPlayerId
			? "Your move"
			: "Opponent turn";
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
			<div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-3 rounded-[30px] bg-white/[0.025] px-3 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
				<button
					type="button"
					className="inline-flex h-12 items-center gap-2 rounded-full bg-white/[0.04] px-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/72 transition hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
					onClick={() => {
						void navigate({ to: "/" });
					}}
				>
					<Home size={16} strokeWidth={1.75} />
					<span className="max-[640px]:hidden">Home</span>
				</button>

				<div className="min-w-0 flex-1 rounded-[26px] bg-white/[0.03] px-4 py-3">
					<div className="flex items-center justify-between gap-3 max-[640px]:flex-col max-[640px]:items-start">
						<div className="min-w-0">
							<div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/38">
								<span>{turnStatus}</span>
								<span className="text-white/18">•</span>
								<span>
									{matchState.winner ? "finished" : `${secondsRemaining}s`}
								</span>
							</div>
							<div className="mt-2 flex min-w-0 items-center gap-2 text-sm font-semibold text-white max-[640px]:text-[13px]">
								<span className="truncate">{viewerName}</span>
								<span className="text-white/28">vs</span>
								<span className="truncate text-white/72">{opponentName}</span>
							</div>
						</div>

						<div className="flex items-center gap-2 self-stretch max-[640px]:w-full">
							<div className="grid min-w-0 flex-1 grid-cols-3 gap-2">
								{(
									[
										{
											id: "left",
											color:
												matchState.currentPlayer === "p1"
													? PLAYER_COLORS.p2
													: PLAYER_COLORS.p1,
										},
										{ id: "center", color: activeColor },
										{
											id: "right",
											color:
												matchState.currentPlayer === "p1"
													? PLAYER_COLORS.p2
													: PLAYER_COLORS.p1,
										},
									] as const
								).map(({ id, color }, index) => (
									<div
										key={id}
										className="flex h-12 items-center justify-center rounded-[22px] bg-white/[0.028] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
									>
										<span
											className="block h-5 w-5 rounded-full"
											style={{
												background: color,
												boxShadow: `0 0 24px ${color}55`,
												opacity: index === 1 ? 1 : 0.72,
												transform: index === 1 ? "scale(1)" : "scale(0.86)",
											}}
										/>
									</div>
								))}
							</div>
							<div
								className={`flex h-12 min-w-[76px] items-center justify-center rounded-[22px] bg-white/[0.04] px-4 text-lg font-semibold tracking-[-0.03em] ${
									!matchState.winner && secondsRemaining <= 5
										? "text-[#ff847d]"
										: "text-white/86"
								}`}
							>
								{matchState.winner ? "--" : `${secondsRemaining}s`}
							</div>
						</div>
					</div>
				</div>

				{!matchState.winner ? (
					<button
						type="button"
						disabled={resignPending}
						className="inline-flex h-12 items-center gap-2 rounded-full bg-[rgba(224,92,58,0.12)] px-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(255,159,134,0.92)] transition hover:bg-[rgba(224,92,58,0.18)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
						onClick={async () => {
							if (
								!window.confirm(
									"Resign this match? This immediately gives the win to your opponent.",
								)
							) {
								return;
							}
							setResignPending(true);
							try {
								await resignMatch({
									matchId: match._id,
									authUserId: session.user.id,
								});
							} finally {
								setResignPending(false);
							}
						}}
					>
						<Flag size={16} strokeWidth={1.75} />
						<span>{resignPending ? "Resigning…" : "Resign"}</span>
					</button>
				) : null}
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
						lastMove={lastMove}
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
								turnNumber: match.turnNumber + 1,
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
