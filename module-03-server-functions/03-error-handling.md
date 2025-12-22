# Module 3.3: Error Handling & Redirects

## Table of Contents

1. [Introduction](#introduction)
2. [Error Handling Basics](#error-handling-basics)
3. [Custom Error Types](#custom-error-types)
4. [Validation Errors](#validation-errors)
5. [Redirects](#redirects)
6. [Not Found Errors](#not-found-errors)
7. [Error Boundaries](#error-boundaries)
8. [Production Error Handling](#production-error-handling)
9. [Best Practices](#best-practices)
10. [Next Steps](#next-steps)

---

## Introduction

Proper error handling makes your application robust and user-friendly. TanStack Start provides powerful tools for handling errors and controlling navigation flow.

> [!IMPORTANT]
> Always handle errors gracefully. Never expose sensitive error details to users in production!

---

## Error Handling Basics

### Throwing Errors

```typescript
import { createServerFn } from "@tanstack/start";

export const getUser = createServerFn().handler(async () => {
  const user = await db.user.findFirst();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
});
```

### Catching Errors in Components

```typescript
function UserProfile() {
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser().then(setUser).catch(setError);
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return <div>{user.name}</div>;
}
```

### Try-Catch in Server Functions

```typescript
export const createUser = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    try {
      const user = await db.user.create({ data });
      return { success: true, user };
    } catch (error) {
      console.error("Failed to create user:", error);

      // Return structured error
      return {
        success: false,
        error: "Failed to create user",
      };
    }
  }
);
```

---

## Custom Error Types

### Creating Custom Errors

```typescript
// src/lib/errors.ts
export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends Error {
  constructor(message: string, public fields: Record<string, string[]>) {
    super(message);
    this.name = "ValidationError";
  }
}
```

### Using Custom Errors

```typescript
import { NotFoundError, UnauthorizedError } from "@/lib/errors";

export const getPost = createServerFn().handler(
  async ({ postId }: { postId: string }) => {
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError("Post", postId);
    }

    // Check permissions
    if (post.authorId !== currentUserId && !post.published) {
      throw new UnauthorizedError("You cannot view this post");
    }

    return post;
  }
);
```

### Handling Different Error Types

```typescript
function PostPage({ postId }: { postId: string }) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getPost({ postId }).catch((err) => {
      setError(err);

      // Log to error tracking
      if (err instanceof UnauthorizedError) {
        logSecurityEvent("unauthorized_access", { postId });
      }
    });
  }, [postId]);

  if (error instanceof NotFoundError) {
    return <NotFoundPage />;
  }

  if (error instanceof UnauthorizedError) {
    return <UnauthorizedPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  // ...rest of component
}
```

---

## Validation Errors

### Handling Zod Errors

```typescript
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

export const createUser = createServerFn({ method: "POST" })
  .inputValidator(userSchema)
  .handler(async ({ data }) => {
    // Validation happens automatically
    // If validation fails, Zod error is thrown
    return await db.user.create({ data });
  });
```

### Custom Validation Error Handling

```typescript
export const createUser = createServerFn({ method: "POST" }).handler(
  async ({ rawData }) => {
    // Manual validation
    const result = userSchema.safeParse(rawData);

    if (!result.success) {
      // Format Zod errors
      const errors = result.error.errors.reduce((acc, err) => {
        const field = err.path.join(".");
        acc[field] = err.message;
        return acc;
      }, {} as Record<string, string>);

      throw new ValidationError("Validation failed", errors);
    }

    return await db.user.create({ data: result.data });
  }
);
```

### Client-Side Error Display

```typescript
function CreateUserForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (data: unknown) => {
    try {
      await createUser({ data });
      setErrors({});
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(error.fields);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" />
      {errors.email && <span className="error">{errors.email}</span>}

      <input name="age" type="number" />
      {errors.age && <span className="error">{errors.age}</span>}

      <button type="submit">Create</button>
    </form>
  );
}
```

---

## Redirects

### Basic Redirects

```typescript
import { redirect } from "@tanstack/react-router";

export const deletePost = createServerFn({ method: "POST" }).handler(
  async ({ postId }: { postId: string }) => {
    await db.post.delete({ where: { id: postId } });

    // Redirect to posts list
    throw redirect({ to: "/posts" });
  }
);
```

### Conditional Redirects

```typescript
export const login = createServerFn({ method: "POST" }).handler(
  async ({ email, password }) => {
    const user = await authenticateUser(email, password);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Set session
    await createSession(user.id);

    // Redirect based on user role
    if (user.role === "admin") {
      throw redirect({ to: "/admin/dashboard" });
    }

    throw redirect({ to: "/dashboard" });
  }
);
```

### Redirect with Search Params

```typescript
export const logout = createServerFn({ method: "POST" }).handler(async () => {
  await destroySession();

  throw redirect({
    to: "/login",
    search: {
      message: "You have been logged out",
    },
  });
});
```

### Redirect with Status Code

```typescript
export const permanentRedirect = createServerFn().handler(async () => {
  throw redirect({
    to: "/new-url",
    code: 301, // Permanent redirect
  });
});

export const temporaryRedirect = createServerFn().handler(async () => {
  throw redirect({
    to: "/temp-url",
    code: 302, // Temporary redirect (default)
  });
});
```

---

## Not Found Errors

### Throwing Not Found

```typescript
import { notFound } from "@tanstack/react-router";

export const getProduct = createServerFn().handler(
  async ({ productId }: { productId: string }) => {
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw notFound();
    }

    return product;
  }
);
```

### Route-Level Not Found Handler

```typescript
// src/routes/products/$productId.tsx
export const Route = createFileRoute("/products/$productId")({
  loader: async ({ params }) => {
    return await getProduct({ productId: params.productId });
  },

  // Custom not found component
  notFoundComponent: () => (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold">Product Not Found</h1>
      <p className="mt-4">The product you're looking for doesn't exist.</p>
      <Link to="/products" className="btn mt-4">
        Browse Products
      </Link>
    </div>
  ),

  component: ProductPage,
});
```

---

## Error Boundaries

### Route-Level Error Component

```typescript
// src/routes/dashboard.tsx
export const Route = createFileRoute("/dashboard")({
  loader: async () => {
    return await getDashboardData();
  },

  errorComponent: ({ error }) => (
    <div className="error-page">
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  ),

  component: Dashboard,
});
```

### Custom Error Component

```typescript
function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error tracking service
    logError(error);
  }, [error]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-red-600">
        Error Loading Dashboard
      </h1>

      {error instanceof UnauthorizedError ? (
        <div className="mt-4">
          <p>You don't have permission to view this page.</p>
          <Link to="/login" className="btn mt-4">
            Log In
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          <p>An unexpected error occurred.</p>
          <details className="mt-2">
            <summary>Error Details</summary>
            <pre className="mt-2 text-sm">{error.stack}</pre>
          </details>
          <button onClick={reset} className="btn mt-4">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/dashboard")({
  errorComponent: DashboardErrorBoundary,
  component: Dashboard,
});
```

---

## Production Error Handling

### Environment-Based Error Messages

```typescript
const isDevelopment = process.env.NODE_ENV === "development";

export const getUser = createServerFn().handler(async () => {
  try {
    return await db.user.findFirst();
  } catch (error) {
    console.error("Database error:", error);

    // Different messages for dev vs prod
    if (isDevelopment) {
      throw new Error(`Database error: ${error.message}`);
    } else {
      throw new Error("An error occurred. Please try again later.");
    }
  }
});
```

### Error Tracking Integration

```typescript
import * as Sentry from "@sentry/node";

export const createOrder = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    try {
      return await db.order.create({ data });
    } catch (error) {
      // Log to Sentry
      Sentry.captureException(error, {
        tags: {
          function: "createOrder",
        },
        extra: {
          orderData: data,
        },
      });

      throw new Error("Failed to create order");
    }
  }
);
```

### Structured Error Responses

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface SuccessResponse<T> {
  success: true;
  data: T;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export const createUser = createServerFn({ method: "POST" }).handler(
  async ({ data }): Promise<ApiResponse<User>> => {
    try {
      const user = await db.user.create({ data });
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "USER_CREATE_FAILED",
          message: "Failed to create user",
          details: isDevelopment ? error : undefined,
        },
      };
    }
  }
);
```

---

## Best Practices

### 1. Use Specific Error Types

```typescript
// ✅ Good: Specific errors
throw new NotFoundError("User", userId);
throw new UnauthorizedError("Insufficient permissions");
throw new ValidationError("Invalid input", errors);

// ❌ Bad: Generic errors
throw new Error("Error");
throw new Error("Something went wrong");
```

### 2. Log Errors Properly

```typescript
export const processPayment = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    try {
      return await stripe.charges.create(data);
    } catch (error) {
      // ✅ Good: Structured logging
      console.error("Payment processing failed:", {
        error: error.message,
        customerId: data.customerId,
        amount: data.amount,
        timestamp: new Date().toISOString(),
      });

      // Log to monitoring service
      await logError("payment_failed", {
        error,
        context: data,
      });

      throw error;
    }
  }
);
```

### 3. Don't Expose Sensitive Data

```typescript
export const login = createServerFn({ method: "POST" }).handler(
  async ({ email, password }) => {
    const user = await db.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      // ✅ Good: Generic message
      throw new Error("Invalid email or password");

      // ❌ Bad: Reveals which field is wrong
      // throw new Error('Email not found')
      // throw new Error('Incorrect password')
    }

    // ✅ Good: Don't return password hash
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    // ❌ Bad: Exposes sensitive data
    // return user
  }
);
```

### 4. Provide Helpful Error Messages

```typescript
// ✅ Good: Actionable error messages
throw new Error(
  "Email already exists. Please use a different email or log in."
);
throw new Error("Your session has expired. Please log in again.");
throw new Error("File size exceeds 10MB limit. Please upload a smaller file.");

// ❌ Bad: Vague messages
throw new Error("Invalid");
throw new Error("Error 500");
throw new Error("Failed");
```

### 5. Handle Async Errors

```typescript
// ✅ Good: Proper async error handling
export const processBatch = createServerFn({ method: "POST" }).handler(
  async ({ items }) => {
    const results = await Promise.allSettled(
      items.map((item) => processItem(item))
    );

    const errors = results
      .filter((r) => r.status === "rejected")
      .map((r) => r.reason);

    if (errors.length > 0) {
      console.error("Batch processing errors:", errors);
      // Continue or throw based on requirements
    }

    return {
      succeeded: results.filter((r) => r.status === "fulfilled").length,
      failed: errors.length,
    };
  }
);
```

---

## Next Steps

You now understand error handling and redirects! Let's explore form data handling and file uploads.

**→ Continue to** [Module 3.4: Form Data & File Uploads](./04-form-data.md)

---

## Summary

In this lesson, you learned:

- ✅ Basic error throwing and catching
- ✅ Creating custom error types
- ✅ Handling validation errors from Zod
- ✅ Implementing redirects after server actions
- ✅ Throwing not found errors
- ✅ Using error boundaries in routes
- ✅ Production error handling best practices
- ✅ Error tracking and logging

**Up Next**: Handle forms and file uploads with server functions!
