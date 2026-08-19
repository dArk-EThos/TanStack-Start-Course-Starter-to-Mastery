import { Link, createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { AuthForm } from '@/components/AuthForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { loginFn } from '@/functions/auth.functions'

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: LoginPage,
  head: () => ({ meta: [{ title: 'Log in · Pulse' }] }),
})

function LoginPage() {
  const login = useServerFn(loginFn)

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Use the demo account or one you created.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <AuthForm
            mode="login"
            onSubmit={(value) => login({ data: { email: value.email, password: value.password } })}
          />
          <p className="text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link to="/signup" className="text-foreground underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
