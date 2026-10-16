import axios, { type AxiosResponse, type CreateAxiosDefaults } from 'axios'
import type { z } from 'zod'
import { ErroHttp, normalizarErro } from './erros'
import { limparSessao, obterSessao } from './sessao'

const ouvintesSessaoInvalida = new Set<() => void>()

/** Avisa quando a API recusa o token da sessão (401 SESSAO_INVALIDA). Devolve a função que cancela. */
export function aoSessaoInvalida(ouvinte: () => void): () => void {
  ouvintesSessaoInvalida.add(ouvinte)
  return () => ouvintesSessaoInvalida.delete(ouvinte)
}

/**
 * Toda chamada REST passa por aqui. Falhas sempre saem como ErroHttp.
 * Sem retry no Axios: quem decide repetir é o TanStack Query (ver queryClient.ts).
 */
export function criarHttp(config: CreateAxiosDefaults = {}) {
  const instancia = axios.create({
    baseURL: '/api',
    timeout: 10_000,
    transitional: { clarifyTimeoutError: true },
    // Listas como `categorias=musica&categorias=jogos` (sem os colchetes padrão do Axios), igual à URL do catálogo.
    paramsSerializer: { indexes: null },
    ...config,
  })

  instancia.interceptors.request.use((requisicao) => {
    const sessao = obterSessao()
    if (sessao) requisicao.headers.set('Authorization', `Bearer ${sessao.token}`)
    return requisicao
  })

  instancia.interceptors.response.use(undefined, (falha: unknown) => {
    const erro = normalizarErro(falha)
    // Só é expiração se a requisição foi autenticada; um 401 de login com senha errada não derruba nada.
    const autenticada = axios.isAxiosError(falha) && Boolean(falha.config?.headers?.Authorization)
    if (erro.codigo === 'SESSAO_INVALIDA' && autenticada) {
      limparSessao()
      for (const ouvinte of ouvintesSessaoInvalida) ouvinte()
    }
    return Promise.reject(erro)
  })

  return instancia
}

export const http = criarHttp()

/** Valida o corpo da resposta contra o contrato; fora do contrato vira ErroHttp RESPOSTA_INVALIDA. */
export async function lerDados<T>(schema: z.ZodType<T>, resposta: Promise<AxiosResponse<unknown>>): Promise<T> {
  const { data, status, config } = await resposta
  const resultado = schema.safeParse(data)
  if (!resultado.success) {
    if (import.meta.env.DEV) console.error(`[http] Resposta fora do contrato em ${config.method?.toUpperCase()} ${config.url}`, resultado.error.issues)
    throw new ErroHttp('RESPOSTA_INVALIDA', 'Resposta fora do contrato da API.', status)
  }
  return resultado.data
}
