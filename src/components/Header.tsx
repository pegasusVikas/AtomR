import { Link } from "@tanstack/react-router";
import BetterAuthHeader from "../integrations/better-auth/header-user";
import AtomReactionMark from "./brand/AtomReactionMark";
import ThemeToggle from "./ThemeToggle";

const F = "'Oxanium', 'Segoe UI', sans-serif";

export default function Header() {
	return (
		<header
			style={{
				position: "sticky",
				top: 0,
				zIndex: 50,
				borderBottom: "1px solid rgba(255,255,255,0.07)",
				background: "rgba(7,7,11,0.88)",
				backdropFilter: "blur(16px)",
				WebkitBackdropFilter: "blur(16px)",
				fontFamily: F,
			}}
		>
			<nav
				style={{
					maxWidth: 960,
					margin: "0 auto",
					padding: "0 24px",
					height: 60,
					display: "flex",
					alignItems: "center",
					gap: 8,
				}}
			>
				{/* Logo */}
				<Link
					to="/"
					style={{
						display: "flex",
						alignItems: "center",
						gap: 9,
						textDecoration: "none",
						flexShrink: 0,
					}}
				>
					<AtomReactionMark size={22} title="Atom Reaction" />
					<span
						style={{
							fontSize: 13,
							fontWeight: 700,
							letterSpacing: "0.1em",
							color: "white",
							textTransform: "uppercase",
						}}
					>
						Atom Reaction
					</span>
				</Link>

				<div style={{ flex: 1 }} />

				{/* Nav link */}
				<Link
					to="/play"
					style={{
						fontSize: 12,
						fontWeight: 600,
						letterSpacing: "0.1em",
						textTransform: "uppercase",
						color: "rgba(255,255,255,0.45)",
						textDecoration: "none",
						padding: "6px 12px",
					}}
				>
					PLAY
				</Link>

				{/* Auth widget */}
				<BetterAuthHeader />

				{/* Theme toggle */}
				<ThemeToggle />
			</nav>
		</header>
	);
}
