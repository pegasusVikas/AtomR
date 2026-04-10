import {
	Link,
	Outlet,
	createFileRoute,
	useRouterState,
} from "@tanstack/react-router";

export const Route = createFileRoute("/play")({
	head: () => ({
		meta: [
			{ title: "Chain Reaction" },
			{ name: "description", content: "Tactical chain-reaction board game." },
		],
	}),
	component: PlayRoute,
});

function PlayRoute() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	return pathname === "/play" ? <PlayHub /> : <Outlet />;
}

function PlayHub() {
	return (
		<main
			className="min-h-[100dvh] px-4 py-10"
			style={{
				background: "#07070b",
				fontFamily: "'Oxanium', 'Segoe UI', sans-serif",
			}}
		>
			<div className="mx-auto flex max-w-4xl flex-col gap-6">
				<div className="rounded-3xl border border-white/8 bg-white/[0.03] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
					<p className="text-[11px] uppercase tracking-[0.38em] text-white/35">
						Chain Reaction
					</p>
					<h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
						Choose your mode
					</h1>
					<p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
						Play locally on one screen, or sign in and start an online match
						with private-room invites.
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<Link
						to="/play/local"
						className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 no-underline transition-transform hover:scale-[1.01]"
					>
						<p className="text-[10px] uppercase tracking-[0.32em] text-white/35">
							Offline
						</p>
						<h2 className="mt-3 text-2xl font-semibold text-white">
							Local Game
						</h2>
						<p className="mt-2 text-sm leading-6 text-white/60">
							Pass-and-play on the same device with adjustable board size.
						</p>
					</Link>

					<Link
						to="/play/online"
						className="rounded-3xl border border-[oklch(0.72_0.19_23_/_0.22)] bg-[oklch(0.72_0.19_23_/_0.06)] p-6 no-underline transition-transform hover:scale-[1.01]"
					>
						<p className="text-[10px] uppercase tracking-[0.32em] text-white/35">
							Realtime
						</p>
						<h2 className="mt-3 text-2xl font-semibold text-white">
							Online Game
						</h2>
						<p className="mt-2 text-sm leading-6 text-white/60">
							Sign in, create a private room, and play live against another
							user.
						</p>
					</Link>
				</div>
			</div>
		</main>
	);
}
