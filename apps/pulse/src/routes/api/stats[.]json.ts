import { createFileRoute } from '@tanstack/react-router'
import { readOnly } from '@/lib/db.server'

export const Route = createFileRoute('/api/stats.json')({
  server: {
    handlers: {
      GET: async () => {
        const stats = await readOnly((db) => ({
          users: db.users.length,
          projects: db.projects.length,
          tasks: db.tasks.length,
        }))
        return Response.json(stats)
      },
    },
  },
})
