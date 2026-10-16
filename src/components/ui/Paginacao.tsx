import { cn } from '@/lib/utils'

interface PaginacaoProps {
  pagina: number
  totalPaginas: number
  aoMudar: (pagina: number) => void
  className?: string
}

const classesItem =
  'grid size-[35px] place-items-center rounded-[3px] border border-borda-suave text-f14 text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque disabled:cursor-not-allowed disabled:opacity-40'

/** Figma: quadrados de 35px (espaço de 8px), o atual preenchido de laranja; seta ">" para a próxima. */
export function Paginacao({ pagina, totalPaginas, aoMudar, className }: PaginacaoProps) {
  if (totalPaginas <= 1) return null
  return (
    <nav aria-label="Paginação" className={cn('flex items-center gap-2', className)}>
      <button type="button" className={classesItem} disabled={pagina <= 1} onClick={() => aoMudar(pagina - 1)} aria-label="Página anterior">
        ‹
      </button>
      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
        <button
          key={numero}
          type="button"
          onClick={() => aoMudar(numero)}
          aria-current={numero === pagina ? 'page' : undefined}
          aria-label={`Página ${numero}`}
          className={cn(classesItem, numero === pagina && 'border-primaria bg-primaria font-bold text-fundo')}
        >
          {numero}
        </button>
      ))}
      <button type="button" className={classesItem} disabled={pagina >= totalPaginas} onClick={() => aoMudar(pagina + 1)} aria-label="Próxima página">
        ›
      </button>
    </nav>
  )
}
