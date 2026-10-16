import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_loja/')({
  staticData: { secao: 'inicio', divisor: true, barraAbas: true },
  component: Inicio,
})

function Inicio() {
  return (
    <section id="catalogo" className="mx-auto flex min-h-dvh max-w-[1200px] flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-f43 font-bold tracking-[0.1em]">KURIO</h1>
      <p className="text-f14 text-texto-secundario">Destaques e catálogo chegam na T-015.</p>
    </section>
  )
}
