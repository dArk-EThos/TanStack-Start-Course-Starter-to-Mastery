# Module 3: Exercises

## Overview

Practice building full-stack features with type-safe server functions. These exercises progressively increase in complexity, helping you master server-side development with TanStack Start.

## 🎯 Learning Objectives

By completing these exercises, you will:

- Build complete CRUD APIs
- Validate complex inputs with Zod
- Handle errors professionally
- Implement authentication patterns
- Create production-ready server functions

---

## Exercise 1: Task Manager API 📝

**Difficulty**: Beginner-Intermediate  
**Time**: 90-120 minutes

### Requirements

Build a complete task management API with full CRUD operations.

#### Features to Implement:

1. **Create Task** - Server function to create new tasks
2. **Get All Tasks** - Fetch all tasks with filtering
3. **Get Task by ID** - Fetch single task
4. **Update Task** - Update task details
5. **Delete Task** - Remove a task
6. **Toggle Complete** - Mark task as complete/incomplete

#### Data Model:

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Technical Requirements:

✅ Use Zod for all input validation  
✅ Implement proper error handling  
✅ Type-safe server functions  
✅ Handle not found cases  
✅ Validate data before database operations

### Validation Schemas

```typescript
// src/lib/schemas/task.ts
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000).optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.date().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskIdSchema = z.object({
  id: z.string().uuid("Invalid task ID"),
});
```

### Server Functions to Create

```typescript
// src/lib/api/tasks.ts

// 1. Create
export const createTask = createServerFn({ method: "POST" })
  .inputValidator(createTaskSchema)
  .handler(async ({ data }) => {
    // Implement
  });

// 2. Get all
export const getTasks = createServerFn({ method: "GET" }).handler(async () => {
  // Implement
});

// 3. Get by ID
export const getTask = createServerFn({ method: "GET" })
  .inputValidator(taskIdSchema)
  .handler(async ({ data }) => {
    // Implement with not found handling
  });

// 4. Update
export const updateTask = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      ...updateTaskSchema.shape,
    })
  )
  .handler(async ({ data }) => {
    // Implement
  });

// 5. Delete
export const deleteTask = createServerFn({ method: "POST" })
  .inputValidator(taskIdSchema)
  .handler(async ({ data }) => {
    // Implement with redirect
  });
```

### Hints

<details>
<summary>Mock database hint</summary>

```typescript
// src/lib/db/tasks.ts
let tasks: Task[] = [];

export const db = {
  task: {
    create: (data: CreateTask) => {
      const task = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      tasks.push(task);
      return task;
    },
    findMany: () => tasks,
    findUnique: (id: string) => tasks.find((t) => t.id === id),
    update: (id: string, data: Partial<Task>) => {
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return null;
      tasks[index] = { ...tasks[index], ...data, updatedAt: new Date() };
      return tasks[index];
    },
    delete: (id: string) => {
      tasks = tasks.filter((t) => t.id !== id);
    },
  },
};
```

</details>

### Bonus Challenges 🌟

- Add filtering by status and priority
- Implement search functionality
- Add pagination
- Create batch update operation
- Add task dependencies
- Implement task categories/tags

---

## Exercise 2: Blog Platform with Auth 📰

**Difficulty**: Intermediate-Advanced  
**Time**: 120-180 minutes

### Requirements

Build a blog platform with user authentication and authorization.

#### Features:

1. **User Registration** - Create account with validation
2. **User Login** - Authenticate and create session
3. **Create Post** - Authenticated users can create posts
4. **Update Post** - Authors can edit their own posts
5. **Delete Post** - Authors can delete their own posts
6. **Publish/Unpublish** - Control post visibility

#### Data Models:

```typescript
interface User {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: "user" | "admin";
  createdAt: Date;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Technical Requirements:

✅ Hash passwords with bcrypt  
✅ Session-based authentication  
✅ Protected server functions  
✅ Role-based access control  
✅ Soft deletes for posts  
✅ Generate slugs automatically

### Validation Schemas

```typescript
// src/lib/schemas/auth.ts
export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Must contain uppercase, lowercase, and number"
    ),
  name: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// src/lib/schemas/post.ts
export const createPostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(100),
  excerpt: z.string().max(300).optional(),
  published: z.boolean().default(false),
});
```

### Auth Helper

```typescript
// src/lib/auth/session.ts
interface Session {
  userId: string;
  createdAt: Date;
}

const sessions = new Map<string, Session>();

export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, {
    userId,
    createdAt: new Date(),
  });
  return sessionId;
}

export async function getSession(sessionId?: string): Promise<Session | null> {
  if (!sessionId) return null;
  return sessions.get(sessionId) || null;
}

export async function requireAuth(): Promise<string> {
  const sessionId = getCookie("sessionId");
  const session = await getSession(sessionId);

  if (!session) {
    throw redirect({ to: "/login" });
  }

  return session.userId;
}
```

### Server Functions

```typescript
// src/lib/api/auth.ts
export const register = createServerFn({ method: "POST" })
  .inputValidator(registerSchema)
  .handler(async ({ data }) => {
    // Check if user exists
    // Hash password
    // Create user
    // Create session
    // Redirect to dashboard
  });

export const login = createServerFn({ method: "POST" })
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    // Find user by email
    // Verify password
    // Create session
    // Redirect
  });

// src/lib/api/posts.ts
export const createPost = createServerFn({ method: "POST" })
  .inputValidator(createPostSchema)
  .handler(async ({ data }) => {
    const userId = await requireAuth();
    // Create post with userId
  });

export const updatePost = createServerFn({ method: "POST" })
  .inputValidator(/* schema */)
  .handler(async ({ data }) => {
    const userId = await requireAuth();
    const post = await getPost(data.id);

    // Check if user owns post
    if (post.authorId !== userId) {
      throw new UnauthorizedError("You cannot edit this post");
    }

    // Update post
  });
```

### Bonus Challenges 🌟

- Add email verification
- Implement password reset flow
- Add comments system
- Implement likes/reactions
- Add markdown support for posts
- Create admin panel

---

## Exercise 3: E-Commerce Checkout Flow 💳

**Difficulty**: Advanced  
**Time**: 180+ minutes

### Requirements

Build a complete e-commerce checkout flow with payment processing.

#### Features:

1. **Add to Cart** - Manage shopping cart
2. **Update Quantity** - Modify cart items
3. **Apply Coupon** - Discount codes
4. **Validate Address** - Shipping address validation
5. **Calculate Shipping** - Based on address
6. **Process Payment** - Mock payment gateway
7. **Create Order** - Finalize purchase

#### Data Models:

```typescript
interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  createdAt: Date;
}
```

#### Technical Requirements:

✅ Multi-step validation  
✅ Transaction safety  
✅ Inventory checks  
✅ Price calculations  
✅ Coupon validation  
✅ Idempotent operations

### Validation Schemas

```typescript
const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  country: z.string().default("US"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
});

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: z.enum(["card", "paypal"]),
  couponCode: z.string().optional(),
});
```

### Bonus Challenges 🌟

- Add inventory management
- Implement webhooks for payment status
- Add order tracking
- Create refund flow
- Implement abandoned cart recovery
- Add gift cards support

---

## Solutions

Solutions available in [`solutions/`](./solutions/):

- [`ex1-task-manager/`](./solutions/ex1-task-manager/)
- [`ex2-blog-auth/`](./solutions/ex2-blog-auth/)
- [`ex3-checkout/`](./solutions/ex3-checkout/)

---

## Self-Assessment

After completing exercises, you should:

- [ ] Create validated server functions
- [ ] Handle authentication flows
- [ ] Implement proper error handling
- [ ] Use Zod for complex validation
- [ ] Build secure CRUD operations
- [ ] Handle redirects appropriately
- [ ] Write production-ready code

---

## Next Steps

**→ Continue to** [Module 4: Data Fetching with TanStack Query](../../module-04-tanstack-query/)

Excellent work mastering server functions! 🎉
