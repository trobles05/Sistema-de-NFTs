import { createFileRoute, useNavigate, type SearchSchemaInput } from '@tanstack/react-router'
import { z } from 'zod'
import { PaginaDetalheNft } from '@/components/nft/PaginaDetalheNft'

/** Edição escolhida e quantidade ficam na URL: link compartilhável e refresh mantêm a seleção. */
const BuscaDetalheSchema = z.object({
  edicao: z.string().max(80).optional().catch(undefined),
  quantidade: z.coerce.number().int().min(1).max(999).optional().catch(undefined),
})

export const Route = createFileRoute('/_loja/nft/$id')({
  validateSearch: (bruto: z.input<typeof BuscaDetalheSchema> & SearchSchemaInput) => BuscaDetalheSchema.parse(bruto),
  staticData: { secao: 'mercado', divisor: false, barraAbas: false, telaCheiaMobile: true },
  component: Detalhe,
})

function Detalhe() {
  const { id } = Route.useParams()
  const { edicao, quantidade } = Route.useSearch()
  const navigate = useNavigate({ from: '/nft/$id' })

  return (
    <PaginaDetalheNft
      id={id}
      edicaoId={edicao}
      quantidade={quantidade ?? 1}
      aoMudar={(mudanca) =>
        void navigate({
          // Trocar de edição volta a quantidade para 1; ajustar a quantidade não cria passo no histórico.
          search: (anterior) => ({ ...anterior, ...mudanca, ...(mudanca.edicao ? { quantidade: undefined } : {}) }),
          replace: mudanca.quantidade !== undefined,
          resetScroll: false,
        })
      }
    />
  )
}
