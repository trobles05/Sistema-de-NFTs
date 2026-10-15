import { delay, http, HttpResponse } from 'msw'
import type { ErroApi } from '@/types'
import { estadoCenario as estadoPadrao, type EstadoCenario } from './estado'

/**
 * Handler "porteiro": registrado antes de todos os outros em /api/*. Aplica latência e falhas
 * do cenário ativo; sem falha, não responde nada e a requisição segue para o handler de negócio.
 */
export function criarHandlerRede(estado: EstadoCenario = estadoPadrao) {
  return http.all('*/api/*', async ({ request }) => {
    const { latenciaMs, falha } = estado.avaliar(request.method, new URL(request.url).pathname)
    if (latenciaMs > 0) await delay(latenciaMs)
    if (falha === 'rede') return HttpResponse.error()
    if (falha) {
      return HttpResponse.json<ErroApi>({ erro: { codigo: falha.codigo, mensagem: falha.mensagem } }, { status: falha.status })
    }
  })
}
