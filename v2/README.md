# Lessons

Read these in order with [Pulse](../apps/pulse) running (`cd apps/pulse && npm run dev`). Each module lists the files to keep open.

Demo login: `ada@pulse.dev` / `password123`

## Beginner

1. [Foundation](./modules/01-foundation.md) — Vite plugin, router factory, document shell
2. [Routing](./modules/02-routing.md) — file routes, params, search, layouts, preload
3. [Execution model and SSR](./modules/03-ssr.md) — isomorphic code, selective SSR, SPA mode

## Intermediate

4. [Server functions](./modules/04-server-functions.md) — typed RPCs, Zod, errors, redirects
5. [Server routes](./modules/05-server-routes.md) — raw HTTP for APIs and webhooks
6. [Middleware](./modules/06-middleware.md) — request vs function middleware
7. [TanStack Query](./modules/07-query.md) — SSR integration and mutations
8. [Forms](./modules/08-forms.md) — TanStack Form + Zod + shadcn fields

## Advanced

9. [Authentication](./modules/09-auth.md) — cookies, middleware, production auth options
10. [UI with shadcn](./modules/10-ui.md) — Tailwind v4, tokens, composition
11. [Data layer](./modules/11-data.md) — JSON store now, Drizzle/Postgres later
12. [Testing](./modules/12-testing.md) — Vitest, Playwright, auth tests
13. [Performance](./modules/13-performance.md) — splitting, preload, caching
14. [Deployment](./modules/14-deployment.md) — Nitro, Cloudflare, Netlify, Vercel, Node

## Capstone

15. [Pulse walkthrough](./modules/15-capstone.md) — one user action, traced through the stack

## How to use a lesson

1. Skim the Pulse files named at the top
2. Read the lesson
3. Complete the exercises before the next module

Back to the [course README](../README.md).
