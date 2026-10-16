import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router'
import { BarraAbas } from '@/components/layout/BarraAbas'
import { Cabecalho } from '@/components/layout/Cabecalho'
import { PularConteudo } from '@/components/layout/PularConteudo'
import { Rodape } from '@/components/layout/Rodape'
import type { DadosLayout } from '@/lib/rotas'

/** Moldura das telas da loja: header (desktop), conteúdo, footer e tab bar (mobile). */
export const Route = createFileRoute('/_loja')({
  component: LayoutLoja,
})

function LayoutLoja() {
  // A rota mais específica decide: dados das rotas filhas sobrescrevem os do layout.
  const dados: DadosLayout = Object.assign({}, ...useMatches().map((rota) => rota.staticData))

  return (
    <div className="flex min-h-dvh flex-col">
      <PularConteudo />
      {/* Header fixo no desktop (decisão de UX; o Figma não define). Fundo sólido para o conteúdo passar por baixo. */}
      <div className="sticky top-0 z-30 hidden bg-fundo md:block">
        <Cabecalho secao={dados.secao} divisor={dados.divisor} />
      </div>
      <main id="conteudo" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <div className={dados.telaCheiaMobile ? 'hidden md:block' : undefined}>
        <Rodape />
      </div>
      {dados.barraAbas && <BarraAbas className="md:hidden" />}
    </div>
  )
}
