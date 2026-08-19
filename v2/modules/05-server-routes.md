# Module 5 — Server routes

**Pulse files:** `src/routes/api/health.ts`, `src/routes/api/stats[.]json.ts`

Use **server functions** when your own UI calls the server. Use **server routes** when the HTTP contract *is* the product: webhooks, RSS, file downloads, public REST, mobile clients.

```ts
export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () =>
        Response.json({ ok: true, service: 'pulse', time: new Date().toISOString() }),
    },
  },
})
```

Escaped filenames map dots and other characters:

```
routes/api/stats[.]json.ts  →  GET /api/stats.json
```

## Handlers

Each method receives `{ request, params, context }` and must return a `Response`.

```ts
POST: async ({ request, params }) => {
  const body = await request.json()
  return Response.json({ id: params.id, body }, { status: 201 })
}
```

## Middleware on routes

```ts
server: {
  middleware: [authMiddleware],
  handlers: {
    GET: async ({ context }) => Response.json(context.user),
  },
}
```

Or attach middleware to one method with `createHandlers`.

## Do not self-fetch from loaders

```tsx
// WRONG during SSR
loader: () => fetch('/api/stats.json').then((r) => r.json())

// RIGHT
loader: () => getPublicStats()
```

If UI and an HTTP API need the same data, share a `.server.ts` helper. Pulse's stats endpoint and homepage both read `readOnly()`.

## Exercise

1. Hit `/api/health` in the browser.
2. Add `GET /api/projects.csv` that returns a CSV of the current user's projects. Protect it with auth middleware.
3. Add a POST webhook stub at `/api/webhooks/stripe` that reads the raw body and returns 200.

## Next

[Module 6 — Middleware](./06-middleware.md)
