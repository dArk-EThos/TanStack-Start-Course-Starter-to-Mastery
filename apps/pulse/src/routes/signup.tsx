import { Link, createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { AuthForm } from '@/components/AuthForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signupFn } from '@/functions/auth.functions'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
  head: () => ({ meta: [{ title: 'Sign up · Pulse' }] }),
})

function SignupPage() {
  const signup = useServerFn(signupFn)

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create your workspace</CardTitle>
          <CardDescription>Accounts are stored in a local JSON file for the course.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <AuthForm
            mode="signup"
            onSubmit={(value) =>
              signup({
                data: {
                  name: value.name ?? '',
                  email: value.email,
                  password: value.password,
                },
              })
            }
          />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
