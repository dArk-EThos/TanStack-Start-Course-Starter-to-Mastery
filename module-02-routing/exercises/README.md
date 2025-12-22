# Module 2: Exercises

## Overview

These exercises help you master advanced routing concepts in TanStack Start. Each builds on concepts from the module lessons.

##🎯 Learning Objectives

By completing these exercises, you will:

- Practice complex routing patterns
- Implement search params with validation
- Build nested layouts and route hierarchies
- Apply preloading strategies
- Handle authentication and route protection

---

## Exercise 1: E-Commerce Product Catalog 🛍️

**Difficulty**: Intermediate  
**Time**: 60-90 minutes

### Requirements

Build a product catalog with filtering, sorting, and pagination.

#### Pages to Create:

1. **Products List** (`/products`)

   - Grid of product cards
   - Category filter dropdown
   - Price range filter (min/max)
   - Sort options (price, name, rating)
   - Pagination
   - Show active filters

2. **Product Detail** (`/products/:productId`)

   - Product information
   - Image gallery
   - Related products (preloaded)
   - Back to products with filters preserved

3. **Category Page** (`/categories/:categoryId`)
   - Products filtered by category
   - Same filtering/sorting as main page
   - Breadcrumb navigation

#### Technical Requirements:

✅ Use search params for all filters (preserve on navigation)  
✅ Validate search params with Zod  
✅ Implement preloading for product pages  
✅ Keep URLs clean (remove empty params)  
✅ Mobile responsive

### Mock Data

```typescript
// src/lib/data/products.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  description: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 99.99,
    category: "electronics",
    rating: 4.5,
    image: "/products/headphones.jpg",
    description: "High-quality wireless headphones with noise cancellation",
  },
  // Add 20+ products...
];

export function filterProducts(filters: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price" | "name" | "rating";
  page?: number;
  perPage?: number;
}) {
  let filtered = [...products];

  if (filters.category) {
    filtered = filtered.filter((p) => p.category === filters.category);
  }

  if (filters.minPrice) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
  }

  // Sorting
  if (filters.sort === "price") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (filters.sort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (filters.sort === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  // Pagination
  const page = filters.page || 1;
  const perPage = filters.perPage || 12;
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  return {
    products: paginated,
    total: filtered.length,
    page,
    perPage,
    totalPages: Math.ceil(filtered.length / perPage),
  };
}
```

### Hints

<details>
<summary>Search schema hint</summary>

```typescript
const productSearchSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  sort: z.enum(["price", "name", "rating"]).default("name"),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().min(6).max(50).default(12),
});
```

</details>

<details>
<summary>Route structure hint</summary>

```
src/routes/
├── products/
│   ├── index.tsx           # Product list with filters
│   └── $productId.tsx      # Product detail
└── categories/
    └── $categoryId.tsx     # Category page
```

</details>

### Bonus Challenges 🌟

- Add search functionality (filter by name)
- Implement URL-based scroll restoration
- Add "Recently Viewed" using localStorage
- Create a comparison view for multiple products
- Add keyboard shortcuts (arrow keys for pagination)

---

## Exercise 2: Multi-Level Dashboard 📊

**Difficulty**: Intermediate-Advanced  
**Time**: 90-120 minutes

### Requirements

Build a complex dashboard with multiple nested layout levels.

#### Route Structure:

```
/                           # Landing page
/login                      # Login page
/dashboard                  # Dashboard home
/dashboard/analytics        # Analytics page
/dashboard/reports          # Reports list
/dashboard/reports/:id      # Report detail
/dashboard/settings         # Settings home
/dashboard/settings/profile # Profile settings
/dashboard/settings/billing # Billing settings
/dashboard/settings/team    # Team settings
```

#### Layout Hierarchy:

```
Root Layout (Header, Footer)
├── Public pages (/, /login)
└── Dashboard Layout (Sidebar)
    ├── Dashboard pages
    └── Settings Layout (Sub-navigation)
        └── Settings pages
```

#### Technical Requirements:

✅ Three levels of nested layouts  
✅ Breadcrumb navigation showing current path  
✅ Sidebar with active route highlighting  
✅ Settings sub-navigation  
✅ Preload dashboard routes after login  
✅ Mobile-responsive sidebar (collapsible)

### Starter Structure

```
src/routes/
├── __root.tsx              # Root layout
├── index.tsx               # Landing
├── login.tsx               # Login
└── dashboard/
    ├── _layout.tsx         # Dashboard layout with sidebar
    ├── index.tsx           # Dashboard home
    ├── analytics.tsx       # Analytics
    ├── reports/
    │   ├── index.tsx       # Reports list
    │   └── $reportId.tsx   # Report detail
    └── settings/
        ├── _layout.tsx     # Settings layout with tabs
        ├── index.tsx       # Settings home (redirect to profile)
        ├── profile.tsx     # Profile settings
        ├── billing.tsx     # Billing settings
        └── team.tsx        # Team settings
```

### Hints

<details>
<summary>Breadcrumbs hint</summary>

```typescript
import { useMatches } from "@tanstack/react-router";

function Breadcrumbs() {
  const matches = useMatches();

  return (
    <nav>
      {matches.map((match, index) => (
        <span key={match.id}>
          {index > 0 && " / "}
          <Link to={match.pathname}>{match.context.title}</Link>
        </span>
      ))}
    </nav>
  );
}
```

</details>

<details>
<summary>Nested layout hint</summary>

```typescript
// dashboard/_layout.tsx
function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main>
        <Outlet /> {/* Settings layout or page */}
      </main>
    </div>
  );
}

// dashboard/settings/_layout.tsx
function SettingsLayout() {
  return (
    <div>
      <SettingsTabs />
      <Outlet /> {/* Settings pages */}
    </div>
  );
}
```

</details>

### Bonus Challenges 🌟

- Add keyboard shortcuts (Cmd+K for command palette)
- Implement route transitions/animations
- Add notification system
- Create a recent pages history
- Add user preferences (theme, layout density)

---

## Exercise 3: Protected Admin Panel 🔐

**Difficulty**: Advanced  
**Time**: 120+ minutes

### Requirements

Build an admin panel with authentication and role-based access.

#### Features:

1. **Authentication**

   - Login page
   - Protected routes (redirect to login if not authenticated)
   - Session management (mock with context)

2. **Role-Based Access**

   - Admin routes (only for admin users)
   - User routes (for all authenticated users)
   - Forbidden page for insufficient permissions

3. **Routes to Create**:
   - `/login` - Login page (public)
   - `/dashboard` - User dashboard (authenticated)
   - `/admin` - Admin home (admin only)
   - `/admin/users` - User management (admin only)
   - `/admin/settings` - System settings (admin only)

#### Technical Requirements:

✅ Use `beforeLoad` for authentication checks  
✅ Implement role-based access control  
✅ Redirect to login with return URL  
✅ Redirect to previous page after login  
✅ Show loading state during auth check  
✅ Handle forbidden access gracefully

### Mock Auth System

```typescript
// src/lib/auth/context.tsx
import { createContext, useContext, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContext {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login
    const mockUser: User = {
      id: "1",
      name: "John Doe",
      email,
      role: email.includes("admin") ? "admin" : "user",
    };

    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

### Route Protection Pattern

```typescript
// src/routes/dashboard/index.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: async ({ location }) => {
    const auth = getAuth();

    if (!auth.user) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href, // Save where they were going
        },
      });
    }
  },
  component: Dashboard,
});
```

### Hints

<details>
<summary>Admin-only routes hint</summary>

```typescript
// src/routes/admin/_layout.tsx
export const Route = createFileRoute("/admin/_layout")({
  beforeLoad: async ({ location }) => {
    const auth = getAuth();

    if (!auth.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }

    if (auth.user.role !== "admin") {
      throw redirect({ to: "/forbidden" });
    }
  },
  component: AdminLayout,
});
```

</details>

### Bonus Challenges 🌟

- Add "Remember Me" functionality
- Implement token refresh logic
- Add 2FA flow (mock)
- Create audit log of admin actions
- Add session timeout with warning

---

## Solutions

Complete solutions are available in [`solutions/`](./solutions/):

- [`solutions/ex1-product-catalog/`](./solutions/ex1-product-catalog/)
- [`solutions/ex2-dashboard/`](./solutions/ex2-dashboard/)
- [`solutions/ex3-admin-panel/`](./solutions/ex3-admin-panel/)

> [!TIP]
> Try to complete exercises before viewing solutions. Struggling is how you learn!

---

## Self-Assessment

After completing the exercises, you should be able to:

- [ ] Create complex search param schemas with Zod
- [ ] Build multi-level nested layouts
- [ ] Implement breadcrumb navigation
- [ ] Configure route preloading strategies
- [ ] Protect routes with authentication
- [ ] Handle role-based access control
- [ ] Preserve URL state across navigation
- [ ] Build responsive, production-quality UIs

---

## Next Steps

Once you've completed these exercises:

**→ Continue to** [Module 3: Server Functions & Data Handling](../../module-03-server-functions/)

Great work on mastering routing! 🎉
