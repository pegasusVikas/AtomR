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
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: 220,
				height: "100dvh",
				zIndex: 40,
				display: "flex",
				flexDirection: "column",
				background: "rgba(7,7,11,0.98)",
				borderRight: "1px solid rgba(255,255,255,0.07)",
				fontFamily: F,
			}}
		>
			{/* Brand */}
			<Link
				to="/"
				style={{
					display: "flex",
					alignItems: "center",
					gap: 10,
					padding: "20px 18px 18px",
					textDecoration: "none",
					borderBottom: "1px solid rgba(255,255,255,0.05)",
					flexShrink: 0,
				}}
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
			<nav
				style={{
					flex: 1,
					padding: "10px 10px",
					display: "flex",
					flexDirection: "column",
					gap: 2,
					overflowY: "auto",
				}}
			>
				{NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
					const isActive = exact ? pathname === to : pathname.startsWith(to);
					return (
						<Link
							key={to}
							to={to}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 10,
								padding: "9px 12px",
								borderRadius: 10,
								textDecoration: "none",
								fontSize: 13,
								fontWeight: 600,
								letterSpacing: "0.04em",
								transition: "color 0.15s, background 0.15s",
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
			<div
				style={{
					padding: "12px 12px",
					borderTop: "1px solid rgba(255,255,255,0.06)",
					flexShrink: 0,
				}}
			>
				{isPending ? (
					<div
						style={{
							height: 36,
							borderRadius: 10,
							background: "rgba(255,255,255,0.04)",
						}}
					/>
				) : session?.user ? (
					<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
						<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
							<div style={{ minWidth: 0 }}>
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
								width: "100%",
							}}
						>
							Sign Out
						</button>
					</div>
				) : (
					<Link
						to="/sign-in"
						style={{
							display: "block",
							textAlign: "center",
							padding: "9px 0",
							background: "rgba(224,92,58,0.08)",
							border: "1px solid rgba(224,92,58,0.22)",
							borderRadius: 10,
							color: "rgba(255,255,255,0.65)",
							textDecoration: "none",
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
