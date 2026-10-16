import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useSyncExternalStore } from 'react'
import { assinarSessao, limparSessao, obterSessao, salvarSessao } from '@/lib/sessao'
import { servicoSessao } from '@/services/sessao'
import type { Sessao } from '@/types'

export const CHAVE_SESSAO = ['sessao'] as const

function assinarToken(aoMudar: () => void) {
  return assinarSessao(aoMudar)
}

/** Token atual (string estável para o React comparar). */
function useToken() {
  return useSyncExternalStore(assinarToken, () => obterSessao()?.token ?? null)
}

/** Usuário logado: consulta a API só quando há token salvo; sem token, `usuario` é `null` na hora. */
export function useSessao() {
  const token = useToken()
  const consulta = useQuery({
    queryKey: [...CHAVE_SESSAO, token],
    queryFn: ({ signal }) => servicoSessao.consultar(signal),
    enabled: token !== null,
    staleTime: 5 * 60_000,
  })
  return {
    usuario: token ? (consulta.data?.usuario ?? null) : null,
    carregando: token !== null && consulta.isPending,
  }
}

/**
 * Grava a nova sessão. A troca de token já descarta o cache inteiro (SincronizacaoSessao), então
 * nada do usuário anterior sobrevive; em seguida o cache da sessão nova é preenchido.
 */
function useIniciarSessao() {
  const queryClient = useQueryClient()
  return (sessao: Sessao) => {
    salvarSessao(sessao)
    queryClient.setQueryData([...CHAVE_SESSAO, sessao.token], sessao)
  }
}

export function useEntrar() {
  const iniciar = useIniciarSessao()
  return useMutation({ mutationFn: servicoSessao.entrar, onSuccess: iniciar })
}

export function useCadastrar() {
  const iniciar = useIniciarSessao()
  return useMutation({ mutationFn: servicoSessao.cadastrar, onSuccess: iniciar })
}

/** Logout: avisa a API (falha de rede não impede sair), apaga o token e volta para a Início. */
export function useSair() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: () => servicoSessao.sair().catch(() => undefined),
    onSettled: () => {
      limparSessao()
      void navigate({ to: '/' })
    },
  })
}
