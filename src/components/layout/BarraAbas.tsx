import { Link, type LinkProps } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import botaoCentral from '@/assets/icons/barra-abas/botao-central.svg'
import escanear from '@/assets/icons/barra-abas/escanear.svg'
import fundo from '@/assets/icons/barra-abas/fundo.svg'
import { Icone, type NomeIcone } from '@/components/ui/Icone'
import { cn } from '@/lib/utils'

type Aba = { rotulo: string; icone: NomeIcone; to: LinkProps['to']; centroX: number }

/** Posições do Figma (Tab Bar 414px): centro de cada ícone em relação ao meio da barra. */
const ABAS: readonly Aba[] = [
  { rotulo: 'Início', icone: 'casa', to: '/', centroX: -161 },
  { rotulo: 'Favoritos', icone: 'coracao-cheio', to: '/favoritos', centroX: -89 },
  { rotulo: 'Carrinho', icone: 'carrinho-cheio', to: '/carrinho', centroX: 95 },
  { rotulo: 'Perfil', icone: 'usuario-cheio', to: '/perfil', centroX: 157 },
]

/** Some enquanto o footer está na tela, para ele aparecer inteiro. */
function useRodapeVisivel() {
  const [visivel, setVisivel] = useState(false)
  useEffect(() => {
    const rodape = document.getElementById('rodape')
    if (!rodape) return
    const observador = new IntersectionObserver(([entrada]) => setVisivel(Boolean(entrada?.isIntersecting)))
    observador.observe(rodape)
    return () => observador.disconnect()
  }, [])
  return visivel
}

/**
 * Tab bar mobile do Figma: fundo vetorial com recorte, botão central flutuante ("Explorar")
 * e 4 abas. Escondida, sai da ordem do Tab (`inert`).
 */
export function BarraAbas({ className }: { className?: string }) {
  const escondida = useRodapeVisivel()

  return (
    <nav
      aria-label="Navegação rápida"
      inert={escondida}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 h-[126px] overflow-hidden transition-transform duration-300',
        escondida && 'translate-y-full',
        className,
      )}
    >
      {/* Acima de 414px, faixas laterais estendem a barra até as bordas da tela. */}
      <span aria-hidden className="absolute bottom-0 left-0 h-[95px] w-[calc(50%-178px)] bg-superficie" />
      <span aria-hidden className="absolute right-0 bottom-0 h-[95px] w-[calc(50%-178px)] bg-superficie" />
      <img src={fundo} alt="" width={474} height={155} className="pointer-events-none absolute -top-[9px] left-[calc(50%-237px)] max-w-none" />

      <Link
        to="/"
        hash="catalogo"
        aria-label="Explorar coleções"
        className="absolute top-0 left-[calc(50%-32px)] grid size-[65px] place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque"
      >
        <img src={botaoCentral} alt="" width={65} height={65} className="absolute inset-0" />
        <img src={escanear} alt="" width={27} height={24} className="relative" />
      </Link>

      {ABAS.map((aba) => (
        <Link
          key={aba.rotulo}
          to={aba.to}
          aria-label={aba.rotulo}
          style={{ left: `calc(50% + ${aba.centroX - 22}px)` }}
          className="absolute top-[59px] grid size-11 place-items-center text-texto-secundario focus-visible:outline-2 focus-visible:outline-destaque"
          activeProps={{ 'aria-current': 'page', className: 'text-destaque' }}
          activeOptions={{ exact: true, includeHash: false }}
        >
          <Icone nome={aba.icone} tamanho={20} />
        </Link>
      ))}
    </nav>
  )
}
