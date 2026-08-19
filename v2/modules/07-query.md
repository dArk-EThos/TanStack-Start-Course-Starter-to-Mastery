# Module 7 — TanStack Query

**Pulse files:** `src/router.tsx`

Pulse uses the official SSR helper:

```ts
import { QueryClient } from '@tanstack/react-query'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

export function getRouter() {
  const queryClient = new QueryClient()
  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })
  setupRouterSsrQueryIntegration({ router, queryClient })
  return router
}
```

`defaultPreloadStaleTime: 0` makes preloaded loaders actually refetch instead of serving a stale preload.

The root route is `createRootRouteWithContext<{ queryClient: QueryClient }>()`.

## When to use Query vs a loader

| Use a loader | Use Query |
| --- | --- |
| Data needed to render the route | Data shared across many routes |
| One-shot page payload | Polling, infinite scroll, background refetch |
| Tightly bound to the URL | Cache keyed independently of the URL |

You can combine them: a loader `ensureQueryData`s, the component `useQuery`s the same key. The SSR integration dehydrates that cache into the HTML.

## Mutations

Pulse mostly invalidates the **router** after server-function writes because the source of truth is the loader. If you introduce `useMutation`, invalidate both the query key *and* the router when the URL-driven loader must refresh.

```ts
await createProject({ data })
await queryClient.invalidateQueries({ queryKey: ['projects'] })
await router.invalidate({ sync: true })
```

## Exercise

1. Convert `listProjects` usage to `queryClient.ensureQueryData` in the loader and `useQuery` in the page.
2. Keep the create-project form working with cache invalidation.
3. Confirm a hard refresh still shows projects with no loading flash.

## Next

[Module 8 — Forms](./08-forms.md)
