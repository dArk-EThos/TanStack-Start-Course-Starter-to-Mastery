# Module 3.2: Input Validation with Zod

## Table of Contents

1. [Introduction](#introduction)
2. [Why Validate Inputs?](#why-validate-inputs)
3. [Setting Up Zod](#setting-up-zod)
4. [Basic Input Validation](#basic-input-validation)
5. [Advanced Validation Patterns](#advanced-validation-patterns)
6. [Custom Error Messages](#custom-error-messages)
7. [Transforming Data](#transforming-data)
8. [Real-World Examples](#real-world-examples)
9. [Best Practices](#best-practices)
10. [Next Steps](#next-steps)

---

## Introduction

Input validation is critical for secure, reliable server functions. **Zod** provides type-safe schema validation with excellent TypeScript integration.

> [!IMPORTANT]
> Never trust client input! Always validate on the server, even if you validate on the client too.

---

## Why Validate Inputs?

### Security

```typescript
// ❌ Dangerous: No validation
export const deleteUser = createServerFn({ method: "POST" }).handler(
  async ({ userId }) => {
    // userId could be anything! SQL injection risk, etc.
    await db.user.delete({ where: { id: userId } });
  }
);

// ✅ Safe: Validated input
export const deleteUser = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId: z.string().uuid(), // Must be valid UUID
    })
  )
  .handler(async ({ data }) => {
    await db.user.delete({ where: { id: data.userId } });
  });
```

### Type Safety

```typescript
// Without validation:
const result = await createUser({ data: { age: "25" } }); // String instead of number!

// With validation:
const result = await createUser({ data: { age: "25" } });
// ❌ TypeScript error: Type 'string' is not assignable to type 'number'
```

### Better Error Messages

```typescript
// Without validation:
// "Database error: invalid input syntax for type uuid"

// With validation:
// "userId must be a valid UUID"
```

---

## Setting Up Zod

### Installation

```bash
pnpm add zod
```

### Basic Import

```typescript
import { z } from "zod";
```

---

## Basic Input Validation

### Validating Primitives

```typescript
import { createServerFn } from "@tanstack/start";
import { z } from "zod";

// String validation
const greetSchema = z.object({
  name: z.string(),
});

export const greet = createServerFn({ method: "POST" })
  .inputValidator(greetSchema)
  .handler(async ({ data }) => {
    // data.name is guaranteed to be a string
    return `Hello, ${data.name}!`;
  });

// Usage
await greet({ data: { name: "John" } }); // ✅ OK
await greet({ data: { name: 123 } }); // ❌ Type error
await greet({ data: {} }); // ❌ Validation error
```

### Number Validation

```typescript
const createProductSchema = z.object({
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().nonnegative(),
});

export const createProduct = createServerFn({ method: "POST" })
  .inputValidator(createProductSchema)
  .handler(async ({ data }) => {
    // data.price is a positive number
    // data.quantity is a non-negative integer
    return await db.product.create({ data });
  });
```

### Boolean Validation

```typescript
const updateSettingsSchema = z.object({
  notifications: z.boolean(),
  darkMode: z.boolean(),
});

export const updateSettings = createServerFn({ method: "POST" })
  .inputValidator(updateSettingsSchema)
  .handler(async ({ data }) => {
    return await db.settings.update({ data });
  });
```

### Enum Validation

```typescript
const filterProductsSchema = z.object({
  category: z.enum(["electronics", "clothing", "food"]),
  sortBy: z.enum(["price", "name", "rating"]),
});

export const filterProducts = createServerFn({ method: "POST" })
  .inputValidator(filterProductsSchema)
  .handler(async ({ data }) => {
    // data.category is one of the allowed values
    return await db.product.findMany({
      where: { category: data.category },
      orderBy: { [data.sortBy]: "asc" },
    });
  });
```

---

## Advanced Validation Patterns

### Optional Fields

```typescript
const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  age: z.number().int().optional(),
});

export const updateUser = createServerFn({ method: "POST" })
  .inputValidator(updateUserSchema)
  .handler(async ({ data }) => {
    // Only update provided fields
    return await db.user.update({
      where: { id: userId },
      data: data, // Only includes provided fields
    });
  });
```

### Nullable vs Optional

```typescript
const schema = z.object({
  // Optional: field can be missing
  bio: z.string().optional(),
  // bio?: string

  // Nullable: field must exist but can be null
  profilePicture: z.string().nullable(),
  // profilePicture: string | null

  // Both: field can be missing or null
  middleName: z.string().nullable().optional(),
  // middleName?: string | null
});
```

### Default Values

```typescript
const createPostSchema = z.object({
  title: z.string(),
  content: z.string(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export const createPost = createServerFn({ method: "POST" })
  .inputValidator(createPostSchema)
  .handler(async ({ data }) => {
    // data.published is false if not provided
    // data.tags is [] if not provided
    return await db.post.create({ data });
  });
```

### Array Validation

```typescript
const bulkCreateSchema = z.object({
  users: z
    .array(
      z.object({
        name: z.string(),
        email: z.string().email(),
      })
    )
    .min(1)
    .max(100), // At least 1, at most 100
});

export const bulkCreateUsers = createServerFn({ method: "POST" })
  .inputValidator(bulkCreateSchema)
  .handler(async ({ data }) => {
    return await db.user.createMany({
      data: data.users,
    });
  });
```

### Nested Objects

```typescript
const createOrderSchema = z.object({
  customer: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      })
    )
    .min(1),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator(createOrderSchema)
  .handler(async ({ data }) => {
    // Fully validated nested structure
    return await db.order.create({
      data: {
        customer: { create: data.customer },
        items: { create: data.items },
        shippingAddress: { create: data.shippingAddress },
      },
    });
  });
```

---

## Custom Error Messages

### Field-Level Messages

```typescript
const schema = z.object({
  email: z.string().email("Please enter a valid email address"),

  age: z
    .number()
    .int("Age must be a whole number")
    .min(18, "You must be at least 18 years old")
    .max(120, "Please enter a valid age"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number"
    ),
});
```

### Custom Refinements

```typescript
const passwordChangeSchema = z
  .object({
    newPassword: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"], // Error appears on this field
  });

export const changePassword = createServerFn({ method: "POST" })
  .inputValidator(passwordChangeSchema)
  .handler(async ({ data }) => {
    // Passwords are guaranteed to match
    await updatePassword(data.newPassword);
  });
```

### Multiple Refinements

```typescript
const bookingSchema = z
  .object({
    checkIn: z.date(),
    checkOut: z.date(),
    guests: z.number().int().positive(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  })
  .refine((data) => data.checkIn > new Date(), {
    message: "Check-in must be in the future",
    path: ["checkIn"],
  })
  .refine((data) => data.guests <= 10, {
    message: "Maximum 10 guests per booking",
    path: ["guests"],
  });
```

---

## Transforming Data

### Basic Transforms

```typescript
const schema = z.object({
  // Trim whitespace
  name: z.string().trim(),

  // Lowercase
  email: z.string().email().toLowerCase(),

  // Parse string to date
  birthdate: z.string().transform((val) => new Date(val)),

  // Parse string to number
  age: z.string().transform((val) => parseInt(val, 10)),
});
```

### Complex Transforms

```typescript
const productSchema = z.object({
  name: z.string().trim(),
  price: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive()),

  tags: z
    .string()
    .transform((val) => val.split(",").map((t) => t.trim()))
    .pipe(z.array(z.string().min(1))),
});

export const createProduct = createServerFn({ method: "POST" })
  .inputValidator(productSchema)
  .handler(async ({ data }) => {
    // data.price is a number
    // data.tags is an array of strings
    return await db.product.create({ data });
  });
```

### Preprocessing

```typescript
const schema = z.preprocess(
  // Convert "true"/"false" strings to booleans
  (val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  },
  z.boolean()
);
```

---

## Real-World Examples

### User Registration

```typescript
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password must contain uppercase, lowercase, number, and special character"
    ),

  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long")
    .trim(),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long")
    .trim(),

  dateOfBirth: z
    .string()
    .transform((val) => new Date(val))
    .refine(
      (date) => {
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= 18;
      },
      { message: "Must be at least 18 years old" }
    ),

  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export const registerUser = createServerFn({ method: "POST" })
  .inputValidator(registerSchema)
  .handler(async ({ data }) => {
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
      },
    });

    return { id: user.id, email: user.email };
  });
```

### Blog Post Creation

```typescript
const createPostSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters")
    .trim(),

  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens"
    )
    .optional()
    .transform((val) => val || generateSlug()),

  content: z.string().min(100, "Content must be at least 100 characters"),

  excerpt: z
    .string()
    .max(200, "Excerpt must be less than 200 characters")
    .optional(),

  tags: z.array(z.string().min(1)).max(5, "Maximum 5 tags").default([]),

  featured: z.boolean().default(false),

  publishedAt: z.date().optional(),

  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const createPost = createServerFn({ method: "POST" })
  .inputValidator(createPostSchema)
  .handler(async ({ data }) => {
    const post = await db.post.create({
      data: {
        ...data,
        author: { connect: { id: currentUserId } },
      },
    });

    return post;
  });
```

### E-Commerce Checkout

```typescript
const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1).max(99),
    })
  ).min(1, 'Cart cannot be empty'),

  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2), // US state code
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z string().default('US'),
  }),

  billingAddress: z.object({
    // Same as shipping
  }).optional(), // Use shipping if not provided

  paymentMethod: z.enum(['card', 'paypal', 'apple_pay']),

  couponCode: z.string().optional(),
})

export const checkout = createServerFn({ method: 'POST' })
  .inputValidator(checkoutSchema)
  .handler(async ({ data }) => {
    // Calculate totals
    const subtotal = await calculateSubtotal(data.items)
    const discount = await applyCoupon(data.couponCode)
    const shipping = await calculateShipping(data.shippingAddress)
    const tax = await calculateTax(subtotal, data.shippingAddress)
    const total = subtotal - discount + shipping + tax

    // Process payment
    const payment = await processPayment({
      amount: total,
      method: data.paymentMethod,
    })

    // Create order
    const order = await db.order.create({
      data: {
        items: { create: data.items },
        shippingAddress: { create: data.shippingAddress },
        billingAddress: { create: data.billingAddress || data.shippingAddress },
        paymentId: payment.id,
        total,
      },
    })

    return { orderId: order.id, total }
  })
```

---

## Best Practices

### 1. Reuse Schemas

```typescript
// ✅ Good: Define once, reuse
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string(),
});

const userSchema = z.object({
  name: z.string(),
  homeAddress: addressSchema,
  workAddress: addressSchema.optional(),
});
```

### 2. Partial Schemas for Updates

```typescript
const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().int(),
});

// For updates: all fields optional
const updateUserSchema = createUserSchema.partial();

export const updateUser = createServerFn({ method: "POST" })
  .inputValidator(updateUserSchema)
  .handler(async ({ data }) => {
    // Only provided fields are updated
    return await db.user.update({ where: { id }, data });
  });
```

### 3. Extend Schemas

```typescript
const baseUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

const adminUserSchema = baseUserSchema.extend({
  role: z.enum(["admin", "superadmin"]),
  permissions: z.array(z.string()),
});
```

### 4. Discriminated Unions

```typescript
const eventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("click"),
    element: z.string(),
    timestamp: z.date(),
  }),
  z.object({
    type: z.literal("page_view"),
    url: z.string(),
    referrer: z.string().optional(),
  }),
  z.object({
    type: z.literal("purchase"),
    amount: z.number(),
    currency: z.string(),
  }),
]);
```

### 5. Error Handling

```typescript
export const createUser = createServerFn({ method: "POST" })
  .inputValidator(userSchema)
  .handler(async ({ data }) => {
    try {
      return await db.user.create({ data });
    } catch (error) {
      if (error.code === "P2002") {
        throw new Error("Email already exists");
      }
      throw error;
    }
  });
```

---

## Next Steps

Now that you can validate inputs, let's learn proper error handling and redirects!

**→ Continue to** [Module 3.3: Error Handling & Redirects](./03-error-handling.md)

---

## Summary

In this lesson, you learned:

- ✅ Why input validation is critical for security
- ✅ Setting up and using Zod for validation
- ✅ Validating primitives, objects, and arrays
- ✅ Advanced patterns (optional, nullable, defaults)
- ✅ Custom error messages and refinements
- ✅ Transforming and preprocessing data
- ✅ Real-world validation examples
- ✅ Best practices for schema organization

**Up Next**: Handle errors gracefully and implement redirects!
