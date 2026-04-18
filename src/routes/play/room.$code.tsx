import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { authClient } from "#/lib/auth-client";
import { requireSessionFn } from "#/lib/session-fns";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/play/room/$code")({
	beforeLoad: async () => {
		await requireSessionFn();
	},
	component: JoinRoomPage,
});

function JoinRoomPage() {
	const navigate = useNavigate();
	const { code } = Route.useParams();
	const { data: session } = authClient.useSession();
	const user = session?.user ?? null;
	const room = useQuery(api.online.getRoomByCode, { code });
	const joinPrivateRoom = useMutation(api.online.joinPrivateRoom);
	const [isJoining, setIsJoining] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!user) return null;

	const isLoading = room === undefined;
	const isNotFound = room === null;
	const isExpired = room != null && room.expiresAt < Date.now();
	const hasActiveMatch = room?.matchId != null;

	async function handleJoin() {
		setError(null);
		setIsJoining(true);
		try {
			const result = await joinPrivateRoom({ code });
			if (result.matchId) {
				await navigate({
					to: "/play/match/$matchId",
					params: { matchId: result.matchId },
				});
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not join room.");
		} finally {
			setIsJoining(false);
		}
	}

	return (
		<main
			className="min-h-[100dvh] bg-[#07070b] px-4 py-10 text-white"
			style={{ fontFamily: "'Oxanium', 'Segoe UI', sans-serif" }}
		>
			<div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl border border-white/8 bg-white/[0.03] p-8">
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-[11px] uppercase tracking-[0.38em] text-white/35">
							Private Room
						</p>
						<h1 className="mt-3 font-mono text-4xl font-semibold tracking-[0.15em]">
							{code}
						</h1>
					</div>
					<Link
						to="/play/online"
						className="mt-1 rounded-full border border-white/10 px-4 py-2 text-xs text-white/45 no-underline transition-colors hover:text-white/70"
					>
						← Back
					</Link>
				</div>

				{isLoading ? (
					<p className="text-sm text-white/45">Looking up room…</p>
				) : isNotFound ? (
					<RoomError
						title="Room not found"
						detail="No room with that code exists. Double-check the code and try again."
					/>
				) : isExpired ? (
					<RoomError
						title="Room has expired"
						detail="This room was open for an hour and has now expired. Ask your opponent to create a new one."
					/>
				) : (
					<>
						<div className="grid gap-1 rounded-2xl border border-white/8 bg-black/20 px-5 py-4">
							<p className="text-[10px] uppercase tracking-[0.32em] text-white/35">
								Board Size
							</p>
							<p className="mt-1 font-mono text-2xl">
								{room?.rows}×{room?.cols}
							</p>
						</div>

						{hasActiveMatch ? (
							<>
								<p className="text-sm text-white/60">
									A match is already in progress for this room.
								</p>
								<button
									type="button"
									className="rounded-full bg-[oklch(0.72_0.19_23)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#07070b]"
									onClick={handleJoin}
									disabled={isJoining}
								>
									{isJoining ? "Opening…" : "Open Match"}
								</button>
							</>
						) : (
							<>
								<p className="text-sm text-white/60">
									Join as the second player to start the match.
								</p>
								<button
									type="button"
									className="rounded-full bg-[oklch(0.72_0.19_23)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#07070b] transition-opacity disabled:opacity-50"
									onClick={handleJoin}
									disabled={isJoining}
								>
									{isJoining ? "Joining…" : "Join Room"}
								</button>
							</>
						)}

						{error ? (
							<p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
								{error}
							</p>
						) : null}
					</>
				)}
			</div>
		</main>
	);
}

function RoomError({ title, detail }: { title: string; detail: string }) {
	return (
		<>
			<div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4">
				<p className="font-semibold text-red-300">{title}</p>
				<p className="mt-1 text-sm text-red-300/70">{detail}</p>
			</div>
			<Link
				to="/play/online"
				className="rounded-full border border-white/12 px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.24em] text-white no-underline transition-colors hover:bg-white/5"
			>
				Back to Lobby
			</Link>
		</>
	);
}
