# Lesson 13.3: Organization Management & Multi-Tenancy

Implement complete organization (multi-tenant) features.

## Creating Organizations

```typescript
export const createOrganization = createServerFn({ method: "POST" }).handler(
  async ({ data, request }) => {
    const session = await requireAuth(request);

    const org = await auth.api.organization.create({
      name: data.name,
      slug: data.slug,
      userId: session.user.id,
    });

    return org;
  }
);
```

## Inviting Members

```typescript
export const inviteMember = createServerFn({ method: "POST" }).handler(
  async ({ organizationId, email, role, request }) => {
    const session = await requireAuth(request);

    // Check if user is org admin
    const member = await auth.api.organization.getMember({
      organizationId,
      userId: session.user.id,
    });

    if (member.role !== "owner" && member.role !== "admin") {
      throw new Error("Insufficient permissions");
    }

    const invitation = await auth.api.organization.inviteMember({
      organizationId,
      email,
      role,
    });

    return invitation;
  }
);
```

## Role-Based Access

```typescript
const rolePermissions = {
  owner: ["*"], // All permissions
  admin: ["members.invite", "members.remove", "settings.edit"],
  member: ["content.view", "content.create"],
};

export function hasPermission(role: string, permission: string): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.includes("*") || permissions.includes(permission);
}
```

## Switching Organizations

```typescript
export const switchOrganization = createServerFn({ method: "POST" }).handler(
  async ({ organizationId, request }) => {
    const session = await requireAuth(request);

    // Verify user is member
    const member = await auth.api.organization.getMember({
      organizationId,
      userId: session.user.id,
    });

    if (!member) {
      throw new Error("Not a member of this organization");
    }

    // Update session context
    await auth.api.setActiveOrganization({
      session: session.session,
      organizationId,
    });

    return { activeOrganization: organizationId };
  }
);
```

**Next:** [Lesson 13.4: RBAC Implementation](./04-rbac.md)
