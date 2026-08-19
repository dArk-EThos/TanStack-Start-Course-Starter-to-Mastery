import { Link } from '@tanstack/react-router'
import { FolderKanban, LayoutDashboard, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function AppSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden w-56 shrink-0 border-r bg-card/40 p-4 md:block">
      <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Workspace
      </p>
      <nav className="mt-3 grid gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const active =
            item.to === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent',
                active && 'bg-accent font-medium',
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
