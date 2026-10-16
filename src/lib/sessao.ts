import { z } from 'zod'
import type { Sessao } from '@/types'
import { armazenamentoPadrao, type Armazenamento } from './armazenamento'

const CHAVE_SESSAO = 'kurio:sessao'

/** O que fica no navegador: só o necessário para autenticar. Nada de senha ou dados de perfil. */
const SessaoLocalSchema = z.object({
  token: z.string().min(1),
  expiraEm: z.iso.datetime(),
  usuarioId: z.string().min(1),
})
export type SessaoLocal = z.infer<typeof SessaoLocalSchema>

let armazenamento: Armazenamento | undefined
const storage = () => (armazenamento ??= armazenamentoPadrao())
const ouvintes = new Set<(sessao: SessaoLocal | null) => void>()

/** Troca o armazenamento (testes). */
export function usarArmazenamentoSessao(novo: Armazenamento) {
  armazenamento = novo
}

function notificar(sessao: SessaoLocal | null) {
  for (const ouvinte of ouvintes) ouvinte(sessao)
}

/** Sessão salva e ainda válida; expirada ou corrompida conta como inexistente. */
export function obterSessao(agora = Date.now()): SessaoLocal | null {
  const salvo = storage().getItem(CHAVE_SESSAO)
  if (!salvo) return null
  try {
    const resultado = SessaoLocalSchema.safeParse(JSON.parse(salvo))
    if (!resultado.success || Date.parse(resultado.data.expiraEm) <= agora) return null
    return resultado.data
  } catch {
    return null
  }
}

export function salvarSessao({ token, expiraEm, usuario }: Sessao) {
  const sessao: SessaoLocal = { token, expiraEm, usuarioId: usuario.id }
  storage().setItem(CHAVE_SESSAO, JSON.stringify(sessao))
  notificar(sessao)
}

export function limparSessao() {
  storage().removeItem(CHAVE_SESSAO)
  notificar(null)
}

// Login/logout em outra aba chega pelo evento "storage": avisa os ouvintes desta aba também.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (evento) => {
    if (evento.key === CHAVE_SESSAO || evento.key === null) notificar(obterSessao())
  })
}

/** Avisa a cada login, logout ou limpeza por sessão inválida (nesta ou em outra aba). Devolve a função que cancela. */
export function assinarSessao(ouvinte: (sessao: SessaoLocal | null) => void): () => void {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}
