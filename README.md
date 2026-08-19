# TanStack Start: Starter to Mastery

A hands-on course for developers who already know React and want to build full-stack apps with **TanStack Start** — typed routing, server functions, and SSR on Vite.

You learn by running a real app (**Pulse**), then reading the lesson that explains the files you just opened. No toy snippets that drift away from a working project.

This edition is current as of **August 2026** (TanStack Start Release Candidate, Vite, Nitro, Tailwind v4, shadcn/ui).

---

## Who this is for

- React developers moving into full-stack work
- Next.js developers who want a router-first, deploy-anywhere alternative
- Anyone building dashboards, SaaS, or content sites and who cares about TypeScript end to end

**Prerequisites:** solid React (hooks, components), comfortable TypeScript, and a basic idea of how HTTP and databases work. Next.js experience helps but is not required.

**Time:** about 60–80 hours if you do the exercises and the capstone upgrades.

---

## What you will build

**Pulse** is a small project tracker that ships with the course. By the end you will have used it to practice:

- File-based routing, layouts, and URL search state
- Server functions (typed RPCs) and raw HTTP server routes
- Cookie sessions and protected pages
- Forms, validation, and mutations that stay in sync with the server
- shadcn/ui on Tailwind v4
- Tests and a production build you can deploy

Demo account once the app is running: `ada@pulse.dev` / `password123`

---

## Start here

### 1. Run the app

```bash
cd apps/pulse
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click around the marketing page, log in, create a project, add a task. That is the product you will learn to explain.

### 2. Read the lessons in order

Keep Pulse running. Each lesson points at the files that implement it.

**[Open the lesson index →](./v2/README.md)**

Beginner → [1. Foundation](./v2/modules/01-foundation.md) · [2. Routing](./v2/modules/02-routing.md) · [3. SSR](./v2/modules/03-ssr.md)

Intermediate → [4. Server functions](./v2/modules/04-server-functions.md) · [5. Server routes](./v2/modules/05-server-routes.md) · [6. Middleware](./v2/modules/06-middleware.md) · [7. Query](./v2/modules/07-query.md) · [8. Forms](./v2/modules/08-forms.md)

Advanced → [9. Auth](./v2/modules/09-auth.md) · [10. UI](./v2/modules/10-ui.md) · [11. Data](./v2/modules/11-data.md) · [12. Testing](./v2/modules/12-testing.md) · [13. Performance](./v2/modules/13-performance.md) · [14. Deployment](./v2/modules/14-deployment.md)

Capstone → [15. Pulse walkthrough](./v2/modules/15-capstone.md)

Type the examples. Finish the exercises. Break things on purpose.

---

## How to take the course

1. **Run Pulse first** so every idea has a screen attached to it.
2. **Read one module at a time** with the listed files open.
3. **Do the exercises** before moving on — they are short on purpose.
4. **Use the official docs** when you want more depth than a lesson.

Pulse stores data in a local JSON file so you do not need Postgres on day one. Later lessons show how to replace that with a real database.

---

## Stack

| Layer | What we use |
| --- | --- |
| App framework | TanStack Start + TanStack Router |
| Data on the client | TanStack Query, TanStack Form, Zod |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Build and deploy | Vite, Nitro (Node, Cloudflare, Netlify, Vercel, …) |

Official references: [Start](https://tanstack.com/start/latest) · [Router](https://tanstack.com/router/latest) · [shadcn + Start](https://ui.shadcn.com/docs/installation/tanstack) · [Hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)

---

## About this edition

The course was rewritten so the lessons match how TanStack Start actually works today (Vite plugin, `createServerFn`, document shell, Nitro). Follow **Pulse** and the **[lessons](./v2/README.md)** — that is the whole path.

You may also see `module-01` … `module-14` folders in the repo. Those are older notes from 2024. You can ignore them. If you used this repo before, the API cheat sheet is in [v2/FROM-V1.md](./v2/FROM-V1.md).
