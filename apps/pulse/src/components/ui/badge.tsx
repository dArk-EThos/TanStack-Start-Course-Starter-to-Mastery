import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        done: 'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
        doing: 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300',
        todo: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
