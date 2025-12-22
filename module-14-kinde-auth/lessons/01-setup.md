# Lesson 14.1: Kinde Setup with TanStack Start

Quick setup guide for Kinde authentication.

## Installation

```bash
pnpm add @kinde-oss/kinde-auth-pkce-js
```

## Kinde Dashboard Setup

1. Create account at https://kinde.com
2. Create new application
3. Note: Client ID, Domain, Redirect URLs
4. Configure callback URLs:
   - `http://localhost:3000/api/auth/kinde_callback`
   - `http://localhost:3000`

## Environment Variables

```env
KINDE_CLIENT_ID="your_client_id"
KINDE_DOMAIN="https://your-domain.kinde.com"
KINDE_REDIRECT_URI="http://localhost:3000/api/auth/kinde_callback"
KINDE_LOGOUT_REDIRECT_URI="http://localhost:3000"
```

## Client Setup

```typescript
// src/lib/auth/kinde.ts
import { createKindeClient } from "@kinde-oss/kinde-auth-pkce-js";

export const kinde = createKindeClient({
  client_id: process.env.KINDE_CLIENT_ID!,
  domain: process.env.KINDE_DOMAIN!,
  redirect_uri: process.env.KINDE_REDIRECT_URI!,
  logout_redirect_uri: process.env.KINDE_LOGOUT_REDIRECT_URI!,
});

// Login
export async function login() {
  await kinde.login();
}

// Get user
export async function getUser() {
  return await kinde.getUser();
}
```

**Complete setup in minutes!** ⚡

**Next lessons:** Authentication flows, organizations, and permissions with Kinde's managed platform.
