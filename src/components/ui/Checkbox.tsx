import { Checkbox as CheckboxRadix } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Figma desenha as opções "Usar outra carteira?" / "Igual à carteira principal" como círculo. */
export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxRadix.Root>) {
  return (
    <CheckboxRadix.Root
      className={cn(
        'grid size-4 shrink-0 place-items-center rounded-full border border-primaria',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxRadix.Indicator className="size-2 rounded-full bg-primaria" />
    </CheckboxRadix.Root>
  )
}
