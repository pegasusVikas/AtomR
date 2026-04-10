# Chain Reaction Multiplayer Matchmaking Plan

## Goal

Turn `/play` from a local game into an authenticated realtime multiplayer experience where users can:

- sign in with Google
- optionally use email/password in development
- join public matchmaking and be paired with another waiting player
- create private rooms with a shared 5-letter code
- join private rooms by code and play live

## Existing Stack

- Frontend/app shell: TanStack Start + React
- Auth: Better Auth already installed and minimally configured
- Realtime backend: Convex already installed and wired into the app root
- Current game logic: local-only chain reaction engine and animation playback in `src/features/chain-reaction`

## Recommended Architecture

### Source of truth

Use Convex as the authoritative source for:

- player profiles
- matchmaking queue
- private rooms
- live match state
- turn submission
- reconnection/resume state

Keep the existing local engine as the deterministic rules engine, but run move resolution on the server side in Convex mutations. The client becomes a realtime renderer of server state instead of owning game truth.

### Auth model

Use Better Auth for user identity and session cookies.

Recommended providers:

- Google for production
- email/password enabled only for dev or internal environments

The frontend should fetch the authenticated session from Better Auth, then pass a verified user identity into Convex-backed gameplay operations.

### Match model

Represent a match as a durable Convex document with:

- both players
- board dimensions
- serialized board state
- current player
- move history
- phase: waiting, active, completed, abandoned
- winner / end reason
- timestamps for created, started, ended, lastMoveAt
- optional room metadata if created from a private room

### Room model

Private rooms are separate from active matches.

Flow:

1. User creates room
2. Convex generates unique 5-letter code
3. Host shares code
4. Guest joins room by code
5. When second player joins, room is locked and a match is created

## Data Model

Recommended Convex tables:

### `users`

- `authUserId: string`
- `displayName: string`
- `avatarUrl?: string`
- `email?: string`
- `createdAt: number`
- `lastSeenAt: number`

Indexes:

- `by_auth_user_id`

### `matchmakingQueue`

- `userId: Id<"users">`
- `status: "searching" | "matched" | "cancelled"`
- `requestedAt: number`
- `boardPreference?: { rows: number; cols: number }`
- `region?: string`

Indexes:

- `by_status_requested_at`
- `by_user_id`

### `privateRooms`

- `code: string`
- `hostUserId: Id<"users">`
- `guestUserId?: Id<"users">`
- `status: "open" | "full" | "closed" | "expired"`
- `rows: number`
- `cols: number`
- `createdAt: number`
- `expiresAt: number`

Indexes:

- `by_code`
- `by_host_user_id`
- `by_status`

### `matches`

- `type: "public" | "private"`
- `roomId?: Id<"privateRooms">`
- `player1UserId: Id<"users">`
- `player2UserId: Id<"users">`
- `rows: number`
- `cols: number`
- `board: BoardSnapshot`
- `currentPlayer: "p1" | "p2"`
- `phase: "active" | "gameOver" | "abandoned"`
- `winnerUserId?: Id<"users">`
- `winnerPlayerId?: "p1" | "p2"`
- `turnNumber: number`
- `lastMoveAt: number`
- `createdAt: number`
- `startedAt: number`
- `endedAt?: number`

Indexes:

- `by_player1_user_id`
- `by_player2_user_id`
- `by_phase`
- `by_room_id`

### `matchMoves`

- `matchId: Id<"matches">`
- `turnNumber: number`
- `userId: Id<"users">`
- `playerId: "p1" | "p2"`
- `row: number`
- `col: number`
- `events: ResolutionEvent[]`
- `createdAt: number`

Indexes:

- `by_match_id_turn_number`

### Optional `presence`

Only needed if we want online indicators / disconnect handling beyond last-seen timestamps.

## Auth Integration Plan

### Phase 1 auth baseline

Expand Better Auth config in `src/lib/auth.ts`:

- add Google provider
- keep email/password enabled for development
- add required env vars
- define trusted origins and production-safe cookie settings

Needed env vars:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Session handling

Add shared auth helpers:

- server-side helper to read current Better Auth session in TanStack Start routes/server functions
- client hook/component for current user state

### Route protection

Protect multiplayer routes with route `beforeLoad` or server-side checks.

Suggested routes:

- `/play` or `/play/local` for local game
- `/play/online` lobby / queue
- `/play/match/$matchId` live match
- `/play/room/$code` private room join screen

## Convex API Plan

### User/profile functions

- `users.ensureCurrentUser`
- `users.getCurrentUser`

### Matchmaking functions

- `matchmaking.joinQueue`
- `matchmaking.leaveQueue`
- `matchmaking.getQueueStatus`
- `matchmaking.tryMatchmake`

Recommended approach:

- use a mutation to join queue
- use a mutation or scheduled action to pair the two oldest waiting compatible users
- immediately create a `matches` record and mark both queue entries matched

### Private room functions

- `rooms.createPrivateRoom`
- `rooms.joinPrivateRoomByCode`
- `rooms.closeRoom`
- `rooms.getRoomByCode`

Code generation requirements:

- uppercase letters only
- length = 5
- exclude ambiguous characters if desired: `O`, `I`
- retry on conflict using `by_code` index

### Match functions

- `matches.getMatch`
- `matches.listMyMatches`
- `matches.submitMove`
- `matches.resignMatch`
- `matches.markAbandoned`

Critical rule:

`submitMove` must:

- authenticate caller
- confirm caller belongs to the match
- confirm match is active
- confirm it is caller's turn
- run the existing rules engine server-side
- persist next state and move history atomically

## Gameplay Synchronization

### Server-authoritative move flow

1. Client clicks cell
2. Client sends `submitMove(matchId, row, col)`
3. Convex mutation validates move and runs engine
4. Convex writes updated match state + move events
5. Both clients receive realtime update
6. Client animates using returned `events`

### Client animation strategy

Do not recompute gameplay results on the client for online matches.

Instead:

- use server-returned `events` and final board state
- keep the current animation system, but drive it from the authoritative move payload
- maintain local optimistic UI only for button disabled/loading states, not board ownership/count changes

### Rejoin / refresh

On refresh, client subscribes to match document and resumes from persisted state.

This avoids desync and makes reconnect straightforward.

## UI / Product Plan

### Entry points

Add an online lobby with:

- `Play Online`
- `Create Private Room`
- `Join Private Room`
- match history / recent matches

### Public matchmaking UX

- authenticated user clicks `Find Match`
- sees searching state with cancel option
- auto-redirect to `/play/match/$matchId` when paired

### Private room UX

- host creates room and sees sharable 5-letter code
- guest enters code to join
- once guest joins, both users transition to match view

### Match view UX

- player labels map to real users
- show connection/waiting states
- disable moves while waiting on remote turn / server response
- allow resign / leave

### Post-match UX

- show winner
- allow rematch invite for private matches later
- for v1, return to lobby is acceptable

## Security / Integrity Rules

- never trust client-submitted board state
- never trust client-submitted current player
- all move legality checks happen in Convex mutation
- only authenticated users can queue, create rooms, join rooms, or play moves
- private room join checks must reject closed/full/expired codes
- room codes should expire if unused

## Suggested Delivery Phases

### Phase 1: Auth foundation

- finish Better Auth production setup
- add Google login
- keep dev email/password
- add current-user plumbing and route protection

### Phase 2: Convex schema + server-authoritative matches

- define `users`, `matches`, `matchMoves`
- port existing game engine for safe server-side use
- implement `submitMove`
- implement `/play/match/$matchId`

### Phase 3: Public matchmaking

- add queue table + queue mutations
- pair users into live matches
- add searching UI and redirect flow

### Phase 4: Private rooms

- add room table + code generation
- host/join-by-code UI
- create match from room

### Phase 5: Reliability / polish

- reconnect handling
- stale queue cleanup
- room expiration cleanup
- resign/abandon flows
- rematch design if wanted

## Recommended File / Module Structure

### Frontend

- `src/routes/play/local.tsx` or keep `/play` for local mode
- `src/routes/play/online.tsx`
- `src/routes/play/match.$matchId.tsx`
- `src/routes/play/room.$code.tsx`
- `src/features/chain-reaction-online/...`

### Auth

- `src/lib/auth.ts`
- `src/lib/auth-client.ts`
- `src/lib/current-user.ts` or equivalent helpers

### Convex

- `convex/schema.ts`
- `convex/users.ts`
- `convex/matchmaking.ts`
- `convex/rooms.ts`
- `convex/matches.ts`
- `convex/lib/game-engine.ts`

## Product Decisions

1. Keep both local and online versions of the game.
2. Use Google login in production.
3. Keep email/password available for development only.
4. Public matchmaking uses one fixed board size.
5. Private rooms support custom board sizes in v1.
6. Spectators are out of scope for now, but the schema can be extended later.

## Locked V1 Scope

- keep local mode available alongside online mode
- use Better Auth + Convex for online play
- require Google sign-in in production
- keep email/password for dev only
- use one default board size for public matchmaking
- allow custom board sizes for private rooms
- make server authoritative from day one

## Route Recommendation

- `/play` for a mode picker or game hub
- `/play/local` for local play
- `/play/online` for matchmaking / lobby
- `/play/match/$matchId` for live online matches
- `/play/room/$code` for private room join / waiting flow

This is the smallest robust path that gives us login, realtime matches, public queue, and invite-code rooms without painting us into a corner.
