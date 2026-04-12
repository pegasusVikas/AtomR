# Chain Reaction AI Mode Plan

## Goal

Add `/play/ai` mode with CPU difficulty slider `1..10`.

Player flow:

1. Click AI mode from play hub.
2. Choose difficulty `1..10`.
3. Start game vs CPU.

## UX Contract

- CPU move must feel responsive (target under ~120 ms on typical hardware for most levels).
- Difficulty must feel meaningfully different across levels.
- Keep same board visuals/animation pipeline as local mode.

## Implementation Architecture

### Route and Screen

- Add route: `src/routes/play/ai.tsx`
- Add screen component: `src/features/chain-reaction/components/AiPlayScreen.tsx`

### AI Engine Modules

- `src/features/chain-reaction/ai/config.ts`
  - difficulty -> AI config mapping
- `src/features/chain-reaction/ai/evaluate.ts`
  - heuristic evaluation for board states
- `src/features/chain-reaction/ai/search.ts`
  - minimax + alpha-beta + move ordering
- `src/features/chain-reaction/ai/selectMove.ts`
  - stochastic top-choice selection + fail-safe

### Game Hook

- Add hook: `src/features/chain-reaction/useChainReactionAiGame.ts`
  - wraps current engine
  - handles human move, then CPU turn
  - CPU think phase with non-blocking scheduling

## Difficulty Mapping (v1)

- Inputs per level:
  - `depth`
  - `candidateLimit`
  - `mistakeProbability`
  - `temperature`

Suggested starting map:

- `1-2`: depth 1, high mistakes
- `3-4`: depth 2, medium mistakes
- `5-6`: depth 2-3, low mistakes
- `7-8`: depth 3, very low mistakes
- `9-10`: depth 4 (budget-capped), minimal mistakes

## Test Strategy

### Unit Tests

- legal move generation invariants
- evaluation function feature sanity
- alpha-beta returns legal move
- deterministic behavior with fixed RNG seed

### Simulation Tests

- AI(6) vs AI(1) win-rate check
- AI(8) vs AI(4) win-rate check
- AI(10) vs AI(8) non-regression check
- latency profile by level

### UX/Integration Tests

- selecting difficulty updates behavior config
- CPU takes turn automatically after human move
- game over + restart behavior

## Performance Guardrails

- hard per-turn compute budget (configurable)
- candidate move pre-ranking before deep search
- optional iterative deepening fallback if budget exceeded
- no network requests for CPU logic

## Milestones

1. Add route and basic AI mode UI with difficulty selector.
2. Implement minimal AI level 1-3 (shallow + stochastic).
3. Implement full minimax + alpha-beta + heuristics.
4. Add test harness + simulation checks.
5. Tune difficulty curve from match outcomes and latency.

## Deliverables

- playable `/play/ai`
- difficulty slider `1..10`
- test suite for AI behavior/perf
- docs update in `.docs/chain-reaction-ai-research.md`
