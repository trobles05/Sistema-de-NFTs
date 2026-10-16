import { createFileRoute } from '@tanstack/react-router'

/** Provisória: a tela de detalhe do NFT chega na T-017. */
export const Route = createFileRoute('/_loja/nft/$id')({
  staticData: { secao: 'mercado', divisor: false, barraAbas: false },
  component: function DetalheProvisorio() {
    const { id } = Route.useParams()
    return (
      <section className="mx-auto flex max-w-[600px] flex-col items-center gap-3 px-4 py-24 text-center">
        <h1 className="text-f24 font-bold">Detalhes do NFT</h1>
        <p className="text-f14 text-texto-secundario">{id} · Tela em construção.</p>
      </section>
    )
  },
})
