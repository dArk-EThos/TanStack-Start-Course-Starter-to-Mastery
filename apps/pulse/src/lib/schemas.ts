import { z } from 'zod'

export const emailSchema = z.email()

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  description: z.string().max(280),
})

export const taskStatusSchema = z.enum(['todo', 'doing', 'done'])

export const createTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1, 'Title is required').max(140),
  status: taskStatusSchema.default('todo'),
})

export const updateTaskSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().min(1).max(140).optional(),
  status: taskStatusSchema.optional(),
})

export const projectIdSchema = z.object({
  projectId: z.string().min(1),
})

export const taskIdSchema = z.object({
  taskId: z.string().min(1),
})

export const profileSchema = z.object({
  name: z.string().min(2).max(80),
})

export const projectSearchSchema = z.object({
  q: z.string().optional().default(''),
  status: z.union([taskStatusSchema, z.literal('all')]).optional().default('all'),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type TaskStatus = z.infer<typeof taskStatusSchema>
