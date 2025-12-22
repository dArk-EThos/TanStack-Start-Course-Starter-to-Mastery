# Module 5: Forms & Validation

Master form handling with TanStack Form and build bulletproof user input experiences.

## 🎯 Learning Objectives

- ✅ Integrate TanStack Form with TanStack Start
- ✅ Build complex multi-step forms
- ✅ Implement progressive enhancement
- ✅ Handle file uploads
- ✅ Create reusable form components
- ✅ Validate on client and server

## 📖 Key Topics

### 5.1 TanStack Form Basics

- Form state management
- Field-level validation
- Form submission handling
- Error display patterns

### 5.2 Server-Side Forms

- Progressive enhancement
- Form actions with server functions
- Handling FormData
- Non-JavaScript form handling

### 5.3 Advanced Form Patterns

- Multi-step wizards
- Dynamic fields
- File uploads
- Form arrays and nested objects

### 5.4 Integration with UI Libraries

- ShadCN Form components
- Accessible form patterns
- Custom form controls

## 🔑 Key Concepts

### Basic Form

```typescript
import { useForm } from "@tanstack/react-form";

function LoginForm() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await login({ data: value });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) =>
            !value.includes("@") ? "Invalid email" : undefined,
        }}
      >
        {(field) => (
          <div>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors && (
              <span>{field.state.meta.errors[0]}</span>
            )}
          </div>
        )}
      </form.Field>
    </form>
  );
}
```

## 🛠️ Exercises

1. **User Registration Form** - Multi-step with validation
2. **Product Creation Form** - File uploads and dynamic fields
3. **Survey Builder** - Dynamic form generation

**→ Next:** [Module 6: Authentication & Authorization](../module-06-auth/)

---

**Estimated Time:** 5-7 hours
