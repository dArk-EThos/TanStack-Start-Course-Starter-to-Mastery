# Lesson 13.2: Authentication Implementation

Complete authentication flows with email verification, password reset, and OAuth integration.

## Email/Password Authentication

```typescript
// Client-side registration
import { authClient } from "@/lib/auth/client";

async function handleRegister(data: RegisterData) {
  const result = await auth.client.signUp.email({
    email: data.email,
    password: data.password,
    name: data.name,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  // Verification email sent automatically
  return result.data;
}

// Login
async function handleLogin(data: LoginData) {
  const result = await authClient.signIn.email({
    email: data.email,
    password: data.password,
  });

  if (!result.data?.user.emailVerified) {
    throw new Error("Please verify your email first");
  }

  return result.data;
}
```

## OAuth Integration

```typescript
// Google Sign-In
async function handleGoogleSignIn() {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard",
  });
}

// GitHub Sign-In
async function handleGitHubSignIn() {
  await authClient.signIn.social({
    provider: "github",
    callbackURL: "/dashboard",
  });
}
```

## Password Reset Flow

```typescript
// Request reset
export const requestPasswordReset = createServerFn({ method: "POST" }).handler(
  async ({ email }) => {
    const resetToken = await auth.generatePasswordResetToken(email);
    const resetUrl = `${env.BETTER_AUTH_URL}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(email, resetUrl);

    return { success: true };
  }
);

// Reset password
export const resetPassword = createServerFn({ method: "POST" }).handler(
  async ({ token, newPassword }) => {
    await auth.resetPassword(token, newPassword);
    return { success: true };
  }
);
```

## Session Management

```typescript
// Get current session
export const getSession = createServerFn().handler(async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  return session;
});

// Logout
export const logout = createServerFn({ method: "POST" }).handler(
  async ({ request }) => {
    await auth.api.signOut({ headers: request.headers });
    throw redirect({ to: "/login" });
  }
);
```

**Next:** [Lesson 13.3: Organization Management](./03-organizations.md)
