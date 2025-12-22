# Module 4.2: Queries & Data Fetching

## Table of Contents

1. [Introduction](#introduction)
2. [useQuery Basics](#usequery-basics)
3. [Query Keys Deep Dive](#query-keys-deep-dive)
4. [Dependent Queries](#dependent-queries)
5. [Parallel Queries](#parallel-queries)
6. [Pagination](#pagination)
7. [Infinite Queries](#infinite-queries)
8. [Query Invalidation](#query-invalidation)
9. [Prefetching](#prefetching)
10. [Best Practices](#best-practices)
11. [Next Steps](#next-steps)

---

## Introduction

Queries are the foundation of TanStack Query. The `useQuery` hook fetches, caches, and synchronizes server state with your UI automatically.

> [!TIP]
> Think of `useQuery` as a supercharged `useState` + `useEffect` combo specifically designed for server state!

---

## useQuery Basics

### Simple Query

```typescript
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/lib/api/users";

function UsersList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Query States

TanStack Query provides granular loading states:

```typescript
function UsersList() {
  const {
    data,
    error,

    // Loading states
    isLoading, // Initial load (no cached data)
    isFetching, // Any fetch (including background)
    isRefetching, // Background refetch
    isPending, // More semantic name for isLoading

    // Success/Error states
    isSuccess,
    isError,

    // Data status
    status, // 'pending' | 'error' | 'success'
    fetchStatus, // 'fetching' | 'paused' | 'idle'

    // Other
    dataUpdatedAt, // Timestamp of last successful fetch
    errorUpdatedAt, // Timestamp of last error
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  return (
    <div>
      {isFetching && !isLoading && (
        <div className="absolute top-0 right-0">
          <Spinner size="sm" />
        </div>
      )}

      {isLoading && <LoadingSkeleton />}
      {isError && <ErrorMessage error={error} />}
      {isSuccess && <UserList users={data} />}
    </div>
  );
}
```

### Query with Parameters

```typescript
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["users", userId], // Include parameter in key!
    queryFn: () => getUser({ userId }),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

---

## Query Keys Deep Dive

Query keys uniquely identify queries and their cached data.

### Key Structure

```typescript
// Simple string
queryKey: ["users"];

// With ID
queryKey: ["users", userId];

// With filters
queryKey: ["posts", { status: "published", author: userId }];

// Nested resources
queryKey: ["users", userId, "posts"];
queryKey: ["users", userId, "posts", postId, "comments"];
```

### Query Key Factory Pattern

Create a centralized query key factory:

```typescript
// src/lib/queries/users.ts
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  posts: (id: string) => [...userKeys.detail(id), "posts"] as const,
};

// Usage
useQuery({
  queryKey: userKeys.detail(userId),
  queryFn: () => getUser({ userId }),
});

useQuery({
  queryKey: userKeys.posts(userId),
  queryFn: () => getUserPosts({ userId }),
});

// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: userKeys.all });

// Invalidate specific user
queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
```

### Why Query Keys Matter

```typescript
// These are DIFFERENT queries with separate cache
useQuery({ queryKey: ["users"], queryFn: getUsers });
useQuery({ queryKey: ["users", "archived"], queryFn: getArchivedUsers });
useQuery({
  queryKey: ["users", { status: "active" }],
  queryFn: getActiveUsers,
});

// These are the SAME query (share cache)
useQuery({ queryKey: ["users", "123"], queryFn: () => getUser("123") });
useQuery({ queryKey: ["users", "123"], queryFn: () => getUser("123") });
// ↑ Second component uses cached data from first!
```

---

## Dependent Queries

Queries that depend on data from other queries.

### Basic Dependent Query

```typescript
function UserWithPosts({ userId }: { userId: string }) {
  // First query: Get user
  const { data: user } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUser({ userId }),
  });

  // Second query: Get user's posts (depends on user)
  const { data: posts } = useQuery({
    queryKey: ["users", userId, "posts"],
    queryFn: () => getUserPosts({ userId }),
    enabled: !!user, // Only run if user is loaded
  });

  return (
    <div>
      <UserCard user={user} />
      {posts && <PostsList posts={posts} />}
    </div>
  );
}
```

### Complex Dependency Chain

```typescript
function OrderDetails({ orderId }: { orderId: string }) {
  // Step 1: Get order
  const { data: order } = useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => getOrder({ orderId }),
  });

  // Step 2: Get customer (depends on order)
  const { data: customer } = useQuery({
    queryKey: ["customers", order?.customerId],
    queryFn: () => getCustomer({ customerId: order!.customerId }),
    enabled: !!order?.customerId,
  });

  // Step 3: Get customer's address (depends on customer)
  const { data: address } = useQuery({
    queryKey: ["addresses", customer?.addressId],
    queryFn: () => getAddress({ addressId: customer!.addressId }),
    enabled: !!customer?.addressId,
  });

  return (
    <div>
      <OrderSummary order={order} />
      {customer && <CustomerInfo customer={customer} />}
      {address && <Address address={address} />}
    </div>
  );
}
```

---

## Parallel Queries

### Multiple useQuery Hooks

```typescript
function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  // All three queries run in parallel!

  return (
    <div>
      <UserProfile user={user} />
      <StatsGrid stats={stats} />
      <NotificationsList notifications={notifications} />
    </div>
  );
}
```

### useQueries for Dynamic Lists

```typescript
function UserProfiles({ userIds }: { userIds: string[] }) {
  const userQueries = useQueries({
    queries: userIds.map((id) => ({
      queryKey: ["users", id],
      queryFn: () => getUser({ userId: id }),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = userQueries.some((query) => query.isLoading);
  const hasError = userQueries.some((query) => query.isError);

  if (isLoading) return <div>Loading users...</div>;
  if (hasError) return <div>Error loading some users</div>;

  return (
    <div>
      {userQueries.map((query, index) => (
        <UserCard key={userIds[index]} user={query.data} />
      ))}
    </div>
  );
}
```

---

## Pagination

### Offset-Based Pagination

```typescript
function ProductsList() {
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, isLoading, isPreviousData } = useQuery({
    queryKey: ["products", { page, perPage }],
    queryFn: () => getProducts({ page, perPage }),
    keepPreviousData: true, // Show old data while fetching new
  });

  return (
    <div>
      {isLoading && <LoadingSkeleton />}

      {data && (
        <>
          <ProductGrid products={data.products} />

          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
            disabled={isPreviousData} // Disable during fetch
          />
        </>
      )}
    </div>
  );
}
```

### Cursor-Based Pagination

```typescript
function PostsFeed() {
  const [cursor, setCursor] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["posts", { cursor }],
    queryFn: () => getPosts({ cursor }),
    keepPreviousData: true,
  });

  return (
    <div>
      <PostsList posts={data?.posts} />

      {data?.hasMore && (
        <button onClick={() => setCursor(data.nextCursor)} disabled={isLoading}>
          Load More
        </button>
      )}
    </div>
  );
}
```

---

## Infinite Queries

For infinite scroll and "load more" patterns.

### Basic Infinite Query

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";

function InfinitePostsList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["posts"],
      queryFn: ({ pageParam = 0 }) => getPostsPage({ page: pageParam }),
      getNextPageParam: (lastPage, allPages) => {
        // Return next page number or undefined if no more pages
        return lastPage.hasMore ? allPages.length : undefined;
      },
      initialPageParam: 0,
    });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div>
      {data.pages.map((page, pageIndex) => (
        <div key={pageIndex}>
          {page.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ))}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
```

### Infinite Scroll with Intersection Observer

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

function InfiniteScrollPosts() {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["posts"],
      queryFn: ({ pageParam = 0 }) => getPostsPage({ page: pageParam }),
      getNextPageParam: (lastPage, pages) => {
        return lastPage.hasMore ? pages.length : undefined;
      },
      initialPageParam: 0,
    });

  // Fetch next page when sentinel comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ))}

      {/* Sentinel element */}
      {hasNextPage && (
        <div ref={ref} className="py-4">
          {isFetchingNextPage ? <Spinner /> : "Load more..."}
        </div>
      )}
    </div>
  );
}
```

---

## Query Invalidation

Tell TanStack Query that data is stale and should be refetched.

### Manual Invalidation

```typescript
import { useQueryClient } from "@tanstack/react-query";

function CreateUserButton() {
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    await createUser({ name: "John" });

    // Invalidate users list - triggers refetch
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  return <button onClick={handleCreate}>Create User</button>;
}
```

### Invalidate After Mutation

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreatePostForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate({ title: "New Post" });
      }}
    >
      {/* form fields */}
    </form>
  );
}
```

### Selective Invalidation

```typescript
// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: userKeys.all });

// Invalidate specific user
queryClient.invalidateQueries({ queryKey: userKeys.detail("123") });

// Invalidate with predicate
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey[0] === "users" && query.state.data?.role === "admin",
});
```

---

## Prefetching

Load data before it's needed for a better user experience.

### Prefetch in Route Loader

```typescript
// src/routes/users/$userId.tsx
import { queryClient } from "@/lib/query-client";
import { userKeys } from "@/lib/queries/users";

export const Route = createFileRoute("/users/$userId")({
  loader: async ({ params }) => {
    // Prefetch user data
    await queryClient.prefetchQuery({
      queryKey: userKeys.detail(params.userId),
      queryFn: () => getUser({ userId: params.userId }),
    });
  },
  component: UserProfile,
});

function UserProfile() {
  const { userId } = Route.useParams();

  // Data already in cache from loader!
  const { data: user } = useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUser({ userId }),
  });

  return <div>{user.name}</div>;
}
```

### Prefetch on Hover

```typescript
import { useQueryClient } from "@tanstack/react-query";

function UserLink({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const prefetchUser = () => {
    queryClient.prefetchQuery({
      queryKey: userKeys.detail(userId),
      queryFn: () => getUser({ userId }),
      staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
    });
  };

  return (
    <Link
      to="/users/$userId"
      params={{ userId }}
      onMouseEnter={prefetchUser} // Prefetch on hover
    >
      User Profile
    </Link>
  );
}
```

---

## Best Practices

### 1. Use Query Key Factories

```typescript
// ✅ Good: Centralized query keys
const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// ❌ Bad: Ad-hoc query keys
queryKey: ["users"];
queryKey: ["user", id];
queryKey: ["userDetail", id];
```

### 2. Set Appropriate Stale Times

```typescript
// ✅ Good: Tailored to data volatility
useQuery({
  queryKey: ["app-config"],
  queryFn: getConfig,
  staleTime: Infinity, // Static data
});

useQuery({
  queryKey: ["user-preferences"],
  queryFn: getPreferences,
  staleTime: 10 * 60 * 1000, // 10 minutes
});

useQuery({
  queryKey: ["live-scores"],
  queryFn: getScores,
  staleTime: 5 * 1000, // 5 seconds
  refetchInterval: 5 * 1000,
});
```

### 3. Handle Loading States Properly

```typescript
// ✅ Good: Differentiate initial load vs background refetch
function UsersList() {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  if (isLoading) {
    // Initial load - show skeleton
    return <LoadingSkeleton />;
  }

  return (
    <div className="relative">
      {isFetching && (
        // Background refetch - show subtle indicator
        <div className="absolute top-0 right-0">
          <Spinner size="sm" />
        </div>
      )}
      <UserList users={data} />
    </div>
  );
}
```

### 4. Use Conditional Queries

```typescript
// ✅ Good: Only fetch when ready
function UserPosts({ userId }: { userId?: string }) {
  const { data: posts } = useQuery({
    queryKey: ["users", userId, "posts"],
    queryFn: () => getUserPosts({ userId: userId! }),
    enabled: !!userId, // Don't fetch if no userId
  });
}
```

---

## Next Steps

You've mastered queries! Now let's learn about mutations and optimistic updates.

**→ Continue to** [Module 4.3: Mutations & Optimistic Updates](./03-mutations.md)

---

## Summary

In this lesson, you learned:

- ✅ Using `useQuery` for data fetching
- ✅ Understanding query states and status
- ✅ Creating effective query keys
- ✅ Implementing dependent queries
- ✅ Fetching data in parallel
- ✅ Pagination strategies
- ✅ Infinite scroll with `useInfiniteQuery`
- ✅ Query invalidation patterns
- ✅ Prefetching for better UX

**Up Next**: Master mutations with optimistic updates!
