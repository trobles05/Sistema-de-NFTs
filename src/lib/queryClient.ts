import { QueryClient } from '@tanstack/react-query'
import { ehErroTransitorio } from './erros'

export const MAX_NOVAS_TENTATIVAS = 2

/**
 * Consultas só repetem falhas transitórias (instabilidade, rede, timeout), até 2 vezes.
 * Validação, sessão, permissão, inexistente e conflito não mudam ao repetir.
 */
export function deveRepetirConsulta(falhas: number, erro: unknown): boolean {
  return falhas < MAX_NOVAS_TENTATIVAS && ehErroTransitorio(erro)
}

/** 0,5 s, 1 s (teto de 4 s). */
export function atrasoNovaTentativa(tentativa: number): number {
  return Math.min(500 * 2 ** tentativa, 4000)
}

export function criarQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: deveRepetirConsulta,
        retryDelay: atrasoNovaTentativa,
        staleTime: 30_000,
        refetchOnWindowFocus: true,
      },
      // Mutations nunca repetem sozinhas: repetir uma compra poderia duplicá-la.
      // O pedido se recupera pela chave de idempotência (T-027).
      mutations: { retry: false },
    },
  })
}

export const queryClient = criarQueryClient()
