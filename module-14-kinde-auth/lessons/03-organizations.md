# Lesson 14.3: Organizations & Multi-Tenancy with Kinde

Kinde provides built-in organization management for multi-tenant applications.

## Creating Organizations

```typescript
// Client-side
import { kindeClient } from "@/lib/auth/kinde-client";

export async function createOrganization(name: string) {
  await kindeClient.createOrg({
    org_name: name,
  });
}
```

## Organization Management API

```typescript
// Server-side with Kinde Management API
import { KindeManagementClient } from "@kinde/management-api-js";

const kindeManagement = new KindeManagementClient({
  domain: process.env.KINDE_DOMAIN!,
  clientId: process.env.KINDE_M2M_CLIENT_ID!,
  clientSecret: process.env.KINDE_M2M_CLIENT_SECRET!,
});

// Get organizations for user
export async function getUserOrganizations(userId: string) {
  const orgs = await kindeManagement.organizations.getUserOrganizations({
    userId,
  });
  return orgs.organizations;
}

// Get organization details
export async function getOrganization(orgCode: string) {
  return await kindeManagement.organizations.getOrganization({
    orgCode,
  });
}

// Update organization
export async function updateOrganization(
  orgCode: string,
  data: {
    name?: string;
    external_id?: string;
  }
) {
  return await kindeManagement.organizations.updateOrganization({
    orgCode,
    name: data.name,
    external_id: data.external_id,
  });
}
```

## Inviting Users to Organizations

```typescript
// Send organization invitation
export async function inviteUserToOrganization(
  orgCode: string,
  email: string,
  roles: string[]
) {
  return await kindeManagement.organizations.createOrganizationUserInvitation({
    orgCode,
    email,
    roles,
  });
}

// Get pending invitations
export async function getOrganizationInvitations(orgCode: string) {
  return await kindeManagement.organizations.getOrganizationUserInvitations({
    orgCode,
  });
}
```

## Switching Organizations

```typescript
// Client-side organization switching
export async function switchOrganization(orgCode: string) {
  await kindeClient.login({
    authUrlParams: {
      org_code: orgCode,
    },
  });
}

// Get current organization
export async function getCurrentOrganization() {
  const user = await kindeClient.getUser();
  return user.org_code;
}
```

## Organization Context

```typescript
// Get organization from session
export async function getOrganizationContext() {
  const user = await kindeClient.getUser();

  if (!user.org_code) {
    return null;
  }

  return {
    code: user.org_code,
    name: user.org_name,
  };
}

// Protected route with organization check
export const Route = createFileRoute("/_authenticated/_org")({
  beforeLoad: async () => {
    const org = await getOrganizationContext();

    if (!org) {
      throw redirect({ to: "/select-organization" });
    }

    return { organization: org };
  },
});
```

## Managing Organization Members

```typescript
// Get organization users
export async function getOrganizationUsers(orgCode: string) {
  return await kindeManagement.organizations.getOrganizationUsers({
    orgCode,
  });
}

// Remove user from organization
export async function removeUserFromOrganization(
  orgCode: string,
  userId: string
) {
  return await kindeManagement.organizations.removeOrganizationUser({
    orgCode,
    userId,
  });
}

// Update user roles in organization
export async function updateOrganizationUserRoles(
  orgCode: string,
  userId: string,
  roleIds: string[]
) {
  return await kindeManagement.organizations.updateOrganizationUserRoles({
    orgCode,
    userId,
    roles: roleIds.map((id) => ({ id })),
  });
}
```

**Next:** [Lesson 14.4: Permissions & Roles](./04-permissions.md)
