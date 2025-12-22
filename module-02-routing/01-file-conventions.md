# Module 2.1: File Naming Conventions & Route Patterns

## Table of Contents

1. [Introduction](#introduction)
2. [Basic File Conventions](#basic-file-conventions)
3. [Dynamic Route Segments](#dynamic-route-segments)
4. [Layout Routes](#layout-routes)
5. [Catch-All Routes](#catch-all-routes)
6. [Route Groups](#route-groups)
7. [Special Files](#special-files)
8. [Naming Best Practices](#naming-best-practices)
9. [Common Patterns](#common-patterns)
10. [Next Steps](#next-steps)

---

## Introduction

TanStack Start uses **file-based routing** where your file structure directly maps to your URL structure. Understanding the naming conventions is crucial for building scalable applications.

> [!IMPORTANT]
> Route file names are case-sensitive and follow specific patterns. Learning these conventions will make you highly productive.

---

## Basic File Conventions

### Index Routes

Files named `index.tsx` match the parent directory's path.

```
src/routes/
├── index.tsx           → /
├── about/
│   └── index.tsx       → /about
└── blog/
    └── index.tsx       → /blog
```

**Example:**

```typescript
// src/routes/blog/index.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/")({
  component: BlogList,
});

function BlogList() {
  return <h1>Blog Posts</h1>;
}
```

### Named Routes

Files with regular names create routes at that path.

```
src/routes/
├── about.tsx           → /about
├── contact.tsx         → /contact
└── pricing.tsx         → /pricing
```

**Example:**

```typescript
// src/routes/pricing.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pricing")({
  component: Pricing,
});

function Pricing() {
  return <h1>Pricing Plans</h1>;
}
```

---

## Dynamic Route Segments

Dynamic segments start with `$` and capture URL parameters.

### Single Parameter

```
src/routes/
└── blog/
    └── $postId.tsx     → /blog/:postId
```

**Matches:**

- `/blog/123`
- `/blog/my-first-post`
- `/blog/anything`

**Example:**

```typescript
// src/routes/blog/$postId.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/$postId")({
  loader: async ({ params }) => {
    // params.postId is type-safe!
    console.log(params.postId); // "123", "my-first-post", etc.
    return fetchPost(params.postId);
  },
  component: BlogPost,
});

function BlogPost() {
  const post = Route.useLoaderData();
  const { postId } = Route.useParams();

  return (
    <article>
      <h1>{post.title}</h1>
      <p>Post ID: {postId}</p>
    </article>
  );
}
```

### Multiple Parameters

```
src/routes/
└── users/
    └── $userId/
        └── posts/
            └── $postId.tsx    → /users/:userId/posts/:postId
```

**Matches:**

- `/users/123/posts/456`
- `/users/john/posts/hello-world`

**Example:**

```typescript
// src/routes/users/$userId/posts/$postId.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users/$userId/posts/$postId")({
  loader: async ({ params }) => {
    // Both params are available and typed!
    const { userId, postId } = params;
    return await fetchUserPost(userId, postId);
  },
  component: UserPost,
});

function UserPost() {
  const { userId, postId } = Route.useParams();

  return (
    <div>
      <p>User: {userId}</p>
      <p>Post: {postId}</p>
    </div>
  );
}
```

### Optional Parameters

Use `$` with a default to make parameters optional (handled in loader logic).

```typescript
// src/routes/products/$categoryId.tsx
export const Route = createFileRoute("/products/$categoryId")({
  loader: async ({ params }) => {
    const categoryId = params.categoryId || "all";
    return fetchProducts(categoryId);
  },
  component: Products,
});
```

---

## Layout Routes

Layout routes use `_` prefix and don't add to the URL path.

### Basic Layout

```
src/routes/
└── dashboard/
    ├── _layout.tsx         # Layout (not in URL)
    ├── index.tsx           → /dashboard
    ├── analytics.tsx       → /dashboard/analytics
    └── settings.tsx        → /dashboard/settings
```

**Layout File:**

```typescript
// src/routes/dashboard/_layout.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/_layout")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="flex">
      {/* Sidebar - shared across all dashboard pages */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/dashboard/analytics">Analytics</Link>
          <Link to="/dashboard/settings">Settings</Link>
        </nav>
      </aside>

      {/* Main content - child routes render here */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
```

### Nested Layouts

You can nest layouts for complex UI hierarchies.

```
src/routes/
└── app/
    ├── _layout.tsx              # App layout
    └── dashboard/
        ├── _layout.tsx          # Dashboard layout (nested)
        ├── index.tsx            → /app/dashboard
        └── settings/
            ├── _layout.tsx      # Settings layout (triple nested!)
            ├── profile.tsx      → /app/dashboard/settings/profile
            └── billing.tsx      → /app/dashboard/settings/billing
```

**Result:** Three layers of layouts wrapping your content!

---

## Catch-All Routes

Catch-all routes use `$` or `$.tsx` to match any remaining segments.

### 404 Not Found

```
src/routes/
└── $.tsx               → Matches any unmatched route
```

**Example:**

```typescript
// src/routes/$.tsx
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
  component: NotFound,
});

function NotFound() {
  return (
    <div className="text-center py-12">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl mt-4">Page not found</p>
      <Link to="/" className="text-blue-500 mt-4 inline-block">
        Go home
      </Link>
    </div>
  );
}
```

### Nested Catch-All

```
src/routes/
└── docs/
    └── $.tsx           → /docs/* (matches /docs/any/path/here)
```

**Example Use Case:** Documentation with flexible paths

```typescript
// src/routes/docs/$.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs/$")({
  loader: async ({ params }) => {
    // params._ contains the full path after /docs/
    const docPath = params._ || "index";
    return fetchDocumentation(docPath);
  },
  component: DocPage,
});
```

---

## Route Groups

Route groups organize routes without affecting the URL structure.

### Using Parentheses

```
src/routes/
├── (marketing)/           # Doesn't appear in URL
│   ├── _layout.tsx
│   ├── index.tsx          → /
│   ├── about.tsx          → /about
│   └── pricing.tsx        → /pricing
└── (app)/                 # Doesn't appear in URL
    ├── _layout.tsx
    ├── dashboard.tsx      → /dashboard
    └── settings.tsx       → /settings
```

> [!NOTE]
> Route groups are a file organization feature. They group related routes without changing URLs.

**Example:**

```typescript
// src/routes/(marketing)/_layout.tsx
export const Route = createFileRoute("/(marketing)/_layout")({
  component: MarketingLayout,
});

function MarketingLayout() {
  return (
    <div>
      <MarketingHeader />
      <Outlet />
      <MarketingFooter />
    </div>
  );
}
```

---

## Special Files

### `__root.tsx` - The Root Route

Every app needs a root route that wraps all other routes.

```typescript
// src/routes/__root.tsx
import {
  Outlet,
  createRootRoute,
  Scripts,
  ScrollRestoration,
} from "@tanstack/react-router";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <title>My App</title>
      </head>
      <body>
        <Outlet />
        <Scripts />
        <ScrollRestoration />
      </body>
    </html>
  );
}
```

### `route.tsx` - Alternative to Index

In some cases, you can use `route.tsx` instead of `index.tsx`:

```
src/routes/
└── blog/
    ├── route.tsx       → /blog (alternative to index.tsx)
    └── $postId.tsx     → /blog/:postId
```

---

## Naming Best Practices

### DO ✅

```
✅ Use lowercase with hyphens
   blog-post.tsx
   user-profile.tsx

✅ Use descriptive names
   dashboard-analytics.tsx
   settings-billing.tsx

✅ Use $ for dynamic segments
   $userId.tsx
   $postId.tsx

✅ Use _ for layouts
   _layout.tsx
   _auth-layout.tsx

✅ Keep names concise
   profile.tsx (not user-profile-page.tsx)
```

### DON'T ❌

```
❌ Avoid PascalCase
   BlogPost.tsx (use blog-post.tsx)

❌ Avoid underscores (except for layouts)
   blog_post.tsx (use blog-post.tsx)

❌ Avoid spaces
   blog post.tsx (invalid!)

❌ Avoid generic names without context
   page.tsx (use specific names)

❌ Avoid deeply nested singular folders
   blog/post/detail.tsx (use blog/$postId.tsx)
```

---

## Common Patterns

### Pattern 1: Resource CRUD

```
src/routes/
└── products/
    ├── index.tsx          → /products (list)
    ├── new.tsx            → /products/new (create)
    └── $productId/
        ├── index.tsx      → /products/:id (view)
        └── edit.tsx       → /products/:id/edit
```

### Pattern 2: User Area

```
src/routes/
└── users/
    ├── $userId/
    │   ├── index.tsx      → /users/:userId (profile)
    │   ├── posts.tsx      → /users/:userId/posts
    │   └── settings.tsx   → /users/:userId/settings
    └── index.tsx          → /users (list)
```

### Pattern 3: Application Sections

```
src/routes/
├── (public)/              # Public pages
│   ├── _layout.tsx
│   ├── index.tsx          → /
│   └── about.tsx          → /about
├── (auth)/                # Auth pages
│   ├── _layout.tsx
│   ├── login.tsx          → /login
│   └── signup.tsx         → /signup
└── (app)/                 # Authenticated app
    ├── _layout.tsx
    └── dashboard.tsx      → /dashboard
```

### Pattern 4: Documentation Site

```
src/routes/
├── index.tsx              → /
├── docs/
│   ├── _layout.tsx
│   ├── index.tsx          → /docs
│   ├── getting-started.tsx → /docs/getting-started
│   └── api/
│       ├── index.tsx      → /docs/api
│       └── $section.tsx   → /docs/api/:section
└── $.tsx                  → 404
```

---

## Advanced Convention: Flat Routes

For better organization in large apps, use "flat" naming:

```
src/routes/
├── _app.dashboard.tsx              → /dashboard
├── _app.dashboard.analytics.tsx    → /dashboard/analytics
├── _app.dashboard.settings.tsx     → /dashboard/settings
└── _app.tsx                        # Layout for all _app routes
```

**Benefits:**

- All routes visible in one directory
- Easy to search and navigate
- Clear hierarchy through naming

---

## Route File Anatomy Recap

Every route file follows this structure:

```typescript
// 1. Imports
import { createFileRoute } from "@tanstack/react-router";

// 2. Export the Route
export const Route = createFileRoute("/your/path")({
  // 3. Optional: before load
  beforeLoad: async ({ context }) => {
    // Auth checks, etc.
  },

  // 4. Optional: load data
  loader: async ({ params }) => {
    return await fetchData(params);
  },

  // 5. Optional: meta tags
  meta: () => ({
    title: "Page Title",
  }),

  // 6. Required: component
  component: MyComponent,

  // 7. Optional: error component
  errorComponent: MyError,

  // 8. Optional: pending component
  pendingComponent: MyLoading,
});

// 9. Implement component
function MyComponent() {
  const data = Route.useLoaderData();
  const params = Route.useParams();

  return <div>{/* Your UI */}</div>;
}
```

---

## Quick Reference Table

| File Name     | URL Pattern       | Description         |
| ------------- | ----------------- | ------------------- |
| `index.tsx`   | `/` or `/parent/` | Index route         |
| `about.tsx`   | `/about`          | Static route        |
| `$id.tsx`     | `/:id`            | Dynamic parameter   |
| `_layout.tsx` | -                 | Layout (not in URL) |
| `__root.tsx`  | -                 | Root wrapper        |
| `$.tsx`       | `/*`              | Catch-all/404       |
| `(group)/`    | -                 | Route group         |

---

## Next Steps

Now that you understand file naming conventions, let's explore search params and advanced parameter handling!

**→ Continue to** [Module 2.2: Route Parameters & Search Params](./02-route-parameters.md)

---

## Summary

In this lesson, you learned:

- ✅ Basic file conventions (`index.tsx`, named routes)
- ✅ Dynamic routes with `$` prefix
- ✅ Layout routes with `_` prefix
- ✅ Catch-all routes for 404 pages
- ✅ Route groups for organization
- ✅ Special files (`__root.tsx`)
- ✅ Naming best practices
- ✅ Common routing patterns
- ✅ Route file anatomy

**Up Next**: Deep dive into route parameters and search params!
