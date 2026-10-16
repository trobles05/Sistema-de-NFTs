import { Fragment, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Trilha {
  rotulo: string
  /** Link do trecho; o último (página atual) fica sem link. */
  link?: ReactNode
}

/** "Início / Mercado / Carrinho" do Figma. */
export function Breadcrumb({ trilha, className }: { trilha: readonly Trilha[]; className?: string }) {
  return (
    <nav aria-label="Você está em" className={cn('text-f15 font-bold text-texto', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {trilha.map((trecho, i) => {
          const atual = i === trilha.length - 1
          return (
            <Fragment key={trecho.rotulo}>
              <li aria-current={atual ? 'page' : undefined}>{atual ? trecho.rotulo : (trecho.link ?? trecho.rotulo)}</li>
              {!atual && (
                <li aria-hidden className="text-texto-secundario">
                  /
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
