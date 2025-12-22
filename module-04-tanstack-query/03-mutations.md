# Module 4.3: Mutations & Optimistic Updates

## Table of Contents

1. [Introduction](#introduction)
2. [useMutation Basics](#usemutation-basics)
3. [Mutation States](#mutation-states)
4. [Cache Invalidation](#cache-invalidation)
5. [Optimistic Updates](#optimistic-updates)
6. [Rollback on Error](#rollback-on-error)
7. [Advanced Patterns](#advanced-patterns)
8. [Best Practices](#best-practices)
9. [Summary](#summary)

---

## Introduction

Mutations handle creating, updating, and deleting data. Combined with TanStack Query's caching, they enable powerful patterns like optimistic updates.

> [!TIP]
> Mutations modify server state, queries read it. Use `useMutation` for POST/PUT/DELETE operations!

---

## useMutation Basics

### Simple Mutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser } from '@/lib/api/users'

function CreateUserForm() {
  const query Client = useQueryClient()

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    mutation.mutate({
      name: formData.get('name'),
      email: formData.get('email'),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create User'}
      </button>
      {mutation.isError && (
        <div className="error">{mutation.error.message}</div>
      )}
      {mutation.isSuccess && (
        <div className="success">User created!</div>
      )}
    </form>
  )
}
```

### Update Mutation

```typescript
function EditUserForm({ user }: { user: User }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (updatedUser) => {
      // Update cache
      queryClient.setQueryData(["users", user.id], updatedUser);
      // Or invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate({
          id: user.id,
          name: e.target.name.value,
        });
      }}
    >
      <input name="name" defaultValue={user.name} />
      <button type="submit">Update</button>
    </form>
  );
}
```

### Delete Mutation

```typescript
function DeleteUserButton({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["users", userId] });
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <button
      onClick={() => {
        if (confirm("Are you sure?")) {
          mutation.mutate({ userId });
        }
      }}
      disabled={mutation.isPending}
    >
      Delete
    </button>
  );
}
```

---

## Mutation States

```typescript
function CreatePostForm() {
  const mutation = useMutation({
    mutationFn: createPost,
  });

  const {
    mutate, // Trigger mutation
    mutateAsync, // Trigger with promise
    reset, // Reset mutation state

    // States
    data, // Response data
    error, // Error object
    isPending, // Currently running
    isIdle, // Not started yet
    isSuccess, // Completed successfully
    isError, // Failed
    status, // 'idle' | 'pending' | 'error' | 'success'

    // Metadata
    submittedAt, // When mutation started
    variables, // The variables passed to mutate()
  } = mutation;

  return (
    <div>
      <button onClick={() => mutate({ title: "New Post" })}>Create Post</button>

      {isPending && <Spinner />}
      {isError && <ErrorMessage error={error} />}
      {isSuccess && <SuccessMessage data={data} />}
    </div>
  );
}
```

---

## Cache Invalidation

### Invalidate and Refetch

```typescript
const mutation = useMutation({
  mutationFn: createTodo,
  onSuccess: () => {
    // Mark as stale and refetch
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});
```

### Update Cache Directly

```typescript
const mutation = useMutation({
  mutationFn: createTodo,
  onSuccess: (newTodo) => {
    // Update cache without refetching
    queryClient.setQueryData(["todos"], (old: Todo[]) => [...old, newTodo]);
  },
});
```

### Both Strategies

```typescript
const mutation = useMutation({
  mutationFn: updateTodo,
  onSuccess: (updatedTodo) => {
    // Update specific todo immediately
    queryClient.setQueryData(["todos", updatedTodo.id], updatedTodo);

    // Refetch list to ensure consistency
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});
```

---

## Optimistic Updates

Update UI immediately, then rollback if the mutation fails.

### Basic Optimistic Update

```typescript
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["todos"] });

    // Snapshot current value
    const previousTodos = queryClient.getQueryData(["todos"]);

    // Optimistically update cache
    queryClient.setQueryData(["todos"], (old: Todo[]) =>
      old.map((todo) =>
        todo.id === newTodo.id ? { ...todo, ...newTodo } : todo
      )
    );

    // Return context with snapshot
    return { previousTodos };
  },
  onError: (err, newTodo, context) => {
    // Rollback on error
    queryClient.setQueryData(["todos"], context.previousTodos);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});
```

### Optimistic Create

```typescript
const createTodoMutation = useMutation({
  mutationFn: createTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ["todos"] });

    const previousTodos = queryClient.getQueryData(["todos"]);

    // Add optimistic todo with temporary ID
    const optimisticTodo = {
      ...newTodo,
      id: `temp-${Date.now()}`,
      createdAt: new Date(),
    };

    queryClient.setQueryData(["todos"], (old: Todo[]) => [
      ...old,
      optimisticTodo,
    ]);

    return { previousTodos, optimisticTodo };
  },
  onSuccess: (serverTodo, variables, context) => {
    // Replace temporary todo with server version
    queryClient.setQueryData(["todos"], (old: Todo[]) =>
      old.map((todo) =>
        todo.id === context.optimisticTodo.id ? serverTodo : todo
      )
    );
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(["todos"], context.previousTodos);
    toast.error("Failed to create todo");
  },
});
```

### Optimistic Delete

```typescript
const deleteTodoMutation = useMutation({
  mutationFn: deleteTodo,
  onMutate: async (todoId) => {
    await queryClient.cancelQueries({ queryKey: ["todos"] });

    const previousTodos = queryClient.getQueryData(["todos"]);

    // Remove from cache immediately
    queryClient.setQueryData(["todos"], (old: Todo[]) =>
      old.filter((todo) => todo.id !== todoId)
    );

    return { previousTodos };
  },
  onError: (err, todoId, context) => {
    // Restore on error
    queryClient.setQueryData(["todos"], context.previousTodos);
    toast.error("Failed to delete todo");
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});
```

---

## Rollback on Error

### Manual Rollback

```typescript
const mutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (updates) => {
    await queryClient.cancelQueries({ queryKey: ["posts", updates.id] });

    const previousPost = queryClient.getQueryData(["posts", updates.id]);

    queryClient.setQueryData(["posts", updates.id], updates);

    return { previousPost };
  },
  onError: (err, updates, context) => {
    // Rollback to previous value
    queryClient.setQueryData(["posts", updates.id], context.previousPost);

    // Show error to user
    toast.error("Update failed. Changes have been reverted.");
  },
});
```

### With Retry

```typescript
const mutation = useMutation({
  mutationFn: saveDraft,
  retry: 3, // Retry 3 times
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  onMutate: async (draft) => {
    // Optimistic update
    await queryClient.cancelQueries({ queryKey: ["draft"] });
    const previousDraft = queryClient.getQueryData(["draft"]);
    queryClient.setQueryData(["draft"], draft);
    return { previousDraft };
  },
  onError: (err, draft, context) => {
    queryClient.setQueryData(["draft"], context.previousDraft);
  },
});
```

---

## Advanced Patterns

### Sequential Mutations

```typescript
const createUserAndPosts = async () => {
  // Create user first
  const user = await createUserMutation.mutateAsync({ name: "John" });

  // Then create posts for that user
  await createPostMutation.mutateAsync({
    userId: user.id,
    title: "First Post",
  });
};
```

### Dependent Mutations

```typescript
function CreateOrderFlow() {
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
  });

  const processPaymentMutation = useMutation({
    mutationFn: processPayment,
    onSuccess: async (payment) => {
      // After payment, update order
      await updateOrderMutation.mutateAsync({
        orderId: payment.orderId,
        status: "paid",
      });
    },
  });

  const handleCheckout = async (orderData) => {
    const order = await createOrderMutation.mutateAsync(orderData);
    await processPaymentMutation.mutateAsync({ orderId: order.id });
  };
}
```

### Parallel Mutations

```typescript
function BulkActions({ todoIds }: { todoIds: string[] }) {
  const queryClient = useQueryClient();

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Delete all in parallel
      await Promise.all(ids.map((id) => deleteTodo({ id })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return (
    <button onClick={() => bulkDeleteMutation.mutate(todoIds)}>
      Delete Selected ({todoIds.length})
    </button>
  );
}
```

---

## Best Practices

### 1. Always Handle Errors

```typescript
// ✅ Good: Comprehensive error handling
const mutation = useMutation({
  mutationFn: createUser,
  onError: (error, variables, context) => {
    console.error("Mutation failed:", error);
    toast.error(`Failed to create user: ${error.message}`);

    // Rollback if optimistic update
    if (context?.previousData) {
      queryClient.setQueryData(["users"], context.previousData);
    }
  },
});
```

### 2. Use Optimistic Updates for Better UX

```typescript
// ✅ Good: Instant feedback
const toggleTodoMutation = useMutation({
  mutationFn: toggleTodo,
  onMutate: async (todoId) => {
    await queryClient.cancelQueries({ queryKey: ["todos"] });
    const previous = queryClient.getQueryData(["todos"]);

    queryClient.setQueryData(["todos"], (old: Todo[]) =>
      old.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    );

    return { previous };
  },
  onError: (err, todoId, context) => {
    queryClient.setQueryData(["todos"], context.previous);
  },
});
```

### 3. Invalidate Related Queries

```typescript
// ✅ Good: Invalidate all affected queries
const deletePostMutation = useMutation({
  mutationFn: deletePost,
  onSuccess: (_, variables) => {
    // Invalidate multiple related queries
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["posts", variables.id] });
    queryClient.invalidateQueries({
      queryKey: ["user", variables.authorId, "posts"],
    });
  },
});
```

### 4. Use mutateAsync for Sequential Operations

```typescript
// ✅ Good: Clear sequential flow
const handleSubmit = async (data) => {
  try {
    const user = await createUserMutation.mutateAsync(data.user);
    await sendWelcomeEmailMutation.mutateAsync({ userId: user.id });
    navigate(`/users/${user.id}`);
  } catch (error) {
    console.error("Flow failed:", error);
  }
};
```

---

## Summary

In this lesson, you learned:

- ✅ Using `useMutation` for data modifications
- ✅ Handling mutation states and errors
- ✅ Cache invalidation strategies
- ✅ Optimistic updates for instant UX
- ✅ Rolling back on errors
- ✅ Sequential and parallel mutations
- ✅ Best practices for mutations

**Module 4 Complete!** You now master TanStack Query for powerful data management.

**→ Next:** [Module 5: Forms & Validation](../../module-05-forms/)
