# Module 15 — Pulse capstone

Build fluency by tracing a single user action through the stack.

## Trace: create a task

1. Browser: `/projects/$projectId` form submit (`TanStack Form`)
2. `useServerFn(createTask)` POST RPC
3. `createTaskSchema` validates `{ projectId, title }`
4. `authMiddleware` loads the session cookie → `context.user`
5. Handler loads the project, **checks `project.userId === context.user.id`**, inserts a task
6. `router.invalidate({ sync: true })` re-runs the loader
7. Loader calls `getProject` + `listTasks` in parallel and applies `validateSearch` filters
8. UI re-renders from `Route.useLoaderData()`

If you skip step 4, anyone who can guess a project id can write to it. If you skip step 6, the page lies.

## File map

```
apps/pulse/src
├── start.ts                 global request middleware
├── router.tsx               Query SSR + preload
├── routes/__root.tsx        document shell, session in context
├── routes/index.tsx         public SSR landing
├── routes/login.tsx         Form + redirect
├── routes/_authenticated.tsx UX guard + sidebar
├── routes/_authenticated/projects/$projectId.tsx
├── routes/playground.tsx    ssr: false
├── routes/api/health.ts     server route
├── functions/*.ts           RPCs
└── lib/*.server.ts          Node-only code
```

## Capstone upgrades (pick two)

- Replace JSON storage with Drizzle + Postgres
- Replace cookies with Better Auth
- Add Playwright CI
- Add AlertDialog + Table from shadcn
- Add a public changelog page prerendered at build time
- Deploy to Cloudflare after moving off `node:fs`

## Definition of done

- Logged-out user cannot read or write projects via the RPC
- Logged-in user cannot read another user's project by id
- Create/update/delete survive a full page reload
- `/api/health` returns JSON
- `/playground` is client-rendered
- `npm test` and `npm run typecheck` pass
