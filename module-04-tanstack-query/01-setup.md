# Module 4.1: TanStack Query Setup & Integration

## Table of Contents

1. [Introduction](#introduction)
2. [Why TanStack Query?](#why-tanstack-query)
3. [Installation](#installation)
4. [QueryClient Configuration](#queryclient-configuration)
5. [Provider Setup](#provider-setup)
6. [DevTools](#devtools)
7. [Integration with Server Functions](#integration-with-server-functions)
8. [Basic Configuration Options](#basic-configuration-options)
9. [Best Practices](#best-practices)
10. [Next Steps](#next-steps)

---

## Introduction

TanStack Query (formerly React Query) is a powerful data synchronization library that makes fetching, caching, and updating data in React applications a breeze. It's the perfect complement to TanStack Start's server functions.

> [!IMPORTANT]
> TanStack Query handles **client-side** state management for server state. It works seamlessly with TanStack Start's server functions for a complete full-stack solution.

---

## Why TanStack Query?

### The Problem: Manual State Management

Without TanStack Query, managing server state is complex:

```typescript
// ❌ Without TanStack Query - lots of boilerplate!
function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refetchInterval, setRefetchInterval] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Setup polling
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refetch on window focus
  useEffect(() => {
    const handleFocus = () => fetchUsers();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
      <button onClick={fetchUsers}>Refresh</button>
    </div>
  );
}
```

**Problems:**

- ❌ Lots of boilerplate (loading, error, data state)
- ❌ Manual cache management
- ❌ Manual refetch logic
- ❌ No deduplication (multiple components = multiple requests)
- ❌ Stale data issues
- ❌ No background updates

### The Solution: TanStack Query

```typescript
// ✅ With TanStack Query - elegant and powerful!
import { useQuery } from "@tanstack/react-query";

function UsersList() {
  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30s
    refetchOnWindowFocus: true, // Refetch on focus
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

**Benefits:**

- ✅ Automatic caching
- ✅ Automatic background refetching
- ✅ Request deduplication
- ✅ Optimistic updates
- ✅ Pagination & infinite scroll
- ✅ DevTools for debugging

---

## Installation

### Install TanStack Query

```bash
pnpm add @tanstack/react-query
pnpm add -D @tanstack/react-query-devtools
```

### Verify Installation

```json
// package.json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x.x",
    "@tanstack/start": "^1.x.x"
  },
  "devDependencies": {
    "@tanstack/react-query-devtools": "^5.x.x"
  }
}
```

---

## QueryClient Configuration

The `QueryClient` is the core of TanStack Query. It manages the cache and default options.

### Basic QueryClient

```typescript
// src/lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered fresh (doesn't refetch)
      staleTime: 60 * 1000, // 1 minute

      // How long inactive data stays in cache
      gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime in v4)

      // Retry failed requests
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus
      refetchOnWindowFocus: true,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Refetch on mount if stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations on failure
      retry: 1,
    },
  },
});
```

### Advanced Configuration

```typescript
// src/lib/query-client.ts
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Global error handling for queries
      console.error("Query error:", error);

      // Log to error tracking
      if (query.state.data !== undefined) {
        // Only show toast for errors that aren't initial loads
        toast.error(`Something went wrong: ${error.message}`);
      }
    },
    onSuccess: (data) => {
      console.log("Query succeeded:", data);
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      // Global error handling for mutations
      console.error("Mutation error:", error);
      toast.error(`Action failed: ${error.message}`);
    },
    onSuccess: (data) => {
      console.log("Mutation succeeded:", data);
    },
  }),

  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        // Don't retry on 404s
        if (error.status === 404) return false;
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },
    },
  },
});
```

---

## Provider Setup

### Wrap Your App with QueryClientProvider

```typescript
// src/routes/__root.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query-client";
import {
  Outlet,
  createRootRoute,
  Scripts,
  ScrollRestoration,
} from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Outlet />
          <ScrollRestoration />
          <Scripts />

          {/* DevTools - only in development */}
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### Alternative: Per-Route Provider

```typescript
// src/routes/_authenticated.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-layout">
        <Sidebar />
        <main>
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}
```

---

## DevTools

The React Query DevTools provide a visual interface for debugging queries and mutations.

### Basic DevTools Setup

```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
```

### DevTools Configuration

```typescript
<ReactQueryDevtools
  initialIsOpen={false} // Start closed
  position="bottom-right" // Position on screen
  toggleButtonProps={{
    style: {
      marginLeft: "5.5rem", // Avoid TanStack Router DevTools
    },
  }}
/>
```

### What DevTools Show

The DevTools provide:

- ✅ **Query Explorer** - All active queries and their status
- ✅ **Query Details** - Data, errors, fetch status, timestamps
- ✅ **Mutation Tracking** - All mutations and their state
- ✅ **Cache Inspector** - View cached data
- ✅ **Actions** - Manually trigger refetch, invalidate, or remove

---

## Integration with Server Functions

TanStack Query works perfectly with TanStack Start's server functions.

### Basic Integration

```typescript
// src/lib/api/users.ts
import { createServerFn } from "@tanstack/start";

// Server function
export const getUsers = createServerFn().handler(async () => {
  return await db.user.findMany();
});

export const getUser = createServerFn().handler(
  async ({ userId }: { userId: string }) => {
    return await db.user.findUnique({
      where: { id: userId },
    });
  }
);
```

```typescript
// src/routes/users.tsx
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/lib/api/users";

export const Route = createFileRoute("/users")({
  component: UsersPage,
});

function UsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

### With Parameters

```typescript
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["users", userId], // Include params in key!
    queryFn: () => getUser({ userId }),
  });

  if (isLoading) return <div>Loading...</div>;

  return <div>User: {user.name}</div>;
}
```

### Prefetching in Loaders

```typescript
// src/routes/users.tsx
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/users")({
  loader: async () => {
    // Prefetch users data
    await queryClient.prefetchQuery({
      queryKey: ["users"],
      queryFn: () => getUsers(),
    });
  },
  component: UsersPage,
});

function UsersPage() {
  // Data is already cached from loader!
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });

  return <div>{/* Render immediately, no loading state! */}</div>;
}
```

---

## Basic Configuration Options

### Query Options

```typescript
useQuery({
  // Required
  queryKey: ["users"], // Unique identifier
  queryFn: getUsers, // Function to fetch data

  // Caching
  staleTime: 5 * 60 * 1000, // 5 minutes (fresh duration)
  gcTime: 10 * 60 * 1000, // 10 minutes (cache duration)

  // Refetching
  refetchOnMount: true, // Refetch on component mount
  refetchOnWindowFocus: true, // Refetch on window focus
  refetchOnReconnect: true, // Refetch on network reconnect
  refetchInterval: 30 * 1000, // Refetch every 30 seconds

  // Retrying
  retry: 3, // Retry 3 times on failure
  retryDelay: 1000, // Wait 1s between retries

  // Conditional
  enabled: true, // Whether to run the query

  // Callbacks
  onSuccess: (data) => {
    console.log("Data loaded:", data);
  },
  onError: (error) => {
    console.error("Error:", error);
  },
  onSettled: (data, error) => {
    console.log("Query finished");
  },
});
```

### Mutation Options

```typescript
useMutation({
  // Required
  mutationFn: createUser,

  // Callbacks
  onMutate: async (variables) => {
    // Called before mutation
    // Good for optimistic updates
  },
  onSuccess: (data, variables, context) => {
    // Called on success
    // Good for cache invalidation
  },
  onError: (error, variables, context) => {
    // Called on error
    // Good for rollbacks
  },
  onSettled: (data, error, variables, context) => {
    // Called in all cases
  },

  // Retrying
  retry: 1, // Retry once on failure
});
```

---

## Best Practices

### 1. Use Descriptive Query Keys

```typescript
// ✅ Good: Hierarchical and descriptive
queryKey: ["users"];
queryKey: ["users", userId];
queryKey: ["users", userId, "posts"];
queryKey: ["posts", { status: "published", author: userId }];

// ❌ Bad: Not descriptive
queryKey: ["data"];
queryKey: ["user1"];
```

### 2. Include All Dependencies in Query Key

```typescript
// ✅ Good: All parameters in key
function UserPosts({ userId, status }: { userId: string; status: string }) {
  const { data } = useQuery({
    queryKey: ["users", userId, "posts", { status }],
    queryFn: () => getUserPosts({ userId, status }),
  });
}

// ❌ Bad: Missing dependencies
function UserPosts({ userId, status }: { userId: string; status: string }) {
  const { data } = useQuery({
    queryKey: ["posts"], // Missing userId and status!
    queryFn: () => getUserPosts({ userId, status }),
  });
}
```

### 3. Set Appropriate Stale Times

```typescript
// ✅ Good: Different stale times based on data volatility

// Rarely changing data
useQuery({
  queryKey: ["app-config"],
  queryFn: getAppConfig,
  staleTime: Infinity, // Never stale
});

// Moderately changing
useQuery({
  queryKey: ["users"],
  queryFn: getUsers,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Frequently changing
useQuery({
  queryKey: ["live-prices"],
  queryFn: getPrices,
  staleTime: 10 * 1000, // 10 seconds
  refetchInterval: 10 * 1000,
});
```

### 4. Use Conditional Queries

```typescript
// ✅ Good: Don't fetch if dependencies aren't ready
function UserProfile({ userId }: { userId?: string }) {
  const { data: user } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUser({ userId: userId! }),
    enabled: !!userId, // Only fetch if userId exists
  });
}
```

### 5. Centralize Query Functions

```typescript
// ✅ Good: Centralized query definitions
// src/lib/queries/users.ts
export const userQueries = {
  all: () => ["users"] as const,
  lists: () => [...userQueries.all(), "list"] as const,
  list: (filters: UserFilters) => [...userQueries.lists(), filters] as const,
  details: () => [...userQueries.all(), "detail"] as const,
  detail: (id: string) => [...userQueries.details(), id] as const,
};

// Usage
useQuery({
  queryKey: userQueries.detail(userId),
  queryFn: () => getUser({ userId }),
});
```

---

## Common Patterns

### Pattern 1: Global Loading State

```typescript
// src/components/GlobalLoadingBar.tsx
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export function GlobalLoadingBar() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching > 0 || isMutating > 0;

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse" />
  );
}
```

### Pattern 2: Error Boundary Integration

```typescript
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div>
              <p>Error: {error.message}</p>
              <button onClick={resetErrorBoundary}>Try again</button>
            </div>
          )}
        >
          <MyComponent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

---

## Next Steps

Now that you have TanStack Query set up, let's dive into using queries effectively!

**→ Continue to** [Module 4.2: Queries & Data Fetching](./02-queries.md)

---

## Summary

In this lesson, you learned:

- ✅ Why TanStack Query is essential for managing server state
- ✅ Installing and configuring TanStack Query
- ✅ Setting up QueryClient with optimal defaults
- ✅ Integrating with TanStack Start's root layout
- ✅ Using React Query DevTools for debugging
- ✅ Connecting server functions with useQuery
- ✅ Best practices for query keys and configuration
- ✅ Common patterns for global state

**Up Next**: Master the useQuery hook and advanced query patterns!
