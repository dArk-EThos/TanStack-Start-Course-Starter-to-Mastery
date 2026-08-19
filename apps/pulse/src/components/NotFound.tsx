import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">
        That route is not in the generated route tree. Check the URL or go back home.
      </p>
      <Button asChild>
        <Link to="/">Back to Pulse</Link>
      </Button>
    </main>
  )
}
