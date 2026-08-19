import type { ReactNode } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary'
import { NotFound } from '@/components/NotFound'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { getCurrentUser } from '@/functions/auth.functions'
import appCss from '@/styles/app.css?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    return { user }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Pulse · TanStack Start v2' },
      {
        name: 'description',
        content:
          'A working TanStack Start course app covering routing, server functions, auth, and shadcn/ui.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.min.css',
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
  component: RootComponent,
})

function RootComponent() {
  const { user } = Route.useRouteContext()
  return (
    <div className="min-h-svh">
      <SiteHeader user={user} />
      <Outlet />
    </div>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
