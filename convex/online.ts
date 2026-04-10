import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import {
	applyMove,
	createInitialGameState,
} from '../src/features/chain-reaction/shared-engine'
import type { GameState, PlayerId } from '../src/features/chain-reaction/shared'

function alphabet() {
	return 'ABCDEFGHJKLMNPQRSTUVWXYZ'
}

function makeRoomCode() {
	const chars = alphabet()
	let code = ''
	for (let i = 0; i < 5; i += 1) {
		code += chars[Math.floor(Math.random() * chars.length)]
	}
	return code
}

async function ensureUser(
	ctx: any,
	authUserId: string,
	displayName: string,
	email?: string,
) {
	const existing = await ctx.db
		.query('users')
		.withIndex('by_auth_user_id', (q: any) => q.eq('authUserId', authUserId))
		.unique()
	const now = Date.now()
	if (existing) {
		await ctx.db.patch(existing._id, {
			displayName,
			email,
			lastSeenAt: now,
		})
		return existing._id
	}
	return await ctx.db.insert('users', {
		authUserId,
		displayName,
		email,
		createdAt: now,
		lastSeenAt: now,
	})
}

export const syncViewer = mutation({
	args: {
		authUserId: v.string(),
		displayName: v.string(),
		email: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await ensureUser(
			ctx,
			args.authUserId,
			args.displayName,
			args.email,
		)
		return { userId }
	},
})

export const createPrivateRoom = mutation({
	args: {
		authUserId: v.string(),
		displayName: v.string(),
		email: v.optional(v.string()),
		rows: v.number(),
		cols: v.number(),
	},
	handler: async (ctx, args) => {
		const hostUserId = await ensureUser(
			ctx,
			args.authUserId,
			args.displayName,
			args.email,
		)
		for (let attempt = 0; attempt < 10; attempt += 1) {
			const code = makeRoomCode()
			const existing = await ctx.db
				.query('privateRooms')
				.withIndex('by_code', (q) => q.eq('code', code))
				.unique()
			if (existing) continue
			const roomId = await ctx.db.insert('privateRooms', {
				code,
				hostUserId,
				status: 'open',
				rows: args.rows,
				cols: args.cols,
				createdAt: Date.now(),
				expiresAt: Date.now() + 1000 * 60 * 60,
			})
			return { roomId, code }
		}
		throw new Error('Could not allocate room code')
	},
})

export const joinPrivateRoom = mutation({
	args: {
		authUserId: v.string(),
		displayName: v.string(),
		email: v.optional(v.string()),
		code: v.string(),
	},
	handler: async (ctx, args) => {
		const guestUserId = await ensureUser(
			ctx,
			args.authUserId,
			args.displayName,
			args.email,
		)
		const room = await ctx.db
			.query('privateRooms')
			.withIndex('by_code', (q) => q.eq('code', args.code.toUpperCase()))
			.unique()
		if (!room) throw new Error('Room not found')
		if (room.expiresAt < Date.now()) throw new Error('Room has expired')
		if (room.status !== 'open' && room.guestUserId !== guestUserId) {
			throw new Error('Room is not joinable')
		}

		if (room.matchId) {
			return { roomId: room._id, matchId: room.matchId, code: room.code }
		}

		if (room.hostUserId === guestUserId) {
			return { roomId: room._id, matchId: room.matchId ?? null, code: room.code }
		}

		const initialState = createInitialGameState(room.rows, room.cols)
		const now = Date.now()
		const matchId = await ctx.db.insert('matches', {
			type: 'private',
			roomId: room._id,
			player1UserId: room.hostUserId,
			player2UserId: guestUserId,
			rows: room.rows,
			cols: room.cols,
			board: initialState.board,
			currentPlayer: initialState.currentPlayer,
			turnNumber: initialState.turnNumber,
			hasPlayed: initialState.hasPlayed,
			eliminated: initialState.eliminated,
			winner: initialState.winner,
			phase: initialState.phase,
			lastMoveEvents: [],
			createdAt: now,
			startedAt: now,
			lastMoveAt: now,
		})

		await ctx.db.patch(room._id, {
			guestUserId,
			status: 'full',
			matchId,
		})

		return { roomId: room._id, matchId, code: room.code }
	},
})

export const joinQueue = mutation({
	args: {
		authUserId: v.string(),
		displayName: v.string(),
		email: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await ensureUser(
			ctx,
			args.authUserId,
			args.displayName,
			args.email,
		)

		// Return existing searching entry if any
		const existing = await ctx.db
			.query('matchmakingQueue')
			.withIndex('by_user_id', (q) => q.eq('userId', userId))
			.filter((q) => q.eq(q.field('status'), 'searching'))
			.first()
		if (existing) {
			return { queueId: existing._id, status: 'searching' as const, matchId: null }
		}

		// Find another searching user
		const opponent = await ctx.db
			.query('matchmakingQueue')
			.withIndex('by_status_requested_at', (q) => q.eq('status', 'searching'))
			.first()

		if (opponent && opponent.userId !== userId) {
			const initialState = createInitialGameState(6, 9)
			const now = Date.now()
			const matchId = await ctx.db.insert('matches', {
				type: 'public',
				player1UserId: opponent.userId,
				player2UserId: userId,
				rows: 6,
				cols: 9,
				board: initialState.board,
				currentPlayer: initialState.currentPlayer,
				turnNumber: initialState.turnNumber,
				hasPlayed: initialState.hasPlayed,
				eliminated: initialState.eliminated,
				winner: initialState.winner,
				phase: initialState.phase,
				lastMoveEvents: [],
				createdAt: now,
				startedAt: now,
				lastMoveAt: now,
			})
			await ctx.db.patch(opponent._id, { status: 'matched', matchId })
			const queueId = await ctx.db.insert('matchmakingQueue', {
				userId,
				status: 'matched',
				requestedAt: now,
				matchId,
			})
			return { queueId, status: 'matched' as const, matchId }
		}

		// Enter queue
		const queueId = await ctx.db.insert('matchmakingQueue', {
			userId,
			status: 'searching',
			requestedAt: Date.now(),
		})
		return { queueId, status: 'searching' as const, matchId: null }
	},
})

export const leaveQueue = mutation({
	args: { authUserId: v.string() },
	handler: async (ctx, args) => {
		const viewer = await ctx.db
			.query('users')
			.withIndex('by_auth_user_id', (q) =>
				q.eq('authUserId', args.authUserId),
			)
			.unique()
		if (!viewer) return
		const entry = await ctx.db
			.query('matchmakingQueue')
			.withIndex('by_user_id', (q) => q.eq('userId', viewer._id))
			.filter((q) => q.eq(q.field('status'), 'searching'))
			.first()
		if (entry) {
			await ctx.db.patch(entry._id, { status: 'cancelled' })
		}
	},
})

export const getMyQueueEntry = query({
	args: { authUserId: v.string() },
	handler: async (ctx, args) => {
		const viewer = await ctx.db
			.query('users')
			.withIndex('by_auth_user_id', (q) =>
				q.eq('authUserId', args.authUserId),
			)
			.unique()
		if (!viewer) return null
		return await ctx.db
			.query('matchmakingQueue')
			.withIndex('by_user_id', (q) => q.eq('userId', viewer._id))
			.filter((q) => q.neq(q.field('status'), 'cancelled'))
			.order('desc')
			.first()
	},
})

export const startRematch = mutation({
	args: {
		matchId: v.id('matches'),
		authUserId: v.string(),
	},
	handler: async (ctx, args) => {
		const viewer = await ctx.db
			.query('users')
			.withIndex('by_auth_user_id', (q) =>
				q.eq('authUserId', args.authUserId),
			)
			.unique()
		if (!viewer) throw new Error('User not found')
		const match = await ctx.db.get(args.matchId)
		if (!match) throw new Error('Match not found')
		if (!match.winner) throw new Error('Match is not over yet')
		const isPlayer =
			match.player1UserId === viewer._id ||
			match.player2UserId === viewer._id
		if (!isPlayer) throw new Error('Not a player in this match')

		// Rematch already created — return it
		if (match.rematchMatchId) {
			return { matchId: match.rematchMatchId }
		}

		// Create new match swapping sides
		const initialState = createInitialGameState(match.rows, match.cols)
		const now = Date.now()
		const newMatchId = await ctx.db.insert('matches', {
			type: match.type,
			roomId: match.roomId,
			player1UserId: match.player2UserId,
			player2UserId: match.player1UserId,
			rows: match.rows,
			cols: match.cols,
			board: initialState.board,
			currentPlayer: initialState.currentPlayer,
			turnNumber: initialState.turnNumber,
			hasPlayed: initialState.hasPlayed,
			eliminated: initialState.eliminated,
			winner: initialState.winner,
			phase: initialState.phase,
			lastMoveEvents: [],
			createdAt: now,
			startedAt: now,
			lastMoveAt: now,
		})
		await ctx.db.patch(match._id, { rematchMatchId: newMatchId })
		return { matchId: newMatchId }
	},
})

export const getRoomByCode = query({
	args: { code: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('privateRooms')
			.withIndex('by_code', (q) => q.eq('code', args.code.toUpperCase()))
			.unique()
	},
})

export const getMatch = query({
	args: { matchId: v.id('matches') },
	handler: async (ctx, args) => {
		const match = await ctx.db.get(args.matchId)
		if (!match) return null
		const player1 = await ctx.db.get(match.player1UserId)
		const player2 = await ctx.db.get(match.player2UserId)
		return {
			...match,
			player1,
			player2,
		}
	},
})

export const submitMove = mutation({
	args: {
		matchId: v.id('matches'),
		authUserId: v.string(),
		row: v.number(),
		col: v.number(),
	},
	handler: async (ctx, args) => {
		const viewer = await ctx.db
			.query('users')
			.withIndex('by_auth_user_id', (q) => q.eq('authUserId', args.authUserId))
			.unique()
		if (!viewer) throw new Error('User not found')

		const match = await ctx.db.get(args.matchId)
		if (!match) throw new Error('Match not found')
		if (match.phase !== 'idle' && match.phase !== 'gameOver') {
			throw new Error('Match is not active')
		}
		if (match.winner) throw new Error('Match is already finished')

		let playerId: PlayerId | null = null
		if (match.player1UserId === viewer._id) playerId = 'p1'
		if (match.player2UserId === viewer._id) playerId = 'p2'
		if (!playerId) throw new Error('Not part of this match')
		if (match.currentPlayer !== playerId) throw new Error('Not your turn')

		const state: GameState = {
			board: match.board,
			rows: match.rows,
			cols: match.cols,
			currentPlayer: match.currentPlayer,
			turnNumber: match.turnNumber,
			hasPlayed: match.hasPlayed,
			eliminated: match.eliminated,
			winner: match.winner,
			phase: match.phase === 'gameOver' ? 'gameOver' : 'idle',
		}

		const result = applyMove(state, args.row, args.col)
		const now = Date.now()

		await ctx.db.patch(match._id, {
			board: result.state.board,
			currentPlayer: result.state.currentPlayer,
			turnNumber: result.state.turnNumber,
			hasPlayed: result.state.hasPlayed,
			eliminated: result.state.eliminated,
			winner: result.state.winner,
			phase: result.state.phase,
			lastMoveEvents: result.events,
			lastMoveAt: now,
			endedAt: result.state.winner ? now : undefined,
		})

		await ctx.db.insert('matchMoves', {
			matchId: match._id,
			turnNumber: result.state.turnNumber,
			userId: viewer._id,
			playerId,
			row: args.row,
			col: args.col,
			events: result.events,
			createdAt: now,
		})

		return {
			state: result.state,
			events: result.events,
		}
	},
})
