# Module 9 — Authentication

**Pulse files:** `src/lib/session.server.ts`, `src/functions/auth.functions.ts`, `src/routes/_authenticated.tsx`

Pulse teaches the primitives. Production SaaS should usually adopt a maintained library.

## Course implementation (Pulse)

- Passwords hashed with `scrypt` (`src/lib/password.server.ts`)
- Opaque session IDs in **HttpOnly**, `SameSite=Lax` cookies
- `Secure` and `__Host-` prefix in production
- Dummy hash on unknown emails so login timing does not enumerate users
- Session rotation on login
- `authMiddleware` on every private server function
- `_authenticated` layout `beforeLoad` redirect for UX

```ts
export const listProjects = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return readOnly((db) =>
      db.projects.filter((project) => project.userId === context.user.id),
    )
  })
```

Ownership is checked **again** on get/update/delete. A valid session is not a license to pass someone else's `projectId`.

Login and signup throw `redirect({ to: '/dashboard' })`. The UI must call them through `useServerFn`.

## Production options

| Library | Use when |
| --- | --- |
| [Better Auth](https://www.better-auth.com/) | You want email/password, OAuth, orgs, and a TanStack Start plugin |
| Clerk | You want hosted UI and user management |
| WorkOS | Enterprise SSO |
| Kinde | Hosted auth with permissions |
| Auth.js | You already know the Next adapter and can map it to Start |

Official Start examples: `start-basic-auth`, `start-clerk-basic`, `start-workos`, `start-supabase-basic`.

Better Auth is the usual open-source default in 2026. Keep the Pulse lessons first so you understand cookies, CSRF, and why route guards are not enough — then replace `session.server.ts` with Better Auth rather than starting from a black box.

## CSRF

`SameSite=Lax` blocks most cross-site POSTs. Pulse also compares `Origin` to the request origin on non-GET requests. Never mutate on GET.

## Exercise

1. Log in as Ada, create a project, copy its id, log out, and call `getProject` from a scratch script. It must fail.
2. Add a `lastLoginAt` field updated only after a successful password check.
3. Swap the cookie name to `__Host-pulse-session` in production only (already done) and explain why it cannot be used on `http://localhost`.

## Next

[Module 10 — UI](./10-ui.md)
