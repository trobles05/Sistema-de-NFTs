import { Link, useRouterState } from '@tanstack/react-router'
import { Botao } from '@/components/ui/Botao'
import { Esqueleto } from '@/components/ui/Esqueleto'
import { Icone } from '@/components/ui/Icone'
import { useSessao } from '@/hooks/useSessao'

/**
 * Botão da direita do header. Sem sessão: "Entrar" (Figma). Com sessão: o primeiro nome levando ao
 * perfil — estado que o Figma não desenhou, derivado do mesmo botão.
 */
export function AcessoConta() {
  const { usuario, carregando } = useSessao()
  const paginaAtual = useRouterState({ select: (estado) => estado.location.href })

  if (carregando) return <Esqueleto className="h-[35px] w-[100px] rounded-cabecalho" />

  if (usuario) {
    const primeiroNome = usuario.nomeExibicao.split(' ')[0]
    return (
      <Botao asChild tamanho="cabecalho" className="max-w-[160px] min-w-[100px] gap-1">
        <Link to="/perfil" aria-label={`Meu perfil (${usuario.nomeExibicao})`}>
          <Icone nome="usuario" tamanho={18} />
          <span className="truncate">{primeiroNome}</span>
        </Link>
      </Botao>
    )
  }

  return (
    <Botao asChild tamanho="cabecalho" className="w-[100px] gap-1">
      <Link to="/entrar" search={{ redirect: paginaAtual }}>
        <Icone nome="sair" tamanho={20} />
        Entrar
      </Link>
    </Botao>
  )
}
