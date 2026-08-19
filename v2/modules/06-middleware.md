# Module 6 — Middleware

**Pulse files:** `src/lib/middleware.ts`, `src/start.ts`

Two kinds:

| | Request middleware | Function middleware |
| --- | --- | --- |
| Created with | `createMiddleware()` | `createMiddleware({ type: 'function' })` |
| Runs on | Every server request | `createServerFn` only |
| Has `.client()` | No | Yes |
| Has `.validator()` | No | Yes |

TypeScript enforces order: `middleware()` → `validator()` → `client()` → `server()`.

## Context

```ts
export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const user = await getSessionUser()
    if (!user) throw new Error('Unauthorized')
    return next({ context: { user } })
  },
)
```

Handlers then read `context.user` with full types.

## Global middleware

```ts
export const startInstance = createStart(() => ({
  requestMiddleware: [originCheckMiddleware, requestLoggerMiddleware],
}))
```

Pulse checks `Origin` on non-GET requests so cookie-authenticated POSTs are same-origin.

## sendContext is not auth

Anything a client middleware puts in `sendContext` is **untrusted input**. Parse the shape, then authorize against the **session** from the cookie, not against the ID the client sent.

## `.client()` during SSR

Function middleware `.client()` also runs on the server during SSR. Guard `window` / `localStorage`.

## Exercise

1. Log `context.user.email` inside `listProjects`.
2. Add a `requireAdmin` middleware factory and attach it to a dummy `/admin` server function.
3. Remove `authMiddleware` from `listTasks` and confirm you can hit the RPC while logged out. Put it back.

## Next

[Module 7 — TanStack Query](./07-query.md)
