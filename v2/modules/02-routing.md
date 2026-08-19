# Module 2 — File-based routing

**Pulse files:** `src/routes/*`, especially `_authenticated.tsx`, `projects/$projectId.tsx`

Start uses TanStack Router file routing. File names become URLs. The bundler plugin rewrites the string you pass to `createFileRoute`.

## Conventions

| File | URL |
| --- | --- |
| `routes/index.tsx` | `/` |
| `routes/about.tsx` | `/about` |
| `routes/projects/$projectId.tsx` | `/projects/:projectId` |
| `routes/_authenticated.tsx` | pathless layout (no extra URL segment) |
| `routes/api/stats[.]json.ts` | `/api/stats.json` (escaped dot) |
| `routes/file/$.ts` | splat / wildcard |

## Route object

Every route exports `Route`:

```tsx
export const Route = createFileRoute('/about')({
  loader: async () => { /* ... */ },
  component: AboutPage,
  head: () => ({ meta: [{ title: 'About' }] }),
  pendingComponent: () => <p>Loading…</p>,
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: NotFound,
})
```

Read loader data with `Route.useLoaderData()`. Read params with `Route.useParams()`. That is how you keep types coupled to the file.

## Pathless authenticated layout

```tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: () => (
    <>
      <AppSidebar />
      <Outlet />
    </>
  ),
})
```

`beforeLoad` is **UX**. It stops a signed-out user from seeing the dashboard. It does **not** protect `createServerFn` endpoints. Module 9 covers that.

## Search params

Search state is first-class. Validate it with Zod:

```tsx
export const Route = createFileRoute('/_authenticated/projects/$projectId')({
  validateSearch: projectSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => { /* filter by deps.q and deps.status */ },
})
```

Updating filters should `navigate({ search: (prev) => ({ ...prev, status: 'done' }) })` so the URL is shareable.

## Preloading

Pulse sets `defaultPreload: 'intent'` in `getRouter()`. Hovering a `Link` runs the next route's loader. Keep loaders cheap: they should call server functions, not do extra work on the client.

## Nested vs flat files

These are equivalent:

- `routes/projects/$projectId.tsx`
- `routes/projects.$projectId.tsx`

Pick one style per app. Pulse uses directories for authenticated pages.

## Exercise

1. Add a `/changelog` route with a `head` title.
2. Add a search param `tab` on settings (`profile` | `danger`) and switch UI from the URL.
3. Break a `Link` `to` value on purpose and watch TypeScript fail.

## Next

[Module 3 — Execution model and SSR](./03-ssr.md)
