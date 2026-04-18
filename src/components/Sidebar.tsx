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
			<div className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(10,11,18,0.9),rgba(7,7,11,0.82))] shadow-[0_24px_72px_rgba(0,0,0,0.3)] backdrop-blur-xl max-[960px]:h-auto max-[960px]:rounded-[22px]">
				<div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(58,204,224,0.12),transparent_68%)] opacity-90" />
				<div className="pointer-events-none absolute right-[-28px] bottom-16 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(224,92,58,0.12),transparent_72%)] blur-2xl" />

				<Link
					to="/"
					className="relative flex shrink-0 items-center gap-3 px-5 pt-5 pb-3 no-underline"
				>
					<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.035]">
						<AtomIcon />
					</div>
					<div className="min-w-0 flex-1 pr-1">
						<div className="text-[17px] leading-none font-semibold tracking-[0.11em] text-white">
							Atom Reaction
						</div>
					</div>
				</Link>

				<nav className="relative flex flex-1 flex-col gap-1 px-3 py-2 max-[960px]:flex-none max-[960px]:flex-row max-[960px]:gap-2 max-[960px]:overflow-x-auto max-[960px]:px-3 max-[960px]:pt-0">
					{NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
						const isActive = exact ? pathname === to : pathname.startsWith(to);
						return (
							<Link
								key={to}
								to={to}
								className="group flex shrink-0 items-center gap-3 rounded-[18px] px-3 py-3 no-underline transition-all duration-200 max-[960px]:min-w-fit max-[960px]:px-4 max-[960px]:py-3"
								style={{
									background: isActive
										? "rgba(255,255,255,0.055)"
										: "transparent",
								}}
							>
								<div
									className="flex h-10 w-10 items-center justify-center rounded-[14px] transition-colors duration-200"
									style={{
										background: isActive
											? "rgba(58,204,224,0.12)"
											: "rgba(255,255,255,0.035)",
										color: isActive
											? "oklch(0.72 0.19 195)"
											: "rgba(255,255,255,0.45)",
									}}
								>
									<Icon size={18} strokeWidth={1.9} />
								</div>
								<div className="min-w-0">
									<div
										className="text-[13px] font-semibold tracking-[0.08em] transition-colors duration-200"
										style={{
											color: isActive ? "white" : "rgba(255,255,255,0.58)",
										}}
									>
										{label}
									</div>
								</div>
							</Link>
						);
					})}
				</nav>

				<div className="relative mt-auto px-3 pb-3 pt-2">
					{isPending ? (
						<div className="h-14 rounded-[18px] bg-white/[0.04]" />
					) : session?.user ? (
						<div className="rounded-[20px] bg-white/[0.025] px-3 py-3">
							<div className="flex min-w-0 items-center gap-3">
								<div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-white/[0.05]">
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
									<div className="truncate text-[14px] font-semibold text-white/92">
										{session.user.name || session.user.email?.split("@")[0]}
									</div>
									<div className="truncate text-[11px] text-white/34 max-[420px]:hidden">
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
								className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-[16px] bg-white/[0.045] px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/56 transition hover:bg-white/[0.08] hover:text-white/84 active:scale-[0.98] min-[961px]:mt-0 min-[961px]:w-auto"
							>
								Sign Out
							</button>
						</div>
					) : (
						<Link
							to="/sign-in"
							className="flex h-12 items-center justify-center rounded-[18px] bg-[rgba(255,255,255,0.045)] text-[11px] font-semibold uppercase tracking-[0.24em] text-white/78 no-underline transition hover:bg-white/[0.08] active:scale-[0.98]"
						>
							Sign In
						</Link>
					)}
				</div>
			</div>
		</aside>
	);
}
