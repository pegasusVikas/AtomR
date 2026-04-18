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
			{ title: "Atom Reaction" },
			{ name: "description", content: "Pick a mode and start a match." },
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
			title: "Local",
			copy: "One device. Shared turns.",
			foot: "Pass and play",
			icon: Monitor,
			accent: "rgba(255,255,255,0.06)",
			glow: "rgba(255,255,255,0.08)",
			grid: "md:col-span-5",
			height: "sm:min-h-[210px]",
		},
		{
			to: "/play/online" as const,
			label: "Realtime",
			title: "Online",
			copy: "Live turns. Private rooms.",
			foot: "Resume or queue",
			icon: Wifi,
			accent: "rgba(224,92,58,0.12)",
			glow: "rgba(224,92,58,0.16)",
			grid: "md:col-span-7",
			height: "sm:min-h-[236px]",
		},
		{
			to: "/play/training" as const,
			label: "Coach",
			title: "Training",
			copy: "Ghost hints every turn.",
			foot: "Compare instinct",
			icon: BrainCircuit,
			accent: "rgba(116,188,255,0.12)",
			glow: "rgba(116,188,255,0.18)",
			grid: "md:col-span-7",
			height: "sm:min-h-[228px]",
		},
		{
			to: "/play/ai" as const,
			label: "Solo",
			title: "AI",
			copy: "Play the CPU. Raise the heat.",
			foot: "Difficulty ladder",
			icon: Bot,
			accent: "rgba(101,214,114,0.11)",
			glow: "rgba(101,214,114,0.16)",
			grid: "md:col-span-5",
			height: "sm:min-h-[202px]",
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
			<div className="mx-auto flex max-w-[1380px] flex-col gap-3">
				<section className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,rgba(13,14,20,0.94),rgba(10,10,14,0.88))] px-5 py-5 shadow-[0_24px_88px_rgba(0,0,0,0.32)] sm:px-6 sm:py-6">
					<div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_top_right,rgba(58,204,224,0.13),transparent_56%),radial-gradient(circle_at_80%_70%,rgba(224,92,58,0.14),transparent_42%)] md:block" />
					<div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(220px,0.75fr)] md:items-end">
						<div className="relative">
							<p className="text-[10px] uppercase tracking-[0.42em] text-white/30">
								Play Hub
							</p>
							<h1 className="mt-2 max-w-[7ch] text-[2.6rem] leading-[0.92] font-semibold tracking-[-0.07em] text-white sm:text-[4rem]">
								Choose play.
							</h1>
							<p className="mt-3 max-w-[34ch] text-sm leading-6 text-white/56 sm:text-[15px]">
								Local, coached, CPU, or live.
							</p>
						</div>

						<div className="relative">
							<div className="grid gap-2 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
								<div className="rounded-[18px] bg-white/[0.03] px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-white/58">
									Local
								</div>
								<div className="rounded-[18px] bg-white/[0.03] px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-white/58">
									Coach
								</div>
								<div className="rounded-[18px] bg-white/[0.03] px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-white/58">
									Live
								</div>
							</div>
						</div>
					</div>
				</section>

				<div className="grid gap-3 md:grid-cols-12">
					{modes.map(
						({
							to,
							label,
							title,
							copy,
							foot,
							icon: Icon,
							accent,
							glow,
							grid,
							height,
						}) => (
							<Link
								key={to}
								to={to}
								className={`group relative overflow-hidden rounded-[28px] px-5 py-5 no-underline transition duration-300 hover:-translate-y-0.5 active:translate-y-px sm:px-6 sm:py-5 ${grid} ${height}`}
								style={{
									background:
										"linear-gradient(180deg, rgba(16,17,23,0.96), rgba(11,11,15,0.92))",
									boxShadow:
										"0 18px 52px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)",
								}}
							>
								<div
									className="pointer-events-none absolute inset-0 opacity-90 transition duration-300 group-hover:opacity-100"
									style={{
										background: `radial-gradient(circle at top right, ${glow}, transparent 45%)`,
									}}
								/>
								<div className="relative flex h-full flex-col gap-6">
									<div className="flex items-start justify-between gap-4">
										<div>
											<p className="text-[10px] uppercase tracking-[0.34em] text-white/34">
												{label}
											</p>
											<h2 className="mt-3 max-w-[7ch] text-[2.15rem] leading-[0.95] font-semibold tracking-[-0.06em] text-white sm:text-[2.9rem]">
												{title}
											</h2>
										</div>
										<div
											className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px]"
											style={{ background: accent }}
										>
											<Icon
												size={19}
												strokeWidth={1.9}
												className="text-white/78"
											/>
										</div>
									</div>

									<div className="relative mt-auto flex items-end justify-between gap-4">
										<div>
											<p className="max-w-[22ch] text-sm leading-6 text-white/56 sm:text-[15px]">
												{copy}
											</p>
											<p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-white/28">
												{foot}
											</p>
										</div>
										<div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.045] text-white/72 transition group-hover:bg-white/[0.08] group-hover:text-white">
											<ChevronRight size={16} strokeWidth={1.9} />
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
