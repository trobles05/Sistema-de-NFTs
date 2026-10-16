import { cn } from '@/lib/utils'

/** "X" fino do Figma (canto dos modais), desenhado com duas linhas para herdar a cor. */
export function IconeFechar({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-block size-3.5', className)} aria-hidden>
      <span className="absolute top-1/2 left-0 h-px w-full rotate-45 bg-current" />
      <span className="absolute top-1/2 left-0 h-px w-full -rotate-45 bg-current" />
    </span>
  )
}
