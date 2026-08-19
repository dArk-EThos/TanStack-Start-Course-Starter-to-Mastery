# Module 1 — Foundation

**Pulse files:** `vite.config.ts`, `src/router.tsx`, `src/routes/__root.tsx`, `src/start.ts`

TanStack Start is a full-stack React framework built on **TanStack Router**. The router is the application contract. Start adds SSR, streaming, server functions, middleware, and a deployable server around that same route tree.

It is **not Next.js**. Do not use `"use server"`, `app/layout.tsx`, `getServerSideProps`, or `react-router-dom`.

On Vite 7, add `vite-tsconfig-paths` so `@/` aliases resolve. Vite 8 examples use `resolve: { tsconfigPaths: true }` instead.

## Create a project

Preferred:

```bash
npx @tanstack/cli@latest create
```

Or start from an official example:

```bash
npx gitpick TanStack/router/tree/main/examples/react/start-basic my-app
```

Or scaffold with shadcn already wired:

```bash
pnpm dlx shadcn@latest init -t start -d --base radix
```

This course uses Pulse, which is wired by hand so you can see every file.

## Vite plugin order

```ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  plugins: [
    tsConfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart({ srcDirectory: 'src' }), // MUST come before viteReact()
    viteReact(),
    nitro(),
  ],
})
```

If React is registered before Start, route generation and server-function compilation fail.

Scripts:

```json
{
  "dev": "vite dev",
  "build": "vite build",
  "start": "node .output/server/index.mjs"
}
```

## Router factory

```ts
// src/router.tsx
export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
  })
  return router
}
```

`routeTree.gen.ts` is generated when you run `vite dev`. Do not hand-edit it.

## Document shell

The root route always matches. It owns `<html>`, `<head>`, and `<body>`.

Required pieces:

- `head` — typed meta/link/script tags
- `HeadContent` — renders them
- `Scripts` — hydrates the client. Missing this means a dead page.
- `shellComponent` — always SSR'd even if the root component is client-only
- `Outlet` — child routes

See `apps/pulse/src/routes/__root.tsx`.

## Global Start config

`src/start.ts` is optional. When you add it, you own request-level middleware:

```ts
export const startInstance = createStart(() => ({
  requestMiddleware: [originCheckMiddleware, requestLoggerMiddleware],
  defaultSsr: true,
}))
```

## TypeScript

Keep `verbatimModuleSyntax` **off**. It can leak server bundles into the client.

Path aliases (`@/*`) belong in `tsconfig.json`. Vite 7+ can honor them with `resolve.tsconfigPaths: true`.

## Exercise

1. Run Pulse.
2. Change the homepage title in `Route.head` and confirm the tab text updates.
3. Temporarily remove `<Scripts />`, reload, and watch client navigation die. Put it back.

## Next

[Module 2 — Routing](./02-routing.md)
