import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { optionalUserMiddleware } from '@/lib/middleware'
import { loginSchema, signupSchema } from '@/lib/schemas'
import {
  createId,
  publicUser,
  readOnly,
  withDb,
} from '@/lib/db.server'
import { dummyPasswordHash, hashPassword, verifyPassword } from '@/lib/password.server'
import { destroySession, issueSession } from '@/lib/session.server'

export const getCurrentUser = createServerFn({ method: 'GET' })
  .middleware([optionalUserMiddleware])
  .handler(async ({ context }) => context.user)

export const signupFn = createServerFn({ method: 'POST' })
  .validator(signupSchema)
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase()
    const existing = await readOnly((db) =>
      db.users.find((user) => user.email === email),
    )
    if (existing) {
      throw new Error('An account with that email already exists')
    }

    const user = await withDb(async (db) => {
      const created = {
        id: createId(),
        name: data.name,
        email,
        passwordHash: await hashPassword(data.password),
        createdAt: Date.now(),
      }
      db.users.push(created)
      return created
    })

    await issueSession(user)
    throw redirect({ to: '/dashboard' })
  })

export const loginFn = createServerFn({ method: 'POST' })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase()
    const user = await readOnly((db) =>
      db.users.find((item) => item.email === email),
    )
    const hashToCheck = user?.passwordHash ?? (await dummyPasswordHash())
    const passwordMatches = await verifyPassword(data.password, hashToCheck)

    if (!user || !passwordMatches) {
      throw new Error('Invalid email or password')
    }

    await issueSession(user)
    throw redirect({ to: '/dashboard' })
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  await destroySession()
  throw redirect({ to: '/' })
})

export const getPublicStats = createServerFn({ method: 'GET' }).handler(
  async () => {
    return readOnly((db) => ({
      users: db.users.length,
      projects: db.projects.length,
      tasks: db.tasks.length,
    }))
  },
)
