# Online Match Reliability And Last-Move Plan

## Scope

Address 3 concrete product gaps:

1. show the last move clearly
2. prevent stale public queue entries from matching long after browser close
3. when the 30s online turn timer expires, force a valid random move for the inactive player

## Findings

### Last move visibility

- current online match screen shows turn + timer but not the last move location
- board has no persistent highlight for the last placed cell
- local mode has same gap

### Stale matchmaking

- `matchmakingQueue` entries can remain `searching` after browser close
- `joinQueue` currently matches against the oldest `searching` entry without checking freshness
- `syncViewer` updates `users.lastSeenAt`, but lobby only calls it around button actions, not as a heartbeat

### Turn timer

- current timeout path in `convex/online.ts` marks the current player as loser and phase as `abandoned`
- timeout enforcement depends on a client calling `claimTurnTimeout`
- if no client notices timeout, nothing happens
- desired behavior is server-side forced move, not forfeit

## Implementation

### Last move

- add a reusable `LastMove` shape in game shared types
- track `lastMove` in local hook state
- derive `lastMove` online from `match.lastMoveEvents` or optimistic placement
- add board-cell highlight for the last placed cell
- add small HUD/header text with player + coordinate

### Matchmaking freshness

- add viewer heartbeat on online lobby and match page
- define a short queue freshness window
- ignore/cancel stale `searching` entries before matching
- hide stale queue state from `getMyQueueEntry`

### Timer auto-move

- add helper to enumerate legal moves and pick one randomly
- move timeout resolution server-side
- schedule timeout checks on match creation and after every resolved move
- scheduled timeout only applies if `matchId`, `turnNumber`, `currentPlayer`, and `lastMoveAt` still match expected values
- `claimTurnTimeout` becomes a catch-up path that runs the same timeout resolver immediately

## Verification

- engine tests for legal move enumeration / random move selection
- manual or test validation that timeout produces a legal move and advances turn
- `pnpm check`
- `pnpm test`
- `pnpm build`
