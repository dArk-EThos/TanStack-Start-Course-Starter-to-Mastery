import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/about')({
  component: AboutPage,
  head: () => ({
    meta: [{ title: 'About Pulse · TanStack Start v2' }],
  }),
})

const modules = [
  ['01 Foundation', 'Vite plugin, getRouter, HeadContent, Scripts, Nitro'],
  ['02 Routing', 'File routes, params, search schemas, pathless layouts, preload'],
  ['03 Execution & SSR', 'Isomorphic loaders, selective SSR, SPA mode'],
  ['04 Server functions', 'createServerFn, Zod validators, useServerFn'],
  ['05 Server routes', 'Raw HTTP handlers for APIs and webhooks'],
  ['06 Middleware', 'Request vs function middleware, context, origin checks'],
  ['07 Query', 'SSR Query integration and cache-coherent mutations'],
  ['08 Forms', 'TanStack Form + Zod Standard Schema'],
  ['09 Auth', 'HttpOnly cookies, auth middleware, route UX guards'],
  ['10 UI', 'shadcn/ui on TanStack Start with Tailwind v4'],
]

function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">How Pulse maps to the course</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Every concept in v2 is implemented in this app. Open the source next to
        the lesson — do not copy Vinxi-era snippets from the legacy modules.
      </p>
      <div className="mt-8 grid gap-3">
        {modules.map(([title, body]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Try the HTTP API</CardTitle>
          <CardDescription>
            Server routes live next to UI routes. Pulse exposes a health check
            and a JSON stats endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm">
          <a href="/api/health" className="text-primary underline-offset-4 hover:underline">
            /api/health
          </a>
          <a href="/api/stats.json" className="text-primary underline-offset-4 hover:underline">
            /api/stats.json
          </a>
        </CardContent>
      </Card>
    </main>
  )
}
