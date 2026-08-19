# Module 11 — Data layer

**Pulse files:** `src/lib/db.server.ts`

Pulse persists JSON to `.data/pulse.json` so the course runs with zero cloud accounts. Writes are queued so Node's filesystem does not corrupt the file.

That is **not** a production database. Replace it when you outgrow the lesson.

## Recommended production path: Drizzle + Postgres

Keep the same server-function API. Swap the body of `readOnly` / `withDb`.

```ts
// sketch — not in Pulse
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { projects } from '@/lib/schema'

export const listProjects = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return db.query.projects.findMany({
      where: eq(projects.userId, context.user.id),
    })
  })
```

Index foreign keys (`userId`, `projectId`). Keep documents flat — tasks are rows, not nested arrays on a project document.

Prisma still works. Drizzle is the better fit for Vite/Start because it is TypeScript-native and does not need a generate step in the same way. Convex is excellent if you want reactive queries without SQL; it is a different backend, not a drop-in for `createServerFn` + Postgres.

## Environment

Validate env with Zod **inside** the process that needs it, not at import time on the client:

```ts
const env = z.object({ DATABASE_URL: z.string().url() }).parse(process.env)
```

Never import `db.server.ts` from a component file.

## Exercise

1. Add a `notes` table/array owned by a project.
2. Sketch a Drizzle schema for users, sessions, projects, tasks.
3. List what would break if two Node processes wrote Pulse's JSON file at once.

## Next

[Module 12 — Testing](./12-testing.md)
