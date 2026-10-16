import { Icone } from '@/components/ui/Icone'
import { cn } from '@/lib/utils'

/** 5 estrelas (as cheias em laranja), com a nota em texto para leitor de tela. */
export function EstrelasAvaliacao({ media, className }: { media: number; className?: string }) {
  const cheias = Math.round(media)
  return (
    <span role="img" aria-label={`Avaliação ${media.toLocaleString('pt-BR')} de 5`} className={cn('flex gap-1.5', className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icone key={i} nome="estrela" tamanho={15} className={i < cheias ? 'text-primaria' : 'text-borda-suave'} />
      ))}
    </span>
  )
}
