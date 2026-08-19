# Module 8 — Forms

**Pulse files:** `src/components/AuthForm.tsx`, project create form, settings form

Pulse uses **TanStack Form** with Zod 4 as a Standard Schema validator, and shadcn inputs for the actual fields.

```tsx
const form = useForm({
  defaultValues: { name: '', description: '' },
  validators: { onSubmit: projectSchema },
  onSubmit: async ({ value }) => {
    await create({ data: value })
    form.reset()
    await router.invalidate({ sync: true })
  },
})
```

Render fields with `form.Field` and pending UI with `form.Subscribe`.

## Why not a raw `<form action>` only?

Progressive enhancement is still useful: a native form can POST to a server function that accepts `FormData`. Pulse's auth forms are JS-driven so we can show field errors from Zod and keep the shadcn layout. For a public marketing form, prefer:

```ts
.validator((data) => {
  if (!(data instanceof FormData)) throw new Error('Expected FormData')
  return signupSchema.parse({
    name: data.get('name'),
    email: data.get('email'),
    password: data.get('password'),
  })
})
```

## File uploads

Server functions can accept `FormData`. Read `File` objects only inside the handler. Store blobs in S3/R2; do not put binary files in the JSON course database.

## Accessibility

Every input needs a `Label` with `htmlFor`. Errors belong in text near the field, not only in `alert()`. Destructive actions (delete project) should confirm — Pulse uses an immediate delete for brevity; wrap it in an `AlertDialog` as an exercise.

## Exercise

1. Add client-side max length feedback on project description (280).
2. Convert signup to accept `FormData` as well as JSON.
3. Add an `AlertDialog` around delete project.

## Next

[Module 9 — Authentication](./09-auth.md)
