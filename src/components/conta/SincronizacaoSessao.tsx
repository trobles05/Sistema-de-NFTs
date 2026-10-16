import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { assinarSessao, obterSessao } from '@/lib/sessao'

/**
 * Toda troca de token (login, logout, outra conta em outra aba, sessão derrubada pela API) descarta
 * o cache inteiro — nenhum dado privado do usuário anterior sobrevive — e reavalia as rotas protegidas.
 */
export function SincronizacaoSessao() {
  const queryClient = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    let tokenAnterior = obterSessao()?.token ?? null
    return assinarSessao((sessao) => {
      const token = sessao?.token ?? null
      if (token === tokenAnterior) return
      tokenAnterior = token
      queryClient.clear()
      void router.invalidate()
    })
  }, [queryClient, router])

  return null
}
