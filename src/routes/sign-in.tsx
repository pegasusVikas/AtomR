import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "#/lib/auth-client";
import { getSessionFn } from "#/lib/session-fns";

export const Route = createFileRoute("/sign-in")({
	beforeLoad: async () => {
		const session = await getSessionFn();
		if (session?.user) {
			throw redirect({ to: "/play" });
		}
	},
	component: SignInPage,
});

const F = "'Oxanium', 'Segoe UI', sans-serif";

function AtomIcon({ size = 36 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="Atom Reaction logo"
		>
			<title>Atom Reaction logo</title>
			<circle cx="12" cy="12" r="2.5" fill="white" opacity="0.9" />
			<ellipse
				cx="12"
				cy="12"
				rx="9.5"
				ry="3.5"
				stroke="rgba(255,255,255,0.45)"
				strokeWidth="1"
				fill="none"
			/>
			<ellipse
				cx="12"
				cy="12"
				rx="9.5"
				ry="3.5"
				stroke="rgba(58,204,224,0.5)"
				strokeWidth="1"
				fill="none"
				transform="rotate(60 12 12)"
			/>
			<ellipse
				cx="12"
				cy="12"
				rx="9.5"
				ry="3.5"
				stroke="rgba(224,92,58,0.5)"
				strokeWidth="1"
				fill="none"
				transform="rotate(-60 12 12)"
			/>
		</svg>
	);
}

const inputStyle: React.CSSProperties = {
	width: "100%",
	boxSizing: "border-box",
	padding: "11px 14px",
	background: "rgba(255,255,255,0.04)",
	border: "1px solid rgba(255,255,255,0.1)",
	borderRadius: 10,
	color: "white",
	fontSize: 14,
	fontFamily: F,
	outline: "none",
};

const labelStyle: React.CSSProperties = {
	display: "block",
	fontSize: 11,
	letterSpacing: "0.1em",
	textTransform: "uppercase",
	color: "rgba(255,255,255,0.4)",
	marginBottom: 8,
};

function SignInPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const result = await authClient.signIn.email({ email, password });
			if (result.error) {
				setError(result.error.message ?? "Sign in failed");
			} else {
				await navigate({ to: "/play" });
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			style={{
				minHeight: "100dvh",
				background: "#07070b",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				fontFamily: F,
				color: "white",
				padding: 24,
				position: "relative",
			}}
		>
			{/* Dot-grid */}
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
			{/* Glow */}
			<div
				style={{
					position: "fixed",
					top: "-20%",
					left: "50%",
					transform: "translateX(-50%)",
					width: 600,
					height: 600,
					background:
						"radial-gradient(circle, rgba(58,204,224,0.06) 0%, transparent 70%)",
					borderRadius: "50%",
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>

			<div
				style={{
					position: "relative",
					zIndex: 1,
					width: "100%",
					maxWidth: 400,
				}}
			>
				{/* Logo */}
				<div style={{ textAlign: "center", marginBottom: 44 }}>
					<Link
						to="/"
						style={{
							textDecoration: "none",
							display: "inline-flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 12,
						}}
					>
						<AtomIcon size={40} />
						<span
							style={{
								fontSize: 12,
								fontWeight: 700,
								letterSpacing: "0.18em",
								color: "rgba(255,255,255,0.5)",
								textTransform: "uppercase",
							}}
						>
							Atom Reaction
						</span>
					</Link>
				</div>

				{/* Card */}
				<div
					style={{
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: 24,
						background: "rgba(255,255,255,0.03)",
						padding: 32,
					}}
				>
					<h1
						style={{
							margin: "0 0 6px",
							fontSize: 22,
							fontWeight: 700,
							color: "white",
							letterSpacing: "-0.01em",
						}}
					>
						Sign in
					</h1>
					<p
						style={{
							margin: "0 0 28px",
							fontSize: 13,
							color: "rgba(255,255,255,0.38)",
						}}
					>
						Enter your credentials to continue
					</p>

					<form
						onSubmit={handleSubmit}
						style={{ display: "flex", flexDirection: "column", gap: 18 }}
					>
						<div>
							<label htmlFor="email" style={labelStyle}>
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								autoComplete="email"
								style={inputStyle}
							/>
						</div>
						<div>
							<label htmlFor="password" style={labelStyle}>
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								autoComplete="current-password"
								minLength={8}
								style={inputStyle}
							/>
						</div>

						{error && (
							<div
								style={{
									padding: "10px 14px",
									background: "rgba(224,92,58,0.1)",
									border: "1px solid rgba(224,92,58,0.25)",
									borderRadius: 10,
									fontSize: 13,
									color: "#e87055",
								}}
							>
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							style={{
								marginTop: 4,
								padding: "13px",
								background: loading
									? "rgba(255,255,255,0.04)"
									: "rgba(224,92,58,0.14)",
								border: "1px solid rgba(224,92,58,0.35)",
								borderRadius: 12,
								color: "white",
								fontSize: 13,
								fontWeight: 700,
								letterSpacing: "0.1em",
								textTransform: "uppercase",
								cursor: loading ? "not-allowed" : "pointer",
								fontFamily: F,
								opacity: loading ? 0.6 : 1,
							}}
						>
							{loading ? "SIGNING IN…" : "SIGN IN →"}
						</button>
					</form>
				</div>

				<p
					style={{
						textAlign: "center",
						marginTop: 22,
						fontSize: 13,
						color: "rgba(255,255,255,0.3)",
					}}
				>
					Don't have an account?{" "}
					<Link
						to="/sign-up"
						style={{
							color: "rgba(255,255,255,0.6)",
							textDecoration: "none",
							fontWeight: 600,
						}}
					>
						Sign up
					</Link>
				</p>

				<p style={{ textAlign: "center", marginTop: 10 }}>
					<Link
						to="/"
						style={{
							fontSize: 11,
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							color: "rgba(255,255,255,0.2)",
							textDecoration: "none",
						}}
					>
						← Back to home
					</Link>
				</p>
			</div>
		</div>
	);
}
