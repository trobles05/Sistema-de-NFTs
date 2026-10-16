import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { Botao } from '@/components/ui/Botao'

/** Destino de tudo que está fora do escopo do desafio: deixa claro que não funciona, em vez de simular. */
export const Route = createFileRoute('/_loja/em-breve')({
  validateSearch: z.object({ secao: z.string().trim().max(60).optional() }),
  staticData: { divisor: true, barraAbas: true },
  component: EmBreve,
})

function EmBreve() {
  const { secao } = Route.useSearch()
  return (
    <section className="mx-auto flex max-w-[600px] flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-f24 font-bold">Em breve</h1>
      <p className="text-f15 leading-[24px] text-texto-secundario">
        {secao ? <strong className="text-texto">{secao}</strong> : 'Esta seção'} não faz parte desta demonstração da Kurio.
      </p>
      <Botao asChild className="mt-4">
        <Link to="/">Voltar para o início</Link>
      </Botao>
    </section>
  )
}
