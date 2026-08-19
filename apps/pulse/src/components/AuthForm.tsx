import { useForm } from '@tanstack/react-form'
import { useState, type ReactNode } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, signupSchema } from '@/lib/schemas'

type Mode = 'login' | 'signup'

export function AuthForm({
  mode,
  onSubmit,
}: {
  mode: Mode
  onSubmit: (value: { name?: string; email: string; password: string }) => Promise<void>
}) {
  const [error, setError] = useState<string | null>(null)
  const schema = mode === 'signup' ? signupSchema : loginSchema

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError(null)
      const parsed = schema.safeParse(value)
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? 'Invalid input')
        return
      }
      try {
        await onSubmit(parsed.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    },
  })

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      {error ? <Alert>{error}</Alert> : null}
      {mode === 'signup' ? (
        <form.Field name="name">
          {(field) => (
            <Field label="Name" error={field.state.meta.errors[0]}>
              <Input
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                autoComplete="name"
              />
            </Field>
          )}
        </form.Field>
      ) : null}
      <form.Field name="email">
        {(field) => (
          <Field label="Email" error={field.state.meta.errors[0]}>
            <Input
              type="email"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              autoComplete="email"
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <Field label="Password" error={field.state.meta.errors[0]}>
            <Input
              type="password"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </Field>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Working…' : mode === 'signup' ? 'Create account' : 'Log in'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: unknown
  children: ReactNode
}) {
  const message =
    typeof error === 'string'
      ? error
      : error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : null

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {message ? <p className="text-xs text-destructive">{message}</p> : null}
    </div>
  )
}
