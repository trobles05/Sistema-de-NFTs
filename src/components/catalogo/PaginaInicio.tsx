import { FILTROS_PADRAO } from '@/lib/catalogo'
import { BarraBuscaMobile } from './BarraBuscaMobile'
import { Catalogo, type CatalogoProps } from './Catalogo'

/** Conteúdo da Início. Também aparece ao fundo do modal de login/cadastro no desktop (sem interação). */
export function PaginaInicio({ filtros = FILTROS_PADRAO, aoMudar = () => {} }: Partial<CatalogoProps>) {
  return (
    <div className="flex flex-col gap-4 pt-10 md:gap-24 md:pt-8">
      {/* O título visível da página chega com o banner de destaques (parte 2/2). */}
      <h1 className="sr-only">Kurio — catálogo de NFTs</h1>
      <BarraBuscaMobile filtros={filtros} aoMudar={aoMudar} />
      <Catalogo filtros={filtros} aoMudar={aoMudar} />
    </div>
  )
}
