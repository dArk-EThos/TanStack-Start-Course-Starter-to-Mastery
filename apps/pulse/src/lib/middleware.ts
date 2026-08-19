import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { getSessionUser } from './session.server'

export const originCheckMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest()
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('origin')
    if (origin && origin !== new URL(request.url).origin) {
      throw new Error('Origin check failed')
    }
  }
  return next()
})

export const requestLoggerMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const started = Date.now()
    const result = await next()
    const url = new URL(request.url)
    console.log(`${request.method} ${url.pathname} ${Date.now() - started}ms`)
    return result
  },
)

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const user = await getSessionUser()
    if (!user) {
      throw new Error('Unauthorized')
    }
    return next({ context: { user } })
  },
)

export const optionalUserMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const user = await getSessionUser()
    return next({ context: { user } })
  },
)
