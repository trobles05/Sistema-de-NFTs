import { Aba, ListaAbas } from '@/components/ui/Abas'
import { Select, SelectConteudo, SelectGatilho, SelectItem, SelectValor } from '@/components/ui/Select'
import { ROTULOS_ORDENACAO } from '@/lib/catalogo'
import { AbaCatalogoSchema, OrdenacaoCatalogoSchema, type FiltrosCatalogo } from '@/types'

const ROTULOS_ABA = { todos: 'Todos os NFTs', lancamentos: 'Novos lançamentos', 'em-alta': 'Em alta' } as const

/** Abas (dentro de <Abas> do pai) — "Todos os NFTs / Novos lançamentos / Em alta". */
export function AbasCatalogo() {
  return (
    <ListaAbas aria-label="Seleção do catálogo" className="gap-5">
      {AbaCatalogoSchema.options.map((aba) => (
        <Aba key={aba} value={aba} className="text-f14 md:text-f16">
          {ROTULOS_ABA[aba]}
        </Aba>
      ))}
    </ListaAbas>
  )
}

/** "Ordenar por: Listados recentemente ▾". */
export function OrdenacaoCatalogo({ valor, aoMudar }: { valor: FiltrosCatalogo['ordenacao']; aoMudar: (ordenacao: FiltrosCatalogo['ordenacao']) => void }) {
  return (
    <div className="flex items-center gap-1 text-f16">
      <span id="rotulo-ordenacao">Ordenar por:</span>
      <Select value={valor} onValueChange={(novo) => aoMudar(OrdenacaoCatalogoSchema.parse(novo))}>
        <SelectGatilho aria-labelledby="rotulo-ordenacao" className="h-auto w-auto gap-1 border-0 px-0 text-f16 md:h-auto md:text-f16">
          <SelectValor />
        </SelectGatilho>
        <SelectConteudo align="end">
          {OrdenacaoCatalogoSchema.options.map((ordenacao) => (
            <SelectItem key={ordenacao} value={ordenacao}>
              {ROTULOS_ORDENACAO[ordenacao]}
            </SelectItem>
          ))}
        </SelectConteudo>
      </Select>
    </div>
  )
}
