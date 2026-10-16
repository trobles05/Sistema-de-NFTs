import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Placeholder com shimmer. Recebe as mesmas dimensões do conteúdo final (sem pulo de layout).
 * Com "reduzir movimento", a regra global de padroes.css congela a animação.
 */
export function Esqueleto({ className, ...props }: ComponentProps<'div'>) {
  return <div aria-hidden className={cn('esqueleto rounded-campo', className)} {...props} />
}
