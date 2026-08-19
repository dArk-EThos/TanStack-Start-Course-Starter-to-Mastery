import { describe, expect, it } from 'vitest'
import { loginSchema, projectSchema, signupSchema } from './schemas'
import { hashPassword, verifyPassword } from './password.server'

describe('schemas', () => {
  it('rejects a short password on signup', () => {
    const result = signupSchema.safeParse({
      name: 'Ada',
      email: 'ada@pulse.dev',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('accepts a valid login payload', () => {
    const result = loginSchema.safeParse({
      email: 'ada@pulse.dev',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('requires a project name', () => {
    const result = projectSchema.safeParse({ name: '', description: '' })
    expect(result.success).toBe(false)
  })
})

describe('password hashing', () => {
  it('verifies a matching password', async () => {
    const hash = await hashPassword('password123')
    await expect(verifyPassword('password123', hash)).resolves.toBe(true)
    await expect(verifyPassword('wrong', hash)).resolves.toBe(false)
  })
})
