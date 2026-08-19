# Module 12 — Testing

**Pulse files:** `src/lib/schemas.test.ts`, `vitest.config.ts`

Start with pure tests. Pulse already runs:

```bash
cd apps/pulse
npm test
```

Those tests cover Zod schemas and password hashing — the parts that must be right even if the UI is wrong.

## What to test

| Layer | Tool | Assert |
| --- | --- | --- |
| Schemas, hashing, auth helpers | Vitest | Valid/invalid input, dummy-hash timing helpers |
| Server functions | Vitest + test request | Unauthenticated calls throw; owner can read; stranger cannot |
| Routes | Playwright | Signup, login, create project, 404, `/api/health` |
| Visual | Playwright screenshots (optional) | Auth card, dashboard |

## Critical auth test

Call the protected RPC **without** a session cookie. If it returns data, your `beforeLoad` is the only gate and the app is unsafe.

## Playwright sketch

```ts
test('demo user can open dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('ada@pulse.dev')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Log in' }).click()
  await page.waitForURL('**/dashboard')
  await expect(page.getByRole('heading', { name: /Hello/ })).toBeVisible()
})
```

Run Playwright against `npm run dev` or a preview server. Do not hit production.

## Exercise

1. Add a Vitest case that `projectSchema` trims nothing and rejects whitespace-only names (`z.string().trim().min(1)`).
2. Add Playwright for create-project and confirm it appears after reload.
3. Add a test that `/projects` redirects to `/login` when logged out.

## Next

[Module 13 — Performance](./13-performance.md)
