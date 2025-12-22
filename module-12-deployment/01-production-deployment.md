# Module 12.1: Production Builds & Deployment

## Table of Contents

1. [Introduction](#introduction)
2. [Production Build](#production-build)
3. [Environment Variables](#environment-variables)
4. [Vercel Deployment](#vercel-deployment)
5. [Docker Deployment](#docker-deployment)
6. [CI/CD with GitHub Actions](#cicd-with-github-actions)
7. [Monitoring & Logging](#monitoring--logging)
8. [Best Practices](#best-practices)
9. [Summary](#summary)

---

## Introduction

Deploying TanStack Start applications to production requires proper configuration, optimization, and monitoring.

---

## Production Build

### Build Command

```bash
pnpm run build
```

### Build Configuration

```typescript
// app.config.ts
import { defineConfig } from "@tanstack/start/config";

export default defineConfig({
  server: {
    preset: "node-server",
  },
  vite: {
    build: {
      minify: "terser",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
          },
        },
      },
    },
  },
});
```

### Analyze Bundle

```bash
pnpm add -D rollup-plugin-visualizer

# Build with analysis
pnpm run build --analyze
```

---

## Environment Variables

### Environment Setup

```bash
# .env.production
DATABASE_URL=postgresql://...
API_URL=https://api.example.com
SENTRY_DSN=https://...
```

### Type-Safe Environment

```typescript
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string().url(),
  API_URL: z.string().url(),
  SENTRY_DSN: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
```

---

## Vercel Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### vercel.json Configuration

```json
{
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "framework": null,
  "outputDirectory": ".output/public"
}
```

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.output ./
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", "server/index.mjs"]
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://db:5432/myapp
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

---

## CI/CD with GitHub Actions

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm install -g pnpm && pnpm install

      - name: Run tests
        run: pnpm test

      - name: Run linter
        run: pnpm lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

---

## Monitoring & Logging

### Sentry Integration

```typescript
// src/lib/monitoring/sentry.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export { Sentry };
```

### Error Tracking

```typescript
// Use in server functions
export const riskyOperation = createServerFn().handler(async () => {
  try {
    return await doSomething();
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
});
```

---

## Best Practices

### 1. Use Environment Variables

```typescript
// ✅ Good: Environment-specific config
const apiUrl = process.env.API_URL;

// ❌ Bad: Hardcoded values
const apiUrl = "https://api.example.com";
```

### 2. Enable Source Maps in Production

```typescript
// ✅ Good: Easier debugging
vite: {
  build: {
    sourcemap: true;
  }
}
```

### 3. Set Up Health Checks

```typescript
// src/routes/api/health.ts
export const GET = createServerFn().handler(async () => {
  const dbOk = await checkDatabase();

  return {
    status: dbOk ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
  };
});
```

---

## Summary

- ✅ Production builds and optimization
- ✅ Environment variable management
- ✅ Vercel deployment
- ✅ Docker containerization
- ✅ CI/CD pipelines
- ✅ Monitoring and logging

**Course Complete!** 🎉 You've mastered TanStack Start!
