import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ErroApiSchema, SessaoSchema, type Sessao } from '@/types'
import { estadoCenario } from '../cenarios'
import { banco } from '../db'
import { SENHA_DEMO } from '../fixtures'
import { servidor } from '../node'

const BASE = 'http://kurio.test/api'

/** Chama a API simulada avançando os timers da latência do cenário. */
async function chamar(caminho: string, opcoes: { metodo?: string; corpo?: unknown; token?: string } = {}) {
  const resposta = fetch(`${BASE}${caminho}`, {
    method: opcoes.metodo ?? (opcoes.corpo ? 'POST' : 'GET'),
    headers: { 'Content-Type': 'application/json', ...(opcoes.token && { Authorization: `Bearer ${opcoes.token}` }) },
    body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined,
  })
  await vi.runAllTimersAsync()
  return resposta
}

async function entrar(email: string, senha = SENHA_DEMO): Promise<Sessao> {
  const resposta = await chamar('/auth/login', { corpo: { email, senha } })
  expect(resposta.status).toBe(200)
  return SessaoSchema.parse(await resposta.json())
}

const cadastro = { nomeUsuario: 'carla.dias', email: 'carla@kurio.dev', senha: 'senha-forte', confirmarSenha: 'senha-forte' }

beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout'] })
  banco.resetar()
  estadoCenario.definirCenario('padrao')
})
afterEach(() => vi.useRealTimers())
afterAll(() => servidor.close())

describe('cadastro', () => {
  it('cria a conta, devolve 201 com sessão e nunca guarda a senha em claro', async () => {
    const resposta = await chamar('/auth/cadastro', { corpo: cadastro })
    expect(resposta.status).toBe(201)
    const sessao = SessaoSchema.parse(await resposta.json())
    expect(sessao.usuario).toMatchObject({ nomeUsuario: 'carla.dias', email: 'carla@kurio.dev' })
    expect(JSON.stringify(banco.ler())).not.toContain('senha-forte')
    expect(banco.ler().usuarios.find((u) => u.usuario.id === sessao.usuario.id)?.perfil.nomeEns.nome).toBe('carla-dias')
  })

  it('e-mail já usado (sem diferenciar maiúsculas) responde 409 com o campo', async () => {
    const resposta = await chamar('/auth/cadastro', { corpo: { ...cadastro, email: 'ANA@kurio.dev' } })
    expect(resposta.status).toBe(409)
    const { erro } = ErroApiSchema.parse(await resposta.json())
    expect(erro).toMatchObject({ codigo: 'CONFLITO', campos: { email: 'Este e-mail já está cadastrado' } })
  })

  it('nome de usuário já usado responde 409, e os dois conflitos vêm juntos', async () => {
    const resposta = await chamar('/auth/cadastro', { corpo: { ...cadastro, nomeUsuario: 'Ana.Souza', email: 'ana@kurio.dev' } })
    const { erro } = ErroApiSchema.parse(await resposta.json())
    expect(Object.keys(erro.campos ?? {})).toEqual(['email', 'nomeUsuario'])
  })

  it('dados inválidos respondem 400 com os erros por campo', async () => {
    const resposta = await chamar('/auth/cadastro', { corpo: { ...cadastro, email: 'carla', confirmarSenha: 'outra' } })
    expect(resposta.status).toBe(400)
    const { erro } = ErroApiSchema.parse(await resposta.json())
    expect(erro.codigo).toBe('VALIDACAO')
    expect(erro.campos).toMatchObject({ email: 'Informe um e-mail válido', confirmarSenha: 'As senhas não conferem' })
  })
})

describe('login', () => {
  it('os dois usuários das fixtures entram com a senha documentada', async () => {
    expect((await entrar('ana@kurio.dev')).usuario.id).toBe('usr-ana')
    expect((await entrar('BRUNO@kurio.dev')).usuario.id).toBe('usr-bruno')
  })

  it('senha errada e e-mail inexistente dão a mesma resposta, sem revelar qual errou', async () => {
    const senhaErrada = await chamar('/auth/login', { corpo: { email: 'ana@kurio.dev', senha: 'errada-123' } })
    const semConta = await chamar('/auth/login', { corpo: { email: 'ninguem@kurio.dev', senha: 'errada-123' } })
    expect(senhaErrada.status).toBe(401)
    expect(await senhaErrada.json()).toEqual(await semConta.json())
    expect(ErroApiSchema.parse(await (await chamar('/auth/login', { corpo: { email: 'x@kurio.dev', senha: 'y' } })).json()).erro.codigo).toBe('VALIDACAO')
  })
})

describe('sessão e logout', () => {
  it('GET /sessao devolve o dono do token, e cada token só enxerga o próprio usuário', async () => {
    const ana = await entrar('ana@kurio.dev')
    const bruno = await entrar('bruno@kurio.dev')
    expect(SessaoSchema.parse(await (await chamar('/auth/sessao', { token: ana.token })).json()).usuario.id).toBe('usr-ana')
    expect(SessaoSchema.parse(await (await chamar('/auth/sessao', { token: bruno.token })).json()).usuario.id).toBe('usr-bruno')
  })

  it('sem token, token desconhecido ou vencido respondem 401 SESSAO_INVALIDA', async () => {
    const ana = await entrar('ana@kurio.dev')
    banco.alterar((db) => {
      db.sessoes[ana.token]!.expiraEm = '2020-01-01T00:00:00.000Z'
    })
    for (const token of [undefined, 'tok_inventado', ana.token]) {
      const resposta = await chamar('/auth/sessao', { token })
      expect(resposta.status).toBe(401)
      expect(ErroApiSchema.parse(await resposta.json()).erro.codigo).toBe('SESSAO_INVALIDA')
    }
    expect(banco.ler().sessoes[ana.token]).toBeUndefined()
  })

  it('logout invalida o token no servidor', async () => {
    const ana = await entrar('ana@kurio.dev')
    expect((await chamar('/auth/logout', { metodo: 'POST', token: ana.token })).status).toBe(204)
    expect((await chamar('/auth/sessao', { token: ana.token })).status).toBe(401)
  })

  it('cenário sessao-expirada derruba só a primeira chamada autenticada', async () => {
    const ana = await entrar('ana@kurio.dev')
    estadoCenario.definirCenario('sessao-expirada')
    expect((await chamar('/auth/sessao', { token: ana.token })).status).toBe(401)

    const novaSessao = await entrar('ana@kurio.dev')
    expect((await chamar('/auth/sessao', { token: novaSessao.token })).status).toBe(200)
  })
})
