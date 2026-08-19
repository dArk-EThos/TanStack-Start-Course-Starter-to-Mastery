import { createStart } from '@tanstack/react-start'
import { originCheckMiddleware, requestLoggerMiddleware } from '@/lib/middleware'

export const startInstance = createStart(() => ({
  requestMiddleware: [originCheckMiddleware, requestLoggerMiddleware],
}))
