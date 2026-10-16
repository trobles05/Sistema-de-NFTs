import { createFileRoute, stripSearchParams, useNavigate, type SearchSchemaInput } from '@tanstack/react-router'
import { PaginaInicio } from '@/components/catalogo/PaginaInicio'
import { FILTROS_PADRAO, filtrosDaUrl } from '@/lib/catalogo'
import type { FiltrosCatalogo } from '@/types'

/**
 * Busca, filtros, aba, ordenação e página moram na URL (§3): refresh, link colado e voltar/avançar
 * restauram o mesmo catálogo. Valores padrão saem da URL para ela ficar limpa.
 */
export const Route = createFileRoute('/_loja/')({
  // Entrada opcional: um <Link to="/"> simples abre o catálogo padrão.
  validateSearch: (bruto: Partial<FiltrosCatalogo> & SearchSchemaInput): FiltrosCatalogo => filtrosDaUrl(bruto),
  search: { middlewares: [stripSearchParams({ aba: FILTROS_PADRAO.aba, ordenacao: FILTROS_PADRAO.ordenacao, pagina: FILTROS_PADRAO.pagina })] },
  staticData: { secao: 'inicio', divisor: true, barraAbas: true },
  component: Inicio,
})

function Inicio() {
  const filtros = Route.useSearch()
  const navigate = useNavigate({ from: '/' })

  return (
    <PaginaInicio
      filtros={filtros}
      aoMudar={(parcial, opcoes) =>
        void navigate({
          search: (anterior) => ({ ...anterior, ...parcial, pagina: parcial.pagina ?? 1 }),
          replace: opcoes?.substituir ?? false,
          resetScroll: false,
          // Trocar de página leva ao topo do catálogo; filtros mantêm a rolagem onde está.
          hash: parcial.pagina ? 'catalogo' : undefined,
        })
      }
    />
  )
}
