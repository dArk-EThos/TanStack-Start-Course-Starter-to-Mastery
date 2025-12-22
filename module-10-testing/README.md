# Module 10: Testing & Quality

Ensure code quality with comprehensive testing strategies for TanStack Start applications.

## 🎯 Learning Objectives

- ✅ Unit test server functions
- ✅ Integration test routes and flows
- ✅ End-to-end test user journeys
- ✅ Test authentication and protected routes
- ✅ Mock external dependencies
- ✅ Set up CI/CD pipelines

## 📖 Key Topics

### 10.1 Unit Testing

- Testing server functions with Vitest
- Mocking database calls
- Testing validation logic
- Testing utilities and helpers

### 10.2 Integration Testing

- Testing routes and loaders
- Testing form submissions
- Testing error boundaries
- React Testing Library

### 10.3 End-to-End Testing

- Playwright setup
- Testing user flows
- Testing authentication
- Visual regression testing

### 10.4 Mocking Strategies

- MSW (Mock Service Worker)
- Database mocking
- External API mocking
- File system mocking

### 10.5 CI/CD Integration

- GitHub Actions setup
- Running tests in CI
- Code coverage reports
- Automated deployments

## 🔑 Testing Patterns

### Unit Test Server Function

```typescript
import { describe, it, expect, vi } from "vitest";
import { getUser } from "./api/users";

describe("getUser", () => {
  it("returns user when found", async () => {
    const mockUser = { id: "1", name: "John" };
    vi.spyOn(db.user, "findUnique").mockResolvedValue(mockUser);

    const result = await getUser({ userId: "1" });

    expect(result).toEqual(mockUser);
  });

  it("throws when user not found", async () => {
    vi.spyOn(db.user, "findUnique").mockResolvedValue(null);

    await expect(getUser({ userId: "999" })).rejects.toThrow("User not found");
  });
});
```

### E2E Test

```typescript
import { test, expect } from "@playwright/test";

test("user can login", async ({ page }) => {
  await page.goto("/login");

  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "password123");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator("h1")).toContainText("Dashboard");
});
```

## 🛠️ Exercises

1. **Test Suite for Task Manager** - Complete unit and integration tests
2. **E2E User Flows** - Login, create, update, delete flows
3. **CI/CD Pipeline** - GitHub Actions with automated tests

**→ Next:** [Module 11: Performance & Optimization](../module-11-performance/)

---

**Estimated Time:** 7-9 hours
