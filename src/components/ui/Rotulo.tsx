import { Label } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

interface RotuloProps extends ComponentProps<typeof Label.Root> {
  obrigatorio?: boolean
}

/** Rótulo do Figma: 15px; obrigatório marcado com o asterisco coral de 22px. */
export function Rotulo({ className, obrigatorio, children, ...props }: RotuloProps) {
  return (
    <Label.Root className={cn('inline-flex items-center text-f15 leading-[15px] text-texto', className)} {...props}>
      {children}
      {obrigatorio && (
        <>
          <span className="text-f22 leading-[15px] text-coral" aria-hidden>
            *
          </span>
          <span className="sr-only"> (obrigatório)</span>
        </>
      )}
    </Label.Root>
  )
}
