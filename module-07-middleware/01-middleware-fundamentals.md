# Module 7.1: Middleware Fundamentals

## Table of Contents

1. [Introduction](#introduction)
2. [What is Middleware?](#what-is-middleware)
3. [Request Middleware](#request-middleware)
4. [Server Function Middleware](#server-function-middleware)
5. [Context Management](#context-management)
6. [Middleware Composition](#middleware-composition)
7. [Common Patterns](#common-patterns)
8. [Best Practices](#best-practices)
9. [Next Steps](#next-steps)

---

## Introduction

Middleware enables you to intercept and modify requests, responses, and server function execution. It's essential for cross-cutting concerns like authentication, logging, and error handling.

> [!IMPORTANT]
> Middleware runs on every request. Keep it fast and efficient!

---

## What is Middleware?

Middleware is code that runs between the initial request and final response:

```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
```

**Use cases:**

- Authentication/Authorization
- Logging and monitoring
- CORS handling
- Request validation
- Error handling
- Performance tracking

---

## Request Middleware

### Basic Request Middleware

```typescript
// src/middleware/logging.ts
import { createMiddleware } from "@tanstack/start";

export const loggingMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const start = Date.now();
    const method = request.method;
    const url = new URL(request.url);

    console.log(`→ ${method} ${url.pathname}`);

    const response = await next();

    const duration = Date.now() - start;
    console.log(
      `← ${method} ${url.pathname} ${response.status} (${duration}ms)`
    );

    return response;
  }
);
```

### Auth Middleware

```typescript
// src/middleware/auth.ts
import { createMiddleware } from "@tanstack/start";
import { getSessionFromCookie } from "@/lib/auth/session";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const sessionId = getSessionFromCookie(request);

    if (!sessionId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const session = await getSession(sessionId);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Pass user to next middleware/handler
    return next({
      context: { user, session },
    });
  }
);
```

### CORS Middleware

```typescript
// src/middleware/cors.ts
export const corsMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const response = await next();

    // Add CORS headers to response
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE"
    );

    return response;
  }
);
```

---

## Server Function Middleware

Middleware specifically for server functions.

### Validation Middleware

```typescript
// src/middleware/validate.ts
import { z } from "zod";

export function createValidationMiddleware<T extends z.ZodType>(schema: T) {
  return createServerFn().middleware(async ({ next, data }) => {
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }

    return next({ data: result.data });
  });
}

// Usage
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

const validateUser = createValidationMiddleware(userSchema);

export const createUser = validateUser.handler(async ({ data }) => {
  // data is validated and typed!
  return await db.user.create({ data });
});
```

### Rate Limiting Middleware

```typescript
// src/middleware/rate-limit.ts
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export const rateLimitMiddleware = createServerFn().middleware(
  async ({ next, request }) => {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    let limit = rateLimitMap.get(ip);

    if (!limit || now > limit.resetAt) {
      limit = {
        count: 0,
        resetAt: now + 60 * 1000, // 1 minute
      };
      rateLimitMap.set(ip, limit);
    }

    limit.count++;

    if (limit.count > 100) {
      // 100 requests per minute
      throw new Error("Rate limit exceeded");
    }

    return next();
  }
);

export const createPost = rateLimitMiddleware.handler(async ({ data }) => {
  return await db.post.create({ data });
});
```

### Timing Middleware

```typescript
// src/middleware/timing.ts
export const timingMiddleware = createServerFn().middleware(
  async ({ next }) => {
    const start = performance.now();

    const result = await next();

    const duration = performance.now() - start;

    if (duration > 1000) {
      console.warn(`Slow operation: ${duration.toFixed(2)}ms`);
    }

    return result;
  }
);
```

---

## Context Management

### Providing Context

```typescript
// src/middleware/context.ts
export const contextMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const sessionId = getSessionFromCookie(request);
    const session = sessionId ? await getSession(sessionId) : null;
    const user = session ? await getUser(session.userId) : null;

    return next({
      context: {
        user,
        session,
        requestId: crypto.randomUUID(),
        timestamp: new Date(),
      },
    });
  }
);
```

### Using Context in Routes

```typescript
// src/routes/dashboard.tsx
export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/login" });
    }

    return { user: context.user };
  },
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();

  return <h1>Welcome, {user.name}!</h1>;
}
```

### Type-Safe Context

```typescript
// src/lib/context.ts
export interface AppContext {
  user: User | null;
  session: Session | null;
  requestId: string;
  timestamp: Date;
}

declare module "@tanstack/react-router" {
  interface Register {
    routerContext: AppContext;
  }
}
```

---

## Middleware Composition

### Chaining Middleware

```typescript
// src/lib/middleware/chain.ts
export const apiMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    // Step 1: Logging
    console.log(`API: ${request.method} ${request.url}`);

    // Step 2: CORS
    const response = await corsMiddleware.server({ next, request });

    // Step 3: Auth
    return await authMiddleware.server({
      next: () => Promise.resolve(response),
      request,
    });
  }
);
```

### Conditional Middleware

```typescript
// src/middleware/conditional.ts
export const conditionalAuth = createMiddleware().server(
  async ({ next, request }) => {
    const url = new URL(request.url);

    // Skip auth for public routes
    const publicRoutes = ["/login", "/register", "/"];
    if (publicRoutes.includes(url.pathname)) {
      return next();
    }

    // Require auth for other routes
    return authMiddleware.server({ next, request });
  }
);
```

---

## Common Patterns

### Pattern 1: Request/Response Modification

```typescript
export const requestModifier = createMiddleware().server(
  async ({ next, request }) => {
    // Modify request
    const modifiedRequest = new Request(request.url, {
      ...request,
      headers: new Headers(request.headers),
    });
    modifiedRequest.headers.set("X-Custom-Header", "value");

    const response = await next();

    // Modify response
    response.headers.set("X-Response-Time", Date.now().toString());

    return response;
  }
);
```

### Pattern 2: Error Boundary

```typescript
export const errorHandler = createMiddleware().server(
  async ({ next, request }) => {
    try {
      return await next();
    } catch (error) {
      console.error("Request error:", error);

      // Log to monitoring service
      Sentry.captureException(error);

      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
);
```

### Pattern 3: Request ID Tracking

```typescript
export const requestIdMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const requestId =
      request.headers.get("X-Request-ID") || crypto.randomUUID();

    console.log(`[${requestId}] ${request.method} ${request.url}`);

    const response = await next({
      context: { requestId },
    });

    response.headers.set("X-Request-ID", requestId);

    return response;
  }
);
```

### Pattern 4: Performance Monitoring

```typescript
export const performanceMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const start = performance.now();
    const url = new URL(request.url);

    const response = await next();

    const duration = performance.now() - start;

    // Send to analytics
    analytics.track("request", {
      path: url.pathname,
      method: request.method,
      status: response.status,
      duration,
    });

    return response;
  }
);
```

---

## Best Practices

### 1. Keep Middleware Fast

```typescript
// ✅ Good: Quick checks
export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const token = request.headers.get("Authorization");
    if (!token) return new Response("Unauthorized", { status: 401 });

    return next({ context: { token } });
  }
);

// ❌ Bad: Slow operations
export const slowMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    // Don't do heavy computation in middleware!
    await heavyDatabaseQuery();
    await externalAPICall();

    return next();
  }
);
```

### 2. Order Matters

```typescript
// ✅ Good: Logging → CORS → Auth → Handler
app.use(loggingMiddleware);
app.use(corsMiddleware);
app.use(authMiddleware);

// ❌ Bad: Auth before CORS (blocks OPTIONS requests)
app.use(authMiddleware);
app.use(corsMiddleware);
```

### 3. Always Call next()

```typescript
// ✅ Good: Calls next or returns response
export const middleware = createMiddleware().server(async ({ next }) => {
  if (shouldContinue) {
    return next();
  }
  return new Response("Blocked", { status: 403 });
});

// ❌ Bad: Doesn't call next or return
export const badMiddleware = createMiddleware().server(async ({ next }) => {
  console.log("Hello");
  // Missing return!
});
```

### 4. Use Typed Context

```typescript
// ✅ Good: Typed context
interface MyContext {
  user: User | null;
  requestId: string;
}

export const middleware = createMiddleware<MyContext>().server(
  async ({ next }) => {
    return next({
      context: {
        user: null,
        requestId: crypto.randomUUID(),
      },
    });
  }
);
```

---

## Next Steps

**→ Continue to** [Module 7.2: Advanced Middleware Patterns](./02-advanced-middleware.md)

---

## Summary

- ✅ Request middleware for HTTP handling
- ✅ Server function middleware
- ✅ Context management
- ✅ Middleware composition
- ✅ Common patterns and best practices

**Up Next**: Advanced middleware patterns and real-world examples!
