# Module 3: Server Functions & Data Handling

Master type-safe server functions and build robust full-stack features with TanStack Start.

## 🎯 Learning Objectives

By the end of this module, you will:

- ✅ Create type-safe server functions
- ✅ Validate inputs with Zod schemas
- ✅ Handle errors and implement redirects
- ✅ Work with form data and file uploads
- ✅ Implement CRUD operations
- ✅ Build secure, production-ready APIs

## 📚 Lessons

### [3.1 Server Functions Basics](./01-server-functions-basics.md)

**Time:** 60 minutes

Learn the fundamentals of TanStack Start's server functions.

**Topics:**

- What are server functions and why use them?
- Creating your first server function
- HTTP methods (GET vs POST)
- Type safety across the network
- Where to call server functions
- Server-only code and automatic code splitting

**Key Concept:** Type-safe RPCs that feel like magic

---

### [3.2 Input Validation with Zod](./02-input-validation.md)

**Time:** 75 minutes

Master input validation for secure, reliable server functions.

**Topics:**

- Why validate inputs (security, type safety)
- Zod setup and basic validation
- Advanced patterns (optional, arrays, nested objects)
- Custom error messages and refinements
- Data transformation
- Real-world examples (registration, checkout)

**Key Concept:** Never trust client input - validate everything

---

### [3.3 Error Handling & Redirects](./03-error-handling.md)

**Time:** 60 minutes

Handle errors gracefully and control navigation flow.

**Topics:**

- Error handling basics
- Custom error types
- Validation error handling
- Redirects after server actions
- Not found errors
- Error boundaries
- Production error handling

**Key Concept:** Fail gracefully, log thoroughly

---

### [3.4 Practical Patterns](./04-practical-patterns.md)

**Time:** 45 minutes (Coming Soon)

Real-world patterns for common scenarios.

**Topics:**

- CRUD operations
- Pagination and filtering
- Batch operations
- File uploads
- Rate limiting
- Caching strategies

---

## 🛠️ Exercises

### [Exercise 1: Task Manager API](./exercises/README.md#exercise-1)

**Difficulty:** Beginner-Intermediate | **Time:** 90-120 min

Build a complete CRUD API for a task management system.

**Skills:**

- Creating server functions
- Input validation with Zod
- Error handling
- Type-safe operations

---

### [Exercise 2: Blog Platform with Auth](./exercises/README.md#exercise-2)

**Difficulty:** Intermediate-Advanced | **Time:** 120-180 min

Create a blog platform with authentication and authorization.

**Skills:**

- User authentication
- Protected server functions
- Role-based access control
- Complex validation
- Redirects and error handling

---

### [Exercise 3: E-Commerce Checkout Flow](./exercises/README.md#exercise-3)

**Difficulty:** Advanced | **Time:** 180+ min

Build a complete checkout flow with validation and payment processing.

**Skills:**

- Multi-step forms
- Complex nested validation
- Transaction handling
- Error recovery
- Production error handling

---

## 📖 Key Concepts

### Creating Server Functions

```typescript
import { createServerFn } from "@tanstack/start";

export const getUser = createServerFn().handler(async () => {
  // Server-only code
  return await db.user.findFirst();
});

// Call from anywhere!
const user = await getUser(); // Fully typed ✨
```

### Input Validation

```typescript
const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(18),
});

export const createUser = createServerFn({ method: "POST" })
  .inputValidator(schema)
  .handler(async ({ data }) => {
    // data is validated and typed!
    return await db.user.create({ data });
  });
```

### Error Handling

```typescript
export const getPost = createServerFn().handler(async ({ postId }) => {
  const post = await db.post.findUnique({ where: { id: postId } });

  if (!post) {
    throw notFound(); // 404 error
  }

  return post;
});
```

### Redirects

```typescript
export const deletePost = createServerFn({ method: "POST" }).handler(
  async ({ postId }) => {
    await db.post.delete({ where: { id: postId } });
    throw redirect({ to: "/posts" });
  }
);
```

---

## ✅ Self-Assessment

Before moving to Module 4, ensure you can:

- [ ] Create GET and POST server functions
- [ ] Add type-safe input validation with Zod
- [ ] Handle and throw custom errors
- [ ] Implement redirects after mutations
- [ ] Use server functions in loaders and components
- [ ] Validate complex nested data structures
- [ ] Handle errors in production
- [ ] Build complete CRUD operations

---

## 🎓 What's Next?

In **Module 4**, we'll integrate TanStack Query for powerful data fetching:

- Client-side caching with TanStack Query
- Optimistic updates
- Infinite scroll and pagination
- Real-time data synchronization

**→ Continue to** [Module 4: Data Fetching with TanStack Query](../module-04-tanstack-query/)

---

## 📚 Additional Resources

- [TanStack Start Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [Zod Documentation](https://zod.dev/)
- [Error Handling Patterns](https://tanstack.com/router/latest/docs/framework/react/guide/errors)
- [Form Validation Best Practices](https://zod.dev/patterns)

---

## 💡 Module Tips

> [!TIP] > **Validate Early**: Use Zod validation in server functions to catch bad data before it reaches your database

> [!IMPORTANT] > **Type Safety**: Let TypeScript guide you. If server function return types are unclear, add explicit type annotations.

> [!TIP] > **Error Messages**: Write error messages for users, not developers. Be specific and actionable.

> [!WARNING] > **Security**: Never expose sensitive error details or stack traces in production. Use environment checks.

> [!TIP] > **Logging**: Always log errors server-side with context. Use structured logging for better analysis.

---

**Estimated Module Completion Time:** 6-8 hours (including exercises)

You're building full-stack superpowers! 🚀
