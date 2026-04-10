import { Link } from "@tanstack/react-router";
import BetterAuthHeader from "../integrations/better-auth/header-user";
import ThemeToggle from "./ThemeToggle";

const F = "'Oxanium', 'Segoe UI', sans-serif";

function AtomIcon() {
	return (
		<svg
			width={22}
			height={22}
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
					<AtomIcon />
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
