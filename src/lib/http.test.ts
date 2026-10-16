import { delay, http as mock, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { z } from 'zod'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ErroApi, Sessao } from '@/types'
import { criarArmazenamentoMemoria } from './armazenamento'
import { ErroHttp, mensagemAmigavel } from './erros'
import { aoSessaoInvalida, criarHttp, lerDados } from './http'
import { atrasoNovaTentativa, deveRepetirConsulta } from './queryClient'
import { assinarSessao, obterSessao, salvarSessao, usarArmazenamentoSessao } from './sessao'

const BASE = 'http://kurio.test/api'
const servidor = setupServer()
const cliente = criarHttp({ baseURL: BASE })

const sessao: Sessao = {
  token: 'tok-ana',
  expiraEm: '2099-01-01T00:00:00.000Z',
  usuario: { id: 'usr-ana', nomeUsuario: 'ana.souza', nomeExibicao: 'Ana Souza', email: 'ana@kurio.dev', avatarUrl: null },
}

const erroApi = (corpo: ErroApi['erro'], status: number) => HttpResponse.json<ErroApi>({ erro: corpo }, { status })

/** Executa a chamada e devolve o ErroHttp lançado. */
async function falhaDe(chamada: Promise<unknown>): Promise<ErroHttp> {
  const erro = await chamada.then(
    () => null,
    (e: unknown) => e,
  )
  expect(erro).toBeInstanceOf(ErroHttp)
  return erro as ErroHttp
}

beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => usarArmazenamentoSessao(criarArmazenamentoMemoria()))
afterEach(() => servidor.resetHandlers())
afterAll(() => servidor.close())

describe('sessão', () => {
  it('salva só token, expiração e id do usuário, e avisa os ouvintes', () => {
    const ouvinte = vi.fn()
    const cancelar = assinarSessao(ouvinte)
    salvarSessao(sessao)
    expect(obterSessao()).toEqual({ token: 'tok-ana', expiraEm: sessao.expiraEm, usuarioId: 'usr-ana' })
    expect(ouvinte).toHaveBeenCalledWith(obterSessao())
    cancelar()
  })

  it('ignora sessão expirada ou corrompida', () => {
    salvarSessao({ ...sessao, expiraEm: '2020-01-01T00:00:00.000Z' })
    expect(obterSessao()).toBeNull()

    const armazenamento = criarArmazenamentoMemoria()
    armazenamento.setItem('kurio:sessao', '{quebrado')
    usarArmazenamentoSessao(armazenamento)
    expect(obterSessao()).toBeNull()
  })
})

describe('cliente HTTP', () => {
  it('envia o token Bearer só quando há sessão', async () => {
    const cabecalhos: (string | null)[] = []
    servidor.use(mock.get(`${BASE}/perfil`, ({ request }) => (cabecalhos.push(request.headers.get('Authorization')), HttpResponse.json({}))))
    await cliente.get('/perfil')
    salvarSessao(sessao)
    await cliente.get('/perfil')
    expect(cabecalhos).toEqual([null, 'Bearer tok-ana'])
  })

  it('envia listas repetindo a chave, sem colchetes (igual à URL do catálogo)', async () => {
    let consulta = ''
    servidor.use(mock.get(`${BASE}/nfts`, ({ request }) => ((consulta = new URL(request.url).search), HttpResponse.json({}))))
    await cliente.get('/nfts', { params: { categorias: ['musica', 'jogos'], pagina: 2 } })
    expect(consulta).toBe('?categorias=musica&categorias=jogos&pagina=2')
  })

  it('converte erro da API em ErroHttp com código, status e erros por campo', async () => {
    servidor.use(
      mock.post(`${BASE}/auth/cadastro`, () =>
        erroApi({ codigo: 'CONFLITO', mensagem: 'E-mail já cadastrado', campos: { email: 'E-mail já cadastrado' } }, 409),
      ),
    )
    const erro = await falhaDe(cliente.post('/auth/cadastro', {}))
    expect(erro).toMatchObject({ codigo: 'CONFLITO', status: 409, campos: { email: 'E-mail já cadastrado' } })
    expect(mensagemAmigavel(erro)).toBe('E-mail já cadastrado')
  })

  it('erro 5xx sem corpo no contrato vira FALHA_TRANSITORIA', async () => {
    servidor.use(mock.get(`${BASE}/nfts`, () => new HttpResponse('Bad Gateway', { status: 502 })))
    expect((await falhaDe(cliente.get('/nfts'))).codigo).toBe('FALHA_TRANSITORIA')
  })

  it('rede caída vira SEM_CONEXAO', async () => {
    servidor.use(mock.get(`${BASE}/nfts`, () => HttpResponse.error()))
    const erro = await falhaDe(cliente.get('/nfts'))
    expect(erro).toMatchObject({ codigo: 'SEM_CONEXAO', status: null })
    expect(mensagemAmigavel(erro)).toMatch(/Sem conexão/)
  })

  it('resposta que passa do timeout vira TIMEOUT', async () => {
    servidor.use(mock.get(`${BASE}/nfts`, async () => (await delay(300), HttpResponse.json({}))))
    expect((await falhaDe(criarHttp({ baseURL: BASE, timeout: 50 }).get('/nfts'))).codigo).toBe('TIMEOUT')
  })

  it('requisição cancelada vira CANCELADO', async () => {
    servidor.use(mock.get(`${BASE}/nfts`, async () => (await delay(300), HttpResponse.json({}))))
    const controle = new AbortController()
    const chamada = cliente.get('/nfts', { signal: controle.signal })
    controle.abort()
    expect((await falhaDe(chamada)).codigo).toBe('CANCELADO')
  })

  it('401 de sessão em requisição autenticada limpa o token e avisa', async () => {
    servidor.use(mock.get(`${BASE}/carrinho`, () => erroApi({ codigo: 'SESSAO_INVALIDA', mensagem: 'Sessão expirada' }, 401)))
    const ouvinte = vi.fn()
    const cancelar = aoSessaoInvalida(ouvinte)
    salvarSessao(sessao)
    await falhaDe(cliente.get('/carrinho'))
    expect(obterSessao()).toBeNull()
    expect(ouvinte).toHaveBeenCalledOnce()
    cancelar()
  })

  it('401 sem token (ex.: senha errada no login) não dispara expiração', async () => {
    servidor.use(mock.post(`${BASE}/auth/login`, () => erroApi({ codigo: 'SESSAO_INVALIDA', mensagem: 'Credenciais inválidas' }, 401)))
    const ouvinte = vi.fn()
    const cancelar = aoSessaoInvalida(ouvinte)
    await falhaDe(cliente.post('/auth/login', {}))
    expect(ouvinte).not.toHaveBeenCalled()
    cancelar()
  })

  it('lerDados valida a resposta contra o contrato', async () => {
    const Schema = z.object({ nftIds: z.array(z.string()) })
    servidor.use(mock.get(`${BASE}/favoritos`, () => HttpResponse.json({ nftIds: ['nft-001'] })))
    expect(await lerDados(Schema, cliente.get('/favoritos'))).toEqual({ nftIds: ['nft-001'] })

    servidor.use(mock.get(`${BASE}/favoritos`, () => HttpResponse.json({ nftIds: [1] })))
    const erro = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect((await falhaDe(lerDados(Schema, cliente.get('/favoritos')))).codigo).toBe('RESPOSTA_INVALIDA')
    erro.mockRestore()
  })
})

describe('política de nova tentativa', () => {
  it('repete só falhas transitórias, no máximo 2 vezes', () => {
    for (const codigo of ['FALHA_TRANSITORIA', 'SEM_CONEXAO', 'TIMEOUT'] as const) {
      expect(deveRepetirConsulta(0, new ErroHttp(codigo, ''))).toBe(true)
      expect(deveRepetirConsulta(2, new ErroHttp(codigo, ''))).toBe(false)
    }
    for (const codigo of ['VALIDACAO', 'SESSAO_INVALIDA', 'NAO_ENCONTRADO', 'CONFLITO', 'CANCELADO'] as const) {
      expect(deveRepetirConsulta(0, new ErroHttp(codigo, ''))).toBe(false)
    }
    expect(deveRepetirConsulta(0, new Error('qualquer'))).toBe(false)
  })

  it('espera 0,5 s e depois 1 s', () => {
    expect([0, 1].map(atrasoNovaTentativa)).toEqual([500, 1000])
  })
})
