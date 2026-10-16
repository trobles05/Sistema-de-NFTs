import { AbaConteudo, Abas } from '@/components/ui/Abas'
import { Paginacao } from '@/components/ui/Paginacao'
import { useCatalogo } from '@/hooks/useCatalogo'
import { AbaCatalogoSchema, type FiltrosCatalogo as Filtros } from '@/types'
import { AbasCatalogo, OrdenacaoCatalogo } from './BarraCatalogo'
import { FiltrosCatalogo } from './FiltrosCatalogo'
import { GradeEsqueleto } from './EsqueletoCartaoNft'
import { AvisoAtualizacao, EstadoErro, EstadoVazio } from './EstadosCatalogo'
import { GradeNfts } from './GradeNfts'

export interface CatalogoProps {
  filtros: Filtros
  /** Atualiza a URL. `pagina` só muda quando pedida; qualquer outro filtro volta para a página 1. */
  aoMudar: (parcial: Partial<Filtros>, opcoes?: { substituir?: boolean }) => void
  /** Conteúdo extra abaixo dos filtros na sidebar desktop (o card "NFT em destaque"). */
  rodapeSidebar?: React.ReactNode
}

/** Catálogo da Início: sidebar de filtros, abas, ordenação, grade e paginação. Todo o estado vem da URL. */
export function Catalogo({ filtros, aoMudar, rodapeSidebar }: CatalogoProps) {
  const consulta = useCatalogo(filtros)
  const pagina = consulta.data
  const atualizando = consulta.isFetching && !consulta.isPending

  return (
    <section id="catalogo" aria-labelledby="titulo-catalogo" className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 xl:px-0">
      <h2 id="titulo-catalogo" className="sr-only">
        Catálogo de NFTs
      </h2>

      <div className="flex gap-12">
        <aside aria-label="Filtros" className="hidden w-[310px] shrink-0 flex-col gap-6 md:flex">
          <FiltrosCatalogo filtros={filtros} facetas={pagina?.facetas} aoMudar={aoMudar} />
          {rodapeSidebar}
        </aside>

        <Abas value={filtros.aba} onValueChange={(aba) => aoMudar({ aba: AbaCatalogoSchema.parse(aba) })} className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-transparent pb-8">
            <AbasCatalogo />
            <div className="hidden items-center gap-4 md:flex">
              <span aria-live="polite" className="text-f13 text-texto-terciario">
                {atualizando ? 'Atualizando…' : ''}
              </span>
              <OrdenacaoCatalogo valor={filtros.ordenacao} aoMudar={(ordenacao) => aoMudar({ ordenacao })} />
            </div>
          </div>

          <AbaConteudo value={filtros.aba} aria-busy={consulta.isFetching} className="focus-visible:outline-none">
            {consulta.isError && !pagina ? (
              <EstadoErro erro={consulta.error} tentando={consulta.isFetching} aoTentar={() => void consulta.refetch()} />
            ) : !pagina ? (
              <>
                <p className="sr-only" aria-live="polite">
                  Carregando NFTs…
                </p>
                <GradeEsqueleto />
              </>
            ) : pagina.total === 0 ? (
              <EstadoVazio aoLimpar={() => aoMudar({ busca: undefined, categorias: undefined, redes: undefined, precoMin: undefined, precoMax: undefined, aba: 'todos' })} />
            ) : (
              <>
                {consulta.isError && <AvisoAtualizacao tentando={consulta.isFetching} aoTentar={() => void consulta.refetch()} />}
                <p className="sr-only" aria-live="polite">
                  {pagina.total} NFTs encontrados, página {pagina.pagina} de {pagina.totalPaginas}.
                </p>
                <GradeNfts itens={pagina.itens} />
                <Paginacao className="mt-16 justify-end" pagina={pagina.pagina} totalPaginas={pagina.totalPaginas} aoMudar={(numero) => aoMudar({ pagina: numero })} />
              </>
            )}
          </AbaConteudo>
        </Abas>
      </div>
    </section>
  )
}
