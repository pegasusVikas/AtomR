import { Link } from "@tanstack/react-router";

const F = "'Oxanium', 'Segoe UI', sans-serif";

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer
			style={{
				borderTop: "1px solid rgba(255,255,255,0.06)",
				padding: "28px 24px",
				fontFamily: F,
				background: "#07070b",
			}}
		>
			<div
				style={{
					maxWidth: 960,
					margin: "0 auto",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					gap: 16,
					flexWrap: "wrap",
				}}
			>
				<span
					style={{
						fontSize: 12,
						color: "rgba(255,255,255,0.2)",
						letterSpacing: "0.03em",
					}}
				>
					© {year} Atom Reaction
				</span>
				<Link
					to="/play"
					style={{
						fontSize: 11,
						fontWeight: 600,
						letterSpacing: "0.1em",
						textTransform: "uppercase",
						color: "rgba(255,255,255,0.2)",
						textDecoration: "none",
					}}
				>
					PLAY →
				</Link>
			</div>
		</footer>
	);
}
