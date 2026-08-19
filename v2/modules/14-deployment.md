# Module 14 — Deployment

**Pulse files:** `vite.config.ts`, `package.json` scripts

TanStack Start deploys through **Vite + Nitro** (or a host plugin). There is no Vinxi.

```bash
npm run build
npm run start   # node .output/server/index.mjs
```

## Targets

| Host | Plugin / notes |
| --- | --- |
| Node / Docker / Railway / Vercel | `nitro()` in Vite |
| Cloudflare Workers | `@cloudflare/vite-plugin` + `wrangler` — **official partner** |
| Netlify | `@netlify/vite-plugin-tanstack-start` — **official partner** |
| Bun | `nitro({ preset: 'bun' })` or a custom Bun server |

Official hosting guide: [tanstack.com/start hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting).

Cloudflare `wrangler.jsonc` points `main` at `@tanstack/react-start/server-entry` and needs `nodejs_compat` if you use Node APIs. Pulse's `node:fs` JSON store will **not** run on Workers as-is — swap to KV/D1/Drizzle before deploying there.

## Environment

Set `NODE_ENV=production` so Pulse emits the `Secure` cookie flag. Provide `DATABASE_URL` (when you add a real DB) through the host's secret store, not a committed `.env`.

## CI

1. `npm test`
2. `npm run typecheck`
3. `npm run build`
4. Deploy only if all three pass

## Exercise

1. Build Pulse locally and run `npm run start`.
2. Deploy the same build to Railway or a Docker node.
3. Write a one-page runbook: which env vars, which start command, how to inspect `.data/pulse.json` vs a hosted Postgres.

## Next

[Module 15 — Capstone](./15-capstone.md)
