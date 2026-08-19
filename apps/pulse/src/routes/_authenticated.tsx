import { Outlet, createFileRoute, redirect, useRouterState } from '@tanstack/react-router'
import { AppSidebar } from '@/components/layout/AppSidebar'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <div className="mx-auto flex w-full max-w-6xl min-h-[calc(100svh-3.5rem)]">
      <AppSidebar pathname={pathname} />
      <div className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </div>
    </div>
  )
}
