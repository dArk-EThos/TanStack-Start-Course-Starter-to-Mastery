# Module 1: Foundation & Setup

Welcome to Module 1! This module introduces you to TanStack Start and gets you productive quickly.

## 🎯 Learning Objectives

By the end of this module, you will:

- ✅ Understand what TanStack Start is and when to use it
- ✅ Set up your development environment
- ✅ Create and run a TanStack Start project
- ✅ Understand the project structure
- ✅ Create basic file-based routes
- ✅ Navigate between pages
- ✅ Implement layouts and nested routes

## 📚 Lessons

### [1.1 Introduction to TanStack Start](./01-introduction.md)

**Time:** 30 minutes

Learn what TanStack Start is, how it compares to other frameworks, and when to use it.

**Topics:**

- What is TanStack Start?
- Why choose TanStack Start?
- Comparison with Next.js and Remix
- Core features overview
- Prerequisites for the course

---

### [1.2 Installation & Project Setup](./02-installation.md)

**Time:** 30 minutes

Get your development environment ready and create your first project.

**Topics:**

- System requirements
- Creating a project with the CLI
- Understanding CLI options
- Running the development server
- Common troubleshooting

**Hands-on:** Create your first TanStack Start project

---

### [1.3 Project Structure Deep Dive](./03-project-structure.md)

**Time:** 45 minutes

Understand how TanStack Start projects are organized.

**Topics:**

- Directory structure explained
- Configuration files
- Route files and conventions
- Component organization
- Best practices for large apps

**Hands-on:** Explore the generated project structure

---

### [1.4 Basic Routing Concepts](./04-basic-routing.md)

**Time:** 60 minutes

Learn file-based routing fundamentals.

**Topics:**

- File-based routing principles
- Creating static routes
- Dynamic routes with parameters
- Layout routes
- Navigation and linking
- Active link styling

**Hands-on:** Build a multi-page website

---

## 🛠️ Exercises

Complete these hands-on exercises to reinforce your learning:

### [Exercise 1: Personal Portfolio](./exercises/README.md#exercise-1-personal-portfolio-site-)

**Difficulty:** Beginner | **Time:** 30-45 min

Build a personal portfolio with Home, About, Projects, and Contact pages.

**Skills Practiced:**

- Creating multiple routes
- Shared layouts
- Navigation between pages
- Styling with Tailwind CSS

---

### [Exercise 2: Blog with Dynamic Routes](./exercises/README.md#exercise-2-blog-with-dynamic-routes-)

**Difficulty:** Intermediate | **Time:** 45-60 min

Create a blog with a list page and individual post pages using dynamic routes.

**Skills Practiced:**

- Dynamic route parameters
- Data loading with loaders
- Error and loading states
- Nested routing

---

### [Exercise 3: Dashboard with Nested Layouts](./exercises/README.md#exercise-3-dashboard-with-nested-layouts-)

**Difficulty:** Intermediate-Advanced | **Time:** 60-90 min

Build a dashboard application with a sidebar and multiple pages.

**Skills Practiced:**

- Layout routes
- Nested routing
- Sidebar navigation
- Responsive design

---

### [Exercise 4: Multi-Step Form Wizard](./exercises/README.md#exercise-4-multi-step-form-wizard-)

**Difficulty:** Advanced | **Time:** 90+ min

Create a multi-step signup form using routing.

**Skills Practiced:**

- Advanced routing patterns
- State management across routes
- Form handling
- Progress indicators

---

## 📖 Key Concepts

### File-Based Routing

```
src/routes/
├── index.tsx       →  /
├── about.tsx       →  /about
├── blog/
│   ├── index.tsx   →  /blog
│   └── $id.tsx     →  /blog/:id
```

### Route File Structure

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/path")({
  loader: async () => {
    /* load data */
  },
  component: MyComponent,
});

function MyComponent() {
  const data = Route.useLoaderData();
  return <div>{/* your UI */}</div>;
}
```

### Navigation

```typescript
import { Link } from '@tanstack/react-router'

<Link to="/about">About</Link>
<Link to="/blog/$id" params={{ id: '123' }}>Post 123</Link>
```

### Layout Routes

```typescript
// src/routes/dashboard/_layout.tsx
<div>
  <Sidebar />
  <Outlet /> {/* Child routes render here */}
</div>
```

---

## ✅ Self-Assessment

Before moving to Module 2, ensure you can:

- [ ] Create a new TanStack Start project from scratch
- [ ] Explain the purpose of key files in the project structure
- [ ] Create both static and dynamic routes
- [ ] Navigate between routes using `<Link>`
- [ ] Implement a layout route that wraps multiple pages
- [ ] Use the `<Outlet />` component correctly
- [ ] Load data in a route using `loader`
- [ ] Handle loading and error states

---

## 🎓 What's Next?

You've completed the foundation! In **Module 2**, we'll dive deeper into:

- Advanced routing patterns
- Route parameters and search params
- Route preloading and prefetching
- Route protection and middleware
- Code organization at scale

**→ Continue to [Module 2: File-Based Routing Mastery](../module-02-routing/01-file-conventions.md)**

---

## 📚 Additional Resources

- [TanStack Start Documentation](https://tanstack.com/start/latest)
- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [Official Examples](https://github.com/TanStack/router/tree/main/examples/react)
- [TanStack Discord Community](https://tlinz.com/discord)

---

## 💡 Tips for Success

> [!TIP] > **Learn by Doing**: Don't just read - type out every example and experiment with modifications.

> [!TIP] > **Use TypeScript**: Embrace TypeScript's type checking. The errors it catches will save you time.

> [!TIP] > **Router Devtools**: Use the TanStack Router Devtools (bottom-right corner) to inspect your routes, loaders, and cache.

> [!IMPORTANT] > **Complete the Exercises**: The exercises are crucial for solidifying your understanding. Don't skip them!

---

**Estimated Module Completion Time:** 4-6 hours (including exercises)

Happy learning! 🚀
