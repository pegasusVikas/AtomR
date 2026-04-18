import {
	createFileRoute,
	Link,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { Bot, BrainCircuit, ChevronRight, Monitor, Wifi } from "lucide-react";

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
	const modes = [
		{
			to: "/play/local" as const,
			label: "Offline",
			title: "Local Game",
			copy: "Pass one device around the room and tune the board to the kind of chaos you want.",
			icon: Monitor,
			accent: "rgba(255,255,255,0.06)",
			glow: "rgba(255,255,255,0.08)",
			grid: "md:col-span-5",
		},
		{
			to: "/play/online" as const,
			label: "Realtime",
			title: "Online Match",
			copy: "Jump back into live matches, send private-room codes, and keep turns moving without lobby clutter.",
			icon: Wifi,
			accent: "rgba(224,92,58,0.12)",
			glow: "rgba(224,92,58,0.16)",
			grid: "md:col-span-7",
		},
		{
			to: "/play/training" as const,
			label: "Coach",
			title: "Training Mode",
			copy: "Use the ghost recommendation as a live sparring partner and compare your instinct to the engine.",
			icon: BrainCircuit,
			accent: "rgba(116,188,255,0.12)",
			glow: "rgba(116,188,255,0.18)",
			grid: "md:col-span-7",
		},
		{
			to: "/play/ai" as const,
			label: "Solo",
			title: "AI Game",
			copy: "Play a focused two-player board against the CPU and turn the dial when you want sharper punishment.",
			icon: Bot,
			accent: "rgba(101,214,114,0.11)",
			glow: "rgba(101,214,114,0.16)",
			grid: "md:col-span-5",
		},
	] as const;

	return (
		<main
			className="min-h-[100dvh] px-4 py-6 sm:px-6 sm:py-8"
			style={{
				background:
					"radial-gradient(circle at top, rgba(58,204,224,0.08), transparent 24%), radial-gradient(circle at 85% 18%, rgba(224,92,58,0.08), transparent 18%), #07070b",
				fontFamily: "'Oxanium', 'Segoe UI', sans-serif",
			}}
		>
			<div className="mx-auto flex max-w-[1380px] flex-col gap-4">
				<section className="relative overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,rgba(13,14,20,0.98),rgba(10,10,14,0.94))] px-5 py-6 shadow-[0_28px_100px_rgba(0,0,0,0.34)] ring-1 ring-white/[0.06] sm:px-7 sm:py-8">
					<div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_top_right,rgba(58,204,224,0.13),transparent_56%),radial-gradient(circle_at_80%_70%,rgba(224,92,58,0.14),transparent_42%)] md:block" />
					<div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.9fr)] md:items-end">
						<div className="relative">
							<p className="text-[10px] uppercase tracking-[0.42em] text-white/30">
								Play Hub
							</p>
							<h1 className="mt-3 max-w-[8ch] text-4xl leading-[0.92] font-semibold tracking-[-0.06em] text-white sm:text-5xl">
								Pick the board you actually want.
							</h1>
							<p className="mt-4 max-w-[56ch] text-sm leading-7 text-white/58 sm:text-[15px]">
								Local pass-and-play, live coaching, CPU practice, or realtime
								matches. Same game loop. Different pressure.
							</p>
						</div>

						<div className="relative grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
							<div className="rounded-[24px] bg-white/[0.04] px-4 py-4 ring-1 ring-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
								<div className="text-[10px] uppercase tracking-[0.34em] text-white/30">
									Local
								</div>
								<div className="mt-3 text-lg font-semibold text-white">
									One device
								</div>
							</div>
							<div className="rounded-[24px] bg-white/[0.04] px-4 py-4 ring-1 ring-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
								<div className="text-[10px] uppercase tracking-[0.34em] text-white/30">
									Training
								</div>
								<div className="mt-3 text-lg font-semibold text-white">
									Ghost coach
								</div>
							</div>
							<div className="rounded-[24px] bg-white/[0.04] px-4 py-4 ring-1 ring-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
								<div className="text-[10px] uppercase tracking-[0.34em] text-white/30">
									Online
								</div>
								<div className="mt-3 text-lg font-semibold text-white">
									Resume live
								</div>
							</div>
						</div>
					</div>
				</section>

				<div className="grid gap-4 md:grid-cols-12">
					{modes.map(
						({ to, label, title, copy, icon: Icon, accent, glow, grid }) => (
							<Link
								key={to}
								to={to}
								className={`group relative overflow-hidden rounded-[30px] px-5 py-5 no-underline transition duration-300 hover:-translate-y-0.5 active:translate-y-px sm:px-6 sm:py-6 ${grid}`}
								style={{
									background:
										"linear-gradient(180deg, rgba(16,17,23,0.98), rgba(11,11,15,0.95))",
									boxShadow:
										"0 22px 64px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.04)",
								}}
							>
								<div
									className="pointer-events-none absolute inset-0 opacity-90 transition duration-300 group-hover:opacity-100"
									style={{
										background: `radial-gradient(circle at top right, ${glow}, transparent 45%)`,
									}}
								/>
								<div
									className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/8"
									aria-hidden="true"
								/>
								<div className="relative flex h-full flex-col gap-12 sm:min-h-[250px]">
									<div className="flex items-start justify-between gap-4">
										<div>
											<p className="text-[10px] uppercase tracking-[0.34em] text-white/34">
												{label}
											</p>
											<h2 className="mt-4 max-w-[9ch] text-3xl leading-[0.98] font-semibold tracking-[-0.05em] text-white sm:text-4xl">
												{title}
											</h2>
										</div>
										<div
											className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ring-1 ring-white/[0.06]"
											style={{ background: accent }}
										>
											<Icon
												size={20}
												strokeWidth={1.9}
												className="text-white/78"
											/>
										</div>
									</div>

									<div className="relative mt-auto">
										<p className="max-w-[34ch] text-sm leading-7 text-white/56 sm:text-[15px]">
											{copy}
										</p>
										<div className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/72 transition group-hover:text-white">
											Open
											<ChevronRight size={15} strokeWidth={1.8} />
										</div>
									</div>
								</div>
							</Link>
						),
					)}
				</div>
			</div>
		</main>
	);
}
