import { Link, createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, FolderKanban, ListTodo } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardData } from '@/functions/projects.functions'
import { formatDate } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: () => getDashboardData(),
  component: DashboardPage,
  head: () => ({ meta: [{ title: 'Dashboard · Pulse' }] }),
})

function DashboardPage() {
  const data = Route.useLoaderData()
  const { user } = Route.useRouteContext()

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hello, {user?.name}</h1>
        <p className="text-muted-foreground">Your workspace, loaded by a server function in the route loader.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={FolderKanban} label="Projects" value={data.projectCount} />
        <Metric icon={ListTodo} label="Tasks" value={data.taskCount} />
        <Metric icon={CheckCircle2} label="Done" value={data.doneCount} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent tasks</CardTitle>
          <CardDescription>Newest items from every project you own.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {data.recentTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet. Create a project to get started.</p>
          ) : (
            data.recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(task.createdAt)}</p>
                </div>
                <Badge variant={task.status}>{task.status}</Badge>
              </div>
            ))
          )}
          <Link to="/projects" className="text-sm text-primary underline-offset-4 hover:underline">
            Manage projects
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FolderKanban
  label: string
  value: number
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4" />
          {label}
        </CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}
