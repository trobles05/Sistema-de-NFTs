import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Selo "RARO" do Figma: fundo laranja, texto escuro em negrito. */
export function Selo({ className, ...props }: ComponentProps<'span'>) {
  return <span className={cn('inline-flex items-center bg-primaria px-3 py-1 text-f14 font-bold text-fundo uppercase', className)} {...props} />
}
