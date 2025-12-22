# Module 9.1: ShadCN UI Setup & Core Components

## Table of Contents

1. [Introduction](#introduction)
2. [What is ShadCN UI?](#what-is-shadcn-ui)
3. [Installation & Setup](#installation--setup)
4. [Theming](#theming)
5. [Core Components](#core-components)
6. [Form Components](#form-components)
7. [Data Display](#data-display)
8. [Best Practices](#best-practices)
9. [Next Steps](#next-steps)

---

## Introduction

ShadCN UI is a collection of beautifully designed, accessible components built with Radix UI and Tailwind CSS. Unlike traditional component libraries, you own the code!

> [!TIP]
> ShadCN components are copied into your project, giving you full control to customize!

---

## What is ShadCN UI?

### Key Features

- ✅ **Not a library** - Components are copied to your codebase
- ✅ **Accessible** - Built on Radix UI primitives
- ✅ **Customizable** - Full control over styling
- ✅ **Type-safe** - Written in TypeScript
- ✅ **Beautiful** - Gorgeous defaults with Tailwind

---

## Installation & Setup

### Install Dependencies

```bash
pnpm add tailwindcss-animate class-variance-authority clsx tailwind-merge
pnpm add @radix-ui/react-slot
```

### Initialize ShadCN

```bash
npx shadcn-ui@latest init
```

This creates:

- `components/ui/` - UI components
- `lib/utils.ts` - Utility functions
- Updates `tailwind.config.js`

### Configuration

```typescript
// components.json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## Theming

### CSS Variables

```css
/* src/app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

### Dark Mode Toggle

```typescript
// src/components/theme-toggle.tsx
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

---

## Core Components

### Button

```bash
npx shadcn-ui@latest add button
```

```typescript
import { Button } from "@/components/ui/button";

function ButtonDemo() {
  return (
    <div className="flex gap-2">
      <Button>Default</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>

      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🔍</Button>
    </div>
  );
}
```

### Card

```bash
npx shadcn-ui@latest add card
```

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function CardDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>{/* form fields */}</form>
      </CardContent>
      <CardFooter>
        <Button>Create Account</Button>
      </CardFooter>
    </Card>
  );
}
```

### Dialog

```bash
npx shadcn-ui@latest add dialog
```

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Form Components

### Input

```bash
npx shadcn-ui@latest add input label
```

```typescript
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function InputDemo() {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  );
}
```

### Form with React Hook Form

```bash
npx shadcn-ui@latest add form
```

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Select

```bash
npx shadcn-ui@latest add select
```

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

---

## Data Display

### Table

```bash
npx shadcn-ui@latest add table
```

```typescript
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function TableDemo() {
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
  ];

  return (
    <Table>
      <TableCaption>A list of users</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Toast Notifications

```bash
npx shadcn-ui@latest add toast
```

```typescript
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

function ToastDemo() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => {
        toast({
          title: "Success!",
          description: "Your changes have been saved.",
        });
      }}
    >
      Show Toast
    </Button>
  );
}

// In root layout
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

---

## Best Practices

### 1. Customize Components

```typescript
// ✅ Good: Customize to fit your needs
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        // Add your custom variant
        brand: "bg-gradient-to-r from-purple-500 to-pink-500",
      },
    },
  }
);
```

### 2. Compose Components

```typescript
// ✅ Good: Build higher-level components
function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <Avatar>
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
      </CardContent>
    </Card>
  );
}
```

---

## Next Steps

**→ Continue to** [Module 9.2: Advanced UI Patterns](./02-advanced-ui.md)

---

## Summary

- ✅ ShadCN UI setup and configuration
- ✅ Theming with CSS variables
- ✅ Core components (Button, Card, Dialog)
- ✅ Form components with validation
- ✅ Data display components
- ✅ Best practices for customization

**Up Next**: Advanced patterns like data tables and command palettes!
