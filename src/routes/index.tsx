import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{ title: "Atom Reaction" },
			{
				name: "description",
				content:
					"A deterministic strategy game of cascading orb explosions. Play locally or challenge anyone online in real-time.",
			},
		],
	}),
	component: HomePage,
});

const STEPS = [
	{
		num: "01",
		title: "PLACE",
		desc: "On your turn, place one orb in any empty cell or a cell you already control.",
	},
	{
		num: "02",
		title: "EXPLODE",
		desc: "When a cell reaches its critical mass it explodes, sending orbs into every adjacent cell.",
	},
	{
		num: "03",
		title: "CHAIN",
		desc: "Explosions cascade. A single orb can flip the entire board in one chain reaction.",
	},
	{
		num: "04",
		title: "CONQUER",
		desc: "Last player with orbs remaining wins. No luck. No hidden state. Pure strategy.",
	},
];

const F = "'Oxanium', 'Segoe UI', sans-serif";

function HomePage() {
	return (
		<main
			style={{
				background: "#07070b",
				minHeight: "100vh",
				fontFamily: F,
				color: "white",
				position: "relative",
				overflowX: "hidden",
			}}
		>
			{/* Dot-grid background */}
			<div
				style={{
					position: "fixed",
					inset: 0,
					pointerEvents: "none",
					zIndex: 0,
					backgroundImage:
						"radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
					backgroundSize: "28px 28px",
				}}
			/>
			{/* Ambient glow — P1 cyan top-left */}
			<div
				style={{
					position: "fixed",
					top: "-20%",
					left: "-15%",
					width: 700,
					height: 700,
					background:
						"radial-gradient(circle, rgba(58,204,224,0.07) 0%, transparent 70%)",
					borderRadius: "50%",
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>
			{/* Ambient glow — P2 orange top-right */}
			<div
				style={{
					position: "fixed",
					top: "-15%",
					right: "-15%",
					width: 600,
					height: 600,
					background:
						"radial-gradient(circle, rgba(224,92,58,0.07) 0%, transparent 70%)",
					borderRadius: "50%",
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>

			<div style={{ position: "relative", zIndex: 1 }}>
				{/* ── HERO ── */}
				<section
					style={{
						maxWidth: 960,
						margin: "0 auto",
						padding: "clamp(80px, 12vh, 140px) 24px clamp(60px, 8vh, 100px)",
						textAlign: "center",
					}}
				>
					{/* Badge */}
					<div
						style={{
							display: "inline-block",
							marginBottom: 40,
							padding: "6px 18px",
							border: "1px solid rgba(255,255,255,0.1)",
							borderRadius: 100,
							fontSize: 11,
							letterSpacing: "0.35em",
							textTransform: "uppercase",
							color: "rgba(255,255,255,0.35)",
						}}
					>
						Chain Reaction · Strategy Game
					</div>

					{/* Title */}
					<h1
						style={{
							margin: "0 0 28px",
							fontSize: "clamp(72px, 12vw, 128px)",
							fontWeight: 800,
							letterSpacing: "-0.04em",
							lineHeight: 0.92,
						}}
					>
						<span style={{ display: "block", color: "white" }}>ATOM</span>
						<span
							style={{
								display: "block",
								background:
									"linear-gradient(90deg, oklch(0.72 0.19 195), oklch(0.72 0.19 23))",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								backgroundClip: "text",
							}}
						>
							REACTION
						</span>
					</h1>

					{/* Subtitle */}
					<p
						style={{
							margin: "0 auto 52px",
							fontSize: 16,
							lineHeight: 1.8,
							color: "rgba(255,255,255,0.42)",
							maxWidth: 440,
						}}
					>
						A deterministic strategy game of cascading explosions. Place orbs,
						trigger chain reactions, outlast your opponent.
					</p>

					{/* CTAs */}
					<div
						style={{
							display: "flex",
							gap: 12,
							justifyContent: "center",
							flexWrap: "wrap",
						}}
					>
						<Link
							to="/play"
							style={{
								display: "inline-flex",
								alignItems: "center",
								padding: "14px 32px",
								background: "rgba(224,92,58,0.14)",
								border: "1px solid rgba(224,92,58,0.4)",
								borderRadius: 14,
								color: "white",
								textDecoration: "none",
								fontSize: 13,
								fontWeight: 700,
								letterSpacing: "0.1em",
								textTransform: "uppercase",
							}}
						>
							PLAY NOW →
						</Link>
						<a
							href="#how-to-play"
							style={{
								display: "inline-flex",
								alignItems: "center",
								padding: "14px 32px",
								background: "rgba(255,255,255,0.03)",
								border: "1px solid rgba(255,255,255,0.08)",
								borderRadius: 14,
								color: "rgba(255,255,255,0.55)",
								textDecoration: "none",
								fontSize: 13,
								fontWeight: 600,
								letterSpacing: "0.1em",
								textTransform: "uppercase",
							}}
						>
							HOW TO PLAY
						</a>
					</div>
				</section>

				{/* Divider */}
				<div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
					<div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
				</div>

				{/* ── HOW IT WORKS ── */}
				<section
					id="how-to-play"
					style={{
						maxWidth: 960,
						margin: "0 auto",
						padding: "clamp(60px, 8vh, 96px) 24px",
					}}
				>
					<p
						style={{
							textAlign: "center",
							fontSize: 11,
							letterSpacing: "0.35em",
							textTransform: "uppercase",
							color: "rgba(255,255,255,0.22)",
							margin: "0 0 48px",
						}}
					>
						HOW IT WORKS
					</p>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
							gap: 12,
						}}
					>
						{STEPS.map(({ num, title, desc }) => (
							<div
								key={num}
								style={{
									padding: "26px 22px",
									border: "1px solid rgba(255,255,255,0.07)",
									borderRadius: 20,
									background: "rgba(255,255,255,0.025)",
								}}
							>
								<div
									style={{
										fontSize: 11,
										letterSpacing: "0.3em",
										color: "rgba(255,255,255,0.2)",
										marginBottom: 14,
									}}
								>
									{num}
								</div>
								<div
									style={{
										fontSize: 15,
										fontWeight: 700,
										marginBottom: 10,
										letterSpacing: "0.06em",
									}}
								>
									{title}
								</div>
								<p
									style={{
										fontSize: 13,
										color: "rgba(255,255,255,0.42)",
										lineHeight: 1.75,
										margin: 0,
									}}
								>
									{desc}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* Divider */}
				<div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
					<div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
				</div>

				{/* ── GAME MODES ── */}
				<section
					style={{
						maxWidth: 960,
						margin: "0 auto",
						padding: "clamp(60px, 8vh, 96px) 24px clamp(80px, 12vh, 140px)",
					}}
				>
					<p
						style={{
							textAlign: "center",
							fontSize: 11,
							letterSpacing: "0.35em",
							textTransform: "uppercase",
							color: "rgba(255,255,255,0.22)",
							margin: "0 0 48px",
						}}
					>
						GAME MODES
					</p>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
							gap: 16,
						}}
					>
						{/* Local */}
						<Link
							to="/play/local"
							style={{ textDecoration: "none", display: "block" }}
						>
							<div
								style={{
									padding: "34px 30px",
									border: "1px solid rgba(255,255,255,0.08)",
									borderRadius: 24,
									background: "rgba(255,255,255,0.025)",
									height: "100%",
									boxSizing: "border-box",
								}}
							>
								<div
									style={{
										fontSize: 11,
										letterSpacing: "0.35em",
										textTransform: "uppercase",
										color: "rgba(255,255,255,0.25)",
										marginBottom: 18,
									}}
								>
									OFFLINE
								</div>
								<div
									style={{
										fontSize: 22,
										fontWeight: 700,
										color: "white",
										marginBottom: 12,
									}}
								>
									Local Game
								</div>
								<p
									style={{
										fontSize: 14,
										color: "rgba(255,255,255,0.42)",
										lineHeight: 1.7,
										margin: "0 0 24px",
									}}
								>
									Pass-and-play on one device. Choose your board size and
									challenge a friend locally.
								</p>
								<span
									style={{
										fontSize: 12,
										fontWeight: 600,
										letterSpacing: "0.08em",
										textTransform: "uppercase",
										color: "rgba(255,255,255,0.35)",
									}}
								>
									PLAY LOCAL →
								</span>
							</div>
						</Link>

						{/* Online */}
						<Link
							to="/play/online"
							style={{ textDecoration: "none", display: "block" }}
						>
							<div
								style={{
									padding: "34px 30px",
									border: "1px solid rgba(224,92,58,0.22)",
									borderRadius: 24,
									background: "rgba(224,92,58,0.055)",
									height: "100%",
									boxSizing: "border-box",
								}}
							>
								<div
									style={{
										fontSize: 11,
										letterSpacing: "0.35em",
										textTransform: "uppercase",
										color: "rgba(255,255,255,0.25)",
										marginBottom: 18,
									}}
								>
									REALTIME
								</div>
								<div
									style={{
										fontSize: 22,
										fontWeight: 700,
										color: "white",
										marginBottom: 12,
									}}
								>
									Online Game
								</div>
								<p
									style={{
										fontSize: 14,
										color: "rgba(255,255,255,0.42)",
										lineHeight: 1.7,
										margin: "0 0 24px",
									}}
								>
									Sign in and play against anyone, anywhere. Quick match or
									invite a friend to a private room.
								</p>
								<span
									style={{
										fontSize: 12,
										fontWeight: 600,
										letterSpacing: "0.08em",
										textTransform: "uppercase",
										color: "rgba(224,92,58,0.7)",
									}}
								>
									PLAY ONLINE →
								</span>
							</div>
						</Link>
					</div>
				</section>
			</div>
		</main>
	);
}
