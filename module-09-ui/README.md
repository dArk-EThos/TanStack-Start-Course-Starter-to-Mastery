# Module 9: UI Development with ShadCN

Build beautiful, accessible UIs rapidly with ShadCN UI components and TanStack Start.

## 🎯 Learning Objectives

- ✅ Set up ShadCN UI with TanStack Start
- ✅ Build component libraries
- ✅ Implement custom themes
- ✅ Create complex data tables
- ✅ Build accessible interfaces
- ✅ Optimize for performance

## 📖 Key Topics

### 9.1 ShadCN Setup

- Installation and configuration
- Tailwind CSS integration
- Component installation
- Theme customization

### 9.2 Core Components

- Buttons, Forms, Inputs
- Dialogs and Modals
- Dropdowns and Selects
- Navigation components

### 9.3 Complex Components

- Data Tables with TanStack Table
- Command palettes
- Multi-select components
- File upload components

### 9.4 Theming & Styling

- CSS variables and design tokens
- Dark mode implementation
- Custom color schemes
- Responsive design patterns

### 9.5 Accessibility

- ARIA patterns
- Keyboard navigation
- Screen reader support
- Focus management

### 9.6 Performance

- Component lazy loading
- Virtualization for long lists
- Image optimization
- CSS optimization

## 🔑 Key Patterns

### ShadCN Form Component

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";

const formSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
});

function ProfileForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <FormField
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

### Data Table

```typescript
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

function UsersTable() {
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  return <DataTable columns={columns} data={data} />;
}
```

## 🛠️ Exercises

1. **Component Library** - Build reusable component system
2. **Admin Dashboard UI** - Complex layouts with all components
3. **E-Commerce Product Page** - Advanced UI patterns

**→ Next:** [Module 10: Testing & Quality](../module-10-testing/)

---

**Estimated Time:** 6-8 hours
