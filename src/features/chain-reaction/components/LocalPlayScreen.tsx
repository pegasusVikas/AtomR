import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PLAYER_COLORS } from "#/features/chain-reaction/constants";
import { useChainReactionGame } from "#/features/chain-reaction/useChainReactionGame";
import { getRecommendedSize } from "#/features/chain-reaction/utils/recommendedSize";
import ChainReactionBoard from "./ChainReactionBoard";
import GameHud from "./GameHud";
import GameOverlay from "./GameOverlay";
import GameSettings from "./GameSettings";

export default function LocalPlayScreen() {
	const [rows, setRows] = useState(6);
	const [cols, setCols] = useState(9);
	const [settingsOpen, setSettingsOpen] = useState(false);

	useEffect(() => {
		const rec = getRecommendedSize();
		setRows(rec.rows);
		setCols(rec.cols);
	}, []);

	const {
		state,
		handleMove,
		reset,
		isAnimating,
		activeExplosionKeys,
		activeCaptureKeys,
		activeExplosions,
	} = useChainReactionGame(rows, cols);

	const containerRef = useRef<HTMLDivElement>(null);
	const [boardDims, setBoardDims] = useState<{ w: number; h: number } | null>(
		null,
	);

	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		function measure() {
			const { width, height } = container.getBoundingClientRect();
			if (!width || !height) return;
			const aspect = cols / rows;
			let w: number;
			let h: number;
			if (width / height > aspect) {
				h = height;
				w = h * aspect;
			} else {
				w = width;
				h = w / aspect;
			}
			setBoardDims({ w, h });
		}

		measure();
		const obs = new ResizeObserver(measure);
		obs.observe(container);
		return () => obs.disconnect();
	}, [rows, cols]);

	const cellSize = boardDims ? boardDims.w / cols : 0;
	const activeColor = state.winner
		? PLAYER_COLORS[state.winner]
		: PLAYER_COLORS[state.currentPlayer];
	const boardStyle: React.CSSProperties = boardDims
		? { width: `${boardDims.w}px`, height: `${boardDims.h}px` }
		: { width: "100%", height: "100%" };

	return (
		<main
			className="relative flex h-[100dvh] flex-col overflow-hidden px-3 pt-5 pb-4"
			style={{
				background: "#07070b",
				fontFamily: "'Oxanium', 'Segoe UI', sans-serif",
			}}
		>
			<div
				className="pointer-events-none fixed inset-x-0 top-0 h-[50%]"
				style={{
					background: `radial-gradient(ellipse 80% 55% at 50% -5%, ${activeColor}14 0%, transparent 65%)`,
					transition: "background 1.2s ease",
				}}
			/>
			<div
				className="pointer-events-none fixed inset-x-0 bottom-0 h-[30%]"
				style={{
					background: `radial-gradient(ellipse 60% 40% at 50% 110%, ${activeColor}08 0%, transparent 70%)`,
					transition: "background 1.2s ease",
				}}
			/>

			<div className="relative w-full max-w-lg mx-auto shrink-0">
				<GameHud
					state={state}
					onReset={reset}
					onSettingsOpen={() => setSettingsOpen(true)}
				/>
			</div>

			<div
				ref={containerRef}
				className="relative flex-1 min-h-0 flex items-center justify-center"
			>
				<div style={boardStyle} className="relative">
					<ChainReactionBoard
						state={state}
						activeColor={activeColor}
						isAnimating={isAnimating}
						activeExplosionKeys={activeExplosionKeys}
						activeCaptureKeys={activeCaptureKeys}
						activeExplosions={activeExplosions}
						cellSize={cellSize}
						onPlay={(row, col) => handleMove({ row, col })}
					/>
					<GameOverlay state={state} onReset={reset} />
				</div>
			</div>

			<p
				className="relative text-center text-[10px] uppercase tracking-[0.3em] shrink-0"
				style={{ color: "rgba(255,255,255,0.12)" }}
			>
				Place on empty or owned cells · chains resolve automatically
			</p>

			<GameSettings
				open={settingsOpen}
				rows={rows}
				cols={cols}
				onApply={(newRows, newCols) => {
					setRows(newRows);
					setCols(newCols);
				}}
				onClose={() => setSettingsOpen(false)}
			/>
		</main>
	);
}
