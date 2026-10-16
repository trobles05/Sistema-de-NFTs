import { useState } from 'react'
import { Botao } from '@/components/ui/Botao'
import { FaixaPreco } from '@/components/ui/FaixaPreco'
import { centavosParaEth, ethParaCentavos, FAIXA_PRECO_CENTAVOS, ROTULOS_CATEGORIA, ROTULOS_REDE } from '@/lib/catalogo'
import { cn } from '@/lib/utils'
import { CategoriaSchema, RedeSchema, type FiltrosCatalogo as Filtros, type PaginaCatalogo } from '@/types'
import { formatarEth } from '@/utils/eth'

interface FiltrosCatalogoProps {
  filtros: Filtros
  facetas?: PaginaCatalogo['facetas']
  aoMudar: (parcial: Partial<Filtros>) => void
  className?: string
}

/** Liga/desliga um valor na lista (seleção múltipla). Lista vazia vira `undefined` para sair da URL. */
function alternar<T>(lista: readonly T[] | undefined, valor: T): T[] | undefined {
  const atual = lista ?? []
  const nova = atual.includes(valor) ? atual.filter((v) => v !== valor) : [...atual, valor]
  return nova.length ? nova : undefined
}

function OpcaoFiltro({ rotulo, contagem, ativa, negritoContagem, aoClicar }: { rotulo: string; contagem?: number; ativa: boolean; negritoContagem?: boolean; aoClicar: () => void }) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={ativa}
        onClick={aoClicar}
        className={cn(
          'flex w-full items-center justify-between rounded-campo px-3 text-left text-f15 leading-[40px] transition-colors',
          'hover:text-destaque focus-visible:outline-2 focus-visible:outline-destaque',
          ativa ? 'text-destaque' : 'text-texto-secundario',
        )}
      >
        <span className="flex items-center gap-2">
          {rotulo}
          {ativa && <span className="sr-only">(selecionado)</span>}
        </span>
        {contagem !== undefined && <span className={cn(negritoContagem && 'font-bold', ativa && 'font-bold')}>({contagem})</span>}
      </button>
    </li>
  )
}

/** Faixa de preço: o slider trabalha em centavos inteiros; só vale ao clicar em "Aplicar". */
function FiltroPreco({ filtros, aoMudar }: Pick<FiltrosCatalogoProps, 'filtros' | 'aoMudar'>) {
  const [minimo, maximo] = FAIXA_PRECO_CENTAVOS
  const [faixa, setFaixa] = useState<number[]>([filtros.precoMin ? ethParaCentavos(filtros.precoMin) : minimo, filtros.precoMax ? ethParaCentavos(filtros.precoMax) : maximo])
  const [de = minimo, ate = maximo] = faixa

  return (
    <div className="flex flex-col gap-4 px-3">
      <FaixaPreco min={minimo} max={maximo} step={1} minStepsBetweenThumbs={1} value={faixa} onValueChange={setFaixa} />
      <p className="text-f15" aria-live="polite">
        Preço: {formatarEth(centavosParaEth(de))} - {formatarEth(centavosParaEth(ate))} ETH
      </p>
      <Botao
        tamanho="compacto"
        className="h-9 w-fit rounded-[4px] bg-branco px-3 text-f16 hover:bg-texto"
        onClick={() =>
          aoMudar({
            precoMin: de > minimo ? centavosParaEth(de) : undefined,
            precoMax: ate < maximo ? centavosParaEth(ate) : undefined,
          })
        }
      >
        Aplicar
      </Botao>
    </div>
  )
}

/** Sidebar "Filters" do Figma: Coleções, Faixa de preço e Rede, com as contagens que a API devolve. */
export function FiltrosCatalogo({ filtros, facetas, aoMudar, className }: FiltrosCatalogoProps) {
  return (
    <div className={cn('flex flex-col gap-8 bg-superficie p-5', className)}>
      <section aria-labelledby="filtro-colecoes" className="flex flex-col gap-2">
        <h2 id="filtro-colecoes" className="text-f18 font-bold">
          Coleções
        </h2>
        <ul>
          {CategoriaSchema.options.map((categoria) => (
            <OpcaoFiltro
              key={categoria}
              rotulo={ROTULOS_CATEGORIA[categoria]}
              contagem={facetas?.categorias[categoria]}
              negritoContagem
              ativa={filtros.categorias?.includes(categoria) ?? false}
              aoClicar={() => aoMudar({ categorias: alternar(filtros.categorias, categoria) })}
            />
          ))}
        </ul>
      </section>

      <section aria-labelledby="filtro-preco" className="flex flex-col gap-4">
        <h2 id="filtro-preco" className="text-f18 font-bold">
          Faixa de preço
        </h2>
        {/* `key` reinicia o slider quando a faixa muda por fora (voltar do navegador, limpar filtros). */}
        <FiltroPreco key={`${filtros.precoMin}-${filtros.precoMax}`} filtros={filtros} aoMudar={aoMudar} />
      </section>

      <section aria-labelledby="filtro-rede" className="flex flex-col gap-2">
        <h2 id="filtro-rede" className="text-f18 font-bold">
          Rede
        </h2>
        <ul>
          {RedeSchema.options.map((rede) => (
            <OpcaoFiltro
              key={rede}
              rotulo={ROTULOS_REDE[rede]}
              contagem={facetas?.redes[rede]}
              ativa={filtros.redes?.includes(rede) ?? false}
              aoClicar={() => aoMudar({ redes: alternar(filtros.redes, rede) })}
            />
          ))}
        </ul>
      </section>
    </div>
  )
}
