import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Monitor, Swords, Wifi } from "lucide-react";
import { authClient } from "#/lib/auth-client";

const F = "'Oxanium', 'Segoe UI', sans-serif";

function AtomIcon() {
	return (
		<svg
			width={20}
			height={20}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<title>Atom Reaction</title>
			<circle cx="12" cy="12" r="2.5" fill="white" opacity="0.85" />
			<ellipse
				cx="12"
				cy="12"
				rx="9.5"
				ry="3.5"
				stroke="rgba(255,255,255,0.34)"
				strokeWidth="1"
				fill="none"
			/>
			<ellipse
				cx="12"
				cy="12"
				rx="9.5"
				ry="3.5"
				stroke="rgba(58,204,224,0.58)"
				strokeWidth="1"
				fill="none"
				transform="rotate(60 12 12)"
			/>
			<ellipse
				cx="12"
				cy="12"
				rx="9.5"
				ry="3.5"
				stroke="rgba(224,92,58,0.58)"
				strokeWidth="1"
				fill="none"
				transform="rotate(-60 12 12)"
			/>
		</svg>
	);
}

const NAV_ITEMS = [
	{ to: "/" as const, label: "Home", icon: Home, exact: true },
	{ to: "/play" as const, label: "Play Hub", icon: Swords, exact: true },
	{ to: "/play/online" as const, label: "Online", icon: Wifi, exact: false },
	{ to: "/play/local" as const, label: "Local", icon: Monitor, exact: false },
] as const;

export default function Sidebar() {
	const { data: session, isPending } = authClient.useSession();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	return (
		<aside
			className="fixed inset-y-0 left-0 z-40 w-[250px] px-4 py-4 max-[960px]:sticky max-[960px]:inset-y-auto max-[960px]:w-full max-[960px]:px-3 max-[960px]:py-3"
			style={{ fontFamily: F }}
		>
			<div className="relative flex h-full flex-col overflow-hidden rounded-[32px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(10,11,18,0.98),rgba(7,7,11,0.96))] shadow-[0_28px_90px_rgba(0,0,0,0.36)] backdrop-blur-xl max-[960px]:h-auto max-[960px]:rounded-[24px]">
				<div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(58,204,224,0.12),transparent_68%)] opacity-90" />
				<div className="pointer-events-none absolute right-[-28px] bottom-16 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(224,92,58,0.12),transparent_72%)] blur-2xl" />

				<Link
					to="/"
					className="relative flex shrink-0 items-center gap-3 px-5 pt-5 pb-4 no-underline"
				>
					<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
						<AtomIcon />
					</div>
					<div className="min-w-0">
						<div className="text-[10px] uppercase tracking-[0.34em] text-white/30">
							Chain Reaction
						</div>
						<div className="mt-1 truncate text-[18px] font-semibold tracking-[0.14em] text-white">
							Atom Reaction
						</div>
					</div>
				</Link>

				<nav className="relative flex flex-1 flex-col gap-2 px-3 py-3 max-[960px]:flex-none max-[960px]:flex-row max-[960px]:gap-2 max-[960px]:overflow-x-auto max-[960px]:px-3 max-[960px]:pt-0">
					{NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
						const isActive = exact ? pathname === to : pathname.startsWith(to);
						return (
							<Link
								key={to}
								to={to}
								className="group flex shrink-0 items-center gap-3 rounded-[22px] px-3 py-3 no-underline transition-all duration-200 max-[960px]:min-w-fit max-[960px]:px-4 max-[960px]:py-3"
								style={{
									background: isActive
										? "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))"
										: "transparent",
									boxShadow: isActive
										? "inset 0 1px 0 rgba(255,255,255,0.05), 0 16px 30px rgba(0,0,0,0.18)"
										: "none",
								}}
							>
								<div
									className="flex h-11 w-11 items-center justify-center rounded-[16px] transition-colors duration-200"
									style={{
										background: isActive
											? "rgba(58,204,224,0.14)"
											: "rgba(255,255,255,0.035)",
										color: isActive
											? "oklch(0.72 0.19 195)"
											: "rgba(255,255,255,0.45)",
									}}
								>
									<Icon size={18} strokeWidth={1.9} />
								</div>
								<div className="min-w-0 max-[960px]:pr-1">
									<div
										className="text-[13px] font-semibold tracking-[0.08em] transition-colors duration-200"
										style={{
											color: isActive ? "white" : "rgba(255,255,255,0.58)",
										}}
									>
										{label}
									</div>
									<div className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-white/22 max-[960px]:hidden">
										{isActive ? "Current" : "Open"}
									</div>
								</div>
							</Link>
						);
					})}
				</nav>

				<div className="relative mt-auto px-3 pb-3 pt-1">
					<div className="rounded-[26px] border border-white/[0.06] bg-white/[0.025] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
						{isPending ? (
							<div className="h-20 rounded-[18px] bg-white/[0.04]" />
						) : session?.user ? (
							<div className="flex flex-col gap-3">
								<div className="flex items-center gap-3">
									<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.05]">
										{session.user.image ? (
											<img
												src={session.user.image}
												alt={session.user.name ?? "User"}
												className="h-full w-full object-cover"
											/>
										) : (
											<span className="text-base font-semibold text-white/72">
												{session.user.name?.charAt(0).toUpperCase() ?? "U"}
											</span>
										)}
									</div>
									<div className="min-w-0 flex-1">
										<div className="truncate text-[15px] font-semibold text-white/92">
											{session.user.name || session.user.email?.split("@")[0]}
										</div>
										<div className="mt-1 truncate text-[11px] text-white/34">
											{session.user.email}
										</div>
									</div>
								</div>
								<button
									type="button"
									onClick={async () => {
										await fetch("/api/auth/sign-out", {
											method: "POST",
											credentials: "include",
											headers: { "Content-Type": "application/json" },
											body: "{}",
										});
										window.location.href = "/";
									}}
									className="inline-flex h-11 items-center justify-center rounded-[18px] bg-white/[0.05] px-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/56 transition hover:bg-white/[0.08] hover:text-white/84 active:scale-[0.98] max-[960px]:self-start"
								>
									Sign Out
								</button>
							</div>
						) : (
							<Link
								to="/sign-in"
								className="flex h-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,rgba(224,92,58,0.18),rgba(224,92,58,0.08))] text-[11px] font-semibold uppercase tracking-[0.28em] text-white/82 no-underline transition hover:brightness-110 active:scale-[0.98]"
							>
								Sign In
							</Link>
						)}
					</div>
				</div>
			</div>
		</aside>
	);
}
