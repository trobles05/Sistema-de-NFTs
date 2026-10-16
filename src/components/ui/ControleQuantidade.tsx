import { cn } from '@/lib/utils'
import { Icone } from './Icone'

interface ControleQuantidadeProps {
  valor: number
  aoMudar: (valor: number) => void
  minimo?: number
  maximo: number
  /** Nome do item, para o leitor de tela ("Diminuir quantidade de Emerald Ape #042"). */
  item?: string
  tamanho?: 'padrao' | 'grande'
  className?: string
}

const TAMANHOS = {
  padrao: { botao: 'h-[30px] w-5', icone: 16 },
  grande: { botao: 'h-[49.5px] w-[33px]', icone: 26 },
} as const

/** As pílulas laranja −/+ do Figma (ícones Iconly). Respeita mínimo e máximo (disponibilidade / limite por pedido). */
export function ControleQuantidade({ valor, aoMudar, minimo = 1, maximo, item, tamanho = 'padrao', className }: ControleQuantidadeProps) {
  const sufixo = item ? ` de ${item}` : ''
  const classesBotao = cn(
    'grid shrink-0 place-items-center rounded-full bg-primaria font-bold text-fundo leading-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque disabled:cursor-not-allowed disabled:opacity-40',
    TAMANHOS[tamanho].botao,
  )
  return (
    <div className={cn('inline-flex items-center gap-3', className)} role="group" aria-label={`Quantidade${sufixo}`}>
      <button type="button" className={classesBotao} disabled={valor <= minimo} onClick={() => aoMudar(valor - 1)} aria-label={`Diminuir quantidade${sufixo}`}>
        <Icone nome="menos" tamanho={TAMANHOS[tamanho].icone} />
      </button>
      <output aria-live="polite" className={cn('min-w-6 text-center text-texto', tamanho === 'grande' ? 'text-f18' : 'text-f16')}>
        {valor}
      </output>
      <button type="button" className={classesBotao} disabled={valor >= maximo} onClick={() => aoMudar(valor + 1)} aria-label={`Aumentar quantidade${sufixo}`}>
        <Icone nome="mais" tamanho={TAMANHOS[tamanho].icone} />
      </button>
    </div>
  )
}
