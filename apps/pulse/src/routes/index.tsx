import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Lock, Server, Spline } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getPublicStats } from '@/functions/auth.functions'

export const Route = createFileRoute('/')({
  loader: () => getPublicStats(),
  component: HomePage,
})

function HomePage() {
  const stats = Route.useLoaderData()
  const { user } = Route.useRouteContext()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16">
      <div className="max-w-2xl">
        <Badge variant="secondary">TanStack Start v2 course app</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
          Full-stack React, typed from the URL to the database.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Pulse is the working companion for this course. It uses Vite, Nitro,
          file-based routing, server functions, cookie sessions, and shadcn/ui —
          no Vinxi, no Next.js conventions.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to={user ? '/dashboard' : '/signup'}>
              {user ? 'Open dashboard' : 'Create an account'}
              <ArrowRight />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/about">See the curriculum map</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Demo login: <code>ada@pulse.dev</code> / <code>password123</code>
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <StatCard label="Users" value={stats.users} />
        <StatCard label="Projects" value={stats.projects} />
        <StatCard label="Tasks" value={stats.tasks} />
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <Feature
          icon={Spline}
          title="Router-first"
          body="Routes, search params, loaders, and layouts stay TanStack Router. Start adds the server around that same tree."
        />
        <Feature
          icon={Server}
          title="Visible server work"
          body="createServerFn is a typed RPC. Database and secrets stay in .server.ts files and never ship to the browser."
        />
        <Feature
          icon={Lock}
          title="Auth at the data boundary"
          body="Route guards protect UX. Middleware on server functions protects the actual endpoints."
        />
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Spline
  title: string
  body: string
}) {
  return (
    <Card>
      <CardHeader>
        <Icon className="size-5 text-primary" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}
