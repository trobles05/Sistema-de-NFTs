import { createFileRoute } from '@tanstack/react-router'

/** Provisória: a tela real chega na T-020. */
export const Route = createFileRoute('/_loja/carrinho')({
  staticData: { secao: 'mercado', divisor: false, barraAbas: false },
  component: () => (
    <section className="mx-auto flex max-w-[600px] flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-f24 font-bold">Carrinho de NFTs</h1>
      <p className="text-f14 text-texto-secundario">Tela em construção.</p>
    </section>
  ),
})
