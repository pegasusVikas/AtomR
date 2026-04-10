import { authClient } from "#/lib/auth-client";
import { Link } from "@tanstack/react-router";

const F = "'Oxanium', 'Segoe UI', sans-serif";

export default function BetterAuthHeader() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div
				style={{
					width: 32,
					height: 32,
					borderRadius: "50%",
					background: "rgba(255,255,255,0.06)",
				}}
			/>
		);
	}

	if (session?.user) {
		return (
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
							style={{ width: "100%", height: "100%", objectFit: "cover" }}
						/>
					) : (
						<span
							style={{
								fontSize: 11,
								fontWeight: 700,
								color: "rgba(255,255,255,0.6)",
								fontFamily: F,
							}}
						>
							{session.user.name?.charAt(0).toUpperCase() ?? "U"}
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={async () => {
						// better-call/srvx fails to JSON.parse an empty body when Content-Type is
						// application/json. Work around it by sending {} explicitly, then do a
						// hard reload so the session state is fully re-fetched.
						await fetch("/api/auth/sign-out", {
							method: "POST",
							credentials: "include",
							headers: { "Content-Type": "application/json" },
							body: "{}",
						});
						window.location.href = "/";
					}}
					style={{
						padding: "6px 12px",
						background: "rgba(255,255,255,0.04)",
						border: "1px solid rgba(255,255,255,0.1)",
						borderRadius: 8,
						color: "rgba(255,255,255,0.5)",
						fontSize: 11,
						fontWeight: 600,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						cursor: "pointer",
						fontFamily: F,
					}}
				>
					SIGN OUT
				</button>
			</div>
		);
	}

	return (
		<Link
			to="/sign-in"
			style={{
				padding: "7px 14px",
				background: "rgba(224,92,58,0.1)",
				border: "1px solid rgba(224,92,58,0.3)",
				borderRadius: 8,
				color: "rgba(255,255,255,0.7)",
				textDecoration: "none",
				fontSize: 11,
				fontWeight: 700,
				letterSpacing: "0.1em",
				textTransform: "uppercase",
				fontFamily: F,
			}}
		>
			SIGN IN
		</Link>
	);
}
