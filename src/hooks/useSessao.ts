import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import { assinarSessao, obterSessao, salvarSessao } from '@/lib/sessao'
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

/** Entrar com outra conta substitui a anterior: o cache inteiro é descartado antes de gravar a nova sessão. */
function useIniciarSessao() {
  const queryClient = useQueryClient()
  return (sessao: Sessao) => {
    queryClient.clear()
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

