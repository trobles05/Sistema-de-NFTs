import { Botao } from '@/components/ui/Botao'
import { Gaveta, GavetaConteudo, GavetaGatilho } from '@/components/ui/Gaveta'
import { Icone } from '@/components/ui/Icone'
import { useCatalogo } from '@/hooks/useCatalogo'
import type { CatalogoProps } from './Catalogo'
import { OrdenacaoCatalogo } from './BarraCatalogo'
import { CampoBusca } from './CampoBusca'
import { FiltrosCatalogo } from './FiltrosCatalogo'

/** Topo da Início mobile: "Explorar coleções" + botão de filtros (abre ordenação e sidebar numa gaveta). */
export function BarraBuscaMobile({ filtros, aoMudar }: Pick<CatalogoProps, 'filtros' | 'aoMudar'>) {
  // Mesma chave do catálogo: não faz outra requisição, só lê as contagens do cache.
  const { data } = useCatalogo(filtros)
  return (
    <div className="mx-auto flex w-full max-w-[414px] gap-2 px-6 md:hidden">
      <CampoBusca valor={filtros.busca ?? ''} aoBuscar={(busca) => aoMudar({ busca: busca || undefined }, { substituir: true })} placeholder="Explorar coleções" className="flex-1" />
      <Gaveta>
        <GavetaGatilho asChild>
          <Botao tamanho="icone" aria-label="Filtros" className="size-[45px] rounded-campo-mobile bg-(image:--degrade-primaria) hover:opacity-90">
            <Icone nome="filtro" tamanho={22} />
          </Botao>
        </GavetaGatilho>
        <GavetaConteudo titulo="Filtros">
          {/* O Figma mobile não mostra a ordenação; ela fica aqui para o §3 valer também no celular. */}
          <div className="mb-6">
            <OrdenacaoCatalogo valor={filtros.ordenacao} aoMudar={(ordenacao) => aoMudar({ ordenacao })} />
          </div>
          <FiltrosCatalogo filtros={filtros} facetas={data?.facetas} aoMudar={aoMudar} className="-mx-6 bg-transparent p-0" />
        </GavetaConteudo>
      </Gaveta>
    </div>
  )
}
