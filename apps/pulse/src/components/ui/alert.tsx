import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={cn('rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive', className)}
      {...props}
    />
  )
}
