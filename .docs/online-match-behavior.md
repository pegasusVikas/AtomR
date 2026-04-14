# Online Match Behavior

## Public Matchmaking Freshness

- public queue entries are only valid while the viewer is still recently seen
- lobby clients should heartbeat presence periodically
- stale queue entries must not be eligible for matching
- stale queue entries should not keep the user stuck in a fake "searching" state

Practical rule for v1:

- if a queue entry is older than the freshness window, or the queued user has not heartbeated inside that window, treat the entry as stale

## Turn Timeout

- online turns have a `30s` limit
- when the timer expires, the inactive player does not lose immediately
- instead, server resolves one random legal move on behalf of the timed-out player
- this move must obey the same legality rules as a normal move
- chain resolution, elimination, winner detection, move history, and next-turn scheduling all follow the normal move path

## Last Move Visibility

- players should always be able to identify the previous move without reconstructing it from board state
- show this in two ways:
  - persistent highlight on the last placed cell
  - compact text label with player + board coordinate

The highlighted cell is the original placed cell, not every cell touched by the resulting chain.
