import {
  ErrorComponent,
  Link,
  useRouter,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  console.error(error)

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">Something went wrong</p>
      <ErrorComponent error={error} />
      <div className="flex gap-2">
        <Button onClick={() => router.invalidate()}>Try again</Button>
        <Button variant="outline" asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </main>
  )
}
