# Module 1.4: Basic Routing Concepts

## Table of Contents

1. [Introduction to File-Based Routing](#introduction-to-file-based-routing)
2. [Creating Your First Route](#creating-your-first-route)
3. [Understanding Route Files](#understanding-route-files)
4. [Navigation Between Routes](#navigation-between-routes)
5. [Route Parameters](#route-parameters)
6. [Layout Routes](#layout-routes)
7. [The Outlet Component](#the-outlet-component)
8. [Active Route Styling](#active-route-styling)
9. [Putting It All Together](#putting-it-all-together)
10. [Common Patterns](#common-patterns)
11. [Next Steps](#next-steps)

---

## Introduction to File-Based Routing

In TanStack Start, **your file structure IS your routing structure**. No need to manually configure routes - just create files!

### Old Way (Manual Routing)

```typescript
// ❌ In other frameworks, you might write:
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/blog/:id" element={<BlogPost />} />
  </Routes>
</BrowserRouter>
```

### TanStack Start Way (File-Based)

```
src/routes/
├── index.tsx      → matches "/"
├── about.tsx      → matches "/about"
└── blog/
    └── $id.tsx    → matches "/blog/:id"
```

**That's it!** No routing configuration needed. ✨

---

## Creating Your First Route

Let's create a simple "About" page.

### Step 1: Create the File

Create `src/routes/about.tsx`:

```typescript
// src/routes/about.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">About Us</h1>
      <p className="mt-4">Welcome to our amazing website!</p>
    </div>
  );
}
```

### Step 2: Visit the Route

Start your dev server:

```bash
pnpm dev
```

Navigate to `http://localhost:3000/about` and you'll see your page! 🎉

> [!NOTE]
> The route tree is automatically regenerated when you add new route files.

---

## Understanding Route Files

Every route file has the same basic structure:

```typescript
import { createFileRoute } from "@tanstack/react-router";

// 1. Export a Route object
export const Route = createFileRoute("/your-path")({
  // 2. Optional: Define meta information
  meta: () => ({
    title: "Page Title",
    description: "Page description for SEO",
  }),

  // 3. Optional: Load data before rendering
  loader: async () => {
    const data = await fetchData();
    return data;
  },

  // 4. Required: Define the component
  component: YourComponent,
});

// 5. Implement your component
function YourComponent() {
  // Access loaded data
  const data = Route.useLoaderData();

  return <div>{/* Your UI */}</div>;
}
```

### Route Options Explained

| Option             | Purpose                       | When to Use                    |
| ------------------ | ----------------------------- | ------------------------------ |
| `component`        | The React component to render | Always (required)              |
| `loader`           | Load data before rendering    | When you need data from server |
| `meta`             | Set page title, description   | For SEO and browser tabs       |
| `errorComponent`   | Component to show on error    | Custom error handling          |
| `pendingComponent` | Loading state                 | Custom loading UI              |

---

## Navigation Between Routes

### Using the `<Link>` Component

```typescript
// src/routes/index.tsx
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      <h1>Welcome Home!</h1>

      {/* Type-safe navigation */}
      <nav>
        <Link to="/about">About Us</Link>
        <Link to="/blog">Read Our Blog</Link>
        <Link to="/contact">Contact</Link>
      </nav>
    </div>
  );
}
```

> [!TIP]
> The `to` prop is **type-safe**! TypeScript will error if you link to a non-existent route.

### Styling Links

```typescript
<Link to="/about" className="text-blue-500 hover:underline">
  About
</Link>
```

### Active Link Styling

```typescript
<Link
  to="/about"
  activeProps={{
    className: "font-bold text-blue-700",
  }}
>
  About
</Link>
```

### Programmatic Navigation

```typescript
import { useNavigate } from "@tanstack/react-router";

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate programmatically
    navigate({ to: "/about" });
  };

  return <button onClick={handleClick}>Go to About</button>;
}
```

---

## Route Parameters

Dynamic routes use the `$` prefix for parameters.

### Creating a Dynamic Route

**File**: `src/routes/blog/$postId.tsx`

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/$postId")({
  loader: async ({ params }) => {
    // params.postId is type-safe!
    const post = await fetchPost(params.postId);
    return post;
  },
  component: BlogPost,
});

function BlogPost() {
  const post = Route.useLoaderData();
  const { postId } = Route.useParams(); // Access params in component

  return (
    <article>
      <h1>{post.title}</h1>
      <p>Post ID: {postId}</p>
      <div>{post.content}</div>
    </article>
  );
}
```

### Linking to Dynamic Routes

```typescript
<Link to="/blog/$postId" params={{ postId: "123" }}>
  Read Post 123
</Link>
```

### Multiple Parameters

**File**: `src/routes/users/$userId/posts/$postId.tsx`

```typescript
export const Route = createFileRoute("/users/$userId/posts/$postId")({
  loader: async ({ params }) => {
    // Both params are available and type-safe
    const { userId, postId } = params;
    return await fetchUserPost(userId, postId);
  },
  component: UserPost,
});
```

---

## Layout Routes

Layout routes let you wrap multiple routes with shared UI (like headers, sidebars, etc.).

### Creating a Layout

Layouts start with `_` (underscore) to indicate they don't add to the URL.

**File**: `src/routes/dashboard/_layout.tsx`

```typescript
// src/routes/dashboard/_layout.tsx
import { createFileRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/_layout")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4">
        <nav className="space-y-2">
          <Link to="/dashboard">Dashboard Home</Link>
          <Link to="/dashboard/analytics">Analytics</Link>
          <Link to="/dashboard/settings">Settings</Link>
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-8">
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  );
}
```

### Using the Layout

Now create child routes:

```
src/routes/dashboard/
├── _layout.tsx          # Layout wrapper
├── index.tsx            # /dashboard
├── analytics.tsx        # /dashboard/analytics
└── settings.tsx         # /dashboard/settings
```

**File**: `src/routes/dashboard/index.tsx`

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  return (
    <div>
      <h1>Dashboard Home</h1>
      <p>Welcome to your dashboard!</p>
    </div>
  );
}
```

All dashboard routes will now share the same sidebar layout! 🎯

---

## The Outlet Component

`<Outlet />` is where child routes are rendered.

### Example: Nested Layouts

```typescript
// src/routes/__root.tsx
function RootComponent() {
  return (
    <html>
      <body>
        <Header />
        <Outlet /> {/* All routes render here */}
        <Footer />
      </body>
    </html>
  );
}

// src/routes/dashboard/_layout.tsx
function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <Outlet /> {/* Dashboard child routes render here */}
    </div>
  );
}

// src/routes/dashboard/index.tsx
function DashboardHome() {
  return <div>Dashboard content</div>;
}
```

**Result**: The page hierarchy is:

```
<Header />
  <Sidebar />
    <div>Dashboard content</div>
  </Sidebar>
<Footer />
```

---

## Active Route Styling

Highlight the current page in your navigation:

### Method 1: Using `activeProps`

```typescript
<Link
  to="/about"
  activeProps={{
    className: "font-bold text-blue-600 border-b-2 border-blue-600",
  }}
  inactiveProps={{
    className: "text-gray-600",
  }}
>
  About
</Link>
```

### Method 2: Using `useMatchRoute`

```typescript
import { Link, useMatchRoute } from "@tanstack/react-router";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const matchRoute = useMatchRoute();
  const isActive = matchRoute({ to });

  return (
    <Link
      to={to}
      className={isActive ? "text-blue-600 font-bold" : "text-gray-600"}
    >
      {children}
    </Link>
  );
}
```

---

## Putting It All Together

Let's build a complete multi-page site structure:

### File Structure

```
src/routes/
├── __root.tsx              # Root layout with header/footer
├── index.tsx               # Home page
├── about.tsx               # About page
├── contact.tsx             # Contact page
├── blog/
│   ├── index.tsx           # Blog list
│   └── $postId.tsx         # Blog post detail
└── dashboard/
    ├── _layout.tsx         # Dashboard layout with sidebar
    ├── index.tsx           # Dashboard home
    ├── analytics.tsx       # Analytics page
    └── settings.tsx        # Settings page
```

### Root Layout with Navigation

```typescript
// src/routes/__root.tsx
import {
  Outlet,
  createRootRoute,
  Link,
  Scripts,
  ScrollRestoration,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My Awesome Site</title>
      </head>
      <body className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex gap-6">
              <Link
                to="/"
                className="text-lg"
                activeProps={{ className: "font-bold text-blue-600" }}
              >
                Home
              </Link>
              <Link
                to="/about"
                activeProps={{ className: "font-bold text-blue-600" }}
              >
                About
              </Link>
              <Link
                to="/blog"
                activeProps={{ className: "font-bold text-blue-600" }}
              >
                Blog
              </Link>
              <Link
                to="/contact"
                activeProps={{ className: "font-bold text-blue-600" }}
              >
                Contact
              </Link>
              <Link
                to="/dashboard"
                activeProps={{ className: "font-bold text-blue-600" }}
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>© 2024 My Awesome Site. Built with TanStack Start.</p>
          </div>
        </footer>

        <Scripts />
        <ScrollRestoration />
        <TanStackRouterDevtools position="bottom-right" />
      </body>
    </html>
  );
}
```

### Home Page

```typescript
// src/routes/index.tsx
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-bold mb-4">Welcome to My Awesome Site!</h1>
      <p className="text-xl text-gray-600 mb-8">
        Built with TanStack Start - The modern full-stack React framework
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="About Us"
          description="Learn more about our mission and team"
          link="/about"
        />
        <Card
          title="Read Blog"
          description="Check out our latest articles and insights"
          link="/blog"
        />
        <Card
          title="Get in Touch"
          description="We'd love to hear from you"
          link="/contact"
        />
      </div>
    </div>
  );
}

function Card({
  title,
  description,
  link,
}: {
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link
      to={link}
      className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
    >
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}
```

---

## Common Patterns

### 1. Not Found (404) Page

```typescript
// src/routes/$.tsx (catch-all route)
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
  component: NotFound,
});

function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600 mt-4">Page not found</p>
      <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
        Go home
      </Link>
    </div>
  );
}
```

### 2. Loading States

```typescript
export const Route = createFileRoute("/blog")({
  loader: async () => {
    const posts = await fetchPosts(); // Slow operation
    return { posts };
  },
  pendingComponent: () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  ),
  component: BlogList,
});
```

### 3. Error Boundaries

```typescript
export const Route = createFileRoute("/blog/$postId")({
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    return { post };
  },
  errorComponent: ({ error }) => (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-red-600">Error</h1>
      <p className="text-gray-600 mt-2">{error.message}</p>
    </div>
  ),
  component: BlogPost,
});
```

---

## Next Steps

Congratulations on completing Module 1! You now understand:

- ✅ What TanStack Start is and why it's powerful
- ✅ How to set up a new project
- ✅ Project structure and organization
- ✅ Basic routing concepts and file-based routing
- ✅ Navigation and dynamic routes
- ✅ Layout routes and the Outlet component

**→ Continue to** [Module 1 Exercises](./exercises/README.md) to practice what you've learned!

**→ Next Module**: [Module 2: File-Based Routing Mastery](../module-02-routing/01-file-conventions.md)

---

## Summary

In this lesson, you learned:

- ✅ File-based routing eliminates manual route configuration
- ✅ Create routes by creating files in `src/routes/`
- ✅ Navigate with type-safe `<Link>` components
- ✅ Dynamic routes use `$` prefix for parameters
- ✅ Layout routes (starting with `_`) provide shared UI
- ✅ `<Outlet />` renders child routes
- ✅ Style active links for better UX
- ✅ Common patterns like 404 pages, loading states, and error handling

**Module 1 Complete!** 🎉 Time to practice with the exercises!
