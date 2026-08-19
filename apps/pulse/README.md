# Pulse

The course app: a small project tracker you run while you read the [lessons](../../v2/README.md).

It uses the current TanStack Start stack — Vite, Nitro, file-based routing, server functions, cookie sessions, TanStack Query, TanStack Form, Zod, and shadcn-style UI.

## Run it

```bash
cd apps/pulse
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo account:

- Email: `ada@pulse.dev`
- Password: `password123`

## What to click through

| Route | What it teaches |
| --- | --- |
| `/` | SSR loader + public server function + document `head` |
| `/about` | Nested content, curriculum map |
| `/login` `/signup` | TanStack Form, Zod, `useServerFn` + `redirect` |
| `/dashboard` | Pathless `_authenticated` layout + auth middleware |
| `/projects` | Mutations + `router.invalidate({ sync: true })` |
| `/projects/$projectId` | Dynamic params, `validateSearch`, ownership checks |
| `/playground` | `ssr: false` client-only route |
| `/api/health` | Server route (raw HTTP) |
| `/api/stats.json` | Escaped filename route `stats[.]json.ts` |

## Data

Accounts, sessions, projects, and tasks persist to `.data/pulse.json` (gitignored) so you can run the app without Postgres. The [data lesson](../../v2/modules/11-data.md) shows how to replace that with Drizzle.

## Scripts

```bash
npm run dev        # Vite + Start
npm run build      # Production build via Nitro
npm run start      # node .output/server/index.mjs
npm run typecheck
npm test
```
