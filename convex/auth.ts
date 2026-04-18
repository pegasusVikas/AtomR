import { createClient } from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/plugins'
import { betterAuth } from 'better-auth/minimal'
import { query } from './_generated/server'
import { components } from './_generated/api'
import type { DataModel } from './_generated/dataModel'
import type { GenericCtx } from '@convex-dev/better-auth'
import authConfig from './auth.config'

const fallbackLocalSiteUrl = 'http://localhost:3000'

function isLocalSiteUrl(url?: string) {
	if (!url) return true

	try {
		const { hostname } = new URL(url)
		return (
			hostname === 'localhost' ||
			hostname === '127.0.0.1' ||
			hostname === '0.0.0.0' ||
			hostname.endsWith('.local')
		)
	} catch {
		return false
	}
}

function readAuthModes() {
	const configuredSiteUrl = process.env.SITE_URL || process.env.BETTER_AUTH_URL
	const siteUrl = configuredSiteUrl || fallbackLocalSiteUrl
	const isLocal = isLocalSiteUrl(configuredSiteUrl)
	const googleEnabled = Boolean(
		process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
	)

	return {
		siteUrl,
		isLocal,
		googleEnabled,
		emailPasswordEnabled: isLocal && !googleEnabled,
	}
}

function resolveAuthModesForAuth() {
	const modes = readAuthModes()

	if (!modes.isLocal && !modes.googleEnabled) {
		throw new Error(
			'Google auth must be configured in production. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.',
		)
	}

	return modes
}

export const authComponent = createClient<DataModel>(components.betterAuth)

export const createAuth = (ctx: GenericCtx<DataModel>) => {
	const { siteUrl, googleEnabled, emailPasswordEnabled } =
		resolveAuthModesForAuth()

	return betterAuth({
		baseURL: siteUrl,
		trustedOrigins: Array.from(
			new Set([siteUrl, fallbackLocalSiteUrl, 'http://127.0.0.1:3000']),
		),
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: emailPasswordEnabled,
			requireEmailVerification: false,
		},
		socialProviders: googleEnabled
			? {
					google: {
						clientId: process.env.GOOGLE_CLIENT_ID as string,
						clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
					},
			  }
			: undefined,
		plugins: [convex({ authConfig })],
	})
}

export const getAuthModes = query({
	args: {},
	handler: async () => {
		const { isLocal, googleEnabled, emailPasswordEnabled } = readAuthModes()
		return {
			isLocal,
			googleEnabled,
			emailPasswordEnabled,
		}
	},
})

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		return await authComponent.getAuthUser(ctx)
	},
})
