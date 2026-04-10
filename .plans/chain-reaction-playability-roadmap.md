# Chain Reaction Playability Roadmap

## Purpose

Turn current `/play` implementation from working prototype into game people would actually want to keep playing.

This plan assumes current state:

- pure local engine exists
- minimal `/play` route exists
- board is functional
- current-player grid color exists
- winner detection exists
- dense late-game freeze bug was found and patched

This plan is not about adding more features first. It is about making current game readable, responsive, understandable, and satisfying.

## Current State Assessment

### What works now

- local hot-seat core loop
- legal move validation
- board ownership rules
- turn switching
- winner detection
- restart button
- black minimal route foundation

### What makes it feel unfinished

1. `/play` still lives inside starter shell.

- header/footer break immersion
- starter branding conflicts with game identity
- devtools and integration chrome visually compete with play area

2. Board lacks tactical readability.

- critical cells do not stand out
- capacity context is invisible
- dangerous enemy cells are hard to scan
- ownership is visible, but threat is not

3. No cascade playback.

- chain reaction resolves instantly
- player cannot understand what happened during dense moves
- win moments do not feel earned

4. Feedback loop is weak.

- no strong turn transition
- no move result emphasis
- no winner overlay / rematch moment
- no error feedback for illegal intent beyond disabled state

5. Mobile fit exists only in rough form.

- layout is serviceable, not tuned
- board sizing and control placement need deliberate phone-first polish

6. State/UI architecture is not ready for polish.

- hook only stores final state
- no playback state
- no animation lock
- no separation between resolved state and displayed state

## Product Goal

Deliver version that feels:

- immediate
- readable
- tense
- modern
- phone-friendly
- deterministic

Player should be able to answer these at all times:

- whose turn is it
- which cells are dangerous
- what move is legal
- what exploded
- why they won or lost

## Core Design Principles

1. Readability over decoration

- visual effects must clarify state, not decorate it

2. Tension should be visible before action

- critical cells and threatened regions must read instantly

3. Motion should explain causality

- animation exists to show chain propagation order and captures

4. Inputs must stay trustworthy

- no taps during ambiguous resolution
- no uncertain board state during playback

5. Mobile is primary, desktop is enhancement

- no hover-dependent information
- no board overflow hacks

## Big Workstreams

### 1. Immersive Route Shell

Goal: make `/play` feel like game, not embedded demo.

Changes:

- suppress header on `/play`
- suppress footer on `/play`
- suppress devtools on `/play` in normal app flow
- use route head/meta for `Chain Reaction`
- remove passive explanatory paragraph at bottom and replace with real controls/help affordance
- center play area vertically with controlled safe margins

Acceptance criteria:

- opening `/play` shows game immediately, without unrelated product chrome
- page title and browser tab match game
- viewport feels intentionally composed on phone and desktop

Implementation notes:

- likely best done in root shell with route-aware conditional rendering
- keep solution small; no new layout framework needed

### 2. Board Readability Redesign

Goal: let player scan ownership, capacity, and danger in under one second.

Changes:

- redesign cells with stronger internal structure
- improve grid line weight and contrast
- make player-owned cells subtly tinted by owner
- dim non-active enemy-owned regions just enough to keep current player focus
- redesign orb arrangements for `1`, `2`, `3`
- ensure counts remain centered and legible at small sizes
- introduce clear visual difference between:
  - empty
  - legal
  - enemy-owned / illegal
  - critical
  - active-turn emphasis

Acceptance criteria:

- ownership readable at glance
- critical cells are immediately obvious
- legal vs illegal targets readable without trial and error
- board looks intentional on black background

Implementation notes:

- avoid heavy gradients or faux-3D
- use color + border + glow hierarchy, not just one cue

### 3. Threat / Critical-State System

Goal: expose actual strategy layer.

Changes:

- add derived helpers:
  - `getCellCapacity`
  - `isCellCritical`
  - `getThreatLevel`
  - `isThreatenedByOpponent`
- mark cells at `capacity - 1`
- mark threatened cells adjacent to enemy critical cells
- optionally expose capacity class with tiny corner/edge/center cue

Visual rules:

- self critical: strong glow in player color
- enemy critical: sharper warning ring
- threatened owned cells: subtle pulse or hazard outline
- avoid showing too many simultaneous noisy animations

Acceptance criteria:

- player can identify tactical hotspots immediately
- UI teaches strategy passively
- no clutter explosion on dense boards

Implementation notes:

- static highlight first
- motion cue later only if still readable

### 4. Resolution Playback Architecture

Goal: make chain reactions understandable and satisfying.

Current limitation:

- `useChainReactionGame` applies final state immediately
- events exist but UI ignores them

Needed architecture:

- keep source-of-truth resolved state from engine
- introduce displayed state for animation playback
- replay engine events over short timeline
- lock board input during playback
- unlock after playback or game over

Recommended shape:

```ts
type PlaybackPhase = 'idle' | 'animating' | 'gameOver'

type PlaybackState = {
  displayedState: GameState
  resolvedState: GameState
  pendingEvents: ResolutionEvent[]
  phase: PlaybackPhase
}
```

Animation sequence:

1. place event
2. explode event(s)
3. capture event(s)
4. settle / winner state

Acceptance criteria:

- player can follow chain direction
- inputs disabled during animation
- no desync between displayed board and final state
- animation still finishes quickly for large cascades

Implementation notes:

- prefer deterministic stepped playback over freeform spring chaos
- allow reduced motion path later if needed
- keep engine pure; playback lives in hook/UI layer only

### 5. Game Feedback / HUD Upgrade

Goal: strengthen loop clarity and emotional payoff.

Changes:

- stronger current-turn banner
- live orb totals per player
- explicit status text during playback: `Resolving...`
- winner overlay with rematch button
- subtle transition when turn changes
- illegal interaction feedback if user taps disabled state during animation

Optional but valuable:

- move counter
- tiny game subtitle like `Local match`

Acceptance criteria:

- turn always obvious
- game over impossible to miss
- restart/rematch easy and fast

### 6. Rules / Help Surface

Goal: remove need for external explanation.

Changes:

- add compact rules button
- use bottom sheet / modal / panel on mobile-friendly layout
- explain:
  - legal move
  - capacities
  - critical cells
  - win condition

Acceptance criteria:

- new player can start and understand basics within one minute
- rules surface does not interrupt active match unless opened deliberately

### 7. Mobile Experience Pass

Goal: make game genuinely comfortable on phone.

Changes:

- tune board max width/height by viewport
- reserve enough room for HUD and controls without scroll trap
- ensure cells stay tappable at common mobile widths
- reposition controls for thumb reach
- confirm no accidental horizontal scroll

Acceptance criteria:

- playable on narrow phone viewport
- no overlap between HUD and board
- no zoom required

### 8. Motion / Audio Polish

Goal: give game satisfying feel after core clarity exists.

Changes:

- placement pulse
- ownership flash on capture
- explosion burst or ring expansion
- optional subtle haptics hook for mobile later
- optional sound design later, gated behind mute-safe defaults

Acceptance criteria:

- motion improves comprehension
- motion never blocks control longer than necessary
- game still feels crisp in repeated play

## Proposed Architecture Changes

### Current gap

`useChainReactionGame` only stores final engine state.

### Recommended next structure

```text
src/features/chain-reaction/
  engine.ts
  engine.test.ts
  selectors.ts
  playback.ts
  useChainReactionGame.ts
  components/
    ChainReactionBoard.tsx
    ChainReactionCell.tsx
    GameHud.tsx
    GameOverlay.tsx
    RulesSheet.tsx
```

### New modules

- `selectors.ts`
  - critical/threat helpers
  - orb totals
  - cell presentation helpers

- `playback.ts`
  - event timing helpers
  - playback reducer/helpers

- `GameOverlay.tsx`
  - winner screen
  - rematch button
  - maybe transient playback label

- `RulesSheet.tsx`
  - compact rules UI

## Implementation Phases

### Phase A: Immersive Shell

Scope:

- remove header/footer/devtools from `/play`
- set page metadata
- clean route composition

Why first:

- everything else looks better in correct shell
- low-risk, high-clarity win

Exit criteria:

- `/play` feels like dedicated game route

### Phase B: Board Redesign + Threat Cues

Scope:

- redesign cells
- add critical/threat visuals
- improve ownership/readability

Why second:

- strategy readability matters before animation

Exit criteria:

- board is tactically scannable

### Phase C: Playback System

Scope:

- animation state model
- input lock during cascade
- replay engine events

Why third:

- now visuals are ready to support explanatory motion

Exit criteria:

- cascades are understandable

### Phase D: HUD + Winner Experience

Scope:

- orb totals
- winner overlay
- rematch UX
- resolving state text

Exit criteria:

- loop feels complete and satisfying

### Phase E: Rules + Mobile Polish

Scope:

- rules sheet
- phone sizing pass
- spacing, tap targets, safe areas

Exit criteria:

- game works well for new users on phone

### Phase F: Feel Pass

Scope:

- motion refinement
- optional sound hooks
- final color/contrast tuning

Exit criteria:

- game feels premium enough for repeated play

## Testing Strategy

### Engine

Already exists. Extend with:

- regression test for dense late-game cascade winner path
- tests for any changed elimination/win semantics

### Hook / Playback

Add tests for:

- move enters animating phase when events exist
- input locked during playback
- displayed state matches resolved state after playback completes
- winner overlay appears after final playback step

### UI

Manual browser checks required for:

- mobile viewports
- cascade readability
- current-player grid color consistency
- route shell cleanliness

## Risks

### Risk: animation system becomes state mess

Mitigation:

- keep engine immutable and authoritative
- playback layer reads event list, never rewrites rules

### Risk: too many visual cues create noise

Mitigation:

- hierarchy:
  - ownership first
  - critical second
  - threatened third

### Risk: mobile board becomes too small

Mitigation:

- test real viewport sizes early in Phase B

### Risk: mid-cascade winner short-circuit hides expected final visuals

Mitigation:

- if needed, replay only already-generated events and then show winner
- do not continue generating unnecessary post-win cascades

## Definition Of “Actually Playable”

We can call this playable when all are true:

- user can open `/play` and immediately understand where to interact
- legal vs illegal targets are visually obvious
- critical tactical states are visible
- chain reactions are understandable in motion
- game never freezes during dense late-game cascades
- winner state is clear and satisfying
- mobile layout feels deliberate, not compressed desktop

## Recommended Execution Order

If implementing continuously, do exactly this:

1. immersive shell for `/play`
2. board redesign + critical cues
3. playback architecture
4. winner overlay + orb totals
5. rules sheet + mobile pass
6. polish pass

## Immediate Next Slice

Best next coding slice:

### Slice 1

- route-aware shell hiding for `/play`
- route title/meta update
- remove starter chrome from active game screen

### Slice 2

- add `selectors.ts`
- critical/threat helpers
- redesign `ChainReactionCell`
- redesign `ChainReactionBoard`

### Slice 3

- add playback state to `useChainReactionGame`
- replay existing `ResolutionEvent[]`
- lock input while animating

That sequence gives fastest jump in perceived quality without overbuilding.
