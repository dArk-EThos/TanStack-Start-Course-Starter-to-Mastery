# Lesson 14.4: Permissions & Role-Based Access Control

Kinde provides built-in RBAC with roles, permissions, and feature flags.

## Checking Permissions

```typescript
// Client-side permission check
import { kindeClient } from "@/lib/auth/kinde-client";

export async function hasPermission(permission: string): Promise<boolean> {
  const permissions = await kindeClient.getPermissions();
  return permissions.permissions.includes(permission);
}

// Multiple permissions
export async function hasAllPermissions(
  requiredPermissions: string[]
): Promise<boolean> {
  const { permissions } = await kindeClient.getPermissions();
  return requiredPermissions.every((p) => permissions.includes(p));
}

export async function hasAnyPermission(
  requiredPermissions: string[]
): Promise<boolean> {
  const { permissions } = await kindeClient.getPermissions();
  return requiredPermissions.some((p) => permissions.includes(p));
}
```

## Role Management

```typescript
// Get user roles
export async function getUserRoles() {
  const user = await kindeClient.getUser();
  return user.roles || [];
}

// Check if user has role
export async function hasRole(roleName: string): Promise<boolean> {
  const roles = await getUserRoles();
  return roles.some((role) => role.key === roleName);
}

// Management API - Create custom role
export async function createRole(data: {
  key: string;
  name: string;
  description?: string;
}) {
  return await kindeManagement.roles.createRole({
    key: data.key,
    name: data.name,
    description: data.description,
  });
}

// Add permissions to role
export async function addPermissionsToRole(
  roleId: string,
  permissionIds: string[]
) {
  return await kindeManagement.roles.updateRolePermissions({
    roleId,
    permissions: permissionIds.map((id) => ({ id })),
  });
}
```

## Protected Components

```typescript
// Permission-based component rendering
export function ProtectedComponent({
  permission,
  fallback,
  children,
}: {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    hasPermission(permission).then(setAllowed);
  }, [permission]);

  if (!allowed) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Usage
<ProtectedComponent permission="delete:posts">
  <button onClick={deletePost}>Delete</button>
</ProtectedComponent>;
```

## Server-Side Authorization

```typescript
// Protect server functions with permissions
import { createServerFn } from "@tanstack/start";

export const deletePost = createServerFn({ method: "POST" }).handler(
  async ({ postId, request }) => {
    // Get user from Kinde token
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    const user = await verifyKindeToken(token!);

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Check permission
    if (!user.permissions?.includes("delete:posts")) {
      throw new Error("Insufficient permissions");
    }

    await prisma.post.delete({ where: { id: postId } });
  }
);
```

## Feature Flags

```typescript
// Get feature flags
export async function getFeatureFlags() {
  const flags = await kindeClient.getFlags();
  return flags;
}

// Check specific feature flag
export async function isFeatureEnabled(flagKey: string): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[flagKey]?.value === true;
}

// Feature flag component
export function FeatureFlag({
  flag,
  children,
  fallback,
}: {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    isFeatureEnabled(flag).then(setEnabled);
  }, [flag]);

  return <>{enabled ? children : fallback}</>;
}

// Usage
<FeatureFlag flag="new_dashboard">
  <NewDashboard />
</FeatureFlag>;
```

## Custom Claims

```typescript
// Get custom user properties
export async function getUserMetadata() {
  const user = await kindeClient.getUser();

  return {
    department: user.properties?.department,
    employeeId: user.properties?.employee_id,
    customRole: user.properties?.custom_role,
  };
}

// Set custom properties (Management API)
export async function updateUserProperties(
  userId: string,
  properties: Record<string, any>
) {
  return await kindeManagement.users.updateUserProperties({
    userId,
    properties,
  });
}
```

## Permission Patterns

```typescript
// Define permission structure
const PERMISSIONS = {
  USERS: {
    VIEW: "view:users",
    CREATE: "create:users",
    EDIT: "edit:users",
    DELETE: "delete:users",
  },
  POSTS: {
    VIEW: "view:posts",
    CREATE: "create:posts",
    EDIT: "edit:posts",
    DELETE: "delete:posts",
    PUBLISH: "publish:posts",
  },
  ORG: {
    MANAGE_MEMBERS: "manage:org_members",
    MANAGE_SETTINGS: "manage:org_settings",
    VIEW_BILLING: "view:billing",
  },
} as const;

// Role definitions
const ROLES = {
  ADMIN: {
    permissions: [
      ...Object.values(PERMISSIONS.USERS),
      ...Object.values(PERMISSIONS.POSTS),
      ...Object.values(PERMISSIONS.ORG),
    ],
  },
  EDITOR: {
    permissions: [
      PERMISSIONS.POSTS.VIEW,
      PERMISSIONS.POSTS.CREATE,
      PERMISSIONS.POSTS.EDIT,
      PERMISSIONS.POSTS.PUBLISH,
    ],
  },
  VIEWER: {
    permissions: [PERMISSIONS.POSTS.VIEW, PERMISSIONS.USERS.VIEW],
  },
};

// Permission helper
export async function can(permission: string): Promise<boolean> {
  return await hasPermission(permission);
}
```

## Module Complete! 🎉

**See exercises for hands-on practice with Kinde.**
