# Lesson 14.2: Kinde Authentication Flows

## Email/Password Authentication

```typescript
// src/lib/auth/kinde-client.ts
import { createKindeClient } from "@kinde-oss/kinde-auth-pkce-js";

export const kindeClient = createKindeClient({
  client_id: process.env.NEXT_PUBLIC_KINDE_CLIENT_ID!,
  domain: process.env.NEXT_PUBLIC_KINDE_DOMAIN!,
  redirect_uri: window.location.origin + "/api/auth/kinde_callback",
  logout_redirect_uri: window.location.origin,
});

// Login with email
export async function loginWithEmail() {
  await kindeClient.login({
    authUrlParams: {
      connection_id: process.env.NEXT_PUBLIC_KINDE_CONNECTION_ID,
    },
  });
}

// Register
export async function register() {
  await kindeClient.register();
}
```

## Social Login

```typescript
// Google Sign-In
export async function loginWithGoogle() {
  await kindeClient.login({
    authUrlParams: {
      connection_id: "conn_google", // Your Google connection ID
    },
  });
}

// GitHub Sign-In
export async function loginWithGitHub() {
  await kindeClient.login({
    authUrlParams: {
      connection_id: "conn_github", // Your GitHub connection ID
    },
  });
}

// Microsoft Sign-In
export async function loginWithMicrosoft() {
  await kindeClient.login({
    authUrlParams: {
      connection_id: "conn_microsoft",
    },
  });
}
```

## Passwordless (Magic Link)

```typescript
// Send magic link
export async function sendMagicLink(email: string) {
  await kindeClient.login({
    authUrlParams: {
      login_hint: email,
      connection_id: "conn_magic_link",
    },
  });
}
```

## Session Management

```typescript
// Get authenticated user
export async function getUser() {
  const isAuthenticated = await kindeClient.isAuthenticated();

  if (!isAuthenticated) {
    return null;
  }

  return await kindeClient.getUser();
}

// Get user details
export async function getUserProfile() {
  const user = await kindeClient.getUser();

  return {
    id: user.id,
    email: user.email,
    name: `${user.given_name} ${user.family_name}`,
    picture: user.picture,
  };
}

// Logout
export async function logout() {
  await kindeClient.logout();
}
```

## Protected Routes

```typescript
// src/routes/_authenticated.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { kindeClient } from "@/lib/auth/kinde-client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const isAuthenticated = await kindeClient.isAuthenticated();

    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: window.location.pathname,
        },
      });
    }

    const user = await kindeClient.getUser();
    return { user };
  },
});
```

## Server-Side Authentication

```typescript
// src/lib/auth/kinde-server.ts
import { createKindeServerClient } from "@kinde-oss/kinde-typescript-sdk";

export const kindeServer = createKindeServerClient({
  clientId: process.env.KINDE_CLIENT_ID!,
  clientSecret: process.env.KINDE_CLIENT_SECRET!,
  domain: process.env.KINDE_DOMAIN!,
  redirectURL: process.env.KINDE_REDIRECT_URI!,
  logoutRedirectURL: process.env.KINDE_LOGOUT_REDIRECT_URI!,
});

// Verify token server-side
export async function verifyKindeToken(token: string) {
  try {
    const user = await kindeServer.validateToken(token);
    return user;
  } catch (error) {
    return null;
  }
}
```

**Next:** [Lesson 14.3: Organizations & Teams](./03-organizations.md)
