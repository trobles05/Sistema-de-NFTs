import { getResponse, http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ErroApiSchema } from '@/types'
import { criarArmazenamentoMemoria, type Armazenamento } from '@/lib/armazenamento'
import { CENARIOS, CHAVE_CENARIO, criarEstadoCenario, criarHandlerRede, NOMES_CENARIO, type EstadoCenario } from '.'

let armazenamento: Armazenamento
let estado: EstadoCenario

const negocio = http.all('*/api/*', () => HttpResponse.json({ ok: true }))

/** Executa a requisição pelo handler de rede + um handler de negócio fictício, avançando os timers. */
async function requisitar(metodo: string, caminho: string) {
  const resposta = getResponse([criarHandlerRede(estado), negocio], new Request(`http://localhost${caminho}`, { method: metodo }))
  await vi.runAllTimersAsync()
  return resposta
}

beforeEach(() => {
  vi.useFakeTimers()
  armazenamento = criarArmazenamentoMemoria()
  estado = criarEstadoCenario({ armazenamento })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('seleção de cenário', () => {
  it('começa no padrão e todos os cenários do plano existem', () => {
    expect(estado.cenarioAtual().nome).toBe('padrao')
    expect(Object.keys(CENARIOS)).toEqual([...NOMES_CENARIO])
  })

  it('seleciona pela URL, persiste e sobrevive a um refresh', () => {
    const { cenario, resetar } = estado.selecionarPelaUrl(new URL('http://localhost/?cenario=lento&reset-mocks'))
    expect(cenario.nome).toBe('lento')
    expect(resetar).toBe(true)
    expect(armazenamento.getItem(CHAVE_CENARIO)).toBe('lento')
    expect(criarEstadoCenario({ armazenamento }).cenarioAtual().nome).toBe('lento')
  })

  it('URL sem cenário mantém o salvo', () => {
    estado.definirCenario('offline')
    expect(estado.selecionarPelaUrl(new URL('http://localhost/carrinho')).cenario.nome).toBe('offline')
  })

  it('nome desconhecido cai no padrão com aviso', () => {
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    expect(estado.definirCenario('inexistente').nome).toBe('padrao')
    expect(aviso).toHaveBeenCalledOnce()
    aviso.mockRestore()
  })

  it('cenários de comportamento só ligam suas flags', () => {
    expect(CENARIOS['pagamento-recusado'].flags.resultadoPagamento).toBe('recusado')
    expect(CENARIOS['timeout-pedido'].flags.atrasoRespostaPedidoMs).toBeGreaterThan(10_000)
    expect(CENARIOS.padrao.flags).toMatchObject({ catalogoVazio: false, expirarSessao: false, resultadoPagamento: 'confirmado' })
  })
})

describe('condições de rede', () => {
  it('padrão deixa passar com latência na faixa e a sequência se repete igual', () => {
    const latencias = Array.from({ length: 5 }, () => estado.avaliar('GET', '/api/nfts').latenciaMs)
    for (const ms of latencias) {
      expect(ms).toBeGreaterThanOrEqual(150)
      expect(ms).toBeLessThanOrEqual(400)
    }
    const outro = criarEstadoCenario({ armazenamento: criarArmazenamentoMemoria() })
    expect(Array.from({ length: 5 }, () => outro.avaliar('GET', '/api/nfts').latenciaMs)).toEqual(latencias)
  })

  it('padrão entrega a resposta do handler de negócio', async () => {
    const resposta = await requisitar('GET', '/api/nfts')
    expect(await resposta?.json()).toEqual({ ok: true })
  })

  it('instável falha a 1ª chamada de cada rota com 503 e a nova tentativa passa', async () => {
    estado.definirCenario('instavel')
    const primeira = await requisitar('GET', '/api/nfts')
    expect(primeira?.status).toBe(503)
    expect(ErroApiSchema.parse(await primeira?.json()).erro.codigo).toBe('FALHA_TRANSITORIA')
    expect((await requisitar('GET', '/api/nfts'))?.status).toBe(200)
    expect((await requisitar('GET', '/api/carrinho'))?.status).toBe(503)
  })

  it('offline devolve erro de rede', async () => {
    estado.definirCenario('offline')
    const resposta = await requisitar('POST', '/api/auth/login')
    expect(resposta?.type).toBe('error')
  })

  it('erro-servidor quebra só o catálogo', async () => {
    estado.definirCenario('erro-servidor')
    expect((await requisitar('GET', '/api/nfts'))?.status).toBe(500)
    expect((await requisitar('GET', '/api/nfts/nft-001'))?.status).toBe(500)
    expect((await requisitar('GET', '/api/carrinho'))?.status).toBe(200)
  })

  it('fora-de-ordem faz a 1ª busca demorar mais que a 2ª, só na listagem', () => {
    estado.definirCenario('fora-de-ordem')
    const primeira = estado.avaliar('GET', '/api/nfts').latenciaMs
    const segunda = estado.avaliar('GET', '/api/nfts').latenciaMs
    expect(primeira).toBeGreaterThan(segunda)
    expect(estado.avaliar('GET', '/api/nfts/nft-001').latenciaMs).toBeLessThanOrEqual(400)
  })

  it('trocar de cenário reinicia os contadores', async () => {
    estado.definirCenario('instavel')
    await requisitar('GET', '/api/nfts')
    estado.definirCenario('instavel')
    expect((await requisitar('GET', '/api/nfts'))?.status).toBe(503)
  })

  it('não interfere em requisições fora de /api', async () => {
    estado.definirCenario('offline')
    const resposta = await getResponse([criarHandlerRede(estado)], new Request('http://localhost/assets/logo.svg'))
    expect(resposta).toBeUndefined()
  })
})
