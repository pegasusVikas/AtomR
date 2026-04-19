# Contributing

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

`pnpm dev` starts both the app and Convex dev loop.

## Before Opening a PR

Run:

```bash
pnpm check
pnpm typecheck
pnpm test
pnpm build
```

## Scope

- Keep changes small and focused.
- Preserve the existing visual language unless the change is explicitly a redesign.
- For backend/auth changes, remember local app env and Convex deployment env are separate.

## Notes

- `package.json` stays `"private": true` on purpose. This repo is public-source, not npm-publishable.
- Do not commit `.env`, `.env.local`, deploy keys, or Convex secrets.
