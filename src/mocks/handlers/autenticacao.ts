import type { Usuario } from '@/types'
import { estadoCenario } from '../cenarios'
import { banco } from '../db'
import { responderErro } from './respostas'

/** Validade de uma sessão nova. */
export const DURACAO_SESSAO_MS = 2 * 60 * 60 * 1000

export function lerToken(request: Request): string | null {
  const cabecalho = request.headers.get('Authorization')
  return cabecalho?.startsWith('Bearer ') ? cabecalho.slice('Bearer '.length) : null
}

const sessaoExpirada = () => responderErro(401, 'SESSAO_INVALIDA', 'Sua sessão expirou. Entre novamente para continuar.')

function apagarSessao(token: string) {
  banco.alterar((db) => {
    delete db.sessoes[token]
  })
}

/**
 * Base de toda rota privada: devolve o usuário dono do token ou a resposta 401 pronta.
 * Uso: `const usuario = autenticar(request); if (usuario instanceof Response) return usuario`.
 */
export function autenticar(request: Request): Usuario | Response {
  const token = lerToken(request)
  if (!token) return sessaoExpirada()

  const sessao = banco.ler().sessoes[token]
  if (!sessao || Date.parse(sessao.expiraEm) <= Date.now()) {
    if (sessao) apagarSessao(token)
    return sessaoExpirada()
  }

  // Cenário "sessao-expirada": a primeira chamada autenticada derruba a sessão (expiração no meio do uso).
  if (estadoCenario.cenarioAtual().flags.expirarSessao && estadoCenario.consumirUmaVez('expirar-sessao')) {
    apagarSessao(token)
    return sessaoExpirada()
  }

  const registro = banco.ler().usuarios.find((u) => u.usuario.id === sessao.usuarioId)
  return registro ? registro.usuario : sessaoExpirada()
}
