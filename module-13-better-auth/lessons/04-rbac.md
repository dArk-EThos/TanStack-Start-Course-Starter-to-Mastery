# Lesson 13.4: Role-Based Access Control (RBAC)

Advanced permission systems and access control.

## Permission System

```typescript
// Define permissions
type Permission =
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"
  | "org.settings"
  | "org.billing"
  | "content.publish";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: ["*"], // All permissions
  admin: [
    "users.view",
    "users.create",
    "users.edit",
    "org.settings",
    "content.publish",
  ],
  editor: ["users.view", "content.publish"],
  viewer: ["users.view"],
};

export function can(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return (
    permissions.includes("*" as Permission) || permissions.includes(permission)
  );
}
```

## Protected Server Functions

```typescript
export const deleteUser = createServerFn({ method: "POST" }).handler(
  async ({ userId, request }) => {
    const session = await requireAuth(request);

    if (!can(session.user.role, "users.delete")) {
      throw new Error("Insufficient permissions");
    }

    await prisma.user.delete({ where: { id: userId } });
  }
);
```

## Protected Routes

```typescript
// src/routes/_authenticated/_admin.tsx
export const Route = createFileRoute("/_authenticated/_admin")({
  beforeLoad: async ({ context }) => {
    if (!can(context.user.role, "users.view")) {
      throw redirect({ to: "/unauthorized" });
    }
  },
});
```

## Resource-Level Permissions

```typescript
export const editPost = createServerFn({ method: "POST" }).handler(
  async ({ postId, data, request }) => {
    const session = await requireAuth(request);

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    // Check if user owns post or is admin
    const canEdit =
      post.authorId === session.user.id ||
      can(session.user.role, "content.publish");

    if (!canEdit) {
      throw new Error("Cannot edit this post");
    }

    return await prisma.post.update({
      where: { id: postId },
      data,
    });
  }
);
```

**Complete Module!** See exercises for hands-on practice.
