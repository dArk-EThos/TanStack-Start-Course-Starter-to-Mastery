# Migrating from v1 notes

The original modules (`module-01-foundation` … `module-14-kinde-auth`) were written in December 2024. Keep them as historical notes. Rewrite any copy-paste against this table.

| If v1 says | Use this instead |
| --- | --- |
| `vinxi dev` / `vinxi build` / `vinxi start` | `vite dev` / `vite build` / `node .output/server/index.mjs` |
| `pnpm create @tanstack/start@latest` | `npx @tanstack/cli@latest create` |
| `import { createServerFn } from '@tanstack/start'` | `import { createServerFn } from '@tanstack/react-start'` |
| `import { defineConfig } from '@tanstack/start/config'` in `app.config.ts` | `tanstackStart()` in `vite.config.ts` |
| `StartClient` from `@tanstack/start` in `client.tsx` | Start generates the client entry; you provide `getRouter()` |
| `.inputValidator(...)` | `.validator(...)` |
| Database calls inside `loader` | `loader: () => myServerFn()` |
| `npx shadcn-ui@latest init` with `"rsc": true` | `npx shadcn@latest init -t start` with `"rsc": false` |
| Tailwind v3 `@tailwind base` | Tailwind v4 `@import "tailwindcss"` + `@tailwindcss/vite` |
| Route guard as the only auth | `authMiddleware` on every private `createServerFn` |

Better Auth and Kinde lessons in v1 are still directionally right (hosted vs self-hosted). Wire them with current Start examples (`start-clerk-basic`, `start-workos`, Better Auth's TanStack Start plugin) rather than the 2024 file paths.
