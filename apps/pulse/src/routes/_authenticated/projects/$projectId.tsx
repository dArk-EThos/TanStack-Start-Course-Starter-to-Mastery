import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { deleteProject, getProject } from '@/functions/projects.functions'
import { createTask, deleteTask, listTasks, updateTask } from '@/functions/tasks.functions'
import { projectSearchSchema, type TaskStatus } from '@/lib/schemas'

export const Route = createFileRoute('/_authenticated/projects/$projectId')({
  validateSearch: projectSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const [project, tasks] = await Promise.all([
      getProject({ data: { projectId: params.projectId } }),
      listTasks({ data: { projectId: params.projectId } }),
    ])
    const filtered =
      deps.status === 'all'
        ? tasks
        : tasks.filter((task) => task.status === deps.status)
    const queried = deps.q
      ? filtered.filter((task) => task.title.toLowerCase().includes(deps.q.toLowerCase()))
      : filtered
    return { project, tasks: queried, total: tasks.length }
  },
  component: ProjectPage,
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.project.name ?? 'Project'} · Pulse` }],
  }),
})

function ProjectPage() {
  const { project, tasks, total } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const router = useRouter()
  const create = useServerFn(createTask)
  const update = useServerFn(updateTask)
  const removeTask = useServerFn(deleteTask)
  const removeProject = useServerFn(deleteProject)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { title: '' },
    onSubmit: async ({ value }) => {
      if (!value.title.trim()) return
      setError(null)
      try {
        await create({ data: { projectId: project.id, title: value.title.trim() } })
        form.reset()
        await router.invalidate({ sync: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not add task')
      }
    },
  })

  async function cycleStatus(taskId: string, status: TaskStatus) {
    const next = status === 'todo' ? 'doing' : status === 'doing' ? 'done' : 'todo'
    await update({ data: { taskId, status: next } })
    await router.invalidate({ sync: true })
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground">
            ← Projects
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">{project.description || 'No description'}</p>
        </div>
        <Button
          variant="destructive"
          onClick={async () => {
            await removeProject({ data: { projectId: project.id } })
            await navigate({ to: '/projects' })
          }}
        >
          Delete project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search lives in the URL via <code>validateSearch</code>. Showing {tasks.length} of {total}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Input
            placeholder="Search tasks"
            value={search.q}
            onChange={(event) =>
              navigate({
                search: (prev) => ({ ...prev, q: event.target.value }),
                replace: true,
              })
            }
            className="max-w-xs"
          />
          {(['all', 'todo', 'doing', 'done'] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={search.status === status ? 'default' : 'outline'}
              onClick={() => navigate({ search: (prev) => ({ ...prev, status }) })}
            >
              {status}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a task</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            <form.Field name="title">
              {(field) => (
                <Input
                  placeholder="Ship the server route lesson"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              )}
            </form.Field>
            <Button type="submit">Add</Button>
          </form>
          {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks match this filter.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
              <div>
                <p className="font-medium">{task.title}</p>
                <Badge variant={task.status}>{task.status}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => cycleStatus(task.id, task.status)}>
                  Advance
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await removeTask({ data: { taskId: task.id } })
                    await router.invalidate({ sync: true })
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
