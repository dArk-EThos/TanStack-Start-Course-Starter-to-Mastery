# Module 3.1: Server Functions Basics

## Table of Contents

1. [Introduction](#introduction)
2. [What Are Server Functions?](#what-are-server-functions)
3. [Creating Your First Server Function](#creating-your-first-server-function)
4. [HTTP Methods](#http-methods)
5. [Type Safety Across the Stack](#type-safety-across-the-stack)
6. [Where to Call Server Functions](#where-to-call-server-functions)
7. [Server-Only Code](#server-only-code)
8. [Best Practices](#best-practices)
9. [Next Steps](#next-steps)

---

## Introduction

Server functions are one of TanStack Start's most powerful features, enabling **type-safe Remote Procedure Calls (RPCs)** between your client and server code.

> [!IMPORTANT]
> Server functions run **only on the server**, but can be called from **anywhere** in your application - components, loaders, hooks, or other server functions.

---

## What Are Server Functions?

### The Problem They Solve

Traditional approach (REST API):

```typescript
// ❌ Old way: Separate frontend and backend

// Backend (Express, etc.)
app.post("/api/users", async (req, res) => {
  const user = await db.user.create(req.body);
  res.json(user);
});

// Frontend (React)
const response = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email }),
});
const user = await response.json(); // Type unknown!
```

**Problems:**

- ❌ No type safety across network boundary
- ❌ Manual serialization/deserialization
- ❌ Separate route definitions
- ❌ Error handling boilerplate

### TanStack Start Solution

```typescript
// ✅ New way: Type-safe server functions

import { createServer Fn } from '@tanstack/start'

export const createUser = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    // This code runs ONLY on the server
    const user = await db.user.create(data)
    return user // Type automatically inferred!
  })

// Call it anywhere in your app
const user = await createUser({ data: { name, email } })
// user is fully typed! ✨
```

**Benefits:**

- ✅ Full type safety from server to client
- ✅ Automatic serialization
- ✅ Single file, colocated logic
- ✅ Clean, simple API

---

## Creating Your First Server Function

### Basic Server Function

```typescript
// src/lib/api/hello.ts
import { createServerFn } from "@tanstack/start";

export const sayHello = createServerFn().handler(async () => {
  // This runs on the server
  console.log("Server: Processing request");

  return {
    message: "Hello from the server!",
    timestamp: new Date().toISOString(),
  };
});
```

### Using in a Component

```typescript
// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { sayHello } from "@/lib/api/hello";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    const result = await sayHello();
    setMessage(result.message); // Fully typed!
  };

  return (
    <div>
      <button onClick={handleClick}>Say Hello</button>
      {message && <p>{message}</p>}
    </div>
  );
}
```

### Using in a Loader

```typescript
// src/routes/dashboard.tsx
import { createFileRoute } from "@tanstack/react-router";
import { sayHello } from "@/lib/api/hello";

export const Route = createFileRoute("/dashboard")({
  loader: async () => {
    // Call server function in loader
    const greeting = await sayHello();
    return { greeting };
  },
  component: Dashboard,
});

function Dashboard() {
  const { greeting } = Route.useLoaderData();

  return <h1>{greeting.message}</h1>;
}
```

---

## HTTP Methods

Server functions can use different HTTP methods:

### GET (Default)

Safe, cacheable operations (reading data):

```typescript
import { createServerFn } from "@tanstack/start";

// GET is the default
export const getUser = createServerFn().handler(async () => {
  const user = await db.user.findFirst();
  return user;
});

// Or explicitly specify
export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
  const users = await db.user.findMany();
  return users;
});
```

### POST

Non-idempotent operations (creating, updating):

```typescript
export const createPost = createServerFn({ method: "POST" }).handler(
  async () => {
    const post = await db.post.create({
      data: {
        title: "New Post",
        content: "Hello world",
      },
    });
    return post;
  }
);
```

### When to Use Which Method

| Method   | Use Case               | Cacheable | Safe   |
| -------- | ---------------------- | --------- | ------ |
| **GET**  | Fetching data          | ✅ Yes    | ✅ Yes |
| **POST** | Creating/updating data | ❌ No     | ❌ No  |

```typescript
// ✅ Good: GET for reading
export const getProducts = createServerFn({ method: "GET" }).handler(async () =>
  db.product.findMany()
);

// ✅ Good: POST for writing
export const createProduct = createServerFn({ method: "POST" }).handler(
  async () => db.product.create({ data })
);

// ❌ Bad: POST for reading
export const getProducts = createServerFn({ method: "POST" }).handler(
  async () => db.product.findMany()
);
```

---

## Type Safety Across the Stack

### Automatic Type Inference

The return type is automatically inferred:

```typescript
export const getUser = createServerFn().handler(async () => {
  const user = await db.user.findUnique({
    where: { id: "1" },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  return user;
});

// In your component:
const user = await getUser();
// user type: { id: string; name: string; email: string } | null
```

### Explicit Return Types

You can also specify explicit types:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

export const getUser = createServerFn()<User | null>().handler(
  async (): Promise<User | null> => {
    const user = await db.user.findUnique({
      where: { id: "1" },
    });
    return user;
  }
);
```

### Generic Server Functions

```typescript
function createGetterFn<T>(fetcher: () => Promise<T>) {
  return createServerFn()<T>().handler(async () => {
    return await fetcher();
  });
}

// Usage
export const getUser = createGetterFn(() => db.user.findFirst());

export const getPosts = createGetterFn(() => db.post.findMany());
```

---

## Where to Call Server Functions

Server functions can be called from multiple places:

### 1. In Route Loaders

```typescript
// src/routes/users.tsx
import { getUsers } from "@/lib/api/users";

export const Route = createFileRoute("/users")({
  loader: async () => {
    const users = await getUsers();
    return { users };
  },
  component: Users,
});
```

### 2. In Components

```typescript
function CreateUserButton() {
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createUser({ data: { name: "John" } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleCreate} disabled={loading}>
      Create User
    </button>
  );
}
```

### 3. In Custom Hooks

```typescript
function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: CreateUserInput) => {
    setLoading(true);
    setError(null);

    try {
      const user = await createUser({ data });
      return user;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}
```

### 4. In Other Server Functions

```typescript
export const getUserWithPosts = createServerFn().handler(async () => {
  // Call other server functions
  const user = await getUser();
  const posts = await getUserPosts({ userId: user.id });

  return { user, posts };
});
```

---

## Server-Only Code

### Accessing Server-Only Features

Server functions can access anything available on the server:

```typescript
import { createServerFn } from "@tanstack/start";
import { db } from "@/lib/db"; // Database client
import fs from "fs/promises"; // Node.js modules
import { env } from "@/lib/env"; // Environment variables

export const processFile = createServerFn().handler(async () => {
  // ✅ Access file system
  const data = await fs.readFile("/data/users.json", "utf-8");

  // ✅ Access environment variables
  const apiKey = env.SECRET_API_KEY;

  // ✅ Access database
  const users = await db.user.findMany();

  // ✅ Call external APIs
  const response = await fetch("https://api.example.com", {
    headers: { "X-API-Key": apiKey },
  });

  return { users, externalData: await response.json() };
});
```

### Code Splitting

Code inside server functions is **automatically excluded** from client bundles:

```typescript
export const getUserData = createServerFn().handler(async () => {
  // These imports are ONLY in the server bundle
  const bcrypt = await import("bcrypt");
  const stripe = await import("stripe");

  // Heavy server-only logic
  const hash = await bcrypt.hash("password", 10);

  return { hash };
});
```

**Result:** Client bundle stays small! 🎉

---

## Best Practices

### 1. Organize by Feature

```typescript
// src/lib/api/users.ts
export const getUser = createServerFn()...
export const createUser = createServerFn()...
export const updateUser = createServerFn()...
export const deleteUser = createServerFn()...

// src/lib/api/posts.ts
export const getPost = createServerFn()...
export const createPost = createServerFn()...
```

### 2. Use Descriptive Names

```typescript
// ✅ Good: Clear intent
export const getUserById = createServerFn()...
export const createBlogPost = createServerFn()...
export const deleteAccountPermanently = createServerFn()...

// ❌ Bad: Vague names
export const get = createServerFn()...
export const doThing = createServerFn()...
export const handler = createServerFn()...
```

### 3. Handle Errors Properly

```typescript
export const getUser = createServerFn().handler(async () => {
  try {
    const user = await db.user.findUnique({
      where: { id: "1" },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error; // Re-throw for client handling
  }
});
```

### 4. Keep Functions Focused

```typescript
// ✅ Good: Single responsibility
export const getUser = createServerFn()
  .handler(async () => db.user.findFirst())

export const getUserPosts = createServerFn()
  .handler(async () => db.post.findMany())

// ❌ Bad: Doing too much
export const getAllUserData = createServerFn()
  .handler(async () => {
    const user = await db.user.findFirst()
    const posts = await db.post.findMany()
    const comments = await db.comment.findMany()
    const likes = await db.like.findMany()
    // ... 100 more queries
    return { user, posts, comments, likes, ... }
  })
```

### 5. Use Consistent Patterns

```typescript
// Pattern: get* for fetching
export const getUsers = createServerFn({ method: 'GET' })...
export const getUser = createServerFn({ method: 'GET' })...

// Pattern: create* for creating
export const createUser = createServerFn({ method: 'POST' })...
export const createPost = createServerFn({ method: 'POST' })...

// Pattern: update* for updating
export const updateUser = createServerFn({ method: 'POST' })...
export const updatePost = createServerFn({ method: 'POST' })...

// Pattern: delete* for deleting
export const deleteUser = createServerFn({ method: 'POST' })...
export const deletePost = createServerFn({ method: 'POST' })...
```

---

## Common Patterns

### Pattern 1: Data Fetching

```typescript
// src/lib/api/products.ts
export const getProducts = createServerFn({ method: "GET" }).handler(
  async () => {
    const products = await db.product.findMany({
      include: {
        category: true,
        images: true,
      },
    });
    return products;
  }
);

export const getProduct = createServerFn({ method: "GET" }).handler(
  async ({ productId }: { productId: string }) => {
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });
    return product;
  }
);
```

### Pattern 2: CRUD Operations

```typescript
// Create
export const createProduct = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    return await db.product.create({ data });
  }
);

// Read (already shown above)

// Update
export const updateProduct = createServerFn({ method: "POST" }).handler(
  async ({ id, data }) => {
    return await db.product.update({
      where: { id },
      data,
    });
  }
);

// Delete
export const deleteProduct = createServerFn({ method: "POST" }).handler(
  async ({ id }) => {
    return await db.product.delete({
      where: { id },
    });
  }
);
```

### Pattern 3: Aggregations

```typescript
export const getProductStats = createServerFn().handler(async () => {
  const [totalProducts, avgPrice, categories] = await Promise.all([
    db.product.count(),
    db.product.aggregate({
      _avg: { price: true },
    }),
    db.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    }),
  ]);

  return {
    total: totalProducts,
    averagePrice: avgPrice._avg.price,
    categories,
  };
});
```

---

## Debugging Server Functions

### Server-Side Logging

```typescript
export const getUser = createServerFn().handler(async () => {
  console.log("🔍 Fetching user from database");

  const user = await db.user.findFirst();

  console.log("✅ User fetched:", user?.id);

  return user;
});
```

**Output:** Logs appear in your terminal (server), not browser console!

### Error Tracking

```typescript
export const getUser = createServerFn().handler(async () => {
  try {
    return await db.user.findFirst();
  } catch (error) {
    // Log to error tracking service
    console.error("[Server Function Error]", error);

    // In production, use Sentry, LogRocket, etc.
    // sentry.captureException(error)

    throw error;
  }
});
```

---

## Next Steps

Now that you understand server function basics, let's add input validation and type-safe parameters!

**→ Continue to** [Module 3.2: Input Validation with Zod](./02-input-validation.md)

---

## Summary

In this lesson, you learned:

- ✅ What server functions are and why they're powerful
- ✅ Creating basic server functions with `createServerFn()`
- ✅ HTTP methods (GET vs POST)
- ✅ Full type safety from server to client
- ✅ Where to call server functions (loaders, components, hooks)
- ✅ Accessing server-only code and features
- ✅ Best practices for organizing and naming
- ✅ Common patterns for CRUD and data fetching

**Up Next**: Validate inputs with Zod for bulletproof server functions!
