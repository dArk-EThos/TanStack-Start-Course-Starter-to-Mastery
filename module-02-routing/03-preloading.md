# Module 2.3: Route Preloading & Prefetching

## Table of Contents

1. [Introduction](#introduction)
2. [Why Preload?](#why-preload)
3. [Preloading Strategies](#preloading-strategies)
4. [Configuring Preloading](#configuring-preloading)
5. [Manual Preloading](#manual-preloading)
6. [Prefetching Data](#prefetching-data)
7. [Cache Management](#cache-management)
8. [Performance Best Practices](#performance-best-practices)
9. [Next Steps](#next-steps)

---

## Introduction

One of TanStack Router's most powerful features is **intelligent preloading** - loading routes and data before users need them, making navigation feel instant.

> [!TIP]
> Properly configured preloading can make your app feel 10x faster without any code changes!

---

## Why Preload?

### The Problem

Without preloading:

```
User clicks link → Navigate → Load route code → Load data → Render
                    ↑________________ 500-2000ms delay_____________↑
```

### The Solution

With preloading:

```
User hovers link → Preload route & data in background
User clicks link → Render immediately (already loaded!)
                    ↑_____ <50ms delay_____↑
```

---

## Preloading Strategies

TanStack Router offers several preloading strategies:

### 1. Intent-Based Preloading (Recommended)

Load when user shows intent to navigate (hover, touch start).

```typescript
// src/router.tsx
import { createRouter } from "@tanstack/react-router";

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: "intent", // ✅ Preload on hover/touch
    defaultPreloadDelay: 50, // Wait 50ms before preloading
  });

  return router;
}
```

**When it triggers:**

- Mouse hover over a link (after 50ms delay)
- Touch start on mobile (after 50ms delay)
- Focus on a link (keyboard navigation)

**Benefits:**

- Feels instant when user clicks
- Don't waste bandwidth (users often bounce over links)
- Mobile-friendly

### 2. Viewport-Based Preloading

Load when link enters viewport.

```typescript
export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: "viewport", // Load when visible
  });

  return router;
}
```

**Use case:** Long lists of links (infinite scroll)

**Warning:** Can cause lots of unnecessary preloading!

### 3. No Preloading

```typescript
export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: false, // Disable preloading
  });

  return router;
}
```

**Use case:** Extremely low bandwidth scenarios

---

## Configuring Preloading

### Global Configuration

Set defaults for all routes in your router:

```typescript
// src/router.tsx
export function getRouter() {
  const router = createRouter({
    routeTree,

    // Preload strategy
    defaultPreload: "intent",

    // Delay before preloading (ms)
    defaultPreloadDelay: 50,

    // How long to cache preloaded data (ms)
    defaultPreloadStaleTime: 30_000, // 30 seconds

    // Cache time for general data
    defaultStaleTime: 0, // Consider stale immediately
  });

  return router;
}
```

### Per-Route Configuration

Override defaults for specific routes:

```typescript
// src/routes/blog/$postId.tsx
export const Route = createFileRoute("/blog/$postId")({
  // Don't preload blog posts (they're heavy)
  preload: false,

  loader: async ({ params }) => {
    return await fetchBlogPost(params.postId);
  },

  component: BlogPost,
});
```

### Per-Link Override

Control preloading for individual links:

```typescript
import { Link } from "@tanstack/react-router";

function Navigation() {
  return (
    <nav>
      {/* Preload on hover (default) */}
      <Link to="/about" preload="intent">
        About
      </Link>

      {/* Never preload */}
      <Link to="/heavy-page" preload={false}>
        Heavy Page
      </Link>

      {/* Preload immediately */}
      <Link to="/important" preload="render">
        Important
      </Link>

      {/* Preload when visible */}
      <Link to="/product" preload="viewport">
        Product
      </Link>
    </nav>
  );
}
```

---

## Manual Preloading

Sometimes you want to preload programmatically:

### Basic Manual Preload

```typescript
import { useRouter } from "@tanstack/react-router";

function ProductCard({ productId }: { productId: string }) {
  const router = useRouter();

  const handleMouseEnter = () => {
    // Preload the product detail route
    router.preloadRoute({
      to: "/products/$productId",
      params: { productId },
    });
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      <h3>Product {productId}</h3>
      <Link to="/products/$productId" params={{ productId }}>
        View Details
      </Link>
    </div>
  );
}
```

### Preload Multiple Routes

```typescript
function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Preload commonly visited routes on dashboard load
    const routes = [
      { to: "/dashboard/analytics" },
      { to: "/dashboard/reports" },
      { to: "/dashboard/settings" },
    ];

    routes.forEach((route) => router.preloadRoute(route));
  }, []);

  return <div>Dashboard</div>;
}
```

### Conditional Preloading

```typescript
function NewsArticle() {
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    // Only preload if user is authenticated
    if (user) {
      router.preloadRoute({ to: "/profile" });
    }
  }, [user]);

  return <article>...</article>;
}
```

---

## Prefetching Data

### What Gets Preloaded?

When you preload a route, TanStack Router:

1. ✅ Loads route JavaScript code (code splitting)
2. ✅ Runs the loader function
3. ✅ Caches the result
4. ❌ Does NOT render the component

### Loader Execution

```typescript
export const Route = createFileRoute("/products/$productId")({
  loader: async ({ params }) => {
    console.log("Loading product:", params.productId);

    // This runs DURING preload
    const product = await fetchProduct(params.productId);

    // Result is cached
    return { product };
  },

  component: Product,
});
```

**Timeline:**

```
1. User hovers link
2. ⏱️  50ms delay
3. 🔄 loader() executes
4. 💾 Result cached
5. User clicks
6. ✅ Instant render (uses cache)
```

---

## Cache Management

### Cache Invalidation

```typescript
import { useRouter } from "@tanstack/react-router";

function ProductActions({ productId }: { productId: string }) {
  const router = useRouter();

  const handleUpdate = async () => {
    await updateProduct(productId);

    // Invalidate cache for this route
    router.invalidate();

    // Or invalidate specific route
    router.invalidate({
      to: "/products/$productId",
      params: { productId },
    });
  };

  return <button onClick={handleUpdate}>Update</button>;
}
```

### Stale Time Configuration

```typescript
export const Route = createFileRoute("/products")({
  // Data is fresh for 5 minutes
  staleTime: 5 * 60 * 1000, // 5 minutes

  loader: async () => {
    // This won't re-run if data is fresh
    return await fetchProducts();
  },
});
```

### GC Time (Garbage Collection)

```typescript
export const Route = createFileRoute("/products")({
  // Keep in cache for 10 minutes after navigation away
  gcTime: 10 * 60 * 1000, // 10 minutes

  loader: async () => fetchProducts(),
});
```

---

## Performance Best Practices

### 1. Use Intent-Based Preloading

```typescript
// ✅ Good: Preload on hover
export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
  });
}

// ❌ Bad: Preload everything in viewport
export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "viewport", // Can preload too much!
  });
}
```

### 2. Disable for Heavy Routes

```typescript
// Heavy video page - don't preload
export const Route = createFileRoute("/videos/$videoId")({
  preload: false, // User must explicitly navigate
  loader: async ({ params }) => {
    return await fetchVideoData(params.videoId); // Large data
  },
});
```

### 3. Preload Critical Routes

```typescript
function App() {
  const router = useRouter();

  useEffect(() => {
    // Preload most common route
    router.preloadRoute({ to: "/dashboard" });
  }, []);

  return <div>...</div>;
}
```

### 4. Use Stale Times Wisely

```typescript
// Rarely changing data - long stale time
export const Route = createFileRoute("/about")({
  staleTime: Infinity, // Never stale
  loader: async () => fetchAboutPage(),
});

// Frequently updating - short stale time
export const Route = createFileRoute("/live-scores")({
  staleTime: 10_000, // 10 seconds
  loader: async () => fetchScores(),
});
```

### 5. Avoid Preloading With Search Params

```typescript
// ❌ Bad: Preload with every param combination
<Link
  to="/products"
  search={{ page: 1, sort: 'price' }}
  preload="intent"
/>

// ✅ Better: Only preload base route
<Link
  to="/products"
  search={{ page: 1, sort: 'price' }}
  preload={false} // Navigate to exact URL
/>
```

---

## Advanced Patterns

### Pattern 1: Warmup Cache on Login

```typescript
function useWarmupCache() {
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (user) {
      // Preload user-specific routes
      const userRoutes = [
        { to: "/dashboard" },
        { to: "/profile" },
        { to: "/settings" },
      ];

      userRoutes.forEach((route) => {
        router.preloadRoute(route);
      });
    }
  }, [user, router]);
}
```

### Pattern 2: Progressive Preloading

```typescript
function ProductList({ products }: { products: Product[] }) {
  const router = useRouter();

  useEffect(() => {
    // Preload first 3 products
    products.slice(0, 3).forEach((product, index) => {
      setTimeout(() => {
        router.preloadRoute({
          to: "/products/$productId",
          params: { productId: product.id },
        });
      }, index * 100); // Stagger preloads
    });
  }, [products]);

  return <div>...</div>;
}
```

### Pattern 3: Smart Preloading Based on Analytics

```typescript
function useSmartPreload() {
  const router = useRouter();
  const analytics = useAnalytics();

  useEffect(() => {
    // Get most visited pages from analytics
    const topPages = analytics.getTopPages();

    // Preload them
    topPages.forEach((page) => {
      router.preloadRoute({ to: page });
    });
  }, []);
}
```

---

## Debugging Preloading

### Router Devtools

The TanStack Router Devtools show:

- ✅ Which routes are preloaded
- ✅ Cache status (fresh/stale)
- ✅ Loader execution times
- ✅ Navigation history

```typescript
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

function App() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
```

### Console Logging

```typescript
export const Route = createFileRoute("/products")({
  loader: async () => {
    console.log("🔄 Loading products...");
    const data = await fetchProducts();
    console.log("✅ Products loaded:", data.length);
    return data;
  },
});
```

---

## Next Steps

You now understand route preloading and performance optimization! Let's explore nested routing and layout composition.

**→ Continue to** [Module 2.4: Nested Routing & Layouts](./04-nested-routing.md)

---

## Summary

In this lesson, you learned:

- ✅ Why preloading makes apps feel instant
- ✅ Different preloading strategies (intent, viewport, render)
- ✅ Configuring preloading globally and per-route
- ✅ Manual preloading with `router.preloadRoute()`
- ✅ Cache management and invalidation
- ✅ Performance best practices
- ✅ Advanced preloading patterns

**Up Next**: Master nested routing and complex layouts!
