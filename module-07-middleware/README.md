# Module 7: Middleware & Context

Master request/response handling and context injection for powerful, composable application logic.

## 🎯 Learning Objectives

- ✅ Understand middleware concepts
- ✅ Create request and server function middleware
- ✅ Manage context across your application
- ✅ Implement global middleware patterns
- ✅ Build composable middleware chains

## 📖 Key Topics

### 7.1 Request Middleware

- Intercepting server requests
- Modifying request/response
- Logging and monitoring
- CORS and headers

### 7.2 Server Function Middleware

- Pre/post processing
- Authorization checks
- Input transformation
- Error handling

### 7.3 Context Management

- Providing context
- Accessing context in routes
- Type-safe context
- Dependency injection patterns

### 7.4 Global Middleware

- Application-wide middleware
- Execution order
- Middleware composition

## 🔑 Key Patterns

### Request Middleware

```typescript
import { createMiddleware } from "@tanstack/start";

const loggingMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    console.log(`${request.method} ${request.url}`);
    const start = Date.now();

    const response = await next();

    console.log(`Completed in ${Date.now() - start}ms`);
    return response;
  }
);
```

### Auth Middleware

```typescript
const authMiddleware = createMiddleware().server(async ({ next, request }) => {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  return next({
    context: { user: session.user },
  });
});
```

### Server Function Middleware

```typescript
const validateUserMiddleware = createServerFn().middleware(
  async ({ next, data }) => {
    const validation = userSchema.safeParse(data);

    if (!validation.success) {
      throw new ValidationError(validation.error);
    }

    return next({ data: validation.data });
  }
);

export const createUser = validateUserMiddleware.handler(async ({ data }) => {
  return await db.user.create({ data });
});
```

## 🛠️ Exercises

1. **Logging Middleware** - Request/response logging
2. **Rate Limiting** - API rate limiting middleware
3. **Multi-Tenant Context** - Tenant-aware middleware

**→ Next:** [Module 8: Advanced Patterns](../module-08-advanced/)

---

**Estimated Time:** 5-7 hours
