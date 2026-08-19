import { Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { LayoutDashboard, LogOut, Sparkles } from 'lucide-react'
import { logoutFn } from '@/functions/auth.functions'
import type { PublicUser } from '@/lib/session.server'
import { Button } from '@/components/ui/button'

export function SiteHeader({ user }: { user: PublicUser | null }) {
  const router = useRouter()
  const logout = useServerFn(logoutFn)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Sparkles className="size-4 text-primary" />
          Pulse
        </Link>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/about">About</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/playground">Playground</Link>
          </Button>
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout().then(() => router.invalidate())}
              >
                <LogOut />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
