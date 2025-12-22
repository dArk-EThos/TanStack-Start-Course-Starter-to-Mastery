# Module 1: Exercises

## Overview

Welcome to the Module 1 exercises! These hands-on challenges will help you solidify your understanding of TanStack Start fundamentals.

## 🎯 Learning Objectives

By completing these exercises, you will:

- Practice setting up TanStack Start projects
- Create file-based routes
- Implement navigation between pages
- Build layouts and nested routes
- Use dynamic route parameters
- Apply styling and active link states

---

## Exercise 1: Personal Portfolio Site 🌟

**Difficulty**: Beginner  
**Time**: 30-45 minutes

### Requirements

Create a personal portfolio website with the following pages:

#### Pages to Create:

1. **Home Page** (`/`)

   - Display your name and title
   - Brief introduction paragraph
   - Links to other pages

2. **About Page** (`/about`)

   - Your background and skills
   - Education or experience section

3. **Projects Page** (`/projects`)

   - List of 3-5 projects
   - Each project should be a card with title and description

4. **Contact Page** (`/contact`)
   - Contact form (UI only, no functionality yet)
   - Email and social media links

#### Technical Requirements:

- ✅ Use a shared layout with header and footer
- ✅ Implement navigation menu in header
- ✅ Style active links differently
- ✅ Use Tailwind CSS for styling
- ✅ Make it responsive (mobile-friendly)

### Starter Code

```bash
# Create the project
pnpm create @tanstack/start@latest portfolio-site

# Options:
# - TypeScript: Yes
# - Styling: Tailwind CSS
# - ESLint: Yes
# - Prettier: Yes

cd portfolio-site
pnpm dev
```

### Hints

<details>
<summary>Click to see file structure hint</summary>

```
src/routes/
├── __root.tsx         # Root layout with nav
├── index.tsx          # Home page
├── about.tsx          # About page
├── projects.tsx       # Projects list
└── contact.tsx        # Contact form
```

</details>

<details>
<summary>Click to see navigation hint</summary>

```typescript
// In __root.tsx
<nav className="flex gap-6">
  <Link to="/" activeProps={{ className: "font-bold" }}>
    Home
  </Link>
  <Link to="/about" activeProps={{ className: "font-bold" }}>
    About
  </Link>
  {/* Add more links */}
</nav>
```

</details>

### Bonus Challenges 🌟

- Add a dark mode toggle
- Create smooth page transitions
- Add a custom 404 page
- Use CSS animations for elements

---

## Exercise 2: Blog with Dynamic Routes 📝

**Difficulty**: Intermediate  
**Time**: 45-60 minutes

### Requirements

Build a simple blog with static data:

#### Features:

1. **Blog List Page** (`/blog`)

   - Display a list of blog posts
   - Each post shows title, excerpt, and date
   - Click to read full post

2. **Blog Post Page** (`/blog/:id`)

   - Display full blog post content
   - Show author and published date
   - "Back to blog" navigation

3. **Homepage** (`/`)
   - Featured post section
   - Link to blog

#### Technical Requirements:

- ✅ Use dynamic routes for individual posts
- ✅ Create mock data for at least 5 blog posts
- ✅ Use loaders to fetch post data
- ✅ Implement proper loading states
- ✅ Handle non-existent post IDs with error component

### Mock Data Template

```typescript
// src/lib/data/posts.ts
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Getting Started with TanStack Start",
    excerpt: "Learn the basics of this powerful framework...",
    content: "Full content here...",
    author: "Your Name",
    publishedAt: "2024-12-01",
  },
  // Add more posts...
];

export function getPost(id: string): BlogPost | undefined {
  return blogPosts.find((post) => post.id === id);
}
```

### Starter Code

Create the project:

```bash
pnpm create @tanstack/start@latest blog-site
cd blog-site
```

Create the data file:

```bash
mkdir -p src/lib/data
# Add posts.ts as shown above
```

### Hints

<details>
<summary>Click to see route structure hint</summary>

```
src/routes/
├── __root.tsx
├── index.tsx          # Homepage
└── blog/
    ├── index.tsx      # Blog list
    └── $postId.tsx    # Individual post
```

</details>

<details>
<summary>Click to see loader hint for blog post</summary>

```typescript
// src/routes/blog/$postId.tsx
import { getPost } from "@/lib/data/posts";

export const Route = createFileRoute("/blog/$postId")({
  loader: async ({ params }) => {
    const post = getPost(params.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    return { post };
  },
  component: BlogPost,
});
```

</details>

### Bonus Challenges 🌟

- Add categories/tags to posts
- Implement a search function (filter posts)
- Add pagination to blog list
- Create an "author" page showing all posts by that author
- Add reading time estimates

---

## Exercise 3: Dashboard with Nested Layouts 📊

**Difficulty**: Intermediate-Advanced  
**Time**: 60-90 minutes

### Requirements

Build a dashboard application with nested layouts:

#### Pages:

1. **Landing Page** (`/`)

   - Public home page
   - Login button (no auth yet)

2. **Dashboard Home** (`/dashboard`)

   - Overview stats (placeholder cards)
   - Recent activity

3. **Dashboard Pages**:
   - `/dashboard/analytics` - Analytics charts (mock UI)
   - `/dashboard/users` - User list (mock data)
   - `/dashboard/settings` - Settings form (UI only)

#### Technical Requirements:

- ✅ Use layout routes for dashboard section
- ✅ Dashboard should have a sidebar navigation
- ✅ Public pages use different layout
- ✅ Active route highlighting in sidebar
- ✅ Responsive sidebar (collapsible on mobile)

### Layout Structure

```
Layouts:
├── Public Layout (__root.tsx)
│   └── Landing page
└── Dashboard Layout (dashboard/_layout.tsx)
    ├── Dashboard Home
    ├── Analytics
    ├── Users
    └── Settings
```

### Starter Code

```bash
pnpm create @tanstack/start@latest dashboard-app
cd dashboard-app
```

### Hints

<details>
<summary>Click to see file structure hint</summary>

```
src/routes/
├── __root.tsx              # Public layout
├── index.tsx               # Landing page
└── dashboard/
    ├── _layout.tsx         # Dashboard layout with sidebar
    ├── index.tsx           # Dashboard home
    ├── analytics.tsx       # Analytics page
    ├── users.tsx           # Users page
    └── settings.tsx        # Settings page
```

</details>

<details>
<summary>Click to see sidebar navigation hint</summary>

```typescript
// In dashboard/_layout.tsx
<aside className="w-64 bg-gray-800 text-white p-4">
  <nav className="space-y-2">
    <Link
      to="/dashboard"
      activeProps={{ className: "bg-gray-700 rounded" }}
      className="block p-2"
    >
      Home
    </Link>
    <Link
      to="/dashboard/analytics"
      activeProps={{ className: "bg-gray-700 rounded" }}
      className="block p-2"
    >
      Analytics
    </Link>
    {/* More links... */}
  </nav>
</aside>
```

</details>

### Bonus Challenges 🌟

- Add breadcrumbs navigation
- Implement a command palette (Cmd+K)
- Add a notification system (UI only)
- Create a user profile dropdown
- Make the sidebar collapsible with animation
- Add keyboard shortcuts for navigation

---

## Exercise 4: Multi-Step Form Wizard 🧙‍♂️

**Difficulty**: Advanced  
**Time**: 90+ minutes

### Requirements

Create a multi-step form using routing:

#### Steps:

1. **Personal Info** (`/signup/personal`)
   - Name, email, phone
2. **Account Details** (`/signup/account`)
   - Username, password
3. **Preferences** (`/signup/preferences`)
   - Newsletter, notifications
4. **Review** (`/signup/review`)
   - Show all entered data
   - Confirm and submit

#### Technical Requirements:

- ✅ Each step is a separate route
- ✅ Use layout route for the wizard container
- ✅ Progress indicator showing current step
- ✅ "Next" and "Previous" navigation
- ✅ Store form data in state (we'll learn better methods later)
- ✅ Validate before moving to next step

### Challenge

The tricky part is maintaining form state across route changes! Here are some approaches:

**Approach 1: Context** (Recommended for now)

```typescript
// Create a context to store form data
// We'll learn better patterns in later modules
```

**Approach 2: URL State**

```typescript
// Store data in search params
// Limited to serializable data
```

### Hints

<details>
<summary>Click to see route structure hint</summary>

```
src/routes/
├── __root.tsx
├── index.tsx
└── signup/
    ├── _layout.tsx      # Wizard layout with progress
    ├── personal.tsx     # Step 1
    ├── account.tsx      # Step 2
    ├── preferences.tsx  # Step 3
    └── review.tsx       # Step 4
```

</details>

### Bonus Challenges 🌟

- Add form validation with Zod
- Prevent navigation to future steps
- Save progress to localStorage
- Add animations between steps
- Create a "save draft" feature

---

## Solutions

Complete solutions for all exercises are available in the `solutions/` directory:

- [`solutions/ex1-portfolio/`](./solutions/ex1-portfolio/) - Portfolio Site
- [`solutions/ex2-blog/`](./solutions/ex2-blog/) - Blog with Dynamic Routes
- [`solutions/ex3-dashboard/`](./solutions/ex3-dashboard/) - Dashboard Application
- [`solutions/ex4-wizard/`](./solutions/ex4-wizard/) - Multi-Step Form Wizard

> [!TIP]
> Try to complete the exercises before looking at solutions. Struggling is part of learning!

---

## Self-Assessment Checklist

Before moving to Module 2, make sure you can:

- [ ] Create a new TanStack Start project
- [ ] Understand the project file structure
- [ ] Create static routes (`about.tsx`, `contact.tsx`)
- [ ] Create dynamic routes (`blog/$postId.tsx`)
- [ ] Implement navigation with `<Link>`
- [ ] Create layout routes with `_layout.tsx`
- [ ] Use `<Outlet />` to render child routes
- [ ] Style active links
- [ ] Use loaders to fetch data
- [ ] Handle loading and error states
- [ ] Organize code into components and utilities

If you can do all of these, you're ready for Module 2! 🎉

---

## Getting Help

Stuck on an exercise? Here's how to get help:

1. **Re-read the module lessons** - Often the answer is there!
2. **Check the hints** - Expand the hint sections above
3. **Look at the solutions** - But try without them first!
4. **Ask in Discord** - [TanStack Discord](https://tlinz.com/discord)
5. **Review the docs** - [TanStack Start Docs](https://tanstack.com/start/latest)

---

## Next Steps

Once you've completed these exercises:

**→ Continue to** [Module 2: File-Based Routing Mastery](../../module-02-routing/01-file-conventions.md)

You're doing great! Keep building! 🚀
