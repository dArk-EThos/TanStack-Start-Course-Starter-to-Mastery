# Module 11.1: Performance Optimization Fundamentals

## Table of Contents

1. [Introduction](#introduction)
2. [Performance Metrics](#performance-metrics)
3. [Bundle Optimization](#bundle-optimization)
4. [Code Splitting](#code-splitting)
5. [Image Optimization](#image-optimization)
6. [Caching Strategies](#caching-strategies)
7. [Database Optimization](#database-optimization)
8. [Performance Monitoring](#performance-monitoring)
9. [Best Practices](#best-practices)
10. [Summary](#summary)

---

## Introduction

Performance directly impacts user experience and conversion rates. Every 100ms delay can decrease conversions by 1%!

> [!IMPORTANT]
> Measure first, optimize second. Don't guess what's slow!

---

## Performance Metrics

### Core Web Vitals

```typescript
// src/lib/monitoring/web-vitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from "web-vitals";

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify(metric);

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", body);
  } else {
    fetch("/api/analytics", { body, method: "POST", keepalive: true });
  }
}

// Track metrics
onCLS(sendToAnalytics); // Cumulative Layout Shift
onFID(sendToAnalytics); // First Input Delay
onLCP(sendToAnalytics); // Largest Contentful Paint
onFCP(sendToAnalytics); // First Contentful Paint
onTTFB(sendToAnalytics); // Time to First Byte
```

### Performance Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms

---

## Bundle Optimization

### Analyze Bundle

```bash
pnpm add -D @next/bundle-analyzer
```

```typescript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // config
})

// Run analysis
ANALYZE=true pnpm build
```

### Tree Shaking

```typescript
// ✅ Good: Named imports
import { Button } from "@/components/ui/button";

// ❌ Bad: Imports everything
import * as UI from "@/components/ui";
```

### Remove Unused Dependencies

```bash
# Find unused dependencies
pnpm dlx depcheck

# Remove unused
pnpm remove unused-package
```

---

## Code Splitting

### Route-Based Splitting

```typescript
// Automatic with TanStack Start!
// Each route file is a separate chunk
export const Route = createFileRoute("/dashboard")({
  component: Dashboard, // Automatically code-split
});
```

### Component-Based Splitting

```typescript
// src/components/HeavyChart.tsx
import { lazy, Suspense } from "react";

const HeavyChart = lazy(() => import("./HeavyChartImpl"));

export function ChartWrapper() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart />
    </Suspense>
  );
}
```

### Dynamic Imports

```typescript
// Load on interaction
function Dashboard() {
  const [showChart, setShowChart] = useState(false);
  const [Chart, setChart] = useState(null);

  const loadChart = async () => {
    const module = await import("./Chart");
    setChart(() => module.Chart);
    setShowChart(true);
  };

  return (
    <div>
      <button onClick={loadChart}>Show Chart</button>
      {showChart && Chart && <Chart />}
    </div>
  );
}
```

---

## Image Optimization

### Next.js Image Component

```typescript
import Image from "next/image";

function ProductCard({ product }) {
  return (
    <div>
      <Image
        src={product.image}
        alt={product.name}
        width={300}
        height={300}
        priority={false} // Lazy load by default
        placeholder="blur"
        blurDataURL={product.blurHash}
      />
    </div>
  );
}
```

### Responsive Images

```typescript
<Image
  src="/product.jpg"
  alt="Product"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  fill
  style={{ objectFit: "cover" }}
/>
```

### WebP/AVIF Conversion

```bash
# Install sharp for automatic format conversion
pnpm add sharp
```

---

## Caching Strategies

### HTTP Caching Headers

```typescript
// src/lib/api/assets.ts
export const getStaticAsset = createServerFn().handler(
  async ({ request, response }) => {
    // Cache for 1 year (immutable assets)
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    return asset;
  }
);

export const getDynamicContent = createServerFn().handler(
  async ({ request, response }) => {
    // Cache for 5 minutes, revalidate in background
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=60"
    );

    return content;
  }
);
```

### TanStack Query Caching

```typescript
useQuery({
  queryKey: ["user", userId],
  queryFn: () => getUser({ userId }),
  staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
  gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
});
```

### Redis Caching

```typescript
// src/lib/cache/redis.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 300 // 5 minutes
): Promise<T> {
  // Try cache first
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  // Fetch and cache
  const fresh = await fetcher();
  await redis.setex(key, ttl, fresh);

  return fresh;
}

// Usage
export const getPopularPosts = createServerFn().handler(async () => {
  return getCachedData(
    "popular-posts",
    () => db.post.findMany({ where: { views: { gt: 1000 } } }),
    600 // 10 minutes
  );
});
```

---

## Database Optimization

### Efficient Queries

```typescript
// ✅ Good: Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// ❌ Bad: Fetches all fields
const users = await prisma.user.findMany();
```

### Batch Queries

```typescript
// ✅ Good: Single query with includes
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    posts: { take: 10 },
    profile: true,
  },
});

// ❌ Bad: Multiple queries
const user = await prisma.user.findUnique({ where: { id: userId } });
const posts = await prisma.post.findMany({
  where: { authorId: userId },
  take: 10,
});
const profile = await prisma.profile.findUnique({ where: { userId } });
```

### Database Indexing

```prisma
model Post {
  id        String   @id @default(uuid())
  title     String
  slug      String   @unique   // Index for lookups
  authorId  String
  published Boolean

  // Composite index for common queries
  @@index([authorId, published])
  @@index([published, createdAt(sort: Desc)])
}
```

### Connection Pooling

```typescript
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POOLED, // Use connection pooler
    },
  },
});
```

---

## Performance Monitoring

### Server Timing API

```typescript
export const performanceMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const startTime = performance.now();

    const response = await next();

    const duration = performance.now() - startTime;

    // Add Server-Timing header
    response.headers.set("Server-Timing", `total;dur=${duration.toFixed(2)}`);

    return response;
  }
);
```

### Performance Budgets

```typescript
// lighthouse-budget.json
{
  "resourceSizes": [
    { "resourceType": "script", "budget": 300 },
    { "resourceType": "image", "budget": 500 },
    { "resourceType": "stylesheet", "budget": 100 }
  ],
  "timings": [
    { "metric": "interactive", "budget": 3000 },
    { "metric": "first-contentful-paint", "budget": 1500 }
  ]
}
```

---

## Best Practices

### 1. Lazy Load Heavy Components

```typescript
// ✅ Good: Lazy load
const AdminPanel = lazy(() => import("./AdminPanel"));

// ❌ Bad: Import everything upfront
import { AdminPanel } from "./AdminPanel";
```

### 2. Optimize Re-Renders

```typescript
// ✅ Good: Memoize expensive computations
const expensiveValue = useMemo(() => {
  return heavyComputation(data);
}, [data]);

// ✅ Good: Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### 3. Use Virtualization for Long Lists

```bash
pnpm add @tanstack/react-virtual
```

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: "400px", overflow: "auto" }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Summary

- ✅ Core Web Vitals monitoring
- ✅ Bundle optimization and analysis
- ✅ Code splitting strategies
- ✅ Image optimization
- ✅ Caching at multiple levels
- ✅ Database query optimization
- ✅ Performance monitoring
- ✅ Best practices

**Module 11 Complete!**
