# Module 2: File-Based Routing Mastery

Master advanced routing concepts in TanStack Start and build complex, performant navigation systems.

## 🎯 Learning Objectives

By the end of this module, you will:

- ✅ Understand all file naming conventions and patterns
- ✅ Master route and search parameter handling with type safety
- ✅ Implement intelligent preloading for better performance
- ✅ Build complex nested layouts
- ✅ Create protected routes with authentication
- ✅ Handle errors and loading states elegantly

## 📚 Lessons

### [2.1 File Naming Conventions & Route Patterns](./01-file-conventions.md)

**Time:** 45 minutes

Deep dive into TanStack Start's routing file conventions.

**Topics:**

- Basic file conventions (index, named routes)
- Dynamic route segments with `$`
- Layout routes with `_` prefix
- Catch-all routes for 404 pages
- Route groups for organization
- Naming best practices
- Common routing patterns

**Key Concept:** Your file structure IS your route structure

---

### [2.2 Route Parameters & Search Params](./02-route-parameters.md)

**Time:** 60 minutes

Master type-safe parameter handling and validation.

**Topics:**

- Route parameters (`$userId`)
- Search parameters (query strings)
- Type-safe validation with Zod
- Updating parameters programmatically
- Common patterns (pagination, filtering, search)
- Best practices for clean URLs

**Key Concept:** Full type safety from URL to component

---

### [2.3 Route Preloading & Prefetching](./03-preloading.md)

**Time:** 45 minutes

Make your app feel instant with intelligent preloading.

**Topics:**

- Why preload routes and data?
- Preloading strategies (intent, viewport, render)
- Global and per-route configuration
- Manual preloading
- Cache management
- Performance optimization

**Key Concept:** Load before users click for instant navigation

---

### [2.4 Nested Routing & Layouts](./04-nested-routing.md)

**Time:** 60 minutes (Coming Soon)

Build complex UI hierarchies with nested routes and layouts.

**Topics:**

- Nested route concepts
- Multiple layout levels
- Shared layouts vs route-specific
- Outlet component deep dive
- Layout composition patterns
- Breadcrumbs and navigation

---

### [2.5 Route Protection & Guards](./05-route-protection.md)

**Time:** 60 minutes (Coming Soon)

Secure your routes with authentication and authorization.

**Topics:**

- `beforeLoad` lifecycle hook
- Authentication guards
- Role-based access control
- Redirects and forbidden pages
- Loading states during auth checks
- Protected route patterns

---

## 🛠️ Exercises

### [Exercise 1: E-Commerce Product Catalog](./exercises/README.md#exercise-1)

**Difficulty:** Intermediate | **Time:** 60-90 min

Build a product catalog with categories, filters, sorting, and pagination.

**Skills:**

- Dynamic routes
- Search params with Zod
- Preloading product pages
- URL state management

---

### [Exercise 2: Multi-Level Dashboard](./exercises/README.md#exercise-2)

**Difficulty:** Intermediate-Advanced | **Time:** 90-120 min

Create a dashboard with nested layouts and multiple sections.

**Skills:**

- Complex nested routing
- Multiple layout levels
- Breadcrumb navigation
- Active route highlighting

---

### [Exercise 3: Protected Admin Panel](./exercises/README.md#exercise-3)

**Difficulty:** Advanced | **Time:** 120+ min

Build an admin panel with authentication and role-based access.

**Skills:**

- Route protection
- Authentication guards
- Role-based routing
- Redirect handling

---

## 📖 Key Concepts

### File Naming Quick Reference

```
index.tsx        → /path
about.tsx        →  /about
$id.tsx          → /:id (dynamic)
_layout.tsx      → layout (no URL)
__root.tsx       → root wrapper
$.tsx            → /* (catch-all)
(group)/         → organization only
```

### Type-Safe Navigation

```typescript
// Params are fully typed!
<Link
  to="/blog/$postId"
  params={{ postId: "123" }}
  search={{ sort: "date", page: 1 }}
/>
```

### Preloading Configuration

```typescript
export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent", // Preload on hover
    defaultPreloadDelay: 50, // 50ms delay
  });
}
```

### Search Param Validation

```typescript
const searchSchema = z.object({
  page: z.number().int().default(1),
  sort: z.enum(["date", "name"]).default("date"),
});

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
});
```

---

## ✅ Self-Assessment

Before moving to Module 3, ensure you can:

- [ ] Create routes with proper naming conventions
- [ ] Use dynamic parameters in routes
- [ ] Implement layout routes for shared UI
- [ ] Validate search parameters with Zod
- [ ] Navigate programmatically with type safety
- [ ] Configure route preloading strategies
- [ ] Build nested route hierarchies
- [ ] Protect routes with authentication (Module 2.5)

---

## 🎓 What's Next?

In **Module 3**, we'll dive into server functions and full-stack data handling:

- Creating type-safe server functions
- Validation and error handling
- Form submissions
- Database integration patterns

**→ Continue to** [Module 3: Server Functions & Data Handling](../module-03-server-functions/)

---

## 📚 Additional Resources

- [TanStack Router File Routes Guide](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing)
- [Search Params Documentation](https://tanstack.com/router/latest/docs/framework/react/guide/search-params)
- [Preloading Guide](https://tanstack.com/router/latest/docs/framework/react/guide/preloading)
- [Route Protection Patterns](https://tanstack.com/router/latest/docs/framework/react/guide/route-guards)

---

## 💡 Module Tips

> [!TIP] > **DevTools Are Your Friend**: Keep the Router Devtools open while learning. They show you exactly what's happening with routes, loaders, and cache.

> [!TIP] > **Type Safety Saves Time**: Let TypeScript guide you. If you see a type error in navigation, it means you're doing it wrong - fix it now, not in production!

> [!IMPORTANT] > **Preloading Strategy Matters**: Start with 'intent' preloading. Only disable it for heavy routes. The performance difference is night and day.

> [!TIP] > **Keep URLs Clean**: Use Zod schemas with defaults for search params. Remove undefined values to avoid ugly URLs like `?page=` or `?category=`.

---

**Estimated Module Completion Time:** 5-7 hours (including exercises)

You're making great progress! Keep building! 🚀
