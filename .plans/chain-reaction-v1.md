# Chain Reaction V1 Plan

## Goal

Build modern minimal version of Chain Reaction inside current TanStack Start app.

V1 target:

- fast local play
- clean modern UI
- deterministic rules
- mobile-first layout
- no backend dependency

## Product Direction

Use current repo as shell, but build game as self-contained feature first. Do not rip out existing conference site yet.

Recommended entry for v1:

- new route at `/play`

Why:

- lowest-risk path in existing app
- lets us build and test game without rewriting unrelated pages
- easy to make `/` redirect or redesign later once game stable

## V1 Scope

### In

- `2` player local hot-seat mode
- default board size `9 x 6`
- turn-based legal move system
- full chain reaction resolution
- ownership conversion rules
- elimination tracking
- win detection
- restart game
- new game button
- basic rules/help panel
- responsive board for desktop + mobile
- clear current-turn and winner UI
- lightweight animations for explosion resolution

### Out

- AI opponent
- online multiplayer
- auth-gated play
- persistence across refresh
- move history / undo
- board size picker
- more than `2` players
- matchmaking / rooms
- leaderboards
- sound effects

## Rules Decisions For V1

These must be explicit before engine work starts.

1. Legal move

- player may place orb only in empty cell or cell already owned by active player

2. Capacity

- corner: `2`
- edge: `3`
- inner: `4`

3. Explosion trigger

- cell explodes immediately when orb count reaches capacity

4. Ownership conversion

- if explosion adds orb to enemy-owned cell, entire cell flips to exploding player's ownership

5. Turn completion

- turn ends only after all chain reactions finish and board is stable

6. Elimination timing

- elimination checked after full move resolution

7. First-round elimination guard

- player cannot be eliminated until both players have completed at least one turn

Reason:

- avoids nonsense state where second player would start with `0` orbs and already be dead

8. Win check

- winner declared after elimination updates if exactly one non-eliminated player remains

9. Explosion order

- use deterministic neighbor order: `up`, `right`, `down`, `left`

Reason:

- reproducible animations
- reproducible tests
- no hidden timing differences

## Technical Approach

### Architecture

Game engine should be pure TypeScript. UI should only render state and dispatch actions.

Recommended split:

- pure engine in feature module
- React state wrapper for route-level gameplay
- presentational components for board and HUD

### Why client-only for V1

- game is deterministic and local
- no server persistence needed yet
- simpler SSR story
- fastest path to playable product

TanStack Start still matters for route organization, SSR safety, and future expansion, but V1 game loop does not need server functions.

## Proposed File Structure

```text
src/
  features/
    chain-reaction/
      types.ts
      constants.ts
      engine.ts
      engine.test.ts
      useChainReactionGame.ts
      components/
        ChainReactionBoard.tsx
        ChainReactionCell.tsx
        GameHud.tsx
        RulesSheet.tsx
  routes/
    play.tsx
```

Optional later:

```text
src/features/chain-reaction/animations.ts
src/features/chain-reaction/storage.ts
```

## State Model

### Cell

```ts
type PlayerId = 'p1' | 'p2'

type Cell = {
  owner: PlayerId | null
  count: number
}
```

### Board

```ts
type Board = Cell[][]
```

### Game State

```ts
type GameState = {
  board: Board
  currentPlayer: PlayerId
  turnNumber: number
  hasPlayed: Record<PlayerId, boolean>
  eliminated: Record<PlayerId, boolean>
  winner: PlayerId | null
  phase: 'idle' | 'resolving' | 'gameOver'
}
```

### Derived Helpers

- `getCapacity(row, col, rows, cols)`
- `isLegalMove(state, row, col)`
- `isCritical(cell, capacity)`
- `countPlayerOrbs(board, playerId)`
- `canBeEliminated(state, playerId)`

## Engine Design

Core engine functions should stay framework-agnostic.

Recommended functions:

- `createInitialBoard(rows, cols)`
- `createInitialGameState()`
- `applyMove(state, row, col)`
- `resolveBoard(board, currentPlayer)`
- `getNextPlayer(state)`
- `recomputeEliminations(state)`
- `recomputeWinner(state)`

### `applyMove` contract

Input:

- current immutable game state
- target cell

Output:

- next immutable game state
- optional resolution events for animation

### Resolution events

Keep animation data simple. Good shape:

```ts
type ResolutionEvent = {
  type: 'place' | 'explode' | 'capture'
  row: number
  col: number
  player: PlayerId
}
```

Events useful because:

- UI can animate without mutating engine logic
- tests can assert both final board and sequence if needed

## UI Plan

### Route Layout

`/play` page should have:

- compact title / subtitle
- turn status bar
- board centered in viewport
- player chips with active/eliminated states
- restart button
- rules toggle / drawer

### Visual Style

Target look:

- dark clean background
- bright player colors
- minimal chrome
- subtle motion
- no skeuomorphic board clutter

### Board UX

- square-ish cells with responsive sizing
- orb count always visible
- illegal moves visibly disabled or rejected cleanly
- current player color reinforced in HUD and focus styles
- explosion animation readable, not noisy

### Mobile UX

- board fits vertically without horizontal scroll
- controls above or below board
- tap targets at least `44px`
- no hover-only affordances

## Animation Plan

Minimal but good enough:

- placement pulse on selected cell
- explosion pulse / burst on exploding cell
- ownership color transition on captured cells
- short sequential delay between resolution steps

Animation rule:

- engine computes truth instantly
- UI replays event list visually

This avoids game logic depending on timers.

## Testing Plan

V1 should have engine tests before polish work.

Minimum tests:

1. capacity helper returns correct values for corner, edge, inner
2. legal move allows empty and self-owned cells only
3. reaching capacity explodes correct cell
4. explosion distributes to orthogonal neighbors only
5. enemy-owned neighbor flips ownership on hit
6. multi-step chain reaction resolves to stable board
7. eliminated player not marked before first-turn guard satisfied
8. winner detected correctly after final elimination
9. next player skips eliminated players

Nice-to-have later:

- component smoke test for board render
- interaction test for legal vs illegal move UI

## Implementation Phases

### Phase 1: Engine

- create feature module
- define types and constants
- implement pure board helpers
- implement move resolver
- add engine unit tests

Exit criteria:

- full game playable in tests without UI

### Phase 2: Minimal UI

- add `/play` route
- render board and current turn
- wire click to engine
- show win state and restart

Exit criteria:

- ugly but fully playable local game

### Phase 3: Motion + polish

- add resolution event playback
- improve spacing, colors, mobile layout
- add rules sheet and status chips

Exit criteria:

- game feels readable and modern on phone and desktop

### Phase 4: Integration cleanup

- update metadata/title
- decide whether home page links to `/play`
- remove or isolate irrelevant starter branding on touched surfaces

Exit criteria:

- app has clear product direction

## TanStack Start Notes

For V1, avoid premature server complexity.

- use file route for `/play`
- keep game engine in client-safe modules
- avoid server functions until persistence, multiplayer, or analytics need them
- keep route SSR-safe by deriving no unstable values during render

When server features come later:

- persistence can use server functions
- multiplayer can use Convex or API routes
- auth can gate saved games or profiles

## Risks

### Risk: animation logic leaks into engine

Mitigation:

- keep pure state transition separate from event playback

### Risk: first-turn elimination bug

Mitigation:

- implement explicit `hasPlayed` guard and test it

### Risk: board not usable on mobile

Mitigation:

- build phone layout first

### Risk: overbuilding around future multiplayer

Mitigation:

- optimize for local deterministic engine now

## After V1

Best next features after solid local v1:

1. board size options
2. undo / move history
3. local persistence
4. AI opponent
5. online multiplayer

## Immediate Next Step

Start Phase 1.

First implementation slice:

- create pure engine types
- implement board helpers and `applyMove`
- write tests for core resolution rules
