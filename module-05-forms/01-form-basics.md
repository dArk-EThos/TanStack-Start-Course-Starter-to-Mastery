# Module 5.1: TanStack Form Basics

## Table of Contents

1. [Introduction](#introduction)
2. [Why TanStack Form?](#why-tanstack-form)
3. [Installation & Setup](#installation--setup)
4. [Basic Form](#basic-form)
5. [Field Validation](#field-validation)
6. [Form State](#form-state)
7. [Submission Handling](#submission-handling)
8. [Integration with Server Functions](#integration-with-server-functions)
9. [Best Practices](#best-practices)
10. [Next Steps](#next-steps)

---

## Introduction

TanStack Form is a powerful, headless form library that provides type-safe form handling with built-in validation and state management.

> [!IMPORTANT]
> TanStack Form is headless - it doesn't provide UI components, giving you complete control over styling and layout.

---

## Why TanStack Form?

### The Problem: Manual Form Handling

```typescript
// ❌ Without TanStack Form - lots of boilerplate
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;

    setIsSubmitting(true);
    try {
      await login({ email, password });
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... render form
}
```

### The Solution: TanStack Form

```typescript
// ✅ With TanStack Form - clean and powerful
import { useForm } from "@tanstack/react-form";

function LoginForm() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await login(value);
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
            !value
              ? "Email is required"
              : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
              ? "Invalid email"
              : undefined,
        }}
      >
        {(field) => (
          <div>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors && (
              <span className="error">{field.state.meta.errors[0]}</span>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="password" /* similar */ />

      <button type="submit" disabled={form.state.isSubmitting}>
        {form.state.isSubmitting ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
}
```

---

## Installation & Setup

```bash
pnpm add @tanstack/react-form
pnpm add -D @tanstack/zod-form-adapter zod
```

---

## Basic Form

### Simple Form Example

```typescript
import { useForm } from "@tanstack/react-form";

function ContactForm() {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value);
      await submitContactForm(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="name">
        {(field) => (
          <div>
            <label htmlFor={field.name}>Name</label>
            <input
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <div>
            <label htmlFor={field.name}>Email</label>
            <input
              id={field.name}
              type="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="message">
        {(field) => (
          <div>
            <label htmlFor={field.name}>Message</label>
            <textarea
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={4}
            />
          </div>
        )}
      </form.Field>

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## Field Validation

### Validation Timing

```typescript
<form.Field
  name="email"
  validators={{
    // Validate on change
    onChange: ({ value }) =>
      !value.includes("@") ? "Invalid email" : undefined,

    // Validate on blur
    onBlur: ({ value }) => (value.length < 5 ? "Email too short" : undefined),

    // Async validation (e.g., check if email exists)
    onChangeAsync: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const exists = await checkEmailExists(value);
      return exists ? "Email already registered" : undefined;
    },

    // Validate on submit
    onSubmit: ({ value }) => (!value ? "Email is required" : undefined),
  }}
>
  {(field) => (
    <div>
      <input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      {field.state.meta.errors?.map((error, i) => (
        <span key={i} className="error">
          {error}
        </span>
      ))}
      {field.state.meta.isValidating && <span>Validating...</span>}
    </div>
  )}
</form.Field>
```

### Zod Integration

```typescript
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be at least 18"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number"),
});

function UserForm() {
  const form = useForm({
    defaultValues: {
      email: "",
      age: 0,
      password: "",
    },
    validatorAdapter: zodValidator,
    validators: {
      onChange: userSchema,
    },
    onSubmit: async ({ value }) => {
      await createUser(value);
    },
  });

  // ... render form
}
```

---

## Form State

### Accessing Form State

```typescript
function MyForm() {
  const form = useForm({
    /* config */
  });

  const {
    // Form values
    values, // Current form values

    // Validation
    errors, // All field errors
    isValid, // Is form valid?
    canSubmit, // Can form be submitted?
    isValidating, // Is validation running?

    // Submission
    isSubmitting, // Is form submitting?
    isSubmitted, // Has form been submitted?
    submitCount, // Number of submissions

    // Dirty/Touched
    isDirty, // Has form been modified?
    isTouched, // Has any field been touched?

    // Field states
    fieldMeta, // Metadata for all fields
  } = form.state;

  return (
    <div>
      <pre>{JSON.stringify(values, null, 2)}</pre>
      <p>Valid: {isValid ? "Yes" : "No"}</p>
      <p>Dirty: {isDirty ? "Yes" : "No"}</p>
    </div>
  );
}
```

### Field State

```typescript
<form.Field name="email">
  {(field) => {
    const {
      value,          // Current value
      meta: {
        errors,       // Validation errors
        isValidating, // Is field validating?
        isTouched,    // Has field been touched?
        isDirty,      // Has field changed?
      },
    } = field.state

    return (
      <div>
        <input value={value} onChange={/*...*} />
        {errors && <span>{errors[0]}</span>}
        {isValidating && <Spinner />}
      </div>
    )
  }}
</form.Field>
```

---

## Submission Handling

### Basic Submission

```typescript
const form = useForm({
  defaultValues: { email: "", password: "" },
  onSubmit: async ({ value }) => {
    // value is typed based on defaultValues!
    await login({ email: value.email, password: value.password });
  },
});
```

### With Error Handling

```typescript
const form = useForm({
  defaultValues: { email: "", password: "" },
  onSubmit: async ({ value }) => {
    try {
      await login(value);
      toast.success("Logged in successfully!");
    } catch (error) {
      toast.error(error.message);
      // Can set form-level errors
      throw error;
    }
  },
  onSubmitInvalid: ({ value, formApi }) => {
    // Called when form has validation errors
    toast.error("Please fix the errors");
  },
});
```

### Programmatic Submission

```typescript
function MyForm() {
  const form = useForm({/* ... */})

  // Manual submit
  const handleQuickSave = () => {
    form.handleSubmit()
  }

  // Submit with specific values
  const handleSaveAs Draft = () => {
    form.setFieldValue('status', 'draft')
    form.handleSubmit()
  }

  return (
    <div>
      <button onClick={handleQuickSave}>Quick Save</button>
      <button onClick={handleSaveAsDraft}>Save as Draft</button>
    </div>
  )
}
```

---

## Integration with Server Functions

### Basic Integration

```typescript
import { createServerFn } from "@tanstack/start";
import { useForm } from "@tanstack/react-form";

// Server function
export const createPost = createServerFn({ method: "POST" })
  .inputValidator(postSchema)
  .handler(async ({ data }) => {
    return await db.post.create({ data });
  });

// Form component
function CreatePostForm() {
  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
    },
    onSubmit: async ({ value }) => {
      await createPost({ data: value });
    },
  });

  return <form>{/* fields */}</form>;
}
```

### With TanStack Query Mutation

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreatePostForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const form = useForm({
    defaultValues: { title: "", content: "" },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({ data: value });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {/* fields */}
      <button type="submit" disabled={form.state.isSubmitting}>
        {form.state.isSubmitting ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}
```

---

## Best Practices

### 1. Use TypeScript for Type Safety

```typescript
// ✅ Good: Typed form values
interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
}

const form = useForm<SignupForm>({
  defaultValues: {
    email: "",
    password: "",
    confirmPassword: "",
  },
  onSubmit: async ({ value }) => {
    // value is fully typed!
    console.log(value.email); // ✅ Type-safe
  },
});
```

### 2. Validate on Blur for Better UX

```typescript
// ✅ Good: Only show errors after user interacts
<form.Field
  name="email"
  validators={{
    onBlur: ({ value }) => (!value ? "Required" : undefined),
  }}
>
  {(field) => (
    <div>
      <input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur} // Triggers validation
      />
      {field.state.meta.isTouched && field.state.meta.errors && (
        <span>{field.state.meta.errors[0]}</span>
      )}
    </div>
  )}
</form.Field>
```

### 3. Use Zod for Complex Validation

```typescript
// ✅ Good: Centralized validation with Zod
const signupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

const form = useForm({
  validatorAdapter: zodValidator,
  validators: { onChange: signupSchema },
  // ...
});
```

---

## Next Steps

**→ Continue to** [Module 5.2: Advanced Form Patterns](./02-advanced-patterns.md)

---

## Summary

- ✅ Installation and setup
- ✅ Basic form creation with useForm
- ✅ Field-level validation
- ✅ Form and field state management
- ✅ Submission handling
- ✅ Server function integration
- ✅ Best practices for forms

**Up Next**: Multi-step forms, dynamic fields, and file uploads!
