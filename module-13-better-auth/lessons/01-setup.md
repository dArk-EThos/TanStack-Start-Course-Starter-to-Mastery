# Lesson 13.1: Better Auth Setup & Configuration

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Database Setup with Prisma](#database-setup-with-prisma)
4. [Better Auth Configuration](#better-auth-configuration)
5. [Environment Variables](#environment-variables)
6. [Testing the Setup](#testing-the-setup)

---

## Introduction

Better Auth is a comprehensive authentication library that provides enterprise-grade features with minimal configuration. It's framework-agnostic and works seamlessly with TanStack Start.

---

## Installation

### Install Dependencies

```bash
# Core dependencies
pnpm add better-auth @prisma/client bcrypt nodemailer

# Dev dependencies
pnpm add -D prisma @types/nodemailer @types/bcrypt
```

### Initialize Prisma

```bash
npx prisma init
```

---

## Database Setup with Prisma

### Configure PostgreSQL

```env
# .env
DATABASE_URL="postgresql://username:password@localhost:5432/myapp?schema=public"
```

###Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Better Auth Models
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  organizations OrganizationMember[]

  @@map("users")
}

model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  ipAddress    String?
  userAgent    String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

model Organization {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  logo        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members     OrganizationMember[]

  @@map("organizations")
}

model OrganizationMember {
  id             String   @id @default(uuid())
  userId         String
  organizationId String
  role           String   @default("member")
  createdAt      DateTime @default(now())

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
  @@map("organization_members")
}
```

### Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Better Auth Configuration

### Create Auth Instance

```typescript
// src/lib/auth/config.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";
import { organization, admin, twoFactor, emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  plugins: [
    organization({
      async sendInvitationEmail(data) {
        // Email sending logic with Nodemailer
        await sendOrganizationInvite(data);
      },
    }),
    admin(),
    twoFactor({
      issuer: "MyApp",
    }),
    emailOTP(),
  ],

  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      await sendVerificationEmail(user.email, url);
    },
  },
});

export type Session = typeof auth.$Infer.Session;
```

### Email Service with Nodemailer

```typescript
// src/lib/email/service.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, url: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Verify your email",
    html: `
      <h1>Verify your email</h1>
      <p>Click the link below to verify your email:</p>
      <a href="${url}">Verify Email</a>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, url: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset your password",
    html: `
      <h1>Reset your password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${url}">Reset Password</a>
    `,
  });
}

export async function sendOrganizationInvite(data: {
  email: string;
  organizationName: string;
  inviteUrl: string;
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.email,
    subject: `Invitation to join ${data.organizationName}`,
    html: `
      <h1>You've been invited!</h1>
      <p>You've been invited to join ${data.organizationName}.</p>
      <a href="${data.inviteUrl}">Accept Invitation</a>
    `,
  });
}
```

### API Route Handler

```typescript
// src/routes/api/auth/[...all].ts
import { auth } from "@/lib/auth/config";
import { toWebRequest, toWebResponse } from "better-auth";

export async function GET(request: Request) {
  return auth.handler(toWebRequest(request));
}

export async function POST(request: Request) {
  return auth.handler(toWebRequest(request));
}
```

---

## Environment Variables

### Complete .env File

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/myapp?schema=public"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-characters"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@myapp.com"
```

### Type-Safe Environment

```typescript
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string(),
  SMTP_FROM: z.string().email(),
});

export const env = envSchema.parse(process.env);
```

---

## Testing the Setup

### Verify Database Connection

```bash
npx prisma studio
```

### Test Email Sending

```typescript
// scripts/test-email.ts
import { sendVerificationEmail } from "@/lib/email/service";

async function test() {
  await sendVerificationEmail(
    "test@example.com",
    "http://localhost:3000/verify?token=test"
  );
  console.log("Email sent!");
}

test();
```

---

## Summary

- ✅ Installed Better Auth and dependencies
- ✅ Configured Prisma with PostgreSQL
- ✅ Set up Better Auth with plugins
- ✅ Configured email service with Nodemailer
- ✅ Created API routes for authentication
- ✅ Set up environment variables

**Next:** [Lesson 13.2: Authentication Fundamentals](./02-authentication.md)
