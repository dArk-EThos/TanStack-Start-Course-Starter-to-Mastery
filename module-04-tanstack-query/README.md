# Module 4: Data Fetching with TanStack Query

Supercharge your data fetching with powerful caching, synchronization, and state management using TanStack Query.

## 🎯 Learning Objectives

By the end of this module, you will:

- ✅ Integrate TanStack Query with TanStack Start
- ✅ Implement efficient data fetching patterns
- ✅ Master caching and invalidation strategies
- ✅ Build optimistic UI updates
- ✅ Handle loading and error states elegantly
- ✅ Implement infinite scroll and pagination
- ✅ Optimize performance with prefetching

## 📚 Module Overview

TanStack Query (formerly React Query) is the perfect complement to TanStack Start's server functions. While server functions handle the server-side logic, TanStack Query manages client-side state, caching, and synchronization.

### Why TanStack Query?

**Without TanStack Query:**

```typescript
// ❌ Manual state management
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  getUsers()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);

// Refetch on interval?
// Cache management?
// Optimistic updates?
// All manual! 😰
```

**With TanStack Query:**

```typescript
// ✅ Automatic state management
const { data, isLoading, error } = useQuery({
  queryKey: ["users"],
  queryFn: getUsers,
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true,
});

// Caching, refetching, error handling - all automatic! ✨
```

## 📖 Lessons

### [4.1 TanStack Query Setup](./01-setup.md)

**Topics:** Installation, QueryClient configuration, provider setup, devtools

### [4.2 Queries](./02-queries.md)

**Topics:** useQuery hook, query keys, query functions, dependent queries, parallel queries

### [4.3 Mutations](./03-mutations.md)

**Topics:** useMutation hook, optimistic updates, cache invalidation, mutation callbacks

### [4.4 Advanced Patterns](./04-advanced-patterns.md)

**Topics:** Infinite queries, pagination, prefetching, suspense integration

## 🔑 Key Concepts

### Query Keys

```typescript
// Query keys identify cached data
useQuery({
  queryKey: ["users"], // All users
  queryKey: ["users", userId], // Specific user
  queryKey: ["posts", { status: "published" }], // With params
});
```

### Mutations with Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // Optimistically update
    await queryClient.cancelQueries({ queryKey: ["todos"] });
    const previous = queryClient.getQueryData(["todos"]);
    queryClient.setQueryData(["todos"], (old) => [...old, newTodo]);
    return { previous };
  },
  onError: (err, newTodo, context) => {
    // Rollback on error
    queryClient.setQueryData(["todos"], context.previous);
  },
});
```

### Automatic Refetching

```typescript
useQuery({
  queryKey: ["posts"],
  queryFn: getPosts,
  staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
  refetchInterval: 30 * 1000, // Refetch every 30s
  refetchOnWindowFocus: true, // Refetch on focus
  refetchOnReconnect: true, // Refetch on reconnect
});
```

## 🛠️ Exercises

### Exercise 1: Social Feed with Real-Time Updates

Build a social media feed with automatic updates and optimistic UI.

### Exercise 2: Infinite Scroll Product List

Implement infinite scrolling with TanStack Query's infinite queries.

### Exercise 3: Dashboard with Multiple Data Sources

Create a dashboard fetching data from multiple endpoints efficiently.

## 📚 Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Integration Guide](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)
- [Best Practices](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)

**→ Next:** [Module 5: Forms & Validation](../module-05-forms/)

---

**Estimated Time:** 6-8 hours
