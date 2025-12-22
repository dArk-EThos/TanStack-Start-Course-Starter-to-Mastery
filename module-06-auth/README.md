# Module 6: Authentication & Authorization

Build secure authentication systems with session management, OAuth, and role-based access control.

## 🎯 Learning Objectives

- ✅ Implement session-based authentication
- ✅ Build secure login/signup flows
- ✅ Protect routes with middleware
- ✅ Implement role-based access control (RBAC)
- ✅ Integrate OAuth providers
- ✅ Handle password security properly

## 📖 Key Topics

### 6.1 Session Management

- Creating and validating sessions
- Cookie-based sessions
- Session storage strategies
- Session expiration and refresh

### 6.2 Authentication Flows

- User registration with email verification
- Login with password hashing (bcrypt)
- Password reset flow
- Multi-factor authentication (2FA)

### 6.3 Route Protection

- Using `beforeLoad` for auth checks
- Redirect patterns
- Loading states during auth
- Forbidden/Unauthorized pages

### 6.4 Role-Based Access Control

- User roles and permissions
- Protecting server functions
- UI conditional rendering
- Admin panels

### 6.5 OAuth Integration

- OAuth 2.0 fundamentals
- Google Sign-In
- GitHub authentication
- Social login patterns

### 6.6 Security Best Practices

- Password hashing with bcrypt
- CSRF protection
- Secure headers
- Rate limiting
- Input sanitization

## 🔑 Key Patterns

### Protected Route

```typescript
// src/routes/dashboard/_layout.tsx
export const Route = createFileRoute("/dashboard/_layout")({
  beforeLoad: async ({ context }) => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    return { user: session.user };
  },
});
```

### Protected Server Function

```typescript
export const deletePost = createServerFn({ method: "POST" }).handler(
  async ({ postId }) => {
    const session = await requireAuth();
    const post = await db.post.findUnique({ where: { id: postId } });

    if (post.authorId !== session.userId) {
      throw new UnauthorizedError();
    }

    await db.post.delete({ where: { id: postId } });
  }
);
```

### Role-Based Access

```typescript
export const adminAction = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    const session = await requireAuth();

    if (session.user.role !== "admin") {
      throw new ForbiddenError("Admin access required");
    }

    // Admin-only logic
  }
);
```

## 🛠️ Exercises

1. **Complete Auth System** - Registration, login, logout, password reset
2. **Multi-Tenant SaaS** - Team-based access control
3. **OAuth Integration** - Social login with Google/GitHub

## 📚 Resources

- [OWASP Auth Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OAuth 2.0 Simplified](https://aaronparecki.com/oauth-2-simplified/)

**→ Next:** [Module 7: Middleware & Context](../module-07-middleware/)

---

**Estimated Time:** 7-9 hours
