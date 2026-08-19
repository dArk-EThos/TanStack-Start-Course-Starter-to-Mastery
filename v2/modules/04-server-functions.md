# Module 4 — Server functions

**Pulse files:** `src/functions/*.ts`, `src/lib/db.server.ts`

Server functions are typed RPCs. You call them like async functions. The body runs only on the server.

```ts
import { createServerFn } from '@tanstack/react-start'

export const getPublicStats = createServerFn({ method: 'GET' }).handler(async () => {
  return readOnly((db) => ({
    users: db.users.length,
    projects: db.projects.length,
    tasks: db.tasks.length,
  }))
})
```

## Methods

- `GET` (default) — reads
- `POST` — creates, updates, deletes

## Validation

Use `.validator()` with Zod (Standard Schema) or a function:

```ts
export const createProject = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(projectSchema)
  .handler(async ({ context, data }) => {
    // data is typed from the schema
  })
```

Method order is `middleware` → `validator` → `handler`.

## Calling them

| From | How |
| --- | --- |
| Loader | `loader: () => listProjects()` |
| Event handler (plain data) | `await createProject({ data })` then `router.invalidate({ sync: true })` |
| Redirect / `notFound` | wrap with `useServerFn(fn)` so the router handles the throw |

`createServerFn` returns a **function**. You must call it: `await listProjects()`, not `await listProjects`.

## Errors, redirects, notFound

```ts
throw new Error('Invalid email or password')
throw redirect({ to: '/login' })
throw notFound()
```

## Cache-coherent mutations

After a write, invalidate the route so the loader re-reads the store:

```ts
await create({ data: value })
await router.invalidate({ sync: true })
```

Do not keep a second in-memory list that can drift from the server.

## File layout

```
src/lib/db.server.ts          # server-only helpers
src/lib/schemas.ts            # shared Zod (safe on client)
src/functions/projects.functions.ts  # createServerFn wrappers
```

Static imports of server functions are safe. The bundler strips the implementation from the client bundle.

## Security

A server function is an HTTP endpoint. Anyone can POST to it without loading your React route. **Auth belongs on the function** (middleware or handler), not only in `beforeLoad`.

## Exercise

1. Add a `GET` server function that returns the current server time and show it on `/about`.
2. Add a `POST` function that renames a project. Validate with Zod. Reject names shorter than 2 characters.
3. Call the rename function from the browser console while logged out and confirm it fails.

## Next

[Module 5 — Server routes](./05-server-routes.md)
