import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/lib/middleware'
import { createId, readOnly, withDb } from '@/lib/db.server'
import {
  createTaskSchema,
  projectIdSchema,
  taskIdSchema,
  updateTaskSchema,
} from '@/lib/schemas'

export const listTasks = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(projectIdSchema)
  .handler(async ({ context, data }) => {
    return readOnly((db) => {
      const project = db.projects.find(
        (item) => item.id === data.projectId && item.userId === context.user.id,
      )
      if (!project) throw new Error('Project not found')
      return db.tasks
        .filter((task) => task.projectId === data.projectId)
        .sort((a, b) => b.createdAt - a.createdAt)
    })
  })

export const createTask = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createTaskSchema)
  .handler(async ({ context, data }) => {
    const task = await withDb((db) => {
      const project = db.projects.find(
        (item) => item.id === data.projectId && item.userId === context.user.id,
      )
      if (!project) throw new Error('Project not found')
      const created = {
        id: createId(),
        projectId: data.projectId,
        userId: context.user.id,
        title: data.title,
        status: data.status ?? 'todo',
        createdAt: Date.now(),
      }
      db.tasks.push(created)
      return created
    })
    return task
  })

export const updateTask = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateTaskSchema)
  .handler(async ({ context, data }) => {
    return withDb((db) => {
      const task = db.tasks.find(
        (item) => item.id === data.taskId && item.userId === context.user.id,
      )
      if (!task) throw new Error('Task not found')
      if (data.title !== undefined) task.title = data.title
      if (data.status !== undefined) task.status = data.status
      return task
    })
  })

export const deleteTask = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(taskIdSchema)
  .handler(async ({ context, data }) => {
    await withDb((db) => {
      const task = db.tasks.find(
        (item) => item.id === data.taskId && item.userId === context.user.id,
      )
      if (!task) throw new Error('Task not found')
      db.tasks = db.tasks.filter((item) => item.id !== data.taskId)
    })
    return { ok: true as const }
  })
