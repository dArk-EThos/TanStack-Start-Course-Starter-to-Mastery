# Module 8.1: Database Integration with Prisma

## Table of Contents

1. [Introduction](#introduction)
2. [Prisma Setup](#prisma-setup)
3. [Schema Definition](#schema-definition)
4. [CRUD Operations](#crud-operations)
5. [Relations & Joins](#relations--joins)
6. [Transactions](#transactions)
7. [Migrations](#migrations)
8. [Connection Pooling](#connection-pooling)
9. [Best Practices](#best-practices)
10. [Next Steps](#next-steps)

---

## Introduction

Prisma is a modern ORM that provides type-safe database access. It's perfect for TanStack Start applications.

> [!TIP]
> Prisma generates TypeScript types from your database schema automatically!

---

## Prisma Setup

### Installation

```bash
pnpm add @prisma/client
pnpm add -D prisma
```

### Initialize Prisma

```bash
npx prisma init
```

This creates:

- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables

### Configure Database

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

---

## Schema Definition

### Basic Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts     Post[]
  profile   Profile?
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  published Boolean  @default(false)
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author    User     @relation(fields: [authorId], references: [id])
}

model Profile {
  id     String @id @default(uuid())
  bio    String?
  avatar String?
  userId String @unique

  user   User   @relation(fields: [userId], references: [id])
}
```

### Generate Client

```bash
npx prisma generate
```

### Run Migrations

```bash
npx prisma migrate dev --name init
```

---

## CRUD Operations

### Prisma Client Setup

```typescript
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### Create

```typescript
// src/lib/api/users.ts
import { createServerFn } from "@tanstack/start";
import { prisma } from "@/lib/db";

export const createUser = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.hashedPassword,
      },
    });

    return user;
  }
);
```

### Read

```typescript
// Get all users
export const getUsers = createServerFn().handler(async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
});

// Get single user
export const getUser = createServerFn().handler(
  async ({ userId }: { userId: string }) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: true,
        profile: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
);
```

### Update

```typescript
export const updateUser = createServerFn({ method: "POST" }).handler(
  async ({ userId, data }) => {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
      },
    });
  }
);
```

### Delete

```typescript
export const deleteUser = createServerFn({ method: "POST" }).handler(
  async ({ userId }: { userId: string }) => {
    await prisma.user.delete({
      where: { id: userId },
    });
  }
);
```

---

## Relations & Joins

### One-to-Many

```typescript
// Get user with posts
const userWithPosts = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    posts: {
      orderBy: { createdAt: "desc" },
      take: 10,
    },
  },
});

// Create post for user
await prisma.post.create({
  data: {
    title: "My Post",
    content: "Hello world",
    author: {
      connect: { id: userId },
    },
  },
});
```

### One-to-One

```typescript
// Create user with profile
await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "John",
    password: "hashed",
    profile: {
      create: {
        bio: "Software developer",
        avatar: "https://...",
      },
    },
  },
});
```

### Many-to-Many

```prisma
model Post {
  id   String @id @default(uuid())
  tags Tag[]  @relation("PostTags")
}

model Tag {
  id    String @id @default(uuid())
  name  String @unique
  posts Post[] @relation("PostTags")
}
```

```typescript
// Create post with tags
await prisma.post.create({
  data: {
    title: "My Post",
    content: "Content",
    tags: {
      connectOrCreate: [
        {
          where: { name: "TypeScript" },
          create: { name: "TypeScript" },
        },
        {
          where: { name: "React" },
          create: { name: "React" },
        },
      ],
    },
  },
});
```

---

## Transactions

### Basic Transaction

```typescript
export const transferFunds = createServerFn({ method: "POST" }).handler(
  async ({ fromId, toId, amount }) => {
    await prisma.$transaction(async (tx) => {
      // Deduct from sender
      await tx.account.update({
        where: { id: fromId },
        data: { balance: { decrement: amount } },
      });

      // Add to receiver
      await tx.account.update({
        where: { id: toId },
        data: { balance: { increment: amount } },
      });
    });
  }
);
```

### Interactive Transactions

```typescript
export const createOrderWithInventory = createServerFn({
  method: "POST",
}).handler(async ({ productId, quantity }) => {
  return await prisma.$transaction(async (tx) => {
    // Check inventory
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.stock < quantity) {
      throw new Error("Insufficient stock");
    }

    // Create order
    const order = await tx.order.create({
      data: {
        productId,
        quantity,
        total: product.price * quantity,
      },
    });

    // Update inventory
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    return order;
  });
});
```

---

## Migrations

### Create Migration

```bash
npx prisma migrate dev --name add_user_role
```

### Apply Migrations in Production

```bash
npx prisma migrate deploy
```

### Reset Database

```bash
npx prisma migrate reset
```

---

## Connection Pooling

### With PgBouncer

```env
# Direct connection
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Pooled connection
DATABASE_URL_POOLED="postgresql://user:password@localhost:6543/mydb?pgbouncer=true"
```

```typescript
// src/lib/db.ts
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POOLED,
    },
  },
});
```

---

## Best Practices

### 1. Use Select for Performance

```typescript
// ✅ Good: Only select needed fields
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

### 2. Batch Queries

```typescript
// ✅ Good: Single query with include
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    posts: true,
    profile: true,
  },
});

// ❌ Bad: Multiple queries
const user = await prisma.user.findUnique({ where: { id: userId } });
const posts = await prisma.post.findMany({ where: { authorId: userId } });
const profile = await prisma.profile.findUnique({ where: { userId } });
```

### 3. Handle Errors Properly

```typescript
// ✅ Good: Check for unique constraint violations
try {
  await prisma.user.create({ data });
} catch (error) {
  if (error.code === "P2002") {
    throw new Error("Email already exists");
  }
  throw error;
}
```

---

## Next Steps

**→ Continue to** [Module 8.2: Real-Time Features with WebSockets](./02-websockets.md)

---

## Summary

- ✅ Prisma setup and configuration
- ✅ Schema definition and migrations
- ✅ CRUD operations with type safety
- ✅ Relations and joins
- ✅ Transactions for data consistency
- ✅ Connection pooling
- ✅ Best practices

**Up Next**: Real-time features with WebSockets!
