import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Icone } from '@/components/ui/Icone'
import type { DadosLayout } from '@/lib/rotas'
import { AcessoConta } from './AcessoConta'
import { BuscaCabecalho } from './BuscaCabecalho'
import { cn } from '@/lib/utils'

interface CabecalhoProps extends Pick<DadosLayout, 'secao' | 'divisor'> {
  /** Itens no carrinho; o selo só aparece com 1 ou mais (dado real chega na T-020). */
  quantidadeCarrinho?: number
  className?: string
}

/** Texto do item + sublinhado laranja (3px) quando ativo, como no Figma. */
function RotuloMenu({ ativo, children }: { ativo: boolean; children: ReactNode }) {
  return (
    <>
      {children}
      <span aria-hidden className={cn('h-[3px] w-full', ativo ? 'bg-primaria' : 'bg-transparent')} />
    </>
  )
}

const classeItemMenu = (ativo: boolean) =>
  cn(
    'flex flex-col gap-6 text-f16 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-destaque',
    ativo ? 'font-bold text-destaque' : 'text-texto hover:text-destaque',
  )

const classeAcao = 'relative grid size-8 place-items-center text-texto hover:text-destaque focus-visible:outline-2 focus-visible:outline-destaque'

/**
 * "Header Row" do Figma (1200px): logo, menu com item ativo sublinhado, busca, carrinho com selo e Entrar.
 * Aparece a partir de `md`; no mobile cada tela tem o próprio topo.
 */
export function Cabecalho({ secao = 'inicio', divisor = true, quantidadeCarrinho = 0, className }: CabecalhoProps) {
  const ehInicio = secao === 'inicio'
  const ehMercado = secao === 'mercado'

  return (
    <header className={cn('mx-auto w-full max-w-[1200px] px-4 pt-6 xl:px-0', className)}>
      <div className={cn('flex items-start justify-between', divisor && 'border-b border-borda-suave')}>
        <Link to="/" className="py-2 text-f14 font-bold tracking-[0.1em] focus-visible:outline-2 focus-visible:outline-destaque md:w-[120px] lg:w-[160px]">
          KURIO
        </Link>

        <nav aria-label="Principal">
          <ul className="flex gap-6 lg:gap-10">
            <li>
              <Link to="/" aria-current={ehInicio ? 'page' : undefined} className={classeItemMenu(ehInicio)}>
                <RotuloMenu ativo={ehInicio}>Início</RotuloMenu>
              </Link>
            </li>
            <li>
              <Link to="/" hash="catalogo" aria-current={ehMercado ? 'page' : undefined} className={classeItemMenu(ehMercado)}>
                <RotuloMenu ativo={ehMercado}>Mercado</RotuloMenu>
              </Link>
            </li>
            <li>
              <Link to="/em-breve" search={{ secao: 'Criadores' }} className={classeItemMenu(false)}>
                <RotuloMenu ativo={false}>Criadores</RotuloMenu>
              </Link>
            </li>
            <li>
              <Link to="/em-breve" search={{ secao: 'Aprenda' }} className={classeItemMenu(false)}>
                <RotuloMenu ativo={false}>Aprenda</RotuloMenu>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-5 lg:gap-7">
          <BuscaCabecalho />
          <Link
            to="/carrinho"
            aria-label={quantidadeCarrinho > 0 ? `Carrinho, ${quantidadeCarrinho} ${quantidadeCarrinho === 1 ? 'item' : 'itens'}` : 'Carrinho'}
            className={classeAcao}
          >
            <Icone nome="carrinho" tamanho={24} />
            {quantidadeCarrinho > 0 && (
              <span aria-hidden className="absolute -top-0.5 right-0 grid size-4 place-items-center rounded-full bg-primaria text-f10 font-medium text-fundo">
                {quantidadeCarrinho > 9 ? '9+' : quantidadeCarrinho}
              </span>
            )}
          </Link>
          <AcessoConta />
        </div>
      </div>
    </header>
  )
}
