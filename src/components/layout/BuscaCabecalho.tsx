import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { CampoBusca } from '@/components/catalogo/CampoBusca'
import { Icone } from '@/components/ui/Icone'
import { filtrosDaUrl } from '@/lib/catalogo'
import { cn } from '@/lib/utils'

/**
 * O Figma desktop não tem campo de busca, só a lupa no header: ela abre o campo logo abaixo.
 * A busca leva ao catálogo da Início (mantendo os outros filtros se já estiver nele).
 */
export function BuscaCabecalho({ className }: { className?: string }) {
  const [aberta, setAberta] = useState(false)
  const botao = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const { naInicio, buscaAtual } = useRouterState({
    select: (estado) => ({
      naInicio: estado.location.pathname === '/',
      buscaAtual: estado.location.pathname === '/' ? ((estado.location.search as { busca?: string }).busca ?? '') : '',
    }),
    structuralSharing: true,
  })

  function fechar() {
    setAberta(false)
    botao.current?.focus()
  }

  return (
    <div className={cn('relative', className)}>
      <button
        ref={botao}
        type="button"
        aria-label="Buscar NFTs"
        aria-expanded={aberta}
        aria-controls="busca-cabecalho"
        onClick={() => setAberta((a) => !a)}
        className="grid size-8 place-items-center text-texto hover:text-destaque focus-visible:outline-2 focus-visible:outline-destaque"
      >
        <Icone nome="busca" tamanho={20} />
      </button>
      {aberta && (
        <div id="busca-cabecalho" className="absolute top-full right-0 z-40 mt-4 w-[340px] shadow-2xl" onKeyDown={(e) => e.key === 'Escape' && fechar()}>
          <CampoBusca
            valor={buscaAtual}
            autoFocus
            placeholder="Buscar NFTs, coleções..."
            className="[&_input]:border [&_input]:border-borda-suave"
            aoBuscar={(busca) =>
              void navigate({
                to: '/',
                search: (anterior) => ({ ...(naInicio ? filtrosDaUrl(anterior as Record<string, unknown>) : {}), busca: busca || undefined, pagina: 1 }),
                // Digitar na própria Início não empilha histórico; vindo de outra tela, cria o passo normal.
                replace: naInicio,
                hash: 'catalogo',
                resetScroll: false,
              })
            }
          />
        </div>
      )}
    </div>
  )
}
