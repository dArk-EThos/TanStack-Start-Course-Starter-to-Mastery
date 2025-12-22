# Module 1.2: Installation & Project Setup

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Creating Your First Project](#creating-your-first-project)
3. [Understanding the CLI Options](#understanding-the-cli-options)
4. [Project Creation Walkthrough](#project-creation-walkthrough)
5. [Exploring the Generated Project](#exploring-the-generated-project)
6. [Running the Development Server](#running-the-development-server)
7. [Alternative Setup Methods](#alternative-setup-methods)
8. [Common Issues](#common-issues)
9. [Next Steps](#next-steps)

---

## System Requirements

Before we begin, ensure your system meets these requirements:

### Required Software

| Software    | Minimum Version    | Recommended     | Check Command    |
| ----------- | ------------------ | --------------- | ---------------- |
| **Node.js** | v18.0.0            | v20.x or higher | `node --version` |
| **npm**     | v9.0.0             | v10.x or higher | `npm --version`  |
| **Git**     | Any recent version | Latest          | `git --version`  |

### Package Manager Options

You can use any of these package managers:

- **npm** (comes with Node.js)
- **pnpm** (recommended for speed and disk space)
- **yarn** (if you prefer it)

```bash
# Install pnpm globally (optional but recommended)
npm install -g pnpm

# Install yarn globally (optional)
npm install -g yarn
```

### Recommended Editor Setup

**Visual Studio Code** with these extensions:

- **ESLint**: For code linting
- **Prettier**: For code formatting
- **TypeScript and JavaScript Language Features** (built-in)
- **Tailwind CSS IntelliSense**: For Tailwind autocomplete
- **Path Intellisense**: For file path autocomplete

---

## Creating Your First Project

The fastest way to create a TanStack Start project is using the official CLI:

### Using npm

```bash
npm create @tanstack/start@latest
```

### Using pnpm (Recommended)

```bash
pnpm create @tanstack/start@latest
```

### Using yarn

```bash
yarn create @tanstack/start@latest
```

> [!TIP]
> We'll use **pnpm** throughout this course for its speed and efficiency, but all commands work with npm/yarn too.

---

## Understanding the CLI Options

When you run the create command, you'll be prompted with several options. Let's understand each one:

### 1. Project Name

```bash
? What would you like to name your project?
› my-tanstack-app
```

This creates a folder with your project. Use kebab-case (lowercase with hyphens).

**Examples:**

- ✅ `my-awesome-app`
- ✅ `task-manager`
- ✅ `blog-platform`
- ❌ `MyAwesomeApp` (avoid PascalCase)
- ❌ `my_awesome_app` (avoid snake_case)

### 2. TypeScript

```bash
? Would you like to use TypeScript?
› Yes
```

**Always choose Yes!** TypeScript is essential for getting the full benefits of TanStack Start.

### 3. Styling Solution

```bash
? Select a styling solution:
› Tailwind CSS
  None
```

**Recommendation**: Choose **Tailwind CSS** as we'll be using it with ShadCN UI.

### 4. Linting

```bash
? Would you like to add ESLint?
› Yes
```

**Recommendation**: Yes, for code quality and catching errors early.

### 5. Formatting

```bash
? Would you like to add Prettier?
› Yes
```

**Recommendation**: Yes, for consistent code formatting.

### 6. Git Initialization

```bash
? Initialize a git repository?
› Yes
```

**Recommendation**: Yes, version control is essential.

---

## Project Creation Walkthrough

Let's create our first project step by step. Follow along:

```bash
# 1. Create the project
pnpm create @tanstack/start@latest

# You'll see:
# ┌  create-tanstack-start
# │
# ◇  What would you like to name your project?
# │  my-first-start-app
# │
# ◇  Would you like to use TypeScript?
# │  Yes
# │
# ◇  Select a styling solution:
# │  Tailwind CSS
# │
# ◇  Would you like to add ESLint?
# │  Yes
# │
# ◇  Would you like to add Prettier?
# │  Yes
# │
# ◇  Initialize a git repository?
# │  Yes
# │
# └  Project created successfully!
```

```bash
# 2. Navigate into the project
cd my-first-start-app

# 3. Install dependencies (if not already installed)
pnpm install

# 4. Start the development server
pnpm dev
```

Your app should now be running at `http://localhost:3000`! 🎉

---

## Exploring the Generated Project

Let's understand the structure of your new project:

```
my-first-start-app/
├── node_modules/          # Dependencies (generated)
├── public/                # Static assets
│   └── favicon.ico
├── src/
│   ├── routes/            # Your application routes
│   │   ├── __root.tsx     # Root layout component
│   │   └── index.tsx      # Home page (/)
│   ├── router.tsx         # Router configuration
│   └── client.tsx         # Client entry point
├── app.config.ts          # TanStack Start configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration (if selected)
├── postcss.config.js      # PostCSS configuration (with Tailwind)
├── .eslintrc.cjs          # ESLint configuration (if selected)
├── .prettierrc            # Prettier configuration (if selected)
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
```

### Key Files Explained

#### `app.config.ts` - Application Configuration

```typescript
import { defineConfig } from "@tanstack/start/config";

export default defineConfig({
  // Your app configuration goes here
});
```

This file configures your TanStack Start application. We'll explore more options as we progress.

#### `src/router.tsx` - Router Setup

```typescript
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
  });

  return router;
}
```

This creates your application's router. The `routeTree` is auto-generated from your route files.

#### `src/client.tsx` - Client Entry Point

```typescript
import { createRoot } from "react-dom/client";
import { StartClient } from "@tanstack/start";
import { getRouter } from "./router";

const router = getRouter();

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(<StartClient router={router} />);
}
```

This is where your React app mounts to the DOM.

#### `src/routes/__root.tsx` - Root Layout

```typescript
import { Outlet, createRootRoute } from "@tanstack/react-router";
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
        <title>TanStack Start App</title>
      </head>
      <body>
        <Outlet /> {/* Child routes render here */}
        <TanStackRouterDevtools position="bottom-right" />
      </body>
    </html>
  );
}
```

This is your root layout that wraps all pages. Notice we're rendering the full HTML document!

#### `src/routes/index.tsx` - Home Page

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div>
      <h1>Welcome to TanStack Start!</h1>
      <p>Your journey begins here.</p>
    </div>
  );
}
```

This is your home page component.

---

## Running the Development Server

### Available Scripts

Your `package.json` includes these scripts:

```json
{
  "scripts": {
    "dev": "vinxi dev", // Start development server
    "build": "vinxi build", // Build for production
    "start": "vinxi start", // Run production server
    "typecheck": "tsc --noEmit", // Check TypeScript types
    "lint": "eslint .", // Run ESLint
    "format": "prettier --write ." // Format code with Prettier
  }
}
```

### Starting Development

```bash
# Start the dev server
pnpm dev

# Output:
# vinxi dev
# ➜  Local:   http://localhost:3000/
# ➜  Network: use --host to expose
```

### Development Features

When running in development mode, you get:

- **Hot Module Replacement (HMR)**: Changes appear instantly
- **TypeScript Checking**: Errors show in terminal and browser
- **Router Devtools**: Inspect routes, loaders, and cache
- **Error Overlay**: Helpful error messages in the browser

### Opening Your App

Open your browser to `http://localhost:3000` and you should see your app!

---

## Alternative Setup Methods

Besides the CLI, you can set up a project in other ways:

### Method 1: Clone an Example

```bash
# Clone the basic example
npx gitpick TanStack/router/tree/main/examples/react/start-basic my-app
cd my-app
pnpm install
pnpm dev
```

**Available Examples:**

- `start-basic` - Minimal starter
- `start-basic-auth` - With authentication
- `start-basic-react-query` - With TanStack Query
- `start-clerk-basic` - With Clerk auth
- `start-supabase-basic` - With Supabase

### Method 2: Manual Setup

For learning purposes, you can set up manually (we'll cover this in detail in a later module).

---

## Common Issues

### Issue 1: Port Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

```bash
# Find and kill the process using port 3000
# On macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Or change the port
pnpm dev --port 3001
```

### Issue 2: Node Version Too Old

**Error:**

```
error: engine: Unsupported engine
```

**Solution:**

```bash
# Update Node.js using nvm (recommended)
nvm install 20
nvm use 20

# Verify version
node --version  # Should be v20.x.x or higher
```

### Issue 3: Module Not Found

**Error:**

```
Cannot find module '@tanstack/start'
```

**Solution:**

```bash
# Reinstall dependencies
rm -rf node_modules
rm pnpm-lock.yaml  # or package-lock.json
pnpm install
```

### Issue 4: Type Errors

**Error:**

```
TS2307: Cannot find module './routeTree.gen'
```

**Solution:**

```bash
# The route tree is generated on first run
# Just start the dev server
pnpm dev

# It will generate src/routeTree.gen.ts automatically
```

---

## Project Configuration

### TypeScript Configuration

Your `tsconfig.json` should look like this:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

### Tailwind Configuration

If you chose Tailwind, your `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

### ESLint Configuration

Basic `.eslintrc.cjs`:

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
};
```

---

## Testing Your Setup

Let's verify everything is working:

### 1. Development Server

```bash
pnpm dev
```

✅ Server starts without errors
✅ Browser opens to `http://localhost:3000`
✅ You see the welcome page

### 2. Hot Reload

Edit `src/routes/index.tsx`:

```typescript
function HomeComponent() {
  return (
    <div>
      <h1>Hello, TanStack Start!</h1> {/* Changed this line */}
      <p>Your journey begins here.</p>
    </div>
  );
}
```

✅ Page updates instantly without refresh

### 3. TypeScript

Open `src/routes/index.tsx` and add a type error:

```typescript
function HomeComponent() {
  const num: number = "string"; // Type error!
  return <div>...</div>;
}
```

✅ You should see a red squiggle in VS Code
✅ Terminal shows the type error

### 4. Linting (if enabled)

```bash
pnpm lint
```

✅ Linter runs and reports any issues

---

## Next Steps

Congratulations! You now have a working TanStack Start project. 🎉

In the next lesson, we'll:

- Explore the project structure in detail
- Understand the routing system
- Create our first custom route
- Learn about layouts and composition

**→ Continue to** [Module 1.3: Project Structure Deep Dive](./03-project-structure.md)

---

## Summary

In this lesson, you learned:

- ✅ System requirements for TanStack Start
- ✅ How to create a project using the CLI
- ✅ Understanding CLI options and making informed choices
- ✅ Basic project structure and key files
- ✅ How to run the development server
- ✅ Alternative setup methods
- ✅ Common issues and their solutions
- ✅ How to verify your setup is working

**Up Next**: Deep dive into the project structure and file organization!

---

## Exercise: Create Your Own Project

Now it's your turn! Create a new TanStack Start project:

```bash
# 1. Create a project named "learning-tanstack-start"
pnpm create @tanstack/start@latest

# Use these options:
# - Project name: learning-tanstack-start
# - TypeScript: Yes
# - Styling: Tailwind CSS
# - ESLint: Yes
# - Prettier: Yes
# - Git: Yes

# 2. Navigate into it
cd learning-tanstack-start

# 3. Start the dev server
pnpm dev

# 4. Open http://localhost:3000
```

**Challenge**: Modify the home page to display:

- Your name
- Current date
- A list of 3 things you want to build with TanStack Start

This will be your learning playground for the rest of the course!
