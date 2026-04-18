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
				stroke="rgba(255,255,255,0.4)"
				strokeWidth="1"
				fill="none"
			/>
			<ellipse
				cx="12"
				cy="12"
				rx="9.5"
				ry="3.5"
				stroke="rgba(58,204,224,0.45)"
				strokeWidth="1"
				fill="none"
				transform="rotate(60 12 12)"
			/>
			<ellipse
				cx="12"
				cy="12"
				rx="9.5"
				ry="3.5"
				stroke="rgba(224,92,58,0.45)"
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
			className="fixed top-0 left-0 z-40 flex h-dvh w-[220px] flex-col border-r border-white/[0.07] bg-[rgba(7,7,11,0.98)] max-[960px]:sticky max-[960px]:h-auto max-[960px]:w-full max-[960px]:border-r-0 max-[960px]:border-b max-[960px]:backdrop-blur-xl"
			style={{ fontFamily: F }}
		>
			{/* Brand */}
			<Link
				to="/"
				className="flex shrink-0 items-center gap-2.5 border-b border-white/[0.05] px-[18px] pt-5 pb-[18px] no-underline max-[960px]:px-4 max-[960px]:py-4"
			>
				<AtomIcon />
				<span
					style={{
						fontSize: 12,
						fontWeight: 700,
						letterSpacing: "0.1em",
						color: "white",
						textTransform: "uppercase",
					}}
				>
					Atom Reaction
				</span>
			</Link>

			{/* Nav */}
			<nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-2.5 max-[960px]:flex-none max-[960px]:flex-row max-[960px]:gap-2 max-[960px]:overflow-x-auto max-[960px]:overflow-y-hidden max-[960px]:px-4 max-[960px]:py-3">
				{NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
					const isActive = exact ? pathname === to : pathname.startsWith(to);
					return (
						<Link
							key={to}
							to={to}
							className="flex shrink-0 items-center gap-2.5 rounded-[10px] px-3 py-[9px] no-underline transition-[color,background] duration-150 max-[960px]:whitespace-nowrap"
							style={{
								fontSize: 13,
								fontWeight: 600,
								letterSpacing: "0.04em",
								color: isActive ? "white" : "rgba(255,255,255,0.42)",
								background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
							}}
						>
							<Icon
								size={15}
								strokeWidth={2}
								style={{
									opacity: isActive ? 1 : 0.6,
									color: isActive ? "oklch(0.72 0.19 195)" : "currentColor",
									flexShrink: 0,
								}}
							/>
							{label}
						</Link>
					);
				})}
			</nav>

			{/* Auth */}
			<div className="shrink-0 border-t border-white/[0.06] px-3 py-3 max-[960px]:px-4">
				{isPending ? (
					<div className="h-9 rounded-[10px] bg-white/[0.04]" />
				) : session?.user ? (
					<div className="flex flex-col gap-2 max-[960px]:gap-3">
						<div className="flex items-center gap-2">
							<div
								style={{
									width: 28,
									height: 28,
									borderRadius: "50%",
									background: "rgba(255,255,255,0.08)",
									border: "1px solid rgba(255,255,255,0.12)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
									overflow: "hidden",
								}}
							>
								{session.user.image ? (
									<img
										src={session.user.image}
										alt={session.user.name ?? "User"}
										style={{
											width: "100%",
											height: "100%",
											objectFit: "cover",
										}}
									/>
								) : (
									<span
										style={{
											fontSize: 11,
											fontWeight: 700,
											color: "rgba(255,255,255,0.6)",
										}}
									>
										{session.user.name?.charAt(0).toUpperCase() ?? "U"}
									</span>
								)}
							</div>
							<div style={{ minWidth: 0, flex: 1 }}>
								<div
									style={{
										fontSize: 12,
										fontWeight: 600,
										color: "rgba(255,255,255,0.9)",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{session.user.name || session.user.email?.split("@")[0]}
								</div>
								<div
									style={{
										fontSize: 10,
										color: "rgba(255,255,255,0.28)",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										display: "block",
									}}
								>
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
							className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] max-[960px]:w-auto max-[960px]:self-start max-[960px]:px-4"
							style={{
								padding: "7px 0",
								background: "rgba(255,255,255,0.04)",
								border: "1px solid rgba(255,255,255,0.08)",
								borderRadius: 8,
								color: "rgba(255,255,255,0.4)",
								fontSize: 10,
								fontWeight: 700,
								letterSpacing: "0.12em",
								textTransform: "uppercase",
								cursor: "pointer",
								fontFamily: F,
							}}
						>
							Sign Out
						</button>
					</div>
				) : (
					<Link
						to="/sign-in"
						className="block rounded-[10px] border border-[rgba(224,92,58,0.22)] bg-[rgba(224,92,58,0.08)] px-4 py-[9px] text-center no-underline max-[960px]:inline-block"
						style={{
							color: "rgba(255,255,255,0.65)",
							fontSize: 11,
							fontWeight: 700,
							letterSpacing: "0.12em",
							textTransform: "uppercase",
						}}
					>
						Sign In
					</Link>
				)}
			</div>
		</aside>
	);
}
