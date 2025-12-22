# Module 6.1: Session-Based Authentication

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication Overview](#authentication-overview)
3. [Session Management](#session-management)
4. [User Registration](#user-registration)
5. [User Login](#user-login)
6. [Protected Routes](#protected-routes)
7. [Password Security](#password-security)
8. [Best Practices](#best-practices)
9. [Next Steps](#next-steps)

---

## Introduction

Authentication is critical for any application with user accounts. This lesson covers session-based auth with TanStack Start.

> [!IMPORTANT]
> Never store passwords in plain text! Always hash with bcrypt or similar.

---

## Authentication Overview

### Auth Flow

```
1. User registers → Hash password → Store in DB
2. User logs in → Verify password → Create session
3. Store session ID in cookie
4. Verify session on protected routes
5. User logs out → Destroy session
```

---

## Session Management

### Session Storage

```typescript
// src/lib/auth/session.ts
interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

// In-memory store (use Redis in production)
const sessions = new Map<string, Session>();

export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const session: Session = {
    id: sessionId,
    userId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };

  sessions.set(sessionId, session);
  return sessionId;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const session = sessions.get(sessionId);

  if (!session) return null;

  // Check if expired
  if (session.expiresAt < new Date()) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  sessions.delete(sessionId);
}
```

### Cookie Helpers

```typescript
// src/lib/auth/cookies.ts
export function setSessionCookie(sessionId: string) {
  return {
    "Set-Cookie": `sessionId=${sessionId}; HttpOnly; Secure; SameSite=Lax; Max-Age=${
      7 * 24 * 60 * 60
    }; Path=/`,
  };
}

export function clearSessionCookie() {
  return {
    "Set-Cookie":
      "sessionId=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/",
  };
}

export function getSessionFromCookie(request: Request): string | null {
  const cookie = request.headers.get("Cookie");
  if (!cookie) return null;

  const match = cookie.match(/sessionId=([^;]+)/);
  return match ? match[1] : null;
}
```

---

## User Registration

### Registration Server Function

```typescript
// src/lib/api/auth.ts
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import bcrypt from "bcrypt";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export const register = createServerFn({ method: "POST" })
  .inputValidator(registerSchema)
  .handler(async ({ data }) => {
    // Check if user exists
    const existing = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });

    // Create session
    const sessionId = await createSession(user.id);

    // Set cookie and redirect
    return new Response(null, {
      status: 302,
      headers: {
        ...setSessionCookie(sessionId),
        Location: "/dashboard",
      },
    });
  });
```

### Registration Form

```typescript
// src/routes/register.tsx
import { useForm } from "@tanstack/react-form";
import { register } from "@/lib/api/auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await register({ data: value });
    },
  });

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1>Create Account</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field name="name">
          {(field) => (
            <div>
              <label>Name</label>
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div>
              <label>Email</label>
              <input
                type="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div>
              <label>Password</label>
              <input
                type="password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        <button type="submit" disabled={form.state.isSubmitting}>
          {form.state.isSubmitting ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
```

---

## User Login

### Login Server Function

```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const login = createServerFn({ method: "POST" })
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    // Find user
    const user = await db.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const valid = await bcrypt.compare(data.password, user.password);

    if (!valid) {
      throw new Error("Invalid email or password");
    }

    // Create session
    const sessionId = await createSession(user.id);

    return new Response(null, {
      status: 302,
      headers: {
        ...setSessionCookie(sessionId),
        Location: "/dashboard",
      },
    });
  });
```

### Logout

```typescript
export const logout = createServerFn({ method: "POST" }).handler(
  async ({ request }) => {
    const sessionId = getSessionFromCookie(request);

    if (sessionId) {
      await deleteSession(sessionId);
    }

    return new Response(null, {
      status: 302,
      headers: {
        ...clearSessionCookie(),
        Location: "/login",
      },
    });
  }
);
```

---

## Protected Routes

### Auth Middleware

```typescript
// src/lib/auth/middleware.ts
import { redirect } from "@tanstack/react-router";

export async function requireAuth(request: Request) {
  const sessionId = getSessionFromCookie(request);

  if (!sessionId) {
    throw redirect({ to: "/login" });
  }

  const session = await getSession(sessionId);

  if (!session) {
    throw redirect({ to: "/login" });
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    await deleteSession(sessionId);
    throw redirect({ to: "/login" });
  }

  return { user, session };
}
```

### Protected Route Example

```typescript
// src/routes/dashboard.tsx
export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context, request }) => {
    const { user } = await requireAuth(request);
    return { user };
  },
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
    </div>
  );
}
```

---

## Password Security

### Hashing with bcrypt

```typescript
import bcrypt from "bcrypt";

// Hash password (on registration)
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password (on login)
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Password Requirements

```typescript
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain number")
  .regex(/[^A-Za-z0-9]/, "Must contain special character");
```

---

## Best Practices

### 1. Use HttpOnly Cookies

```typescript
// ✅ Good: HttpOnly prevents XSS attacks
'Set-Cookie': 'sessionId=...; HttpOnly; Secure'

// ❌ Bad: Accessible to JavaScript
localStorage.setItem('sessionId', sessionId)
```

### 2. Always Hash Passwords

```typescript
// ✅ Good: Hashed with bcrypt
const hashedPassword = await bcrypt.hash(password, 10);

// ❌ Bad: Plain text
const password = "password123";
```

### 3. Generic Error Messages

```typescript
// ✅ Good: Don't reveal if email exists
throw new Error("Invalid email or password");

// ❌ Bad: Reveals information
throw new Error("Email not found");
throw new Error("Incorrect password");
```

---

## Next Steps

**→ Continue to** [Module 6.2: Role-Based Access Control](./02-rbac.md)

---

## Summary

- ✅ Session management with cookies
- ✅ User registration with password hashing
- ✅ Login with bcrypt verification
- ✅ Protected routes with middleware
- ✅ Security best practices

**Up Next**: Role-based access control and OAuth integration!
