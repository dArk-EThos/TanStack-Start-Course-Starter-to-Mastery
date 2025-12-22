# Module 10.1: Testing Fundamentals

## Table of Contents

1. [Introduction](#introduction)
2. [Testing Strategy](#testing-strategy)
3. [Unit Testing with Vitest](#unit-testing-with-vitest)
4. [Testing Server Functions](#testing-server-functions)
5. [Integration Testing](#integration-testing)
6. [E2E Testing with Playwright](#e2e-testing-with-playwright)
7. [Test Coverage](#test-coverage)
8. [Best Practices](#best-practices)
9. [Next Steps](#next-steps)

---

## Introduction

Comprehensive testing ensures your application works correctly and catches bugs before production.

> [!IMPORTANT]
> Write tests that give you confidence, not just coverage!

---

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \     E2E Tests (Few, Slow, High Confidence)
      /____\
     /      \   Integration Tests (Some, Medium Speed)
    /________\
   /          \ Unit Tests (Many, Fast, Focused)
  /____________\
```

### What to Test

- ✅ Server functions (business logic)
- ✅ Utility functions
- ✅ Components (critical UI)
- ✅ User flows (E2E)
- ❌ Implementation details
- ❌ Third-party libraries

---

## Unit Testing with Vitest

### Setup

```bash
pnpm add -D vitest @vitest/ui
```

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

### Basic Test

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { formatCurrency, truncateText } from "./utils";

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    expect(formatCurrency(1234.56, "USD")).toBe("$1,234.56");
  });

  it("handles zero", () => {
    expect(formatCurrency(0, "USD")).toBe("$0.00");
  });

  it("rounds to 2 decimals", () => {
    expect(formatCurrency(1.999, "USD")).toBe("$2.00");
  });
});

describe("truncateText", () => {
  it("truncates long text", () => {
    const text = "This is a very long text that should be truncated";
    expect(truncateText(text, 20)).toBe("This is a very long...");
  });

  it("does not truncate short text", () => {
    const text = "Short";
    expect(truncateText(text, 20)).toBe("Short");
  });
});
```

---

## Testing Server Functions

### Mock Database

```typescript
// src/lib/api/users.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUser, createUser } from "./users";
import { prisma } from "@/lib/db";

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("getUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user when found", async () => {
    const mockUser = {
      id: "1",
      name: "John",
      email: "john@example.com",
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const result = await getUser({ userId: "1" });

    expect(result).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
  });

  it("throws when user not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(getUser({ userId: "999" })).rejects.toThrow("User not found");
  });
});

describe("createUser", () => {
  it("creates user successfully", async () => {
    const input = {
      name: "Jane",
      email: "jane@example.com",
      password: "hashed-password",
    };

    const mockUser = { id: "2", ...input };
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

    const result = await createUser({ data: input });

    expect(result).toEqual(mockUser);
  });

  it("throws on duplicate email", async () => {
    vi.mocked(prisma.user.create).mockRejectedValue({
      code: "P2002",
      meta: { target: ["email"] },
    });

    await expect(
      createUser({
        data: { name: "Test", email: "test@example.com", password: "pass" },
      })
    ).rejects.toThrow();
  });
});
```

### Testing with Fixtures

```typescript
// src/lib/test/fixtures.ts
export const mockUser = {
  id: "1",
  name: "Test User",
  email: "test@example.com",
  createdAt: new Date("2024-01-01"),
};

export const mockPost = {
  id: "1",
  title: "Test Post",
  content: "Test content",
  authorId: "1",
  published: true,
};

// Use in tests
import { mockUser, mockPost } from "@/lib/test/fixtures";

it("fetches user posts", async () => {
  vi.mocked(prisma.post.findMany).mockResolvedValue([mockPost]);

  const posts = await getUserPosts({ userId: mockUser.id });

  expect(posts).toEqual([mockPost]);
});
```

---

## Integration Testing

### Testing React Components

```bash
pnpm add -D @testing-library/react @testing-library/user-event
```

```typescript
// src/components/LoginForm.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  it("renders login form", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("shows validation errors", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    // Submit without filling fields
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/password is required/i)
    ).toBeInTheDocument();
  });
});
```

---

## E2E Testing with Playwright

### Setup

```bash
pnpm add -D @playwright/test
npx playwright install
```

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Tests

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can register", async ({ page }) => {
    await page.goto("/register");

    await page.fill('[name="name"]', "John Doe");
    await page.fill('[name="email"]', "john@example.com");
    await page.fill('[name="password"]', "password123");

    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1")).toContainText("Welcome, John Doe");
  });

  test("user can login", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[name="email"]', "existing@example.com");
    await page.fill('[name="password"]', "password123");

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[name="email"]', "wrong@example.com");
    await page.fill('[name="password"]', "wrongpassword");

    await page.click('button[type="submit"]');

    await expect(page.locator(".error")).toContainText(
      "Invalid email or password"
    );
  });
});
```

### Testing User Flows

```typescript
// e2e/blog-flow.spec.ts
test("complete blog post flow", async ({ page }) => {
  // 1. Login
  await page.goto("/login");
  await page.fill('[name="email"]', "author@example.com");
  await page.fill('[name="password"]', "password123");
  await page.click('button[type="submit"]');

  // 2. Create post
  await page.goto("/posts/new");
  await page.fill('[name="title"]', "My Test Post");
  await page.fill('[name="content"]', "This is the content");
  await page.click('button[type="submit"]');

  // 3. Verify post appears
  await page.goto("/posts");
  await expect(page.locator("text=My Test Post")).toBeVisible();

  // 4. Edit post
  await page.click("text=My Test Post");
  await page.click('button:has-text("Edit")');
  await page.fill('[name="title"]', "Updated Title");
  await page.click('button[type="submit"]');

  // 5. Verify update
  await expect(page.locator("h1")).toContainText("Updated Title");
});
```

---

## Test Coverage

### Generate Coverage Report

```bash
pnpm vitest run --coverage
```

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.spec.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

---

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ✅ Good: Test what user sees
it("displays welcome message after login", async () => {
  render(<Dashboard user={mockUser} />);
  expect(screen.getByText(/welcome, john/i)).toBeInTheDocument();
});

// ❌ Bad: Test implementation details
it("calls useState correctly", () => {
  const setStateSpy = vi.spyOn(React, "useState");
  render(<Dashboard />);
  expect(setStateSpy).toHaveBeenCalled();
});
```

### 2. Use Descriptive Test Names

```typescript
// ✅ Good: Clear what's being tested
it("shows error when email is invalid", () => {});
it("redirects to dashboard after successful login", () => {});

// ❌ Bad: Vague names
it("works", () => {});
it("test 1", () => {});
```

### 3. Arrange-Act-Assert Pattern

```typescript
// ✅ Good: Clear structure
it("creates user with valid data", async () => {
  // Arrange
  const userData = { name: "John", email: "john@example.com" };
  vi.mocked(prisma.user.create).mockResolvedValue({ id: "1", ...userData });

  // Act
  const result = await createUser({ data: userData });

  // Assert
  expect(result).toMatchObject(userData);
});
```

---

## Next Steps

**→ Continue to** [Module 10.2: CI/CD Integration](./02-ci-cd.md)

---

## Summary

- ✅ Testing strategy and pyramid
- ✅ Unit testing with Vitest
- ✅ Testing server functions
- ✅ Integration testing
- ✅ E2E testing with Playwright
- ✅ Test coverage
- ✅ Best practices

**Up Next**: CI/CD integration and automated testing!
