# Atom Reaction

Turn-based chain-reaction board game built with TanStack Start, Convex, and Better Auth.

MIT licensed.

## What’s Here

- Local pass-and-play
- Online matchmaking and private rooms
- Training mode with AI move suggestions
- CPU play
- AI battle simulation

## Stack

- React 19
- TanStack Start + TanStack Router
- Convex
- Better Auth
- Tailwind CSS 4
- Vitest

## Local Dev

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts both:

- Vite frontend on `http://localhost:3000`
- Convex dev loop

First run may still prompt you to create/select a Convex dev deployment.

## Environment

Copy `.env.example` to `.env.local` and fill what you need.

App-side envs:

- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`
- `VITE_POSTHOG_KEY` optional
- `VITE_POSTHOG_HOST` optional
- `SITE_URL`

Auth/runtime envs also need to exist in the Convex deployment env, not just local files:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` or `SITE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CONVEX_SITE_URL`
- `CONVEX_CLOUD_URL`
- `TRUSTED_ORIGINS`

For local Convex envs:

```bash
npx convex env set BETTER_AUTH_SECRET ...
npx convex env set GOOGLE_CLIENT_ID ...
npx convex env set GOOGLE_CLIENT_SECRET ...
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm test
pnpm typecheck
pnpm check
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Deploy

Frontend is intended for Vercel. Backend/auth run on Convex.

Current repo includes a GitHub Action that deploys Convex on pushes to `develop` using `CONVEX_DEPLOY_KEY`.

Before production auth works, make sure:

- app URL is set correctly
- Convex deployment envs are set
- Google OAuth origins + callback URLs match the deployed domain

## Status

`package.json` is still marked `"private": true` intentionally.

That prevents accidental npm publish. Public GitHub repo does not require changing it.
