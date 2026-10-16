import { FILTROS_PADRAO } from '@/lib/catalogo'
import { BannerDestaques } from './BannerDestaques'
import { BannersPromocionais } from './BannersPromocionais'
import { BarraBuscaMobile } from './BarraBuscaMobile'
import { CartaoDestaqueLateral } from './CartaoDestaqueLateral'
import { Catalogo, type CatalogoProps } from './Catalogo'
import { DiarioCunhagem } from './DiarioCunhagem'

/** Conteúdo da Início. Também aparece ao fundo do modal de login/cadastro no desktop (sem interação). */
export function PaginaInicio({ filtros = FILTROS_PADRAO, aoMudar = () => {} }: Partial<CatalogoProps>) {
  return (
    <div className="flex flex-col gap-4 pt-10 md:gap-24 md:pt-8">
      <div className="flex flex-col gap-4 md:contents">
        <BarraBuscaMobile filtros={filtros} aoMudar={aoMudar} />
        <BannerDestaques />
      </div>
      <Catalogo filtros={filtros} aoMudar={aoMudar} rodapeSidebar={<CartaoDestaqueLateral />} />
      <BannersPromocionais />
      <DiarioCunhagem />
    </div>
  )
}
