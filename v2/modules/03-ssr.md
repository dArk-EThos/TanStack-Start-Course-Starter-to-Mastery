# Module 3 — Execution model and SSR

**Pulse files:** `src/routes/index.tsx` (full SSR), `src/routes/playground.tsx` (`ssr: false`)

## The #1 mistake

**All Start code is isomorphic by default.** Loaders run on the server during the first request **and** on the client during client-side navigation.

That means this is wrong:

```tsx
export const Route = createFileRoute('/projects')({
  loader: async () => {
    const rows = await db.query('select * from projects') // db is not in the browser
    return rows
  },
})
```

Put filesystem, secrets, and database access inside `createServerFn`. Call the function from the loader. The build replaces the server implementation with an RPC stub on the client.

## Selective SSR

Default is `ssr: true`: run `beforeLoad` + `loader`, render the component, stream HTML.

```tsx
export const Route = createFileRoute('/playground')({
  ssr: false,          // skip server loader + component
  pendingComponent: () => <p>Loading playground…</p>,
  component: PlaygroundPage,
})
```

Other values:

- `true` — full SSR (default)
- `'data-only'` — run loaders on the server, render the component on the client
- `false` — client only

Children can only become **more restrictive** than their parent.

The root `shellComponent` still SSR's the HTML document when the root component is client-only.

Change the app default in `src/start.ts` with `defaultSsr`.

## SPA mode

You can run Start as a SPA for the whole app. Prefer selective SSR per route unless you truly have no server render.

## Streaming

Return a promise from a loader without awaiting it, then wrap the UI in `Suspense`. The shell can paint while slow data streams in. Keep critical data awaited; defer secondary widgets.

## Environment boundaries

| Runs where | What belongs there |
| --- | --- |
| `.server.ts` | `node:fs`, `node:crypto`, DB clients, secrets |
| `createServerFn` handlers | Anything that must never ship to the browser |
| Loaders | Orchestration: call server functions, shape data |
| Components | Rendering, event handlers, `useServerFn` |

Do not read cookies or `process.env` at module scope. Read them inside the handler or middleware so edge runtimes inject env per request.

## Exercise

1. Open `/` and view page source — you should see homepage copy in the HTML.
2. Open `/playground` and view source — you should **not** see the clicked-counter UI in the first HTML.
3. Move `readFile` into a loader and confirm the client navigation blows up. Move it back into a server function.

## Next

[Module 4 — Server functions](./04-server-functions.md)
