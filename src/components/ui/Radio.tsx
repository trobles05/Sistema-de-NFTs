import { RadioGroup } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Grupo navegável por setas (Radix). Figma: anel laranja de 16px com ponto central quando marcado. */
export function GrupoRadio({ className, ...props }: ComponentProps<typeof RadioGroup.Root>) {
  return <RadioGroup.Root className={cn('grid gap-3', className)} {...props} />
}

export function Radio({ className, ...props }: ComponentProps<typeof RadioGroup.Item>) {
  return (
    <RadioGroup.Item
      className={cn(
        'grid size-4 shrink-0 place-items-center rounded-full border border-primaria',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioGroup.Indicator className="size-2 rounded-full bg-primaria" />
    </RadioGroup.Item>
  )
}
