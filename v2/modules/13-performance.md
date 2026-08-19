# Module 13 — Performance

Start is already route-code-split. Your job is to keep loaders small and choose SSR per route.

## Loaders

- Fetch only what the page needs
- Parallelize with `Promise.all` (see `projects/$projectId.tsx`)
- Defer secondary data
- Do not call `Date.now()` to filter in a *query that must be cacheable* — pass `now` in if you must, or store a status field

## Preload

`defaultPreload: 'intent'` + `Link` is the cheapest win. Heavy dashboards should still lazy-load charts (`ssr: false` or `ssr: 'data-only'`).

## Caching

Public, identical-for-everyone responses may use `Cache-Control: public`. Personalized data must be `private` or `no-store` and should `Vary` on `Cookie`. Pulse stats are public counts; project lists are not.

## Bundle

- Keep `lucide-react` imports per-icon (Pulse already does)
- Do not import `db.server.ts` from components
- Devtools (`TanStackRouterDevtools`) should be tree-shaken in production builds

## Monitoring

Add Sentry (or equivalent) on both the server entry and the root error component. Log auth failures without logging passwords.

## Exercise

1. Measure `/dashboard` HTML size vs `/playground`.
2. Split a heavy markdown renderer behind `ssr: false`.
3. Add `pendingComponent` to the project detail route and throttle `listTasks` to see it.

## Next

[Module 14 — Deployment](./14-deployment.md)
