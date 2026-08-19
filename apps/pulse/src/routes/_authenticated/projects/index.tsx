import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createProject, listProjects } from '@/functions/projects.functions'
import { projectSchema } from '@/lib/schemas'

export const Route = createFileRoute('/_authenticated/projects/')({
  loader: () => listProjects(),
  component: ProjectsPage,
  head: () => ({ meta: [{ title: 'Projects · Pulse' }] }),
})

function ProjectsPage() {
  const projects = Route.useLoaderData()
  const router = useRouter()
  const create = useServerFn(createProject)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { name: '', description: '' },
    validators: { onSubmit: projectSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await create({ data: value })
        form.reset()
        await router.invalidate({ sync: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not create project')
      }
    },
  })

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Each card is owned by your session user and loaded through auth middleware.</p>
        </div>
        {projects.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No projects yet</CardTitle>
              <CardDescription>Create one with the form on the right.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          projects.map((project) => (
            <Link key={project.id} to="/projects/$projectId" params={{ projectId: project.id }}>
              <Card className="transition-colors hover:bg-accent/40">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>{project.description || 'No description'}</CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {project.doneCount}/{project.taskCount}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))
        )}
      </div>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>New project</CardTitle>
          <CardDescription>Validated with Zod, then posted as a server function.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <form.Field name="name">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="description">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating…' : 'Create project'}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
