import { ToggleGroup } from 'radix-ui'
import { cn } from '@/lib/utils'

export interface OpcaoEdicao {
  id: string
  rotulo: string
  esgotada?: boolean
}

interface ChipsEdicaoProps {
  opcoes: readonly OpcaoEdicao[]
  valor: string
  aoMudar: (id: string) => void
  rotulo?: string
  className?: string
}

/**
 * Seleção de edição (1/1, 1/10, 1/50, ABERTA). Navegável por setas; edição esgotada fica
 * desabilitada e diz isso em texto, não só pela aparência.
 */
export function ChipsEdicao({ opcoes, valor, aoMudar, rotulo = 'Edição', className }: ChipsEdicaoProps) {
  return (
    <ToggleGroup.Root
      type="single"
      value={valor}
      onValueChange={(novo) => novo && aoMudar(novo)}
      aria-label={rotulo}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {opcoes.map((opcao) => (
        <ToggleGroup.Item
          key={opcao.id}
          value={opcao.id}
          disabled={opcao.esgotada}
          className={cn(
            'h-7 rounded-full border border-borda-suave px-3 text-f13 text-texto-secundario transition-colors',
            'hover:border-primaria focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque',
            'data-[state=on]:border-primaria data-[state=on]:text-destaque',
            'disabled:cursor-not-allowed disabled:line-through disabled:opacity-50',
          )}
        >
          {opcao.rotulo}
          {opcao.esgotada && <span className="sr-only"> (esgotada)</span>}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
