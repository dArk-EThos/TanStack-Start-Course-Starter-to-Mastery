# Module 2.2: Route Parameters & Search Params

## Table of Contents

1. [Introduction](#introduction)
2. [Route Parameters Deep Dive](#route-parameters-deep-dive)
3. [Search Parameters](#search-parameters)
4. [Combining Route and Search Params](#combining-route-and-search-params)
5. [Type-Safe Parameters](#type-safe-parameters)
6. [Validation with Zod](#validation-with-zod)
7. [Navigation with Parameters](#navigation-with-parameters)
8. [Common Patterns](#common-patterns)
9. [Best Practices](#best-practices)
10. [Next Steps](#next-steps)

---

## Introduction

TanStack Router provides powerful, **type-safe** parameter handling for both route parameters (part of the URL path) and search parameters (query strings).

> [!IMPORTANT]
> TanStack Router's parameter handling is fully type-safe across your entire application. No more string-based URLs!

---

## Route Parameters Deep Dive

### Accessing Route Parameters

Route parameters are defined with `$` in file names and accessed via `useParams()`.

**File:** `src/routes/blog/$postId.tsx`

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/$postId")({
  component: BlogPost,
});

function BlogPost() {
  // Type-safe parameter access
  const { postId } = Route.useParams();

  return <h1>Post ID: {postId}</h1>;
}
```

### Multiple Route Parameters

**File:** `src/routes/users/$userId/posts/$postId.tsx`

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users/$userId/posts/$postId")({
  loader: async ({ params }) => {
    // Both params available in loader
    const { userId, postId } = params;
    return {
      user: await fetchUser(userId),
      post: await fetchPost(postId),
    };
  },
  component: UserPost,
});

function UserPost() {
  const data = Route.useLoaderData();
  const { userId, postId } = Route.useParams();

  return (
    <article>
      <h1>{data.post.title}</h1>
      <p>By User {userId}</p>
      <p>Post {postId}</p>
    </article>
  );
}
```

### Parameter Parsing

By default, all parameters are strings. You can parse them in your loader:

```typescript
export const Route = createFileRoute("/products/$productId")({
  loader: async ({ params }) => {
    // Parse to number if needed
    const productId = parseInt(params.productId, 10);

    if (isNaN(productId)) {
      throw new Error("Invalid product ID");
    }

    return await fetchProduct(productId);
  },
  component: Product,
});
```

---

## Search Parameters

Search parameters (query strings) are the `?key=value` part of URLs.

### Basic Search Params

```typescript
// URL: /products?category=electronics&sort=price

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/products")({
  component: Products,
});

function Products() {
  const search = Route.useSearch();

  console.log(search.category); // "electronics"
  console.log(search.sort); // "price"

  return <div>Products</div>;
}
```

### Defining Search Schema

For type safety, define a search schema:

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Define the schema
const productSearchSchema = z.object({
  category: z.string().optional(),
  sort: z.enum(["price", "name", "rating"]).optional(),
  page: z.number().int().positive().optional().default(1),
  perPage: z.number().int().positive().optional().default(20),
});

export const Route = createFileRoute("/products")({
  // Validate search params
  validateSearch: productSearchSchema,

  loader: async ({ search }) => {
    // search is now fully typed!
    const { category, sort, page, perPage } = search;

    return await fetchProducts({
      category,
      sort,
      page,
      perPage,
    });
  },

  component: Products,
});

function Products() {
  const search = Route.useSearch();
  const data = Route.useLoaderData();

  return (
    <div>
      <h1>Products</h1>
      {search.category && <p>Category: {search.category}</p>}
      <p>
        Page {search.page} of {data.totalPages}
      </p>
      {/* Render products */}
    </div>
  );
}
```

### Updating Search Params

Use the `useNavigate` hook to update search params:

```typescript
import { useNavigate } from "@tanstack/react-router";

function ProductFilters() {
  const navigate = useNavigate({ from: "/products" });
  const search = Route.useSearch();

  const handleCategoryChange = (category: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        category,
        page: 1, // Reset to page 1
      }),
    });
  };

  const handleSortChange = (sort: "price" | "name" | "rating") => {
    navigate({
      search: (prev) => ({ ...prev, sort }),
    });
  };

  return (
    <div>
      <select
        value={search.category || ""}
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="books">Books</option>
      </select>

      <select
        value={search.sort || "name"}
        onChange={(e) => handleSortChange(e.target.value as any)}
      >
        <option value="name">Name</option>
        <option value="price">Price</option>
        <option value="rating">Rating</option>
      </select>
    </div>
  );
}
```

---

## Combining Route and Search Params

You can use both route and search parameters together:

**File:** `src/routes/categories/$categoryId/products.tsx`

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  sort: z.enum(["price", "name"]).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  page: z.number().int().default(1),
});

export const Route = createFileRoute("/categories/$categoryId/products")({
  validateSearch: searchSchema,

  loader: async ({ params, search }) => {
    // Route param: params.categoryId
    // Search params: search.sort, search.minPrice, etc.
    return await fetchCategoryProducts({
      categoryId: params.categoryId,
      ...search,
    });
  },

  component: CategoryProducts,
});

function CategoryProducts() {
  const { categoryId } = Route.useParams();
  const search = Route.useSearch();
  const data = Route.useLoaderData();

  return (
    <div>
      <h1>Category {categoryId}</h1>
      <p>Sort: {search.sort || "name"}</p>
      <p>Page: {search.page}</p>
      {search.minPrice && <p>Min Price: ${search.minPrice}</p>}
      {search.maxPrice && <p>Max Price: ${search.maxPrice}</p>}

      {/* Render products */}
    </div>
  );
}
```

**Usage:**

```typescript
<Link
  to="/categories/$categoryId/products"
  params={{ categoryId: "electronics" }}
  search={{ sort: "price", minPrice: 100, maxPrice: 500, page: 1 }}
>
  Electronics (Price: $100-$500)
</Link>
```

---

## Type-Safe Parameters

TanStack Router ensures type safety across your entire app.

### Route Params Type Inference

```typescript
export const Route = createFileRoute("/users/$userId")({
  loader: async ({ params }) => {
    // params.userId is string (inferred)
    params.userId; // ✅ Type: string
    params.other; // ❌ Error: Property 'other' does not exist

    return await fetchUser(params.userId);
  },
});
```

### Search Params Type Safety

```typescript
const searchSchema = z.object({
  query: z.string(),
  page: z.number().int(),
  filters: z.array(z.string()).optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,

  component: Search,
});

function Search() {
  const search = Route.useSearch();

  search.query; // ✅ Type: string
  search.page; // ✅ Type: number
  search.filters; // ✅ Type: string[] | undefined
  search.invalid; // ❌ Error: Property 'invalid' does not exist
}
```

### Navigation Type Safety

```typescript
// ✅ Correct
<Link
  to="/blog/$postId"
  params={{ postId: '123' }}
/>

// ❌ TypeScript error: Missing required param
<Link to="/blog/$postId" />

// ❌ TypeScript error: Wrong param name
<Link
  to="/blog/$postId"
  params={{ id: '123' }}
/>

// ✅ Correct with search params
<Link
  to="/products"
  search={{ category: 'electronics', page: 1 }}
/>

// ❌ TypeScript error: Invalid search param type
<Link
  to="/products"
  search={{ page: '1' }} // Should be number
/>
```

---

## Validation with Zod

Zod provides runtime validation and type inference.

### Basic Validation

```typescript
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().min(1, "Query is required"),
  category: z.enum(["all", "posts", "users"]).default("all"),
  page: z.number().int().positive().default(1),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  component: Search,
});

// If validation fails, the route won't render
```

### Complex Validation

```typescript
const productSearchSchema = z
  .object({
    // String with constraints
    query: z
      .string()
      .min(2, "Minimum 2 characters")
      .max(100, "Maximum 100 characters")
      .optional(),

    // Enum
    sort: z.enum(["price-asc", "price-desc", "name", "rating"]).default("name"),

    // Number ranges
    minPrice: z.number().min(0, "Price must be positive").optional(),

    maxPrice: z.number().min(0).optional(),

    // Array of strings
    tags: z.array(z.string()).optional(),

    // Boolean
    inStock: z.boolean().optional(),

    // Date
    availableAfter: z.date().optional(),

    // Pagination
    page: z.number().int().positive().default(1),
    perPage: z.number().int().min(10).max(100).default(20),
  })
  .refine(
    (data) =>
      !data.maxPrice || !data.minPrice || data.maxPrice >= data.minPrice,
    { message: "Max price must be greater than min price" }
  );

type ProductSearch = z.infer<typeof productSearchSchema>;
```

### Transform During Validation

```typescript
const searchSchema = z.object({
  // Parse string to number
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().default(1)),

  // Parse comma-separated string to array
  tags: z
    .string()
    .transform((val) => val.split(",").filter(Boolean))
    .pipe(z.array(z.string()))
    .optional(),
});
```

---

## Navigation with Parameters

### Link Component

```typescript
import { Link } from '@tanstack/react-router'

// With route params
<Link
  to="/blog/$postId"
  params={{ postId: '123' }}
>
  View Post
</Link>

// With search params
<Link
  to="/products"
  search={{ category: 'electronics' }}
>
  Electronics
</Link>

// With both
<Link
  to="/categories/$categoryId/products"
  params={{ categoryId: 'electronics' }}
  search={{ sort: 'price' }}
>
  Electronics by Price
</Link>
```

### Programmatic Navigation

```typescript
import { useNavigate } from "@tanstack/react-router";

function ProductCard({ productId }: { productId: string }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({
      to: "/products/$productId",
      params: { productId },
    });
  };

  return <button onClick={handleClick}>View Product</button>;
}
```

### Updating Search Params Only

```typescript
function Pagination() {
  const navigate = useNavigate({ from: "/products" });
  const search = Route.useSearch();

  const goToPage = (page: number) => {
    navigate({
      search: (prev) => ({ ...prev, page }),
    });
  };

  return (
    <div>
      <button onClick={() => goToPage(search.page - 1)}>Previous</button>
      <span>Page {search.page}</span>
      <button onClick={() => goToPage(search.page + 1)}>Next</button>
    </div>
  );
}
```

---

## Common Patterns

### Pattern 1: Pagination

```typescript
// URL: /products?page=2&perPage=20

const searchSchema = z.object({
  page: z.number().int().positive().default(1),
  perPage: z.number().int().min(10).max(100).default(20),
});

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,

  loader: async ({ search }) => {
    const offset = (search.page - 1) * search.perPage;
    return await fetchProducts({
      limit: search.perPage,
      offset,
    });
  },

  component: Products,
});

function Products() {
  const navigate = useNavigate({ from: "/products" });
  const search = Route.useSearch();
  const data = Route.useLoaderData();

  return (
    <div>
      {/* Product list */}

      <Pagination
        currentPage={search.page}
        totalPages={Math.ceil(data.total / search.perPage)}
        onPageChange={(page) =>
          navigate({ search: (prev) => ({ ...prev, page }) })
        }
      />
    </div>
  );
}
```

### Pattern 2: Filtering & Sorting

```typescript
// URL: /products?category=electronics&sort=price&inStock=true

const searchSchema = z.object({
  category: z.string().optional(),
  sort: z.enum(["price", "name", "rating"]).default("name"),
  inStock: z.boolean().optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
  loader: ({ search }) => fetchProducts(search),
  component: Products,
});

function ProductFilters() {
  const navigate = useNavigate({ from: "/products" });
  const search = Route.useSearch();

  return (
    <form>
      <select
        value={search.category || ""}
        onChange={(e) =>
          navigate({
            search: (prev) => ({
              ...prev,
              category: e.target.value || undefined,
            }),
          })
        }
      >
        <option value="">All</option>
        <option value="electronics">Electronics</option>
        <option value="books">Books</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={search.inStock ?? false}
          onChange={(e) =>
            navigate({
              search: (prev) => ({
                ...prev,
                inStock: e.target.checked || undefined,
              }),
            })
          }
        />
        In Stock Only
      </label>
    </form>
  );
}
```

### Pattern 3: Search with Debouncing

```typescript
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

function SearchInput() {
  const navigate = useNavigate({ from: "/search" });
  const search = Route.useSearch();
  const [query, setQuery] = useState(search.query || "");

  // Debounce the query update
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    navigate({
      search: (prev) => ({ ...prev, query: debouncedQuery || undefined }),
    });
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Pattern 4: Multi-Select Filters

```typescript
// URL: /products?tags=electronics,laptop,apple

const searchSchema = z.object({
  tags: z.array(z.string()).optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
  component: Products,
});

function TagFilter() {
  const navigate = useNavigate({ from: "/products" });
  const search = Route.useSearch();
  const tags = search.tags || [];

  const toggleTag = (tag: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        tags: tags.includes(tag)
          ? tags.filter((t) => t !== tag)
          : [...tags, tag],
      }),
    });
  };

  return (
    <div>
      {["electronics", "laptops", "phones"].map((tag) => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}
          className={tags.includes(tag) ? "active" : ""}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
```

---

## Best Practices

### 1. Always Validate Search Params

```typescript
// ✅ Good: Use Zod validation
const searchSchema = z.object({
  page: z.number().int().positive().default(1),
});

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
});

// ❌ Bad: No validation
export const Route = createFileRoute("/products")({
  component: Products,
});
```

### 2. Provide Defaults

```typescript
// ✅ Good: Sensible defaults
const searchSchema = z.object({
  sort: z.enum(["price", "name"]).default("name"),
  page: z.number().default(1),
  perPage: z.number().default(20),
});

// ❌ Bad: No defaults, everything optional
const searchSchema = z.object({
  sort: z.string().optional(),
  page: z.number().optional(),
  perPage: z.number().optional(),
});
```

### 3. Use Enums for Fixed Values

```typescript
// ✅ Good: Enum with fixed values
sort: z.enum(["price-asc", "price-desc", "name", "rating"]);

// ❌ Bad: Any string
sort: z.string();
```

### 4. Keep URLs Clean

```typescript
// ✅ Good: Remove undefined values
navigate({
  search: (prev) => ({
    ...prev,
    category: value || undefined, // Removes from URL if empty
  }),
});

// ❌ Bad: Leaves empty values
navigate({
  search: (prev) => ({
    ...prev,
    category: value, // URL has ?category=
  }),
});
```

### 5. Use Proper Types

```typescript
// ✅ Good: Proper types inferred from schema
const searchSchema = z.object({
  page: z.number(), // Number in JS, serialized as number in URL
  isActive: z.boolean(), // Boolean in JS, serialized as boolean in URL
});

// ❌ Bad: Everything as string
const searchSchema = z.object({
  page: z.string(), // Requires manual parsing
  isActive: z.string(), // "true" string instead of boolean
});
```

---

## Next Steps

Now that you understand parameters, let's explore route preloading and prefetching!

**→ Continue to** [Module 2.3: Route Preloading & Prefetching](./03-preloading.md)

---

## Summary

In this lesson, you learned:

- ✅ Accessing route parameters with `useParams()`
- ✅ Working with search parameters
- ✅ Type-safe parameter handling
- ✅ Validation with Zod schemas
- ✅ Updating parameters programmatically
- ✅ Common patterns (pagination, filtering, search)
- ✅ Best practices for parameter handling

**Up Next**: Preloading routes and data for better performance!
