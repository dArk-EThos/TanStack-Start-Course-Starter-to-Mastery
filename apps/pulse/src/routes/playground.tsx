import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/playground')({
  ssr: false,
  pendingComponent: () => (
    <main className="px-4 py-12 text-sm text-muted-foreground">Loading playground…</main>
  ),
  component: PlaygroundPage,
  head: () => ({ meta: [{ title: 'Playground · Pulse' }] }),
})

function PlaygroundPage() {
  const [count, setCount] = useState(0)

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Client-only playground</CardTitle>
          <CardDescription>
            This route sets <code>ssr: false</code>. The loader and component skip the
            server render; only the document shell is sent, then this UI hydrates in
            the browser. Use this for charts, editors, or anything that cannot run on
            the server.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Button onClick={() => setCount((value) => value + 1)}>Clicked {count}</Button>
          <p className="text-sm text-muted-foreground">No server function involved.</p>
        </CardContent>
      </Card>
    </main>
  )
}
