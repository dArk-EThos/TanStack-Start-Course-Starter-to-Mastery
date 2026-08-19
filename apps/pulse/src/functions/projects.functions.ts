import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/lib/middleware'
import { createId, readOnly, withDb } from '@/lib/db.server'
import { profileSchema, projectIdSchema, projectSchema } from '@/lib/schemas'

export const listProjects = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return readOnly((db) =>
      db.projects
        .filter((project) => project.userId === context.user.id)
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((project) => ({
          ...project,
          taskCount: db.tasks.filter((task) => task.projectId === project.id)
            .length,
          doneCount: db.tasks.filter(
            (task) => task.projectId === project.id && task.status === 'done',
          ).length,
        })),
    )
  })

export const getProject = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(projectIdSchema)
  .handler(async ({ context, data }) => {
    return readOnly((db) => {
      const project = db.projects.find(
        (item) => item.id === data.projectId && item.userId === context.user.id,
      )
      if (!project) throw notFound()
      return project
    })
  })

export const createProject = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(projectSchema)
  .handler(async ({ context, data }) => {
    const project = {
      id: createId(),
      userId: context.user.id,
      name: data.name,
      description: data.description ?? '',
      createdAt: Date.now(),
    }
    await withDb((db) => {
      db.projects.push(project)
    })
    return project
  })

export const deleteProject = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(projectIdSchema)
  .handler(async ({ context, data }) => {
    await withDb((db) => {
      const project = db.projects.find(
        (item) => item.id === data.projectId && item.userId === context.user.id,
      )
      if (!project) throw new Error('Project not found')
      db.projects = db.projects.filter((item) => item.id !== data.projectId)
      db.tasks = db.tasks.filter((item) => item.projectId !== data.projectId)
    })
    return { ok: true as const }
  })

export const getDashboardData = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return readOnly((db) => {
      const projects = db.projects.filter(
        (project) => project.userId === context.user.id,
      )
      const tasks = db.tasks.filter((task) => task.userId === context.user.id)
      return {
        projectCount: projects.length,
        taskCount: tasks.length,
        doneCount: tasks.filter((task) => task.status === 'done').length,
        recentTasks: tasks
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 6),
      }
    })
  })

export const updateProfile = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(profileSchema)
  .handler(async ({ context, data }) => {
    await withDb((db) => {
      const user = db.users.find((item) => item.id === context.user.id)
      if (!user) throw new Error('User not found')
      user.name = data.name
    })
    return { ok: true as const }
  })
