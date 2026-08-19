import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/functions/projects.functions'
import { profileSchema } from '@/lib/schemas'

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
  head: () => ({ meta: [{ title: 'Settings · Pulse' }] }),
})

function SettingsPage() {
  const { user } = Route.useRouteContext()
  const router = useRouter()
  const save = useServerFn(updateProfile)
  const [message, setMessage] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { name: user?.name ?? '' },
    validators: { onSubmit: profileSchema },
    onSubmit: async ({ value }) => {
      await save({ data: value })
      setMessage('Saved')
      await router.invalidate({ sync: true })
    },
  })

  return (
    <div className="grid max-w-xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Profile data is stored in the same JSON database as projects.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            <form.Field name="name">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="profile-name">Display name</Label>
                  <Input
                    id="profile-name"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <Button type="submit">Save</Button>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
